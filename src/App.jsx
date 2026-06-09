import React, { useState, useEffect, useRef } from 'react';

// Inline SVGs for zero dependencies
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

export default function App() {
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [loadingModel, setLoadingModel] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);

  // 1. Load Three.js dynamically to prevent build crashes
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')
      .then(() => {
        return Promise.all([
          loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js'),
          loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js')
        ]);
      })
      .then(() => setScriptsLoaded(true))
      .catch(() => setErrorMsg('ත්‍රිමාණ පද්ධති load කිරීමේ දෝෂයකි.'));
  }, []);

  // 2. Initialize 3D Engine
  useEffect(() => {
    if (!scriptsLoaded || !canvasRef.current) return;

    const THREE = window.THREE;
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.2, 2.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.xr.enabled = true; // Enable native WebXR for Mozilla App & Android
    rendererRef.current = renderer;

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2.1;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Load Model or Fallback immediately if file missing
    const loader = new THREE.GLTFLoader();
    loader.load(
      '/models/king_tissa.glb',
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        model.scale.set(0.8, 0.8, 0.8);
        scene.add(model);
        modelRef.current = model;
        setLoadingModel(false);
      },
      undefined,
      () => {
        // FALLBACK: If .glb is not found, create a beautiful Golden Silhouette automatically
        const group = new THREE.Group();
        
        const baseGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.1, 32);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        group.add(base);

        const bodyGeo = new THREE.CylinderGeometry(0.12, 0.2, 1.2, 16);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.2 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.65;
        group.add(body);

        const headGeo = new THREE.SphereGeometry(0.15, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.3;
        group.add(head);

        scene.add(group);
        modelRef.current = group;
        setLoadingModel(false);
      }
    );

    // Animation loop (Crucial for WebXR)
    renderer.setAnimationLoop(() => {
      if (!renderer.xr.isPresenting && modelRef.current) {
        modelRef.current.rotation.y += 0.005; // Normal screen rotation
        controls.update();
      }
      renderer.render(scene, camera);
    });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.setAnimationLoop(null);
    };
  }, [scriptsLoaded]);

  // 3. Request AR Session natively (Supported by WebXR Viewer & Android Chrome)
  const startAR = async () => {
    if (!navigator.xr) {
      setErrorMsg('WebXR පහසුකම හඳුනාගත නොහැකි විය.');
      return;
    }
    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local-floor']
      });
      rendererRef.current.xr.setSession(session);
    } catch (err) {
      setErrorMsg('AR Session එක ආරම්භ කිරීමට නොහැකි විය. Permission ලබා දී ඇත්දැයි බලන්න.');
    }
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans">
      <header className="absolute top-0 inset-x-0 z-10 p-4 bg-gradient-to-b from-slate-950/90 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
            <SparklesIcon />
          </div>
          <div>
            <h1 className="font-bold text-sm">Mihinthalaya AR Project</h1>
            <p className="text-[10px] text-slate-400">දේවානම්පියතිස්ස රජතුමා (Universal WebXR)</p>
          </div>
        </div>
      </header>

      {errorMsg && (
        <div className="absolute top-16 left-4 right-4 z-30 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs text-red-300">
          {errorMsg}
        </div>
      )}

      <div className="absolute inset-0 w-full h-full z-0">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      <section className="absolute bottom-0 inset-x-0 z-10 p-6 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent flex flex-col items-center gap-4">
        <div className="w-full max-w-md bg-slate-900/95 border border-slate-800/80 p-4 rounded-xl shadow-xl backdrop-blur-md text-xs text-slate-400 leading-relaxed">
          <p className="font-bold text-slate-200 mb-1">💡 iPhone / WebXR Viewer පරිශීලකයින් සඳහා:</p>
          ඇප් එක තුළින් ලින්ක් එකට පැමිණි පසු, පහත බොත්තම එබූ සැනින් ඔබගේ කාමරයේ පසුබිම මත රජතුමාගේ රූපය මතු වනු ඇත.
        </div>

        <button
          onClick={startAR}
          disabled={!scriptsLoaded}
          className="w-full max-w-md py-3.5 px-6 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg border-none cursor-pointer flex items-center justify-center"
        >
          <SmartphoneIcon />
          Start AR (රජතුමා කාමරයට ගන්න)
        </button>
      </section>
    </div>
  );
}