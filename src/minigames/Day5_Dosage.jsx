/**
 * Day5_Dosage.jsx — Dosage Puzzle (Bowl & Pour mechanic)
 * Player holds 'Pour' buttons to fill a central bowl.
 * Visual feedback in the bowl + clinical feedback from Arjun.
 */
import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArjunCharacter } from '../components/ArjunCharacter'

// Realistic Ayurvedic dosage targets
const ING_CONFIG = {
  vegetable_broth: {
    min: 55, max: 75,
    feedback: {
      low: "It's just a paste... I need warm liquid to sip.",
      perfect: "A perfect, soothing bowl of warm soup! 🍲",
      high: "It's so watered down the medicine won't work."
    }
  },
  garlic: {
    min: 30, max: 50,
    feedback: {
      low: "It tastes weak, I don't feel the warming effect.",
      perfect: "Nice and spicy! It's clearing my congestion. 🧄",
      high: "Ah! Too much garlic! My stomach is burning!"
    }
  },
  turmeric: {
    min: 15, max: 35,
    feedback: {
      low: "It's barely yellow... the inflammation isn't going down.",
      perfect: "Perfect golden color. The swelling is easing up! 🟡",
      high: "Yuck! It's way too bitter and powdery!"
    }
  },
  default: {
    min: 40, max: 60,
    feedback: { low: "Needs a bit more...", perfect: "Just the right amount! ✅", high: "Whoa, that's way too much!" }
  }
}

function getZone(val, min, max) {
  if (val === 0) return 'empty'
  if (val < min) return 'low'
  if (val > max) return 'high'
  return 'perfect'
}

