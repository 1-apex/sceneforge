/**
 * SceneForge - Zustand Scene State Store
 *
 * This is the SINGLE SOURCE OF TRUTH for the entire application.
 * All UI components read from and write to this store.
 * React Three Fiber renders strictly from this state.
 * The JSX exporter serializes this state to code.
 *
 * Architecture Decision: Using Zustand for its simplicity, performance,
 * and excellent TypeScript support. No need for context providers.
 *
 * Undo/Redo:
 * - `past` holds snapshots of objects[] before each mutation.
 * - `future` holds snapshots for redo after an undo.
 * - Capped at 50 entries each direction to keep memory bounded.
 * - Destructive mutations (add/remove/paste/textConfig) auto-snapshot.
 * - Continuous mutations (gizmo drag, inspector inputs) are snapshotted
 *   at their call sites (drag start / input focus) via pushHistory().
 */

import { create } from 'zustand'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type MeshType = 'box' | 'sphere' | 'cylinder' | 'rounded-box'
export type ObjectType = MeshType

export interface TextConfig {
  content: string
  fontSize: number
  color: string
  alignment: 'left' | 'center' | 'right'
}

const DEFAULT_MESH_COLORS: Record<MeshType, string> = {
  box: '#4a90d9',
  sphere: '#d94a4a',
  cylinder: '#4ad97a',
  'rounded-box': '#9d4ad9',
}

export interface MeshObject {
  id: string
  type: MeshType
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  material: {
    color: string
  }
  textConfig?: TextConfig
}

export type SceneObject = MeshObject

const HISTORY_LIMIT = 50

export type SceneState = {
  objects: SceneObject[]
  selectedObjectId: string | null
  editingTextObjectId: string | null
  clipboard: SceneObject | null
  // Undo/Redo history
  past: SceneObject[][]
  future: SceneObject[][]
}

// ============================================================================
// ACTION TYPES
// ============================================================================

type SceneActions = {
  // Object CRUD
  addObject: (type: ObjectType) => void
  removeObject: (id: string) => void

  // Selection
  selectObject: (id: string | null) => void
  setEditingTextObjectId: (id: string | null) => void

  // Transform updates
  updatePosition: (id: string, position: [number, number, number]) => void
  updateRotation: (id: string, rotation: [number, number, number]) => void
  updateScale: (id: string, scale: [number, number, number]) => void

  // Material/appearance
  updateColor: (id: string, color: string) => void
  updateTextConfig: (id: string, config: TextConfig | undefined) => void

  // Copy/Paste
  copySelectedObject: () => void
  pasteObject: () => void

  // Undo/Redo
  pushHistory: () => void
  undo: () => void
  redo: () => void
}

// ============================================================================
// ID GENERATION
// ============================================================================

let objectCounter = 0

