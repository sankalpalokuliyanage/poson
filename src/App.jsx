import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { createXRStore, XR } from '@react-three/xr';

// Inline SVG Icon Components (No external icon packages required)
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
  <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// Initialize @react-three/xr v6 Store
const store = createXRStore({
  hitTest: true,
});

// Error Boundary to prevent application crash if the GLB model path is incorrect
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.warn("3D Model load failed. Using dynamic fallback instead.", error);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// Geometric Fallback Model (Displays a golden silhouette if GLB is missing)
function FallbackKingModel() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.1, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.12, 0.2, 1.2, 16]} />
        <meshStandardMaterial color="#d97706" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.1} />
      </mesh>
    </group>
  );
}

// Core Model Component for loading the King Tissa GLB Asset
function KingTissaModel() {
  const { scene } = useGLTF('/models/king_tissa.glb');
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

function LoaderPlaceholder() {
  return (
    <mesh position={[0, 0.6, 0]}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color="#0ea5e9" wireframe />
    </mesh>
  );
}

export default function App() {
  const [infoMsg, setInfoMsg] = useState('');
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  // Device capability check on mount
  useEffect(() => {
    const isHTTPS = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    setIsIOSDevice(isIOS);

    // 1. Enforce HTTPS outside local development environment
    if (!isHTTPS && !isLocalhost) {
      setInfoMsg('ආරක්ෂිත HTTPS සබඳතාවයක් නොමැත. කරුණාකර HTTPS (Vercel) සම්බන්ධතාවයෙන් නැවත පිවිසෙන්න.');
      return;
    }

    // 2. Validate WebXR Immersive AR state
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        if (!supported) {
          setInfoMsg('ඔබේ දුරකථනයෙහි WebXR AR පහසුකම ක්‍රියාත්මක නොවේ. කරුණාකර Android Chrome බ්‍රවුසරය භාවිත කරන්න.');
        }
      });
    } else {
      if (isIOS) {
        setInfoMsg('Apple iOS (Safari/Chrome) මඟින් WebXR natively සපෝට් කරන්නේ නැත. iPhone එකෙන් මෙය නැරඹීමට App Store එකෙන් "Mozilla WebXR Viewer" ඇප් එක ස්ථාපනය කර, එම ඇප් එක හරහා මෙම Vercel ලින්ක් එකට පිවිසෙන්න.');
      } else {
        setInfoMsg('ඔබගේ උපාංගයෙහි WebXR API පහසුකම නොමැත. කරුණාකර WebXR සක්‍රීය Android Chrome බ්‍රවුසරයකින් පිවිසෙන්න.');
      }
    }
  }, []);

  return (
    <div className="relative w-screen h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans">
      
      {/* HEADER OVERLAY */}
      <header className="absolute top-0 inset-x-0 z-10 p-4 bg-gradient-to-b from-slate-950/90 to-transparent backdrop-blur-xs flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
            <SparklesIcon />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide">Mihinthalaya AR Project</h1>
            <p className="text-[10px] text-slate-400">දේවානම්පියතිස්ස රජතුමාගේ ත්‍රිමාණ නිරූපණය</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-teal-400 flex items-center gap-1.5 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse inline-block"></span>
          AR Status
        </div>
      </header>

      {/* COMPATIBILITY NOTICE OR ERRORS */}
      {infoMsg && (
        <div className="absolute top-16 left-4 right-4 z-30 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-start gap-2.5 backdrop-blur-md">
          <AlertTriangleIcon />
          <p className="text-xs text-amber-300 leading-relaxed">{infoMsg}</p>
        </div>
      )}

      {/* THREE.JS CANVAS CONTAINER */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Canvas shadows camera={{ position: [0, 1.2, 2.5], fov: 45 }}>
          <ambientLight intensity={0.7} />
          <directionalLight 
            position={[5, 10, 5]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize={[1024, 1024]} 
          />
          <pointLight position={[-5, 5, -5]} intensity={0.4} />

          {/* WebXR Context Injection */}
          <XR store={store}>
            <Suspense fallback={<LoaderPlaceholder />}>
              <ModelErrorBoundary fallback={<FallbackKingModel />}>
                <KingTissaModel />
              </ModelErrorBoundary>
            </Suspense>
          </XR>

          <OrbitControls 
            enableDamping 
            dampingFactor={0.05} 
            maxPolarAngle={Math.PI / 2.1} 
            minDistance={0.8} 
            maxDistance={8} 
          />
        </Canvas>
      </div>

      {/* BOTTOM CONTROL PANEL */}
      <section className="absolute bottom-0 inset-x-0 z-10 p-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex flex-col items-center gap-4">
        
        {/* AR Instructions */}
        <div className="w-full max-w-md bg-slate-900/95 border border-slate-800/80 p-4 rounded-xl shadow-xl flex flex-col gap-2 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <HelpCircleIcon />
            <h4 className="font-bold text-xs text-slate-200">AR භාවිත කරන්නේ කෙසේද?</h4>
          </div>
          <ul className="text-[11px] text-slate-400 leading-relaxed list-disc list-inside flex flex-col gap-1">
            <li>පහත ඇති <strong className="text-teal-400">Start AR</strong> බොත්තම ඔබා කැමරාව සක්‍රීය කරන්න.</li>
            <li>ඔබේ ජංගම දුරකථනය බිම හෝ මේසයක් මතුපිටට සෙමින් ගෙන ගොස් ස්කෑන් කරන්න.</li>
            <li>රජතුමාගේ රූපය සැබෑ ලෝකය මත ස්ථාවරව දිස්වනු ඇත.</li>
          </ul>
        </div>

        {/* Start AR Trigger (Only hides button if user is on unsupportive iOS configuration) */}
        <div className="w-full max-w-md flex justify-center pointer-events-auto">
          <button
            onClick={() => store.enterAR()}
            disabled={isIOSDevice && !navigator.xr}
            className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold text-sm shadow-lg transition-all border-none cursor-pointer flex items-center justify-center font-sans"
          >
            <SmartphoneIcon />
            Start AR (රජතුමා කාමරයට ගන්න)
          </button>
        </div>

        <p className="text-[10px] text-slate-500 text-center">
          Vercel HTTPS සබඳතාවය භාවිතයෙන් ජංගම දුරකථන මඟින් පමණක් AR අත්දැකීම ලබාගත හැක.
        </p>
      </section>

    </div>
  );
}

// Preload resources for immediate initialization
useGLTF.preload('/models/king_tissa.glb');