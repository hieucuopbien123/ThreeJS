// Dùng yuka / Interpose Steering Behavior

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
camera.position.set( 10, 10, 10 );
camera.lookAt( 10, 0, 10 );
const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight();
scene.add(directionalLight);
directionalLight.position.set(0, 10, 10);

const vehicleGeo = new THREE.ConeBufferGeometry(0.2, 1, 8);
const vehicleMesh = new THREE.Mesh(
    vehicleGeo,
    new THREE.MeshNormalMaterial(),
)
scene.add(vehicleMesh);
vehicleGeo.rotateX(Math.PI*0.5);

function sync(entity, renderComponent){
    renderComponent.matrix.copy(entity.worldMatrix);
}
const vehicle = new YUKA.Vehicle();

vehicleMesh.matrixAutoUpdate = false; 
vehicle.setRenderComponent(vehicleMesh, sync);
vehicle.maxSpeed = 3;

const entityManager = new YUKA.EntityManager();
entityManager.add(vehicle);

const sphere1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5),
    new THREE.MeshPhongMaterial({color: 0xFFEA00})
);
scene.add(sphere1);
const sphere2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5),
    new THREE.MeshPhongMaterial({color: 0xFFEA00})
);
scene.add(sphere2);

sphere1.matrixAutoUpdate = false;
sphere2.matrixAutoUpdate = false;
const vehicle1 = new YUKA.Vehicle();
vehicle1.setRenderComponent(sphere1, sync);
const vehicle2 = new YUKA.Vehicle();
vehicle2.setRenderComponent(sphere2, sync);
entityManager.add(vehicle1);
entityManager.add(vehicle2);

const target1 = new YUKA.Vector3();
entityManager.add(target1); 
const target2 = new YUKA.Vector3();
entityManager.add(target2); 

const seekBehavior1 = new YUKA.SeekBehavior(target1); // dùng entity khi cần hiển thị ra, k thì vector thôi
const seekBehavior2 = new YUKA.SeekBehavior(target2);
vehicle1.steering.add(seekBehavior1);
vehicle2.steering.add(seekBehavior2);
vehicle1.maxSpeed = 3;
vehicle2.maxSpeed = 3;

const interposeBehavior = new YUKA.InterposeBehavior(vehicle1, vehicle2);
vehicle.steering.add(interposeBehavior);

// Cứ tạo ra hình r set position sau trong animate
const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, 1, 1)
])
const lineMaterial = new THREE.LineBasicMaterial({color: 0xFFFFFF});
const line = new THREE.Line(lineGeometry, lineMaterial);
scene.add(line);

const time = new YUKA.Time();
function animate() {
    const elapsed = time.getElapsed();

    //Phương trình trông chả có ý nghĩa gì, chắc phải vẽ ra 3d mới thấy
    target1.x = Math.cos(elapsed*0.1)*Math.sin(elapsed*0.1)*6; // -6  +6
    target1.z = Math.sin(elapsed*0.3)*6;  // -6  +6
    target2.x = 1 + Math.cos(elapsed*0.5)*Math.sin(elapsed*0.3)*4; // -3 5
    target2.z = 1 + Math.sin(elapsed*0.3)*6; // -5 6

    const positionAttribute = line.geometry.attributes.position;
    const position = vehicle1.position;
    positionAttribute.setXYZ(0, position.x, position.y, position.z);
    const position2 = vehicle2.position;
    positionAttribute.setXYZ(1, position2.x, position2.y, position2.z);
    positionAttribute.needsUpdate = true;

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