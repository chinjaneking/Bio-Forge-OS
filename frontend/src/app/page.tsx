'use client'

import { useState } from 'react'
import BioLingoConsole from '@/components/BioLingoConsole'
import HoloStudio from '@/components/HoloStudio'
import ProteinExplorer from '@/components/ProteinExplorer'
import CircuitDesignerConsole from '@/components/CircuitDesignerConsole'
import ExpressionSimulator from '@/components/ExpressionSimulator'
import PathwayExplorer from '@/components/PathwayExplorer'
import { Dna, Menu, X, FlaskConical, Zap } from 'lucide-react'

type Phase = 'phase1' | 'phase2'

export default function Home() {
  const [selectedPdbId, setSelectedPdbId] = useState<string>('1AKI')
  const [selectedProtein, setSelectedProtein] = useState<any>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [activeView, setActiveView] = useState<'split' | 'console' | 'studio'>('split')
  const [activePhase, setActivePhase] = useState<Phase>('phase1')
  // Phase 2 sub-view: circuit | simulator | pathway
  const [phase2View, setPhase2View] = useState<'circuit' | 'simulator' | 'pathway'>('circuit')

  const handleProteinSelect = (data: any) => {
    setSelectedProtein(data)
    setSelectedPdbId('1AKI')
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Top Navigation Bar */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-sm border-b border-indigo-500/30 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo + Phase tabs */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <Dna className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Bio-Forge</h1>
                <p className="text-xs text-indigo-300">Molecular Design Platform</p>
              </div>
            </div>

            {/* Phase selector */}
            <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl p-1">
              <button
                onClick={() => setActivePhase('phase1')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activePhase === 'phase1'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                Phase 1 · Molecular Blueprint
              </button>
              <button
                onClick={() => setActivePhase('phase2')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activePhase === 'phase2'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Phase 2 · Circuit Designer
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Phase 1 view toggles */}
            {activePhase === 'phase1' && (
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('console')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                    activeView === 'console'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Console
                </button>
                <button
                  onClick={() => setActiveView('split')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                    activeView === 'split'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Split View
                </button>
                <button
                  onClick={() => setActiveView('studio')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                    activeView === 'studio'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Studio
                </button>
              </div>
            )}

            {/* Phase 2 view toggles */}
            {activePhase === 'phase2' && (
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
                <button
                  onClick={() => setPhase2View('circuit')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                    phase2View === 'circuit'
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Circuit Designer
                </button>
                <button
                  onClick={() => setPhase2View('simulator')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                    phase2View === 'simulator'
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Expression Sim
                </button>
                <button
                  onClick={() => setPhase2View('pathway')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                    phase2View === 'pathway'
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Pathway Explorer
                </button>
              </div>
            )}

            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 bg-slate-800/50 text-indigo-400 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── PHASE 1 ── */}
        {activePhase === 'phase1' && (
          <>
            {/* Left Sidebar - Protein Explorer */}
            {showSidebar && (
              <div className="w-96 border-r border-indigo-500/30 p-4 overflow-hidden">
                <ProteinExplorer onProteinSelect={handleProteinSelect} />
              </div>
            )}

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
              {(activeView === 'console' || activeView === 'split') && (
                <div className={activeView === 'split' ? 'flex-1' : 'w-full'}>
                  <BioLingoConsole />
                </div>
              )}

              {(activeView === 'studio' || activeView === 'split') && (
                <div className={activeView === 'split' ? 'flex-1 border-l border-indigo-500/30' : 'w-full'}>
                  <div className="h-full p-4">
                    <HoloStudio
                      initialPdbId={selectedPdbId}
                      title={selectedProtein?.protein_name || 'Protein Structure Viewer'}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── PHASE 2 ── */}
        {activePhase === 'phase2' && (
          <>
            {/* Left Sidebar - Pathway Explorer (collapsible) */}
            {showSidebar && phase2View !== 'pathway' && (
              <div className="w-96 border-r border-teal-500/20 p-4 overflow-hidden">
                <PathwayExplorer />
              </div>
            )}

            {/* Main Phase 2 workspace */}
            <div className="flex-1 overflow-hidden">
              {phase2View === 'circuit' && (
                <CircuitDesignerConsole />
              )}
              {phase2View === 'simulator' && (
                <div className="h-full p-4">
                  <ExpressionSimulator />
                </div>
              )}
              {phase2View === 'pathway' && (
                <div className="h-full p-4">
                  <PathwayExplorer />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-t border-indigo-500/30 px-6 py-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              System Online
            </span>
            {activePhase === 'phase1' && selectedProtein && (
              <span>Loaded: {selectedProtein.protein_name}</span>
            )}
            {activePhase === 'phase2' && (
              <span className="text-teal-400">
                Genetic Circuit Designer · KEGG · BioBricks · NCBI
              </span>
            )}
          </div>
          <span>
            {activePhase === 'phase1'
              ? 'Phase 1: Molecular Blueprint'
              : 'Phase 2: Genetic Circuit Designer'}{' '}
            | v0.2.0
          </span>
        </div>
      </div>
    </div>
  )
}
