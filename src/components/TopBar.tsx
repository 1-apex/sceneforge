/**
 * TopBar Component
 * 
 * Provides project branding and object creation buttons.
 * Part of the main application header.
 */

'use client'

import { useSceneStore } from '@/store/scene-store'

export function TopBar() {
  const addObject = useSceneStore((state) => state.addObject)

  return (
    <header className="h-12 bg-[#242424] border-b border-[#3d3d3d] flex items-center justify-between px-4">
      {/* Left: Branding */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded" />
        <span className="font-semibold text-sm">SceneForge</span>
        <span className="text-xs text-[#737373]">v1.0</span>
      </div>

      {/* Center: Object Creation Buttons */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#737373] mr-2">Add Object:</span>
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
      </div>

      {/* Right: Placeholder for future features */}
      <div className="flex items-center gap-2 text-[#737373] text-xs">
        <span>Export</span>
      </div>
    </header>
  )
}

// Simple SVG icons for object types
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

