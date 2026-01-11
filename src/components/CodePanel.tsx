/**
 * CodePanel Component
 *
 * Live JSX code preview panel with export mode selection.
 * Generates React Three Fiber JSX from Zustand scene state.
 *
 * Export Modes:
 * - Scene Only: Just meshes, no lights or canvas
 * - With Lights: Meshes + standard lighting
 * - With Canvas: Full wrapper ready to drop into app
 *
 * Key Requirements:
 * - Deterministic output (same state → same code)
 * - Human-readable JSX
 * - No random IDs in output
 */

'use client'

import { useState, useMemo } from 'react'
import { useSceneStore } from '@/store/scene-store'
import { generateJSX, type ExportMode } from '@/lib/export'

export function CodePanel() {
  const objects = useSceneStore((state) => state.objects)
  const [copied, setCopied] = useState(false)
  const [exportMode, setExportMode] = useState<ExportMode>('sceneOnly')

  // Generate JSX code deterministically from scene state and export mode
  const code = useMemo(
    () => generateJSX(objects, { mode: exportMode }),
    [objects, exportMode]
  )

  // Filename changes based on export mode
  const filename = exportMode === 'withCanvas' ? 'SceneCanvas.tsx' : 'Scene.tsx'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <section className="h-48 bg-[#242424] border-t border-[#3d3d3d] flex flex-col">
      {/* Header with Export Mode Selector */}
      <div className="h-8 px-3 flex items-center justify-between border-b border-[#3d3d3d]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[#a3a3a3] uppercase tracking-wide">
            Export
          </span>
          <ExportModeSelector mode={exportMode} onChange={setExportMode} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#737373]">{filename}</span>
          <button
            onClick={handleCopy}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              copied
                ? 'bg-green-600/20 text-green-400'
                : 'bg-[#2d2d2d] hover:bg-[#363636] text-[#a3a3a3]'
            }`}
          >
            {copied ? '✓ Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 overflow-auto p-2">
        <pre className="text-xs font-mono text-[#a3a3a3] whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </section>
  )
}

/**
 * Export Mode Selector
 * Dropdown for choosing export format
 */
function ExportModeSelector({
  mode,
  onChange
}: {
  mode: ExportMode
  onChange: (mode: ExportMode) => void
}) {
  return (
    <select
      value={mode}
      onChange={(e) => onChange(e.target.value as ExportMode)}
      className="text-xs bg-[#2d2d2d] border border-[#3d3d3d] rounded px-2 py-0.5 text-[#a3a3a3] focus:outline-none focus:border-blue-500"
    >
      <option value="sceneOnly">Scene Only</option>
      <option value="withLights">Scene + Lights</option>
      <option value="withCanvas">Full Canvas</option>
    </select>
  )
}
