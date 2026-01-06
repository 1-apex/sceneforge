/**
 * SceneForge - Main Application Page
 *
 * Layout Structure:
 * ┌─────────────────────────────────────────────────┐
 * │                    Top Bar                      │
 * ├─────────┬───────────────────────────┬───────────┤
 * │  Scene  │                           │           │
 * │  Tree   │       3D Viewport         │ Inspector │
 * │         │                           │           │
 * ├─────────┴───────────────────────────┴───────────┤
 * │              Live JSX Code Panel                │
 * └─────────────────────────────────────────────────┘
 */

import { Editor } from '@/components/Editor'

export default function Home() {
  return <Editor />
}
