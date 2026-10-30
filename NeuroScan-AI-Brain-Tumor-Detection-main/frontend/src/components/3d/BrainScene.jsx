
import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'

/* Brain-inspired 3D placeholder */
function BrainPlaceholder() {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15
    }
  })

  return (
    <group ref={groupRef}>
      {/* Outer neural network shell */}
      <mesh scale={[1.05, 0.9, 0.85]}>
        <icosahedronGeometry args={[1, 3]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#6d28d9"
          emissiveIntensity={0.7}
          wireframe
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Inner glowing core */}
      <mesh scale={[0.82, 0.7, 0.68]}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#0891b2"
          emissiveIntensity={0.5}
          transparent
          opacity={0.22}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Neural nodes */}
      {Array.from({ length: 18 }, (_, i) => {
        const phi = Math.acos(1 - 2 * (i + 0.5) / 18)
        const theta = Math.PI * (1 + Math.sqrt(5)) * i
        const x = 1.08 * Math.sin(phi) * Math.cos(theta)
        const y = 0.92 * Math.cos(phi)
        const z = 0.85 * Math.sin(phi) * Math.sin(theta)

        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.035, 10, 10]} />
            <meshBasicMaterial color="#67e8f9" />
          </mesh>
        )
      })}
    </group>
  )
}

/* Floating neural particles */
function NeuralParticles() {
  const pointsRef = useRef()

  const positions = useMemo(() => {
    const count = 350
    const data = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const radius = 2 + Math.random() * 1.8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      data[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      data[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      data[i * 3 + 2] = radius * Math.cos(phi)
    }

    return data
  }, [])

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.025
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#22d3ee"
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  )
}

/* Main scene */
export default function BrainScene() {
  const containerRef = useRef(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <Canvas
        camera={{ position: [0, 0.4, 5], fov: 42 }}
        dpr={[1, 1.5]}
        frameloop={isVisible ? 'always' : 'never'}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'default',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[5, 6, 4]}
          intensity={1.5}
          color="#ffffff"
        />
        <pointLight
          position={[-4, 2, 3]}
          intensity={2}
          color="#8b5cf6"
        />
        <pointLight
          position={[0, -3, 3]}
          intensity={1.2}
          color="#22d3ee"
        />

        <Stars
          radius={40}
          depth={30}
          count={500}
          factor={2}
          fade
          speed={0.2}
        />

        <BrainPlaceholder />
        <NeuralParticles />

        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={2.5}
          maxDistance={8}
          autoRotate={false}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  )
}
