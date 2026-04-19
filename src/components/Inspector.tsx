/**
 * Inspector Component — Premium redesign
 *
 * Collapsible sections, Blender-style scrub-drag on axis labels,
 * accent-ring focus states, and a polished color row.
 *
 * Undo integration:
 *  - pushHistory() fires once per edit session (first focus / drag-start).
 */

'use client'

import { useState, useRef, useCallback } from 'react'
import { useSceneStore, selectSelectedObject } from '@/store/scene-store'

const AXIS_COLORS = {
  X: '#f05672',
  Y: '#3dd672',
  Z: '#617bff',
} as const

/* ── Main Component ───────────────────────────────────────────────────── */

export function Inspector() {
  const selectedObject = useSceneStore(selectSelectedObject)
  const updatePosition = useSceneStore((state) => state.updatePosition)
  const updateRotation = useSceneStore((state) => state.updateRotation)
  const updateScale    = useSceneStore((state) => state.updateScale)
  const updateColor    = useSceneStore((state) => state.updateColor)
  const pushHistory    = useSceneStore((state) => state.pushHistory)

  // Per-session history guard (reset on blur)
  const historyPushed = useRef(false)
  const onFieldFocus  = useCallback(() => {
    if (!historyPushed.current) { pushHistory(); historyPushed.current = true }
  }, [pushHistory])
  const onFieldBlur   = useCallback(() => { historyPushed.current = false }, [])

  // Collapsible section state
  const [open, setOpen] = useState({ transform: true, material: true, text: true })
  const toggle = (k: keyof typeof open) => setOpen((p) => ({ ...p, [k]: !p[k] }))

  if (!selectedObject) {
    return (
      <aside className="w-64 flex flex-col shrink-0" style={{ background: '#1b1b1f', borderLeft: '1px solid #232328' }}>
        <SidebarHeader>Inspector</SidebarHeader>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#212128', border: '1px solid #2d2d35' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4e4c58" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <p className="text-xs text-center" style={{ color: '#4e4c58' }}>Select an object to<br/>inspect its properties</p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-64 flex flex-col shrink-0" style={{ background: '#1b1b1f', borderLeft: '1px solid #232328' }}>
      <SidebarHeader>Inspector</SidebarHeader>

      <div className="flex-1 overflow-y-auto">

        {/* Object badge */}
        <div className="px-3 pt-3 pb-2">
          <div
            className="rounded-md px-3 py-2 flex items-center gap-2"
            style={{ background: '#212128', border: '1px solid #29292f' }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#4e4c58' }}>ID</span>
            <span className="text-xs font-mono truncate" style={{ color: '#8f8d98' }}>{selectedObject.id}</span>
          </div>
        </div>

        {/* ── Transform Section ── */}
        <Section
          label="Transform"
          isOpen={open.transform}
          onToggle={() => toggle('transform')}
        >
          <div className="flex flex-col gap-3">
            <div>
              <FieldLabel>Position</FieldLabel>
              <ScrubVector3
                value={selectedObject.position}
                onChange={(v) => updatePosition(selectedObject.id, v)}
                onFocus={onFieldFocus}
                onBlur={onFieldBlur}
                step={0.1}
              />
            </div>
            <div>
              <FieldLabel>Rotation °</FieldLabel>
              <ScrubVector3
                value={selectedObject.rotation.map((r) => r * (180 / Math.PI)) as [number, number, number]}
                onChange={(v) => updateRotation(selectedObject.id, v.map((r) => r * (Math.PI / 180)) as [number, number, number])}
                onFocus={onFieldFocus}
                onBlur={onFieldBlur}
                step={1}
              />
            </div>
            <div>
              <FieldLabel>Scale</FieldLabel>
              <ScrubVector3
                value={selectedObject.scale}
                onChange={(v) => updateScale(selectedObject.id, v)}
                onFocus={onFieldFocus}
                onBlur={onFieldBlur}
                step={0.1}
              />
            </div>
          </div>
        </Section>

        {/* ── Material Section ── */}
        <Section
          label="Material"
          isOpen={open.material}
          onToggle={() => toggle('material')}
        >
          <ColorRow
            color={selectedObject.material.color}
            onChange={(c) => updateColor(selectedObject.id, c)}
            onFocus={onFieldFocus}
            onBlur={onFieldBlur}
          />
        </Section>

        {/* ── Text Overlay Section ── */}
        <Section
          label="Text Overlay"
          isOpen={open.text}
          onToggle={() => toggle('text')}
        >
          <button
            onClick={() => useSceneStore.getState().setEditingTextObjectId(selectedObject.id)}
            className="w-full text-xs font-medium rounded-md py-2 transition-all flex items-center justify-center gap-2"
            style={{
              background: selectedObject.textConfig ? 'rgba(97,123,255,0.12)' : '#212128',
              color:      selectedObject.textConfig ? '#617bff' : '#8f8d98',
              border:     selectedObject.textConfig ? '1px solid rgba(97,123,255,0.3)' : '1px solid #2d2d35',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
            {selectedObject.textConfig ? 'Edit Text Overlay' : 'Add Text Overlay'}
          </button>

          {selectedObject.textConfig && (
            <div
              className="mt-2 rounded-md px-2.5 py-2 text-xs"
              style={{ background: '#121215', border: '1px solid #222228' }}
            >
              <p className="truncate font-mono" style={{ color: '#617bff' }}>
                &ldquo;{selectedObject.textConfig.content}&rdquo;
              </p>
              <p className="mt-0.5" style={{ color: '#4e4c58' }}>
                size {selectedObject.textConfig.fontSize.toFixed(1)} · {selectedObject.textConfig.alignment}
              </p>
            </div>
          )}
        </Section>

        <div className="h-3" />
      </div>
    </aside>
  )
}

/* ── Section wrapper ──────────────────────────────────────────────────── */

function Section({
  label,
  isOpen,
  onToggle,
  children,
}: {
  label: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div style={{ borderTop: '1px solid #1e1e22' }}>
      <button
        onClick={onToggle}
        className="w-full px-3 py-2.5 flex items-center justify-between group transition-colors"
        style={{ background: 'transparent' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#1f1f24' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <span className="text-[10.5px] font-semibold uppercase tracking-widest" style={{ color: '#4e4c58' }}>
          {label}
        </span>
        <ChevronIcon isOpen={isOpen} />
      </button>

      {isOpen && (
        <div className="px-3 pb-3">
          {children}
        </div>
      )}
    </div>
  )
}

function SidebarHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="h-9 px-3 flex items-center shrink-0"
      style={{ borderBottom: '1px solid #232328' }}
    >
      <span className="text-[10.5px] font-semibold uppercase tracking-widest" style={{ color: '#4e4c58' }}>
        {children}
      </span>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-medium mb-1.5" style={{ color: '#4e4c58' }}>
      {children}
    </p>
  )
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      style={{
        color: '#4e4c58',
        transition: 'transform 0.18s ease',
        transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
      }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

/* ── Color row ────────────────────────────────────────────────────────── */

function ColorRow({
  color,
  onChange,
  onFocus,
  onBlur,
}: {
  color: string
  onChange: (c: string) => void
  onFocus?: () => void
  onBlur?: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Color swatch / picker trigger */}
      <div
        className="relative w-9 h-8 rounded-md overflow-hidden shrink-0"
        style={{ border: '1.5px solid rgba(255,255,255,0.1)', boxSizing: 'border-box' }}
      >
        <input
          type="color"
          value={color}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
          style={{ margin: '-4px' }}
        />
        <div className="absolute inset-0 rounded-[4px]" style={{ background: color }} />
      </div>

      {/* Hex text input */}
      <input
        type="text"
        value={color}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 uppercase font-mono"
        placeholder="#ffffff"
        maxLength={7}
      />
    </div>
  )
}

/* ── Scrub Vector3 ────────────────────────────────────────────────────── */

function ScrubVector3({
  value,
  onChange,
  onFocus,
  onBlur,
  step,
}: {
  value: [number, number, number]
  onChange: (v: [number, number, number]) => void
  onFocus?: () => void
  onBlur?: () => void
  step: number
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {(['X', 'Y', 'Z'] as const).map((axis, i) => (
        <ScrubField
          key={axis}
          axis={axis}
          value={value[i]}
          color={AXIS_COLORS[axis]}
          step={step}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(v) => {
            const next = [...value] as [number, number, number]
            next[i] = v
            onChange(next)
          }}
        />
      ))}
    </div>
  )
}

/* ── Scrub Field (Blender-style label drag) ───────────────────────────── */

function ScrubField({
  axis,
  value,
  color,
  step,
  onChange,
  onFocus,
  onBlur,
}: {
  axis: string
  value: number
  color: string
  step: number
  onChange: (v: number) => void
  onFocus?: () => void
  onBlur?: () => void
}) {
  const inputRef   = useRef<HTMLInputElement>(null)
  const hasMoved   = useRef(false)
  const startX     = useRef(0)
  const startVal   = useRef(0)

  const handleLabelMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    hasMoved.current  = false
    startX.current    = e.clientX
    startVal.current  = value
    onFocus?.()

    const move = (ev: MouseEvent) => {
      const delta = ev.clientX - startX.current
      if (Math.abs(delta) > 2) {
        hasMoved.current = true
        const sensitivity = ev.shiftKey ? step * 0.1 : step
        onChange(Math.round((startVal.current + delta * sensitivity) * 1000) / 1000)
      }
    }
    const up = () => {
      if (!hasMoved.current) {
        inputRef.current?.focus()
        inputRef.current?.select()
      }
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
    }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Draggable axis label */}
      <div
        className="flex items-center gap-1 select-none"
        style={{ cursor: 'ew-resize' }}
        onMouseDown={handleLabelMouseDown}
        title={`Drag to adjust ${axis} · Hold Shift for fine control`}
      >
        <span className="text-[10px] font-bold" style={{ color }}>{axis}</span>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="number"
        value={Number(value.toFixed(3))}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={step}
        className="w-full text-center"
      />
    </div>
  )
}
