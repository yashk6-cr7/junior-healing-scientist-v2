/**
 * Day2_Experiment.jsx — Two-Slot Combo Mixer
 * Inspired by Doodle God / Little Alchemy
 * Pick 2 ingredients, press MIX, observe the reaction.
 * Correct pair = Arjun celebrates. Wrong = Arjun reacts with property mismatch info.
 * Try all pairs until you find the right 2 core ingredients that unlock the remedy.
 * Note: For Day 2 we pick 2 "key" ingredients (first 2 of correctSet).
 */
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArjunCharacter } from '../components/ArjunCharacter'
import { getAllIngredients, getWrongPickFeedback } from '../data/remedies'

export function Day2_Experiment({ remedy, onComplete }) {
  const allItems = useMemo(() => getAllIngredients(remedy.day), [remedy.day])
  // Win condition: both slots must be from correctSet
  const [slotA, setSlotA] = useState(null)
  const [slotB, setSlotB] = useState(null)
  const [result, setResult] = useState(null) // null | 'success' | 'fail' | 'partial'
  const [arjunMood, setMood] = useState('neutral')
  const [arjunSpeech, setSpeech] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [mixAnim, setMixAnim] = useState(false)
  const [discoveredWrong, setDiscWrong] = useState([]) // ids that failed



  function selectItem(item) {
    if (!slotA) { setSlotA(item); return }
    if (!slotB && item.id !== slotA.id) { setSlotB(item); return }
    if (item.id === slotA?.id) { setSlotA(null); return }
    if (item.id === slotB?.id) { setSlotB(null); return }
  }

  function mix() {
    if (!slotA || !slotB) return
    setMixAnim(true)
    setAttempts(a => a + 1)
    setTimeout(() => {
      setMixAnim(false)
      const aOk = remedy.correctSet.includes(slotA.id)
      const bOk = remedy.correctSet.includes(slotB.id)
      if (aOk && bOk) {
        setResult('success')
        setMood('excited')
        setSpeech('🎉 That\'s the healing combo! My body feels it!')
        setTimeout(() => onComplete([slotA.id, slotB.id]), 2000)
      } else if (aOk || bOk) {
        setResult('partial')
        setMood('thinking')
        setSpeech('🤔 One of these is good… but which one? Try changing the other!')
        setDiscWrong(prev => [...new Set([...prev, aOk ? slotB.id : slotA.id])])
        setTimeout(() => { setResult(null); setMood('neutral'); setSpeech('') }, 2500)
      } else {
        setResult('fail')
        const fb = getWrongPickFeedback(slotA)
        setMood(fb.effect === 'worse' ? 'wrong' : 'yuck')
        setSpeech(fb.msg)
        setDiscWrong(prev => [...new Set([...prev, slotA.id, slotB.id])])
        setTimeout(() => { setResult(null); setMood('neutral'); setSpeech('') }, 2500)
      }
    }, 800)
  }

  function reset() {
    setSlotA(null); setSlotB(null); setResult(null)
    setMood('neutral'); setSpeech('')
  }

  const resultColor = result === 'success' ? '#69F0AE' : result === 'partial' ? '#FFD54F' : '#FF8A65'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 480 }}>

      {/* Arjun */}
      <motion.div animate={{ background: arjunMood === 'wrong' ? 'rgba(255,80,80,0.1)' : arjunMood === 'excited' ? 'rgba(0,200,83,0.1)' : arjunMood === 'thinking' ? 'rgba(100,150,255,0.08)' : 'rgba(255,255,255,0.05)' }}
        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 18px', borderRadius: 22, border: '2px solid rgba(255,255,255,0.1)', width: '100%' }}>
        <ArjunCharacter mood={arjunMood} size={0.8} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Arjun says:</p>
          <AnimatePresence mode="wait">
            <motion.p key={arjunSpeech || 'idle'}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.4, color: arjunMood === 'wrong' ? '#FF8A65' : arjunMood === 'excited' ? '#69F0AE' : arjunMood === 'thinking' ? '#82B1FF' : 'rgba(255,255,255,0.75)' }}>
              {arjunSpeech || (slotA && slotB ? 'Press MIX to combine them! ⚗️' : slotA ? 'Good! Now pick a second ingredient…' : 'Pick 2 ingredients to combine! 🧪')}
            </motion.p>
          </AnimatePresence>
          {attempts > 0 && <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>Attempts: {attempts}</p>}
        </div>
      </motion.div>

      {/* Mixing slots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', justifyContent: 'center' }}>
        {[slotA, slotB].map((slot, i) => (
          <motion.div key={i}
            animate={mixAnim ? { scale: [1, 1.15, 0.9, 1.1, 1], rotate: [0, 10, -10, 5, 0] } : {}}
            transition={{ duration: 0.7 }}
            onClick={() => { if (i === 0) setSlotA(null); else setSlotB(null) }}
            style={{
              width: 90, height: 90, borderRadius: 20,
              border: `3px dashed ${slot ? remedy.color + '88' : 'rgba(255,255,255,0.2)'}`,
              background: slot ? `${slot.color}15` : 'rgba(255,255,255,0.03)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
              cursor: slot ? 'pointer' : 'default',
              boxShadow: result === 'success' ? `0 0 20px ${resultColor}66` : result && !mixAnim ? `0 0 15px ${resultColor}44` : 'none',
              transition: 'all 0.3s',
            }}>
            {slot ? (
              <>
                <span style={{ fontSize: '2rem' }}>{slot.emoji}</span>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.2 }}>{slot.name}</span>
                <span style={{ fontSize: '0.5rem', color: 'rgba(255,100,100,0.5)' }}>tap to remove</span>
              </>
            ) : (
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>Slot {i + 1}</span>
            )}
          </motion.div>
        ))}

        {/* Mix button */}
        <motion.button
          onClick={mix} disabled={!slotA || !slotB || mixAnim}
          whileHover={slotA && slotB ? { scale: 1.08 } : {}} whileTap={{ scale: 0.92 }}
          animate={mixAnim ? { rotate: [0, 360] } : {}}
          transition={{ duration: 0.6 }}
          style={{
            width: 64, height: 64, borderRadius: '50%',
            background: slotA && slotB ? `linear-gradient(135deg, ${remedy.color}, ${remedy.color}88)` : 'rgba(255,255,255,0.06)',
            border: '2px solid rgba(255,255,255,0.15)',
            fontSize: '1.8rem', cursor: slotA && slotB ? 'pointer' : 'default',
            opacity: slotA && slotB ? 1 : 0.4,
            boxShadow: slotA && slotB ? `0 0 20px ${remedy.color}44` : 'none',
          }}>
          ⚗️
        </motion.button>
      </div>

      {/* Instruction */}
      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
        🧪 Combine 2 ingredients that work together. Observe Arjun!
      </p>

      {/* Ingredient grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8, width: '100%' }}>
        {allItems.map(item => {
          const isSelected = slotA?.id === item.id || slotB?.id === item.id
          const isKnownWrong = discoveredWrong.includes(item.id)
          return (
            <motion.button key={item.id}
              onClick={() => selectItem(item)}
              whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.92 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 6px',
                borderRadius: 12, cursor: 'pointer',
                background: isSelected ? `${remedy.color}22` : isKnownWrong ? 'rgba(255,80,80,0.06)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${isSelected ? remedy.color + '66' : isKnownWrong ? 'rgba(255,80,80,0.25)' : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.18s',
              }}>
              <span style={{ fontSize: '1.5rem' }}>{item.emoji}</span>
              <span style={{ fontSize: '0.58rem', fontWeight: 600, textAlign: 'center', color: isKnownWrong ? 'rgba(255,120,100,0.7)' : 'var(--color-text-secondary)', lineHeight: 1.2 }}>{item.name}</span>
              {isKnownWrong && <span style={{ fontSize: '0.5rem' }}>❌</span>}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
