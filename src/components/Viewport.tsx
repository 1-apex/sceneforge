/**
 * Viewport Component
 * 
 * The main 3D rendering area using React Three Fiber.
 * Renders scene objects from Zustand state.
 * Provides OrbitControls, grid, axis helpers, and lighting.
 * 
 * Architecture:
 * - Canvas is the R3F container
 * - Scene renders all objects declaratively from state
 * - TransformControls handles gizmos for selected object
 * - Raycasting for object selection
 */

'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { Scene } from './Scene'
import { TransformGizmo } from './TransformGizmo'

export function Viewport() {
  return (
    <div className="flex-1 bg-[#1a1a1a] relative">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        gl={{ antialias: true }}
        onPointerMissed={() => {
          // Clicking on empty space could deselect - handled in Scene
        }}
      >
        {/* Lighting Setup - Fixed as per requirements */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />

        {/* Helpers */}
        <Grid
          infiniteGrid
          fadeDistance={50}
          fadeStrength={5}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#3d3d3d"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#525252"
        />
        <axesHelper args={[5]} />

        {/* Scene Objects - Renders from Zustand state */}
        <Scene />

        {/* Transform Gizmos - Attaches to selected object */}
        <TransformGizmo />

        {/* Camera Controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Transform Mode Indicator */}
      <TransformModeIndicator />
    </div>
  )
}

/**
 * Transform Mode UI Overlay
 * Shows current transform mode (translate/rotate/scale)
 */
function TransformModeIndicator() {
  return (
    <div className="absolute bottom-3 left-3 bg-[#242424]/90 backdrop-blur-sm rounded px-2 py-1.5 text-xs text-[#a3a3a3]">
      <div className="flex items-center gap-2">
        <span className="text-[#737373]">Transform:</span>
        <span className="text-green-400">W</span>
        <span className="text-[#525252]">Move</span>
        <span className="text-[#525252]">|</span>
        <span className="text-blue-400">E</span>
        <span className="text-[#525252]">Rotate</span>
        <span className="text-[#525252]">|</span>
        <span className="text-yellow-400">R</span>
        <span className="text-[#525252]">Scale</span>
      </div>
    </div>
  )
}

