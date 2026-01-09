/**
 * Viewport Component
 *
 * The main 3D rendering area using React Three Fiber.
 * Renders scene objects from Zustand state.
 * Provides OrbitControls, grid, axis helpers, and lighting.
 *
 * Camera Modes:
 * - Orbit: Rotates around center point (default)
 * - Free: WASD movement + mouse look for unrestricted navigation
 *
 * Architecture:
 * - Canvas is the R3F container
 * - Scene renders all objects declaratively from state
 * - TransformControls handles gizmos for selected object
 * - Raycasting for object selection
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Grid } from '@react-three/drei'
import { Scene } from './Scene'
import { TransformGizmo } from './TransformGizmo'
import { CameraControls } from './CameraControls'

type CameraMode = 'orbit' | 'free'

export function Viewport() {
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit')

  const toggleCameraMode = useCallback(() => {
    setCameraMode((prev) => (prev === 'orbit' ? 'free' : 'orbit'))
  }, [])

  // F key to toggle camera mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key.toLowerCase() === 'f') {
        toggleCameraMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleCameraMode])

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

        {/* Camera Controls - switches between Orbit and Free mode */}
        <CameraControls mode={cameraMode} />
      </Canvas>

      {/* Camera Mode Toggle Button */}
      <CameraModeToggle mode={cameraMode} onToggle={toggleCameraMode} />

      {/* Keyboard Shortcuts Indicator */}
      <ShortcutsIndicator cameraMode={cameraMode} />
    </div>
  )
}

/**
 * Camera Mode Toggle Button
 */
function CameraModeToggle({
  mode,
  onToggle
}: {
  mode: CameraMode
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="absolute top-3 right-3 bg-[#242424]/90 backdrop-blur-sm rounded px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-[#363636] transition-colors border border-[#3d3d3d]"
      title="Toggle camera mode (F key)"
    >
      <CameraIcon />
      <span className="text-[#a3a3a3]">
        {mode === 'orbit' ? 'Orbit' : 'Free'} Camera
      </span>
      <span className="text-[#525252]">(F)</span>
    </button>
  )
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#a3a3a3]">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

/**
 * Keyboard Shortcuts UI Overlay
 * Shows transform modes, copy/paste, and camera controls
 */
function ShortcutsIndicator({ cameraMode }: { cameraMode: CameraMode }) {
  return (
    <div className="absolute bottom-3 left-3 bg-[#242424]/90 backdrop-blur-sm rounded px-2 py-1.5 text-xs text-[#a3a3a3]">
      <div className="flex items-center gap-2 mb-1">
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
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[#737373]">Edit:</span>
        <span className="text-purple-400">Ctrl+C</span>
        <span className="text-[#525252]">Copy</span>
        <span className="text-[#525252]">|</span>
        <span className="text-purple-400">Ctrl+V</span>
        <span className="text-[#525252]">Paste</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[#737373]">Camera:</span>
        <span className="text-cyan-400">F</span>
        <span className="text-[#525252]">Toggle</span>
        {cameraMode === 'free' && (
          <>
            <span className="text-[#525252]">|</span>
            <span className="text-cyan-400">WASD</span>
            <span className="text-[#525252]">Move</span>
            <span className="text-[#525252]">|</span>
            <span className="text-cyan-400">QZ</span>
            <span className="text-[#525252]">Up/Down</span>
            <span className="text-[#525252]">|</span>
            <span className="text-cyan-400">LMB Drag</span>
            <span className="text-[#525252]">Look</span>
          </>
        )}
      </div>
    </div>
  )
}

