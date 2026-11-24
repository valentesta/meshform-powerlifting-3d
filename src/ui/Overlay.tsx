import { useMemo, useState } from 'react'
import { useAudioFeedback } from '../audio/useAudioFeedback'
import { MEN_RESULTS, WOMEN_RESULTS } from '../data/results'
import { BAR } from '../objects/barbellSpecs'
import { STATION_LIST } from '../scene/stations'
import { useLoadingStore } from '../state/useLoadingStore'
import { useSceneStore } from '../state/useSceneStore'
import type { Side } from '../physics/types'
import FlagIcon from './FlagIcon'
import ResultsPanel from './ResultsPanel'

const PRESETS = [100, 140, 200, 250]
const MAX_SIDE = 227.5

const buttonClass =
  'min-h-11 rounded-lg border px-2.5 text-[10px] font-bold uppercase tracking-wider transition sm:px-3 sm:text-xs'

const neutralButtonClass = `${buttonClass} border-white/15 bg-white/5 text-slate-300 hover:border-white/30 hover:bg-white/15 hover:text-white`

export default function Overlay() {
  const [resultsOpen, setResultsOpen] = useState(false)
  const countries = useMemo(() => {
    const seen = new Map<string, string>()

    for (const row of [...WOMEN_RESULTS, ...MEN_RESULTS]) {
      if (!seen.has(row.nat)) seen.set(row.nat, row.country)
    }

    return [...seen.entries()]
  }, [])
  const activeStation = useSceneStore((state) => state.activeStation)
  const setStation = useSceneStore((state) => state.setStation)
  const resetCamera = useSceneStore((state) => state.resetCamera)
  const resetPhysics = useSceneStore((state) => state.resetPhysics)
  const plates = useLoadingStore((state) => state.loadedPlates)
  const collars = useLoadingStore((state) => state.loadedCollars)
  const autoLoad = useLoadingStore((state) => state.autoLoad)
  const unloadAll = useLoadingStore((state) => state.unloadAll)
  const { muted, toggleMuted } = useAudioFeedback()

  const sideWeight = (side: Side) =>
    plates.filter((plate) => plate.side === side).reduce((sum, plate) => sum + plate.kg, 0) +
    (collars.some((collar) => collar.side === side) ? BAR.collarMass : 0)

  const left = sideWeight('left')
  const right = sideWeight('right')
  const total = BAR.barMass + left + right
  const stationLabel = STATION_LIST.find((station) => station.id === activeStation)?.label ?? activeStation

  return (
    <section className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <header className="pointer-events-auto max-w-md rounded-2xl border border-white/10 bg-black/55 px-4 py-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-8 w-8 shrink-0"
              fill="none"
            >
              <path
                d="M12 2.5 21.5 19.5H2.5Z"
                stroke="#5cffb0"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path
                d="M12 2.5V19.5M7.25 11h9.5M12 19.5 7.25 11M12 19.5l4.75-8.5"
                stroke="#5cffb0"
                strokeWidth="0.8"
              />
            </svg>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
                Sheffield V 2026
              </p>
              <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                meshform <span className="text-slate-400">3D</span>
              </h1>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1" aria-label="Competitor nations">
            {countries.map(([code, country]) => (
              <FlagIcon key={code} code={code} title={country} />
            ))}
          </div>
          <p className="mt-2 hidden text-xs leading-relaxed text-slate-300 sm:block">
            Drag a plate from either rack to the bar, or tap it to load. Tap a loaded plate to unload it.
          </p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 sm:mt-1">
            {stationLabel} · {plates.length} plates · {collars.length} collars
          </p>
        </header>

        <div
          aria-live="polite"
          className="pointer-events-auto min-w-36 rounded-2xl border border-white/10 bg-black/55 px-4 py-3 text-right shadow-xl backdrop-blur-md sm:min-w-52"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
            Bar total
          </p>
          <p className="text-2xl font-black tabular-nums text-white sm:text-3xl">
            {total.toFixed(1)} <span className="text-sm font-semibold text-slate-400">kg</span>
          </p>
          <div className="mt-1 flex items-center justify-end gap-3 text-[11px] tabular-nums text-slate-300">
            <span>L {left.toFixed(1)}</span>
            <span className="text-slate-600">/</span>
            <span>R {right.toFixed(1)}</span>
          </div>
          <div className="mt-2 flex justify-end gap-1.5">
            {(['left', 'right'] as const).map((side) => (
              <div
                key={side}
                className="h-1 w-14 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-label={`${side} sleeve load`}
                aria-valuenow={Math.round(sideWeight(side))}
                aria-valuemin={0}
                aria-valuemax={MAX_SIDE}
              >
                <div
                  className="h-full rounded-full bg-sky-400"
                  style={{ width: `${Math.min(100, (sideWeight(side) / MAX_SIDE) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <p className="mt-2 hidden text-[10px] text-slate-500 sm:block">
            bar 20 kg · collars 2.5 kg each
          </p>
        </div>
      </div>

      <div className="pointer-events-auto mx-auto w-full max-w-5xl rounded-2xl border border-white/10 bg-black/60 p-2 shadow-2xl backdrop-blur-md sm:p-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1.1fr_0.9fr_1.4fr]">
          <section aria-label="Lifting stations" className="sm:col-span-1">
            <p className="mb-1.5 px-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Station
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STATION_LIST.map((station) => {
                const active = activeStation === station.id

                return (
                  <button
                    key={station.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setStation(station.id)}
                    style={{
                      borderColor: active ? station.accent : undefined,
                      color: active ? station.accent : undefined,
                      backgroundColor: active ? `${station.accent}22` : undefined,
                    }}
                    className={`${buttonClass} ${
                      active ? '' : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/15'
                    }`}
                  >
                    {station.label}
                  </button>
                )
              })}
            </div>
          </section>

          <section aria-label="Auto load presets" className="sm:col-span-1">
            <p className="mb-1.5 px-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Quick load
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((preset) => {
                const active = Math.abs(total - preset) < 0.05

                return (
                  <button
                    key={preset}
                    type="button"
                    aria-pressed={active}
                    onClick={() => autoLoad(preset)}
                    className={`${buttonClass} tabular-nums ${
                      active
                        ? 'border-sky-300/70 bg-sky-400/25 text-white'
                        : 'border-sky-400/40 bg-sky-500/15 text-sky-200 hover:bg-sky-500/30'
                    }`}
                  >
                    {preset} kg
                  </button>
                )
              })}
            </div>
          </section>

          <section aria-label="Scene controls" className="col-span-2 sm:col-span-1">
            <p className="mb-1.5 px-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Controls
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={unloadAll} className={neutralButtonClass}>
                Unload all
              </button>
              <button type="button" onClick={resetPhysics} className={neutralButtonClass}>
                Reset
              </button>
              <button type="button" onClick={resetCamera} className={neutralButtonClass}>
                Camera
              </button>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={resultsOpen}
                onClick={() => setResultsOpen(true)}
                className={neutralButtonClass}
              >
                Results
              </button>
              <button
                type="button"
                aria-pressed={!muted}
                onClick={toggleMuted}
                className={`${buttonClass} ${
                  muted
                    ? 'border-white/15 bg-white/5 text-slate-400 hover:bg-white/15'
                    : 'border-emerald-400/50 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25'
                }`}
              >
                Sound {muted ? 'off' : 'on'}
              </button>
            </div>
          </section>
        </div>
      </div>

      <ResultsPanel open={resultsOpen} onClose={() => setResultsOpen(false)} />
    </section>
  )
}
