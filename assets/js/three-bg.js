/**
 * Avant-Garde Three.js Background
 * Professional 3D Interactive Background
 */

class AvantGardeBackground {
  constructor() {
    this.container = document.getElementById("three-canvas-container");
    if (!this.container) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.camera.position.z = 5;

    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };

    this.initLights();
    this.initObjects();
    this.addEventListeners();
    this.animate();
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x8a7ddb, 0.8);
    pointLight1.position.set(5, 5, 5);
    this.scene.add(pointLight1);

    // Unified color scheme - using the same color for both lights to keep it "one degree"
    const pointLight2 = new THREE.PointLight(0x8a7ddb, 0.5);
    pointLight2.position.set(-5, -5, 5);
    this.scene.add(pointLight2);
  }

  initObjects() {
    // Create a central abstract wireframe sphere
    const geometry = new THREE.IcosahedronGeometry(2, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x8a7ddb,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });

    this.sphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.sphere);

    // Reduced floating shards count for a cleaner look
    this.shards = [];
    const shardGeometry = new THREE.OctahedronGeometry(0.15, 0);
    const shardMaterial = new THREE.MeshPhongMaterial({
      color: 0x8a7ddb, // Single color shade
      transparent: true,
      opacity: 0.3,
    });

    for (let i = 0; i < 15; i++) {
      // Reduced from 50 to 15
      const shard = new THREE.Mesh(shardGeometry, shardMaterial);
      shard.position.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8
      );
      shard.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      shard.userData = {
        speedX: (Math.random() - 0.5) * 0.005, // Slower
        speedY: (Math.random() - 0.5) * 0.005, // Slower
        rotSpeed: Math.random() * 0.01, // Slower
      };
      this.scene.add(shard);
      this.shards.push(shard);
    }
  }

  addEventListeners() {
    window.addEventListener("mousemove", (e) => {
      this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Smoother and slower mouse following
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.03;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.03;

    // Interaction influence - Slowed down
    this.sphere.rotation.y += 0.002;
    this.sphere.rotation.x += 0.001;

    this.sphere.position.x = this.mouse.x * 0.3;
    this.sphere.position.y = this.mouse.y * 0.3;

    this.shards.forEach((shard) => {
      shard.position.x += shard.userData.speedX + this.mouse.x * 0.001;
      shard.position.y += shard.userData.speedY + this.mouse.y * 0.001;
      shard.rotation.x += shard.userData.rotSpeed;
      shard.rotation.z += shard.userData.rotSpeed;

      // Boundary check
      if (shard.position.x > 8) shard.position.x = -8;
      if (shard.position.x < -8) shard.position.x = 8;
      if (shard.position.y > 8) shard.position.y = -8;
      if (shard.position.y < -8) shard.position.y = 8;
    });

    this.renderer.render(this.scene, this.camera);
  }
}

// Global initialization
document.addEventListener("DOMContentLoaded", () => {
  window.avantGardeBg = new AvantGardeBackground();
});
