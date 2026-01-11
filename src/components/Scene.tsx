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
    <mesh
      name={object.id}
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      onClick={handleClick}
    >
      <MeshGeometry type={object.type} />
      <meshStandardMaterial
        color={object.material.color}
        emissive={isSelected ? '#404040' : '#000000'}
      />
    </mesh>
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
      return <sphereGeometry args={[1, 32, 32]} />
    case 'cylinder':
      return <cylinderGeometry args={[1, 1, 2, 32]} />
    default:
      return <boxGeometry args={[1, 1, 1]} />
  }
}
