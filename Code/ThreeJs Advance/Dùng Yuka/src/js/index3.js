// Dùng yuka / Arrive steering behavior
// Basic / Tạo Animation / animmation trong hàm animate cho từng object

import * as THREE from 'three';
import * as YUKA from "yuka";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

const strikeUrl = new URL("../model/Striker.gltf", import.meta.url);

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xA3A3A3);
document.body.appendChild( renderer.domElement );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 5, 4);
camera.lookAt( 0, 0, 0 );

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
scene.add(directionalLight);

// Tạo soul
const vehicle = new YUKA.Vehicle();
function sync(entity, renderComponent){
    renderComponent.matrix.copy(entity.worldMatrix);
}
vehicle.scale.set(0.15, 0.15, 0.15);

// Tạo physical body
const group = new THREE.Group();
const loader = new GLTFLoader();
loader.load(strikeUrl.href, function(glb) {
    const model = glb.scene;
    model.matrixAutoUpdate = false;
    group.add(model);
    scene.add(group);
    vehicle.setRenderComponent(model, sync);
});

// Tạo EntityManager quản lý update các state của object
const entityManager = new YUKA.EntityManager();
entityManager.add(vehicle);

// Tạo target
const target = new YUKA.GameEntity();
entityManager.add(target); 

// Dùng thuật toán
const arriveBehavior = new YUKA.ArriveBehavior(target.position, 1, 0.5); 
// 2 là gia tốc khi giảm v, default bằng 3
// 3 là điểm khi đến gần là dừng chứ k nhất thiết phải đến đúng đích

vehicle.steering.add(arriveBehavior);
vehicle.maxSpeed = 1.5;

const mousePosition = new THREE.Vector2();

window.addEventListener('mousemove', function(e) {
    mousePosition.x = (e.clientX / this.window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / this.window.innerHeight) * 2 + 1;
});

const planeGeo = new THREE.PlaneGeometry(25, 25);
const planeMat = new THREE.MeshBasicMaterial({visible: false});
const planeMesh = new THREE.Mesh(planeGeo, planeMat);
planeMesh.rotation.x = -0.5 * Math.PI;
scene.add(planeMesh);
planeMesh.name = 'plane';

const raycaster = new THREE.Raycaster();

window.addEventListener('click', function() {
    raycaster.setFromCamera(mousePosition, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    for(let i = 0; i < intersects.length; i++) {
        if(intersects[i].object.name === 'plane')
            target.position.set(intersects[i].point.x, 0, intersects[i].point.z);
    }
});

// Cơ chế là tạo plane bắt ray caster, cho target di chuyển đến điểm đó là xong, cố định trục y cho animation nhẹ 
// để nó giống đang lơ lửng, còn trục x và z là di chuyển. Để áp dụng animation cho 1 model bằng cách render liên tục
// trong hàm animate, ta phải kẹp nó trong group mới được chứ k thể dùng animation với từng mesh được

const time = new YUKA.Time();
function animate(t) {
    const delta = time.update().getDelta();
    entityManager.update(delta);
    group.position.y = 0.1 * Math.sin(t / 500);
	renderer.render(scene, camera);
};
renderer.setAnimationLoop(animate);
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});