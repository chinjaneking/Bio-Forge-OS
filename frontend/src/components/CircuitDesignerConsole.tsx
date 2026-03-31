'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Dna, Zap, Scissors, Package } from 'lucide-react'

type DesignMode = 'design' | 'optimize' | 'crispr' | 'parts'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  circuitParts?: Array<{ type: string; description: string }>
  mode?: DesignMode
}

const MODES: { id: DesignMode; label: string; icon: any; placeholder: string; color: string }[] = [
  {
    id: 'design',
    label: 'Circuit Design',
    icon: Dna,
    placeholder: 'e.g. "Design a circuit to produce lycopene in E. coli"',
    color: 'from-indigo-600 to-purple-600',
  },
  {
    id: 'optimize',
    label: 'Optimize Expression',
    icon: Zap,
    placeholder: 'e.g. "Optimize crtE, crtB, crtI expression for lycopene"',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'crispr',
    label: 'CRISPR Design',
    icon: Scissors,
    placeholder: 'e.g. "Knockout lacZ in E. coli MG1655"',
    color: 'from-rose-500 to-pink-600',
  },
  {
    id: 'parts',
    label: 'Select Parts',
    icon: Package,
    placeholder: 'e.g. "Strong inducible promoter and matching RBS for E. coli"',
    color: 'from-teal-500 to-cyan-600',
  },
]

const PART_COLORS: Record<string, string> = {
  promoter: 'bg-green-500/20 text-green-300 border-green-500/40',
  rbs: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  cds: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  terminator: 'bg-red-500/20 text-red-300 border-red-500/40',
  reporter: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
}

const PART_SYMBOLS: Record<string, string> = {
  promoter: '▶',
  rbs: '◉',
  cds: '▬',
  terminator: '◀',
  reporter: '★',
}

export default function CircuitDesignerConsole() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content:
        'Welcome to the Genetic Circuit Designer — Phase 2. Choose a design mode and describe your biological engineering goal. I can design complete gene circuits, optimize multi-gene expression, plan CRISPR edits, or select standard biological parts.',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeMode, setActiveMode] = useState<DesignMode>('design')
  const [hostOrganism, setHostOrganism] = useState('E. coli')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const buildPayload = (userInput: string) => {
    switch (activeMode) {
      case 'design':
        return {
          endpoint: '/api/circuit/design',
          body: { objective: userInput, host_organism: hostOrganism },
        }
      case 'optimize': {
        // Parse comma-separated gene list from input
        const genes = userInput
          .split(/[,，\n]/)
          .map((g) => g.trim())
          .filter(Boolean)
        return {
          endpoint: '/api/circuit/optimize-expression',
          body: {
            gene_list: genes.length > 1 ? genes : [userInput],
            optimization_goal: genes.length > 1 ? `Optimize ${genes.join(', ')}` : userInput,
          },
        }
      }
      case 'crispr': {
        const parts = userInput.split(/\s+in\s+/i)
        return {
          endpoint: '/api/circuit/crispr',
          body: {
            target_gene: parts[0]?.replace(/^(knockout|knockin|edit|delete)\s+/i, '').trim() || userInput,
            edit_type: userInput.toLowerCase().startsWith('knock') ? 'knockout' : 'edit',
            organism: parts[1] || hostOrganism,
          },
        }
      }
      case 'parts':
        return {
          endpoint: '/api/circuit/select-parts',
          body: {
            parts_needed: [userInput],
            constraints: `Host: ${hostOrganism}`,
          },
        }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      mode: activeMode,
    }
    setMessages((prev) => [...prev, userMsg])
    const userInput = input
    setInput('')
    setIsLoading(true)

    try {
      const { endpoint, body } = buildPayload(userInput)
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const data = await resp.json()

      // Unify response text from different endpoints
      const text =
        data.design || data.optimization || data.crispr_design || data.mutations || data.parts || data.response || ''

      const assistantMsg: Message = {
        role: 'assistant',
        content: text,
        timestamp: new Date(),
        circuitParts: data.circuit_parts,
        mode: activeMode,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          content: 'Failed to connect to the Circuit Designer. Please try again.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const currentMode = MODES.find((m) => m.id === activeMode)!

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm border-b border-white/10 px-5 py-3">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-gradient-to-br ${currentMode.color} rounded-xl`}>
              <currentMode.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Genetic Circuit Designer</h2>
              <p className="text-xs text-slate-400">Phase 2 — Gene Circuit Engineering</p>
            </div>
          </div>

          {/* Host organism */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 text-xs">Host:</span>
            <select
              value={hostOrganism}
              onChange={(e) => setHostOrganism(e.target.value)}
              className="bg-slate-800/60 text-white text-xs rounded-lg px-2 py-1.5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {['E. coli', 'S. cerevisiae', 'B. subtilis', 'P. putida', 'CHO cells', 'HEK293'].map((org) => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mode selector tabs */}
        <div className="flex gap-1 mt-3 flex-wrap">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeMode === mode.id
                  ? `bg-gradient-to-r ${mode.color} text-white shadow-lg`
                  : 'text-slate-400 bg-slate-800/40 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <mode.icon className="w-3.5 h-3.5" />
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role !== 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                GC
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? `bg-gradient-to-r ${MODES.find((m) => m.id === msg.mode)?.color || 'from-indigo-600 to-purple-600'} text-white`
                  : msg.role === 'system'
                  ? 'bg-slate-800/50 text-slate-300 border border-white/10'
                  : 'bg-slate-800/70 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>

              {/* Circuit parts visualization */}
              {msg.circuitParts && msg.circuitParts.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-slate-400 mb-2 font-medium">Circuit Elements Detected:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.circuitParts.map((part, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                          PART_COLORS[part.type] || 'bg-slate-700/50 text-slate-300 border-slate-600'
                        }`}
                        title={part.description}
                      >
                        <span>{PART_SYMBOLS[part.type] || '▪'}</span>
                        <span className="font-mono capitalize">{part.type}</span>
                      </div>
                    ))}
                  </div>
                  {/* Linear circuit diagram */}
                  <div className="mt-2 flex items-center gap-0.5 flex-wrap">
                    {msg.circuitParts.map((part, idx) => (
                      <span key={idx} className="flex items-center">
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-mono ${
                            PART_COLORS[part.type] || 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {PART_SYMBOLS[part.type]} {part.type.slice(0, 4).toUpperCase()}
                        </span>
                        {idx < msg.circuitParts!.length - 1 && (
                          <span className="text-slate-600 text-xs mx-0.5">──</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-500 mt-2">{msg.timestamp.toLocaleTimeString()}</div>
            </div>

            {msg.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                U
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              GC
            </div>
            <div className="bg-slate-800/70 rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
              <span className="text-sm text-slate-300">Designing circuit…</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div className="border-t border-white/10 bg-slate-900/60 backdrop-blur-sm px-5 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currentMode.placeholder}
            disabled={isLoading}
            className="flex-1 bg-slate-800/50 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`px-5 py-3 bg-gradient-to-r ${currentMode.color} text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="mt-2 text-center text-xs text-slate-600">
          Genetic Circuit Designer · Phase 2 · Powered by Bio-Forge AI
        </p>
      </div>
    </div>
  )
}
