import * as THREE from 'three';
import * as dat from 'dat.gui';
import { AmbientLight, CubeCamera, Raycaster, SpotLightHelper } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import stars from '../img/stars.jpg'
import nebula from '../img/nebula.jpg'

//Instantiate the renderer
const renderer = new THREE.WebGL1Renderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;

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
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xFF00FF });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);

//add a plane in the scene
const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide //so it doesnt dsappear when you go upside down
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI; //rotate plane inline with the grid
plane.receiveShadow = true;

// add grid, number controles the number of grids
const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

//add a sphere
const sphereGeometry = new THREE.SphereGeometry(4, 50, 50);
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x0000FF,
    wireframe: false
})
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
sphere.castShadow = true;

/*
Ambeint light = light that comes from the environment (indirect result of other sources of light, daylight in your room)
Directional light = (direct sunlight) big and far source of light that coveres the environment
spotlight = light in the form of a cone, farther the source of the light the bigger the cone radius
*/

//Add ambient light 
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

/*
//Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
scene.add(directionalLight);
directionalLight.position.set( -30, 50, 0)
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom = -12;

//Directional Light helper
const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
scene.add(dLightHelper);

//Shadow Camera
const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(dLightShadowHelper);
*/

//Spotlight
const spotlight = new THREE.SpotLight(0xffffff);
scene.add(spotlight);
spotlight.position.set(-100, 100, 0);
spotlight.castShadow = true;
spotlight.angle = 0.1;

//Spotlight helper
const sLightHelper = new THREE.SpotLightHelper(spotlight);
scene.add(sLightHelper);

//Add fog to the scene
// scene.fog = new THREE.Fog(0xffffff, 0, 200);
scene.fog = new THREE.FogExp2(0xffffff, 0.01);

// renderer.setClearColor(0xffea00)

const textureLoader = new THREE.TextureLoader();
// scene.background = textureLoader.load(nebula);

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    nebula,
    stars,
    stars,
    stars,
    stars,
    stars
]);

const box2MultMaterial = [
    new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),

]

const box2Geometry = new THREE.BoxGeometry(4, 4, 4);
const box2Material = new THREE.MeshBasicMaterial({
    // color: 0x00FF00,
    map: textureLoader.load(nebula)
});
const box2 = new THREE.Mesh(box2Geometry, box2MultMaterial);
scene.add(box2);

box2.position.set(0, 15, 10);
box2.name = 'theBox';

//reposition sphere
sphere.position.set(-10, 10, 0);

//allows user to control characteristics of sphere
const gui = new dat.GUI();
const options = {
    sphereColor: '#ffea00',
    wireframe: false,
    speed: 0.01,
    angle: 0.2,
    penumbra: 0,
    intensity: 1
};

gui.addColor(options, 'sphereColor').onChange(function(e){
    sphere.material.color.set(e);
});

gui.add(options, 'wireframe').onChange(function(e){
    sphere.material.wireframe = e
})

// add speed with upper and lower bounds
gui.add(options, 'speed', 0, 0.1);

gui.add(options, 'angle', 0, 1);
gui.add(options, 'penumbra', 0, 1);
gui.add(options, 'intensity', 0, 1);


let step = 0;
// let speed = 0.01;

const mousePosition = new THREE.Vector2();
window.addEventListener('mousemove', function(e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 -1;
})

const rayCaster = new THREE.Raycaster();

function animate(time) {
    box.rotation.x = time / 1000; //rotate the cube
    box.rotation.y = time / 1000;
    
    step += options.speed;
    sphere.position.y = 10 * Math.abs(Math.sin(step)); //bounce the sphere

    spotlight.angle = options.angle;
    spotlight.penumbra = options.penumbra;
    spotlight.intensity = options.intensity;
    sLightHelper.update();

    rayCaster.setFromCamera(mousePosition, camera);
    const intersects = rayCaster.intersectObjects(scene.children);
    console.log(intersects);

    for(let i = 0; i < intersects.length; i++){
        if(intersects[i].object.id === sphere.id){
            intersects[i].object.material.color.set(0xFF0000);
        }

        if(intersects[i].object.name === 'theBox') {
            intersects[i].object.rotation.x = time / 1000; //rotate the cube
            intersects[i].object.rotation.y = time / 1000;
        }
    }

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);