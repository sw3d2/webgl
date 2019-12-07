import * as THREE from './libs/three.module.js';

const TM3D_URL = '/json/tm3d.json';

let rendering = false;
let camera, scene, renderer, group;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

init();

async function init() {
  let resp = await fetch(TM3D_URL);
  let tm3d = await resp.json();

  if (tm3d.type != 'tm3d' || tm3d.version != '1.0.0')
    throw new Error('Invalid TM3D');

  console.log('tm3d', tm3d.boxes.length, 'boxes');

  camera = new THREE.PerspectiveCamera(
    60, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.x = 1000;
  camera.position.y = 1000;
  camera.position.z = 500;
  camera.up.set(0, 0, 1);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  // scene.fog = new THREE.Fog(0xffffff, 1, 10000);

  let xyzAxes = new THREE.AxesHelper(2000);
  scene.add(xyzAxes);

  group = new THREE.Group();

  for (let sb of tm3d.boxes) {
    let geometry = new THREE.BoxBufferGeometry(
      sb.x[1] - sb.x[0],
      sb.y[1] - sb.y[0],
      sb.z[1] - sb.z[0]);

    let material = getMaterial(sb);
    let mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = (sb.x[1] + sb.x[0]) / 2 - 200;
    mesh.position.y = (sb.y[1] + sb.y[0]) / 2 - 200;
    mesh.position.z = (sb.z[1] + sb.z[0]) / 2;

    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    group.add(mesh);
  }

  scene.add(group);

  let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
  hemiLight.color.setHSL(0.6, 1, 0.6);
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  let hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
  scene.add(hemiLightHelper);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  // document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('keypress', onKeyPress, false);
  window.addEventListener('resize', onWindowResize, false);
  render();
}

let materials = {};

function getMaterial(sb) {
  let material = materials[sb.color] || new THREE.MeshPhongMaterial({
    color: sb.color,
    opacity: 0.25,
    transparent: true,
  });

  return materials[sb.color] = material;
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  requestAnimationFrame(render);
}

function onDocumentMouseMove(event) {
  let mouseX = (event.clientX - windowHalfX) * 1e-2;
  let mouseY = (event.clientY - windowHalfY) * 1e-2;
  group.rotation.x = Math.sin(mouseX);
  group.rotation.y = Math.cos(mouseY);
  requestAnimationFrame(render);
}

function onKeyPress(event) {
  switch (event.key) {
    case 'z':
      group.rotation.z += 0.01;
      render();
      break;
    case 'y':
      group.rotation.y += 0.01;
      render();
      break;
    case 'x':
      group.rotation.x += 0.01;
      render();
      break;
  }
}

function render() {
  try {
    if (rendering)
      return;
    rendering = true;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  } finally {
    rendering = false;
  }
}
