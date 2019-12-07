import * as THREE from './libs/three.module.js';

const TM3D_URL = '/.json/tm3d.json';

let camera, scene, renderer, group;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

init();

async function init() {
  let resp = await fetch(TM3D_URL);
  let tm3d = await resp.json();

  if (tm3d.type != 'tm3d' || tm3d.version != '1.0.0')
    throw new Error('Invalid TM3D');

  camera = new THREE.PerspectiveCamera(
    60, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.x = 2000;
  camera.position.y = 2000;
  camera.position.z = 1000;
  camera.up.set(0, 0, 1);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0xffffff, 1, 10000);

  let xyzAxes = new THREE.AxesHelper(2000);
  scene.add(xyzAxes);

  let material = new THREE.MeshNormalMaterial();
  group = new THREE.Group();

  for (let sb of tm3d.boxes) {
    let geometry = new THREE.BoxBufferGeometry(
      sb.x[1] - sb.x[0],
      sb.y[1] - sb.y[0],
      sb.z[1] - sb.z[0]);

    let mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = (sb.x[1] + sb.x[0]) / 2;
    mesh.position.y = (sb.y[1] + sb.y[0]) / 2;
    mesh.position.z = (sb.z[1] + sb.z[0]) / 2;

    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    group.add(mesh);
  }

  scene.add(group);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  // document.addEventListener('mousemove', onDocumentMouseMove, false);
  window.addEventListener('resize', onWindowResize, false);
  render();
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) * 10;
  mouseY = (event.clientY - windowHalfY) * 10;
  render();
}

function render() {
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}