export function Day5_Dosage({ remedy, onComplete }) {
  const ingredients = useMemo(() => remedy.ingredients.slice(0, 3), [remedy.ingredients])
  const [levels, setLevels] = useState([0, 0, 0])
  const [arjunMood, setMood] = useState('neutral')
  const [arjunSpeech, setSpeech] = useState('Hold the buttons to pour the exact right amount! ⚗️')
  const [done, setDone] = useState(false)
  const [activePour, setActivePour] = useState(null)

  const intervalRef = useRef(null)

  const evaluateFeedback = useCallback((currentLevels, focusIdx = -1) => {
    let allPerfect = true
    let worstZone = 'perfect'
    let specificMsg = null

    ingredients.forEach((ing, i) => {
      const conf = ING_CONFIG[ing.id] || ING_CONFIG.default
      const zone = getZone(currentLevels[i], conf.min, conf.max)
      if (zone !== 'perfect') allPerfect = false
      if (zone === 'high') worstZone = 'high'
      if (zone === 'low' && worstZone === 'perfect') worstZone = 'low'
      
      // If we are focusing on a recently poured ingredient, grab its specific message
      if (i === focusIdx && zone !== 'empty') {
        specificMsg = conf.feedback[zone]
      }
    })

    if (allPerfect && !done) {
      setDone(true)
      setMood('excited')
      setSpeech('🎉 Perfect dosage! The remedy is completely balanced!')
      setTimeout(() => onComplete(remedy.correctSet.slice(0, 3)), 2000)
    } else if (specificMsg) {
      // Prioritize the specific feedback of what they just touched
      const focusZone = getZone(currentLevels[focusIdx], (ING_CONFIG[ingredients[focusIdx].id] || ING_CONFIG.default).min, (ING_CONFIG[ingredients[focusIdx].id] || ING_CONFIG.default).max)
      setMood(focusZone === 'high' ? 'wrong' : focusZone === 'perfect' ? 'happy' : 'thinking')
      setSpeech(specificMsg)
    } else if (worstZone === 'high') {
      setMood('wrong'); setSpeech('Careful! Something is too high! ⬇️')
    } else {
      setMood('neutral'); setSpeech('Keep adjusting the amounts...')
    }
  }, [done, ingredients, onComplete, remedy.correctSet])

  const startPouring = (idx) => {
    if (done) return
    setActivePour(idx)
    if (intervalRef.current) clearInterval(intervalRef.current)
    
    intervalRef.current = setInterval(() => {
      setLevels(prev => {
        const next = [...prev]
        if (next[idx] < 100) next[idx] += 1
        return next
      })
    }, 40)
  }

  const stopPouring = (idx) => {
    setActivePour(null)
    if (intervalRef.current) clearInterval(intervalRef.current)
    evaluateFeedback(levels, idx)
  }

  // Cleanup
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 420, userSelect: 'none' }}>
      
      {/* Arjun Clinical Feedback */}
      <motion.div animate={{ background: arjunMood === 'wrong' ? 'rgba(255,80,80,0.1)' : done ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.05)' }}
        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 22, border: '2px solid rgba(255,255,255,0.1)', width: '100%' }}>
        <ArjunCharacter mood={arjunMood} size={0.75} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Arjun says:</p>
          <AnimatePresence mode="wait">
            <motion.p key={arjunSpeech}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.4, color: arjunMood === 'wrong' ? '#FF8A65' : done ? '#69F0AE' : 'rgba(255,255,255,0.8)' }}>
              {arjunSpeech}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Visual Bowl */}
      <div style={{ position: 'relative', width: 260, height: 160, marginTop: 10 }}>
        <svg width="260" height="160" viewBox="0 0 260 160" style={{ overflow: 'visible', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))' }}>
          
          <defs>
            <clipPath id="bowl-clip">
              <path d="M 30 30 C 30 150, 230 150, 230 30 Z" />
            </clipPath>
          </defs>

          {/* Back of bowl */}
          <path d="M 30 30 C 30 150, 230 150, 230 30 Z" fill="#263238" stroke="#37474F" strokeWidth="4" />
          
          {/* Liquid Base (Broth) */}
          <rect x="0" y={150 - (levels[0] / 100) * 120} width="260" height="130" fill="rgba(255, 152, 0, 0.85)" clipPath="url(#bowl-clip)" style={{ transition: 'y 0.1s linear' }} />
          
          {/* Turmeric Powder Tint */}
          <rect x="0" y={150 - (levels[0] / 100) * 120} width="260" height="130" fill={`rgba(255, 235, 59, ${levels[2] / 60})`} clipPath="url(#bowl-clip)" style={{ transition: 'y 0.1s linear, fill 0.2s' }} />

          {/* Garlic Cloves Floating */}
          <g clipPath="url(#bowl-clip)">
            {[...Array(10)].map((_, i) => (
              <circle key={i} cx={50 + (i * 18)} cy={140 - (levels[0] / 100) * 110 + (i%2*10)} r={6} fill="#FFF9C4" 
                style={{ opacity: (levels[1] > i * 10) ? 1 : 0, transition: 'opacity 0.2s, cy 0.1s linear' }} />
            ))}
          </g>

          {/* Front rim */}
          <ellipse cx="130" cy="30" rx="100" ry="12" fill="none" stroke="#546E7A" strokeWidth="6" />
          <ellipse cx="130" cy="30" rx="97" ry="9" fill="none" stroke="#78909C" strokeWidth="2" />
        </svg>

        {/* Floating Labels / Margins */}
        <div style={{ position: 'absolute', top: 0, right: -40, bottom: 0, width: 40, pointerEvents: 'none' }}>
          {ingredients.map((ing, i) => {
            const conf = ING_CONFIG[ing.id] || ING_CONFIG.default
            // We map 0-100 to bottom-to-top visually. Top of bowl is y=30, bottom is y=150. (Range 120)
            const bottomPx = (conf.min / 100) * 120
            const topPx = (conf.max / 100) * 120
            
            // To make margins clear, we show them as small brackets next to the bowl
            return (
              <div key={ing.id} style={{
                position: 'absolute', bottom: 10 + bottomPx, right: 10,
                height: topPx - bottomPx, width: 6,
                borderTop: `2px solid ${ing.color}`, borderBottom: `2px solid ${ing.color}`, borderRight: `2px solid ${ing.color}`,
                opacity: 0.8
              }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.55rem', color: ing.color, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {ing.name.split(' ')[0]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pour Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', marginTop: 20 }}>
        {ingredients.map((ing, i) => {
          const conf = ING_CONFIG[ing.id] || ING_CONFIG.default
          const pct = levels[i]
          const isTarget = pct >= conf.min && pct <= conf.max
          
          return (
            <motion.button 
              key={ing.id}
              onPointerDown={() => startPouring(i)}
              onPointerUp={() => stopPouring(i)}
              onPointerLeave={() => { if (activePour === i) stopPouring(i) }}
              whileTap={{ scale: 0.96 }}
              style={{
                position: 'relative', overflow: 'hidden',
                background: 'rgba(255,255,255,0.05)', border: `2px solid ${isTarget ? '#69F0AE' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 16, padding: '16px', cursor: 'pointer', touchAction: 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
              {/* Fill background inside button to show exactly how much they poured */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: ing.color, opacity: 0.2, transition: 'width 0.1s linear' }} />
              
              <span style={{ position: 'relative', zIndex: 2, fontSize: '0.95rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.4rem' }}>{ing.emoji}</span> {ing.name}
              </span>
              <span style={{ position: 'relative', zIndex: 2, fontSize: '0.75rem', fontWeight: 800, color: isTarget ? '#69F0AE' : 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: 12 }}>
                Hold to Pour
              </span>
            </motion.button>
          )
        })}
      </div>
      
    </div>
  )
}
