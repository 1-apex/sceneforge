/**
 * Scene Component
 *
 * Renders all scene objects from Zustand state.
 * This is a DECLARATIVE renderer - it reads from state only.
 * No local transform state allowed.
 *
 * Architecture:
 * - Subscribes to Zustand objects array
 * - Renders each object as a mesh
 * - Handles click-to-select via raycasting
 */

'use client'

import { ThreeEvent } from '@react-three/fiber'
import { Text, RoundedBox } from '@react-three/drei'
import { useSceneStore } from '@/store/scene-store'
import type { SceneObject as SceneObjectType, MeshType } from '@/store/scene-store'

export function Scene() {
  const objects = useSceneStore((state) => state.objects)
  const selectedObjectId = useSceneStore((state) => state.selectedObjectId)
  const selectObject = useSceneStore((state) => state.selectObject)

  // Handle click on empty space to deselect
  const handlePointerMissed = () => {
    selectObject(null)
  }

  return (
    <group onPointerMissed={handlePointerMissed}>
      {objects.map((obj) => (
        <MeshSceneObject
          key={obj.id}
          object={obj}
          isSelected={obj.id === selectedObjectId}
          onSelect={() => selectObject(obj.id)}
        />
      ))}
    </group>
  )
}

/**
 * MeshSceneObject Component
 *
 * Renders a mesh object (box, sphere, cylinder).
 */
function MeshSceneObject({
  object,
  isSelected,
  onSelect,
}: {
  object: SceneObjectType
  isSelected: boolean
  onSelect: () => void
}) {
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onSelect()
  }

  return (
    <group
      name={object.id}
      position={object.position}
      rotation={object.rotation}
    >
      {object.type === 'rounded-box' ? (
        <RoundedBox
          args={[1, 1, 1]} // Unit size
          radius={0.15}
          smoothness={4}
          scale={object.scale}
          onClick={handleClick}
        >
          <meshStandardMaterial
            color={object.material.color}
            emissive={isSelected ? '#404040' : '#000000'}
          />
        </RoundedBox>
      ) : (
        <mesh
          scale={object.scale}
          onClick={handleClick}
        >
          <MeshGeometry type={object.type} />
          <meshStandardMaterial
            color={object.material.color}
            emissive={isSelected ? '#404040' : '#000000'}
          />
        </mesh>
      )}


      {object.textConfig && (
        <group
          position={[0, 0, (object.scale[2] / 2) + 0.01]}
        >
          <Text
            fontSize={object.textConfig.fontSize}
            color={object.textConfig.color}
            anchorX={object.textConfig.alignment}
            anchorY="middle"
            textAlign={object.textConfig.alignment}
            maxWidth={object.scale[0] * 0.9} // Constrain to object width
            // @ts-ignore
            curveRadius={
              (object.type === 'cylinder' || object.type === 'sphere')
                ? -object.scale[0] / 2
                : undefined
            }
          >
            {object.textConfig.content}
          </Text>
        </group>
      )}
    </group>
  )
}

/**
 * MeshGeometry Component
 *
 * Returns the appropriate geometry based on mesh type.
 */
function MeshGeometry({ type }: { type: MeshType }) {
  switch (type) {
    case 'box':
      return <boxGeometry args={[1, 1, 1]} />
    case 'sphere':
      return <sphereGeometry args={[0.5, 32, 32]} />
    case 'cylinder':
      return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
    case 'rounded-box':
      return <boxGeometry args={[1, 1, 1]} />
    default:
      return <boxGeometry args={[1, 1, 1]} />
  }
}
