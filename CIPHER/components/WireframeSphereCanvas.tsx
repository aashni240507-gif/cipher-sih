"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

export interface WireframeSphereHandle {
  getHotspots: () => { id: number; px: number; py: number; z: number }[];
  setActiveHotspot: (index: number | null) => void;
  getCanvasRect: () => DOMRect | null;
}

interface WireframeSphereProps {
  width?: number;
  height?: number;
  className?: string;
  rotationSpeed?: number;
}

const WireframeSphereCanvas = forwardRef<WireframeSphereHandle, WireframeSphereProps>(
  function WireframeSphereCanvas(
    { width = 280, height = 280, className = "w-full h-full", rotationSpeed = 1 }: WireframeSphereProps,
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const activeHotspotRef = useRef<{ index: number; startTime: number } | null>(null);
    const currentHotspotsRef = useRef<{ id: number; px: number; py: number; z: number }[]>([]);

    useImperativeHandle(ref, () => ({
      getHotspots: () => currentHotspotsRef.current,
      setActiveHotspot: (index: number | null) => {
        if (index === null) {
          activeHotspotRef.current = null;
        } else {
          activeHotspotRef.current = { index, startTime: Date.now() };
        }
      },
      getCanvasRect: () => canvasRef.current?.getBoundingClientRect() || null,
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let animId: number;
      const sphereRadius = Math.min(width, height) * 0.38;
      const numPoints = 65;
      const sphereNodes: { id: number; x: number; y: number; z: number; isHotspot: boolean }[] = [];

      // Initialize 3D Sphere points on a fibonacci sphere / uniform sphere
      for (let i = 0; i < numPoints; i++) {
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = Math.random() * Math.PI * 2;
        sphereNodes.push({
          id: i,
          x: sphereRadius * Math.sin(theta) * Math.cos(phi),
          y: sphereRadius * Math.sin(theta) * Math.sin(phi),
          z: sphereRadius * Math.cos(theta),
          isHotspot: Math.random() < 0.25 || i % 4 === 0,
        });
      }

      let angleX = 0;
      let angleY = 0;

      function renderSphere() {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        angleX += 0.0025 * rotationSpeed;
        angleY += 0.0038 * rotationSpeed;

        const perspective = Math.max(300, sphereRadius * 2.8);

        const projected = sphereNodes.map((node) => {
          // Rotate around Y
          const cosY = Math.cos(angleY);
          const sinY = Math.sin(angleY);
          const x1 = node.x * cosY + node.z * sinY;
          const z1 = -node.x * sinY + node.z * cosY;

          // Rotate around X
          const cosX = Math.cos(angleX);
          const sinX = Math.sin(angleX);
          const y2 = node.y * cosX - z1 * sinX;
          const z2 = node.y * sinX + z1 * cosX;

          const scale = perspective / (perspective + z2);
          return {
            id: node.id,
            px: cx + x1 * scale,
            py: cy + y2 * scale,
            z: z2,
            isHotspot: node.isHotspot,
          };
        });

        // Cache front-facing hotspots for the external signal animator
        currentHotspotsRef.current = projected
          .filter((p) => p.isHotspot && p.z > -sphereRadius * 0.35)
          .map((p) => ({ id: p.id, px: p.px, py: p.py, z: p.z }));

        // Draw wire lines between nearby points
        const maxWireDist = Math.max(45, sphereRadius * 0.44);
        for (let i = 0; i < projected.length; i++) {
          for (let j = i + 1; j < projected.length; j++) {
            const dx = projected[i].px - projected[j].px;
            const dy = projected[i].py - projected[j].py;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxWireDist) {
              ctx.beginPath();
              ctx.moveTo(projected[i].px, projected[i].py);
              ctx.lineTo(projected[j].px, projected[j].py);
              const isHot = projected[i].isHotspot && projected[j].isHotspot;
              ctx.strokeStyle = isHot
                ? "rgba(255, 69, 58, 0.45)"
                : "rgba(56, 120, 160, 0.24)";
              ctx.lineWidth = 1.0;
              ctx.stroke();
            }
          }
        }

        // Draw nodes
        const activeHotspot = activeHotspotRef.current;
        const now = Date.now();
        const scaleRatio = Math.max(1, sphereRadius / 100);

        projected.forEach((p) => {
          const alpha = (p.z + sphereRadius) / (sphereRadius * 2);
          const isActive = activeHotspot !== null && activeHotspot.index === p.id;

          ctx.beginPath();
          if (p.isHotspot) {
            const r = isActive ? 5.5 * scaleRatio : 4 * scaleRatio;
            ctx.arc(p.px, p.py, Math.min(r, 7), 0, Math.PI * 2);
            ctx.fillStyle = isActive ? "#FF3B30" : "#FF453A";
            ctx.shadowBlur = isActive ? 18 : 10;
            ctx.shadowColor = isActive ? "#FF3B30" : "#FF453A";
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw expanding radar ripple around active hotspot
            if (isActive) {
              const elapsed = (now - activeHotspot.startTime) % 1200;
              const maxR = 26 * scaleRatio;
              const rippleR = 5 + (elapsed / 1200) * maxR;
              const rippleAlpha = Math.max(0, 1 - elapsed / 1200);

              ctx.beginPath();
              ctx.arc(p.px, p.py, rippleR, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(255, 59, 48, ${rippleAlpha * 0.85})`;
              ctx.lineWidth = 1.4;
              ctx.stroke();

              // Secondary inner wave
              if (elapsed > 350) {
                const wave2R = 5 + ((elapsed - 350) / 1200) * maxR;
                const wave2Alpha = Math.max(0, 1 - (elapsed - 350) / 1200);
                ctx.beginPath();
                ctx.arc(p.px, p.py, wave2R, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(57, 217, 255, ${wave2Alpha * 0.65})`;
                ctx.lineWidth = 1.1;
                ctx.stroke();
              }
            }
          } else {
            ctx.arc(p.px, p.py, Math.max(1.8, 2 * scaleRatio), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(130, 180, 230, ${Math.max(0.2, alpha * 0.8)})`;
            ctx.fill();
          }
        });

        animId = requestAnimationFrame(renderSphere);
      }

      renderSphere();

      return () => {
        cancelAnimationFrame(animId);
      };
    }, [width, height, rotationSpeed]);

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={className}
      />
    );
  }
);

export default WireframeSphereCanvas;
