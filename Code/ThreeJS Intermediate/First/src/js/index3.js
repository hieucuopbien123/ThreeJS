// Basic / Tạo animation / Sequent animation
// Load assets / clone và animation

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

const modeUrl = new URL("../assets/Stag.gltf", import.meta.url);

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xA3A3A3);
document.body.appendChild( renderer.domElement );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();
camera.position.set( 10, 15, -22 );
camera.lookAt( 0, 0, 0 );

const planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        visible: false
    })
);
planeMesh.rotateX(-Math.PI/2);
scene.add(planeMesh);
planeMesh.name = 'ground';

const gridHelper = new THREE.GridHelper(20, 20);
scene.add(gridHelper);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
scene.add(directionalLight);
directionalLight.position.set(3, 3, 3);

let stag;
const assetLoader = new GLTFLoader();
let clips;
assetLoader.load(modeUrl.href, function(gltf){
    const model = gltf.scene;
    model.scale.set(0.3, 0.3, 0.3);
    stag = model;
    clips = gltf.animations;

    // Sequence animation
    scene.add(model);
    const mixer = new THREE.AnimationMixer(model);

    const clip = THREE.AnimationClip.findByName(clips, "Attack_Kick");
    const action = mixer.clipAction(clip);
    action.play();
    action.loop = THREE.LoopOnce;

    const clip2 = THREE.AnimationClip.findByName(clips, "Death");
    const action2 = mixer.clipAction(clip2);
    // action2.play();
    action2.loop = THREE.LoopOnce;

    mixer.addEventListener("finished", function(e){
        console.log(e);
        if(e.action._clip.name == "Attack_Kick"){
            action2.reset(); // reset lại về trạng thái như vị trí lúc mới đầu thực hiện animation
            action2.play();
        } else if(e.action._clip.name == "Death"){
            action.reset();
            action.play();
        }
    })
    
    mixers.push(mixer);

}, undefined, function(e){
    console.error(e);
});

const highlightMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        transparent: true, 
    })
);
highlightMesh.rotateX(-Math.PI/2);
scene.add(highlightMesh);
highlightMesh.position.set(0.5, 0, 0.5);

const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let intersects;

window.addEventListener('mousemove', function(e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    intersects = raycaster.intersectObjects(scene.children); 
    intersects.forEach(function(intersect) {
        if(intersect.object.name === 'ground') {
            const highlightPos = new THREE.Vector3().copy(intersect.point).floor().addScalar(0.5);
            highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);
        }

        const objectExist = objects.find(function(object) {
            return (object.position.x === highlightMesh.position.x)
            && (object.position.z === highlightMesh.position.z)
        });

        if(!objectExist) 
            highlightMesh.material.color.setHex(0xFFFFFF);
        else
            highlightMesh.material.color.setHex(0xFF0000);
    });
});

const objects = [];
const mixers = [];
window.addEventListener('mousedown', function() {
    const objectExist = objects.find(function(object) {
        return (object.position.x === highlightMesh.position.x)
        && (object.position.z === highlightMesh.position.z)
    });
    
    if(!objectExist){
        intersects.forEach(function(intersect) {
            if(intersect.object.name === 'ground') {
                const stagClone = SkeletonUtils.clone(stag); // hàm clone bth k hđ với loaded model
                stagClone.position.copy(highlightMesh.position);
                scene.add(stagClone);
                objects.push(stagClone);
                highlightMesh.material.color.setHex(0xFF0000);

                //Để tạo animation, đương nhiên mỗi model có 1 mixer riêng mới chạy được r
                const mixer = new THREE.AnimationMixer(stagClone);
                const clip = THREE.AnimationClip.findByName(clips, "Idle_2");
                const action = mixer.clipAction(clip);
                action.play();
                mixers.push(mixer);
            }
        });
    }
    console.log(scene.children.length);
});

const clock = new THREE.Clock();
function animate(time) {
    highlightMesh.material.opacity = 1 + Math.sin(time / 120);

    // ta dùng chung 1 biến delta thay vì ý tưởng khởi tạo 1 mảng clock hay nhiều clock occho
    const delta = clock.getDelta();
    mixers.forEach((mixer) => {
        mixer.update(delta);
    })
	renderer.render(scene, camera);
};
renderer.setAnimationLoop(animate);
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});