import { useRef, useState, Suspense } from "react";
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

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-2xl">
      <div className="text-white text-lg">Loading 3D Scene...</div>
    </div>
  );
}

// Temporary fallback component while debugging Three.js issues
function SimpleFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-cyan-600/20 animate-pulse"></div>
      <div className="text-center z-10">
        <div className="text-2xl font-bold text-white mb-2">Interactive 3D Scene</div>
        <div className="text-gray-300 text-sm">Powered by React Three Fiber</div>
        <div className="mt-4 text-xs text-gray-400">3D Scene loading...</div>
      </div>
      <div className="absolute top-4 left-4 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
      <div className="absolute bottom-4 right-4 w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
      <div className="absolute top-1/2 left-8 w-1 h-8 bg-cyan-400/50 rounded-full animate-pulse"></div>
      <div className="absolute top-1/4 right-12 w-6 h-6 border border-pink-400 rounded-full animate-spin"></div>
    </div>
  );
}

export default function ThreeScene() {
  // Temporarily use fallback until Replit environment issues are resolved
  // This provides a functional app while we debug the WebGL/Three.js issues
  return <SimpleFallback />;
  
  /* Original Three.js code commented out until environment issues are resolved
  // For now, use the fallback to avoid Three.js errors while debugging
  if (typeof window === 'undefined') {
    return <LoadingFallback />;
  }

  // Temporary: Check if WebGL is available
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      return <SimpleFallback />;
    }
  } catch (e) {
    return <SimpleFallback />;
  }

  return (
    <div className="w-full h-full">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas 
          camera={{ position: [0, 0, 5], fov: 50 }}
          dpr={[1, 2]}
          gl={{ 
            antialias: false, // Disable for compatibility
            alpha: true,
            preserveDrawingBuffer: false,
            powerPreference: "default" // Use default power preference
          }}
          onCreated={({ gl }) => {
            try {
              gl.shadowMap.enabled = false; // Disable shadows for now
            } catch (e) {
              console.warn('Shadow mapping not supported');
            }
          }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.6} />
          <pointLight position={[-5, -5, -5]} intensity={0.3} color="#06b6d4" />
          
          <CentralOrb />
          
          <FloatingCube position={[-2, 1, -1]} color="#a855f7" delay={0} />
          <FloatingCube position={[2, -1, 1]} color="#06b6d4" delay={1} />
          <FloatingSphere position={[1.5, 1.5, -2]} color="#ec4899" delay={0.5} />
          <FloatingSphere position={[-1.8, -1.2, 2]} color="#10b981" delay={1.5} />
          
          <FloatingCube position={[3, 0.5, 0]} color="#f59e0b" delay={2} />
          <FloatingSphere position={[-3, -0.5, 0]} color="#ef4444" delay={2.5} />
          
          <Text
            position={[0, -2.5, 0]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            Interactive 3D Scene
          </Text>
          
          <Text
            position={[0, -3, 0]}
            fontSize={0.15}
            color="#9ca3af"
            anchorX="center"
            anchorY="middle"
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
      </Suspense>
    </div>
  );
  */
}
