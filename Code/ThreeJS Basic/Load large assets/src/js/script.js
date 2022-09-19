// Basic
// Load assets / Hiện shadow và Dùng DRACOLoader

import * as THREE from 'three';
import { Vector3 } from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

const model = new URL("../model/MR_INT-006_LoftIndustrialWindow_Griffintown.hdr", import.meta.url);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/innerHeight, 0.1, 1000);
renderer.setClearColor(0xA3A3A3);
camera.position.set(6, 6, 6);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

const directionalLight = new THREE.DirectionalLight();
directionalLight.position.set(0, 10, 0);
scene.add(directionalLight);
directionalLight.castShadow = true;

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        wireframe: false,
    })
);
scene.add(plane);
plane.rotation.x = - Math.PI / 2;
plane.receiveShadow = true;

// const ambientLight = new THREE.AmbientLight(0xededed, 0.8);
// scene.add(ambientLight);

let car;

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

const loadingManager = new THREE.LoadingManager();

// Dùng LoadingManager
//Bắt đầu load 1 assets băng hàm load. Số lần thực thi =  số lần gọi hàm load
// loadingManager.onStart = function(url, item, total){
//     console.log("Start loading url: " + url);
//     console.log("Start loading item: " + item);
//     console.log("Start loading total: " + total);
// }

const progressBar = document.getElementById("progress-bar");
// Khi bắt đầu load từng texture. Số lần thực thi = số lượng texture của model
loadingManager.onProgress = function(url, loaded, total){
    console.log(loaded);
    progressBar.value = (loaded / total)*100;
}
const progressBarContainer = document.querySelector(".progress-bar-container");
loadingManager.onLoad = function(){
    progressBarContainer.style.display = "none";
}
loadingManager.onError = function(url){
    console.error("Error loading: " + url);
}

// Khi dùng cho nhiều loader, nó gộp chung và total là tổng tất cả chứ k cần tạo riêng
const rgbeLoader = new RGBELoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);

/* Nếu file được nén và dùng DRACOLoader: 
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/examples/js/libs/draco/' ); // url đến thư mục draco
gltfLoader.setDRACOLoader( dracoLoader );

gltfLoader.load(
    '/models/car/scene.gltf',
    function ( gltf ) {
        scene.add( gltf.scene ); // dùng được các thứ dưới
        // gltf.animations; // Array<THREE.AnimationClip>
        // gltf.scene; // THREE.Group
        // gltf.scenes; // Array<THREE.Group>
        // gltf.cameras; // Array<THREE.Camera>
        // gltf.asset; // Object
    },

    // called while loading is progressing
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },

    // called when loading has errors
    function ( error ) {
        console.log( 'An error happened' );
    }
);
*/

rgbeLoader.load(model.href, function(texture){
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;

    gltfLoader.load("./assets/scene.gltf", function(gltf) { // tên thư mục từ trong dist do parcel đã bundle bằng package
        const model = gltf.scene;
        scene.add(model);
        model.position.set(0, 1, 0);
        car = model;
        
        model.traverse(function(mesh){
            if(mesh.isMesh){
                mesh.castShadow = true;
            }
        });

        // Cách khắc phục lỗi model nếu nó bị lệch tâm: ta lấy Box3 là box bao ngoài sát model nhất
        let bbox = new THREE.Box3().setFromObject(model);
        let cent = bbox.getCenter(new Vector3());
        let size = bbox.getSize(new Vector3());
        let maxAxis = Math.max(size.x, size.y, size.z);

        // scale sao cho trục lớn nhất của model về 1 đơn vị. multiplyScalar giúp nhân vector với 1 số vô hướng
        // và thay đổi luôn vector. Sau đó lại lấy box bao ngoài sau khi đã scale
        model.scale.multiplyScalar(1.0/maxAxis);
        bbox.setFromObject(model);
        bbox.getCenter(cent);
        bbox.getSize(size);
        
        // Ta cần dịch tâm box về vị trí của object. Giả sử model hiện ở vị trí (0,0,0) mà tâm lại (1,1,1) tức
        // model bị lệch tâm. Khi đó phải dịch về 1 lượng để tâm vật ở đúng vị trí dịch
        model.position.x -= cent.x;
        model.position.y -= cent.y;
        model.position.x -= cent.z;
    });
})

function animate(time) {
    if(car){
        car.rotation.y = - time/3000;
    }
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
