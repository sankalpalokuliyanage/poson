import React from 'react';
import '@google/model-viewer'; // මුලින්ම terminal එකේ 'npm install @google/model-viewer' කරලා ඉන්න.

export default function App() {
  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center p-6 font-sans">
      
      {/* HEADER */}
      <header className="w-full max-w-md flex items-center gap-3 py-4 border-b border-slate-900">
        <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
        <div>
          <h1 className="font-bold text-sm">Mihinthalaya Native AR</h1>
          <p className="text-[10px] text-slate-400">දේවානම්පියතිස්ස රජතුමා (iOS & Android Universal)</p>
        </div>
      </header>

      {/* 3D PREVIEW AREA */}
      <div className="flex-1 w-full max-w-md flex items-center justify-center relative my-4 bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden">
        
        {/* Google Model Viewer: මේක ඇතුලේ React Three Fiber නැති නිසා කිසිම crash එකක් වෙන්නේ නැහැ */}
        <model-viewer
          src="/models/king_tissa.glb"       // Android සහ Desktop සඳහා .glb file එක
          ios-src="/models/king_tissa.usdz"   // ඔයාගේ iPhone එක සඳහා අනිවාර්ය .usdz file එක
          alt="දේවානම්පියතිස්ස රජතුමා 3D Model"
          ar
          ar-modes="quick-look scene-viewer webxr" // iPhone වලදී native 'quick-look' එක වැඩ කරයි
          camera-controls
          auto-rotate
          shadow-intensity="1.5"
          style={{ width: '100%', height: '100%', background: 'transparent' }}
        >
          {/* Custom AR Button (මෙය දිස්වන්නේ ජංගම දුරකථන වල පමණි) */}
          <button
            slot="ar-button"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 py-3.5 px-6 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-2xl tracking-wide transition-all border-none cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            START IPHONE AR (කාමරයට ගන්න)
          </button>
        </model-viewer>

      </div>

      {/* BOTTOM GUIDE */}
      <footer className="w-full max-w-md bg-slate-900 border border-slate-800/60 p-4 rounded-xl shadow-xl flex flex-col gap-1.5 mb-2">
        <h4 className="font-bold text-xs text-slate-200">📌 iPhone පරිශීලකයින් සඳහා:</h4>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Vercel HTTPS ලින්ක් එකෙන් සාමාන්‍ය <strong>Safari බ්‍රවුසරයෙන්</strong>ම පිවිසෙන්න. ඉන්පසු "START IPHONE AR" බොත්තම එබූ සැනින්, කිසිදු අතිරේක ඇප් එකක් නොමැතිව iPhone එකේ නිල AR පද්ධතිය ක්‍රියාත්මක වේ.
        </p>
      </footer>

    </div>
  );
}