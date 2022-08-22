// Basic

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

import starsTexture from '../img/stars.jpg';
import sunTexture from '../img/sun.jpg';
import mercuryTexture from '../img/mercury.jpg';
import venusTexture from '../img/venus.jpg';
import earthTexture from '../img/earth.jpg';
import marsTexture from '../img/mars.jpg';
import jupiterTexture from '../img/jupiter.jpg';
import saturnTexture from '../img/saturn.jpg';
import saturnRingTexture from '../img/saturn ring.png';
import uranusTexture from '../img/uranus.jpg';
import uranusRingTexture from '../img/uranus ring.png';
import neptuneTexture from '../img/neptune.jpg';
import plutoTexture from '../img/pluto.jpg';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-90, 140, 140);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture
]);

const textureLoader = new THREE.TextureLoader();
const sunGeo = new THREE.SphereGeometry(16, 30, 30);
const sunMat = new THREE.MeshBasicMaterial({
    map: textureLoader.load(sunTexture)
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

function createPlanet (radius, texture, position, ringTexture) {
    const obj = new THREE.Object3D();
    const geo = new THREE.SphereGeometry(radius, 30, 30);
    const mat = new THREE.MeshStandardMaterial({
        map: textureLoader.load(texture),
    })
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(obj);
    obj.add(mesh);
    mesh.position.z = position.getComponent(2);
    mesh.position.y = position.getComponent(1);

    if(ringTexture){
        const ringGeo = new THREE.RingGeometry(12, 18, 32); // số lượng theta segment lớn mới tròn
        const ringMat = new THREE.MeshBasicMaterial({
            map: textureLoader.load(ringTexture),
            side: THREE.DoubleSide
        })
        const ring = new THREE.Mesh(ringGeo, ringMat);
        // obj.add(ring); ring.position.set(0, 12, 100); // or
        mesh.add(ring);
        ring.rotation.x = 0.5*Math.PI;
    }
    return { mesh, obj };
}

const mercury = createPlanet(3.2, mercuryTexture, new THREE.Vector3(0, 2, 28));
const venus = createPlanet(5.8, venusTexture, new THREE.Vector3(0, 2, 44));
const earth = createPlanet(6, earthTexture, new THREE.Vector3(0, 2, 62));
const mars = createPlanet(4, marsTexture, new THREE.Vector3(0, 2, 78));
const jupiter = createPlanet(12, jupiterTexture, new THREE.Vector3(0, 2, 100));
const saturn = createPlanet(10, saturnTexture, new THREE.Vector3(0, 2, 138), {
    innerRadius: 10,
    outerRadius: 20,
    texture: saturnRingTexture
});
const uranus = createPlanet(7, uranusTexture, new THREE.Vector3(0, 2, 176), {
    innerRadius: 7,
    outerRadius: 12,
    texture: uranusRingTexture
});
const neptune = createPlanet(7, neptuneTexture, new THREE.Vector3(0, 2, 200));
const pluto = createPlanet(2.8, plutoTexture, new THREE.Vector3(0, 2, 216));

const pointLight = new THREE.PointLight(0xFFFFFF, 2, 300);
scene.add(pointLight);

function animate() {
    sun.rotateY(0.004);

    mercury.mesh.rotateY(0.01);
    venus.mesh.rotateY(0.002);
    earth.mesh.rotateY(0.02);
    mars.mesh.rotateY(0.018);
    jupiter.mesh.rotateY(0.04);
    saturn.mesh.rotateY(0.038);
    uranus.mesh.rotateY(0.03);
    neptune.mesh.rotateY(0.032);
    pluto.mesh.rotateY(0.008);

    mercury.obj.rotateY(0.04);
    venus.obj.rotateY(0.015);
    earth.obj.rotateY(0.01);
    mars.obj.rotateY(0.008);
    jupiter.obj.rotateY(0.002);
    saturn.obj.rotateY(0.0009);
    uranus.obj.rotateY(0.0004);
    neptune.obj.rotateY(0.0001);
    pluto.obj.rotateY(0.00007);

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

/* Solving 1 object quay quanh 1 object khác or 1 vị trí bất kỳ: cha add con và rotate cha thì con rotate theo, 
ta k nên cho sun add các hành tinh vì mọi hành tinh có tốc độ quay khác nhau nên tạo Object3D làm cha ok hơn. 
Object3D cha k cần set material đỡ tốn tài nguyên vì chỉ cần nó vô hình, k cần hiển thị */