'use client'

import { useState } from 'react'
import { Search, Loader2, Database, Info } from 'lucide-react'

interface ProteinData {
  accession: string
  name: string
  protein_name: string
  organism: string
  sequence: string
  length: number
  gene: string
  function: string
}

interface ProteinExplorerProps {
  onProteinSelect: (data: ProteinData) => void
}

export default function ProteinExplorer({ onProteinSelect }: ProteinExplorerProps) {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [proteinData, setProteinData] = useState<ProteinData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Core fetch logic — accepts the ID directly so quick-load buttons
  // don't depend on React state having flushed yet.
  const fetchProtein = async (id: string) => {
    const clean = id.trim().toUpperCase()
    if (!clean) return

    setIsLoading(true)
    setError(null)
    setProteinData(null)

    try {
      const response = await fetch(`/api/bio/uniprot/${clean}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setProteinData(data)
      onProteinSelect(data)
    } catch (err) {
      console.error('UniProt fetch error:', err)
      setError(`Could not load "${clean}". Make sure it is a valid UniProt accession (e.g. P00698).`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProtein(query)
  }

  const quickProteins = [
    { id: 'P00698', name: 'Lysozyme C' },
    { id: 'P00766', name: 'Chymotrypsinogen A' },
    { id: 'P69905', name: 'Hemoglobin alpha' },
    { id: 'P01308', name: 'Insulin' },
  ]

  const handleQuickLoad = (id: string) => {
    setQuery(id)
    fetchProtein(id)   // call directly — no setTimeout/dispatchEvent needed
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 rounded-xl overflow-hidden border border-indigo-500/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-sm border-b border-indigo-500/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Database className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Protein Explorer</h2>
            <p className="text-xs text-indigo-300">Search UniProt Database</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter UniProt ID (e.g., P00698)"
            className="flex-1 bg-slate-800/50 text-white placeholder-gray-500 rounded-lg px-4 py-2 text-sm border border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </form>

        {/* Quick Load Buttons */}
        <div className="mt-3">
          <p className="text-xs text-gray-400 mb-2">Quick load:</p>
          <div className="flex flex-wrap gap-2">
            {quickProteins.map((protein) => (
              <button
                key={protein.id}
                onClick={() => handleQuickLoad(protein.id)}
                className="text-xs bg-slate-800/50 text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-slate-700/50 transition-colors border border-indigo-500/20"
              >
                {protein.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg px-4 py-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {proteinData && (
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Info className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">{proteinData.protein_name}</h3>
                <p className="text-gray-400 text-sm">{proteinData.organism}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">UniProt ID:</span>
                <p className="text-white font-mono">{proteinData.accession}</p>
              </div>
              <div>
                <span className="text-gray-400">Gene:</span>
                <p className="text-white">{proteinData.gene || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-400">Length:</span>
                <p className="text-white">{proteinData.length} aa</p>
              </div>
              <div>
                <span className="text-gray-400">Name:</span>
                <p className="text-white font-mono text-xs">{proteinData.name}</p>
              </div>
            </div>

            {proteinData.function && (
              <div>
                <span className="text-gray-400 text-sm">Function:</span>
                <p className="text-gray-200 text-sm mt-1 leading-relaxed">
                  {proteinData.function}
                </p>
              </div>
            )}

            {proteinData.sequence && (
              <div>
                <span className="text-gray-400 text-sm">Sequence:</span>
                <div className="bg-slate-900/50 rounded p-3 mt-1 max-h-32 overflow-y-auto">
                  <p className="text-xs font-mono text-gray-300 break-all leading-relaxed">
                    {proteinData.sequence}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
