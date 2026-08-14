import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  opacity: number;
  shape: 'rect' | 'circle' | 'star';
}

const CONFETTI_COLORS = [
  '#d92d20', // Tuổi Trẻ Red
  '#f79009', // Gold
  '#1570ef', // Blue
  '#7f56d9', // Purple
  '#12b76a', // Green
  '#ee46bc', // Pink
  '#fec84b', // Yellow
];

export function BirthdayConfettiCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      return;
    }
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = 140;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * -height,
        w: Math.random() * 9 + 6,
        h: Math.random() * 5 + 4,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3.5 + 2.2,
        rot: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 8,
        opacity: Math.random() * 0.3 + 0.7,
        shape: Math.random() > 0.3 ? 'rect' : Math.random() > 0.5 ? 'circle' : 'star',
      });
    }

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vRot;

        // Wrap around top if fallen through bottom
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Sparkle / diamond
          ctx.beginPath();
          ctx.moveTo(0, -p.w / 2);
          ctx.lineTo(p.w / 3, 0);
          ctx.lineTo(0, p.w / 2);
          ctx.lineTo(-p.w / 3, 0);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 10050,
      }}
    />
  );
}
