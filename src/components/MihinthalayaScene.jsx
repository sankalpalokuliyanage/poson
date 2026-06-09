import React, { useState, useEffect, useRef } from 'react';

// Inline SVG Icon components to replace lucide-react dependencies
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

export default function App() {
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [arActive, setArActive] = useState(false);
  const [loadingModel, setLoadingModel] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);

  // 1. Load el scripts bto3 Three.js dynamically 3ashan nethada el mashakel bta3et el compilation
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

    Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')
    ])
      .then(() => {
        return Promise.all([
          loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js'),
          loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js')
        ]);
      })
      .then(() => {
        setScriptsLoaded(true);
      })
      .catch((err) => {
        setErrorMsg('Moshkela fe ta7mel el libraries bta3et el 3D.');
        console.error(err);
      });
  }, []);

  // 2. Initialize el scene w load model bta3 el Malek Tissa
  useEffect(() => {
    if (!scriptsLoaded || !canvasRef.current) return;

    const THREE = window.THREE;
    
    // El Scene, Camera, w Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.5, 3);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true; // Enable el WebXR support
    rendererRef.current = renderer;

    // OrbitControls le preview el 3D 3ala el shasha
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controlsRef.current = controls;

    // Edawaat (Lights)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Load el model bta3 el malek Tissa men public folder
    const loader = new THREE.GLTFLoader();
    loader.load(
      '/models/king_tissa.glb',
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        model.scale.set(0.8, 0.8, 0.8);
        
        // Dynamic shadow casting for realism
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });

        scene.add(model);
        modelRef.current = model;
        setLoadingModel(false);
      },
      undefined,
      (error) => {
        console.warn('GLB load failed, loading fallback 3D shape...', error);
        
        // Fallback model representation low el path mesh mawgoud
        const geometry = new THREE.CylinderGeometry(0.2, 0.3, 1.4, 16);
        const material = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.4 });
        const fallbackMesh = new THREE.Mesh(geometry, material);
        fallbackMesh.position.set(0, 0.7, 0);
        scene.add(fallbackMesh);
        modelRef.current = fallbackMesh;
        setLoadingModel(false);
      }
    );

    // Resize handler
    const handleResize = () => {
      if (!canvasRef.current) return;
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Render loop bta3 Three.js (Must use setAnimationLoop for WebXR)
    renderer.setAnimationLoop(() => {
      if (controls && !renderer.xr.isPresenting) {
        controls.update();
      }
      
      // El circular rotation low mesh fey el AR 3ashan yb2a interactive
      if (modelRef.current && !renderer.xr.isPresenting) {
        modelRef.current.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.setAnimationLoop(null);
    };
  }, [scriptsLoaded]);

  // 3. Start el WebXR Immersive AR session
  const startARSession = async () => {
    if (!navigator.xr) {
      setErrorMsg('El AR mesh mad3om 3ala el mo3tal da. Yareet testa3mel Chrome aw Safari 3ala mobail fih ARCore.');
      return;
    }

    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local-floor']
      });

      rendererRef.current.xr.setSession(session);
      setArActive(true);

      session.addEventListener('end', () => {
        setArActive(false);
      });
    } catch (err) {
      console.error('Moshkela fey bdayat el AR:', err);
      setErrorMsg('Mesh aref abda2 el AR. Yareet teta2ked men permissions bta3et el camera.');
    }
  };

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
            <p className="text-[10px] text-slate-400">Tamsil 3D bta3 el Malek Devanampiyatissa</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-teal-400 flex items-center gap-1.5 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse inline-block"></span>
          El AR Gahez
        </div>
      </header>

      {/* THREE.JS CANVAS */}
      <div className="absolute inset-0 w-full h-full z-0">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* LOADING & ERROR STATES */}
      {loadingModel && !errorMsg && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm gap-3">
          <LoaderIcon />
          <p className="text-sm text-slate-300">Bey7amel el model bta3 el Malek...</p>
        </div>
      )}

      {errorMsg && (
        <div className="absolute top-16 left-4 right-4 z-30 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-2.5 backdrop-blur-md">
          <AlertTriangleIcon />
          <p className="text-xs text-red-300 leading-relaxed">{errorMsg}</p>
        </div>
      )}

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

        {/* Trigger AR Button */}
        <div className="w-full max-w-md">
          <button
            onClick={startARSession}
            disabled={!scriptsLoaded || loadingModel}
            className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold text-sm shadow-lg transition-all border-none cursor-pointer flex items-center justify-center"
          >
            <SmartphoneIcon />
            Abda2 el AR (Hat el Malek fel koda)
          </button>
        </div>

        <p className="text-[10px] text-slate-500 text-center">
          Vercel HTTPS Link bta3ak haykhaleek testa3melo 3ala chrome mobail mofeed giddan.
        </p>
      </section>

    </div>
  );
}