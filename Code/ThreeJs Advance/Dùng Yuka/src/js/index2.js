// Dùng yuka / Seek steering behavior

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as YUKA from "yuka";

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xA3A3A3);
document.body.appendChild( renderer.domElement );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();
camera.position.set( 0, 5, 10 );
camera.lookAt( 0, 0, 0 );

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
scene.add(directionalLight);

// Tạo physical body
const vehicleGeo = new THREE.ConeBufferGeometry(0.2, 1, 8);
vehicleGeo.rotateX(Math.PI*0.5);
const vehicleMesh = new THREE.Mesh(
    vehicleGeo,
    new THREE.MeshNormalMaterial(),
)
vehicleMesh.matrixAutoUpdate = false;
scene.add(vehicleMesh);

// Tạo soul
const vehicle = new YUKA.Vehicle();
vehicle.setRenderComponent(vehicleMesh, sync);
function sync(entity, renderComponent){
    renderComponent.matrix.copy(entity.worldMatrix);
}

// Tạo EntityManager quản lý update các state của object
const entityManager = new YUKA.EntityManager();
entityManager.add(vehicle);

// Tạo target
const targetGeometry = new THREE.SphereGeometry(0.1);
const targetMaterial = new THREE.MeshPhongMaterial({color: 0xFFEA00});
const targetMesh = new THREE.Mesh(targetGeometry, targetMaterial);
targetMesh.matrixAutoUpdate = false; // toàn quên cái này, buộc có
scene.add(targetMesh);

const target = new YUKA.GameEntity();
target.setRenderComponent(targetMesh, sync);
entityManager.add(target); // nhớ phải add nó cho entity manager mới thao tác với các state của nó được

// Dùng thuật toán
const seekBehavior = new YUKA.SeekBehavior(target.position);

vehicle.steering.add(seekBehavior);
vehicle.maxSpeed = 3;

setInterval(function(){
    const x = Math.random() * 3;
    const y = Math.random() * 3;
    const z = Math.random() * 3;

    target.position.set(x, y, z);
}, 2000);


const time = new YUKA.Time();
function animate() {
    const delta = time.update().getDelta();
    entityManager.update(delta);
	renderer.render(scene, camera);
};
renderer.setAnimationLoop(animate);
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});