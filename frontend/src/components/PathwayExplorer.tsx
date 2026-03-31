'use client'

import { useState } from 'react'
import { Search, Loader2, FlaskConical, ExternalLink } from 'lucide-react'

interface Pathway {
  id: string
  name: string
}

interface PathwayDetail {
  id: string
  name?: string
  entry?: string
  definition?: string
  pathway_class?: string
  disease?: string
  raw?: string
}

const QUICK_PATHWAYS = [
  { id: 'map00010', name: 'Glycolysis / Gluconeogenesis' },
  { id: 'map00020', name: 'TCA Cycle' },
  { id: 'map00030', name: 'Pentose phosphate pathway' },
  { id: 'map00190', name: 'Oxidative phosphorylation' },
  { id: 'map01100', name: 'Metabolic pathways (overview)' },
  { id: 'map00600', name: 'Sphingolipid metabolism' },
  { id: 'map00940', name: 'Phenylpropanoid biosynthesis' },
  { id: 'map00900', name: 'Terpenoid backbone biosynthesis' },
]

export default function PathwayExplorer() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [searchResults, setSearchResults] = useState<Pathway[]>([])
  const [selectedPathway, setSelectedPathway] = useState<PathwayDetail | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setIsSearching(true)
    setSearchResults([])
    try {
      const resp = await fetch(`/api/bio/kegg/search/${encodeURIComponent(query.trim())}`)
      if (resp.ok) {
        const data = await resp.json()
        setSearchResults(data.results || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSearching(false)
    }
  }

  const loadPathway = async (pathwayId: string) => {
    setIsFetching(true)
    setSelectedPathway(null)
    try {
      const clean = pathwayId.replace('path:', '')
      const resp = await fetch(`/api/bio/kegg/pathway/${clean}`)
      if (resp.ok) {
        const data = await resp.json()
        setSelectedPathway(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsFetching(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-xl overflow-hidden border border-white/10">

      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Pathway Explorer</h2>
            <p className="text-xs text-slate-400">KEGG Metabolic Pathway Database</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Left: search + results list */}
        <div className="w-72 border-r border-white/10 flex flex-col">
          <div className="p-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pathway (e.g. glycolysis)"
                className="flex-1 bg-slate-800/50 text-white placeholder-slate-500 text-sm rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </form>

            <p className="text-xs text-slate-500 mt-3 mb-2">Quick load:</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PATHWAYS.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  onClick={() => loadPathway(p.id)}
                  className="text-xs bg-slate-800/50 text-green-300 px-2 py-1 rounded hover:bg-slate-700/50 transition-colors border border-green-500/20"
                >
                  {p.id}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
            {searchResults.map((r) => (
              <button
                key={r.id}
                onClick={() => loadPathway(r.id)}
                className="w-full text-left bg-slate-800/30 hover:bg-slate-700/50 rounded-lg px-3 py-2.5 transition-colors border border-white/5 hover:border-green-500/30"
              >
                <p className="text-xs font-mono text-green-300">{r.id.replace('path:', '')}</p>
                <p className="text-xs text-slate-300 mt-0.5 leading-tight">{r.name}</p>
              </button>
            ))}
            {searchResults.length === 0 && !isSearching && query && (
              <p className="text-xs text-slate-500 text-center py-4">No results found</p>
            )}
          </div>
        </div>

        {/* Right: pathway detail */}
        <div className="flex-1 overflow-y-auto p-4">
          {isFetching && (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-3 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading pathway…</span>
              </div>
            </div>
          )}

          {!isFetching && !selectedPathway && (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <FlaskConical className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400">Search or select a pathway</p>
                <p className="text-slate-600 text-sm mt-1">KEGG has 500+ metabolic pathway maps</p>
              </div>
            </div>
          )}

          {!isFetching && selectedPathway && (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-slate-800/30 rounded-xl p-4 border border-white/5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-mono text-green-400 mb-1">{selectedPathway.id}</p>
                    <h3 className="text-white font-semibold text-lg">
                      {selectedPathway.name || selectedPathway.entry || selectedPathway.id}
                    </h3>
                    {selectedPathway.pathway_class && (
                      <p className="text-xs text-slate-400 mt-1">{selectedPathway.pathway_class}</p>
                    )}
                  </div>
                  <a
                    href={`https://www.genome.jp/pathway/${selectedPathway.id.replace('path:', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
                  >
                    KEGG <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Pathway map image */}
              <div className="bg-slate-800/30 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-slate-400 mb-3 font-medium">Pathway Map</p>
                <img
                  src={`https://www.genome.jp/kegg/pathway/${selectedPathway.id.replace('path:', '')}.png`}
                  alt={`KEGG pathway map ${selectedPathway.id}`}
                  className="rounded-lg max-w-full opacity-90 hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>

              {/* Definition */}
              {selectedPathway.definition && (
                <div className="bg-slate-800/30 rounded-xl p-4 border border-white/5">
                  <p className="text-xs text-slate-400 mb-2 font-medium">Definition</p>
                  <p className="text-sm text-slate-200 leading-relaxed">{selectedPathway.definition}</p>
                </div>
              )}

              {/* Raw flat-file preview */}
              {selectedPathway.raw && (
                <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                  <p className="text-xs text-slate-400 mb-2 font-medium">KEGG Flat-File (preview)</p>
                  <pre className="text-xs text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {selectedPathway.raw}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
