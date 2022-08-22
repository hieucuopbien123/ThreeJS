import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import WebGL from "./WebGL";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import iceTexture from "./img/ice.jpg";

const ThreeScene = () => {
    const cubeRef = useRef(null);
    const controls = useRef(null);
    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            cubeRef.current.clientWidth / cubeRef.current.clientHeight,
            0.1,
            1000
        );

        const texture = new THREE.TextureLoader().load(iceTexture);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        const hemiLight = new THREE.HemisphereLight("#afe273", "#f4dcc6", 0.5);
        const dirLight = new THREE.DirectionalLight("#ce7c5f", 1.4);
        dirLight.position.set(1, 1, 1);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(cubeRef.current.clientWidth, cubeRef.current.clientHeight);
        cubeRef.current.appendChild(renderer.domElement);
        
        const orbit = new OrbitControls(camera, renderer.domElement);
        orbit.enablePan = false;
        orbit.maxDistance = 10;
        orbit.enableDamping = true;
        orbit.update();
        orbit.minDistance = 1.5;
    
        const geometry = new THREE.BoxGeometry(1, 1);
        const material = new THREE.MeshPhongMaterial({ // MeshPhongMaterial dùng cho shiny surfaces
            map: texture,
            reflectivity: 1 // mức độ ảnh hưởng của môi trường tới độ bóng 0->1
        });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube, hemiLight, dirLight);
        
        camera.position.z = 5;
        
        var animate = function () {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
        };
        
        if ( WebGL.isWebGLAvailable() ) {
            animate();
        } else {
            const warning = WebGL.getWebGLErrorMessage();
            document.getElementById( 'body' ).appendChild( warning );
        }

        var increaseCubeSize = (incrementValue) => {
            cube.scale.x += incrementValue;
            cube.scale.y += incrementValue;
            cube.scale.z += incrementValue;
        };
        var decreaseCubeSize = (decrementValue) => {
            cube.scale.x -= decrementValue;
            cube.scale.y -= decrementValue;
            cube.scale.z -= decrementValue;
        };

        window.addEventListener('resize', function() {
            camera.aspect = cubeRef.current.clientWidth / cubeRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(cubeRef.current.clientWidth, cubeRef.current.clientHeight);
        });
        
        controls.current = { increaseCubeSize, decreaseCubeSize };
    }, []);
    
    return (
        <>
            <button onClick={() => {controls.current.increaseCubeSize(1);}}>Increase Size</button>
            <button onClick={() => {controls.current.decreaseCubeSize(1);}}>Decrease Size</button>
            <div ref={cubeRef} style={{ width: "50%", height: "450px", margin: "0 auto" }}></div>
        </>
    );
};

export default ThreeScene;