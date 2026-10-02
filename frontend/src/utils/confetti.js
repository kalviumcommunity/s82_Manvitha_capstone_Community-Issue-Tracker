/**
 * Zero-dependency confetti particle engine.
 * Fires particle cannon bursts with copper, gold, amber, and mint palette.
 */

class ConfettiCannon {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    this.active = false;
  }

  initCanvas() {
    if (this.canvas) return;
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'cd-confetti-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '99999';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.resize();

    window.addEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    if (this.canvas) {
      this.resize();
    }
  };

  resize() {
    this.canvas.width = window.innerWidth * window.devicePixelRatio;
    this.canvas.height = window.innerHeight * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  createParticle(originX, originY, angleSpread = 60, speed = 12) {
    const colors = [
      '#B87333', // Copper
      '#C98545', // Light Copper
      '#FFD700', // Gold
      '#F59E0B', // Amber
      '#4ADE80', // Mint
      '#38BDF8', // Sky Blue
      '#F5F2ED', // Off-white
    ];

    const angle = ((Math.random() * angleSpread - angleSpread / 2) - 90) * (Math.PI / 180);
    const velocity = (Math.random() * 0.6 + 0.7) * speed;

    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      size: Math.random() * 7 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      wobble: Math.random() * 10,
      wobbleSpeed: Math.random() * 0.1 + 0.05,
      gravity: 0.35,
      opacity: 1,
      decay: Math.random() * 0.008 + 0.006,
      shape: Math.random() > 0.4 ? 'rect' : Math.random() > 0.5 ? 'circle' : 'ribbon',
    };
  }

  blast(options = {}) {
    this.initCanvas();
    const count = options.particleCount || 80;
    const originX = options.origin?.x !== undefined ? options.origin.x * window.innerWidth : window.innerWidth / 2;
    const originY = options.origin?.y !== undefined ? options.origin.y * window.innerHeight : window.innerHeight * 0.75;
    const spread = options.spread || 70;
    const speed = options.speed || 18;

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(originX, originY, spread, speed));
    }

    if (!this.active) {
      this.active = true;
      this.animate();
    }
  }

  popperBurst() {
    this.blast({
      particleCount: 60,
      origin: { x: 0.2, y: 0.9 },
      spread: 55,
      speed: 20,
    });
    this.blast({
      particleCount: 60,
      origin: { x: 0.8, y: 0.9 },
      spread: 55,
      speed: 20,
    });

    setTimeout(() => {
      this.blast({
        particleCount: 80,
        origin: { x: 0.5, y: 0.65 },
        spread: 85,
        speed: 16,
      });
    }, 180);
  }

  animate = () => {
    if (!this.active) return;

    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.wobble += p.wobbleSpeed;
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0 || p.y > window.innerHeight + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === 'ribbon') {
        this.ctx.fillRect(-p.size / 2, -p.size * 1.5, p.size * 0.8, p.size * 2);
      } else {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(this.animate);
    } else {
      this.active = false;
      this.cleanup();
    }
  };

  cleanup() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
      this.ctx = null;
    }
    window.removeEventListener('resize', this.handleResize);
  }
}

export const confetti = new ConfettiCannon();
export const blastPartyPopper = () => confetti.popperBurst();
