/**
 * Editor Component
 *
 * Main composition component that assembles the entire editor layout.
 * Uses 'use client' as it contains client-side interactive components.
 *
 * Layout follows the specification exactly:
 * - TopBar: Project branding and object creation
 * - SceneTree: Left sidebar with object list
 * - Viewport: Center 3D canvas
 * - Inspector: Right sidebar with property editing
 * - CodePanel: Bottom panel with live JSX export
 *
 * Keyboard Shortcuts:
 * - Ctrl+C: Copy selected object
 * - Ctrl+V: Paste (mirrored for symmetry)
 * - Delete: Remove selected object
 */

'use client'

import dynamic from 'next/dynamic'
import { TopBar } from './TopBar'
import { SceneTree } from './SceneTree'
import { Inspector } from './Inspector'
import { CodePanel } from './CodePanel'
import { TextEditorModal } from './TextEditorModal'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

const Viewport = dynamic(
  () => import('./Viewport').then((mod) => mod.Viewport),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center text-[#737373]">
        Loading 3D viewport...
      </div>
    )
  }
)

export function Editor() {
  // Register global keyboard shortcuts (Ctrl+C, Ctrl+V, Delete)
  useKeyboardShortcuts()

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar - Project branding and object creation */}
      <TopBar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Scene Tree */}
        <SceneTree />

        {/* Center - 3D Viewport */}
        <Viewport />

        {/* Right Sidebar - Inspector */}
        <Inspector />
      </div>

      {/* Text Editor Modal - Global overlay */}
      <TextEditorModal />


      {/* Bottom Panel - Live JSX Code */}
      <CodePanel />
    </div>
  )
}

