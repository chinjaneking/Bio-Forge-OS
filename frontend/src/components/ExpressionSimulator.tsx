'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Plus, Trash2, BarChart2, BookOpen } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface GenePart {
  id: string
  name: string
  type: 'promoter' | 'rbs' | 'cds' | 'terminator' | 'reporter'
  strength: number   // 0–1 relative to max
  color: string
}

interface CircuitGene {
  id: string
  label: string
  parts: GenePart[]
  expressionLevel: number  // 0–100
}

// ─── Presets ──────────────────────────────────────────────────────────────────

const PART_COLORS: Record<string, string> = {
  promoter:   '#6366f1',
  rbs:        '#f59e0b',
  cds:        '#3b82f6',
  terminator: '#ef4444',
  reporter:   '#a855f7',
}

const PART_HEIGHT = 24
const TRACK_HEIGHT = 56
const PART_SHAPES: Record<string, string> = {
  promoter:   'M4,20 L4,4 L14,4 L14,10 L20,10',          // bent arrow
  rbs:        'M4,12 L20,12',                               // line
  cds:        'M4,8 L16,8 L20,12 L16,16 L4,16 Z',          // arrow box
  terminator: 'M12,4 L12,20 M6,4 L18,4',                   // T-shape
  reporter:   'M12,4 L15,10 L20,10 L16,14 L18,20 L12,16 L6,20 L8,14 L4,10 L9,10 Z', // star
}

const TEMPLATE_CIRCUITS: CircuitGene[] = [
  {
    id: 'lycopene-crtE',
    label: 'crtE (GGPPS)',
    parts: [
      { id: 'p1', name: 'J23101', type: 'promoter',   strength: 0.70, color: PART_COLORS.promoter },
      { id: 'r1', name: 'B0034',  type: 'rbs',        strength: 1.00, color: PART_COLORS.rbs },
      { id: 'c1', name: 'crtE',   type: 'cds',        strength: 1.00, color: PART_COLORS.cds },
      { id: 't1', name: 'B0015',  type: 'terminator', strength: 1.00, color: PART_COLORS.terminator },
    ],
    expressionLevel: 70,
  },
  {
    id: 'lycopene-crtB',
    label: 'crtB (PSY)',
    parts: [
      { id: 'p2', name: 'J23106', type: 'promoter',   strength: 0.47, color: PART_COLORS.promoter },
      { id: 'r2', name: 'B0032',  type: 'rbs',        strength: 0.30, color: PART_COLORS.rbs },
      { id: 'c2', name: 'crtB',   type: 'cds',        strength: 1.00, color: PART_COLORS.cds },
      { id: 't2', name: 'B0015',  type: 'terminator', strength: 1.00, color: PART_COLORS.terminator },
    ],
    expressionLevel: 47,
  },
  {
    id: 'lycopene-crtI',
    label: 'crtI (PDS)',
    parts: [
      { id: 'p3', name: 'J23117', type: 'promoter',   strength: 0.06, color: PART_COLORS.promoter },
      { id: 'r3', name: 'B0031',  type: 'rbs',        strength: 0.07, color: PART_COLORS.rbs },
      { id: 'c3', name: 'crtI',   type: 'cds',        strength: 1.00, color: PART_COLORS.cds },
      { id: 't3', name: 'B0010',  type: 'terminator', strength: 1.00, color: PART_COLORS.terminator },
    ],
    expressionLevel: 6,
  },
  {
    id: 'reporter-gfp',
    label: 'GFP Reporter',
    parts: [
      { id: 'p4', name: 'Plac',   type: 'promoter',   strength: 0.60, color: PART_COLORS.promoter },
      { id: 'r4', name: 'B0034',  type: 'rbs',        strength: 1.00, color: PART_COLORS.rbs },
      { id: 'c4', name: 'GFP',    type: 'reporter',   strength: 1.00, color: PART_COLORS.reporter },
      { id: 't4', name: 'B0015',  type: 'terminator', strength: 1.00, color: PART_COLORS.terminator },
    ],
    expressionLevel: 60,
  },
]

// ─── Parts library panel ──────────────────────────────────────────────────────

