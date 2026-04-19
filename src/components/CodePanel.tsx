/**
 * CodePanel Component — Premium redesign
 *
 * Live JSX code panel with syntax-tinted output, export mode selector,
 * copy feedback, and a subtle resize handle.
 */

'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useSceneStore } from '@/store/scene-store'
import { generateJSX, type ExportMode } from '@/lib/export'

const MIN_H = 120
const MAX_H = 480
const DEFAULT_H = 200

export function CodePanel() {
  const objects       = useSceneStore((state) => state.objects)
  const [copied, setCopied]           = useState(false)
  const [exportMode, setExportMode]   = useState<ExportMode>('sceneOnly')
  const [panelHeight, setPanelHeight] = useState(DEFAULT_H)
  const isDragging  = useRef(false)
  const startY      = useRef(0)
  const startHeight = useRef(DEFAULT_H)

  const code     = useMemo(() => generateJSX(objects, { mode: exportMode }), [objects, exportMode])
  const filename  = exportMode === 'withCanvas' ? 'SceneCanvas.tsx' : 'Scene.tsx'
  const lineCount = code.split('\n').length

  /* ── Resize handle ── */
  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current  = true
    startY.current      = e.clientY
    startHeight.current = panelHeight
    e.preventDefault()
  }, [panelHeight])

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!isDragging.current) return
      const delta = startY.current - e.clientY
      setPanelHeight(Math.min(MAX_H, Math.max(MIN_H, startHeight.current + delta)))
    }
    const up = () => { isDragging.current = false }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [])

  /* ── Copy ── */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <section
      className="flex flex-col shrink-0"
      style={{ height: panelHeight, background: '#1b1b1f', borderTop: '1px solid #232328' }}
    >
      {/* ── Resize handle ── */}
      <div
        onMouseDown={onResizeMouseDown}
        className="h-1 shrink-0 cursor-ns-resize group transition-colors"
        style={{ background: 'transparent' }}
        title="Drag to resize"
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(97,123,255,0.35)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      />

      {/* ── Header ── */}
      <div
        className="h-9 px-3 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid #1e1e22' }}
      >
        {/* Left: label + mode selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#617bff' }} />
            <span className="text-[10.5px] font-semibold uppercase tracking-widest" style={{ color: '#4e4c58' }}>
              Export
            </span>
          </div>

          <select
            value={exportMode}
            onChange={(e) => setExportMode(e.target.value as ExportMode)}
            className="text-[11px] px-2 py-0.5"
          >
            <option value="sceneOnly">Scene Only</option>
            <option value="withLights">With Lights</option>
            <option value="withCanvas">Full Canvas</option>
          </select>
        </div>

        {/* Right: file info + copy */}
        <div className="flex items-center gap-2">
          <span className="text-[10.5px] font-mono" style={{ color: '#4e4c58' }}>
            {filename}
          </span>
          <span className="text-[10px]" style={{ color: '#333339' }}>
            {lineCount} lines
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all"
            style={
              copied
                ? { background: 'rgba(61,214,114,0.12)', color: '#3dd672', border: '1px solid rgba(61,214,114,0.25)' }
                : { background: '#212128', color: '#8f8d98', border: '1px solid #2d2d35' }
            }
            onMouseEnter={(e) => {
              if (!copied) {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'rgba(97,123,255,0.12)'
                el.style.color = '#617bff'
                el.style.borderColor = 'rgba(97,123,255,0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                const el = e.currentTarget as HTMLElement
                el.style.background = '#212128'
                el.style.color = '#8f8d98'
                el.style.borderColor = '#2d2d35'
              }
            }}
          >
            {copied ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Code area ── */}
      <div className="flex-1 overflow-auto" style={{ background: '#111114' }}>
        <pre
          className="p-4 text-[11.5px] leading-relaxed"
          style={{ fontFamily: "'Geist Mono','Fira Code','Monaco','Consolas',monospace", margin: 0 }}
        >
          <SyntaxCode code={code} />
        </pre>
      </div>
    </section>
  )
}

/* ── Lightweight syntax tinter ───────────────────────────────────────── */

function SyntaxCode({ code }: { code: string }) {
  // Tokenize line by line for basic JSX syntax coloring
  const lines = code.split('\n')

  return (
    <>
      {lines.map((line, i) => (
        <div key={i}>
          <SyntaxLine line={line} />
          {i < lines.length - 1 && '\n'}
        </div>
      ))}
    </>
  )
}

function SyntaxLine({ line }: { line: string }) {
  // Comment lines
  if (/^\s*(\/\/|\/\*|\*)/.test(line)) {
    return <span style={{ color: '#3d3b45' }}>{line}</span>
  }

  // Import/export keywords
  const importExportColor = '#b46ef5'
  if (/^\s*(import|export)\b/.test(line)) {
    return <span style={{ color: importExportColor }}>{line}</span>
  }

  // Tokenize for JSX tags, props, strings, numbers
  const tokens: { text: string; color?: string }[] = []
  let remaining = line

  // eslint-disable-next-line no-constant-condition
  while (remaining.length > 0) {
    // JSX closing tag </Foo>
    const closeTag = remaining.match(/^(<\/[\w.]+>)/)
    if (closeTag) { tokens.push({ text: closeTag[1], color: '#617bff' }); remaining = remaining.slice(closeTag[1].length); continue }

    // JSX opening tag <Foo or </Foo
    const openTag = remaining.match(/^(<[\w.]+)/)
    if (openTag) { tokens.push({ text: openTag[1], color: '#617bff' }); remaining = remaining.slice(openTag[1].length); continue }

    // Self-closing />
    const selfClose = remaining.match(/^(\/>)/)
    if (selfClose) { tokens.push({ text: selfClose[1], color: '#617bff' }); remaining = remaining.slice(selfClose[1].length); continue }

    // String values (double-quoted)
    const strMatch = remaining.match(/^("(?:[^"\\]|\\.)*")/)
    if (strMatch) { tokens.push({ text: strMatch[1], color: '#3dd672' }); remaining = remaining.slice(strMatch[1].length); continue }

    // Prop names (word followed by =)
    const propMatch = remaining.match(/^(\w+)(=)/)
    if (propMatch) {
      tokens.push({ text: propMatch[1], color: '#f5a623' })
      tokens.push({ text: '=', color: '#5c5a65' })
      remaining = remaining.slice(propMatch[0].length)
      continue
    }

    // Numbers
    const numMatch = remaining.match(/^(-?\d+\.?\d*)/)
    if (numMatch) { tokens.push({ text: numMatch[1], color: '#f05672' }); remaining = remaining.slice(numMatch[1].length); continue }

    // Keywords
    const kwMatch = remaining.match(/^(function|return|const|let|var|export|import|from|default|if|else|null|undefined|true|false)\b/)
    if (kwMatch) { tokens.push({ text: kwMatch[1], color: '#b46ef5' }); remaining = remaining.slice(kwMatch[1].length); continue }

    // Fallback: one char
    tokens.push({ text: remaining[0], color: undefined })
    remaining = remaining.slice(1)
  }

  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} style={{ color: t.color ?? '#8f8d98' }}>{t.text}</span>
      ))}
    </>
  )
}
