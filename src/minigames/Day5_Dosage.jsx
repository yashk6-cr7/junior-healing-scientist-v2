/**
 * Day5_Dosage.jsx — Bowl & Pour mechanic (v2)
 * Each ingredient has its own fill-tube gauge with a clearly marked target zone.
 * The bowl is the visual result. Margins and fill level are always in sync.
 */
import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArjunCharacter } from '../components/ArjunCharacter'

const ING_CONFIG = {
  vegetable_broth: {
    min: 55, max: 75,
    unit: 'ml', maxVal: 300,
    feedback: {
      empty: 'Start by pouring the vegetable broth as the base!',
      low: "It's just a thick paste... I need warm liquid to sip.",
      perfect: "A perfect, soothing bowl of warm soup! 🍲",
      high: "It's so watered down the medicine won't work.",
    }
  },
  garlic: {
    min: 30, max: 50,
    unit: 'cloves', maxVal: 10,
    feedback: {
      empty: 'Now add garlic — it has powerful antibacterial properties!',
      low: "It tastes weak, I don't feel the warming effect.",
      perfect: "Nice and spicy! It's clearing my congestion. 🧄",
      high: "Ah! Too much garlic! My stomach is burning!",
    }
  },
  turmeric: {
    min: 15, max: 35,
    unit: 'pinches', maxVal: 5,
    feedback: {
      empty: 'Add a pinch of turmeric — the golden anti-inflammatory!',
      low: "It's barely yellow... the inflammation isn't going down.",
      perfect: "Perfect golden color. The swelling is easing up! 🟡",
      high: "Yuck! It's way too bitter and powdery!",
    }
  },
  default: {
    min: 40, max: 60,
    unit: 'units', maxVal: 100,
    feedback: { empty: 'Pour this ingredient!', low: "Needs a bit more...", perfect: "Just the right amount! ✅", high: "Whoa, that's too much!" }
  }
}

function getZone(val, min, max) {
  if (val === 0) return 'empty'
  if (val < min) return 'low'
  if (val > max) return 'high'
  return 'perfect'
}

const ZONE_COLOR = { empty: 'rgba(255,255,255,0.15)', low: '#82B1FF', perfect: '#69F0AE', high: '#FF8A65' }

