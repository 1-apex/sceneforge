/**
 * useKeyboardShortcuts Hook
 *
 * Handles global keyboard shortcuts for the editor.
 *
 * Shortcuts:
 * - Ctrl+C: Copy selected object
 * - Ctrl+V: Paste object at origin (0,0,0)
 * - Delete/Backspace: Delete selected object
 */

'use client'

import { useEffect } from 'react'
import { useSceneStore } from '@/store/scene-store'

export function useKeyboardShortcuts() {
  const copySelectedObject = useSceneStore((state) => state.copySelectedObject)
  const pasteObject = useSceneStore((state) => state.pasteObject)
  const removeObject = useSceneStore((state) => state.removeObject)
  const selectedObjectId = useSceneStore((state) => state.selectedObjectId)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Ctrl+C: Copy
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        copySelectedObject()
      }

      // Ctrl+V: Paste at origin
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        pasteObject()
      }

      // Delete or Backspace: Remove selected object
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectId) {
        e.preventDefault()
        removeObject(selectedObjectId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [copySelectedObject, pasteObject, removeObject, selectedObjectId])
}

