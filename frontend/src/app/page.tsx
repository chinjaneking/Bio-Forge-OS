'use client'

import { useState } from 'react'
import BioLingoConsole from '@/components/BioLingoConsole'
import HoloStudio from '@/components/HoloStudio'
import ProteinExplorer from '@/components/ProteinExplorer'
import { Dna, Menu, X } from 'lucide-react'

export default function Home() {
  const [selectedPdbId, setSelectedPdbId] = useState<string>('1AKI')
  const [selectedProtein, setSelectedProtein] = useState<any>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [activeView, setActiveView] = useState<'split' | 'console' | 'studio'>('split')

  const handleProteinSelect = (data: any) => {
    setSelectedProtein(data)
    // For demo, we'll use a default PDB structure
    // In production, you'd query PDB for structures matching the protein
    setSelectedPdbId('1AKI') // Example: you'd fetch related structures
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Top Navigation Bar */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-sm border-b border-indigo-500/30 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <Dna className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Bio-Forge</h1>
                <p className="text-xs text-indigo-300">Molecular Design Platform - MVP</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
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
        {/* Left Sidebar - Protein Explorer */}
        {showSidebar && (
          <div className="w-96 border-r border-indigo-500/30 p-4 overflow-hidden">
            <ProteinExplorer onProteinSelect={handleProteinSelect} />
          </div>
        )}

        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Bio-Lingo Console */}
          {(activeView === 'console' || activeView === 'split') && (
            <div className={activeView === 'split' ? 'flex-1' : 'w-full'}>
              <BioLingoConsole />
            </div>
          )}

          {/* Holo-Studio 3D Viewer */}
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
      </div>

      {/* Status Bar */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-t border-indigo-500/30 px-6 py-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              System Online
            </span>
            {selectedProtein && (
              <span>Loaded: {selectedProtein.protein_name}</span>
            )}
          </div>
          <span>Phase 1: Molecular Blueprint | v0.1.0-MVP</span>
        </div>
      </div>
    </div>
  )
}
