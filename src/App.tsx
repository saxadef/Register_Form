/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import FormWizard from "./components/FormWizard";
import { Sparkles } from "lucide-react";
// @ts-ignore
import bkLogo from "../image/BK Logo.png";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-950/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-950/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Top Main Sticky/Static Navbar */}
      <header className="relative z-10 bg-[#0d0d11]/80 backdrop-blur-xl border-b border-slate-900 px-6 py-4 shrink-0 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-slate-900 border border-slate-800 rounded-xl shadow-md flex items-center justify-center">
              <img src={bkLogo} className="w-9 h-9 object-contain rounded-lg" alt="Bina Karya Logo" referrerPolicy="no-referrer" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-widest font-extrabold uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-sans">
                  LPKB BINA KARYA
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                </span>
              </div>
              <h1 
                className="text-lg font-black tracking-wider text-white mt-1 uppercase"
                style={{ textShadow: "0 1px 0 #000, 0 2px 3px rgba(0,0,0,0.7), 0 1px 2px rgba(255,255,255,0.05)" }}
              >
                LPKB <span className="text-[#FBC052]">BINA</span> <span className="text-[#2EC6B5]">KARYA</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Workspace Layout */}
      <main className="relative z-10 flex-1 max-w-2xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-stretch justify-center min-h-0 min-w-0">
        
        {/* Centered Registration Form Column */}
        <section id="form-simulation-view" className="w-full flex flex-col min-h-0">
          <div className="flex items-center justify-center gap-1.5 mb-3 px-1">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 select-none animate-pulse" />
            <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-mono">
              Form Pendaftaran
            </h2>
          </div>
          <div className="flex-1 min-h-[560px]">
            <FormWizard />
          </div>
        </section>

      </main>

      {/* Workspace Footer */}
      <footer className="relative z-10 bg-[#0d0d11]/80 border-t border-slate-900 px-6 py-4 shrink-0 text-center text-slate-500 text-xs font-semibold font-mono">
        LPKB BINA KARYA &bull; 2026 Ready &bull; Built in React with Vite
      </footer>
    </div>
  );
}
