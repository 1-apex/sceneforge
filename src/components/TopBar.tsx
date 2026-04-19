/**
 * TopBar Component — Premium redesign
 *
 * Left:   Logo badge + version + undo/redo controls
 * Center: Color-coded "Add shape" buttons
 * Right:  Object count summary
 */

'use client'

import { useSceneStore, selectCanUndo, selectCanRedo } from '@/store/scene-store'

const SHAPE_CONFIGS = [
  {
    type: 'box' as const,
    label: 'Box',
    color: '#617bff',
    dimColor: 'rgba(97,123,255,0.12)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
  },
  {
    type: 'sphere' as const,
    label: 'Sphere',
    color: '#f05672',
    dimColor: 'rgba(240,86,114,0.12)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" opacity="0.5" />
      </svg>
    ),
  },
  {
    type: 'cylinder' as const,
    label: 'Cylinder',
    color: '#3dd672',
    dimColor: 'rgba(61,214,114,0.12)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      </svg>
    ),
  },
  {
    type: 'rounded-box' as const,
    label: 'Rounded',
    color: '#b46ef5',
    dimColor: 'rgba(180,110,245,0.12)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="6" />
      </svg>
    ),
  },
]

export function TopBar() {
  const addObject = useSceneStore((state) => state.addObject)
  const undo      = useSceneStore((state) => state.undo)
  const redo      = useSceneStore((state) => state.redo)
  const canUndo   = useSceneStore(selectCanUndo)
  const canRedo   = useSceneStore(selectCanRedo)
  const objects   = useSceneStore((state) => state.objects)

  return (
    <header
      className="h-12 flex items-center justify-between px-4 shrink-0"
      style={{
        background: '#1b1b1f',
        borderBottom: '1px solid #232328',
      }}
    >
      {/* ── Left: Brand + Undo/Redo ── */}
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(97,123,255,0.15)', border: '1px solid rgba(97,123,255,0.3)' }}
          >
            <img src="/sceneforge_logo.png" alt="" className="w-4 h-4 object-contain" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-sm tracking-tight" style={{ color: '#eae8e5' }}>SceneForge</span>
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(97,123,255,0.15)', color: '#617bff', border: '1px solid rgba(97,123,255,0.25)' }}
            >
              v1.3
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-5" style={{ background: '#2d2d35' }} />

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <HistoryButton onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
            <UndoIcon />
          </HistoryButton>
          <HistoryButton onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
            <RedoIcon />
          </HistoryButton>
        </div>
      </div>

      {/* ── Center: Add Shapes ── */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs mr-1" style={{ color: '#4e4c58' }}>Add</span>
        {SHAPE_CONFIGS.map((cfg) => (
          <ShapeButton
            key={cfg.type}
            label={cfg.label}
            color={cfg.color}
            dimColor={cfg.dimColor}
            icon={cfg.icon}
            onClick={() => addObject(cfg.type)}
          />
        ))}
      </div>

      {/* ── Right: Stats ── */}
      <div className="flex items-center gap-2">
        {objects.length > 0 && (
          <div
            className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
            style={{ background: '#212128', color: '#8f8d98', border: '1px solid #29292f' }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#3dd672' }} />
            {objects.length} object{objects.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </header>
  )
}

/* ── Sub-components ─────────────────────────────────────────────────── */

function HistoryButton({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled: boolean
  title: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-7 h-7 rounded-md flex items-center justify-center transition-all"
      style={
        disabled
          ? { color: '#333339', background: 'transparent' }
          : { color: '#8f8d98', background: 'transparent' }
      }
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.background = '#28282f'
          ;(e.currentTarget as HTMLElement).style.color = '#eae8e5'
        }
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.background = 'transparent'
        ;(e.currentTarget as HTMLElement).style.color = disabled ? '#333339' : '#8f8d98'
      }}
    >
      {children}
    </button>
  )
}

function ShapeButton({
  label,
  color,
  dimColor,
  icon,
  onClick,
}: {
  label: string
  color: string
  dimColor: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={`Add ${label}`}
      className="h-7 px-2.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition-all"
      style={{
        background: '#212128',
        color: '#8f8d98',
        border: '1px solid #2d2d35',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = dimColor
        el.style.color = color
        el.style.borderColor = color + '50'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = '#212128'
        el.style.color = '#8f8d98'
        el.style.borderColor = '#2d2d35'
      }}
    >
      <span style={{ color: 'inherit' }}>{icon}</span>
      {label}
    </button>
  )
}

/* ── Icons ──────────────────────────────────────────────────────────── */

function UndoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
    </svg>
  )
}

function RedoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13" />
    </svg>
  )
}
