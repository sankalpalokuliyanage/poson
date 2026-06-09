import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { createXRStore, XR } from '@react-three/xr';
import MihinthalayaScene from './components/MihinthalayaScene';

// MR/AR session එකක් ආරම්භ කිරීම සඳහා WebXR store එකක් සාදාගැනීම
const xrStore = createXRStore({
  hitTest: true // සැබෑ බිම හඳුනාගැනීම සඳහා
});

export default function App() {
  // එක් එක් 3D model එක සඳහා Coordinates පාලනය කිරීමට React state භාවිත කිරීම
  const [positions, setPositions] = useState({
    mountain: [0, -0.5, 0],
    mihindu: [0.5, 1.4, -0.2],  // කන්ද උඩ පර්වතය මත
    tissa: [-1.2, 0.0, 0.8],    // කන්ද පහළ බිම මත
    deer: [-1.8, 0.0, 1.2],     // රජුට පිටුපසින්
    mango: [-0.8, 0.1, -0.5]    // පසෙකින් ඇති අඹ ගස
  });

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#020617', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. Header & Controls */}
      <div style={{ padding: '16px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'white', margin: 0, fontSize: '18px' }}>Mihinthalaya 3D Assembly Tour</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '12px' }}>වෙන වෙනම ඇති 3D (.glb) ගොනු ඛණ්ඩාංක (Coordinates) මඟින් පාලනය කිරීම</p>
        </div>
        
        {/* WebXR Immersive MR Button */}
        <button 
          onClick={() => xrStore.enterAR()}
          style={{
            background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', 
            borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          🥽 View in MR (Headsets/Mobile)
        </button>
      </div>

      {/* 2. 3D Renderer Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [0, 2, 5], fov: 55 }}>
          {/* Immersive Space Configuration */}
          <XR store={xrStore}>
            
            {/* 3D පරිසරයේ ආලෝකය (Lighting) */}
            <ambientLight intensity={0.6} />
            <directionalLight 
              position={[5, 8, 5]} 
              intensity={1.5} 
              castShadow 
              shadow-mapSize={[1024, 1024]} 
            />
            
            {/* 3D Scene Assembly එකතු කිරීම */}
            <MihinthalayaScene positions={positions} />

            {/* කැමරාව Mouse එකෙන් කරකැවීමට සහ Zoom කිරීමට (2D Desktop සඳහා) */}
            <OrbitControls enableDamping dampingFactor={0.05} />
            
            {/* බිම මට්ටම පැහැදිලිව පෙනීමට Grid එකක් */}
            <Grid renderOrder={-1} position={[0, -0.01, 0]} args={[15, 15]} cellSize={0.5} cellThickness={0.5} sectionSize={2} sectionColor="#1e293b" cellColor="#0f172a" fadeDistance={10} />
            
            {/* ස්වභාවික ආලෝකකරණය සහ පසුබිම (Ambient environment) */}
            <Environment preset="sunset" />
          </XR>
        </Canvas>

        {/* 3. Coordinates Tweak Sidebar */}
        <div style={{
          position: 'absolute', top: '20px', left: '20px', background: 'rgba(15, 23, 42, 0.95)',
          padding: '16px', borderRadius: '12px', border: '1px solid #334155', width: '280px',
          color: 'white', fontSize: '12px', fontFamily: 'sans-serif'
        }}>
          <h3 style={{ margin: '0 0 12px 0', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>Coordinates Manager</h3>
          
          {/* 1. මිහිඳු හිමියන්ගේ උස (Y coordinate) */}
          <div style={{ marginBottom: '10px' }}>
            <label>මිහිඳු හිමියන්ගේ උස (Mihindu Y): {positions.mihindu[1].toFixed(1)}m</label>
            <input 
              type="range" min="0" max="3" step="0.1" 
              value={positions.mihindu[1]} 
              onChange={(e) => {
                const newY = parseFloat(e.target.value);
                setPositions(p => ({ ...p, mihindu: [p.mihindu[0], newY, p.mihindu[2]] }));
              }}
              style={{ width: '100%', accentColor: '#10b981' }}
            />
          </div>

          {/* 2. තිස්ස රජුගේ ඉදිරි/පසුපස දුර (Z coordinate) */}
          <div style={{ marginBottom: '10px' }}>
            <label>තිස්ස රජු (Tissa Z): {positions.tissa[2].toFixed(1)}m</label>
            <input 
              type="range" min="-3" max="3" step="0.1" 
              value={positions.tissa[2]} 
              onChange={(e) => {
                const newZ = parseFloat(e.target.value);
                setPositions(p => ({ ...p, tissa: [p.tissa[0], p.tissa[1], newZ] }));
              }}
              style={{ width: '100%', accentColor: '#10b981' }}
            />
          </div>
          
          {/* 3. රන් මුවාගේ වම/දකුණ දුර (X coordinate) */}
          <div>
            <label>රන් මුවා (Deer X): {positions.deer[0].toFixed(1)}m</label>
            <input 
              type="range" min="-4" max="4" step="0.1" 
              value={positions.deer[0]} 
              onChange={(e) => {
                const newX = parseFloat(e.target.value);
                setPositions(p => ({ ...p, deer: [newX, p.deer[1], p.deer[2]] }));
              }}
              style={{ width: '100%', accentColor: '#10b981' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}