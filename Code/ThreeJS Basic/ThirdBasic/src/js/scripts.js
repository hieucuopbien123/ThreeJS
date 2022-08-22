// Basic
// Load assets / Load ảnh vào 6 mặt vào 1 cube box và load module nhỏ

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";

import stars from "../img/stars.jpg";
import nebula from "../img/nebula.jpg";

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

// Cú pháp import 3d model khác vì parcel bundle theo cách khác ảnh bth
const monkeyUrl = new URL("../model/monkey.glb", import.meta.url); 
// Đối số 2 là base là từ file này đổ relative đi vào đối số 1
const dogUrl = new URL("../model/dog.glb", import.meta.url); 
const testAnimationUrl = new URL("../model/testAnimation.glb", import.meta.url);

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/innerHeight, 0.1, 1000);
camera.position.set(-10, 5, 10);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

/*
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
scene.add(directionalLight);
directionalLight.position.set(-30, 50, 0);

// Gọi helper sau khi set hết các thuộc tính của directionalLight r
const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
scene.add(dLightHelper);

directionalLight.shadow.camera.bottom = -12; // Chỉnh camera shadow để hiện đủ bóng
directionalLight.castShadow = true;
const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(dLightShadowHelper);
*/
const spotLight = new THREE.SpotLight(0xFFFFFF);
scene.add(spotLight);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.2; // fix pixel shadow của spotlight

const sLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(sLightHelper);

const axesHelper = new THREE.AxesHelper(20); // x đỏ, y xanh
scene.add(axesHelper);

const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00});
const box = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide // 2 mặt đều có màu
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane)
plane.rotation.x = -0.5 * Math.PI; // chơi radian
plane.receiveShadow = true;

const sphereGeometry = new THREE.SphereGeometry(4, 50, 5);
const sphereMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x0000FF,
    wireframe: true
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

const sphereGeometry2 = new THREE.SphereGeometry(2);
const sphereMaterial2 = new THREE.MeshStandardMaterial({
    // Standard hay MeshLambertMaterial phải set light mới có màu, nếu k sẽ chỉ hiện màu đen là lỗi
    color: 0x0000FF,
    wireframe: false
});
const sphere2 = new THREE.Mesh(sphereGeometry2, sphereMaterial2);
scene.add(sphere2);
sphere2.position.set(-10, 10, 0);
sphere2.castShadow = true;

const gridHelper = new THREE.GridHelper(30, 10);
scene.add(gridHelper);

// scene.fog = new THREE.Fog(0xFFFFFF, 0, 200);
scene.fog = new THREE.FogExp2(0xFFFFFF, 0.01); // TH này fog tăng density exponentially tùy độ xa của cam

const textureLoader = new THREE.TextureLoader();
// scene.background = textureLoader.load(stars); // background chỉ 1 ảnh
const cubeTextureLoader = new THREE.CubeTextureLoader(); // background đủ 6 mặt
scene.background = cubeTextureLoader.load([ nebula, nebula, stars, stars, stars, stars ]);

const box2Geometry = new THREE.BoxGeometry(4, 4, 4);
// // Box 6 mặt cùng ảnh
// const box2Material = new THREE.MeshBasicMaterial({
//     color: 0x00FF00,
//     map: textureLoader.load(nebula)
// });
// const box2 = new THREE.Mesh(box2Geometry, box2Material);
// box2.material.map = textureLoader.load(nebula);

// Để mỗi mặt có hình khác nhau, phải create texture cho mỗi material cho mỗi mặt
const box2MultiMaterial = [
    new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }),
    new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }),
    new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }),
    new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }),
    new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }),
    new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }),
];
const box2 = new THREE.Mesh(box2Geometry, box2MultiMaterial);

scene.add(box2);
box2.position.set(0, 15, 10);

const gui = new dat.GUI();
const options = {
    sphereColor: "#FFEA00",
    wireframe: false,
    speed: 0.01,
    angle: 0.2,
    penumbra: 0,
    intensity: 1
}
gui.addColor(options, "sphereColor").onChange(e => { // Bảng màu
    sphere.material.color.set(e);
});
gui.add(options, "wireframe").onChange(e => { // Check box true false
    sphere.material.wireframe = e;
})
gui.add(options, "speed", 0, 0.1); // Range slider
gui.add(options, "angle", 0, 1);
gui.add(options, "penumbra", 0, 1);
gui.add(options, "intensity", 0, 1);

const plane2Geometry = new THREE.PlaneGeometry(10, 10, 10, 10);
const plane2Material = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    wireframe: true
});
const plane2 = new THREE.Mesh(plane2Geometry, plane2Material);
scene.add(plane2);
plane2.position.set(10, 10, 15);

// Đổi tọa độ điểm đều tiên
plane2.geometry.attributes.position.array[0] -= 10 * Math.random();
plane2.geometry.attributes.position.array[1] -= 10 * Math.random();
plane2.geometry.attributes.position.array[2] -= 10 * Math.random();
const lastPointZ = plane2.geometry.attributes.position.array.length - 1;
// Đổi trục z tọa độ điểm cuối cùng
plane2.geometry.attributes.position.array[lastPointZ] -= 10 * Math.random();


// Ngôn ngữ GLSL ES

