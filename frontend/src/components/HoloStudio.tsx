'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Maximize2, RotateCw, Download, Eye, Search } from 'lucide-react'

interface HoloStudioProps {
  initialPdbId?: string
  title?: string
}

const REPRESENTATIONS = ['cartoon', 'ball+stick', 'surface', 'ribbon', 'licorice'] as const
type Representation = typeof REPRESENTATIONS[number]

export default function HoloStudio({ initialPdbId = '1AKI', title }: HoloStudioProps) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<any>(null)
  const stageReadyRef = useRef(false)

  const [pdbInput, setPdbInput] = useState(initialPdbId)
  const [loadedPdbId, setLoadedPdbId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [representation, setRepresentation] = useState<Representation>('cartoon')

  // Load structure via the backend proxy (avoids CORS with rcsb.org)
  const loadStructure = useCallback(async (pdbId: string, repr: Representation) => {
    if (!stageReadyRef.current || !stageRef.current) return
    const clean = pdbId.trim().toUpperCase()
    if (!clean || clean.length !== 4) {
      setError('PDB IDs are exactly 4 characters (e.g. 1AKI, 4HHB).')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      stageRef.current.removeAllComponents()

      // Relative URL → Next.js proxy → FastAPI → RCSB (no browser CORS issue)
      const proxyUrl = `/api/bio/pdb/file/${clean}`

      const component = await stageRef.current.loadFile(proxyUrl, {
        ext: 'cif',
        defaultRepresentation: false,
      })

      component.addRepresentation(repr, {
        colorScheme: 'chainid',
        sele: 'protein',
      })

      // Show ligands / cofactors
      component.addRepresentation('ball+stick', {
        colorScheme: 'element',
        sele: 'not polymer and not water',
        radiusScale: 0.6,
      })

      component.autoView()
      setLoadedPdbId(clean)
    } catch (err: any) {
      console.error('NGL load error:', err)
      setError(`Could not load PDB "${clean}". Check the ID and try again.`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initialise NGL Stage once (dynamic import avoids SSR issues)
  useEffect(() => {
    if (!viewerRef.current) return
    let cancelled = false

    import('ngl').then((NGL) => {
      if (cancelled || !viewerRef.current) return

      const stage = new NGL.Stage(viewerRef.current as HTMLDivElement, {
        backgroundColor: '#0f172a',
        tooltip: false,
      })
      stageRef.current = stage
      stageReadyRef.current = true

      if (initialPdbId) loadStructure(initialPdbId, 'cartoon')

      const onResize = () => stage.handleResize()
      window.addEventListener('resize', onResize)

      // Cleanup stored in a closure so it runs on unmount
      ;(viewerRef.current as any).__nglCleanup = () => {
        window.removeEventListener('resize', onResize)
        stage.dispose()
        stageReadyRef.current = false
      }
    }).catch((e) => {
      console.error('NGL import failed:', e)
      setError('3D viewer failed to initialise.')
    })

    return () => {
      cancelled = true
      const cleanup = (viewerRef.current as any)?.__nglCleanup
      if (cleanup) cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-apply representation when dropdown changes (only if something already loaded)
  useEffect(() => {
    if (loadedPdbId) loadStructure(loadedPdbId, representation)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [representation])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadStructure(pdbInput, representation)
  }

  const handleResetView = () => {
    if (stageRef.current?.compList?.length) stageRef.current.autoView(800)
  }

  const handleScreenshot = () => {
    if (!stageRef.current) return
    stageRef.current
      .makeImage({ factor: 2, antialias: true, trim: false, transparent: false })
      .then((blob: Blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${loadedPdbId || 'structure'}.png`
        a.click()
        URL.revokeObjectURL(url)
      })
  }

  const handleFullscreen = () => viewerRef.current?.requestFullscreen?.()

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 rounded-xl overflow-hidden border border-indigo-500/30">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-sm border-b border-indigo-500/30 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Holo-Studio</h2>
            {title && <p className="text-xs text-indigo-300">{title}</p>}
            {loadedPdbId && (
              <p className="text-xs text-gray-400 font-mono">PDB: {loadedPdbId}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* PDB ID search */}
            <form onSubmit={handleSearch} className="flex items-center gap-1">
              <input
                value={pdbInput}
                onChange={(e) => setPdbInput(e.target.value.toUpperCase())}
                placeholder="PDB ID"
                maxLength={4}
                className="w-20 bg-slate-800/60 text-white text-sm rounded-lg px-2 py-1.5 border border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono text-center uppercase"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors"
                title="Load Structure"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Representation selector */}
            <select
              value={representation}
              onChange={(e) => setRepresentation(e.target.value as Representation)}
              className="bg-slate-800/50 text-white text-sm rounded-lg px-2 py-1.5 border border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {REPRESENTATIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <button
              onClick={handleResetView}
              className="p-2 bg-slate-800/50 text-indigo-400 rounded-lg hover:bg-slate-700/50 transition-colors"
              title="Reset View"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleScreenshot}
              className="p-2 bg-slate-800/50 text-indigo-400 rounded-lg hover:bg-slate-700/50 transition-colors"
              title="Save Screenshot"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleFullscreen}
              className="p-2 bg-slate-800/50 text-indigo-400 rounded-lg hover:bg-slate-700/50 transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Viewer canvas ── */}
      <div className="flex-1 relative min-h-0">
        <div ref={viewerRef} className="absolute inset-0" />

        {/* Loading overlay */}
        {isLoading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm z-10">
            <div className="flex items-center gap-3 bg-slate-800/90 rounded-xl px-6 py-4 shadow-xl">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400" />
              <span className="text-white text-sm">Loading {pdbInput.toUpperCase()}…</span>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm z-10">
            <div className="bg-red-900/90 border border-red-500 rounded-xl px-6 py-4 max-w-sm text-center shadow-xl">
              <p className="text-white text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-3 text-xs text-red-300 hover:text-white underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loadedPdbId && !isLoading && !error && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <Eye className="w-16 h-16 text-indigo-500/30 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Enter a PDB ID above</p>
              <p className="text-gray-500 text-sm mt-1">e.g. 1AKI · 4HHB · 1GZX · 3PTB</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Info bar ── */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-t border-indigo-500/30 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Left-drag: rotate · Right-drag: pan · Scroll: zoom</span>
          <span>NGL Viewer · RCSB PDB</span>
        </div>
      </div>
    </div>
  )
}
