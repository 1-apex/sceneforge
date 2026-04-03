/**
 * TopBar Component
 *
 * Provides project branding, object creation buttons, and undo/redo controls.
 */

'use client'

import { useSceneStore, selectCanUndo, selectCanRedo } from '@/store/scene-store'

export function TopBar() {
  const addObject = useSceneStore((state) => state.addObject)
  const undo = useSceneStore((state) => state.undo)
  const redo = useSceneStore((state) => state.redo)
  const canUndo = useSceneStore(selectCanUndo)
  const canRedo = useSceneStore(selectCanRedo)

  return (
    <header className="h-12 bg-[#242424] border-b border-[#3d3d3d] flex items-center justify-between px-4">
      {/* Left: Branding + Undo/Redo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <img src="/sceneforge_logo.png" alt="SceneForge Logo" className="w-6 h-6 object-contain" />
          <span className="font-semibold text-sm">SceneForge</span>
          <span className="text-xs text-[#737373]">v1.3</span>
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-[#3d3d3d]" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs ${
              canUndo
                ? 'hover:bg-[#363636] text-[#a3a3a3] hover:text-[#e5e5e5]'
                : 'text-[#404040] cursor-not-allowed'
            }`}
          >
            <UndoIcon />
            <span className="hidden sm:inline">Undo</span>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs ${
              canRedo
                ? 'hover:bg-[#363636] text-[#a3a3a3] hover:text-[#e5e5e5]'
                : 'text-[#404040] cursor-not-allowed'
            }`}
          >
            <RedoIcon />
            <span className="hidden sm:inline">Redo</span>
          </button>
        </div>
      </div>

      {/* Center: Object Creation Buttons */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#737373] mr-1">Add:</span>
        <button
          onClick={() => addObject('box')}
          className="px-3 py-1.5 text-xs bg-[#2d2d2d] hover:bg-[#363636] border border-[#3d3d3d] rounded transition-colors flex items-center gap-1.5"
          title="Add Box (Cube)"
        >
          <BoxIcon />
          Box
        </button>
        <button
          onClick={() => addObject('sphere')}
          className="px-3 py-1.5 text-xs bg-[#2d2d2d] hover:bg-[#363636] border border-[#3d3d3d] rounded transition-colors flex items-center gap-1.5"
          title="Add Sphere"
        >
          <SphereIcon />
          Sphere
        </button>
        <button
          onClick={() => addObject('cylinder')}
          className="px-3 py-1.5 text-xs bg-[#2d2d2d] hover:bg-[#363636] border border-[#3d3d3d] rounded transition-colors flex items-center gap-1.5"
          title="Add Cylinder"
        >
          <CylinderIcon />
          Cylinder
        </button>
        <button
          onClick={() => addObject('rounded-box')}
          className="px-3 py-1.5 text-xs bg-[#2d2d2d] hover:bg-[#363636] border border-[#3d3d3d] rounded transition-colors flex items-center gap-1.5"
          title="Add Rounded Box"
        >
          <RoundedBoxIcon />
          Rounded Box
        </button>
      </div>

      {/* Right: placeholder */}
      <div className="w-32" />
    </header>
  )
}

// ── Icons ────────────────────────────────────────────────────────────────────

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

function BoxIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="1" />
    </svg>
  )
}

function SphereIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

function CylinderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
    </svg>
  )
}

function RoundedBoxIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
    </svg>
  )
}
