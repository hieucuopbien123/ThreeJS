// Photography / Post processing
// Điều khiển camera / OrbitControl

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { Vector2 } from 'three';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0x000000);
document.body.appendChild( renderer.domElement );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( 5, 5, 5 );
camera.lookAt( 0, 0, 0 );
const orbit = new OrbitControls(camera, renderer.domElement);
const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper);
const gridHelper = new THREE.GridHelper(30, 30);
scene.add(gridHelper);

// orbit.panSpeed = 2;
// orbit.rotateSpeed = 2;
// orbit.maxDistance = 10; // có thể dùng giới hạn không gian để k ra khỏi map
// orbit.enablePan = false;

orbit.enableDamping = true;
orbit.dampingFactor = 0.2;

// orbit.autoRotate = true;
// orbit.autoRotateSpeed = 5;
// orbit.target = new THREE.Vector3(2, 2, 2);

// orbit.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
// orbit.mouseButtons.LEFT = THREE.MOUSE.PAN;
orbit.keys = {
    LEFT: "ArrowLeft",
    UP: "KeyW",
    RIGHT: "ArrowRight",
    BOTTOM: "KeyS"
}
orbit.listenToKeyEvents(window);
orbit.keyPanSpeed = 20;

const renderScene = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);

const bloomPass = new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    1.6,
    0.1, // radius của bloom
    0.1 // thực tế
);
composer.addPass(bloomPass);

bloomPass.radius = 5;
bloomPass.strength = 0.5;
bloomPass.threshold = 0.1;

renderer.toneMapping = THREE.LinearToneMapping; // CineonToneMapping
renderer.toneMappingExposure = 1.5;


window.addEventListener("keydown", function(e){
    if(e.code === "Space")
        orbit.saveState();
    if(e.code === "Enter")
        orbit.reset();
})

orbit.minAzimuthAngle = Math.PI / 4;
orbit.maxAzimuthAngle = Math.PI / 2;
orbit.minPolarAngle = Math.PI / 4;
orbit.maxPolarAngle = Math.PI / 2;

function animate(time) {
    orbit.update();
	// renderer.render(scene, camera);
    composer.render();
    requestAnimationFrame(animate); // cách nào cũng được nhưng EffectComposer thì nên dùng cách requestAnimationFrame
}; 
animate();
// renderer.setAnimationLoop(animate);
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});