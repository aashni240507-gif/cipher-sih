"use client";

import React, { useEffect, useRef } from "react";

interface ConstellationCanvasProps {
  className?: string;
  particleDensity?: number;
  highlightColor?: string;
}

export default function ConstellationCanvas({
  className = "fixed inset-0 pointer-events-none z-0",
  particleDensity = 20000,
  highlightColor = "#FF453A",
}: ConstellationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    class Particle {
      x = 0;
      y = 0;
      vx = 0;
      vy = 0;
      radius = 0;
      isRed = false;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
        this.isRed = Math.random() < 0.25;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.isRed ? "rgba(255, 69, 58, 0.7)" : "rgba(70, 110, 160, 0.4)";
        if (this.isRed) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = highlightColor;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    let particles: Particle[] = [];

    function init() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particles = [];
      const count = Math.max(25, Math.floor((width * height) / particleDensity));
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    init();

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const alpha = 1 - dist / 110;
            if (particles[i].isRed || particles[j].isRed) {
              ctx.strokeStyle = `rgba(255, 69, 58, ${alpha * 0.25})`;
              ctx.lineWidth = 0.8;
            } else {
              ctx.strokeStyle = `rgba(50, 90, 140, ${alpha * 0.15})`;
              ctx.lineWidth = 0.5;
            }
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      init();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [particleDensity, highlightColor]);

  return <canvas ref={canvasRef} className={className} />;
}
