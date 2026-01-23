/**
 * JSX Export System
 *
 * Centralized export logic for SceneForge.
 * Generates deterministic, human-readable React Three Fiber JSX.
 *
 * Export Modes:
 * - sceneOnly: Just the meshes, no lights or canvas
 * - withLights: Meshes + ambient/directional lights
 * - withCanvas: Full canvas wrapper with controls
 *
 * Design Principles:
 * - Deterministic output (same input → same output)
 * - Human-readable code
 * - No runtime dependencies in scene-only export
 * - Stable property ordering
 */

import type { SceneObject, MeshObject } from '@/store/scene-store'

// ============================================================================
// EXPORT OPTIONS
// ============================================================================

export type ExportMode = 'sceneOnly' | 'withLights' | 'withCanvas'

export interface ExportOptions {
  mode: ExportMode
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/** Format number for clean output (remove unnecessary decimals) */
function formatNum(n: number): string {
  const rounded = Math.round(n * 1000) / 1000
  return rounded === Math.floor(rounded)
    ? rounded.toString()
    : rounded.toFixed(3).replace(/\.?0+$/, '')
}

/** Format Vector3 tuple as JSX array */
function formatVector(v: [number, number, number]): string {
  return `[${v.map(formatNum).join(', ')}]`
}

// ============================================================================
// GEOMETRY GENERATION
// ============================================================================

/** Get geometry JSX for mesh type */
function getGeometry(type: string): string {
  switch (type) {
    case 'box': return '<boxGeometry args={[1, 1, 1]} />'
    case 'sphere': return '<sphereGeometry args={[0.5, 32, 32]} />'
    case 'cylinder': return '<cylinderGeometry args={[0.5, 0.5, 1, 32]} />'
    // rounded-box is handled via component, not geometry here
    default: return '<boxGeometry args={[1, 1, 1]} />'
  }
}

// ============================================================================
// TEXT CONFIG GENERATION
// ============================================================================

function generateText(obj: MeshObject, indent: string): string {
  if (!obj.textConfig) return ''

  const config = obj.textConfig
  const zPos = (obj.scale[2] / 2) + 0.01 // Match Scene.tsx logic EXACTLY
  const curveProp = (obj.type === 'cylinder' || obj.type === 'sphere')
    ? `\n${indent}    curveRadius={${formatNum(-obj.scale[0] / 2)}}`
    : ''

  return `
${indent}  <group position={[0, 0, ${formatNum(zPos)}]}>
${indent}    <Text
${indent}      fontSize={${formatNum(config.fontSize)}}
${indent}      color="${config.color}"
${indent}      anchorX="${config.alignment}"
${indent}      anchorY="middle"
${indent}      textAlign="${config.alignment}"
${indent}      maxWidth={${formatNum(obj.scale[0] * 0.9)}}${curveProp}
${indent}    >
${indent}      ${config.content}
${indent}    </Text>
${indent}  </group>`
}

// ============================================================================
// OBJECT GENERATION
// ============================================================================

/** Generate JSX for a single mesh object */
function generateMesh(obj: MeshObject, indent: string): string {
  const textJSX = generateText(obj, indent)

  if (obj.type === 'rounded-box') {
    return [
      `${indent}<RoundedBox`,
      `${indent}  args={[1, 1, 1]}`,
      `${indent}  radius={0.15}`,
      `${indent}  smoothness={4}`,
      `${indent}  position={${formatVector(obj.position)}}`,
      `${indent}  rotation={${formatVector(obj.rotation)}}`,
      `${indent}  scale={${formatVector(obj.scale)}}`,
      `${indent}>`,
      `${indent}  <meshStandardMaterial color="${obj.material.color}" />${textJSX}`,
      `${indent}</RoundedBox>`,
    ].join('\n')
  }

  // Standard Mesh
  return [
    `${indent}<group`,
    `${indent}  position={${formatVector(obj.position)}}`,
    `${indent}  rotation={${formatVector(obj.rotation)}}`,
    `${indent}>`,
    `${indent}  <mesh scale={${formatVector(obj.scale)}}>`,
    `${indent}    ${getGeometry(obj.type)}`,
    `${indent}    <meshStandardMaterial color="${obj.material.color}" />`,
    `${indent}  </mesh>${textJSX}`,
    `${indent}</group>`,
  ].join('\n')
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/** Generate complete JSX code from scene objects */
export function generateJSX(
  objects: SceneObject[],
  options: ExportOptions = { mode: 'sceneOnly' }
): string {
  const { mode } = options
  const objectIndent = mode === 'withCanvas' ? '        ' : '      '

  // Analyze used features for imports
  const hasText = objects.some(o => !!o.textConfig)
  const hasRoundedBox = objects.some(o => o.type === 'rounded-box')

  const dreiImports: string[] = []
  if (hasText) dreiImports.push('Text')
  if (hasRoundedBox) dreiImports.push('RoundedBox')
  if (mode === 'withCanvas') dreiImports.push('OrbitControls')

  // Generate object JSX
  const objectsJSX = objects.length > 0
    ? objects.map(obj => generateMesh(obj, objectIndent)).join('\n')
    : `${objectIndent}{/* No objects in scene */}`

  // Build output based on mode
  switch (mode) {
    case 'sceneOnly':
      return generateSceneOnly(objectsJSX, dreiImports)
    case 'withLights':
      return generateWithLights(objectsJSX, dreiImports)
    case 'withCanvas':
      return generateWithCanvas(objectsJSX, dreiImports)
    default:
      return generateSceneOnly(objectsJSX, dreiImports)
  }
}

// ============================================================================
// MODE-SPECIFIC GENERATORS
// ============================================================================

function getImports(dreiImports: string[]): string {
  if (dreiImports.length === 0) return ''
  return `import { ${dreiImports.join(', ')} } from '@react-three/drei'`
}

function generateSceneOnly(objects: string, dreiImports: string[]): string {
  const imports = getImports(dreiImports)
  return `/**
 * Scene Component
 * Generated by SceneForge
 */

${imports}

export function Scene() {
  return (
    <>
${objects}
    </>
  )
}
`
}

function generateWithLights(objects: string, dreiImports: string[]): string {
  const imports = getImports(dreiImports)
  return `/**
 * Scene Component
 * Generated by SceneForge
 * Includes standard lighting setup.
 */

${imports}

export function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />

${objects}
    </>
  )
}
`
}

function generateWithCanvas(objects: string, dreiImports: string[]): string {
  const imports = getImports(dreiImports)
  return `/**
 * SceneCanvas Component
 * Generated by SceneForge
 */

import { Canvas } from '@react-three/fiber'
${imports}

export function SceneCanvas() {
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <OrbitControls />

${objects}
    </Canvas>
  )
}
`
}
