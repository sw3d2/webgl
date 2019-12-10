import * as THREE from '/libs/three.module.js';
import { OrbitControls } from '/libs/three/OrbitControls.js';

const BASE_URL = 'https://api.iswaac.dev:2615/json/';
// const BASE_URL = 'http://localhost:2615/json/';
const JSON_SRC = location.search.slice(1) || 'microsoft/typescript';
const JSON_URL = BASE_URL + JSON_SRC;
const CHECK_INTERVAL = 3e3;
const CHECK_TIMEOUT = 60e3;

let rendering = false;
let camera, scene, renderer, group, controls;

init().catch(err => writeInfo(err.message));

async function init() {
  let tm3d = await downloadJson();

  if (tm3d.type != 'tm3d' || tm3d.version != '1.0.0')
    throw new Error('Invalid TM3D');

  let bbox = getBoundaryBox(tm3d);
  console.log('tm3d', tm3d.boxes.length, 'boxes', JSON.stringify(bbox));

  let xcenter = (bbox.x[0] + bbox.x[1]) / 2;
  let ycenter = (bbox.y[0] + bbox.y[1]) / 2;
  let zcenter = (bbox.z[0] + bbox.z[1]) / 2;

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

    mesh.position.x = (sb.x[1] + sb.x[0]) / 2 - xcenter;
    mesh.position.y = (sb.y[1] + sb.y[0]) / 2 - ycenter;
    mesh.position.z = (sb.z[1] + sb.z[0]) / 2 - zcenter;

    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    group.add(mesh);
  }

  scene.add(group);

  let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
  hemiLight.color.setHSL(0.6, 1, 0.6);
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 0, 1e3);
  scene.add(hemiLight);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  window.addEventListener('resize', onWindowResize, false);

  initControls();
  render();
}

function initControls() {
  // https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_orbit.html
  controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', render); // call this only in static scenes (i.e., if there is no animation loop)
  // controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  // controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 1;
  controls.maxDistance = 1e4;
  controls.maxPolarAngle = Math.PI / 2;
}

let materials = {};

function getMaterial(sb) {
  let material = materials[sb.color] || new THREE.MeshPhongMaterial({
    color: sb.color,
    opacity: 0.75,
    transparent: false,
  });

  return materials[sb.color] = material;
}

function getBoundaryBox(tm3d) {
  let xmin = +1 / 0;
  let xmax = -1 / 0;
  let ymin = +1 / 0;
  let ymax = -1 / 0;
  let zmin = +1 / 0;
  let zmax = -1 / 0;

  for (let sb of tm3d.boxes) {
    xmin = Math.min(xmin, sb.x[0]);
    xmax = Math.max(xmax, sb.x[1]);
    ymin = Math.min(ymin, sb.y[0]);
    ymax = Math.max(ymax, sb.y[1]);
    zmin = Math.min(zmin, sb.z[0]);
    zmax = Math.max(zmax, sb.z[1]);
  }

  return {
    x: [xmin, xmax],
    y: [ymin, ymax],
    z: [zmin, zmax],
  };
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  requestAnimationFrame(render);
}

function render() {
  try {
    if (rendering)
      return;
    rendering = true;
    // controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  } finally {
    rendering = false;
  }
}

function sleep(timeout) {
  return new Promise(
    resolve => setTimeout(
      resolve, timeout));
}

function writeInfo(text) {
  document.body.textContent = text;
}

async function downloadJson() {
  let time0 = Date.now();

  while (Date.now() < time0 + CHECK_TIMEOUT) {
    let resp = await fetch(JSON_URL);
    let info = resp.status + ' ' + resp.statusText;

    if (resp.status >= 400)
      throw new Error(info + '\n' + await resp.text());

    if (resp.status != 200) {
      writeInfo(info + '\n' + await resp.text());
      await sleep(CHECK_INTERVAL);
      continue;
    }

    return await resp.json();
  }

  throw new Error('Timed out');
}
