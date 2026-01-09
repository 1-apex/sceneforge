/**
 * CameraControls Component
 * 
 * Provides two camera modes:
 * 
 * 1. Orbit Mode (default):
 *    - Rotates around center point (0,0,0)
 *    - Left-click drag to rotate
 *    - Right-click drag to pan
 *    - Scroll to zoom
 * 
 * 2. Free Mode:
 *    - WASD for horizontal movement
 *    - Q/Z for up/down
 *    - Mouse to look around
 *    - Unrestricted navigation
 * 
 * Press F to toggle between modes.
 */

'use client'

import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

type CameraMode = 'orbit' | 'free'

interface CameraControlsProps {
  mode: CameraMode
}

// Track which keys are currently pressed
const keys: Record<string, boolean> = {}

export function CameraControls({ mode }: CameraControlsProps) {
  const { camera, gl } = useThree()
  
  // Movement speed for free camera
  const moveSpeed = 0.1
  const lookSpeed = 0.002

  // Mouse state for free camera look
  const mouseState = useRef({ 
    isLooking: false,
    euler: new THREE.Euler(0, 0, 0, 'YXZ')
  })

  // Setup keyboard listeners for free camera
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      keys[e.key.toLowerCase()] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Setup mouse look for free camera (left-click drag to look around)
  useEffect(() => {
    if (mode !== 'free') return

    const canvas = gl.domElement

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left click for look
        mouseState.current.isLooking = true
        mouseState.current.euler.setFromQuaternion(camera.quaternion)
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        mouseState.current.isLooking = false
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseState.current.isLooking) return

      const euler = mouseState.current.euler
      euler.y -= e.movementX * lookSpeed
      euler.x -= e.movementY * lookSpeed
      euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x))

      camera.quaternion.setFromEuler(euler)
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mousemove', handleMouseMove)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mode, camera, gl, lookSpeed])

  // Free camera movement each frame
  useFrame(() => {
    if (mode !== 'free') return

    const direction = new THREE.Vector3()
    const right = new THREE.Vector3()
    
    camera.getWorldDirection(direction)
    right.crossVectors(direction, camera.up).normalize()

    // WASD movement
    if (keys['w']) camera.position.addScaledVector(direction, moveSpeed)
    if (keys['s']) camera.position.addScaledVector(direction, -moveSpeed)
    if (keys['a']) camera.position.addScaledVector(right, -moveSpeed)
    if (keys['d']) camera.position.addScaledVector(right, moveSpeed)
    
    // Q/Z for up/down
    if (keys['q']) camera.position.y += moveSpeed
    if (keys['z']) camera.position.y -= moveSpeed
  })

  // Render OrbitControls only in orbit mode
  if (mode === 'orbit') {
    return (
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
      />
    )
  }

  // Free mode has no visible controls component
  return null
}

