import React, { useRef, useEffect, useState } from 'react';

interface JoystickProps {
  onMove: (pan: number, tilt: number) => void;
  onZoom: (zoom: number) => void;
  size?: number;
}

const VirtualJoystick: React.FC<JoystickProps> = ({ onMove, onZoom, size = 220 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const maxDistance = (size / 2) - 40; // Radius for knob movement

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onMove(0, 0);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    let x = e.clientX - rect.left - centerX;
    let y = e.clientY - rect.top - centerY;

    // Constrain to circle
    const distance = Math.sqrt(x * x + y * y);
    if (distance > maxDistance) {
      x = (x / distance) * maxDistance;
      y = (y / distance) * maxDistance;
    }

    setPosition({ x, y });

    // Normalize to -1 to 1
    const panNorm = x / maxDistance;
    const tiltNorm = -y / maxDistance; // Invert Y for intuitive control

    onMove(panNorm, tiltNorm);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, maxDistance]);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
    onZoom(zoomDelta);
  };

  // Touch support
  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onMove(0, 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    let x = touch.clientX - rect.left - centerX;
    let y = touch.clientY - rect.top - centerY;

    const distance = Math.sqrt(x * x + y * y);
    if (distance > maxDistance) {
      x = (x / distance) * maxDistance;
      y = (y / distance) * maxDistance;
    }

    setPosition({ x, y });
    const panNorm = x / maxDistance;
    const tiltNorm = -y / maxDistance;
    onMove(panNorm, tiltNorm);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs">
      <div
        ref={containerRef}
        className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-full border-4 border-cyan-500 shadow-2xl shadow-cyan-500/30 cursor-grab active:cursor-grabbing select-none"
        style={{
          width: size,
          height: size,
          aspectRatio: '1',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onWheel={handleWheel}
        role="slider"
        aria-label="Pan/Tilt joystick"
      >
        {/* Center point */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full z-10" />

        {/* Grid lines (crosshair) */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/20 z-0" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/20 z-0" />

        {/* Cardinal directions labels */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-sm text-cyan-400 font-bold z-20">↑</div>
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-sm text-cyan-400 font-bold z-20">↓</div>
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-cyan-400 font-bold z-20">←</div>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-cyan-400 font-bold z-20">→</div>

        {/* Knob */}
        <div
          ref={knobRef}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full shadow-xl shadow-cyan-500/60 border-3 border-cyan-300 transition-all duration-75 z-30"
          style={{
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
            boxShadow: isDragging 
              ? '0 0 20px 8px rgba(6, 182, 212, 0.6)' 
              : '0 8px 16px rgba(6, 182, 212, 0.4)',
          }}
        >
          {/* Inner knob highlight */}
          <div className="absolute inset-2 bg-gradient-to-br from-cyan-200 to-cyan-400 rounded-full opacity-30" />
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-xs text-slate-400 space-y-1">
        <p className="font-semibold">Drag to Pan/Tilt</p>
        <p>Scroll to Zoom</p>
      </div>

      {/* Position Display */}
      <div className="text-center text-xs font-mono text-cyan-300 bg-slate-800/50 px-3 py-2 rounded border border-cyan-500/30 w-full">
        <div>Pan: {(position.x / maxDistance).toFixed(2)}</div>
        <div>Tilt: {(-position.y / maxDistance).toFixed(2)}</div>
      </div>
    </div>
  );
};

export default VirtualJoystick;
