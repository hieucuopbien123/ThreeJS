import { Html, useProgress } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import "./App.css";
import Three from "./component/three";

function Loader() {
  const { active, progress, errors, item, loaded, total } = useProgress();
  return <Html center>{progress} % loaded</Html>
}

function App() {
  const [action, setAction] = useState("Idle_2");
  return (
    <>
      <div style={{position: "absolute", zIndex: 10}}>
        <button>Run</button>
        <button onClick={() => setAction("Death")}>Death</button>
        <button onClick={() => setAction("Idle_2")}>Idle</button>
      </div>
      <Canvas id="three-canvas-container" shadows>
        {/* <Html>
          <div>Hello</div>
        </Html> */}

        {/* # Tải và dùng model / Xử lý loading */}
        <Suspense fallback={<Loader />}>
          <Three action={action}/>
        </Suspense>
      </Canvas>
    </>
  )
}

export default App
