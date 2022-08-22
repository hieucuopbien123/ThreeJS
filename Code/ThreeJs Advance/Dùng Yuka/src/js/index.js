// Dùng yuka / Following path steering behavior 
// - Obstacle Avoidance Steering Behavior
// - Offset Pursuit Steering Behavior

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as YUKA from "yuka";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const carUrl = new URL("../model/SUV.glb", import.meta.url);

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xA3A3A3);
document.body.appendChild( renderer.domElement );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();
camera.position.set( 0, 5, 15 );
camera.lookAt( 0, 0, 0 );
const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight();
scene.add(directionalLight);
directionalLight.position.set(0, 10, 10);

const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

// Tạo physical body là hình 
const vehicleGeo = new THREE.ConeBufferGeometry(0.1, 0.5, 8);
const vehicleMesh = new THREE.Mesh(
    vehicleGeo,
    new THREE.MeshNormalMaterial(),
)
scene.add(vehicleMesh);
vehicleGeo.rotateX(Math.PI*0.5);
vehicleGeo.computeBoundingSphere();

// Tạo soul
function sync(entity, renderComponent){
    renderComponent.matrix.copy(entity.worldMatrix); // copy các tính năng như position, scale, rotation để fuse 
    //2 cái lại. Nhờ v animation của object threejs h sẽ do YUKA xử lý
}
const vehicle = new YUKA.Vehicle();

// Kết hợp body với soul bên trên
vehicleMesh.matrixAutoUpdate = false; // threejs k thể tác động vào animation mesh này nữa
vehicle.setRenderComponent(vehicleMesh, sync);

//Tạo body với model
// const loader = new GLTFLoader();
// loader.load(carUrl.href, function(glb){ // nếu import string trực tiếp trong load phải trực tiếp từ dist
//     const model = glb.scene;
//     // model.scale.set(0.5, 0.5, 0.5); 
//     // Lệnh set này k còn hiệu lực với threejs nx khi dùng model, phải set bằng YUKA như dưới
//     scene.add(model);

//     model.matrixAutoUpdate = false;
//     vehicle.scale = new YUKA.Vector3(0.5, 0.5, 0.5);
//     vehicle.setRenderComponent(model, sync);
// });

// Tạo path để object đi theo
const path = new YUKA.Path(); 
path.add( new YUKA.Vector3(-6, 0, 4));
path.add( new YUKA.Vector3(-12, 0, 0));
path.add( new YUKA.Vector3(-6, 0, -12));
path.add( new YUKA.Vector3(0, 0, 0));
path.add( new YUKA.Vector3(8, 0, -8));
path.add( new YUKA.Vector3(10, 0, 0));
path.add( new YUKA.Vector3(4, 0, 4));
path.add( new YUKA.Vector3(0, 0, 6));

const position = [];
for(let i = 0; i < path._waypoints.length; i++) {
    const waypoint = path._waypoints[i];
    position.push(waypoint.x, waypoint.y, waypoint.z);
}

const lineGeometry = new THREE.BufferGeometry(); // BufferGeometry chơi mọi hình dạng
lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3)); 
// setAttribute cho position là set tọa độ cho từng điểm trong geometry
// Float32BufferAttribute đọc giá trị từ array và send vào GPU từng cục 3 element một để gán giá trị
// Đó là cách tạo geometry từ tọa độ số từng điểm, setFromPoints cx đc mà
const lineMaterial = new THREE.LineBasicMaterial({color: 0xFFFFFF});
const lines = new THREE.LineLoop(lineGeometry, lineMaterial);
scene.add(lines);

path.loop = true; // k còn điểm đầu cuối vì nó sẽ detect ngầm 2 điểm này, bh xe có thể đi vô tận
vehicle.position.copy(path.current()); // start at first checkpoint

