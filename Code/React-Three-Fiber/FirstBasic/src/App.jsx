// import { Html } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import "./App.css";
import Three from "./component/three";

function App() {
  return (
    <Canvas id="three-canvas-container" shadows>

      {/* <Html>
        <div>Hello</div>
      </Html> */}

      <Suspense fallback={null}>
        <Three />
      </Suspense>
    </Canvas>
  )
}

export default App