// Nhúng code GLSL ES vào app code để tương tác với GPU qua WebGL lib dạng string
const sphere3Geometry = new THREE.SphereGeometry(4);
// const vShader = `
//     void main() {
//         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//     }
// `;
// const fShader = `
//     void main() {
//         gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0);
//     }
// `;
// Dùng thẻ script 
const sphere3Material = new THREE.ShaderMaterial({
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
    wireframe: true
})
const sphere3 = new THREE.Mesh(sphere3Geometry, sphere3Material);
scene.add(sphere3);
sphere3.position.set(-5, 10, 10);


// Load assets 
const assetLoader = new GLTFLoader();
assetLoader.load(monkeyUrl.href, function(gltf) {
    const model = gltf.scene;
    scene.add(model);
    model.position.set(-12, 4, 10);
}, undefined, function(error) { // đối số 2 là xử lý progress trong quá trình load process thì ở đây ta k làm gì cả
    console.error(error);
});

let mixer;
assetLoader.load(dogUrl.href, function(gltf) {
    const model = gltf.scene;
    scene.add(model);
    model.position.set(-12, 4, 20);
    mixer = new THREE.AnimationMixer(model); // Biến chạy animation dùng cho đối tượng model

    const clips = gltf.animations; // lấy các animation của đói tượng model

    // Chạy 1 animation xác định tên là test(xem trong threejs editor)
    // const clip = THREE.AnimationClip.findByName(clips, "test"); 
    // const action = mixer.clipAction(clip); // lấy action từ clip và gắn vào timeline
    // action.play(); // kích hoạt chạy action trên timeline(khởi tạo đang là 0)

    // Chạy tất cả animation cùng lúc
    clips.forEach(function(clip) {
        const action = mixer.clipAction(clip);
        action.play();
    });
}, undefined, function(error) {
    console.error(error);
});

let mixer2;
assetLoader.load(testAnimationUrl.href, function(gltf) {
    const model = gltf.scene;
    scene.add(model);
    model.position.set(-12, 2, 5);
    mixer2 = new THREE.AnimationMixer(model);
    const clips = gltf.animations;
    const clip = THREE.AnimationClip.findByName(clips, "CubeAction");

    // Có thể dùng animation của model này chạy cho model khác. Dùng mixer gắn với model này, gọi clipAction 
    // bắt cái animation của model kia là xong
    // const action = mixer.clipAction(clip); 

    // Chạy độc lập
    const action = mixer2.clipAction(clip);

    action.play(); 
}, undefined, function(error) {
    console.error(error);
});


// Basic
const rayCaster = new THREE.Raycaster();
box2.name = "thebox";
const mousePosition = new THREE.Vector2();
window.addEventListener("mousemove", function(e) {
    mousePosition.x = (e.clientX / window.innerWidth)*2 - 1; // Phải chuyển position về normalized value
    mousePosition.y = - (e.clientY / window.innerHeight)*2 + 1;
})

const clock = new THREE.Clock();
const clock2 = new THREE.Clock();

let step = 0;
function animate(time) {
    if(mixer) { // fix lỗi
        mixer.update(clock.getDelta());
    }
    if(mixer2){
        mixer2.update(clock2.getDelta());
    }

    box.rotation.x = time/1000;
    box.rotation.y = time/1000;

    // update khi dat.gui đổi
    step += options.speed;
    sphere2.position.y = 10*Math.abs(Math.sin(step));

    spotLight.angle = options.angle;
    spotLight.penumbra = options.penumbra;
    spotLight.intensity = options.intensity;
    sLightHelper.update(); // phải update lại helper khi sửa

    // Check chuột
    rayCaster.setFromCamera(mousePosition, camera);
    const intersects = rayCaster.intersectObjects(scene.children);
    // console.log(intersects);

    for(let i = 0; i < intersects.length; i++){
        // dùng id
        if(intersects[i].object.id === sphere.id)
            intersects[i].object.material.color.set(0xFF0000);
        // dùng name
        if(intersects[i].object.name === box2.name){
            intersects[i].object.rotation.x = time/1000;
            intersects[i].object.rotation.y = time/1000;
        }
    }

    // Animate hình dạng của plane
    plane2.geometry.attributes.position.array[0] = 10 * Math.random();
    plane2.geometry.attributes.position.array[1] = 10 * Math.random();
    plane2.geometry.attributes.position.array[2] = 10 * Math.random();
    plane2.geometry.attributes.position.array[lastPointZ] = 10 * Math.random();
    plane2.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
renderer.setClearColor(0xFFEA00); // or set scene.background

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // update camera với map với màn hình
    renderer.setSize(window.innerWidth, window.innerHeight);
});

/* 
// Giảm FPS của ứng dụng 

// Dùng JS thuần, k ổn vì lag vl
// function animate() {
//     setTimeout( function() {
//         requestAnimationFrame( animate );
//     }, 1000 / 30 );
//     renderer.render();
// }

// Có thể dùng var now, delta, then = Date.now(); làm tương tự bằng JS thuần

// Nên dùng threejs:
let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 30; // là 30 fps

function animate() {
    requestAnimationFrame(animate);
    delta += clock.getDelta();
    if (delta > interval) {
        // The draw or time dependent code are here. Ở đây nó xử lý là delta cứ cộng dần
        // lên theo thời gian đến khi lớn hơn 1/30 giây thì mới render ra 1 frame tức fps = 30
        delta = delta % interval;
    }
}

*/