// Dùng thuật toán
const followPathBehavior = new YUKA.FollowPathBehavior(path, 3, 0.5);
// Checkpoint là các điểm đổi hướng và path k còn là đường thẳng. VD đặt gt là 0.5 làm cho object cách checkpoint 0.5 
// thì bắt đầu đổi hướng luôn thì sẽ smooth hơn là tới r xoay
vehicle.steering.add(followPathBehavior);
vehicle.maxSpeed = 1;
const onPathBehavior = new YUKA.OnPathBehavior(path);
onPathBehavior.radius = 0.8;// mặc định radius là 0.1 tức nó k tách rời line quá 0.1 => thực
//chất tốc độ cao là có tách nhưng set như v làm nó gắn strictly với path hơn
vehicle.steering.add(onPathBehavior);

// Tạo EntityManager quản lý update các state của object
const entityManager = new YUKA.EntityManager();
entityManager.add(vehicle);


// Obstactcle bounding behavior
// vehicle.boundingRadius = vehicleGeo.boundingSphere.radius;
vehicle.boundingRadius = 2;

vehicle.smoother = new YUKA.Smoother(30); // vehicle phải move smooth chứ k được co giật khi né obstacle

const obstacleGeometry = new THREE.BoxGeometry();
obstacleGeometry.computeBoundingSphere();
const obstacleMaterial = new THREE.MeshPhongMaterial({color: 0xee0808});

const obstacleMesh1 = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
scene.add(obstacleMesh1);
obstacleMesh1.position.set(-12, 0, 0);

const obstacleMesh2 = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
scene.add(obstacleMesh2);
obstacleMesh2.position.set(4, 0, -4);

const obstacleMesh3 = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
scene.add(obstacleMesh3);
obstacleMesh3.position.set(10, 0, 0);

const obstacle1 = new YUKA.GameEntity();
obstacle1.position.copy(obstacleMesh1.position);
entityManager.add(obstacle1);
obstacle1.boundingRadius = obstacleGeometry.boundingSphere.radius;

const obstacle2 = new YUKA.GameEntity();
obstacle2.position.copy(obstacleMesh2.position);
entityManager.add(obstacle2);
obstacle2.boundingRadius = obstacleGeometry.boundingSphere.radius;

const obstacle3 = new YUKA.GameEntity();
obstacle3.position.copy(obstacleMesh3.position);
entityManager.add(obstacle3);
obstacle3.boundingRadius = obstacleGeometry.boundingSphere.radius;

const obstacles = [];
obstacles.push(obstacle1, obstacle2, obstacle3);

const obstacleAvoidanceBehavior = new YUKA.ObstacleAvoidanceBehavior(obstacles);
vehicle.steering.add(obstacleAvoidanceBehavior);


const followerGeo = new THREE.SphereGeometry(0.1);
const followerMat = new THREE.MeshPhongMaterial({color: 0xFFEA00});
const followerMesh = new THREE.Mesh(followerGeo, followerMat);
followerMesh.matrixAutoUpdate = false;

const offsets = [
    new YUKA.Vector3(0.3, 0, -0.3),
    new YUKA.Vector3(-0.3, 0, -0.3),
    new YUKA.Vector3(0, 0, 0),
    new YUKA.Vector3(0.5, 0, -0.5),
    new YUKA.Vector3(-0.5, 0, -0.5),
]
for(let i = 0; i < offsets.length; i++){
    const followerClone = followerMesh.clone();
    scene.add(followerClone);
    const follower = new YUKA.Vehicle();
    follower.setRenderComponent(followerClone, sync);
    entityManager.add(follower);
    follower.maxSpeed = 10; // kc phải nhanh hơn cái nó theo thì mới giữ được order
    
    //Đuổi theo vehicle và có tọa độ so với vehicle là mốc(0,0,0) thì nó là offsets[i] trên trục
    //Mốc 0,0,0 thực chất k trùng với vehicle mà cách 1 đoạn
    const offsetPursuitBehavior = new YUKA.OffsetPursuitBehavior(vehicle, offsets[i]);
    follower.steering.add(offsetPursuitBehavior);
}

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