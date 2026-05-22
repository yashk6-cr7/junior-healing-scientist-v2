/**
 * Day5_Dosage.jsx — Dosage Puzzle (Slider mechanic)
 * Inspired by Cooking Mama / chemistry titration simulations
 * Each correct ingredient has a "sweet spot" dosage range (40–70%).
 * Player drags sliders. Arjun reacts in real-time:
 *   Too little → "Not enough…" | Just right → "Perfect!" | Too much → "Overdose!"
 * All 3 sliders in green zone → Complete!
 */
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArjunCharacter } from '../components/ArjunCharacter'

// Each ingredient for Day 5 gets a random sweet-spot range
function makeSliders(remedy) {
  return remedy.ingredients.slice(0, 3).map(ing => ({
    ...ing,
    min: 35 + Math.floor(Math.random() * 20), // 35–55
    max: 60 + Math.floor(Math.random() * 20), // 60–80
    value: 0,
  }))
}

function getZone(value, min, max) {
  if (value < min - 5) return 'low'
  if (value > max + 5) return 'high'
  if (value >= min && value <= max) return 'perfect'
  return 'close'
}

const ZONE_COLOR  = { low: '#82B1FF', close: '#FFD54F', perfect: '#69F0AE', high: '#FF8A65' }
const ZONE_LABEL  = { low: 'Too little…', close: 'Almost there!', perfect: '✅ Perfect!', high: 'Too much!' }
const ZONE_MOOD   = { low: 'neutral', close: 'thinking', perfect: 'happy', high: 'wrong' }

export function Day5_Dosage({ remedy, onComplete }) {
  const [sliders, setSliders] = useState(() => makeSliders(remedy))
  const [arjunMood, setMood]  = useState('thinking')
  const [arjunSpeech, setSpeech] = useState('Adjust each dosage to find the perfect amount! ⚗️')
  const [done, setDone] = useState(false)

  const zones = sliders.map(s => getZone(s.value, s.min, s.max))
  const allPerfect = zones.every(z => z === 'perfect')
  const perfectCount = zones.filter(z => z === 'perfect').length

  const updateSlider = useCallback((idx, val) => {
    const newSliders = sliders.map((s, i) => i === idx ? { ...s, value: Number(val) } : s)
    setSliders(newSliders)
    // Determine overall Arjun mood from worst zone
    const zonesArr = newSliders.map(s => getZone(s.value, s.min, s.max))
    const all = zonesArr.every(z => z === 'perfect')
    if (all && !done) {
      setDone(true)
      setMood('excited')
      setSpeech('🎉 Perfect dosage! The remedy is balanced!')
      setTimeout(() => onComplete(remedy.correctSet.slice(0, 3)), 2000)
    } else if (zonesArr.some(z => z === 'high')) {
      setMood('wrong'); setSpeech('Careful! One dose is too high! ⬇️')
    } else if (zonesArr.some(z => z === 'perfect')) {
      setMood('happy'); setSpeech(`${zonesArr.filter(z => z === 'perfect').length} of 3 perfect! Keep adjusting! 👍`)
    } else if (zonesArr.some(z => z === 'close')) {
      setMood('thinking'); setSpeech('Getting warmer… adjust carefully! 🌡️')
    } else {
      setMood('neutral'); setSpeech('Slide up each ingredient to the right dose…')
    }
  }, [sliders, done, onComplete, remedy])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 420 }}>

      {/* Arjun */}
      <motion.div animate={{ background: arjunMood === 'wrong' ? 'rgba(255,80,80,0.1)' : allPerfect ? 'rgba(0,200,83,0.12)' : arjunMood === 'thinking' ? 'rgba(100,150,255,0.07)' : 'rgba(255,255,255,0.05)' }}
        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 22, border: '2px solid rgba(255,255,255,0.1)', width: '100%' }}>
        <ArjunCharacter mood={arjunMood} size={0.75} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Arjun says:</p>
          <AnimatePresence mode="wait">
            <motion.p key={arjunSpeech}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.4, color: arjunMood === 'wrong' ? '#FF8A65' : allPerfect ? '#69F0AE' : arjunMood === 'thinking' ? '#82B1FF' : 'rgba(255,255,255,0.8)' }}>
              {arjunSpeech}
            </motion.p>
          </AnimatePresence>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
            {perfectCount}/3 at perfect dosage
          </p>
        </div>
      </motion.div>

      {/* Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
        {sliders.map((s, i) => {
          const zone = zones[i]
          const col  = ZONE_COLOR[zone]
          const pct  = s.value  // 0–100
          // Green zone marker positions
          const minPct = s.min
          const maxPct = s.max
          return (
            <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Label row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '1.2rem' }}>{s.emoji}</span> {s.name}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: col }}>
                  {ZONE_LABEL[zone]}
                </span>
              </div>

              {/* Slider track */}
              <div style={{ position: 'relative', width: '100%', height: 36 }}>
                {/* Track background */}
                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 0, right: 0, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)' }} />
                {/* Sweet-spot green zone */}
                <div style={{
                  position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                  left: `${minPct}%`, width: `${maxPct - minPct}%`,
                  height: 8, borderRadius: 4, background: 'rgba(105,240,174,0.25)',
                  border: '1px solid rgba(105,240,174,0.4)',
                }} />
                {/* Fill */}
                <div style={{
                  position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                  left: 0, width: `${pct}%`, height: 8, borderRadius: 4,
                  background: `linear-gradient(90deg, ${col}88, ${col})`,
                  transition: 'width 0.05s, background 0.3s',
                }} />
                {/* HTML range input (transparent, on top) */}
                <input type="range" min={0} max={100} value={s.value}
                  onChange={e => updateSlider(i, e.target.value)}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', margin: 0 }}
                />
                {/* Custom thumb */}
                <div style={{
                  position: 'absolute', top: '50%', transform: `translate(-50%, -50%)`,
                  left: `${pct}%`,
                  width: 22, height: 22, borderRadius: '50%',
                  background: col,
                  border: '3px solid white',
                  boxShadow: `0 0 10px ${col}88`,
                  transition: 'background 0.3s, box-shadow 0.3s',
                  pointerEvents: 'none',
                }} />
              </div>

              {/* Value labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>
                <span>0ml</span>
                <span style={{ color: 'rgba(105,240,174,0.6)' }}>Sweet spot: {s.min}–{s.max}ml</span>
                <span>100ml</span>
              </div>
            </div>
          )
        })}
      </div>

      <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
        🟢 Green zone = perfect dosage. Adjust until all 3 sliders are in the sweet spot!
      </p>
    </div>
  )
}
