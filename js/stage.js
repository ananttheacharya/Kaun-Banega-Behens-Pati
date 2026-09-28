/**
 * KAUN BANEGA CROREPATI - STAGE LIGHTING & FOG ENGINE
 * Renders cinematic moving volumetric spotlights, drifting atmospheric fog,
 * floor reflections, and celebration particle fireworks.
 */

class KBCStageEffect {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.mode = 'ambient'; // 'ambient', 'tension', 'locked', 'correct', 'wrong', 'finale'
    this.time = 0;

    // Spotlights configuration
    this.spotlights = [
      { originX: 0.15, originY: 0, angle: Math.PI / 4, sweepSpeed: 0.008, sweepRange: 0.25, color: 'rgba(0, 162, 255, 0.18)', width: 140 },
      { originX: 0.35, originY: 0, angle: Math.PI / 3, sweepSpeed: -0.006, sweepRange: 0.2, color: 'rgba(92, 45, 235, 0.22)', width: 160 },
      { originX: 0.50, originY: -0.05, angle: Math.PI / 2, sweepSpeed: 0.010, sweepRange: 0.15, color: 'rgba(0, 217, 255, 0.20)', width: 180 },
      { originX: 0.65, originY: 0, angle: (2 * Math.PI) / 3, sweepSpeed: 0.007, sweepRange: 0.2, color: 'rgba(92, 45, 235, 0.22)', width: 160 },
      { originX: 0.85, originY: 0, angle: (3 * Math.PI) / 4, sweepSpeed: -0.009, sweepRange: 0.25, color: 'rgba(0, 162, 255, 0.18)', width: 140 }
    ];

    // Drifting Fog Particles
    this.fogParticles = [];
    const fogCount = 38;
    for (let i = 0; i < fogCount; i++) {
      this.fogParticles.push({
        x: Math.random() * this.width,
        y: this.height * 0.55 + Math.random() * (this.height * 0.45),
        radius: 70 + Math.random() * 110,
        vx: (Math.random() - 0.4) * 0.35,
        vy: (Math.random() - 0.5) * 0.1,
        alpha: 0.03 + Math.random() * 0.05,
        pulseSpeed: 0.01 + Math.random() * 0.02
      });
    }

