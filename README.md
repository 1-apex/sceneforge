# SceneForge Editor

SceneForge is an open-source, browser-based 3D scene editor for React developers.

It allows you to visually design simple 3D scenes and export clean, editable React Three Fiber JSX — without touching Blender or writing transforms by hand.

---

## Why SceneForge?

3D on the web often feels disconnected from how frontend developers actually work.

- Visual tools don’t generate usable code
- Code-first workflows are slow and error-prone
- Existing editors are either too simple or too complex

SceneForge sits in the middle.

---

## What SceneForge is

- A **design-time helper** for React Three Fiber
- A visual way to place and configure basic 3D objects
- A deterministic JSX exporter

---

## What SceneForge is NOT

- A game engine
- A full 3D modeling tool
- A runtime dependency for your app

The output is **plain React code**.  
You own it. You can modify it. No lock-in.

---

## Current Features

- 3D viewport with grid and axes
- Primitive objects (box, sphere, cylinder)
- Transform controls (move, rotate, scale)
- Inspector panel for numeric editing
- Scene tree
- Live JSX export

---

## Example Output

```tsx
export function Scene() {
  return (
    <>
      <mesh position={[0, 0, 0]}>
        <boxGeometry />
        <meshStandardMaterial color="#4a90d9" />
      </mesh>
    </>
  )
}

```

---

## Contributing

SceneForge is early-stage and intentionally small in scope.

Contributions are welcome, especially around:
- UX improvements
- Code clarity and maintainability
- Bug fixes and editor stability

If you’re planning to add new features or larger changes, please open an issue first to discuss the direction.  
This helps keep the project focused and aligned with its original goal.

At this stage, SceneForge prioritizes:
- Simplicity over feature breadth
- Readable JSX output over abstraction
- Developer workflow over power-user complexity
