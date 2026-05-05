"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, Sky } from "@react-three/drei";
import * as THREE from "three";

const MODEL_FORWARD_Y_OFFSET = -Math.PI / 2;
const TURN_SMOOTHNESS = 9;
const SHOW_ALIGNMENT_HELPERS = false;

export function RaceScene({
  progress,
  speed,
  paused,
}: {
  progress: number;
  speed: number;
  paused: boolean;
}) {
  return (
    <div className="relative h-[440px] overflow-hidden rounded-3xl border border-slate-300/80 bg-[#dbeafe] shadow-[0_18px_60px_rgba(30,41,59,0.18)]">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 5.2, 14], fov: 52 }}>
          <fog attach="fog" args={["#dbeafe", 22, 78]} />
          <color attach="background" args={["#dbeafe"]} />
          <Sky distance={4500} sunPosition={[40, 18, -8]} turbidity={4.5} rayleigh={1.8} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[10, 16, 5]} intensity={1.25} color="#fff7e6" />
          <directionalLight position={[-7, 6, -8]} intensity={0.32} color="#ffffff" />

          <RaceWorld progress={progress} speed={speed} paused={paused} />
        </Canvas>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,255,255,0.5),transparent_42%),linear-gradient(to_top,rgba(15,23,42,0.08),transparent_45%)]" />
    </div>
  );
}