const PARTS_LIBRARY: Array<{ id: string; name: string; type: GenePart['type']; strength: number; notes: string }> = [
  { id: 'J23100', name: 'J23100', type: 'promoter',   strength: 1.00, notes: 'Strongest Anderson' },
  { id: 'J23101', name: 'J23101', type: 'promoter',   strength: 0.70, notes: 'High constitutive' },
  { id: 'J23106', name: 'J23106', type: 'promoter',   strength: 0.47, notes: 'Medium constitutive' },
  { id: 'J23117', name: 'J23117', type: 'promoter',   strength: 0.06, notes: 'Weak constitutive' },
  { id: 'Plac',   name: 'Plac',   type: 'promoter',   strength: 0.60, notes: 'IPTG inducible' },
  { id: 'Ptet',   name: 'Ptet',   type: 'promoter',   strength: 0.80, notes: 'aTc inducible' },
  { id: 'B0034',  name: 'B0034',  type: 'rbs',        strength: 1.00, notes: 'Strong RBS' },
  { id: 'B0032',  name: 'B0032',  type: 'rbs',        strength: 0.30, notes: 'Medium RBS' },
  { id: 'B0031',  name: 'B0031',  type: 'rbs',        strength: 0.07, notes: 'Weak RBS' },
  { id: 'B0015',  name: 'B0015',  type: 'terminator', strength: 1.00, notes: 'Double terminator' },
  { id: 'B0010',  name: 'B0010',  type: 'terminator', strength: 0.80, notes: 'rrnBT1 terminator' },
]

// ─── SVG Circuit track ────────────────────────────────────────────────────────

function CircuitTrack({ gene }: { gene: CircuitGene }) {
  const W = 480
  const partW = Math.floor((W - 40) / Math.max(gene.parts.length, 1))

  return (
    <svg width={W} height={TRACK_HEIGHT} className="overflow-visible">
      {/* backbone line */}
      <line x1={16} y1={TRACK_HEIGHT / 2} x2={W - 16} y2={TRACK_HEIGHT / 2}
        stroke="#334155" strokeWidth={2} />

      {gene.parts.map((part, idx) => {
        const x = 16 + idx * partW
        const y = (TRACK_HEIGHT - PART_HEIGHT) / 2
        return (
          <g key={part.id} transform={`translate(${x}, ${y})`}>
            {/* Part box */}
            <rect
              x={2} y={0} width={partW - 6} height={PART_HEIGHT}
              rx={4}
              fill={part.color}
              fillOpacity={0.25}
              stroke={part.color}
              strokeWidth={1.5}
            />
            {/* Label */}
            <text
              x={(partW - 6) / 2} y={PART_HEIGHT / 2 + 1}
              textAnchor="middle" dominantBaseline="middle"
              fill={part.color}
              fontSize={9}
              fontFamily="monospace"
              fontWeight="600"
            >
              {part.name.length > 8 ? part.name.slice(0, 7) + '…' : part.name}
            </text>
            {/* Strength tick */}
            <rect
              x={2} y={PART_HEIGHT - 4} width={(partW - 6) * part.strength} height={3}
              rx={1}
              fill={part.color}
              fillOpacity={0.8}
            />
          </g>
        )
      })}
    </svg>
  )
}

// ─── Expression bar ────────────────────────────────────────────────────────────

