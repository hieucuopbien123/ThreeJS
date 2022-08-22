// Dùng cannon.js
// Bài toán

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as CANNON from "cannon-es";

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true }); // luôn có antialias khi có hình tròn
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xA3A3A3);
document.body.appendChild( renderer.domElement );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();
camera.position.set(0, 35, -2);
camera.lookAt(0, 30, 0);
renderer.shadowMap.enabled = true;

const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper);

// const ambientLight = new THREE.AmbientLight(0xFFFFFF);
// scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
scene.add(directionalLight);
directionalLight.position.set(0, 10, 0);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024; // fix pixel shadow của directional light khi ở xa
directionalLight.shadow.camera.bottom = -15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
// Mở rộng khoảng chiếu sáng thì lại bị pixel, cách fix là dùng nhiều light hơn vì giới hạn của 1 light chỉ có v

const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(dLightShadowHelper);

const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0), // trọng lực ngược trục Oy
})
const timeStep = 1/60; // tăng giảm ảnh hưởng performance vì cần nhiều tính toán

const sphereGeo = new THREE.SphereGeometry(2);
const sphereMat = new THREE.MeshBasicMaterial({ 
	color: 0xff0000, 
	wireframe: true,
});
const sphereMesh = new THREE.Mesh( sphereGeo, sphereMat);
scene.add(sphereMesh);

const boxGeo = new THREE.BoxGeometry(2, 2, 2);
const boxMat = new THREE.MeshBasicMaterial({
	color: 0x00ff00,
	wireframe: true,
});
const boxMesh = new THREE.Mesh(boxGeo, boxMat);
scene.add(boxMesh);

const groundGeo = new THREE.PlaneGeometry(30, 30);
const groundMat = new THREE.MeshStandardMaterial({ 
	color: 0xffffff,
	side: THREE.DoubleSide,
});
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
scene.add(groundMesh);
groundMesh.receiveShadow = true;

const groundPhysMat = new CANNON.Material();
const groundBody = new CANNON.Body({
    // shape: new CANNON.Plane(), // plane trong cannon thì kích thước lớn vô tận nên dùng box
    // mass: 10,
    type: CANNON.Body.STATIC, // có 3 trạng thái và STATIC tương đương với mass = 0
    shape: new CANNON.Box(new CANNON.Vec3(15, 15, 0.1)), // dày 0.1
    material: groundPhysMat,
});
world.addBody(groundBody);
groundBody.quaternion.setFromEuler(- Math.PI / 2, 0, 0);

const boxPhysMat = new CANNON.Material();
const boxBody = new CANNON.Body({
    mass: 1, // 1kg
    shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)), 
    // phải set 2 box cùng kích thước. Box thì chia đôi mới ra kích thước tương ứng trong cannon, sphere thì cùng bk ok
    position: new CANNON.Vec3(1, 20, 1),
    material: boxPhysMat // material trong cannon để xđ chất liệu xử lý va chạm
});
world.addBody(boxBody);

const groundBoxContactMat = new CANNON.ContactMaterial(
    groundPhysMat,
    boxPhysMat,
    {friction: 0}
);
world.addContactMaterial(groundBoxContactMat);

boxBody.angularVelocity.set(0, 10, 0); // xét vận tốc góc xoay quanh trục Oy(k có gì cản thì cứ xoay theo quán tính)
boxBody.angularDamping = 0.5; // ma sát cản vận tốc góc(xoay)

const spherePhysMat = new CANNON.Material();
const sphereBody = new CANNON.Body({
    mass: 4,
    shape: new CANNON.Sphere(2), // hình tròn nhỏ thì dùng Particle
    position: new CANNON.Vec3(0, 10, 0),
    material: spherePhysMat
});
world.addBody(sphereBody);
sphereBody.linearDamping = 0.21; // có ma sát

const groundSphereContactMat = new CANNON.ContactMaterial(
    groundPhysMat,
    spherePhysMat,
    {restitution: 0.9} // độ nảy
);
world.addContactMaterial(groundSphereContactMat);

const mouse = new THREE.Vector2();
const normalizedVector = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const plane = new THREE.Plane();
const intersectionPoint = new THREE.Vector3();
// Khởi tạo ở ngoài event để tái sử dụng, tránh mousemove tạo liên tục bộ nhớ các biến

window.addEventListener("mousemove", function(e) {
    mouse.x = (e.clientX / window.innerWidth)*2 - 1;
    mouse.y = - (e.clientY / window.innerHeight)*2 + 1;
    normalizedVector.copy(camera.position).normalize();
    plane.setFromNormalAndCoplanarPoint(normalizedVector, scene.position);
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, intersectionPoint);
});

const meshes = []; // Để link phải tạo array
const bodies = [];

const smallSpherePhysicMat = new CANNON.Material(); // cho nó dùng chung material đỡ phải tạo nhiều
const planeSphereContactMat = new CANNON.ContactMaterial(groundPhysMat, smallSpherePhysicMat, {restitution: 0.3});
world.addContactMaterial(planeSphereContactMat);

