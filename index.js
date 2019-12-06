import * as THREE from './libs/three.module.js';
import * as sboxes from './sboxes.js';

let camera, scene, renderer, group;

let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

init();
animate();

function init() {

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 500;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0xffffff, 1, 10000);

  let material = new THREE.MeshNormalMaterial();

  group = new THREE.Group();

  for (let sb of sboxes.get()) {
    let geometry = new THREE.BoxBufferGeometry(
      sb.x.max - sb.x.min,
      sb.y.max - sb.y.min,
      sb.z.max - sb.z.min);

    let mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = (sb.x.max + sb.x.min) / 2;
    mesh.position.y = (sb.y.max + sb.y.min) / 2;
    mesh.position.z = (sb.z.max + sb.z.min) / 2;

    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();

    group.add(mesh);

  }

  scene.add(group);

  //

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //

  document.addEventListener('mousemove', onDocumentMouseMove, false);

  //

  window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function onDocumentMouseMove(event) {

  mouseX = (event.clientX - windowHalfX) * 10;
  mouseY = (event.clientY - windowHalfY) * 10;

}

//

function animate() {

  requestAnimationFrame(animate);

  render();

}

function render() {

  let time = Date.now() * 0.001;

  let rx = Math.sin(time * 0.7) * 0.5,
    ry = Math.sin(time * 0.3) * 0.5,
    rz = Math.sin(time * 0.2) * 0.5;

  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (- mouseY - camera.position.y) * 0.05;

  camera.lookAt(scene.position);

  group.rotation.x = rx;
  group.rotation.y = ry;
  group.rotation.z = rz;

  renderer.render(scene, camera);

}
