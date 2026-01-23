/**
 * Inspector Component
 *
 * Displays and allows editing of the selected object's properties.
 * Provides numeric inputs for transforms and color picker for material.
 * All changes write directly to Zustand store - no local state.
 */

'use client'

import { useSceneStore, selectSelectedObject } from '@/store/scene-store'

export function Inspector() {
  const selectedObject = useSceneStore(selectSelectedObject)
  const updatePosition = useSceneStore((state) => state.updatePosition)
  const updateRotation = useSceneStore((state) => state.updateRotation)
  const updateScale = useSceneStore((state) => state.updateScale)
  const updateColor = useSceneStore((state) => state.updateColor)

  if (!selectedObject) {
    return (
      <aside className="w-64 bg-[#242424] border-l border-[#3d3d3d] flex flex-col">
        <div className="h-8 px-3 flex items-center border-b border-[#3d3d3d]">
          <span className="text-xs font-medium text-[#a3a3a3] uppercase tracking-wide">
            Inspector
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center text-xs text-[#737373]">
          Select an object to inspect
        </div>
      </aside>
    )
  }

  const objectColor = selectedObject.material.color

  return (
    <aside className="w-64 bg-[#242424] border-l border-[#3d3d3d] flex flex-col">
      {/* Header */}
      <div className="h-8 px-3 flex items-center border-b border-[#3d3d3d]">
        <span className="text-xs font-medium text-[#a3a3a3] uppercase tracking-wide">
          Inspector
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Object Info */}
        <section>
          <h3 className="text-xs text-[#a3a3a3] mb-2 font-medium">Object</h3>
          <div className="bg-[#2d2d2d] rounded px-2 py-1.5 text-xs">
            <span className="text-[#737373]">Type:</span>{' '}
            <span className="text-[#e5e5e5] capitalize">{selectedObject.type}</span>
          </div>
        </section>

        {/* Position */}
        <section>
          <h3 className="text-xs text-[#a3a3a3] mb-2 font-medium">Position</h3>
          <Vector3Input
            value={selectedObject.position}
            onChange={(pos) => updatePosition(selectedObject.id, pos)}
          />
        </section>

        {/* Rotation (displayed in degrees) */}
        <section>
          <h3 className="text-xs text-[#a3a3a3] mb-2 font-medium">Rotation (degrees)</h3>
          <Vector3Input
            value={selectedObject.rotation.map(r => r * (180 / Math.PI)) as [number, number, number]}
            onChange={(rot) => updateRotation(
              selectedObject.id,
              rot.map(r => r * (Math.PI / 180)) as [number, number, number]
            )}
            step={1}
          />
        </section>

        {/* Scale */}
        <section>
          <h3 className="text-xs text-[#a3a3a3] mb-2 font-medium">Scale</h3>
          <Vector3Input
            value={selectedObject.scale}
            onChange={(scale) => updateScale(selectedObject.id, scale)}
            step={0.1}
          />
        </section>

        {/* Color */}
        <section>
          <h3 className="text-xs text-[#a3a3a3] mb-2 font-medium">Color</h3>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={objectColor}
              onChange={(e) => updateColor(selectedObject.id, e.target.value)}
              className="w-8 h-6 rounded cursor-pointer border-0 p-0"
            />
            <input
              type="text"
              value={objectColor}
              onChange={(e) => updateColor(selectedObject.id, e.target.value)}
              className="flex-1 w-full"
              placeholder="#ffffff"
            />
          </div>
        </section>


        {/* Text Overlay */}
        <section>
          <h3 className="text-xs text-[#a3a3a3] mb-2 font-medium">Text Overlay</h3>
          <button
            onClick={() => useSceneStore.getState().setEditingTextObjectId(selectedObject.id)}
            className="w-full px-3 py-1.5 bg-[#3d3d3d] hover:bg-[#4a4a4a] text-xs text-[#e5e5e5] rounded transition-colors border border-[#525252]"
          >
            {selectedObject.textConfig ? 'Edit Text' : 'Add Text'}
          </button>
        </section>
      </div>
    </aside >
  )
}

/**
 * Vector3Input Component
 * Reusable component for editing [x, y, z] tuples.
 */
function Vector3Input({
  value,
  onChange,
  step = 0.1,
}: {
  value: [number, number, number]
  onChange: (value: [number, number, number]) => void
  step?: number
}) {
  const labels = ['X', 'Y', 'Z']
  const colors = ['text-red-400', 'text-green-400', 'text-blue-400']

  return (
    <div className="grid grid-cols-3 gap-2">
      {labels.map((label, i) => (
        <div key={label} className="flex flex-col gap-1">
          <label className={`text-[10px] ${colors[i]}`}>{label}</label>
          <input
            type="number"
            value={Number(value[i].toFixed(3))}
            onChange={(e) => {
              const newValue = [...value] as [number, number, number]
              newValue[i] = parseFloat(e.target.value) || 0
              onChange(newValue)
            }}
            step={step}
            className="w-full"
          />
        </div>
      ))}
    </div>
  )
}

