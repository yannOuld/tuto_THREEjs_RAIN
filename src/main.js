import { DoubleSide } from 'three';
import { SphereGeometry } from 'three';
import { SphereBufferGeometry } from 'three';
import { PointLight } from 'three';
import { Vector3 } from 'three';
import { Points } from 'three';
import { BoxBufferGeometry } from 'three';
import { Vertex } from 'three';
import { Float16BufferAttribute } from 'three';
import { BufferAttribute } from 'three';
import { Float32BufferAttribute } from 'three';
import { BufferGeometry } from 'three';
import { PointsMaterial } from 'three';
import { BoxGeometry } from 'three';
import { GridHelper } from 'three';
import { DirectionalLightHelper } from 'three';
import { PlaneGeometry } from 'three';
import { Scene, PerspectiveCamera, AmbientLight, WebGLRenderer, PlaneBufferGeometry, Mesh, FogExp2, MeshLambertMaterial, TextureLoader, DirectionalLight } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let scene, camera, renderer, cloudParticles = [], flash, rainGeo, rainCount = 1500, rainDrop = [];

// initialisation de la scene three
scene = new Scene();

// initialisation et positionnement de la camera
camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 1;
camera.rotation.x = 1.16;
camera.rotation.y = -0.12;
camera.rotation.z = 0.27;
// lumiere ambiante qui eclaire globalement 
let ambient = new AmbientLight(0x555555);
scene.add(ambient);

// lumiere directionnel 
let directionalLight = new DirectionalLight(0xffeedd, 3);
directionalLight.position.set(1, 0, 2);
directionalLight.rotation.set(1.4, -0.5, 0.12);
scene.add(directionalLight);

// point de Lumiere servant d'eclairs
flash = new PointLight(0x062d89, 30, 500, 1.7);
flash.position.set(200, 300, 100);
scene.add(flash);


// initalisation du rendu graphique avec webgl 
renderer = new WebGLRenderer({ antialias: true });
scene.fog = new FogExp2(0x000000, 0.002);
renderer.setClearColor(scene.fog.color);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);


let positions = [];


(async function () {
  //texture des nuages
  let texture = await new TextureLoader().loadAsync("../assets/cloudgrey.png");

  // création de la representation de la geometrie utilisé pour les nuages
  const cloudGeo = new PlaneBufferGeometry(500, 500);

  // création du revetement non brillant utilisé 
  let cloudMaterial = new MeshLambertMaterial({
    map: texture,
    transparent: true,

  });

  rainGeo = new BufferGeometry();
  rainGeo.setAttribute('position', new Float32BufferAttribute([], 3))

  const rainMaterial = new PointsMaterial({
    color: 0xaaaaaa,
    size: 0.1,
    transparent: true
  });
  const rain = new Points(rainGeo, rainMaterial);
  scene.add(rain);

  for (let i = 0; i < rainCount; i++) {
    rainDrop.push({
      position: new Vector3(
        Math.random() * 400 - 200,
        Math.random() * 500 - 250,
        Math.random() * 400 - 200),
    });
  }


  for (let p of rainDrop) {
    positions.push(p.position.x, p.position.y, p.position.z);
  }
  rainGeo.setAttribute('position', new Float32BufferAttribute(positions, 3));


  // iteration pour une disposition aléatoire de 25 objets 3D 
  for (let i = 0; i < 25; i++) {
    // objet 3D avec sa geometrie et son revetement 
    let cloud = new Mesh(cloudGeo, cloudMaterial);
    // position des objets dans la scene
    cloud.position.set(
      Math.random() * 800 - 400,
      500,
      Math.random() * 500 - 400
    );
    // position des objets pour etre face a la caméra
    cloud.rotation.x = 1.16;
    cloud.rotation.y = -0.12;
    cloud.rotation.z = Math.random() * 360;
    cloud.material.opacity = 0.6;
    cloudParticles.push(cloud);
    scene.add(cloud);
    animate();
  }
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  })
})();


function animate() {
  cloudParticles.forEach(obj => {
    obj.rotation.z -= 0.0002;
  });
  for (let i = 0; i < scene.children.length; i++) {

    const object = scene.children[i];

    if (object instanceof Points) {
      object.userData.velocity = new Vector3(object.position.x, -0.5 + Math.random() * 0.1, object.position.z)
      object.position.add(object.userData.velocity)
      if (object.position.y < -200) {
        object.position.y = 200;
        object.userData.velocity = 0
      }
    }

  }

  rainGeo.attributes.position.needsUpdate = true;
  if (Math.random() > 0.93 || flash.power > 100) {
    if (flash.power < 100)
      flash.position.set(
        Math.random() * 400,
        300 + Math.random() * 200,
        100
      );
    flash.power = 45 + Math.random() * 500;

  }
  renderer.render(scene, camera)
  requestAnimationFrame(animate);
}


