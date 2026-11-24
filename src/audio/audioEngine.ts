type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext }

type NoiseColor = 'white' | 'pink' | 'brown'

const MASTER_GAIN = 0.48

let context: AudioContext | null = null
let master: GainNode | null = null
let reverb: ConvolverNode | null = null
let ambienceStarted = false
let muted = false
let crowdTimer: number | null = null

function getContext(): AudioContext | null {
  if (context) return context

  const AudioContextClass = window.AudioContext ?? (window as AudioWindow).webkitAudioContext

  if (!AudioContextClass) return null

  context = new AudioContextClass()

  master = context.createGain()
  master.gain.value = muted ? 0 : MASTER_GAIN

  const compressor = context.createDynamicsCompressor()
  compressor.threshold.value = -18
  compressor.knee.value = 20
  compressor.ratio.value = 3.5
  compressor.attack.value = 0.004
  compressor.release.value = 0.24

  master.connect(compressor)
  compressor.connect(context.destination)

  reverb = context.createConvolver()
  reverb.buffer = makeImpulse(context, 1.4, 2.8)

  const reverbGain = context.createGain()
  reverbGain.gain.value = 0.34

  reverb.connect(reverbGain)
  reverbGain.connect(master)

  return context
}

function makeNoise(ctx: AudioContext, seconds: number, color: NoiseColor): AudioBuffer {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds))
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let b0 = 0
  let b1 = 0
  let b2 = 0
  let b3 = 0
  let b4 = 0
  let b5 = 0
  let b6 = 0
  let brown = 0

  for (let index = 0; index < length; index += 1) {
    const white = Math.random() * 2 - 1

    if (color === 'brown') {
      brown = (brown + 0.02 * white) / 1.02
      data[index] = brown * 3.2
      continue
    }

    if (color === 'pink') {
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.969 * b2 + white * 0.153852
      b3 = 0.8665 * b3 + white * 0.3104856
      b4 = 0.55 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.016898
      data[index] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
      continue
    }

    data[index] = white * 0.7
  }

  return buffer
}

function makeImpulse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate)

  for (let channel = 0; channel < 2; channel += 1) {
    const data = buffer.getChannelData(channel)

    for (let index = 0; index < length; index += 1) {
      const fade = (1 - index / length) ** decay
      data[index] = (Math.random() * 2 - 1) * fade * 0.6
    }
  }

  return buffer
}

type BurstOptions = {
  at: number
  duration: number
  frequency: number
  gain: number
  q?: number
  filter?: BiquadFilterType
  noise?: NoiseColor
  send?: number
}

function burst(ctx: AudioContext, output: GainNode, options: BurstOptions): void {
  const source = ctx.createBufferSource()
  source.buffer = makeNoise(ctx, Math.max(0.03, options.duration), options.noise ?? 'white')

  const filter = ctx.createBiquadFilter()
  filter.type = options.filter ?? 'bandpass'
  filter.frequency.value = options.frequency
  filter.Q.value = options.q ?? 1

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, options.at)
  gain.gain.exponentialRampToValueAtTime(options.gain, options.at + 0.003)
  gain.gain.exponentialRampToValueAtTime(0.0001, options.at + options.duration)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(output)

  if (reverb && options.send) {
    const send = ctx.createGain()
    send.gain.value = options.send
    gain.connect(send)
    send.connect(reverb)
  }

  source.start(options.at)
  source.stop(options.at + options.duration + 0.02)
}

type RingOptions = {
  at: number
  frequency: number
  endFrequency: number
  duration: number
  gain: number
  type?: OscillatorType
  send?: number
}

function ring(ctx: AudioContext, output: GainNode, options: RingOptions): void {
  const oscillator = ctx.createOscillator()
  oscillator.type = options.type ?? 'sine'
  oscillator.frequency.setValueAtTime(options.frequency, options.at)
  oscillator.frequency.exponentialRampToValueAtTime(options.endFrequency, options.at + options.duration)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, options.at)
  gain.gain.exponentialRampToValueAtTime(options.gain, options.at + 0.004)
  gain.gain.exponentialRampToValueAtTime(0.0001, options.at + options.duration)

  oscillator.connect(gain)
  gain.connect(output)

  if (reverb && options.send) {
    const send = ctx.createGain()
    send.gain.value = options.send
    gain.connect(send)
    send.connect(reverb)
  }

  oscillator.start(options.at)
  oscillator.stop(options.at + options.duration + 0.02)
}

export function unlockAudio(): void {
  const ctx = getContext()

  if (ctx && ctx.state === 'suspended') void ctx.resume()
}

