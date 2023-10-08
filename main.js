import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Canvas
const canvas = document.querySelector('canvas.webgl')
canvas.transparent = true;
const backgroundColor = 0xf1f1f1;

let neck, head;

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(backgroundColor);
scene.fog = new THREE.Fog(backgroundColor, 60, 100);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Camera
const camera = new THREE.PerspectiveCamera(
    50,
    sizes.width / sizes.height,
    0.1,
    1000
);
camera.position.z = 10
camera.position.x = 0;
camera.position.y = 3;

scene.add(camera)

let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
hemiLight.position.set(0, 50, 0);
// Add hemisphere light to scene
scene.add(hemiLight);

let d = 8.25;
let dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 1500;
dirLight.shadow.camera.left = d * -1;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = d * -1;
// Add directional Light to scene
scene.add(dirLight);

// Floor
let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
let floorMaterial = new THREE.MeshPhongMaterial({
    color: 0xeeeeee,
    shininess: 0,
});

let floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -0.5 * Math.PI;
floor.receiveShadow = true;
floor.position.y = -11;
scene.add(floor);

const gltfLoader = new GLTFLoader()
gltfLoader.load(
    '/manuel.glb',
    (gltf) => {
        const model = gltf.scene;
        console.log(model)

        model.children[0].scale.set(0.08, 0.08, 0.08);
        model.children[0].position.y = -11;

        model.traverse(o => {
            if (o.isObject3D) {
                o.castShadow = true;
                o.receiveShadow = true;
            }

            if (o.isBone && o.name === 'rp_manuel_animated_001_dancing_neck') {
                neck = o;
            }
            if (o.isBone && o.name === 'rp_manuel_animated_001_dancing_head') {
                head = o;
            }
        });

        scene.add(model.children[0])
    }
)

let geometry = new THREE.SphereGeometry(8, 32, 32);
let material = new THREE.MeshBasicMaterial({ color: 0xf55442 }); // 0xf2ce2e 
let sphere = new THREE.Mesh(geometry, material);
sphere.position.z = -15;
sphere.position.y = 1.5;
sphere.position.x = 0;
scene.add(sphere);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true;
renderer.setSize(sizes.width, sizes.height)

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

document.addEventListener('mousemove', function (e) {
    var mousecoords = getMousePos(e);
    if (neck && head) {

        let degrees = getMouseDegrees(mousecoords.x, mousecoords.y, 30);
        neck.rotation.x = THREE.MathUtils.degToRad(degrees.x);
        head.rotation.z = -THREE.MathUtils.degToRad(degrees.y);
    }
});

function getMousePos(e) {
    return { x: e.clientX, y: e.clientY };
}

function getMouseDegrees(x, y, degreeLimit) {
    let dx = 0,
        dy = 0,
        xdiff,
        xPercentage,
        ydiff,
        yPercentage;

    let w = { x: window.innerWidth, y: window.innerHeight };

    // Left (Rotates neck left between 0 and -degreeLimit)
    // 1. If cursor is in the left half of screen
    if (x <= w.x / 2) {
        // 2. Get the difference between middle of screen and cursor position
        xdiff = w.x / 2 - x;
        // 3. Find the percentage of that difference (percentage toward edge of screen)
        xPercentage = (xdiff / (w.x / 2)) * 100;
        // 4. Convert that to a percentage of the maximum rotation we allow for the neck
        dx = ((degreeLimit * xPercentage) / 100) * -1;
    }

    // Right (Rotates neck right between 0 and degreeLimit)
    if (x >= w.x / 2) {
        xdiff = x - w.x / 2;
        xPercentage = (xdiff / (w.x / 2)) * 100;
        dx = (degreeLimit * xPercentage) / 100;
    }
    // Up (Rotates neck up between 0 and -degreeLimit)
    if (y <= w.y / 2) {
        ydiff = w.y / 2 - y;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        // Note that I cut degreeLimit in half when she looks up
        dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
    }
    // Down (Rotates neck down between 0 and degreeLimit)
    if (y >= w.y / 2) {
        ydiff = y - w.y / 2;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        dy = (degreeLimit * yPercentage) / 100;
    }
    return { x: dx, y: dy };
}

const tick = () => {
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick();

