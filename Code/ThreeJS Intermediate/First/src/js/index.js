// Basic
// Bài toán

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xA3A3A3);
document.body.appendChild( renderer.domElement );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( 10, 15, -22 );
camera.lookAt( 0, 0, 0 );
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

const planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        visible: false
    })
);
planeMesh.rotateX(-Math.PI/2); // or gán với .rotation
scene.add(planeMesh);
planeMesh.name = 'ground';

const gridHelper = new THREE.GridHelper(20, 20);
scene.add(gridHelper);

const highlightMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        transparent: true, // phải bật mode mới được thay đổi opacity
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
    intersects = raycaster.intersectObjects(scene.children); // mọi object trong scene là con của scene
    intersects.forEach(function(intersect) {
        if(intersect.object.name === 'ground') {
            const highlightPos = new THREE.Vector3().copy(intersect.point).floor().addScalar(0.5);
            highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);
        }

        const objectExist = objects.find(function(object) {
            return (object.position.x === highlightMesh.position.x)
            && (object.position.z === highlightMesh.position.z)
        });

        if(!objectExist) // Điều kiện phức tạp mấy cũng chỉ thêm if else là xong mà
            highlightMesh.material.color.setHex(0xFFFFFF);
        else
            highlightMesh.material.color.setHex(0xFF0000);
    });
    // Ta phải bắt mọi object giao và lấy giao của raycaster với nó. Nhớ trong bài click là tạo ra 1 điểm ở vị trí
    // ta có thể tìm tọa độ giao điểm của raycaster với mặt phẳng nhưng đó là kiểu THREE.Plane riêng của threejs
    // lưu thông tin về 1 mp 3d, điều đó khác với ở trên là 1 mesh thì k tìm giao điểm kiểu đó được vì 1 mesh có thể
    // là bất cứ hình gì. Ta vẫn có thể implement điều đó bằng cách tạo ra 1 THREE.Plane trùng tọa độ với PlaneGeometry
    // qua setFromNormalAndCoplanarPoint bằng cách lấy point là planeMesh.position và normal vector dùng
    // new THREE.Vector3D().set( 0, 0, 1 ).applyQuaternion( planeMesh.quaternion ); nhưng Plane của THREE dài vô tận
    // chứ k giới hạn như geometry, tốt nhất cứ làm như trên cho nhanh. Plane dùng khi cần có 1 mp vô hình phục vụ thuật
    // toán chứ k hiển thị => Pb kỹ 2 cái này
});

const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 4, 2),
    new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0xFFEA00
    })
);

const objects = [];
// nó cố tình để biến intersects ở ngoài để tái sử dụng vì khi mousemove nó lấy va chạm r thì mousedown k cần 
// lấy lại các object có giao nữa
window.addEventListener('mousedown', function() {
    const objectExist = objects.find(function(object) {
        //nó chưa tồn tại nếu trục x và z của object này chưa từng có trong ptu nào của mảng objects
        return (object.position.x === highlightMesh.position.x)
        && (object.position.z === highlightMesh.position.z)
    });
    
    if(!objectExist){
        intersects.forEach(function(intersect) {
            if(intersect.object.name === 'ground') {
                const sphereClone = sphereMesh.clone(); // clone k tạo mới
                sphereClone.position.copy(highlightMesh.position);
                scene.add(sphereClone);
                objects.push(sphereClone);
                highlightMesh.material.color.setHex(0xFF0000); // khi tạo mới cũng đổi màu luôn chứ k chờ mousemove
            }
        });
    }
    console.log(scene.children.length);
});


function animate(time) {
    highlightMesh.material.opacity = 1 + Math.sin(time / 120); // animation blink, phải bật cho phép transparent
    objects.forEach(function(object) {
        object.rotation.x = time / 1000;
        object.rotation.z = time / 1000;
        object.position.y = 0.5 + 0.5 * Math.abs(Math.sin(time / 1000));
    });
	renderer.render(scene, camera);
};
renderer.setAnimationLoop(animate);
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});