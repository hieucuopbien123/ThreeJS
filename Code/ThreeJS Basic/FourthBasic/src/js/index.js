// Basic / IMPORTANT setup dự án
// Photography

import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  BoxBufferGeometry,
  MeshPhongMaterial,
  TextureLoader,
  RepeatWrapping,
  Mesh,
  DirectionalLight,
  HemisphereLight,
  BoxGeometry
} from "three"; 

import iceTexture from "../images/ice.jpg";

//Lấy container từ html
const threejsContainer = document.getElementById("threejs");

let scene,
  camera,
  geometry,
  texture,
  material,
  cube,
  renderer,
  hemiLight,
  dirLight;

geometry = new BoxBufferGeometry(1, 1, 1);

texture = new TextureLoader().load(iceTexture);

// set wrapping mode to repeat. Cái wrapS là xác định cách wrap theo chiều ngang tương ứng với U trong UV mapping, 
// còn wrapT theo chiều dọc. Mặc định là THREE.ClampToEdgeWrapping tức edge trùng và ảnh kéo dãn. Còn có 
// THREE.MirroredRepeatWrapping tương tự RepeatWrapping nhưng phản chiếu gương
texture.wrapS = texture.wrapT = RepeatWrapping;

// setup material with reflective light
material = new MeshPhongMaterial({ // MeshPhongMaterial dùng cho shiny surfaces
  map: texture,
  reflectivity: 1 // mức độ ảnh hưởng của môi trường tới độ bóng 0->1
});

cube = new Mesh(geometry, material);

dirLight = new DirectionalLight("#ce7c5f", 1.4);
dirLight.position.set(1, 1, 1);
hemiLight = new HemisphereLight("#afe273", "#f4dcc6", 0.5); // hemilight fix màu ok đấy

scene = new Scene();
scene.add(cube, dirLight, hemiLight); // có thể thêm nhiều object

camera = new PerspectiveCamera(50, innerWidth / 2 / innerHeight, 1, 1000);
camera.position.z = 3;

// Set up các thông số của renderer
renderer = new WebGLRenderer({ antialias: true, alpha: true });
// default clear alpha true là 0, false là 1, có getClearAlpha và setClearAlpha. Làm như này thì background thành
// trong suốt đó
renderer.setPixelRatio(devicePixelRatio);
// setPixelRatio sẽ set giá trị pixel ratio cho renderer ở đây trùng với pixel ratio của thiết bị. devicePixelRatio là
// biến global. Lệnh này thg dùng cho HiDPI device to prevent blurring output canvas.
renderer.setSize(innerWidth / 2, innerHeight);
renderer.gammaOutput = true; // cho chuẩn realistic lighting effect

renderer.setAnimationLoop(() => {
  let speed = 0.01;
  cube.rotation.x += speed;
  cube.rotation.y += speed;
  cube.rotation.z += speed;

  // render
  renderer.render(scene, camera);
});

// add result to container
threejsContainer.appendChild(renderer.domElement);
