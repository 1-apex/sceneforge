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
 */

import { create } from 'zustand'

// ============================================================================
// TYPE DEFINITIONS - Exact schema as specified in requirements
// ============================================================================

export type MeshType = 'box' | 'sphere' | 'cylinder'
export type ObjectType = MeshType

// Mesh object (box, sphere, cylinder)
export interface MeshObject {
  id: string
  type: MeshType
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  material: {
    color: string
  }
}

// Scene object is just MeshObject for now
export type SceneObject = MeshObject

export type SceneState = {
  objects: SceneObject[]
  selectedObjectId: string | null
  clipboard: SceneObject | null  // Stores copied object for paste
}

// ============================================================================
// ACTION TYPES - All mutations to scene state
// ============================================================================

type SceneActions = {
  // Object CRUD operations
  addObject: (type: ObjectType) => void
  removeObject: (id: string) => void

  // Selection
  selectObject: (id: string | null) => void

  // Transform updates - write back from gizmos and inspector
  updatePosition: (id: string, position: [number, number, number]) => void
  updateRotation: (id: string, rotation: [number, number, number]) => void
  updateScale: (id: string, scale: [number, number, number]) => void

  // Material/appearance updates
  updateColor: (id: string, color: string) => void

  // Copy/Paste for symmetrical designs
  copySelectedObject: () => void
  pasteObject: () => void
}

// ============================================================================
// ID GENERATION - Deterministic and stable
// ============================================================================

/**
 * Counter-based ID generation ensures deterministic, stable IDs.
 * IDs are human-readable for easier debugging and cleaner JSX export.
 */
let objectCounter = 0

function generateId(type: ObjectType): string {
  objectCounter++
  return `${type}-${objectCounter}`
}

// ============================================================================
// DEFAULT VALUES - Used when creating new objects
// ============================================================================

const DEFAULT_TRANSFORMS = {
  position: [0, 0, 0] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  scale: [1, 1, 1] as [number, number, number],
}

const DEFAULT_MESH_COLORS: Record<MeshType, string> = {
  box: '#4a90d9',
  sphere: '#d94a4a',
  cylinder: '#4ad97a',
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useSceneStore = create<SceneState & SceneActions>((set, get) => ({
  // Initial state - empty scene, nothing selected, empty clipboard
  objects: [],
  selectedObjectId: null,
  clipboard: null,

  // Add a new object with default transforms
  addObject: (type) => set((state) => {
    const newObject: SceneObject = {
      id: generateId(type),
      type,
      position: [...DEFAULT_TRANSFORMS.position],
      rotation: [...DEFAULT_TRANSFORMS.rotation],
      scale: [...DEFAULT_TRANSFORMS.scale],
      material: {
        color: DEFAULT_MESH_COLORS[type],
      },
    }

    return {
      objects: [...state.objects, newObject],
      selectedObjectId: newObject.id, // Auto-select newly created object
    }
  }),

  // Remove object and clear selection if it was selected
  removeObject: (id) => set((state) => ({
    objects: state.objects.filter((obj) => obj.id !== id),
    selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
  })),

  // Set currently selected object
  selectObject: (id) => set({ selectedObjectId: id }),

  // Transform updates - immutably update the specific object
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

  // Color update
  updateColor: (id, color) => set((state) => ({
    objects: state.objects.map((obj) => {
      if (obj.id !== id) return obj
      return { ...obj, material: { ...obj.material, color } }
    }),
  })),

  // Copy selected object to clipboard
  copySelectedObject: () => {
    const state = get()
    const selected = state.objects.find((obj) => obj.id === state.selectedObjectId)
    if (selected) {
      // Deep clone the object
      set({ clipboard: JSON.parse(JSON.stringify(selected)) })
    }
  },

  // Paste object from clipboard at viewport center (0,0,0)
  pasteObject: () => set((state) => {
    if (!state.clipboard) return state

    const source = state.clipboard

    // Clone the source object with new id and position at origin
    const newObject: SceneObject = {
      ...JSON.parse(JSON.stringify(source)),
      id: generateId(source.type),
      position: [0, 0, 0] as [number, number, number],
    }

    return {
      objects: [...state.objects, newObject],
      selectedObjectId: newObject.id, // Auto-select pasted object
    }
  }),
}))

// Export selector helpers for optimized subscriptions
export const selectObjects = (state: SceneState) => state.objects
export const selectSelectedObjectId = (state: SceneState) => state.selectedObjectId
export const selectSelectedObject = (state: SceneState & SceneActions) =>
  state.objects.find((obj) => obj.id === state.selectedObjectId) ?? null