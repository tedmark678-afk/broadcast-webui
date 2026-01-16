import React, { useRef, useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';

interface JoystickProps {
  onMove: (pan: number, tilt: number) => void;
  onZoom: (zoom: number) => void;
  size?: number;
}

const VirtualJoystick: React.FC<JoystickProps> = ({ onMove, onZoom, size = 200 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const maxDistance = size / 2 - 30; // Radius for knob movement

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

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-full border-4 border-cyan-500 shadow-lg shadow-cyan-500/50 cursor-grab active:cursor-grabbing select-none"
        style={{
          width: size,
          height: size,
        }}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        role="slider"
        aria-label="Pan/Tilt joystick"
      >
        {/* Center point */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full" />

        {/* Grid lines */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/20" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/20" />

        {/* Cardinal directions labels */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-cyan-400 font-bold">↑</div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-cyan-400 font-bold">↓</div>
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-cyan-400 font-bold">←</div>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-cyan-400 font-bold">→</div>

        {/* Knob */}
        <div
          ref={knobRef}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full shadow-lg shadow-cyan-500/50 border-2 border-cyan-300 transition-all"
          style={{
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
          }}
        />
      </div>

      {/* Instructions */}
      <div className="text-center text-xs text-slate-400">
        <p>Drag to Pan/Tilt</p>
        <p>Scroll to Zoom</p>
      </div>

      {/* Position Display */}
      <div className="text-center text-sm font-mono text-cyan-400">
        <p>Pan: {(position.x / maxDistance).toFixed(2)}</p>
        <p>Tilt: {(-position.y / maxDistance).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default VirtualJoystick;
