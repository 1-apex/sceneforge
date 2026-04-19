'use client'

import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, RoundedBox } from '@react-three/drei'
import { useSceneStore, selectEditingTextObject, TextConfig, MeshType } from '@/store/scene-store'

export function TextEditorModal() {
    const editingObject         = useSceneStore(selectEditingTextObject)
    const setEditingTextObjectId = useSceneStore((state) => state.setEditingTextObjectId)
    const updateTextConfig       = useSceneStore((state) => state.updateTextConfig)

    const isEditing = !!editingObject?.textConfig

    const [config, setConfig] = useState<TextConfig>({
        content: '', fontSize: 0.5, color: '#ffffff', alignment: 'center',
    })

    useEffect(() => {
        if (!editingObject) return
        if (editingObject.textConfig) {
            setConfig(editingObject.textConfig)
        } else {
            const m = Math.min(editingObject.scale[0], editingObject.scale[1])
            setConfig({ content: 'Text', fontSize: m * 0.4, color: '#ffffff', alignment: 'center' })
        }
    }, [editingObject])

    if (!editingObject) return null

    const handleClose  = () => setEditingTextObjectId(null)
    const handleApply  = () => { updateTextConfig(editingObject.id, config); handleClose() }
    const handleRemove = () => { updateTextConfig(editingObject.id, undefined); handleClose() }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        >
            <div
                className="flex overflow-hidden rounded-2xl shadow-2xl"
                style={{
                    width: 820,
                    height: 510,
                    background: '#18181c',
                    border: '1px solid #2d2d35',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                }}
            >
                {/* ── Left: 3D Preview ── */}
                <div className="flex-1 relative" style={{ background: '#0e0e11', borderRight: '1px solid #222228' }}>
                    <div
                        className="absolute top-3 left-3 z-10 text-[9.5px] font-semibold uppercase tracking-widest px-2 py-1 rounded"
                        style={{ background: 'rgba(14,14,17,0.8)', color: '#3d3b45', border: '1px solid #1e1e22' }}
                    >
                        Preview
                    </div>

                    <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
                        <ambientLight intensity={0.45} />
                        <directionalLight position={[10, 10, 5]} intensity={1} />
                        <OrbitControls makeDefault enablePan={false} />

                        <group>
                            <PreviewMesh type={editingObject.type} color={editingObject.material.color} scale={editingObject.scale} />
                            <group position={[0, 0, (editingObject.scale[2] / 2) + 0.01]}>
                                <Text
                                    fontSize={config.fontSize}
                                    color={config.color}
                                    anchorX={config.alignment}
                                    anchorY="middle"
                                    textAlign={config.alignment}
                                    maxWidth={editingObject.scale[0] * 0.9}
                                    // @ts-expect-error curveRadius is valid
                                    curveRadius={
                                        (editingObject.type === 'cylinder' || editingObject.type === 'sphere')
                                            ? -editingObject.scale[0] / 2 : undefined
                                    }
                                >
                                    {config.content}
                                </Text>
                            </group>
                        </group>

                        <gridHelper args={[10, 10, '#1a1a22', '#111118']} />
                    </Canvas>

                    <div className="absolute bottom-3 left-0 w-full text-center text-[10px]" style={{ color: '#3d3b45' }}>
                        Drag to orbit · Scroll to zoom
                    </div>
                </div>

                {/* ── Right: Controls ── */}
                <div className="w-[300px] flex flex-col">
                    {/* Header */}
                    <div
                        className="h-12 px-4 flex items-center justify-between shrink-0"
                        style={{ borderBottom: '1px solid #222228' }}
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center"
                                style={{ background: 'rgba(97,123,255,0.15)', border: '1px solid rgba(97,123,255,0.25)' }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#617bff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                                </svg>
                            </div>
                            <h2 className="text-sm font-semibold" style={{ color: '#eae8e5' }}>
                                {isEditing ? 'Edit Text' : 'Add Text'}
                            </h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all text-sm"
                            style={{ color: '#4e4c58', background: 'transparent' }}
                            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = '#28282f'; el.style.color = '#eae8e5' }}
                            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = '#4e4c58' }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">

                        {/* Content */}
                        <Field label="Text Content">
                            <textarea
                                value={config.content}
                                onChange={(e) => setConfig({ ...config, content: e.target.value })}
                                placeholder="Enter text…"
                                rows={3}
                                className="w-full"
                            />
                        </Field>

                        {/* Font size */}
                        <Field label={<span>Font Size <span className="font-mono" style={{ color: '#617bff' }}>{config.fontSize.toFixed(2)}</span></span>}>
                            <input
                                type="range" min="0.05" max="2" step="0.05"
                                value={config.fontSize}
                                onChange={(e) => setConfig({ ...config, fontSize: parseFloat(e.target.value) })}
                                className="w-full"
                            />
                        </Field>

                        {/* Color */}
                        <Field label="Color">
                            <div className="flex gap-2">
                                <div
                                    className="relative w-9 h-8 rounded-md overflow-hidden shrink-0"
                                    style={{ border: '1.5px solid rgba(255,255,255,0.1)' }}
                                >
                                    <input
                                        type="color"
                                        value={config.color}
                                        onChange={(e) => setConfig({ ...config, color: e.target.value })}
                                        className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                                        style={{ margin: '-4px' }}
                                    />
                                    <div className="absolute inset-0 rounded-[4px]" style={{ background: config.color }} />
                                </div>
                                <input
                                    type="text"
                                    value={config.color}
                                    onChange={(e) => setConfig({ ...config, color: e.target.value })}
                                    className="flex-1 uppercase font-mono"
                                    maxLength={7}
                                />
                            </div>
                        </Field>

                        {/* Alignment */}
                        <Field label="Alignment">
                            <div
                                className="grid grid-cols-3 gap-1 p-1 rounded-lg"
                                style={{ background: '#111114', border: '1px solid #222228' }}
                            >
                                {(['left', 'center', 'right'] as const).map((align) => (
                                    <button
                                        key={align}
                                        onClick={() => setConfig({ ...config, alignment: align })}
                                        className="py-1.5 rounded-md text-xs font-medium capitalize transition-all"
                                        style={
                                            config.alignment === align
                                                ? { background: '#617bff', color: '#fff' }
                                                : { background: 'transparent', color: '#4e4c58' }
                                        }
                                        onMouseEnter={(e) => {
                                            if (config.alignment !== align) {
                                                (e.currentTarget as HTMLElement).style.color = '#8f8d98'
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (config.alignment !== align) {
                                                (e.currentTarget as HTMLElement).style.color = '#4e4c58'
                                            }
                                        }}
                                    >
                                        {align}
                                    </button>
                                ))}
                            </div>
                        </Field>
                    </div>

                    {/* Footer */}
                    <div className="px-4 pb-4 flex flex-col gap-2 shrink-0" style={{ borderTop: '1px solid #1e1e22', paddingTop: '12px' }}>
                        <div className="flex gap-2">
                            <ModalBtn onClick={handleClose} variant="ghost">Cancel</ModalBtn>
                            <ModalBtn onClick={handleApply} variant="primary">Apply</ModalBtn>
                        </div>
                        {isEditing && (
                            <ModalBtn onClick={handleRemove} variant="danger">Remove Text Overlay</ModalBtn>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[10.5px] font-semibold uppercase tracking-widest" style={{ color: '#4e4c58' }}>
                {label}
            </label>
            {children}
        </div>
    )
}

type ModalBtnVariant = 'primary' | 'ghost' | 'danger'
function ModalBtn({ onClick, variant, children }: { onClick: () => void; variant: ModalBtnVariant; children: React.ReactNode }) {
    const styles: Record<ModalBtnVariant, React.CSSProperties> = {
        primary: { background: '#617bff', color: '#fff', border: '1px solid transparent' },
        ghost:   { background: '#212128', color: '#8f8d98', border: '1px solid #2d2d35' },
        danger:  { background: 'transparent', color: '#f04a6a', border: '1px solid rgba(240,74,106,0.3)' },
    }
    const hover: Record<ModalBtnVariant, React.CSSProperties> = {
        primary: { background: '#4f69f5' },
        ghost:   { background: '#28282f', color: '#eae8e5' },
        danger:  { background: 'rgba(240,74,106,0.1)', borderColor: 'rgba(240,74,106,0.5)' },
    }

    return (
        <button
            onClick={onClick}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
            style={styles[variant]}
            onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLElement).style, hover[variant])}
            onMouseLeave={(e) => Object.assign((e.currentTarget as HTMLElement).style, styles[variant])}
        >
            {children}
        </button>
    )
}

function PreviewMesh({ type, color, scale }: { type: MeshType; color: string; scale: [number, number, number] }) {
    switch (type) {
        case 'sphere':
            return <mesh scale={scale}><sphereGeometry args={[0.5, 32, 32]} /><meshStandardMaterial color={color} /></mesh>
        case 'cylinder':
            return <mesh scale={scale}><cylinderGeometry args={[0.5, 0.5, 1, 32]} /><meshStandardMaterial color={color} /></mesh>
        case 'rounded-box':
            return <RoundedBox args={[1, 1, 1]} radius={0.15} smoothness={4} scale={scale}><meshStandardMaterial color={color} /></RoundedBox>
        default:
            return <mesh scale={scale}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color={color} /></mesh>
    }
}
