import "./style.css";
import * as THREE from "three/webgpu";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let width = window.innerWidth;
let height = window.innerHeight;
let aspect = width / height;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
camera.position.z = 5;
scene.add(camera);

const renderer = new THREE.WebGPURenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.enablePan = true;
controls.enableRotate = true;

const box = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: "red", wireframe: true });
const mesh = new THREE.Mesh(box, material);
scene.add(mesh);

const handleResize = () => {
  width = window.innerWidth;
  height = window.innerHeight;
  aspect = width / height;
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

window.addEventListener("resize", handleResize);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.renderAsync(scene, camera);
}

animate();
