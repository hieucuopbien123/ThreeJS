// Ngôn ngữ GLSL ES

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import nebula from "../img/nebula.jpg";

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/innerHeight, 0.1, 1000);
camera.position.set(-10, 5, 10);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper);

const uniforms = {
    u_time: { type: "f", value: 0.0 }, 
    // Attribute type là optional, ta truyền là "float" or bỏ đi cx được, khuyển khích là nên dùng
    // Bên shader sẽ tự bắt u_time.value
    u_resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth, window.innerHeight)
                                .multiplyScalar(window.devicePixelRatio)}, 
    // Lấy resolution màn hình: nhân với devicePixelRatio giúp hiển thị tốt hơn trên màn hình có dpi cao
    u_mouse: { type: "v2", value: new THREE.Vector2(0.0, 0.0)},
    image: { type: "t", value: new THREE.TextureLoader().load(nebula)}
};

window.addEventListener("mousemove", function(e) {
    uniforms.u_mouse.value.set(e.screenX / this.window.innerWidth, 1 - e.screenY / this.window.innerHeight);
})

const planeGeometry = new THREE.PlaneGeometry(4, 4, 30, 30);
const planeMaterial = new THREE.ShaderMaterial({
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
    wireframe: false, // Để thấy animation của vertex-shader
    uniforms // Phải truyền vào biến uniforms mới dùng được nó khi render object này
})
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.position.set(0,0,0);

const clock = new THREE.Clock();
function animate() {
    uniforms.u_time.value = clock.getElapsedTime();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

