"use client";

import { useEffect, useRef, useState } from "react";

type ParticleBackgroundProps = {
  isStreaming?: boolean;
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  update(canvasWidth: number, canvasHeight: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

function createParticle(canvasWidth: number, canvasHeight: number): Particle {
  const color =
    Math.random() > 0.5 ? "168, 85, 247" : "59, 130, 246";
  return {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    radius: Math.random() * 2 + 0.8,
    alpha: Math.random() * 0.5 + 0.2,
    color,
    update(cw: number, ch: number) {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > cw) this.vx *= -1;
      if (this.y < 0 || this.y > ch) this.vy *= -1;
    },
    draw(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(${this.color}, 0.8)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    },
  };
}

export default function ParticleBackground({
  isStreaming = false,
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    const cursor = cursorRef.current;
    if (!canvas || !wrapper || !cursor) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = isMobile ? 15 : 40;
    particlesRef.current = Array.from({ length: count }, () =>
      createParticle(canvas.width, canvas.height),
    );

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update(canvas.width, canvas.height);
        p.draw(ctx);
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const dx = p.x - other.x;
          const dy = p.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.15 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(render);
    };
    render();

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      cursor.style.transform = `translate3d(${clientX - 300}px, ${clientY - 300}px, 0)`;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const rotateX = (centerY - clientY) / 70;
      const rotateY = (clientX - centerX) / 90;
      wrapper.style.transform = `rotateX(${1.2 + rotateX}deg) rotateY(${-0.6 + rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      wrapper.style.transform = `rotateX(1.2deg) rotateY(-0.6deg)`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    wrapper.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      wrapper.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [isMobile]);

  return (
    <div ref={wrapperRef} className="fixed inset-0 z-0 overflow-hidden bg-bg-dark">
      {/* Background mesh / radial gradients */}
      <div
        className="absolute top-[-15%] left-[-15%] w-[55%] h-[55%] rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(168,85,247,0.12) 45%, transparent 70%)",
          animation: "drift 25s ease-in-out infinite alternate",
          filter: "blur(50px)",
          zIndex: 0,
        }}
      />
      <div
        className="absolute bottom-[-15%] right-[-15%] w-[65%] h-[65%] rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgba(236,72,153,0.14) 0%, rgba(6,182,212,0.1) 50%, transparent 70%)",
          animation: "drift 32s ease-in-out infinite alternate-reverse",
          filter: "blur(50px)",
          zIndex: 0,
        }}
      />
      <div
        className="absolute top-[15%] left-[12%] w-[340px] h-[340px] rounded-full opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.28) 0%, transparent 70%)",
          filter: "blur(50px)",
          animation: "orbit 32s cubic-bezier(0.4,0,0.2,1) infinite",
          zIndex: 1,
        }}
      />
      <div
        className="absolute bottom-[12%] right-[12%] w-[340px] h-[340px] rounded-full opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)",
          filter: "blur(50px)",
          animation: "orbit 38s cubic-bezier(0.4,0,0.2,1) infinite",
          zIndex: 1,
        }}
      />

      {/* Canvas particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-[2] pointer-events-none"
      />

      {/* Cursor glow */}
      <div
        ref={cursorRef}
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none z-[3] transition-transform duration-75"
        style={{
          background: "rgba(168,85,247,0.12)",
          filter: "blur(140px)",
        }}
      />
    </div>
  );
}