    // Floating Dust / Spark Motes
    this.dustMotes = [];
    for (let i = 0; i < 45; i++) {
      this.dustMotes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.15 - Math.random() * 0.3,
        size: 1 + Math.random() * 2.2,
        alpha: 0.2 + Math.random() * 0.5
      });
    }

    // Confetti for victory
    this.confetti = [];

    window.addEventListener('resize', () => this.onResize());
    this.animate();
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === 'correct' || mode === 'finale') {
      this.triggerConfetti();
    }
  }

  triggerConfetti() {
    this.confetti = [];
    const colors = ['#f5a623', '#27ae60', '#00d2ff', '#e056fd', '#ffffff', '#fffa65'];
    for (let i = 0; i < 120; i++) {
      this.confetti.push({
        x: this.width * (0.3 + Math.random() * 0.4),
        y: this.height * 0.4,
        vx: (Math.random() - 0.5) * 12,
        vy: -6 - Math.random() * 10,
        gravity: 0.22,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 7,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
        alpha: 1
      });
    }
  }

  animate() {
    this.time += 0.016;
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.drawStageFloor();
    this.drawSpotlights();
    this.drawFog();
    this.drawDust();
    this.drawConfetti();

    requestAnimationFrame(() => this.animate());
  }

  drawStageFloor() {
    const ctx = this.ctx;
    const floorY = this.height * 0.65;

    // Floor horizon gradient
    const grad = ctx.createLinearGradient(0, floorY, 0, this.height);
    grad.addColorStop(0, 'rgba(4, 9, 32, 0.4)');
    grad.addColorStop(0.3, 'rgba(8, 22, 65, 0.7)');
    grad.addColorStop(1, 'rgba(3, 8, 24, 0.95)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, floorY, this.width, this.height - floorY);

    // Concentric neon stage circle rings
    const centerX = this.width * 0.5;
    const centerFloorY = this.height * 0.76;
    const pulse = Math.sin(this.time * 2) * 0.15 + 0.85;

    let ringColor = 'rgba(0, 195, 255, ';
    if (this.mode === 'locked') ringColor = 'rgba(245, 166, 35, ';
    if (this.mode === 'correct') ringColor = 'rgba(39, 174, 96, ';
    if (this.mode === 'wrong') ringColor = 'rgba(231, 76, 60, ';

    const ringRadii = [80, 160, 260, 380];
    ringRadii.forEach((r, idx) => {
      ctx.save();
      ctx.beginPath();
      // Scale vertically to create 3D elliptical floor perspective
      ctx.scale(1, 0.28);
      ctx.arc(centerX, centerFloorY / 0.28, r, 0, Math.PI * 2);
      ctx.restore();

      ctx.lineWidth = idx === 1 ? 2.5 : 1.2;
      const alpha = (0.28 / (idx + 1)) * pulse;
      ctx.strokeStyle = ringColor + alpha + ')';
      ctx.stroke();
    });
  }

  drawSpotlights() {
    const ctx = this.ctx;

    this.spotlights.forEach((spot, idx) => {
      let currentAngle = spot.angle + Math.sin(this.time * spot.sweepSpeed * 60 + idx) * spot.sweepRange;
      let spotColor = spot.color;

      if (this.mode === 'locked') {
        spotColor = 'rgba(245, 166, 35, 0.24)';
        // converge inwards to center
        currentAngle = Math.PI / 2 + (idx - 2) * 0.12;
      } else if (this.mode === 'correct') {
        spotColor = 'rgba(39, 174, 96, 0.28)';
      } else if (this.mode === 'wrong') {
        spotColor = 'rgba(231, 76, 60, 0.28)';
      } else if (this.mode === 'finale') {
        const colors = ['rgba(255, 75, 75, 0.28)', 'rgba(75, 255, 120, 0.28)', 'rgba(0, 200, 255, 0.28)', 'rgba(255, 220, 0, 0.28)'];
        spotColor = colors[(idx + Math.floor(this.time * 2)) % colors.length];
      }

      const ox = spot.originX * this.width;
      const oy = spot.originY * this.height;
      const length = this.height * 1.35;

      const endX = ox + Math.cos(currentAngle) * length;
      const endY = oy + Math.sin(currentAngle) * length;

      // Draw light cone
      ctx.save();
      const perpX = -Math.sin(currentAngle);
      const perpY = Math.cos(currentAngle);
      const spread = spot.width * 1.8;

      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(endX - perpX * spread, endY - perpY * spread);
      ctx.lineTo(endX + perpX * spread, endY + perpY * spread);
      ctx.closePath();

      const coneGrad = ctx.createLinearGradient(ox, oy, endX, endY);
      coneGrad.addColorStop(0, spotColor);
      coneGrad.addColorStop(0.3, spotColor);
      coneGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = coneGrad;
      ctx.fill();
      ctx.restore();
    });
  }

  drawFog() {
    const ctx = this.ctx;

    this.fogParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -p.radius) p.x = this.width + p.radius;
      if (p.x > this.width + p.radius) p.x = -p.radius;

      ctx.save();
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      grad.addColorStop(0, `rgba(40, 90, 180, ${p.alpha * 1.5})`);
      grad.addColorStop(0.5, `rgba(20, 45, 110, ${p.alpha})`);
      grad.addColorStop(1, 'rgba(10, 20, 60, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawDust() {
    const ctx = this.ctx;
    this.dustMotes.forEach(m => {
      m.x += m.vx;
      m.y += m.vy;

      if (m.y < 0) {
        m.y = this.height;
        m.x = Math.random() * this.width;
      }

      ctx.save();
      ctx.fillStyle = `rgba(220, 240, 255, ${m.alpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawConfetti() {
    if (this.confetti.length === 0) return;
    const ctx = this.ctx;

    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += c.gravity;
      c.rotation += c.rotSpeed;
      c.alpha -= 0.003;

      if (c.y > this.height || c.alpha <= 0) {
        this.confetti.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate((c.rotation * Math.PI) / 180);
      ctx.fillStyle = c.color;
      ctx.globalAlpha = Math.max(0, c.alpha);
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
      ctx.restore();
    }
  }
}

// Stage effect instance placeholder
let stageEffect = null;
