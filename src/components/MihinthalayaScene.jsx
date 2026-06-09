import React, { useState, useEffect, useRef } from 'react';

// SVG Icons to prevent any third-party package errors
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

  // Safe script injector that prevents double loading in React Strict Mode
  useEffect(() => {
    let active = true;

    const loadScript = (id, src) => {
      return new Promise((resolve, reject) => {
        const existing = document.getElementById(id);
        if (existing) {
          if (existing.dataset.loaded === 'true') {
            resolve();
          } else {
            existing.addEventListener('load', resolve);
            existing.addEventListener('error', reject);
          }
          return;
        }

        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.async = true;
        script.dataset.loaded = 'false';
        script.onload = () => {
          script.dataset.loaded = 'true';
          resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const init = async () => {
      try {
        // Load main Three.js first
        await loadScript('three-core', 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
        if (!active) return;
        
        // Load addons
        await Promise.all([
          loadScript('three-gltf', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js'),
          loadScript('three-orbit', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js')
        ]);
        
        if (active) {
          setScriptsLoaded(true);
        }
      } catch (err) {
        if (active) {
          setErrorMsg('Error loading 3D graphics libraries. Please check your internet connection.');
          console.error(err);
        }
      }
    };

    init();

    return () => {
      active = false;
    };
  }, []);

  // Initialize the 3D Scene and Renderer
  useEffect(() => {
    if (!scriptsLoaded || !canvasRef.current) return;

    const THREE = window.THREE;
    
    // Create Scene, Camera, and WebGL Renderer
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
    
    // Fix: Handle cases where clientWidth/clientHeight are initially 0
    const width = canvasRef.current.clientWidth || window.innerWidth;
    const height = canvasRef.current.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true; 
    rendererRef.current = renderer;

    // Controls for mouse/touch preview
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controlsRef.current = controls;

    // Meditative temple-like lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Load the King Tissa GLB model
    const loader = new THREE.GLTFLoader();
    loader.load(
      '/models/king_tissa.glb',
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        model.scale.set(0.8, 0.8, 0.8);
        
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
        console.warn('GLB load failed, creating beautiful fallback representation...', error);
        
        // Dynamic Fallback model representing King Tissa if file path is empty/unresolved
        const group = new THREE.Group();
        
        // Base Pedestal
        const baseGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.15, 32);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.y = 0.075;
        group.add(baseMesh);

        // Body robe
        const bodyGeo = new THREE.CylinderGeometry(0.15, 0.25, 1.2, 16);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 }); // Golden Robe
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        bodyMesh.position.y = 0.75;
        group.add(bodyMesh);

        // Crown/Head
        const headGeo = new THREE.SphereGeometry(0.15, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6, roughness: 0.2 });
        const headMesh = new THREE.Mesh(headGeo, headMat);
        headMesh.position.y = 1.4;
        group.add(headMesh);

        group.position.set(0, 0, 0);
        scene.add(group);
        modelRef.current = group;
        setLoadingModel(false);
      }
    );

    const handleResize = () => {
      if (!canvasRef.current) return;
      const w = canvasRef.current.clientWidth || window.innerWidth;
      const h = canvasRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Active Render loop
    renderer.setAnimationLoop(() => {
      if (controls && !renderer.xr.isPresenting) {
        controls.update();
      }
      
      // Auto-rotate preview if not in immersive AR session
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

  // AR Session Activation
  const startARSession = async () => {
    if (!navigator.xr) {
      setErrorMsg('WebXR AR is not supported on this device. Please open this Vercel link using Chrome on Android, or the WebXR Viewer app on iOS.');
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
      console.error('AR session initialization failed:', err);
      setErrorMsg('Could not start AR session. Please make sure camera permissions are enabled for this browser.');
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