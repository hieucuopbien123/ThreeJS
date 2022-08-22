// Photography
// Điều khiển camera / FirstPersonControls

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {FirstPersonControls} from 'three/examples/jsm/controls/FirstPersonControls.js';
import gsap from "gsap";

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( -1.7, 0, 8.7 );
camera.lookAt(1.7, 0, 8.7);

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;


// Load hdr lâu vl
const hdrTextureURL = new URL("../img/MR_INT-006_LoftIndustrialWindow_Griffintown.hdr", import.meta.url);
const loader = new RGBELoader();
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();
loader.load(hdrTextureURL, function(texture){
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    
    // Thay vì dùng 1 cái light cho các vật thể bên trong, ta dùng set environment là texture để mọi vật bên trong
    // mang realistic ánh sáng của môi trường
    scene.environment = texture; // tất cả mọi vật trong môi trường bị ảnh hưởng

    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1, 50, 50),
        new THREE.MeshStandardMaterial({
            roughness: 0,
            metalness: 0.5,
            color: 0x00FF00,
            // envMap: texture, // nếu chỉ object này bị ảnh hưởng bởi mt. Tức có thể diều khiển
            // mỗi mesh có 1 môi trường khác nhau
        })
    );
    scene.add(sphere);

    const sphere2 = new THREE.Mesh(
        new THREE.SphereGeometry(1, 50, 50),
        new THREE.MeshStandardMaterial({
            roughness: 0,
            metalness: 0.5,
            color: 0xFFEA00,
            envMapIntensity: 0.5,
        })
    );
    scene.add(sphere2);
    sphere2.position.x = -3

    const sphere3 = new THREE.Mesh(
        new THREE.SphereGeometry(1, 50, 50),
        new THREE.MeshPhysicalMaterial({ // MeshPhysicalMaterial kế thừa standard cung nh options hơn
            roughness: 0,
            metalness: 0,
            color: 0xFFEA00,
            transmission: 1,
            ior: 2.333, // Index-of-refraction for non-metallic materials, from 1.0 to 2.333. Default is 1.5.
            //tăng lượng khúc xạ ánh sáng thì sẽ hiển thị hình chiếu nhiều hơn
        })
    );
    scene.add(sphere3);
    sphere3.position.x = -6
});


// Điều khiển camera bằng gsap và FirstPersonControl
// let position = 0;
// const assetLoader = new GLTFLoader();
// assetLoader.load('./assets/the_king_s_hall/scene.gltf', function(gltf) {
//     const model = gltf.scene;
//     scene.add(model);

//     window.addEventListener('mouseup', function() {
//         switch(position) {
//             case 0:
//                 moveCamera(-1.8, 1.6, 5);
//                 rotateCamera(0, 0.1, 0);
//                 position = 1;
//                 break;
//             case 1:
//                 moveCamera(2.8, 0, 3.6);
//                 rotateCamera(0, -2, 0);
//                 position = 2;
//                 break;
//             case 2:
//                 moveCamera(2.5, -0.9, 12.2);
//                 rotateCamera(0.9, 0.6, -0.6);
//                 position = 3;
//                 break;
//             case 3:
//                 moveCamera(-2.7, 0.6, 3.7);
//                 rotateCamera(0.6, 1.9, -0.6);
//                 position = 4;
//                 break;
//             case 4:
//                 moveCamera(-1.7, 0, 8.7);
//                 rotateCamera(0, 4.7, 0);
//                 position = 5;
//                 break;
//             case 5:
//                 moveCamera(0.5, 0.8, 10);
//                 rotateCamera(0.3, 1.65, -0.3);
//                 position = 0;
//         }
        
//     });

//     function moveCamera(x, y, z) {
//         gsap.to(camera.position, {
//             x,
//             y,
//             z,
//             duration: 3
//         });
//     }

//     function rotateCamera(x, y, z) {
//         gsap.to(camera.rotation, {
//             x,
//             y,
//             z,
//             duration: 3.2
//         });
//     }
// });

// Dùng firstpersoncontrol để lấy vị trí các camera, dùng gsap để tự động quay
// const controls = new FirstPersonControls(camera, renderer.domElement);
// controls.movementSpeed = 8;
// controls.lookSpeed = 0.08;
// window.addEventListener("mouseup", () => {
//     console.log(camera.position);
// })


const clock = new THREE.Clock();
function animate(time) {
    // controls.update(clock.getDelta());
	renderer.render(scene, camera);
};
renderer.setAnimationLoop(animate);
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});