import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'
/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    materialColor: '#ffeded'
}
const objectDistance = 4;


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Test cube
 */
const textureLoader = new THREE.TextureLoader();
const gradient = textureLoader.load('/textures/gradients/3.jpg')
gradient.magFilter = THREE.NearestFilter;


const material = new THREE.MeshToonMaterial({
    color:parameters.materialColor,
    gradientMap:gradient
})


const object1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
)
const object2 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material
)
const object3 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
)

const particleGeo = new THREE.BufferGeometry();
const count = 1000;
const position = new Float32Array(count*3)
for(let i =0;i<count;i++){
    position[i*3+0]=(Math.random()-0.5)*20
    position[i*3+1]=objectDistance*0.5-Math.random()*objectDistance*3
    position[i*3+2]=(Math.random()-0.5)*20
}
particleGeo.setAttribute('position',new THREE.BufferAttribute(position,3))
const particleMat = new THREE.PointsMaterial({
    size:0.03,
    sizeAttenuation:true
})
const points=new THREE.Points(particleGeo,particleMat)

object1.position.y= -objectDistance * 0
object2.position.y= -objectDistance * 1
object3.position.y= -objectDistance * 2

object1.position.x= 2.2
object2.position.x= -2
object3.position.x= 1.8

scene.add(object1,object2,object3,points)

const sectionMeshes= [object1,object2,object3]




const directionalLight = new THREE.DirectionalLight('#ffffff',1)
directionalLight.position.set(1,1,0)
scene.add(directionalLight)


gui
    .addColor(parameters, 'materialColor').onChange(()=>{
        material.color.set(parameters.materialColor)
    })
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
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

/**
 * Camera
 */
// Base camera

const cameraGroup = new THREE.Group()
scene.add(cameraGroup)
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha:true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))




let scrollY= window.scrollY
let currentSection =0;
window.addEventListener('scroll',()=>{
    scrollY = window.scrollY
    const newSection = Math.round(scrollY/ sizes.height)
    if(currentSection!=newSection && sectionMeshes[newSection]){
        currentSection=newSection
        gsap.to(sectionMeshes[currentSection].rotation, {
            duration:2,
            ease:'power2.inOut',
            x:'+=6',
            y:'+=3',
            z:"+=4"
        })
    }
})

const cursor= {}
cursor.x=0
cursor.y=0

window.addEventListener('mousemove',(event)=>{
    cursor.x=event.clientX / sizes.height -0.5
    cursor.y=event.clientY / sizes.width -0.5
})


/**
 * Animate
 */
const clock = new THREE.Clock()
let prevTime=0
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime- prevTime;
    prevTime=elapsedTime;
    camera.position.y = - (scrollY/sizes.height * objectDistance)

    points.rotation.x += deltaTime * 0.02
    points.rotation.y += deltaTime * 0.02
    points.rotation.z += deltaTime * 0.02

    for(const mesh of sectionMeshes){
        mesh.rotation.x += deltaTime *0.1
        mesh.rotation.y += deltaTime *0.12 
    }

    const parallX=cursor.x *0.2
    const parallY=-cursor.y * 0.5
    cameraGroup.position.x += (parallX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallY - cameraGroup.position.y) * 5 * deltaTime

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()