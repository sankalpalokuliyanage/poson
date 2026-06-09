import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Ring, Cone } from '@react-three/drei';
import { createXRStore, XR, useXRHitTest } from '@react-three/xr';
import { Matrix4, Vector3 } from 'three';
import { useGLTF } from '@react-three/drei';

// WebXR Store for Mobile/Tablet Immersive AR with Hit Test and DOM Overlay enabled
const xrStore = createXRStore({
  hitTest: true,
  domOverlay: true // Allows custom HTML overlays on top of the camera view
});

// දේවානම්පියතිස්ස රජතුමාගේ 3D Model එක පමණක් Load කිරීම
function KingTissa({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  // ඔබගේ public/models/king_tissa.glb ගොනුව භාවිත කරයි
  const { scene } = useGLTF('/models/king_tissa.glb');
  return (
    <primitive 
      object={scene} 
      position={position} 
      rotation={rotation} 
      scale={[0.8, 0.8, 0.8]} // අවශ්‍ය පරිදි විශාලත්වය මෙතනින් වෙනස් කරන්න
    />
  );
}

// Model එක කලින්ම Load කර තැබීම
useGLTF.preload('/models/king_tissa.glb');

function ARManager({ placedPos, onPlaced }) {
  const reticleRef = useRef();
  const matrixHelper = useRef(new Matrix4());
  const currentPos = useRef(new Vector3());

  // සැබෑ ලෝකයේ මතුපිටවල් (Floor/Table) හඳුනාගැනීම සඳහා Hit-Testing ක්‍රියාවලිය
  useXRHitTest((results, getWorldMatrix) => {
    if (results.length > 0) {
      getWorldMatrix(matrixHelper.current, results[0]);
      currentPos.current.setFromMatrixPosition(matrixHelper.current);
      
      if (reticleRef.current) {
        reticleRef.current.position.copy(currentPos.current);
        reticleRef.current.quaternion.setFromRotationMatrix(matrixHelper.current);
        reticleRef.current.visible = true;
      }
      
      // සජීවීව හඳුනාගත් ඛණ්ඩාංක (Coordinates) ගබඩා කර ගැනීම
      if (window.setLastTrackedPosition) {
        window.setLastTrackedPosition(currentPos.current.clone());
      }
    } else {
      if (reticleRef.current) {
        reticleRef.current.visible = false;
      }
    }
  });

  return (
    <>
      {/* 1. මතුපිටක් ස්කෑන් කරන විට පෙන්වන කොළ පැහැති ඉලක්ක වළල්ල (Target Reticle) */}
      {!placedPos && (
        <group ref={reticleRef} visible={false}>
          <Ring args={[0.15, 0.18, 32]} rotation={[-Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color="#10b981" depthWrite={false} />
          </Ring>
          <Cone args={[0.03, 0.1, 4]} rotation={[Math.PI, 0, 0]} position={[0, 0.05, 0]}>
            <meshBasicMaterial color="#10b981" />
          </Cone>
        </group>
      )}

      {/* 2. ස්ථානගත කල පසු රජතුමාගේ 3D ආකෘතිය පමණක් එම ස්ථානයේ පෙන්වීම */}
      {placedPos && (
        <group position={[placedPos.x, placedPos.y, placedPos.z]}>
          <KingTissa />
        </group>
      )}
    </>
  );
}

export default function App() {
  const [placedPosition, setPlacedPosition] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const lastTrackedPosRef = useRef(null);

  useEffect(() => {
    window.setLastTrackedPosition = (pos) => {
      lastTrackedPosRef.current = pos;
      setIsScanning(true);
    };
    return () => {
      window.setLastTrackedPosition = null;
    };
  }, []);

  const handleStartAR = () => {
    xrStore.enterAR();
  };

  const handlePlaceScene = () => {
    if (lastTrackedPosRef.current) {
      setPlacedPosition(lastTrackedPosRef.current);
    } else {
      // alert වෙනුවට console.warn හෝ custom notification එකක් භාවිත කල යුතුය (No-alert රීතිය)
      console.warn("කරුණාකර තලයක් හඳුනාගන්නා තෙක් දුරකථනය සෙමින් චලනය කරන්න.");
    }
  };

  const handleReset = () => {
    setPlacedPosition(null);
    setIsScanning(false);
    lastTrackedPosRef.current = null;
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#020617', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      
      {/* Top Header Controls */}
      <div style={{ padding: '16px', background: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div>
          <h1 style={{ color: 'white', margin: 0, fontSize: '18px' }}>King Tissa AR Single Model Tester</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '12px' }}>දේවානම්පියතිස්ස රජතුමාගේ 3D Model එක පමණක් පරීක්ෂා කිරීමේ පද්ධතිය</p>
        </div>
        
        <button 
          onClick={handleStartAR}
          style={{
            background: '#10b981', color: 'white', border: 'none', padding: '12px 20px', 
            borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          🥽 Start AR View
        </button>
      </div>

      {/* 3D WebXR Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [0, 1.5, 3], fov: 60 }}>
          <XR store={xrStore}>
            
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            
            <ARManager 
              placedPos={placedPosition}
              onPlaced={setPlacedPosition}
            />

            <OrbitControls enableDamping dampingFactor={0.05} />
            <Environment preset="sunset" />
          </XR>
        </Canvas>

        {/* Dynamic HTML Placement Overlay */}
        <div style={{
          position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '90%', maxWidth: '360px'
        }}>
          
          {!placedPosition ? (
            <div style={{
              background: 'rgba(15, 23, 42, 0.95)', padding: '16px', borderRadius: '12px',
              border: '1px solid #334155', color: 'white', textAlign: 'center', width: '100%'
            }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '13px' }}>
                {isScanning 
                  ? "පොළොව මත කොළ පැහැති වළල්ල (Reticle) දර්ශනය වන විට පහත බොත්තම ඔබන්න." 
                  : "දුරකථන කැමරාව මේසය හෝ බිම දෙසට හරවා සෙමින් චලනය කරන්න..."}
              </p>
              
              <button
                onClick={handlePlaceScene}
                style={{
                  background: '#10b981', color: 'white', border: 'none', width: '100%',
                  padding: '12px 0', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px'
                }}
              >
                📍 Place King Tissa Here
              </button>
            </div>
          ) : (
            <div style={{
              background: 'rgba(15, 23, 42, 0.95)', padding: '12px 16px', borderRadius: '12px',
              border: '1px solid #10b981', color: 'white', textAlign: 'center', width: '100%'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#10b981', fontWeight: 'bold' }}>✓ King Tissa placed in AR!</p>
              <button
                onClick={handleReset}
                style={{
                  background: '#ef4444', color: 'white', border: 'none', width: '100%',
                  padding: '8px 0', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px'
                }}
              >
                🔄 Reset Location
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}