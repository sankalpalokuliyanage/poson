import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { ARButton, XR } from '@react-three/xr';

// Safe SVG Icons to replace external dependencies completely
const SparklesIcon = () => (
  <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const SmartphoneIcon = () => (
  <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const HelpCircleIcon = () => (
  <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const LoaderIcon = () => (
  <svg className="w-8 h-8 text-teal-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
  </svg>
);

// React Error Boundary to catch 3D loading errors (e.g. 404 GLB file missing) and show fallback mesh instead of crashing
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.warn("GLB model failed to load. Using beautiful fallback mesh instead.", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Stylized Golden 3D Figurine representing King Devanampiyatissa if GLB is missing
function FallbackKingModel() {
  return (
    <group position={[0, 0, 0]}>
      {/* Base Pedestal */}
      <mesh position={[0, 0.075, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.45, 0.15, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      {/* Body / Golden Robe */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.25, 1.2, 16]} />
        <meshStandardMaterial color="#d97706" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Head / Golden Crown */}
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  );
}

// King Tissa 3D GLTF Loader Component
function KingTissaModel({ onLoadSuccess }) {
  // Use Vite public folder asset resolution safely
  const { scene } = useGLTF('/models/king_tissa.glb');
  
  useEffect(() => {
    if (scene && onLoadSuccess) {
      onLoadSuccess();
    }
  }, [scene, onLoadSuccess]);

  return (
    <primitive 
      object={scene} 
      position={[0, 0, 0]} 
      scale={[0.8, 0.8, 0.8]} 
      castShadow
      receiveShadow
    />
  );
}

// Standard WebGL Loader mesh placeholder inside Canvas
function LoaderPlaceholder() {
  return (
    <mesh position={[0, 0.7, 0]}>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial color="#0ea5e9" wireframe />
    </mesh>
  );
}

export default function App() {
  const [modelLoading, setModelLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Check if WebXR is supported when page loads
  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        if (!supported) {
          setErrorMsg('WebXR AR is not fully supported on this browser. For best experience, open Vercel HTTPS link on Android Chrome or Mozilla WebXR Viewer on iOS.');
        }
      });
    } else {
      setErrorMsg('WebXR is missing on this device. Please use a modern mobile browser (Chrome/Safari) with HTTPS connection.');
    }
  }, []);

  return (
    <div className="relative w-screen h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans">
      
      {/* HEADER OVERLAY (Placed OUTSIDE Canvas to prevent namespace errors) */}
      <header className="absolute top-0 inset-x-0 z-10 p-4 bg-gradient-to-b from-slate-950/90 to-transparent backdrop-blur-xs flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
            <SparklesIcon />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide">Mihinthalaya AR Project</h1>
            <p className="text-[10px] text-slate-400">Tamsil 3D bta3 el Malek Devanampiyatissa</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-teal-400 flex items-center gap-1.5 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse inline-block"></span>
          AR Ready
        </div>
      </header>

      {/* ERROR MESSAGE DISPLAY */}
      {errorMsg && (
        <div className="absolute top-16 left-4 right-4 z-30 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-2.5 backdrop-blur-md">
          <AlertTriangleIcon />
          <p className="text-xs text-red-300 leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {/* THREE.JS CANVAS CONTAINER */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Canvas shadows camera={{ position: [0, 1.5, 3], fov: 45 }}>
          {/* Meditative golden/white ambient environment lighting */}
          <ambientLight intensity={0.7} />
          <directionalLight 
            position={[5, 10, 5]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize={[1024, 1024]} 
          />
          <pointLight position={[-5, 5, -5]} intensity={0.5} />

          {/* WebXR immersive setup */}
          <XR>
            <Suspense fallback={<LoaderPlaceholder />}>
              <ModelErrorBoundary fallback={<FallbackKingModel />}>
                <KingTissaModel onLoadSuccess={() => setModelLoading(false)} />
              </ModelErrorBoundary>
            </Suspense>
          </XR>

          {/* Fallback interactive controls for normal web screen viewing */}
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05} 
            maxPolarAngle={Math.PI / 2} 
            minDistance={1} 
            maxDistance={10} 
          />
        </Canvas>
      </div>

      {/* BOTTOM CONTROL PANEL */}
      <section className="absolute bottom-0 inset-x-0 z-10 p-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex flex-col items-center gap-4">
        
        {/* AR Guide */}
        <div className="w-full max-w-md bg-slate-900/95 border border-slate-800/80 p-4 rounded-xl shadow-xl flex flex-col gap-2 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <HelpCircleIcon />
            <h4 className="font-bold text-xs text-slate-200">Ezzay testa3mel el AR?</h4>
          </div>
          <ul className="text-[11px] text-slate-400 leading-relaxed list-disc list-inside flex flex-col gap-1">
            <li>Dous 3ala <strong className="text-teal-400">Abda2 el AR</strong> taht w shaghal el camera.</li>
            <li>Wageh el mobail le ay ardya aw tarabeza 3andak fey el koda.</li>
            <li>Hatla2y model el Malek zahari fey el bayt 3andak bmontha el sohola.</li>
          </ul>
        </div>

        {/* Trigger AR Button via R3F XR Wrapper */}
        <div className="w-full max-w-md flex justify-center pointer-events-auto">
          <ARButton
            sessionInit={{
              requiredFeatures: ['local-floor', 'hit-test'],
              optionalFeatures: ['hand-tracking']
            }}
            className="w-full !py-3.5 !px-6 !bg-teal-600 hover:!bg-teal-500 !text-white !rounded-xl !font-bold !text-sm !shadow-lg !transition-all !border-none !cursor-pointer flex items-center justify-center gap-2"
          >
            <SmartphoneIcon />
            Abda2 el AR (Hat el Malek fel koda)
          </ARButton>
        </div>

        <p className="text-[10px] text-slate-500 text-center">
          Vercel HTTPS Link bta3ak haykhaleek testa3melo 3ala chrome mobail mofeed giddan.
        </p>
      </section>

    </div>
  );
}

// Preload assets for immediate performance
useGLTF.preload('/models/king_tissa.glb');