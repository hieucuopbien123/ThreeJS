import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { softShadows, MeshWobbleMaterial, OrbitControls } from "@react-three/drei";
import "./App.scss";
import * as THREE from "three";

import { useSpring, a } from "@react-spring/three";

// import { Box } from "@react-three/drei";

// soft Shadows
softShadows();

const SpinningBox = (props) => {
  const mesh = useRef();
  useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01));

  const [expand, setExpand] = useState(false);
  
  // # react-spring
  // Basic animation
  // const animationProps = useSpring({
  //   scale: expand ? [1.4, 1.4, 1.4] : [1, 1, 1],
  // });

  // Sequent animation
  const animationProps = useSpring({
    to: async(next) => {
      await next({ scale: expand ? [1.4, 1.4, 1.4] : [1, 1, 1] })
      await next({ scale: expand ? [2, 2, 2] : [1, 1, 1] })
    },
    from: { scale: [1, 1, 1] },
    config: {
      // duration: 1000, // mỗi lần animate kéo dài 1s, next cx chạy 1s
    }
  })

  return (
    <a.mesh position={props.position} ref={mesh} castShadow
      onClick={() => setExpand(!expand)} scale={animationProps.scale}
    >
      <boxBufferGeometry attach='geometry' args={props.args} />
      <MeshWobbleMaterial color={props.color} attach='material'
        speed={props.speed || 6} factor={0.6} // tốc độ và hệ số cường độ
      />
    </a.mesh>

    // drei cung sẵn các component của three
    // <Box {...props} ref={mesh} castShadow>
    //   <MeshWobbleMaterial
    //     {...props}
    //     attach='material'
    //     factor={0.6}
    //     Speed={1}
    //   />
    // </Box>
  );
};

const Header = () => {
  return (
    <header>
      <div className='logo'>
        <span>REACT THREE FIBER</span>
      </div>
    </header>
  ); 
};

// Chỉ cần 3 animation là: xoay, đi lên xuống, scale co dãn điều hòa 
// => tách thành 3 animation r nhét vào useFrame là được
// Xoay thì ta xoay cả group, nó tự cho xoay quanh tâm ok
// Đi lên xuống và co dãn ta chỉ cần làm với trục y là đủ
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);

function Sphere({ position = [0, 0, 0], ...props }) {
  const ref = useRef();

  // # Basic / Animation
  // Tạo sô random cho từng sphere
  const factor = useMemo(() => 0.5 + Math.random(), [])

  // Cơ chế rất đơn giản: ta cần animate cho position.y và scale.y thì cộng nó với 1 số biến thiên từ -t đến t 
  // là nó điều hòa theo tg ngay. Ta có thể nhân với 1 số VD *4 để có khoảng lớn hơn.
  // Vấn đề là tạo số t dao động điều hòa với từng sphere khác nhau thì cường độ khác nhau. Có thể dùng
  // t = sin(random*thời gian trôi qua) với số random fix với từng sphere là xong. Nhưng ta có thể làm nó phức 
  // tạp hơn VD 1 số sphere có cường độ này, 1 số sphere có cường độ hoàn toàn khác bằng cách dùng đk if else như 
  // easeInOutCubic bên trên để chia đôi 1 nửa có 2 pt hoàn toàn khác. Xong ta cộng với 1 số nếu muốn dịch offset
  // 1 khoảng hoặc nhân với 1 số nếu muốn phóng to khoảng lớn hơn

  useFrame((state) => {
    // Chỉnh animation cho đi lên xuống và scale
    const t = easeInOutCubic((1 + Math.sin(state.clock.getElapsedTime() * factor)) / 2);
    ref.current.position.y = position[1] + t * 4;
    ref.current.scale.y = 1 + t * 3;
  })
  return (
    <mesh ref={ref} position={position} {...props} castShadow receiveShadow>
      <sphereBufferGeometry attach="geometry" args={[0.5, 32, 32]} />
      <meshStandardMaterial attach="material" color="lightblue" roughness={0} metalness={0.1} />
    </mesh>
  )
}

function Spheres({ number = 20 }) {
  const ref = useRef()

  // Cơ chế là ta tạo array các position r chạy loop tạo từng sphere 1 ở từng vị trí thôi
  // khi ta cần animation với set các phần tử thì nên cho vào group r animate cái group là được
  const positions = useMemo(
    () => [...new Array(number)].map(() => [3 - Math.random() * 6, Math.random() * 4, 3 - Math.random() * 6])
  , []);

  // Tạo animation xoay
  useFrame((state) => (ref.current.rotation.y = Math.sin(state.clock.getElapsedTime() / 2) * Math.PI));

  return (
    <group ref={ref}>
      {positions.map((pos, index) => (
        <Sphere key={index} position={pos} />
      ))}
    </group>
  )
}

// # Basic
const App = () => {
  return (
    <>
      <Header />

      {/* set up option cho renderer */}
      <Canvas onCreated={({ gl }) => { gl.toneMapping = THREE.NoToneMapping }} linear
        // chỉnh cam có sẵn của canvas
        camera={{ position: [-5, 2, 10], fov: 60 }} shadows
      >
        <ambientLight intensity={0.3} />
        {/* Thêm ánh sáng ở các mặt khác */}
        <pointLight position={[-10, 0, -20]} intensity={0.5} />
        <pointLight position={[0, -10, 0]} intensity={1.5} />
        <directionalLight
          castShadow
          position={[0, 10, 0]}
          intensity={1.5}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
            <planeBufferGeometry attach='geometry' args={[100, 100]} />
            {/* Trong drei có sẵn shadowMaterial vô hình chỉ chuyên cast bóng thôi */}
            <shadowMaterial attach='material' opacity={0.3} />
          </mesh>
          <SpinningBox position={[0, 1, 0]} color='lightblue' args={[3, 2, 1]} speed={2}/>
          <SpinningBox position={[-2, 1, -5]} color='pink' />
          <SpinningBox position={[5, 1, -2]} color='pink' />
        </group>
        <OrbitControls />
      </Canvas>

      <hr/>

      <Canvas shadows camera={{ position: [-5, 2, 10], fov: 60 }}>
        <fog attach="fog" args={["white", 0, 40]} />
        <ambientLight intensity={0.4} />
        <directionalLight
          castShadow
          position={[2.5, 8, 5]}
          intensity={1.5}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-10, 0, -20]} color="red" intensity={2.5} />
        <pointLight position={[0, -10, 0]} intensity={1.5} />
        <group position={[0, -3.5, 0]}>
          <mesh receiveShadow castShadow>
            <boxBufferGeometry attach="geometry" args={[4, 1, 1]} />
            <meshStandardMaterial attach="material" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
            <planeBufferGeometry attach="geometry" args={[100, 100]} />
            <shadowMaterial attach="material" transparent opacity={0.4} />
          </mesh>
          <Spheres />
          <OrbitControls />
        </group>
      </Canvas>
    </>
  );
};

export default App;