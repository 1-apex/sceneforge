/**
 * TransformGizmo Component
 *
 * Provides transform controls (translate, rotate, scale) for selected objects.
 * Uses @react-three/drei's TransformControls.
 *
 * CRITICAL: All transform changes MUST write back to Zustand state.
 * The gizmo reads initial position from state and writes changes back.
 * No local transform state is maintained.
 *
 * Undo/Redo integration:
 * - pushHistory() is called on mouseDown (drag start) so the entire drag
 *   is a single undoable action.
 *
 * Keyboard shortcuts:
 * - W: Translate mode
 * - E: Rotate mode
 * - R: Scale mode
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { TransformControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useSceneStore, selectSelectedObject } from '@/store/scene-store'
import type { Object3D } from 'three'

type TransformMode = 'translate' | 'rotate' | 'scale'

export function TransformGizmo() {
  const { scene } = useThree()
  const selectedObject = useSceneStore(selectSelectedObject)
  const updatePosition = useSceneStore((state) => state.updatePosition)
  const updateRotation = useSceneStore((state) => state.updateRotation)
  const updateScale = useSceneStore((state) => state.updateScale)
  const pushHistory = useSceneStore((state) => state.pushHistory)

  const [mode, setMode] = useState<TransformMode>('translate')

  // Find the mesh in the scene by name (object.id)
  const targetMesh = selectedObject
    ? scene.getObjectByName(selectedObject.id)
    : null

  // Handle transform changes - write back to Zustand
  const handleChange = useCallback(() => {
    if (!targetMesh || !selectedObject) return

    const mesh = targetMesh as Object3D

    updatePosition(selectedObject.id, [
      mesh.position.x,
      mesh.position.y,
      mesh.position.z,
    ])
    updateRotation(selectedObject.id, [
      mesh.rotation.x,
      mesh.rotation.y,
      mesh.rotation.z,
    ])
    updateScale(selectedObject.id, [
      mesh.scale.x,
      mesh.scale.y,
      mesh.scale.z,
    ])
  }, [targetMesh, selectedObject, updatePosition, updateRotation, updateScale])

  // Snapshot history at the start of each drag so the whole drag is one undo step
  const handleMouseDown = useCallback(() => {
    pushHistory()
  }, [pushHistory])

  // Keyboard shortcuts for transform modes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      switch (e.key.toLowerCase()) {
        case 'w': setMode('translate'); break
        case 'e': setMode('rotate'); break
        case 'r': setMode('scale'); break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!selectedObject || !targetMesh) {
    return null
  }

  return (
    <TransformControls
      object={targetMesh}
      mode={mode}
      onObjectChange={handleChange}
      onMouseDown={handleMouseDown}
      size={0.7}
    />
  )
}
