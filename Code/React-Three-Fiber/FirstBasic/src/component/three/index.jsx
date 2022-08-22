import { PerspectiveCamera, OrbitControls, Environment, useTexture, Html, Stars } from "@react-three/drei";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import {Model} from "./Scene";
import {Stag} from "./Stag";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
// import DatGui, { DatColor } from 'react-dat-gui';

const hdrTextureURL = new URL("./models/MR_INT-006_LoftIndustrialWindow_Griffintown.hdr", import.meta.url);

import metal from "../../assets/ice.jpg";

function Box(props) {
    const [active, setActive] = useState(false);
    const mesh = useRef();
    useFrame(() => (
        mesh.current.rotation.x = mesh.current.rotation.y += 0.01
    ));
    const base = useMemo(() => new THREE.TextureLoader().load(metal), []);

    return (
        <mesh {...props} ref={mesh} scale={active ? [0.5, 0.5, 0.5] : [0.2, 0.2, 0.2]} onClick={e => setActive(!active)}>
            <boxGeometry args={[3, 3, 3]} />

            {/* k hiểu thuộc tính attach nhưng cứ cho vào thôi */}
            {/* <meshBasicMaterial attach="material" color={"lightblue"} map={base} /> */}
            
            <meshBasicMaterial attach="material" color={"lightblue"}>
                {/* Ta có thể dùng primity cho vc hiển thị texture gì bằng cách nhét vào object.
                Chỉ cần biết attach map dùng cho TH này thì bề mặt box sẽ mang texture */}
                <primitive attach="map" object={base} />
            </meshBasicMaterial>
        </mesh>
    );
}

function Sphere(props) {
    const mesh = useRef();
    useFrame(() => (
        mesh.current.rotation.x = mesh.current.rotation.y += 0.01
    ));
    const base = useMemo(() => new THREE.TextureLoader().load(metal));

    return (
        <mesh {...props} ref={mesh} scale>
            <sphereGeometry args={[3, 20, 20]} />
            <meshBasicMaterial attach="material" color={"lightblue"} map={base} />
        </mesh>
    );
}

const Three = () => {
    // const [colorMappingTexture, displacementMapTexture] = useTexture(<>); // truyền url vào đây để nó lấy mọi thứ
    // từ cái texture đó xong có thể truyền tiếp các biến số này vào các thuộc tính map của component material

    // Khi load file từ trong thư mục public luôn
    // const gltf = useLoader(GLTFLoader, "/models/car/scene.gltf");

    // Load dùng DRACOLoader
    // const gltf = useLoader(GLTFLoader, "/models/scene-transformed.glb", loader => {
    //     const dracoLoader = new DRACOLoader();
    //     dracoLoader.setDecoderPath('/draco/');
    //     loader.setDRACOLoader(dracoLoader);
    // })

    // K nên load bằng useEffect như three nx mà dùng component bth
    // const { scene } = useThree(); // cho dùng scene global nè
    // const loader = new RGBELoader();
    // useEffect(() => {
    //     loader.load(
    //         hdrTextureURL.href,
    //         texture => {
    //             texture.mapping = THREE.EquirectangularReflectionMapping;
    //             scene.environment = texture;
    //             scene.background = texture;
    //         }
    //     )
    // }, []);
    
    const ballRef = useRef(null);
    const orbitControlsRef = useRef(null);
    const planeRef = useRef(null);

    useFrame((state) => {
        if(orbitControlsRef.current){
            const { x, y } = state.mouse; // x, y chạy từ -1 đến 1
            orbitControlsRef.current.setPolarAngle((1-y)*Math.PI/3.5);
            orbitControlsRef.current.setAzimuthalAngle(-x * Math.PI / 2);
            orbitControlsRef.current.update();
        }
    });

    useEffect(() => {
        if(orbitControlsRef.current){
            console.log(orbitControlsRef.current);
        }
    }, [orbitControlsRef.current]);

    useEffect(() => {
        if(ballRef.current){
            console.log(ballRef.current);
            const timeline = gsap.timeline();
            timeline.to(ballRef.current.position, { // có cả fromTo và from
                x: 1,
                duration: 2,
                ease: "power2.out"
            }, "")
            .to(ballRef.current.position, {
                y: 0.5,
                duration: 0.75,
                ease: "bounce.out"
            }, "<");
        }
    }, [ballRef.current]);

    // const [opts, setOpts] = useState({
    //     color: "#2485f7",
    // });

    return (
        <>
            {/* <Html>
                <DatGui data={opts} onUpdate={setOpts}>
                    <DatColor path='color' label='Color for plane' />
                </DatGui>
            </Html> */}

            {/* <Box position={[1, 1, 1]}/> */}
            {/* <Sphere scale={0.2} position={[1, 1, 1]}/> */}

            {/* Cứ bao bằng 1 khối cầu thật lớn là được */}
            <Stars/>

            <PerspectiveCamera makeDefault position={[0, 2, 6]} />
            <OrbitControls ref={orbitControlsRef} minPolarAngle={Math.PI/18} />

            <mesh position={[-2, 2.5, 0]} castShadow ref={ballRef}>
                <sphereGeometry args={[0.5, 32, 32]}/>
                <meshStandardMaterial metalness={0.6} roughness={0.2} color={"#ffffff"} envMapIntensity={0.01}/>
            </mesh>

            {/* Khi dùng load trực tiếp từ model 3d  */}
            {/* <primitive object={gltf.scene} /> */}

            {/* Dùng component jsx của 3d model */}
            {/* <Model scale={0.8} position={[0, 0, -2]} rotation={[0, -Math.PI/4, 0]}/> */}

            <Stag />

            <mesh rotation={[-Math.PI*0.5, 0, 0]} receiveShadow ref={planeRef}>
                <planeGeometry args={[10, 10]}/>
                <meshStandardMaterial color={"#2485f7"} roughness={1} metalness={0} side={THREE.DoubleSide} envMap={null}/>
            </mesh>

            <ambientLight args={["#ffffff", 0.25]}/>

            <spotLight args={["#ffffff", 2, 7, Math.PI/4, 0.4]} position={[-3, 1, 0]} castShadow />

            {/* Set environment */}
            <Environment files={hdrTextureURL.href} />
            
            {/* Set background */}
            <Environment background={"only"}>
                <mesh>
                    {/* Set kích thước cực lớn cho cầu để kbh ra ngoài dược */}
                    <sphereGeometry args={[50, 100, 100]}/>
                    <meshBasicMaterial color={"#2266cc"} 
                        side={THREE.BackSide} 
                        /* Double Side cũng được, ý là nó nằm trong hình cầu thì phải thế ms nhìn được */
                    />
                </mesh>
            </Environment>
        </>
    );
};

export default Three;
