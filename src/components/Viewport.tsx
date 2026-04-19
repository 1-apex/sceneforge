/**
 * Viewport Component — Premium redesign
 *
 * Cleaner floating overlays with glassmorphism, collapsible shortcuts,
 * and a refined camera-mode pill.
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
  const [cameraMode, setCameraMode]       = useState<CameraMode>('orbit')
  const [shortcutsOpen, setShortcutsOpen] = useState(true)

  const toggleCameraMode = useCallback(() => {
    setCameraMode((p) => (p === 'orbit' ? 'free' : 'orbit'))
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key.toLowerCase() === 'f') toggleCameraMode()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleCameraMode])

  return (
    <div className="flex-1 relative" style={{ background: '#0e0e11' }}>
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        gl={{ antialias: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.35} />
        <directionalLight position={[10, 10, 5]} intensity={0.9} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.15} />

        {/* Grid */}
        <Grid
          infiniteGrid
          fadeDistance={45}
          fadeStrength={6}
          cellSize={1}
          cellThickness={0.4}
          cellColor="#1e1e28"
          sectionSize={5}
          sectionThickness={0.8}
          sectionColor="#28283a"
        />
        <axesHelper args={[3]} />

        {/* Scene */}
        <Scene />
        <TransformGizmo />
        <CameraControls mode={cameraMode} />
      </Canvas>

      {/* ── Top-right: Camera mode pill ── */}
      <CameraPill mode={cameraMode} onToggle={toggleCameraMode} />

      {/* ── Bottom-left: Shortcuts panel ── */}
      <ShortcutsPanel
        cameraMode={cameraMode}
        isOpen={shortcutsOpen}
        onToggle={() => setShortcutsOpen((p) => !p)}
      />

      {/* ── Transform mode indicator ── */}
      <TransformHint />
    </div>
  )
}

/* ── Camera Pill ─────────────────────────────────────────────────────── */

function CameraPill({ mode, onToggle }: { mode: CameraMode; onToggle: () => void }) {
  const isOrbit = mode === 'orbit'
  return (
    <button
      onClick={onToggle}
      title="Toggle camera mode (F)"
      className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
      style={{
        background: 'rgba(21,21,24,0.85)',
        border: '1px solid rgba(50,50,59,0.8)',
        backdropFilter: 'blur(12px)',
        color: isOrbit ? '#8f8d98' : '#617bff',
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(97,123,255,0.4)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(50,50,59,0.8)' }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
      <span>{isOrbit ? 'Orbit' : 'Free'} Camera</span>
      <kbd
        className="text-[9px] font-mono px-1 rounded"
        style={{ background: 'rgba(255,255,255,0.06)', color: '#4e4c58' }}
      >
        F
      </kbd>
    </button>
  )
}

/* ── Transform hint (bottom-right) ──────────────────────────────────── */

function TransformHint() {
  return (
    <div
      className="absolute bottom-3 right-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10.5px]"
      style={{
        background: 'rgba(21,21,24,0.75)',
        border: '1px solid rgba(50,50,59,0.6)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Kbd color="#617bff">W</Kbd><span style={{ color: '#4e4c58' }}>Move</span>
      <span style={{ color: '#2a2a30' }}>·</span>
      <Kbd color="#f05672">E</Kbd><span style={{ color: '#4e4c58' }}>Rotate</span>
      <span style={{ color: '#2a2a30' }}>·</span>
      <Kbd color="#3dd672">R</Kbd><span style={{ color: '#4e4c58' }}>Scale</span>
    </div>
  )
}

/* ── Shortcuts Panel (collapsible, bottom-left) ──────────────────────── */

function ShortcutsPanel({
  cameraMode,
  isOpen,
  onToggle,
}: {
  cameraMode: CameraMode
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      className="absolute bottom-3 left-3 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(21,21,24,0.82)',
        border: '1px solid rgba(50,50,59,0.7)',
        backdropFilter: 'blur(14px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
      }}
    >
      {/* Toggle header */}
      <button
        onClick={onToggle}
        className="w-full px-3 py-2 flex items-center justify-between gap-6 text-[10.5px] font-medium transition-colors"
        style={{ color: '#4e4c58', background: 'transparent' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#8f8d98' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#4e4c58' }}
      >
        <span className="uppercase tracking-widest text-[9.5px]">Shortcuts</span>
        <svg
          width="10" height="10" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'transform 0.18s', transform: isOpen ? 'rotate(0)' : 'rotate(180deg)' }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 flex flex-col gap-1.5">
          <ShortcutRow label="Edit" items={[
            { keys: 'Ctrl+Z', desc: 'Undo', color: '#f5a623' },
            { keys: 'Ctrl+Y', desc: 'Redo', color: '#f5a623' },
            { keys: 'Ctrl+C', desc: 'Copy', color: '#b46ef5' },
            { keys: 'Ctrl+V', desc: 'Paste', color: '#b46ef5' },
            { keys: 'Del', desc: 'Delete', color: '#f05672' },
          ]} />
          <ShortcutRow label="Camera" items={[
            { keys: 'F', desc: 'Toggle mode', color: '#617bff' },
            ...(cameraMode === 'free' ? [
              { keys: 'WASD', desc: 'Move', color: '#3dd672' },
              { keys: 'Q/Z', desc: 'Up/Down', color: '#3dd672' },
              { keys: 'LMB Drag', desc: 'Look', color: '#3dd672' },
            ] : []),
          ]} />
        </div>
      )}
    </div>
  )
}

function ShortcutRow({ label, items }: { label: string; items: { keys: string; desc: string; color: string }[] }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[9.5px] font-semibold uppercase tracking-wider w-12 mt-0.5 shrink-0" style={{ color: '#3a3840' }}>
        {label}
      </span>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {items.map((item) => (
          <div key={item.keys} className="flex items-center gap-1">
            <Kbd color={item.color}>{item.keys}</Kbd>
            <span className="text-[10px]" style={{ color: '#4e4c58' }}>{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Kbd({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <kbd
      className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded"
      style={{
        background: color + '18',
        color,
        border: `1px solid ${color}35`,
      }}
    >
      {children}
    </kbd>
  )
}
