import React, { useEffect, useRef } from 'react';
import { useDiary } from '../../context/DiaryContext';

export const AtmosphereCanvas: React.FC = () => {
  const { activeTheme, settings } = useDiary();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // Particle / Effect storage
    let time = 0;
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      pulseSpeed?: number;
      phase?: number;
      length?: number;
    }

    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      const count = settings.reducedMotion ? 15 : activeTheme === 'moonlight' ? 90 : activeTheme === 'cloudy' ? 70 : 45;

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * (activeTheme === 'moonlight' ? 2.2 : 3.5) + 0.8,
          speedX: (Math.random() - 0.5) * (activeTheme === 'foggy' ? 0.3 : 0.4),
          speedY: activeTheme === 'cloudy' ? Math.random() * 2.5 + 1.8 : (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.6 + 0.2,
          pulseSpeed: Math.random() * 0.02 + 0.005,
          phase: Math.random() * Math.PI * 2,
          length: activeTheme === 'cloudy' ? Math.random() * 14 + 10 : undefined,
        });
      }
    };

    initParticles();

    // Render loop
    const render = () => {
      time += settings.reducedMotion ? 0.004 : 0.015;

      // Draw background based on theme
      switch (activeTheme) {
        case 'ocean': {
          // Deep ocean gradient
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, '#030b14');
          grad.addColorStop(0.4, '#061626');
          grad.addColorStop(0.75, '#071f35');
          grad.addColorStop(1, '#020912');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Gentle ambient water glow at top center
          const moonReflection = ctx.createRadialGradient(width * 0.5, height * 0.3, 10, width * 0.5, height * 0.4, width * 0.6);
          moonReflection.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
          moonReflection.addColorStop(0.6, 'rgba(14, 116, 144, 0.03)');
          moonReflection.addColorStop(1, 'rgba(3, 11, 20, 0)');
          ctx.fillStyle = moonReflection;
          ctx.fillRect(0, 0, width, height);

          // Layered ocean waves
          const waveLayers = [
            { y: height * 0.72, amp: 14, freq: 0.004, speed: 0.8, color: 'rgba(14, 116, 144, 0.14)' },
            { y: height * 0.80, amp: 20, freq: 0.003, speed: 1.2, color: 'rgba(56, 189, 248, 0.10)' },
            { y: height * 0.88, amp: 26, freq: 0.002, speed: 0.6, color: 'rgba(8, 47, 73, 0.22)' },
          ];

          waveLayers.forEach((wave) => {
            ctx.beginPath();
            ctx.moveTo(0, height);
            for (let x = 0; x <= width; x += 8) {
              const y = wave.y + Math.sin(x * wave.freq + time * wave.speed) * wave.amp + Math.cos(x * 0.001 + time * 0.5) * (wave.amp * 0.5);
              ctx.lineTo(x, y);
            }
            ctx.lineTo(width, height);
            ctx.fillStyle = wave.color;
            ctx.fill();
          });

          // Soft floating luminous ocean motes
          particles.forEach((p) => {
            p.y -= 0.15;
            p.x += Math.sin(time + p.phase!) * 0.2;
            if (p.y < 0) p.y = height;
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;

            const alpha = Math.sin(time * (p.pulseSpeed || 0.01) + p.phase!) * 0.2 + 0.35;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(186, 230, 253, ${Math.max(0, alpha)})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
            ctx.fill();
            ctx.shadowBlur = 0;
          });
          break;
        }

        case 'beach': {
          // Warm sunset / twilight sky gradient
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, '#150912');
          grad.addColorStop(0.3, '#2b101c');
          grad.addColorStop(0.65, '#451a24');
          grad.addColorStop(0.85, '#6c2b29');
          grad.addColorStop(1, '#1b0d14');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Golden sunset sun glow
          const sunGlow = ctx.createRadialGradient(width * 0.5, height * 0.6, 20, width * 0.5, height * 0.65, width * 0.45);
          sunGlow.addColorStop(0, 'rgba(251, 146, 60, 0.25)');
          sunGlow.addColorStop(0.4, 'rgba(244, 63, 94, 0.12)');
          sunGlow.addColorStop(1, 'rgba(27, 13, 20, 0)');
          ctx.fillStyle = sunGlow;
          ctx.fillRect(0, 0, width, height);

          // Warm shoreline tidal waves
          const waveLayers = [
            { y: height * 0.78, amp: 12, freq: 0.003, speed: 0.9, color: 'rgba(251, 146, 60, 0.12)' },
            { y: height * 0.86, amp: 18, freq: 0.0025, speed: 0.6, color: 'rgba(194, 65, 12, 0.18)' },
          ];

          waveLayers.forEach((wave) => {
            ctx.beginPath();
            ctx.moveTo(0, height);
            for (let x = 0; x <= width; x += 8) {
              const y = wave.y + Math.sin(x * wave.freq + time * wave.speed) * wave.amp;
              ctx.lineTo(x, y);
            }
            ctx.lineTo(width, height);
            ctx.fillStyle = wave.color;
            ctx.fill();
          });

          // Floating golden dusk embers
          particles.forEach((p) => {
            p.y -= 0.25;
            p.x += Math.cos(time * 0.5 + p.phase!) * 0.3;
            if (p.y < 0) p.y = height;

            const alpha = Math.sin(time * 0.02 + p.phase!) * 0.25 + 0.35;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(253, 186, 116, ${Math.max(0, alpha)})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(251, 146, 60, 0.8)';
            ctx.fill();
            ctx.shadowBlur = 0;
          });
          break;
        }

        case 'cloudy': {
          // Muted overcast slate gradient
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, '#0a0d11');
          grad.addColorStop(0.5, '#131922');
          grad.addColorStop(1, '#0e1217');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Soft drifting cloud blobs
          ctx.fillStyle = 'rgba(148, 163, 184, 0.04)';
          for (let i = 0; i < 4; i++) {
            const cx = ((time * 20 * (i + 1) + i * 400) % (width + 600)) - 300;
            const cy = height * (0.2 + i * 0.15);
            ctx.beginPath();
            ctx.arc(cx, cy, 260 + i * 40, 0, Math.PI * 2);
            ctx.fill();
          }

          // Gentle falling raindrops
          ctx.strokeStyle = 'rgba(203, 213, 225, 0.25)';
          ctx.lineWidth = 1;
          particles.forEach((p) => {
            p.y += p.speedY;
            p.x += 0.4;
            if (p.y > height) {
              p.y = -20;
              p.x = Math.random() * width;
            }
            if (p.x > width) p.x = 0;

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + 2, p.y + (p.length || 12));
            ctx.stroke();
          });
          break;
        }

        case 'foggy': {
          // Deep emerald forest gradient
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, '#040b07');
          grad.addColorStop(0.45, '#081710');
          grad.addColorStop(0.85, '#0d2218');
          grad.addColorStop(1, '#050d09');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Rolling mist fog layers
          for (let layer = 0; layer < 3; layer++) {
            const fogY = height * (0.55 + layer * 0.15);
            const fogSpeed = (layer + 1) * 0.15;
            ctx.fillStyle = `rgba(52, 211, 153, ${0.035 - layer * 0.008})`;
            ctx.beginPath();
            ctx.moveTo(0, height);
            for (let x = 0; x <= width; x += 16) {
              const y = fogY + Math.sin(x * 0.003 + time * fogSpeed) * 35 + Math.cos(x * 0.001 - time * 0.1) * 20;
              ctx.lineTo(x, y);
            }
            ctx.lineTo(width, height);
            ctx.fill();
          }

          // Gentle forest spores / fireflies
          particles.forEach((p) => {
            p.x += Math.cos(time * 0.3 + p.phase!) * 0.3;
            p.y += Math.sin(time * 0.2 + p.phase!) * 0.2;
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            const alpha = Math.sin(time * 0.03 + p.phase!) * 0.3 + 0.4;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(167, 243, 208, ${Math.max(0, alpha)})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(52, 211, 153, 0.7)';
            ctx.fill();
            ctx.shadowBlur = 0;
          });
          break;
        }

        case 'moonlight': {
          // Night indigo space gradient
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, '#04050d');
          grad.addColorStop(0.5, '#070a1a');
          grad.addColorStop(0.85, '#0f142e');
          grad.addColorStop(1, '#050711');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Soft luminous moon glow
          const moonX = width * 0.82;
          const moonY = height * 0.18;
          const moonAura = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 220);
          moonAura.addColorStop(0, 'rgba(221, 214, 254, 0.22)');
          moonAura.addColorStop(0.4, 'rgba(167, 139, 250, 0.08)');
          moonAura.addColorStop(1, 'rgba(7, 10, 26, 0)');
          ctx.fillStyle = moonAura;
          ctx.fillRect(0, 0, width, height);

          // Glowing Crescent Moon
          ctx.beginPath();
          ctx.arc(moonX, moonY, 28, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(245, 243, 255, 0.85)';
          ctx.shadowBlur = 24;
          ctx.shadowColor = 'rgba(196, 181, 253, 0.9)';
          ctx.fill();
          ctx.shadowBlur = 0;

          // Subtle shadow to create crescent shape
          ctx.beginPath();
          ctx.arc(moonX + 9, moonY - 6, 26, 0, Math.PI * 2);
          ctx.fillStyle = '#060817';
          ctx.fill();

          // Twinkling stars
          particles.forEach((p) => {
            const alpha = Math.sin(time * (p.pulseSpeed || 0.015) + p.phase!) * 0.4 + 0.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(237, 233, 254, ${Math.max(0.1, alpha)})`;
            if (p.size > 2) {
              ctx.shadowBlur = 6;
              ctx.shadowColor = 'rgba(196, 181, 253, 0.8)';
            }
            ctx.fill();
            ctx.shadowBlur = 0;
          });
          break;
        }

        case 'vintage': {
          // Warm antique sepia parchment gradient
          const grad = ctx.createRadialGradient(width * 0.5, height * 0.5, width * 0.2, width * 0.5, height * 0.5, width * 0.75);
          grad.addColorStop(0, '#1c160f');
          grad.addColorStop(0.65, '#14100a');
          grad.addColorStop(1, '#090704');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Soft slow-floating dust specks in warm light
          particles.forEach((p) => {
            p.y -= 0.1;
            p.x += Math.sin(time * 0.4 + p.phase!) * 0.2;
            if (p.y < 0) p.y = height;
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;

            const alpha = Math.sin(time * 0.02 + p.phase!) * 0.2 + 0.25;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.9, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(250, 236, 205, ${Math.max(0, alpha)})`;
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'rgba(217, 178, 126, 0.4)';
            ctx.fill();
            ctx.shadowBlur = 0;
          });
          break;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTheme, settings.reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
    />
  );
};
