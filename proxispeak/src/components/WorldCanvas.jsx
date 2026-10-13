import { useEffect, useRef } from "react";

const WIDTH = 800;
const HEIGHT = 520;
const RADIUS = 100;
const SPEED = 6;

const otherUsers = [
  { id: 2, name: "Asha", x: 250, y: 150, color: "#f59e0b" },
  { id: 3, name: "Ravi", x: 520, y: 300, color: "#ec4899" },
  { id: 4, name: "Meera", x: 650, y: 120, color: "#a78bfa" },
];

export default function WorldCanvas({ onNearbyChange }) {
  const canvasRef = useRef(null);
  const me = useRef({ x: 400, y: 260 });
  const keys = useRef({});

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    let frameId;
    let lastNearby = "";

    const handleDown = (e) => {
      if (e.key.startsWith("Arrow")) e.preventDefault();
      keys.current[e.key.toLowerCase()] = true;
    };
    const handleUp = (e) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);

    function update() {
      const k = keys.current;
      if (k["w"] || k["arrowup"]) me.current.y -= SPEED;
      if (k["s"] || k["arrowdown"]) me.current.y += SPEED;
      if (k["a"] || k["arrowleft"]) me.current.x -= SPEED;
      if (k["d"] || k["arrowright"]) me.current.x += SPEED;

      me.current.x = Math.max(20, Math.min(WIDTH - 20, me.current.x));
      me.current.y = Math.max(20, Math.min(HEIGHT - 20, me.current.y));
    }

    function getNearby() {
      return otherUsers
        .map((u) => {
          const dist = Math.hypot(u.x - me.current.x, u.y - me.current.y);
          return { ...u, dist, volume: Math.max(0, 1 - dist / RADIUS) };
        })
        .filter((u) => u.dist <= RADIUS);
    }

    function drawAvatar(x, y, color, name) {
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(name, x, y - 26);
    }

    function draw(nearby) {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      ctx.beginPath();
      ctx.arc(me.current.x, me.current.y, RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(34,197,94,0.10)";
      ctx.fill();
      ctx.strokeStyle = "rgba(34,197,94,0.6)";
      ctx.stroke();

      otherUsers.forEach((u) => {
        const isNear = nearby.some((n) => n.id === u.id);
        drawAvatar(u.x, u.y, isNear ? u.color : "#64748b", u.name);
      });
      drawAvatar(me.current.x, me.current.y, "#38bdf8", "You");
    }

    function loop() {
      update();
      const nearby = getNearby();
      draw(nearby);

      const summary = nearby.map((u) => u.name + Math.round(u.volume * 100)).join();
      if (summary !== lastNearby) {
        lastNearby = summary;
        onNearbyChange(nearby);
      }
      frameId = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, [onNearbyChange]);

  return <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />;
}