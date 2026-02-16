import React, { useRef, useEffect } from 'react';
import { soundFX } from '../utils/sound';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  decay: number;
}

interface Firework {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  exploded: boolean;
  particles: Particle[];
}

// Brighter, more festive colors (Gold, Red, Hot Pink, Cyan, Lime)
const COLORS = ['#FFD700', '#FF4500', '#FF1493', '#00FFFF', '#32CD32', '#FFFFFF', '#FF8C00'];

export const Fireworks: React.FC<{ active: boolean }> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize handler
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    let fireworks: Firework[] = [];
    let animationId: number;
    let tick = 0;

    const createFirework = () => {
      const x = Math.random() * canvas.width;
      // Target upper 40% of screen
      const targetY = canvas.height * 0.1 + Math.random() * (canvas.height * 0.3);
      fireworks.push({
        x,
        y: canvas.height,
        targetY,
        vy: -12 - Math.random() * 5, // Faster launch
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        exploded: false,
        particles: []
      });
      if (active) soundFX.playFireworkLaunch();
    };

    const createExplosion = (fw: Firework) => {
      if(active) soundFX.playFireworkExplosion();
      const particleCount = 80; // More particles
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        // Random velocity for more natural spread
        const speed = Math.random() * 6 + 2; 
        fw.particles.push({
          x: fw.x,
          y: fw.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: fw.color,
          decay: 0.015 + Math.random() * 0.015 // Varied decay
        });
      }
    };

    const loop = () => {
      // Create trails effect
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // Slower fade for longer trails
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter'; // Additive blending for glow

      // Spawn fireworks randomly
      // Increase frequency
      if (active && tick % 25 === 0) {
        createFirework();
      }
      tick++;

      // Update fireworks
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];

        if (!fw.exploded) {
          fw.y += fw.vy;
          fw.vy += 0.2; // Gravity

          ctx.beginPath();
          ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = fw.color;
          ctx.fill();

          if (fw.vy >= 0 || fw.y <= fw.targetY) {
            fw.exploded = true;
            createExplosion(fw);
          }
        } else {
          // Update particles
          for (let j = fw.particles.length - 1; j >= 0; j--) {
            const p = fw.particles[j];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.08; // Gravity
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
              fw.particles.splice(j, 1);
            } else {
              ctx.beginPath();
              ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${parseInt(p.color.slice(1, 3), 16)}, ${parseInt(p.color.slice(3, 5), 16)}, ${parseInt(p.color.slice(5, 7), 16)}, ${p.alpha})`;
              ctx.fill();
            }
          }

          if (fw.particles.length === 0) {
            fireworks.splice(i, 1);
          }
        }
      }

      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [active]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};