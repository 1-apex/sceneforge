/**
 * SceneTree Component
 *
 * Displays a hierarchical list of all scene objects.
 * Allows selection and deletion of objects.
 * Reads from Zustand store - no local state for scene data.
 */

'use client'

import { useSceneStore } from '@/store/scene-store'
import type { MeshType, SceneObject } from '@/store/scene-store'

// Helper to get color from any scene object
function getObjectColor(obj: SceneObject): string {
  return obj.material.color
}

export function SceneTree() {
  const objects = useSceneStore((state) => state.objects)
  const selectedObjectId = useSceneStore((state) => state.selectedObjectId)
  const selectObject = useSceneStore((state) => state.selectObject)
  const removeObject = useSceneStore((state) => state.removeObject)

  return (
    <aside className="w-56 bg-[#242424] border-r border-[#3d3d3d] flex flex-col">
      {/* Header */}
      <div className="h-8 px-3 flex items-center border-b border-[#3d3d3d]">
        <span className="text-xs font-medium text-[#a3a3a3] uppercase tracking-wide">
          Scene Tree
        </span>
      </div>

      {/* Object List */}
      <div className="flex-1 overflow-y-auto p-2">
        {objects.length === 0 ? (
          <div className="text-xs text-[#737373] text-center py-4">
            No objects in scene.
            <br />
            Use toolbar to add objects.
          </div>
        ) : (
          <ul className="space-y-1">
            {objects.map((obj) => (
              <li key={obj.id}>
                <button
                  onClick={() => selectObject(obj.id)}
                  className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center gap-2 group transition-colors ${
                    selectedObjectId === obj.id
                      ? 'bg-[#3b82f6]/20 text-[#3b82f6]'
                      : 'hover:bg-[#2d2d2d] text-[#e5e5e5]'
                  }`}
                >
                  {/* Object type icon */}
                  <ObjectTypeIcon type={obj.type} />

                  {/* Object name */}
                  <span className="flex-1 truncate">{obj.id}</span>

                  {/* Color indicator */}
                  <span
                    className="w-3 h-3 rounded-sm border border-[#3d3d3d]"
                    style={{ backgroundColor: getObjectColor(obj) }}
                  />
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeObject(obj.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition-opacity"
                    title="Delete object"
                  >
                    <TrashIcon />
                  </button>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer with object count */}
      <div className="h-6 px-3 flex items-center border-t border-[#3d3d3d] text-[#737373] text-xs">
        {objects.length} object{objects.length !== 1 ? 's' : ''}
      </div>
    </aside>
  )
}

function ObjectTypeIcon({ type }: { type: MeshType }) {
  const className = "w-3.5 h-3.5 opacity-60"

  switch (type) {
    case 'box':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="1" />
        </svg>
      )
    case 'sphere':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
        </svg>
      )
    case 'cylinder':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
        </svg>
      )
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="1" />
        </svg>
      )
  }
}

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
    </svg>
  )
}