function ExpressionBar({ level, label, color }: { level: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-24 truncate font-mono">{label}</span>
      <div className="flex-1 bg-slate-800/50 rounded-full h-4 relative overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${level}%`,
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
          }}
        />
      </div>
      <span className="text-xs text-slate-400 w-10 text-right">{level}%</span>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ExpressionSimulator() {
  const [genes, setGenes] = useState<CircuitGene[]>(TEMPLATE_CIRCUITS)
  const [showLibrary, setShowLibrary] = useState(false)
  const [totalBurden, setTotalBurden] = useState(0)

  // Calculate total metabolic burden (sum of expression levels, max safe ~200)
  useEffect(() => {
    const total = genes.reduce((sum, g) => sum + g.expressionLevel, 0)
    setTotalBurden(total)
  }, [genes])

  const burdenPercent = Math.min(100, Math.round((totalBurden / 300) * 100))
  const burdenColor = burdenPercent < 50 ? '#22c55e' : burdenPercent < 75 ? '#f59e0b' : '#ef4444'

  const addGene = () => {
    const newGene: CircuitGene = {
      id: `gene-${Date.now()}`,
      label: 'New Gene',
      parts: [
        { id: `p-${Date.now()}`, name: 'J23106', type: 'promoter',   strength: 0.47, color: PART_COLORS.promoter },
        { id: `r-${Date.now()}`, name: 'B0034',  type: 'rbs',        strength: 1.00, color: PART_COLORS.rbs },
        { id: `c-${Date.now()}`, name: 'gene',   type: 'cds',        strength: 1.00, color: PART_COLORS.cds },
        { id: `t-${Date.now()}`, name: 'B0015',  type: 'terminator', strength: 1.00, color: PART_COLORS.terminator },
      ],
      expressionLevel: 47,
    }
    setGenes((prev) => [...prev, newGene])
  }

  const removeGene = (id: string) => setGenes((prev) => prev.filter((g) => g.id !== id))

  const updateExpression = (id: string, level: number) => {
    setGenes((prev) => prev.map((g) => (g.id === id ? { ...g, expressionLevel: level } : g)))
  }

  const updateLabel = (id: string, label: string) => {
    setGenes((prev) => prev.map((g) => (g.id === id ? { ...g, label } : g)))
  }

  const resetToTemplate = () => setGenes(TEMPLATE_CIRCUITS)

  const geneColors = ['#6366f1', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6']

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-xl overflow-hidden border border-white/10">

      {/* ── Header ── */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Expression Simulator</h2>
              <p className="text-xs text-slate-400">2D Circuit Topology + Expression Levels</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLibrary((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                showLibrary ? 'bg-indigo-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Parts Library
            </button>
            <button
              onClick={addGene}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Gene
            </button>
            <button
              onClick={resetToTemplate}
              className="p-1.5 bg-slate-800/50 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Reset to lycopene template"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Main panel ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Metabolic burden meter */}
          <div className="bg-slate-800/30 rounded-xl p-3 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">Metabolic Burden Index</span>
              <span className="text-xs font-mono" style={{ color: burdenColor }}>
                {burdenPercent}% {burdenPercent > 75 ? '⚠ High burden' : burdenPercent > 50 ? '⚡ Moderate' : '✓ Healthy'}
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${burdenPercent}%`, background: burdenColor }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Total expression load: {totalBurden} / 300 max recommended units
            </p>
          </div>

          {/* Gene tracks */}
          {genes.map((gene, gIdx) => {
            const color = geneColors[gIdx % geneColors.length]
            return (
              <div key={gene.id} className="bg-slate-800/30 rounded-xl p-3 border border-white/5">
                {/* Gene label row */}
                <div className="flex items-center justify-between mb-2">
                  <input
                    value={gene.label}
                    onChange={(e) => updateLabel(gene.id, e.target.value)}
                    className="bg-transparent text-sm font-semibold text-white focus:outline-none border-b border-transparent focus:border-slate-500 w-40"
                  />
                  <button
                    onClick={() => removeGene(gene.id)}
                    className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* SVG circuit track */}
                <div className="overflow-x-auto">
                  <CircuitTrack gene={gene} />
                </div>

                {/* Expression slider */}
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-24">Expression:</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={gene.expressionLevel}
                    onChange={(e) => updateExpression(gene.id, Number(e.target.value))}
                    className="flex-1 accent-indigo-500"
                  />
                  <span className="text-xs font-mono w-8" style={{ color }}>{gene.expressionLevel}%</span>
                </div>
              </div>
            )
          })}

          {/* Expression bar chart */}
          <div className="bg-slate-800/30 rounded-xl p-4 border border-white/5">
            <p className="text-xs font-medium text-slate-400 mb-3">Relative Expression Levels</p>
            <div className="space-y-2">
              {genes.map((gene, gIdx) => (
                <ExpressionBar
                  key={gene.id}
                  label={gene.label}
                  level={gene.expressionLevel}
                  color={geneColors[gIdx % geneColors.length]}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Parts library sidebar ── */}
        {showLibrary && (
          <div className="w-64 border-l border-white/10 bg-slate-900/50 overflow-y-auto p-3">
            <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Standard Parts</p>
            <div className="space-y-1.5">
              {PARTS_LIBRARY.map((part) => (
                <div
                  key={part.id}
                  className="bg-slate-800/50 rounded-lg p-2.5 border border-white/5 hover:border-indigo-500/40 transition-colors cursor-default"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-mono font-semibold"
                      style={{ color: PART_COLORS[part.type] }}
                    >
                      {part.name}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded capitalize"
                      style={{
                        background: PART_COLORS[part.type] + '22',
                        color: PART_COLORS[part.type],
                      }}
                    >
                      {part.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{part.notes}</p>
                  {part.type === 'promoter' || part.type === 'rbs' ? (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${part.strength * 100}%`,
                            background: PART_COLORS[part.type],
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 font-mono">{(part.strength * 100).toFixed(0)}%</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
