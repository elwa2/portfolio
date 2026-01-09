/**
 * Ultimate Rebirth Engine - 2026
 * Professional Architecture for Ultra-Premium Experience
 */

class RaedEngine {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetX = 0;
    this.targetY = 0;

    this.init();
  }

  init() {
    this.initThree();
    this.initCursor();
    this.initAnimations();
    this.addEventListeners();
  }

  initThree() {
    const container = document.getElementById("canvas-container");
    if (!container) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Ultra-Fine Particle System
    const geo = new THREE.BufferGeometry();
    const count = 4000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 20;
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.008,
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);

    this.animate();
  }

  initCursor() {
    const cursor = document.querySelector(".custom-cursor");
    const cursorDot = document.querySelector(".cursor-dot");

    // Ensure visibility
    gsap.set([cursor, cursorDot], { opacity: 1, display: "block" });

    const moveCursor = (e) => {
      const { clientX: x, clientY: y } = e;

      // Outer ring with slight delay
      gsap.to(cursor, {
        x: x,
        y: y,
        duration: 0.3,
        ease: "power2.out",
        xPercent: -50,
        yPercent: -50,
      });

      // Central dot - instant
      gsap.to(cursorDot, {
        x: x,
        y: y,
        duration: 0,
        xPercent: -50,
        yPercent: -50,
      });
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseenter", () => {
      gsap.to([cursor, cursorDot], { opacity: 1 });
    });
    document.addEventListener("mouseleave", () => {
      gsap.to([cursor, cursorDot], { opacity: 0 });
    });

    // Hover Effects
    document
      .querySelectorAll("a, button, .pkg-card, .pay-card")
      .forEach((el) => {
        el.addEventListener("mouseenter", () => {
          gsap.to(cursor, {
            scale: 1.5,
            backgroundColor: "rgba(94, 59, 238, 0.1)",
            borderColor: "#fff",
            duration: 0.3,
          });
        });
        el.addEventListener("mouseleave", () => {
          gsap.to(cursor, {
            scale: 1,
            backgroundColor: "transparent",
            borderColor: "#5e3bee",
            duration: 0.3,
          });
        });
      });
  }

  initAnimations() {
    gsap.from(".hero-content h1", {
      letterSpacing: "50px",
      opacity: 0,
      duration: 2,
      ease: "power4.out",
    });

    gsap.from(".hero-content p", {
      y: 30,
      opacity: 0,
      duration: 1.5,
      delay: 1,
      ease: "power3.out",
    });
  }

  addEventListeners() {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener("mousemove", (e) => {
      this.targetX = (e.clientX - window.innerWidth / 2) * 0.0005;
      this.targetY = (e.clientY - window.innerHeight / 2) * 0.0005;
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.mouseX += (this.targetX - this.mouseX) * 0.05;
    this.mouseY += (this.targetY - this.mouseY) * 0.05;

    this.particles.rotation.y += 0.0005;
    this.particles.rotation.x = this.mouseY;
    this.particles.rotation.y = this.mouseX;

    this.renderer.render(this.scene, this.camera);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new RaedEngine();
});
