/**
 * Editor Component — Root layout shell
 *
 * ┌──────────────────────────────────────────────┐
 * │                   TopBar                     │
 * ├────────┬─────────────────────────┬───────────┤
 * │ Scene  │                         │           │
 * │ Tree   │     3D Viewport         │ Inspector │
 * │        │                         │           │
 * ├────────┴─────────────────────────┴───────────┤
 * │              Code Panel (resizable)          │
 * └──────────────────────────────────────────────┘
 */

'use client'

import dynamic from 'next/dynamic'
import { TopBar }         from './TopBar'
import { SceneTree }      from './SceneTree'
import { Inspector }      from './Inspector'
import { CodePanel }      from './CodePanel'
import { TextEditorModal } from './TextEditorModal'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

const Viewport = dynamic(
  () => import('./Viewport').then((m) => m.Viewport),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: '#0e0e11' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(97,123,255,0.12)', border: '1px solid rgba(97,123,255,0.2)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#617bff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <p className="text-xs" style={{ color: '#4e4c58' }}>Initialising 3D viewport…</p>
        </div>
      </div>
    ),
  }
)

export function Editor() {
  useKeyboardShortcuts()

  return (
    <div className="h-screen flex flex-col" style={{ background: '#0e0e11' }}>
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        <SceneTree />
        <Viewport />
        <Inspector />
      </div>

      <TextEditorModal />
      <CodePanel />
    </div>
  )
}
