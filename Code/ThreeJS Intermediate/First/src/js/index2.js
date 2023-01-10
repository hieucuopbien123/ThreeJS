// Load assets / Customized loaded assets
// Điều khiển camera / gsap

import * as THREE from 'three';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "dat.gui";
import gsap from "gsap";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

const donkeyUrl = new URL("../assets/Donkey.gltf", import.meta.url);
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xA3A3A3);
document.body.appendChild( renderer.domElement );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( 5, 10, 15 );
camera.lookAt( 10, 15, 0 );

const directionalLight = new THREE.DirectionalLight();
directionalLight.position.set(0, 11, 0);
scene.add(directionalLight);

const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(20, 20);
scene.add(gridHelper);

const assetLoader = new GLTFLoader();

const options = {
    "Main light": 0x7C7C7C
}
const gui = new dat.GUI();

assetLoader.load(donkeyUrl.href, function(gltf) {
    const model = gltf.scene;
    scene.add(model);
    console.log(model);
    console.log(model.getObjectByName("Cube_1"));
    gui.addColor(options, "Main light").onChange(function(e) {
        model.getObjectByName("Cube_1").material.color.setHex(e);
    })
}, undefined, function(e) {
    console.error(error);
});


// Điều khiển camera tự động bằng gsap(k dùng orbitcontrol hay firstpersoncontrol)
// let z; // k nên dùng event thuần
// let zFinal = 14;

const tl = gsap.timeline();
// window.addEventListener("load", function(){
//     // z = camera.position.z;
//     tl.to(camera.position, {
//         z: 14,
//         duration: 1.5,
//         onUpdate: function(){
//             camera.lookAt(0,0,0);
//         }
//     })
//     .to(camera.position, {
//         y: 2,
//         duration: 1.5,
//         onUpdate: function(){
//             camera.lookAt(0,0,0);
//         }
//     });
//     tl.to(camera.position, {
//         x: 5,
//         y: 3,
//         z: 5,
//         duration: 1.5,
//         onUpdate: function(){
//             camera.lookAt(0,0,0);
//         }
//     });

//     // Dùng kết hợp nhiều gsap và timeline
//     gsap.to(camera.position, {
//         y: 5,
//         duration: 1.5,
//         onUpdate: function(){
//             camera.lookAt(0,0,0);
//         }
//     });
// });

let mixer;
let mixer2;
// Move camera tạo cinematic
assetLoader.load("./bird/scene.gltf", function(gltf) {
    const model = gltf.scene;
    model.scale.set(0.01, 0.01, 0.01);
    const model2 = SkeletonUtils.clone(model);

    scene.add(model);
    scene.add(model2);
    
    model.position.set(7, 10, 6);
    model2.position.set(-7, 10, -2);

    mixer = new THREE.AnimationMixer(model);
    mixer2 = new THREE.AnimationMixer(model2);

    const clips = gltf.animations;
    const clip = THREE.AnimationClip.findByName(clips, "Take 001");
    
    const action = mixer.clipAction(clip);
    const action2 = mixer2.clipAction(clip);
    console.log(action2);

    action.play();
    action.timeScale = 0.5;
    action2.play();
    action2.timeScale = 0.5; // animation speed slowdown
    action2.startAt(0.2);

    window.addEventListener("mousedown", cameraAnimation);
}, undefined, function(e) {
    console.error(error);
});

const duration = 2;
const ease = "none"; // dùng linear
let animationIsFinished = false;
function cameraAnimation(){
    if(!animationIsFinished){
        animationIsFinished = true;

        // delay đối số 3 sẽ tính từ lúc timeline gọi, delay trong object sẽ chờ thêm bnh giây kể từ khi animation
        // trước làm xong. Ta cứ hiểu delay nó như 1 phần của animation là đứng yên 1 chỗ lúc đầu
        // muốn animation sequent k bị ngắt thì đảm bảo tọa độ liên tiếp nhau, kể cả tọa độ lookAt
        // => dùng đối số 3, ta có thể dùng nhiều animation 1 lúc, lại vừa làm liên tiếp theo thứ tự
        tl.to(camera.position, {
            x: -10,
            duration,
            ease,
            // k có lookAt liên tục, nó sẽ di chuyển bth
        })
        .to(camera.position, { // X
            x: -20,
            y: 10,
            z: -5,
            duration: 4,
            ease,
            onUpdate: function(){
                camera.lookAt(-5, 15, 0); // hình bình hành
            },
            delay: 1
        }, 2)//đối số 2 dùng được các option kiểu string condition như +=1, >3, >, < xem trên docs chi tiết
        //để có thể nối animation chuẩn nhất kiểu cái này sau or trước cái nào mấy s chứ kp tính time chay như v
        .to(camera.position, {
            x: -20,
            y: 15,
            z: -5,
            duration: 4,
            ease,
            onUpdate: function(){
                camera.lookAt(-5, 15, 0);
            },
            delay: 1, // thực hiện cùng lúc vì sau 2s cùng chờ 1s r thực hiện
        }, 2)
        .to(camera.position, {
            x: 10,
            z: -10,
            duration,
            ease,
            onUpdate: function(){
                camera.lookAt(-5, 15, 0); // hình bình hành
            },
        }, 7)
    }
}

const clock = new THREE.Clock();
function animate(time) {
    const delta = clock.getDelta();
    if(mixer && mixer2){
        mixer.update(delta);
        mixer2.update(delta);
    }
    // z += 0.1;
    // if(z < zFinal){
    //     camera.position.z = z;
    // }
	renderer.render(scene, camera);
};
renderer.setAnimationLoop(animate);
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});