/**
 * useKeyboardShortcuts Hook
 *
 * Handles global keyboard shortcuts for the editor.
 *
 * Shortcuts:
 * - Ctrl/Cmd + C: Copy selected object
 * - Ctrl/Cmd + V: Paste object (offset from original)
 * - Ctrl/Cmd + Z: Undo
 * - Ctrl/Cmd + Y  |  Ctrl/Cmd + Shift + Z: Redo
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
  const undo = useSceneStore((state) => state.undo)
  const redo = useSceneStore((state) => state.redo)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      const isMod = e.ctrlKey || e.metaKey

      // Ctrl/Cmd + Z: Undo
      if (isMod && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
        return
      }

      // Ctrl/Cmd + Y  or  Ctrl/Cmd + Shift + Z: Redo
      if (isMod && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault()
        redo()
        return
      }

      // Ctrl/Cmd + C: Copy
      if (isMod && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        copySelectedObject()
        return
      }

      // Ctrl/Cmd + V: Paste
      if (isMod && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        pasteObject()
        return
      }

      // Delete or Backspace: Remove selected object
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectId) {
        e.preventDefault()
        removeObject(selectedObjectId)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [copySelectedObject, pasteObject, removeObject, selectedObjectId, undo, redo])
}
