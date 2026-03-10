"use client";

import { useRef, useMemo, useState, useEffect, Component, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Error boundary to catch Three.js crashes
class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function Particles({ count = 200 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(particles, 3));
    return geo;
  }, [particles]);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    const posAttr = mesh.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.3 + i * 0.1) * 0.002;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={mesh} geometry={geometry}>
      <pointsMaterial
        size={0.03}
        color="#a78bfa"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function FloatingOrb({
  position,
  scale,
  color,
}: {
  position: [number, number, number];
  scale: number;
  color: string;
}) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.3;
    mesh.current.position.x =
      position[0] + Math.cos(state.clock.elapsedTime * 0.3 + position[1]) * 0.1;
  });

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} />
    </mesh>
  );
}

function CSSFallback() {
  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-chrono-accent/5 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-chrono-accent-warm/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400/3 rounded-full blur-[80px] animate-float" style={{ animationDelay: "4s" }} />
    </div>
  );
}

export default function ParticleField() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <CSSFallback />;

  return (
    <CanvasErrorBoundary fallback={<CSSFallback />}>
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, alpha: true }}
        >
          <Particles count={150} />
          <FloatingOrb position={[-3, 1, -2]} scale={1.5} color="#a78bfa" />
          <FloatingOrb position={[3, -1, -3]} scale={2} color="#f9a8d4" />
          <FloatingOrb position={[0, 2, -4]} scale={1} color="#67e8f9" />
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  );
}