export function startAmbience(): void {
  const ctx = getContext()

  if (!ctx || !master || ambienceStarted) return

  ambienceStarted = true

  // Layer 1: low arena murmur with a slow swell, like a room full of people.
  const crowd = ctx.createBufferSource()
  crowd.buffer = makeNoise(ctx, 4, 'pink')
  crowd.loop = true

  const crowdFilter = ctx.createBiquadFilter()
  crowdFilter.type = 'lowpass'
  crowdFilter.frequency.value = 620
  crowdFilter.Q.value = 0.6

  const crowdGain = ctx.createGain()
  crowdGain.gain.value = 0.14

  const crowdLfo = ctx.createOscillator()
  crowdLfo.frequency.value = 0.08

  const crowdLfoGain = ctx.createGain()
  crowdLfoGain.gain.value = 0.045

  crowdLfo.connect(crowdLfoGain)
  crowdLfoGain.connect(crowdGain.gain)
  crowd.connect(crowdFilter)
  crowdFilter.connect(crowdGain)
  crowdGain.connect(master)

  // Layer 1b: a mid-band babble that sits where spoken vowels live. Slow,
  // independent LFOs make it rise and fall like many people talking at once.
  const chatter = ctx.createBufferSource()
  chatter.buffer = makeNoise(ctx, 5, 'pink')
  chatter.loop = true

  const chatterFilter = ctx.createBiquadFilter()
  chatterFilter.type = 'bandpass'
  chatterFilter.frequency.value = 780
  chatterFilter.Q.value = 0.8

  const chatterGain = ctx.createGain()
  chatterGain.gain.value = 0.055

  const chatterLfo = ctx.createOscillator()
  chatterLfo.frequency.value = 0.31

  const chatterLfoGain = ctx.createGain()
  chatterLfoGain.gain.value = 0.03

  chatterLfo.connect(chatterLfoGain)
  chatterLfoGain.connect(chatterGain.gain)
  chatter.connect(chatterFilter)
  chatterFilter.connect(chatterGain)
  chatterGain.connect(master)

  // Layer 2: distant room tone, barely there but it removes the silence.
  const air = ctx.createBufferSource()
  air.buffer = makeNoise(ctx, 3, 'white')
  air.loop = true

  const airFilter = ctx.createBiquadFilter()
  airFilter.type = 'highpass'
  airFilter.frequency.value = 1800

  const airGain = ctx.createGain()
  airGain.gain.value = 0.008

  air.connect(airFilter)
  airFilter.connect(airGain)
  airGain.connect(master)

  // Layer 3: a quiet warm pad, inspired by arena walk-up music without using a track.
  const padFilter = ctx.createBiquadFilter()
  padFilter.type = 'lowpass'
  padFilter.frequency.value = 620

  const padGain = ctx.createGain()
  padGain.gain.value = 0.005

  padFilter.connect(padGain)
  padGain.connect(master)

  for (const frequency of [110, 164.81, 220.5]) {
    const tone = ctx.createOscillator()
    tone.type = 'sine'
    tone.frequency.value = frequency
    tone.connect(padFilter)
    tone.start()
  }

  // Layer 4: sub hum from lights and ventilation.
  const hum = ctx.createOscillator()
  hum.type = 'sine'
  hum.frequency.value = 52

  const humGain = ctx.createGain()
  humGain.gain.value = 0.012

  hum.connect(humGain)
  humGain.connect(master)

  crowd.start()
  crowdLfo.start()
  chatter.start()
  chatterLfo.start()
  air.start()
  hum.start()

  scheduleCrowdLife()
}

// Muffled, formant-like syllables. No voices or audio files: short bursts of
// filtered noise at speech-range frequencies read as a room full of people
// talking when they are scattered in time.
export function playCrowdTalk(): void {
  const ctx = getContext()

  if (!ctx || !master || muted) return

  const now = ctx.currentTime
  const syllables = 3 + Math.floor(Math.random() * 3)

  for (let index = 0; index < syllables; index += 1) {
    burst(ctx, master, {
      at: now + index * (0.08 + Math.random() * 0.1),
      duration: 0.08 + Math.random() * 0.11,
      frequency: 280 + Math.random() * 720,
      q: 2 + Math.random() * 3,
      gain: 0.035 + Math.random() * 0.03,
      send: 0.32,
    })
  }
}

function scheduleCrowdLife(): void {
  if (crowdTimer !== null || muted) return

  const tick = () => {
    if (!muted && context?.state === 'running') {
      if (Math.random() < 0.75) playCrowdTalk()
      if (Math.random() < 0.12) playCrowd(0.28)
    }

    crowdTimer = window.setTimeout(tick, 1200 + Math.random() * 2200)
  }

  crowdTimer = window.setTimeout(tick, 700 + Math.random() * 900)
}

function stopCrowdLife(): void {
  if (crowdTimer === null) return

  window.clearTimeout(crowdTimer)
  crowdTimer = null
}