window.addEventListener("click", function(e){
    const sphereGeo = new THREE.SphereGeometry(0.5, 30, 30);
    const sphereMat = new THREE.MeshPhongMaterial({ // đục hơn MeshStandard
        color: Math.random()*0xFFFFFF, // cứ cho Math.random() nhân với số lớn nhất ra 
        // metalness: 0,
        // roughness: 0,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphereMesh);
    sphereMesh.position.copy(intersectionPoint);
    sphereMesh.castShadow = true;

    const sphereBody = new CANNON.Body({
        mass: 0.3,
        shape: new CANNON.Sphere(0.5),
        position: new CANNON.Vec3(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z),
        material: smallSpherePhysicMat,
    })
    world.addBody(sphereBody);

    meshes.push(sphereMesh);
    bodies.push(sphereBody);
})


// Lock Constraint
const size = 0.5;
const space = size * 0.1;
const mass = 1;
const N = 10;
const shape = new CANNON.Box(new CANNON.Vec3(size, size, size));
const geo = new THREE.BoxGeometry();
const mat = new THREE.MeshPhongMaterial({color: 0xFFEA00});

const meshesArr = [];
const bodiesArr = [];

let previous;
for(let i = 0; i < N; i++){
    const boxBody = new CANNON.Body({shape, mass, position: new CANNON.Vec3(-(N-i-N/2)*(size*2+space*2), 24, 0)});
    world.addBody(boxBody);
    bodiesArr.push(boxBody);
    
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    meshesArr.push(mesh);

    if(previous){
        const lockConstraint = new CANNON.LockConstraint(boxBody, previous);
        world.addConstraint(lockConstraint);
    }
    previous = boxBody;
}

const leftBody = new CANNON.Body({
    mass: 0, // khối lượng bằng 0 là static fix và các vật khác nặng k đè nó xuống nhé
    shape,
    position: new CANNON.Vec3(-(-N/2 + 1)*(size*2+space*2), 20, 0)
})
world.addBody(leftBody);
bodiesArr.push(leftBody);

const leftMesh = new THREE.Mesh(geo, mat);
scene.add(leftMesh);
meshesArr.push(leftMesh);

const rightBody = new CANNON.Body({
    mass: 0, 
    shape,
    position: new CANNON.Vec3(-(N/2)*(size*2+space*2), 20, 0)
})
world.addBody(rightBody);
bodiesArr.push(rightBody);

const rightMesh = new THREE.Mesh(geo, mat);
scene.add(rightMesh);
meshesArr.push(rightMesh);


// Lưới cầu
const cols = 15;
const rows = 15;
const radius = 1.5;
const dist = 0.2; // kc giữa 2 tâm nhé
const xSphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius),
    new THREE.MeshPhongMaterial({color: 0xA3A3A3}),
);
scene.add(xSphere);
const xSphereBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Sphere(radius),
    position: new CANNON.Vec3(0, 30, 0),
});
world.addBody(xSphereBody);

const smallSphere = new CANNON.Particle(); // bk particle là 0.1
const particles = [];
const particleBodies = []
for(let i = 0; i < rows; i++){
    for(let j = 0; j < cols; j++){
        const particleBody = new CANNON.Body({
            mass: 1,
            shape: smallSphere,
            position: new CANNON.Vec3( (i - rows * 0.5)*dist, 35, (j - cols*0.5)*dist),
            // Nên set tọa độ theo công thức kiểu trên
        });
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.1),
            new THREE.MeshPhongMaterial({color: 0xFFEA00})
        );
        world.addBody(particleBody);
        scene.add(particle);

        particles.push(particle);
        particleBodies.push(particleBody);
    }
}

function connect(i, j){
    const distanceConstraint = new CANNON.DistanceConstraint(
        particleBodies[i],
        particleBodies[j],
        dist
    )
    world.addConstraint(distanceConstraint);
}

for(let i = 0; i < rows; i++){
    for(let j = 0; j < cols; j++){
        if((i*cols + j + 1)%cols != 0)
            connect(i*cols + j, i*cols + j + 1);
        if(i < rows - 1)
            connect(i*cols + j, (i + 1)*cols + j);
    }
}

function animate(time) {
    xSphere.position.copy(xSphereBody.position);
    xSphere.quaternion.copy(xSphereBody.quaternion);

    for(let i = 0; i < particles.length; i++){
        particles[i].position.copy(particleBodies[i].position);
    }

    for(let i = 0; i < meshesArr.length; i++){
        meshesArr[i].position.copy(bodiesArr[i].position);
        meshesArr[i].quaternion.copy(bodiesArr[i].quaternion);
    }

    world.step(timeStep); // process hiển thị step tiếp theo sẽ như thế nào khi trải qua 1/60s;
    
    groundMesh.position.copy(groundBody.position);
    groundMesh.quaternion.copy(groundBody.quaternion); // copy orientation

    boxMesh.position.copy(boxBody.position);
    boxMesh.quaternion.copy(boxBody.quaternion);

    sphereMesh.position.copy(sphereBody.position);
    sphereMesh.quaternion.copy(sphereBody.quaternion);

    for(let i = 0; i < meshes.length; i++){
        meshes[i].position.copy(bodies[i].position);
        meshes[i].quaternion.copy(bodies[i].quaternion);
    }

	renderer.render(scene, camera);
};

renderer.setAnimationLoop(animate);
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});