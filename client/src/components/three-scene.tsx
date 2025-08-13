import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Sphere, Box } from "@react-three/drei";
import { Mesh } from "three";

function FloatingCube({ position, color, delay = 0 }: { position: [number, number, number]; color: string; delay?: number }) {
  const meshRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + delay) * 0.3;
    }
  });

  return (
    <Box ref={meshRef} position={position} args={[0.5, 0.5, 0.5]}>
      <meshStandardMaterial color={color} />
    </Box>
  );
}

function FloatingSphere({ position, color, delay = 0 }: { position: [number, number, number]; color: string; delay?: number }) {
  const meshRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + delay) * 0.4;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Sphere ref={meshRef} position={position} args={[0.3, 16, 16]}>
      <meshStandardMaterial color={color} />
    </Sphere>
  );
}

function CentralOrb() {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      const scale = hovered ? 1.2 : 1.0 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Sphere 
      ref={meshRef} 
      position={[0, 0, 0]} 
      args={[1, 32, 32]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial 
        color="#8b5cf6" 
        emissive="#4c1d95" 
        emissiveIntensity={hovered ? 0.5 : 0.2}
      />
    </Sphere>
  );
}

export default function ThreeScene() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#06b6d4" />
        
        <CentralOrb />
        
        {/* Floating elements */}
        <FloatingCube position={[-2, 1, -1]} color="#a855f7" delay={0} />
        <FloatingCube position={[2, -1, 1]} color="#06b6d4" delay={1} />
        <FloatingSphere position={[1.5, 1.5, -2]} color="#ec4899" delay={0.5} />
        <FloatingSphere position={[-1.8, -1.2, 2]} color="#10b981" delay={1.5} />
        
        {/* Smaller floating particles */}
        <FloatingCube position={[3, 0.5, 0]} color="#f59e0b" delay={2} />
        <FloatingSphere position={[-3, -0.5, 0]} color="#ef4444" delay={2.5} />
        
        <Text
          position={[0, -2.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          fontFamily="Inter"
        >
          Interactive 3D Scene
        </Text>
        
        <Text
          position={[0, -3, 0]}
          fontSize={0.15}
          color="#9ca3af"
          anchorX="center"
          anchorY="middle"
          fontFamily="Inter"
        >
          Powered by React Three Fiber
        </Text>
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}
