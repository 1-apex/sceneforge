/**
 * SceneTree Component — Premium redesign
 *
 * Color-coded type indicators, smooth hover/selection states,
 * and an illustrated empty state.
 */

'use client'

import { useSceneStore } from '@/store/scene-store'
import type { MeshType, SceneObject } from '@/store/scene-store'

/* Per-type accent colors — must match TopBar and Inspector */
const MESH_COLORS: Record<MeshType, string> = {
  'box':         '#617bff',
  'sphere':      '#f05672',
  'cylinder':    '#3dd672',
  'rounded-box': '#b46ef5',
}


export function SceneTree() {
  const objects         = useSceneStore((state) => state.objects)
  const selectedObjectId = useSceneStore((state) => state.selectedObjectId)
  const selectObject    = useSceneStore((state) => state.selectObject)
  const removeObject    = useSceneStore((state) => state.removeObject)

  return (
    <aside
      className="w-56 flex flex-col shrink-0"
      style={{ background: '#1b1b1f', borderRight: '1px solid #232328' }}
    >
      {/* Header */}
      <div
        className="h-9 px-3 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid #232328' }}
      >
        <span className="text-[10.5px] font-semibold uppercase tracking-widest" style={{ color: '#4e4c58' }}>
          Scene
        </span>
        {objects.length > 0 && (
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{ background: '#212128', color: '#8f8d98', border: '1px solid #29292f' }}
          >
            {objects.length}
          </span>
        )}
      </div>

      {/* Object List */}
      <div className="flex-1 overflow-y-auto py-1.5 px-1.5">
        {objects.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="flex flex-col gap-0.5">
            {objects.map((obj) => (
              <SceneItem
                key={obj.id}
                object={obj}
                isSelected={obj.id === selectedObjectId}
                onSelect={() => selectObject(obj.id)}
                onDelete={(e) => { e.stopPropagation(); removeObject(obj.id) }}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div
        className="h-7 px-3 flex items-center shrink-0"
        style={{ borderTop: '1px solid #1e1e22', color: '#4e4c58' }}
      >
        <span className="text-[10.5px]">
          {objects.length === 0
            ? 'Empty scene'
            : `${objects.length} object${objects.length !== 1 ? 's' : ''}`}
        </span>
      </div>
    </aside>
  )
}

/* ── Scene Item ──────────────────────────────────────────────────────── */

function SceneItem({
  object,
  isSelected,
  onSelect,
  onDelete,
}: {
  object: SceneObject
  isSelected: boolean
  onSelect: () => void
  onDelete: (e: React.MouseEvent) => void
}) {
  const typeColor = MESH_COLORS[object.type]

  return (
    <li>
      <button
        onClick={onSelect}
        className="w-full text-left rounded-md flex items-center gap-2 group relative overflow-hidden transition-all"
        style={{
          padding: '5px 8px 5px 0',
          background: isSelected ? 'rgba(97,123,255,0.10)' : 'transparent',
          border: isSelected ? '1px solid rgba(97,123,255,0.22)' : '1px solid transparent',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            (e.currentTarget as HTMLElement).style.background = '#28282f'
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            (e.currentTarget as HTMLElement).style.background = 'transparent'
          }
        }}
      >
        {/* Left type color strip */}
        <div
          className="w-0.5 self-stretch rounded-full shrink-0 ml-1.5"
          style={{ background: isSelected ? typeColor : 'transparent', transition: 'background 0.15s' }}
        />

        {/* Type icon */}
        <div style={{ color: typeColor }} className="shrink-0">
          <MeshTypeIcon type={object.type} />
        </div>

        {/* Name */}
        <span
          className="flex-1 truncate text-xs font-medium"
          style={{ color: isSelected ? '#eae8e5' : '#8f8d98' }}
        >
          {object.id}
        </span>

        {/* Object color swatch */}
        <div
          className="w-3 h-3 rounded-sm shrink-0"
          style={{
            background: object.material.color,
            border: '1.5px solid rgba(255,255,255,0.1)',
          }}
        />

        {/* Delete — visible on hover */}
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all"
          style={{ color: '#4e4c58' }}
          title="Delete"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#f04a6a'
            ;(e.currentTarget as HTMLElement).style.background = 'rgba(240,74,106,0.12)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#4e4c58'
            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
          }}
        >
          <TrashIcon />
        </button>
      </button>
    </li>
  )
}

/* ── Empty State ─────────────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: '#212128', border: '1px solid #2d2d35' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4e4c58" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium mb-1" style={{ color: '#5c5a65' }}>No objects yet</p>
        <p className="text-[10.5px]" style={{ color: '#3d3b45' }}>Use the toolbar above to add shapes to your scene.</p>
      </div>
    </div>
  )
}

/* ── Icons ───────────────────────────────────────────────────────────── */

function MeshTypeIcon({ type }: { type: MeshType }) {
  const s = { width: 13, height: 13 }
  switch (type) {
    case 'box':
      return (
        <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      )
    case 'sphere':
      return (
        <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
        </svg>
      )
    case 'cylinder':
      return (
        <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
        </svg>
      )
    case 'rounded-box':
    default:
      return (
        <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="6" />
        </svg>
      )
  }
}

function TrashIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
    </svg>
  )
}
