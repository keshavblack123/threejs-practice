import * as THREE from 'three';
import * as dat from 'dat.gui';
import { CubeCamera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

//Instantiate the renderer
const renderer = new THREE.WebGL1Renderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Instantiate the scene and camera to be used in render method
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

//allow user to control camera angle
const orbit = new OrbitControls(camera, renderer.domElement);

//show axes
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper)
camera.position.set(-10, 30, 30)
orbit.update();

//add a box in the scene
const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xFF00FF });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);

//add a plane in the scene
const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide //so it doesnt dsappear when you go upside down
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI; //rotate plane inline with the grid

// add grid, number controles the number of grids
const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

//add a sphere
const sphereGeometry = new THREE.SphereGeometry(4, 50, 50);
const sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x0000FF,
    wireframe: false
})
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

//reposition sphere
sphere.position.set(-10, 10, 0);

//allows user to control characteristics of sphere
const gui = new dat.GUI();
const options = {
    sphereColor: '#ffea00',
    wireframe: false,
    speed: 0.01
};

gui.addColor(options, 'sphereColor').onChange(function(e){
    sphere.material.color.set(e);
});

gui.add(options, 'wireframe').onChange(function(e){
    sphere.material.wireframe = e
})

// add speed with upper and lower bounds
gui.add(options, 'speed', 0, 0.1);

let step = 0;
let speed = 0.01;

function animate(time) {
    box.rotation.x = time / 1000; //rotate the cube
    box.rotation.y = time / 1000;
    
    step += options.speed;
    sphere.position.y = 10 * Math.abs(Math.sin(step)); //bounce the sphere

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);