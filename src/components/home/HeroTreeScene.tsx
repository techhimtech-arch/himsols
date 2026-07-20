import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, Environment } from "@react-three/drei";
import * as THREE from "three";
import { TreePine, Users, MapPin } from "lucide-react";

// Procedural low-poly tree — no external assets
function LowPolyTree() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.getElapsedTime() * 0.18;
  });

  return (
    <group ref={group}>
      {/* trunk */}
      <mesh position={[0, -1.15, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.24, 1.3, 8]} />
        <meshStandardMaterial color="#3a2416" roughness={0.9} flatShading />
      </mesh>
      {/* foliage cluster — 3 icosahedrons */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <icosahedronGeometry args={[1.05, 0]} />
        <meshStandardMaterial color="#2e8b57" roughness={0.75} flatShading />
      </mesh>
      <mesh position={[-0.55, 0.05, 0.3]} castShadow>
        <icosahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#256b43" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0.5, 0.15, -0.35]} castShadow>
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#3aa76a" roughness={0.7} flatShading />
      </mesh>
      {/* ground disc */}
      <mesh position={[0, -1.85, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.6, 32]} />
        <meshStandardMaterial color="#0e2a1a" roughness={1} />
      </mesh>
    </group>
  );
}

// Orbiting stat card — positioned in 3D but rendered as crisp HTML
function OrbitStat({
  angle,
  radius = 2.6,
  height = 0,
  speed = 0.35,
  children,
}: {
  angle: number;
  radius?: number;
  height?: number;
  speed?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * speed + angle;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
    ref.current.position.y = height + Math.sin(t * 1.4) * 0.15;
  });

  return (
    <group ref={ref}>
      <Html center distanceFactor={7} zIndexRange={[10, 0]}>
        <div className="pointer-events-none select-none whitespace-nowrap rounded-xl border border-emerald-300/25 bg-[#020804]/70 backdrop-blur-md px-3.5 py-2 shadow-[0_8px_30px_-8px_rgba(16,185,129,0.35)]">
          {children}
        </div>
      </Html>
    </group>
  );
}

// Dust motes
function Motes() {
  const points = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 40; i++) {
      arr.push([
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
      ]);
    }
    return arr;
  }, []);
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });
  return (
    <group ref={group}>
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshBasicMaterial color="#a7f3d0" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export default function HeroTreeScene() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0.4, 5], fov: 42 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      aria-hidden="true"
    >
      <color attach="background" args={["#020804"]} />
      <fog attach="fog" args={["#020804", 5, 10]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 2]} intensity={1.4} color="#e8fff2" />
      <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#5eead4" />
      <Suspense fallback={null}>
        <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.5}>
          <LowPolyTree />
        </Float>
        <OrbitStat angle={0} radius={2.55} height={0.9} speed={0.28}>
          <div className="flex items-center gap-2">
            <TreePine className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100/80">
              per tree
            </span>
            <span className="text-sm font-bold text-white">₹269</span>
          </div>
        </OrbitStat>
        <OrbitStat angle={2.1} radius={2.8} height={-0.2} speed={0.28}>
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100/80">
              farmers
            </span>
            <span className="text-sm font-bold text-white">50</span>
          </div>
        </OrbitStat>
        <OrbitStat angle={4.2} radius={2.55} height={-1.1} speed={0.28}>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100/80">
              districts
            </span>
            <span className="text-sm font-bold text-white">7</span>
          </div>
        </OrbitStat>
        <Motes />
        <Environment preset="forest" />
      </Suspense>
    </Canvas>
  );
}