function RaceWorld({
  progress,
  speed,
  paused,
}: {
  progress: number;
  speed: number;
  paused: boolean;
}) {
  const trikeRef = useRef<THREE.Group>(null);
  const tangentHelperRef = useRef<THREE.ArrowHelper>(null);
  const wheelFrontLeftRef = useRef<THREE.Mesh>(null);
  const wheelFrontRightRef = useRef<THREE.Mesh>(null);
  const wheelRearRef = useRef<THREE.Mesh>(null);
  const targetQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const targetEuler = useMemo(() => new THREE.Euler(), []);
  const helperOrigin = useMemo(() => new THREE.Vector3(), []);
  const helperDir = useMemo(() => new THREE.Vector3(), []);
  const tangentHelper = useMemo(
    () => new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0.46, 0), 2.2, 0xff3b30),
    [],
  );
  const curve = useMemo(() => {
    const points = [
      new THREE.Vector3(-24, 0, -6),
      new THREE.Vector3(-10, 0, 18),
      new THREE.Vector3(14, 0, 17),
      new THREE.Vector3(24, 0, -2),
      new THREE.Vector3(10, 0, -20),
      new THREE.Vector3(-15, 0, -18),
    ];
    return new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.4);
  }, []);

  const trackPoints = useMemo(() => curve.getPoints(260), [curve]);
  const lanePoints = useMemo(() => curve.getPoints(120), [curve]);
  const roadsideProps = useMemo(
    () =>
      Array.from({ length: 52 }).map((_, i) => {
        const t = i / 52;
        const p = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
        const side = i % 2 === 0 ? 1 : -1;
        return {
          position: p.clone().add(normal.multiplyScalar(5.3 * side)),
          kind: i % 4 === 0 ? "marker" : "tree",
          height: 1.5 + (i % 4) * 0.5,
        };
      }),
    [curve],
  );

  useFrame((state, delta) => {
    if (!trikeRef.current) return;
    const t = progress / 100;
    const position = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();

    trikeRef.current.position.lerp(position.clone().add(new THREE.Vector3(0, 0.46, 0)), 0.36);
    const heading = Math.atan2(tangent.x, tangent.z);
    targetEuler.set(0, heading, 0);
    targetQuaternion.setFromEuler(targetEuler);
    const turnLerp = 1 - Math.exp(-TURN_SMOOTHNESS * delta);
    trikeRef.current.quaternion.slerp(targetQuaternion, turnLerp);

    if (SHOW_ALIGNMENT_HELPERS && tangentHelperRef.current) {
      helperOrigin.copy(trikeRef.current.position);
      helperDir.copy(tangent);
      tangentHelperRef.current.position.copy(helperOrigin);
      tangentHelperRef.current.setDirection(helperDir);
    }

    const spin = paused ? 0 : delta * Math.max(speed / 2.8, 0);
    if (wheelFrontLeftRef.current) wheelFrontLeftRef.current.rotation.z -= spin;
    if (wheelFrontRightRef.current) wheelFrontRightRef.current.rotation.z -= spin;
    if (wheelRearRef.current) wheelRearRef.current.rotation.z -= spin;

    const dynamicOffset = 7.5 + speed * 0.04;
    const cameraTarget = position
      .clone()
      .add(tangent.clone().multiplyScalar(-dynamicOffset))
      .add(new THREE.Vector3(0, 3.8, 0));
    state.camera.position.lerp(cameraTarget, 0.1);
    state.camera.lookAt(position.x, 0.75, position.z);
  });

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <circleGeometry args={[56, 96]} />
        <meshStandardMaterial color="#6faa4d" />
      </mesh>

      <Line points={trackPoints} color="#6b7280" lineWidth={26} />
      <Line points={trackPoints} color="#3f3f46" lineWidth={22} />
      <Line points={lanePoints.filter((_, i) => i % 2 === 0)} color="#f8fafc" lineWidth={1.15} dashed dashSize={0.95} gapSize={0.9} />

      {SHOW_ALIGNMENT_HELPERS && (
        <primitive object={tangentHelper} ref={tangentHelperRef} />
      )}

      <group ref={trikeRef}>
        <group rotation={[0, MODEL_FORWARD_Y_OFFSET, 0]}>
        <mesh position={[0, 0.55, 0]} scale={[2.5, 0.95, 1.25]}>
          <sphereGeometry args={[0.42, 30, 24]} />
          <meshStandardMaterial color="#9ec877" roughness={0.58} metalness={0.15} />
        </mesh>
        <mesh position={[0.6, 0.58, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1.35, 0.65, 1.05]}>
          <capsuleGeometry args={[0.32, 0.58, 5, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[1.42, 0.52, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[0.85, 0.65, 0.55]}>
          <coneGeometry args={[0.32, 0.82, 20]} />
          <meshStandardMaterial color="#9ec877" roughness={0.55} metalness={0.2} />
        </mesh>
        <mesh position={[0.35, 0.82, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.9, 0.52, 0.8]}>
          <capsuleGeometry args={[0.18, 0.6, 4, 10]} />
          <meshStandardMaterial color="#94a3b8" transparent opacity={0.48} />
        </mesh>

        <mesh ref={wheelFrontLeftRef} position={[0.88, 0.23, 0.43]}>
          <torusGeometry args={[0.2, 0.06, 10, 26]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh ref={wheelFrontRightRef} position={[0.88, 0.23, -0.43]}>
          <torusGeometry args={[0.2, 0.06, 10, 26]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh ref={wheelRearRef} position={[-0.95, 0.2, 0]}>
          <torusGeometry args={[0.19, 0.055, 10, 26]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        </group>
      </group>

      {roadsideProps.map((item, idx) => (
        <group key={idx} position={[item.position.x, 0, item.position.z]}>
          {item.kind === "marker" ? (
            <>
              <mesh position={[0, 0.32, 0]}>
                <boxGeometry args={[0.2, 0.64, 0.2]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
              <mesh position={[0, 0.58, 0]}>
                <boxGeometry args={[0.24, 0.16, 0.24]} />
                <meshStandardMaterial color="#ef4444" />
              </mesh>
            </>
          ) : (
            <>
              <mesh position={[0, item.height / 2, 0]}>
                <cylinderGeometry args={[0.08, 0.11, item.height, 8]} />
                <meshStandardMaterial color="#6b4f2b" />
              </mesh>
              <mesh position={[0, item.height + 0.35, 0]}>
                <sphereGeometry args={[0.45 + (idx % 2) * 0.22, 14, 14]} />
                <meshStandardMaterial color={idx % 2 ? "#2f9e44" : "#3fb950"} />
              </mesh>
            </>
          )}
        </group>
      ))}

      {Array.from({ length: 12 }).map((_, idx) => (
        <mesh
          key={`building-${idx}`}
          position={[28 - (idx % 4) * 18, 1.5, -34 - Math.floor(idx / 4) * 8]}
          scale={[3.5, 3, 2.2]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={idx % 2 ? "#e5e7eb" : "#d1d5db"} />
        </mesh>
      ))}

      {Array.from({ length: 10 }).map((_, idx) => (
        <mesh
          key={`line-${idx}`}
          position={[18 - idx * 4, 0.01, 29]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[1.5, 0.3]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      ))}
    </>
  );
}
