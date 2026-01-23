'use client'

import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, RoundedBox } from '@react-three/drei'
import { useSceneStore, selectEditingTextObject, TextConfig, MeshType } from '@/store/scene-store'

export function TextEditorModal() {
    const editingObject = useSceneStore(selectEditingTextObject)
    const setEditingTextObjectId = useSceneStore((state) => state.setEditingTextObjectId)
    const updateTextConfig = useSceneStore((state) => state.updateTextConfig)

    // Local state for the form, initialized from the object's current config or defaults
    const [config, setConfig] = useState<TextConfig>({
        content: '',
        fontSize: 0.5,
        color: '#ffffff',
        alignment: 'center'
    })

    // Initialize state when modal opens
    useEffect(() => {
        if (editingObject) {
            if (editingObject.textConfig) {
                setConfig(editingObject.textConfig)
            } else {
                // Default values - proportional to object scale
                const minDimension = Math.min(editingObject.scale[0], editingObject.scale[1])
                setConfig({
                    content: 'Text',
                    fontSize: minDimension * 0.4, // 40% of smallest dimension
                    color: '#ffffff',
                    alignment: 'center'
                })
            }
        }
    }, [editingObject])

    if (!editingObject) return null

    const handleClose = () => {
        setEditingTextObjectId(null)
    }

    const handleApply = () => {
        updateTextConfig(editingObject.id, config)
        handleClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-[800px] h-[500px] bg-[#1e1e1e] border border-[#3d3d3d] rounded-lg shadow-2xl flex overflow-hidden">

                {/* Left Panel - 3D Preview */}
                <div className="flex-1 bg-[#151515] relative border-r border-[#3d3d3d]">
                    <div className="absolute top-2 left-2 z-10 text-xs text-[#737373] uppercase tracking-wider font-medium">
                        Preview
                    </div>
                    <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 10, 5]} intensity={1} />
                        <OrbitControls makeDefault enablePan={false} />

                        {/* Render Object & Text */}

                        <group>
                            <PreviewMesh
                                type={editingObject.type}
                                color={editingObject.material.color}
                                scale={editingObject.scale}
                            />
                            {/* Text positioning - tightly on surface */}
                            <group position={[0, 0, (editingObject.scale[2] / 2) + 0.01]}>
                                <Text
                                    fontSize={config.fontSize}
                                    color={config.color}
                                    anchorX={config.alignment}
                                    anchorY="middle"
                                    textAlign={config.alignment}
                                    maxWidth={editingObject.scale[0] * 0.9}
                                    // @ts-ignore
                                    curveRadius={
                                        (editingObject.type === 'cylinder' || editingObject.type === 'sphere')
                                            ? -editingObject.scale[0] / 2
                                            : undefined
                                    }
                                >
                                    {config.content}
                                </Text>
                            </group>
                        </group>

                        <gridHelper args={[10, 10, '#333', '#222']} />
                    </Canvas>
                    <div className="absolute bottom-2 left-0 w-full text-center text-[10px] text-[#525252]">
                        Drag to rotate • Scroll to zoom
                    </div>
                </div>

                {/* Right Panel - Controls */}
                <div className="w-80 flex flex-col bg-[#242424]">
                    <div className="h-12 border-b border-[#3d3d3d] flex items-center px-4 justify-between">
                        <h2 className="text-sm font-medium text-[#e5e5e5]">Add Text</h2>
                        <button
                            onClick={handleClose}
                            className="text-[#737373] hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                        {/* Content Input */}
                        <div className="space-y-2">
                            <label className="text-xs text-[#a3a3a3]">Text Content</label>
                            <textarea
                                value={config.content}
                                onChange={(e) => setConfig({ ...config, content: e.target.value })}
                                className="w-full bg-[#1e1e1e] border border-[#3d3d3d] rounded p-2 text-sm text-white focus:outline-none focus:border-[#4a90d9] min-h-[80px]"
                                placeholder="Enter text..."
                            />
                        </div>

                        {/* Font Size */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <label className="text-[#a3a3a3]">Size</label>
                                <span className="text-[#737373]">{config.fontSize.toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                min="0.1"
                                max="2"
                                step="0.1"
                                value={config.fontSize}
                                onChange={(e) => setConfig({ ...config, fontSize: parseFloat(e.target.value) })}
                                className="w-full h-1 bg-[#3d3d3d] rounded-lg appearance-none cursor-pointer accent-[#4a90d9]"
                            />
                        </div>

                        {/* Color */}
                        <div className="space-y-2">
                            <label className="text-xs text-[#a3a3a3]">Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={config.color}
                                    onChange={(e) => setConfig({ ...config, color: e.target.value })}
                                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                />
                                <input
                                    type="text"
                                    value={config.color}
                                    onChange={(e) => setConfig({ ...config, color: e.target.value })}
                                    className="flex-1 bg-[#1e1e1e] border border-[#3d3d3d] rounded px-2 py-1.5 text-xs text-[#e5e5e5] uppercase focus:outline-none focus:border-[#4a90d9]"
                                />
                            </div>
                        </div>

                        {/* Alignment */}
                        <div className="space-y-2">
                            <label className="text-xs text-[#a3a3a3]">Alignment</label>
                            <div className="grid grid-cols-3 gap-1 bg-[#1e1e1e] p-1 rounded border border-[#3d3d3d]">
                                {(['left', 'center', 'right'] as const).map((align) => (
                                    <button
                                        key={align}
                                        onClick={() => setConfig({ ...config, alignment: align })}
                                        className={`text-xs py-1 rounded capitalize transition-colors ${config.alignment === align
                                            ? 'bg-[#3d3d3d] text-white'
                                            : 'text-[#737373] hover:text-[#a3a3a3]'
                                            }`}
                                    >
                                        {align}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-[#3d3d3d] flex gap-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 text-xs font-medium text-[#e5e5e5] bg-[#3d3d3d] hover:bg-[#4a4a4a] rounded transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className="flex-1 px-4 py-2 text-xs font-medium text-white bg-[#4a90d9] hover:bg-[#3a7bc2] rounded transition-colors"
                        >
                            Apply Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function PreviewMesh({ type, color, scale }: { type: MeshType; color: string, scale: [number, number, number] }) {
    switch (type) {
        case 'box':
            return (
                <mesh scale={scale}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            )
        case 'sphere':
            return (
                <mesh scale={scale}>
                    <sphereGeometry args={[0.5, 32, 32]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            )
        case 'cylinder':
            return (
                <mesh scale={scale}>
                    <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            )
        case 'rounded-box':
            return (
                <RoundedBox
                    args={[1, 1, 1]}
                    radius={0.15}
                    smoothness={4}
                    scale={scale}
                >
                    <meshStandardMaterial color={color} />
                </RoundedBox>
            )
        default:
            return (
                <mesh scale={scale}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            )
    }
}