export function Day5_Dosage({ remedy, onComplete }) {
  const ingredients = useMemo(() => remedy.ingredients.slice(0, 3), [remedy.ingredients])
  const [levels, setLevels] = useState([0, 0, 0])  // 0–100%
  const [arjunMood, setMood] = useState('neutral')
  const [arjunSpeech, setSpeech] = useState('Hold the buttons to pour each ingredient into the bowl! ⚗️')
  const [done, setDone] = useState(false)
  const [activePour, setActivePour] = useState(null)
  const intervalRef = useRef(null)
  const levelsRef = useRef(levels)
  useEffect(() => { levelsRef.current = levels }, [levels])

  const evaluateFeedback = useCallback((currentLevels, focusIdx = -1) => {
    let allPerfect = true
    let specificMsg = null
    let specificZone = 'empty'

    ingredients.forEach((ing, i) => {
      const conf = ING_CONFIG[ing.id] || ING_CONFIG.default
      const zone = getZone(currentLevels[i], conf.min, conf.max)
      if (zone !== 'perfect') allPerfect = false
      if (i === focusIdx) {
        specificMsg = conf.feedback[zone]
        specificZone = zone
      }
    })

    if (allPerfect && !done) {
      setDone(true)
      setMood('excited')
      setSpeech('🎉 Perfect dosage! The remedy is completely balanced!')
      setTimeout(() => onComplete(remedy.correctSet.slice(0, 3)), 2200)
    } else if (specificMsg) {
      setMood(specificZone === 'high' ? 'wrong' : specificZone === 'perfect' ? 'happy' : specificZone === 'empty' ? 'neutral' : 'thinking')
      setSpeech(specificMsg)
    }
  }, [done, ingredients, onComplete, remedy.correctSet])

  const startPouring = useCallback((idx) => {
    if (done) return
    setActivePour(idx)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setLevels(prev => {
        const next = [...prev]
        if (next[idx] < 100) next[idx] = Math.min(100, next[idx] + 1)
        return next
      })
    }, 35)
  }, [done])

  const stopPouring = useCallback((idx) => {
    setActivePour(null)
    if (intervalRef.current) clearInterval(intervalRef.current)
    evaluateFeedback(levelsRef.current, idx)
  }, [evaluateFeedback])

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  // Bowl liquid color blends broth orange + turmeric yellow tint
  const brothPct = levels[0] / 100
  const turmericTint = levels[2] / 100
  const liquidColor = `rgba(${Math.round(255)}, ${Math.round(140 + turmericTint * 95)}, ${Math.round(turmericTint * 20)}, 0.88)`
  // Garlic clove count to show (0–8 based on level)
  const garlicCount = Math.round((levels[1] / 100) * 8)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%', maxWidth: 440, userSelect: 'none' }}>

      {/* Arjun */}
      <motion.div
        animate={{ background: arjunMood === 'wrong' ? 'rgba(255,80,80,0.1)' : done ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.05)' }}
        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', borderRadius: 20, border: '2px solid rgba(255,255,255,0.1)', width: '100%' }}>
        <ArjunCharacter mood={arjunMood} size={0.7} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Arjun says:</p>
          <AnimatePresence mode="wait">
            <motion.p key={arjunSpeech}
              initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.35, color: arjunMood === 'wrong' ? '#FF8A65' : done ? '#69F0AE' : 'rgba(255,255,255,0.85)' }}>
              {arjunSpeech}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Bowl — purely visual result */}
      <div style={{ position: 'relative', width: 220, height: 130 }}>
        <svg width="220" height="130" viewBox="0 0 220 130" style={{ overflow: 'visible', filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.45))' }}>
          <defs>
            <clipPath id="dc-bowl-clip"><path d="M 25 24 C 25 125, 195 125, 195 24 Z" /></clipPath>
          </defs>
          {/* Bowl body */}
          <path d="M 25 24 C 25 125, 195 125, 195 24 Z" fill="#1C2B35" stroke="#37474F" strokeWidth="3" />
          {/* Liquid fill — level driven by broth (index 0) */}
          <rect x="0" y={124 - brothPct * 100} width="220" height="110"
            fill={liquidColor} clipPath="url(#dc-bowl-clip)"
            style={{ transition: 'y 0.08s linear, fill 0.3s' }} />
          {/* Garlic cloves */}
          <g clipPath="url(#dc-bowl-clip)">
            {[...Array(8)].map((_, gi) => {
              const cx = 38 + gi * 20
              const cy = 116 - brothPct * 92
              return (
                <motion.circle key={gi} cx={cx} cy={cy + (gi % 2) * 8} r={7}
                  fill="#FFFDE7" stroke="#F9A825" strokeWidth="1"
                  animate={{ opacity: gi < garlicCount ? 1 : 0 }}
                  transition={{ duration: 0.2 }} />
              )
            })}
          </g>
          {/* Rim */}
          <ellipse cx="110" cy="24" rx="85" ry="10" fill="none" stroke="#546E7A" strokeWidth="5" />
          <ellipse cx="110" cy="24" rx="83" ry="8" fill="none" stroke="#78909C" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Ingredient Gauges with pour buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {ingredients.map((ing, i) => {
          const conf = ING_CONFIG[ing.id] || ING_CONFIG.default
          const pct = levels[i]          // 0–100
          const zone = getZone(pct, conf.min, conf.max)
          const fillColor = ZONE_COLOR[zone]
          const isActive = activePour === i

          return (
            <motion.button
              key={ing.id}
              onPointerDown={() => startPouring(i)}
              onPointerUp={() => stopPouring(i)}
              onPointerLeave={() => { if (activePour === i) stopPouring(i) }}
              whileTap={{ scale: 0.975 }}
              style={{
                position: 'relative', width: '100%', padding: '0', margin: 0,
                background: 'rgba(255,255,255,0.04)',
                border: `2px solid ${zone === 'perfect' ? '#69F0AE' : zone === 'high' ? '#FF8A65' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 14, cursor: 'pointer', touchAction: 'none',
                overflow: 'hidden', display: 'block',
                boxShadow: isActive ? `0 0 14px ${ing.color}44` : 'none',
                transition: 'border-color 0.3s, box-shadow 0.3s',
              }}>

              {/* ── Top info row ── */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 6px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: '1.3rem' }}>{ing.emoji}</span>
                  {ing.name}
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: fillColor, background: 'rgba(0,0,0,0.35)', padding: '3px 9px', borderRadius: 10 }}>
                  {zone === 'perfect' ? '✅ Perfect!' : zone === 'high' ? '⬇️ Too much!' : zone === 'low' ? '⬆️ More...' : 'Hold to Pour'}
                </span>
              </div>

              {/* ── Gauge bar ── */}
              <div style={{ position: 'relative', height: 20, margin: '0 14px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>

                {/* Sweet-spot zone highlight — correctly positioned on the same bar */}
                <div style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: `${conf.min}%`,
                  width: `${conf.max - conf.min}%`,
                  background: 'rgba(105,240,174,0.22)',
                  borderLeft: '2px solid rgba(105,240,174,0.7)',
                  borderRight: '2px solid rgba(105,240,174,0.7)',
                }} />

                {/* Actual fill */}
                <motion.div
                  style={{
                    position: 'absolute', top: 0, bottom: 0, left: 0,
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${fillColor}88, ${fillColor})`,
                    borderRadius: 10,
                    transition: 'width 0.05s linear, background 0.3s',
                  }} />

                {/* Target zone labels */}
                <div style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: `${conf.min}%`,
                  display: 'flex', alignItems: 'center',
                  paddingLeft: 4,
                  fontSize: '0.5rem', fontWeight: 800, color: 'rgba(105,240,174,0.9)',
                  pointerEvents: 'none', whiteSpace: 'nowrap',
                }}>
                  ← sweet spot →
                </div>
              </div>

            </motion.button>
          )
        })}
      </div>

      <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.22)', textAlign: 'center', marginTop: 2 }}>
        🟢 Fill each ingredient into the green sweet-spot zone
      </p>
    </div>
  )
}
