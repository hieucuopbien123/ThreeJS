// Animation / 1 mixer cho 50 model animation
// Dùng YUKA / Wander Behavior

import * as THREE from 'three';
import * as YUKA from "yuka";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";

// setup
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xA3A3A3);
document.body.appendChild( renderer.domElement );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 10, 0);
camera.lookAt( 0, 0, 0 );

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
scene.add(directionalLight);

function sync(entity, renderComponent){
    renderComponent.matrix.copy(entity.worldMatrix);
}

// Tạo manager
const entityManager = new YUKA.EntityManager();

// Load model 3d file
const loader = new GLTFLoader();
let mixer;
loader.load("./fish/scene.gltf", function(glb) {
    const model = glb.scene;
    model.matrixAutoUpdate = false;

    const clips = glb.animations;
    const group = new THREE.AnimationObjectGroup();
    mixer = new THREE.AnimationMixer(group);
    const clip = THREE.AnimationClip.findByName(clips, "Fish_001_animate_preview");
    const action = mixer.clipAction(clip); // kiểu AnimationAction
    // AnimationAction là cái gắn với model từ mixer và loại animation rồi, gọi play là nó chờ chạy theo timeline
    // trong mixer
    action.play();

    // Flock Steering Behavior
    const alignmentBehavior = new YUKA.AlignmentBehavior();
    alignmentBehavior.weight = 2; // khi 1 object có nh behavior thì weight sẽ xác định độ quan trọng của behavior
    const cohesionBehavior = new YUKA.CohesionBehavior();
    cohesionBehavior.weight = 0.9;
    const separationBehavior = new YUKA.SeparationBehavior();
    separationBehavior.weight = 0.3;

    for(let i = 0; i < 50; i++){
        // Tạo các YUKA entity và model
        const fishClone = SkeletonUtils.clone(model);
        scene.add(fishClone);
        group.add(fishClone);

        // Gắn 2 cái với nhau
        const vehicle = new YUKA.Vehicle();
        vehicle.scale.set(0.01, 0.01, 0.01);
        vehicle.setRenderComponent(fishClone, sync);
        vehicle.smoother = new YUKA.Smoother(30);

        // Tạo AI WanderBehavior
        const wanderBehavior = new YUKA.WanderBehavior();
        wanderBehavior.weight = 0.3; // làm nó less random hơn
        vehicle.steering.add(wanderBehavior);
        
        // điều chỉnh số lượng neightbor bằng bán kính
        vehicle.updateNeighborhood = true;
        vehicle.neighborhoodRadius = 10;

        vehicle.steering.add(alignmentBehavior);
        vehicle.steering.add(cohesionBehavior);
        vehicle.steering.add(separationBehavior);

        entityManager.add(vehicle);

        // Vị trí khởi tạo cho random
        vehicle.position.x = 2.5 - Math.random()*10;
        vehicle.position.z = 2.5 - Math.random()*10;
        vehicle.rotation.fromEuler(0, 2*Math.PI*Math.random(), 0);
    }
});

const clock = new THREE.Clock();
const time = new YUKA.Time();
function animate(t) {
    if(mixer){
        mixer.update(clock.getDelta());
    }
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