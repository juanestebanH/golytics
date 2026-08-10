import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointMaterial, Points } from '@react-three/drei';
import type { Group } from 'three';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };

  static getDerivedStateFromError() {
    return { error: true };
  }

  render() {
    return this.state.error ? null : this.props.children;
  }
}

function generarPuntos(conteo: number, radio: number): Float32Array {
  const posiciones = new Float32Array(conteo * 3);
  for (let i = 0; i < conteo; i++) {
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radio * Math.cbrt(Math.random());
    posiciones[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    posiciones[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    posiciones[i * 3 + 2] = r * Math.cos(phi);
  }
  return posiciones;
}

function useConteoParticulas(): number {
  const [conteo, setConteo] = useState(() =>
    window.innerWidth < 640 ? 500 : 1000,
  );

  useEffect(() => {
    const onResize = () => setConteo(window.innerWidth < 640 ? 500 : 1000);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return conteo;
}

function CampoParticulas() {
  const grupoRef = useRef<Group>(null);
  const conteo = useConteoParticulas();
  const posiciones = useMemo(() => generarPuntos(conteo, 5.5), [conteo]);
  const [reducirMovimiento] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useFrame(() => {
    if (reducirMovimiento || !grupoRef.current) return;
    grupoRef.current.rotation.y += 0.0005;
  });

  return (
    <group ref={grupoRef}>
      <Points positions={posiciones} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          depthWrite={false}
          color="#a78bfa"
          size={0.02}
          sizeAttenuation
          opacity={0.7}
        />
      </Points>
    </group>
  );
}

export default function HeroBackground() {
  return (
    <ErrorBoundary>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 7], fov: 50 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <CampoParticulas />
          </Suspense>
        </Canvas>
      </div>
    </ErrorBoundary>
  );
}
