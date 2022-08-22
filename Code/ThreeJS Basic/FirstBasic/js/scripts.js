// Basic
// Setup dự án

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth/2, window.innerHeight/2 );
document.body.appendChild( renderer.domElement ); // domElement của renderer là thẻ canvas đó

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( 0, 0, 5 ); // mặc định ở tâm
camera.lookAt( 0, 0, 0 ); // rotate cam nhìn thẳng vào 1 point trong world space

const points = [];
points.push( new THREE.Vector3( - 2, 0, 0 ) );
points.push( new THREE.Vector3( 0, 2, 0 ) );
points.push( new THREE.Vector3( 2, 0, 0 ) );
const geometry = new THREE.BufferGeometry().setFromPoints( points ); // Có thể tạo geometry bất kỳ từ từng point
const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
const line = new THREE.Line( geometry, material ); // Nó chỉ vẽ 1 line từ 2 điểm liền nhau nên chỉ có 2 line ở đây
scene.add( line );

// Nên chia rõ ràng như này
var update = function() {
	line.rotation.x += 0.01;
};
var render = function() {
	renderer.render(scene, camera);
};
function animate() {
    requestAnimationFrame( animate );
    update();
    render();
};

scene.background = new THREE.Color( 'skyblue' );

// Check trình duyệt hỗ trợ k
if ( WebGL.isWebGLAvailable() ) {
    animate();
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById( 'body' ).appendChild( warning );
}