export function playCheer(intensity = 1): void {
  const ctx = getContext()

  if (!ctx || !master || muted) return

  playCrowd(intensity)

  // A short rising whistle over the applause makes it feel like a big lift.
  ring(ctx, master, {
    at: ctx.currentTime + 0.18,
    frequency: 850,
    endFrequency: 1550,
    duration: 0.32,
    gain: 0.016 * intensity,
    type: 'sine',
    send: 0.3,
  })
}

export function setMuted(value: boolean): void {
  muted = value

  if (value) {
    stopCrowdLife()
  } else {
    startAmbience()
    scheduleCrowdLife()
  }

  if (context && master) {
    master.gain.setTargetAtTime(muted ? 0 : MASTER_GAIN, context.currentTime, 0.03)
  }
}

export function isMuted(): boolean {
  return muted
}

export function playPlateLoad(kg = 25, delay = 0): void {
  const ctx = getContext()

  if (!ctx || !master || muted) return

  const at = ctx.currentTime + delay
  const output = master
  const heaviness = Math.min(1, kg / 25)
  const low = 88 - heaviness * 18
  const level = 0.7 + heaviness * 0.5

  // The body of the disc: a short low thud that drops in pitch on contact.
  ring(ctx, output, {
    at,
    frequency: low,
    endFrequency: low * 0.55,
    duration: 0.24,
    gain: 0.11 * level,
    type: 'sine',
    send: 0.12,
  })

  // Inharmonic metal partials are what make it read as iron, not a drum.
  const partials = [196, 311, 523, 837, 1181, 1690]
  partials.forEach((frequency, index) => {
    ring(ctx, output, {
      at: at + index * 0.001,
      frequency: frequency * (0.99 + Math.random() * 0.02),
      endFrequency: frequency * 0.965,
      duration: 0.42 + heaviness * 0.28 - index * 0.035,
      gain: (0.05 / (1 + index * 0.55)) * level,
      type: index % 2 === 0 ? 'sine' : 'triangle',
      send: 0.2,
    })
  })

  // Sharp first contact, floor slap, then a small bounce rattle.
  burst(ctx, output, {
    at,
    duration: 0.075,
    frequency: 1700 + heaviness * 600,
    q: 0.8,
    gain: 0.12 + heaviness * 0.06,
    filter: 'highpass',
    send: 0.14,
  })
  burst(ctx, output, {
    at: at + 0.055,
    duration: 0.16,
    frequency: 230,
    q: 0.7,
    gain: 0.08 + heaviness * 0.05,
    filter: 'lowpass',
    noise: 'brown',
    send: 0.1,
  })
  burst(ctx, output, {
    at: at + 0.13,
    duration: 0.05,
    frequency: 2600,
    q: 1.3,
    gain: 0.022 * level,
    send: 0.22,
  })
}

export function playCollar(delay = 0): void {
  const ctx = getContext()

  if (!ctx || !master || muted) return

  const at = ctx.currentTime + delay

  ring(ctx, master, {
    at,
    frequency: 820,
    endFrequency: 430,
    duration: 0.075,
    gain: 0.05,
    type: 'square',
    send: 0.1,
  })
  burst(ctx, master, {
    at,
    duration: 0.035,
    frequency: 2400,
    q: 1.1,
    gain: 0.075,
    filter: 'highpass',
    send: 0.12,
  })
  burst(ctx, master, {
    at: at + 0.05,
    duration: 0.05,
    frequency: 1500,
    q: 1.4,
    gain: 0.035,
    send: 0.16,
  })
}

export function playCrowd(intensity = 1): void {
  const ctx = getContext()

  if (!ctx || !master || muted) return

  const at = ctx.currentTime
  const source = ctx.createBufferSource()
  source.buffer = makeNoise(ctx, 2.6, 'pink')

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 720
  filter.Q.value = 0.5

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.linearRampToValueAtTime(0.13 * intensity, at + 0.42)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 2.4)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(master)

  if (reverb) {
    const send = ctx.createGain()
    send.gain.value = 0.5
    gain.connect(send)
    send.connect(reverb)
  }

  source.start(at)
  source.stop(at + 2.6)

  // Individual claps scattered through the swell sell it as a crowd.
  for (let index = 0; index < 22; index += 1) {
    burst(ctx, master, {
      at: at + 0.1 + Math.random() * 1.5,
      duration: 0.02 + Math.random() * 0.03,
      frequency: 1200 + Math.random() * 1700,
      q: 1.5,
      gain: (0.014 + Math.random() * 0.022) * intensity,
      send: 0.25,
    })
  }
}

export function playUnload(): void {
  const ctx = getContext()

  if (!ctx || !master || muted) return

  const at = ctx.currentTime

  burst(ctx, master, {
    at,
    duration: 0.07,
    frequency: 1100,
    q: 0.8,
    gain: 0.035,
    filter: 'highpass',
    send: 0.12,
  })
  ring(ctx, master, {
    at,
    frequency: 190,
    endFrequency: 110,
    duration: 0.13,
    gain: 0.025,
    type: 'sine',
  })
}