function generateId(type: ObjectType): string {
  objectCounter++
  return `${type}-${objectCounter}`
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_TRANSFORMS = {
  position: [0, 0, 0] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  scale: [1, 1, 1] as [number, number, number],
}

/** Snapshot current objects into the past stack, clearing future. */
function snapshotObjects(objects: SceneObject[], past: SceneObject[][]): SceneObject[][] {
  return [...past.slice(-HISTORY_LIMIT + 1), objects]
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useSceneStore = create<SceneState & SceneActions>((set, get) => ({
  // Initial state
  objects: [],
  selectedObjectId: null,
  editingTextObjectId: null,
  clipboard: null,
  past: [],
  future: [],

  // ── Object CRUD ────────────────────────────────────────────────────────────

  addObject: (type) => set((state) => {
    const newObject: SceneObject = {
      id: generateId(type),
      type,
      position: [...DEFAULT_TRANSFORMS.position],
      rotation: [...DEFAULT_TRANSFORMS.rotation],
      scale: [...DEFAULT_TRANSFORMS.scale],
      material: { color: DEFAULT_MESH_COLORS[type] },
    }
    return {
      objects: [...state.objects, newObject],
      selectedObjectId: newObject.id,
      past: snapshotObjects(state.objects, state.past),
      future: [],
    }
  }),

  removeObject: (id) => set((state) => ({
    objects: state.objects.filter((obj) => obj.id !== id),
    selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
    editingTextObjectId: state.editingTextObjectId === id ? null : state.editingTextObjectId,
    past: snapshotObjects(state.objects, state.past),
    future: [],
  })),

  // ── Selection ──────────────────────────────────────────────────────────────

  selectObject: (id) => set({ selectedObjectId: id }),
  setEditingTextObjectId: (id) => set({ editingTextObjectId: id }),

  // ── Transform Updates (called from gizmo & inspector) ─────────────────────

  updatePosition: (id, position) => set((state) => ({
    objects: state.objects.map((obj) =>
      obj.id === id ? { ...obj, position } : obj
    ),
  })),

  updateRotation: (id, rotation) => set((state) => ({
    objects: state.objects.map((obj) =>
      obj.id === id ? { ...obj, rotation } : obj
    ),
  })),

  updateScale: (id, scale) => set((state) => ({
    objects: state.objects.map((obj) =>
      obj.id === id ? { ...obj, scale } : obj
    ),
  })),

  // ── Material ───────────────────────────────────────────────────────────────

  updateColor: (id, color) => set((state) => ({
    objects: state.objects.map((obj) => {
      if (obj.id !== id) return obj
      return { ...obj, material: { ...obj.material, color } }
    }),
  })),

  // Text config update - auto-snapshots (modal "Apply" is a commit action)
  updateTextConfig: (id, config) => set((state) => ({
    objects: state.objects.map((obj) => {
      if (obj.id !== id) return obj
      return { ...obj, textConfig: config }
    }),
    past: snapshotObjects(state.objects, state.past),
    future: [],
  })),

  // ── Copy/Paste ─────────────────────────────────────────────────────────────

  copySelectedObject: () => {
    const state = get()
    const selected = state.objects.find((obj) => obj.id === state.selectedObjectId)
    if (selected) {
      set({ clipboard: JSON.parse(JSON.stringify(selected)) })
    }
  },

  // Paste with a small positional offset so both objects are visible
  pasteObject: () => set((state) => {
    if (!state.clipboard) return state
    const source = state.clipboard
    const newObject: SceneObject = {
      ...JSON.parse(JSON.stringify(source)),
      id: generateId(source.type),
      position: [
        source.position[0] + 0.5,
        source.position[1],
        source.position[2] + 0.5,
      ] as [number, number, number],
    }
    return {
      objects: [...state.objects, newObject],
      selectedObjectId: newObject.id,
      past: snapshotObjects(state.objects, state.past),
      future: [],
    }
  }),

  // ── Undo/Redo ──────────────────────────────────────────────────────────────

  /**
   * Snapshot current objects into history.
   * Call this BEFORE starting a continuous edit (gizmo drag start, input focus).
   */
  pushHistory: () => set((state) => ({
    past: snapshotObjects(state.objects, state.past),
    future: [],
  })),

  undo: () => set((state) => {
    if (state.past.length === 0) return state
    const previous = state.past[state.past.length - 1]
    // Preserve selection only if the selected object still exists
    const newSelectedId = previous.some((o) => o.id === state.selectedObjectId)
      ? state.selectedObjectId
      : null
    return {
      past: state.past.slice(0, -1),
      future: [state.objects, ...state.future.slice(0, HISTORY_LIMIT - 1)],
      objects: previous,
      selectedObjectId: newSelectedId,
    }
  }),

  redo: () => set((state) => {
    if (state.future.length === 0) return state
    const next = state.future[0]
    const newSelectedId = next.some((o) => o.id === state.selectedObjectId)
      ? state.selectedObjectId
      : null
    return {
      past: snapshotObjects(state.objects, state.past),
      future: state.future.slice(1),
      objects: next,
      selectedObjectId: newSelectedId,
    }
  }),
}))

// ── Selector Helpers ─────────────────────────────────────────────────────────

export const selectObjects = (state: SceneState) => state.objects
export const selectSelectedObjectId = (state: SceneState) => state.selectedObjectId
export const selectEditingTextObjectId = (state: SceneState) => state.editingTextObjectId
export const selectSelectedObject = (state: SceneState & SceneActions) =>
  state.objects.find((obj) => obj.id === state.selectedObjectId) ?? null
export const selectEditingTextObject = (state: SceneState & SceneActions) =>
  state.objects.find((obj) => obj.id === state.editingTextObjectId) ?? null
export const selectCanUndo = (state: SceneState) => state.past.length > 0
export const selectCanRedo = (state: SceneState) => state.future.length > 0
