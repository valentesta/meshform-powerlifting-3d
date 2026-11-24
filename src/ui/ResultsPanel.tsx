import { useEffect, useState } from 'react'
import { RESULTS_BY_SEX, type ResultsSex } from '../data/results'
import FlagIcon from './FlagIcon'

type ResultsPanelProps = {
  open: boolean
  onClose: () => void
}

const TABS: { id: ResultsSex; label: string }[] = [
  { id: 'women', label: 'Women' },
  { id: 'men', label: 'Men' },
]

export default function ResultsPanel({ open, onClose }: ResultsPanelProps) {
  const [sex, setSex] = useState<ResultsSex>('women')
  const rows = RESULTS_BY_SEX[sex]

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Sheffield V 2026 final results"
        className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0d131e]/95 shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-300">
              Sheffield V 2026 · OpenIPF
            </p>
            <h2 className="flex items-center gap-2 text-lg font-black text-white sm:text-xl">
              <span className="rounded bg-red-600 px-1.5 py-0.5 text-xs text-white">MF</span>
              Standings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close results"
            className="min-h-11 rounded-lg border border-white/20 bg-white/5 px-3 text-sm font-bold text-slate-200 hover:bg-white/15"
          >
            ✕
          </button>
        </header>

        <div className="flex gap-2 px-4 py-3 sm:px-5" role="tablist" aria-label="Results category">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={sex === tab.id}
              onClick={() => setSex(tab.id)}
              className={`min-h-10 rounded-lg border px-4 text-xs font-bold uppercase tracking-wider transition ${
                sex === tab.id
                  ? 'border-red-400/70 bg-red-500/20 text-white'
                  : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <p className="ml-auto hidden self-center text-[10px] uppercase tracking-wider text-slate-500 sm:block">
            Scroll for all {rows.length} finalists
          </p>
        </div>

        <div className="min-h-0 max-h-[46vh] flex-1 overflow-y-auto px-2 pb-3 sm:px-4">
          <table className="w-full border-collapse text-left text-xs tabular-nums sm:text-sm">
            <thead className="sticky top-0 z-10 bg-[#0d131e] text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                <th scope="col" className="px-2 py-2">#</th>
                <th scope="col" className="px-2 py-2">Lifter</th>
                <th scope="col" className="px-2 py-2">Class</th>
                <th scope="col" className="hidden px-2 py-2 text-right sm:table-cell">SQ</th>
                <th scope="col" className="hidden px-2 py-2 text-right sm:table-cell">BP</th>
                <th scope="col" className="hidden px-2 py-2 text-right sm:table-cell">DL</th>
                <th scope="col" className="px-2 py-2 text-right">Total</th>
                <th scope="col" className="px-2 py-2 text-right">% WR</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={`${sex}-${row.rank}`}
                  className={`border-t border-white/5 ${index === 0 ? 'bg-red-500/10' : ''}`}
                >
                  <td className={`px-2 py-2 font-bold ${index === 0 ? 'text-amber-300' : 'text-slate-400'}`}>
                    {row.rank}
                  </td>
                  <td className="px-2 py-2 font-semibold text-slate-100">
                    <span className="flex items-center gap-2">
                      <FlagIcon code={row.nat} title={row.country} />
                      <span>
                        {row.name}
                        <span className="block text-[10px] font-normal text-slate-500 sm:hidden">
                          {row.country} · SQ {row.squat} · BP {row.bench} · DL {row.deadlift}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="px-2 py-2 font-mono text-slate-400">{row.className}</td>
                  <td className="hidden px-2 py-2 text-right text-slate-300 sm:table-cell">{row.squat}</td>
                  <td className="hidden px-2 py-2 text-right text-slate-300 sm:table-cell">{row.bench}</td>
                  <td className="hidden px-2 py-2 text-right text-slate-300 sm:table-cell">{row.deadlift}</td>
                  <td className="px-2 py-2 text-right font-bold text-white">{row.total}</td>
                  <td className="px-2 py-2 text-right text-amber-300/90">{row.wr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="border-t border-white/10 px-4 py-2 text-[10px] text-slate-500">
          Best attempts in kg · % WR = share of the world record · source: openipf.org/m/ipf/2608
        </footer>
      </section>
    </div>
  )
}
