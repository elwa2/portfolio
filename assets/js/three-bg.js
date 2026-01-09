/**
 * Three.js Starfield Background
 * Light & High Performance for GitHub Pages
 */

let scene, camera, renderer, stars, starGeo;
let mouseX = 0,
  mouseY = 0;

function initThree() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 1;
  camera.rotation.x = Math.PI / 2;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0f0f1a, 1); // Deep Space Blue from Identity

  const container = document.getElementById("three-bg");
  if (container) {
    container.appendChild(renderer.domElement);
  }

  starGeo = new THREE.BufferGeometry();
  let positions = [];
  for (let i = 0; i < 6000; i++) {
    let star = new THREE.Vector3(
      Math.random() * 600 - 300,
      Math.random() * 600 - 300,
      Math.random() * 600 - 300
    );
    positions.push(star.x, star.y, star.z);
  }
  starGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  let sprite = new THREE.TextureLoader().load(
    "https://threejs.org/examples/textures/sprites/disc.png"
  );
  let starMaterial = new THREE.PointsMaterial({
    color: 0x5e3bee, // Primary Purple from Identity
    size: 0.7,
    map: sprite,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });

  stars = new THREE.Points(starGeo, starMaterial);
  scene.add(stars);

  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onMouseMove, false);

  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
  mouseX = (event.clientX - window.innerWidth / 2) / 100;
  mouseY = (event.clientY - window.innerHeight / 2) / 100;
}

function animate() {
  starGeo.attributes.position.array.forEach((val, index) => {
    if (index % 3 === 1) {
      // y coordinate
      starGeo.attributes.position.array[index] -= 0.1;
      if (starGeo.attributes.position.array[index] < -200) {
        starGeo.attributes.position.array[index] = 200;
      }
    }
  });
  starGeo.attributes.position.needsUpdate = true;

  stars.rotation.y += 0.002;
  stars.position.x += (mouseX - stars.position.x) * 0.05;
  stars.position.y += (-mouseY - stars.position.y) * 0.05;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initThree);
