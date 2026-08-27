import { useEffect, useRef } from 'react';

export default function TubesCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const mouse = { tx: width / 2, ty: height / 2 };
    const cursor = { x: width / 2, y: height / 2 };

    const handleMouseMove = (e) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth linear interpolation (lerp) for an executive lagging follow effect
      cursor.x += (mouse.tx - cursor.x) * 0.18;
      cursor.y += (mouse.ty - cursor.y) * 0.18;

      // 1. Soft professional radial glow aura
      const gradient = ctx.createRadialGradient(
        cursor.x, cursor.y, 0,
        cursor.x, cursor.y, 100
      );
      gradient.addColorStop(0, 'rgba(129, 140, 248, 0.22)'); // Executive indigo core
      gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.06)');
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, 100, 0, Math.PI * 2);
      ctx.fill();

      // 2. Crisp, clean outer tracking ring
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, 14, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Precise center point dot
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none', // Allows clicking through to buttons
        zIndex: 99999,
      }}
    />
  );
}