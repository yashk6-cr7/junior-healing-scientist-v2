/**
 * Day3_Memory.jsx — Flash Memory Challenge
 * Inspired by Simon Says / Lumosity Memory Matrix
 * Phase 1 (Memorise): Show correct ingredients + 1 distractor for 4 seconds with countdown.
 * Phase 2 (Recall): All cards flip face-down. Tap the ones you memorised.
 * Correct taps = green glow. Wrong tap = shake + penalty second on timer.
 * Complete when all correct items are tapped.
 */
import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArjunCharacter } from '../components/ArjunCharacter'
import { getAllIngredients } from '../data/remedies'

const SHOW_SECONDS = 4

export function Day3_Memory({ remedy, onComplete }) {
  // Limit to 6 items for memory (3 correct + 3 wrong distractors)
  const items = useMemo(() => {
    const all = getAllIngredients(remedy.day)
    const correct = all.filter(i => remedy.correctSet.includes(i.id)).slice(0, 3)
    const wrong   = all.filter(i => !remedy.correctSet.includes(i.id)).slice(0, 3)
    return [...correct, ...wrong].sort(() => Math.random() - 0.5)
  }, [remedy.day, remedy.correctSet])
  const correctIds = useMemo(() => items.filter(i => remedy.correctSet.includes(i.id)).map(i => i.id), [items, remedy.correctSet])

  const [phase, setPhase]       = useState('memorise') // 'memorise' | 'recall' | 'done'
  const [countdown, setCountdown] = useState(SHOW_SECONDS)
  const [tapped, setTapped]     = useState([])
  const [wrong, setWrong]       = useState([])
  const [arjunMood, setMood]    = useState('thinking')
  const [arjunSpeech, setSpeech] = useState('Study carefully! You have 4 seconds! 👀')
  const timerRef = useRef(null)

  useEffect(() => {
    if (phase !== 'memorise') return
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timerRef.current)
          setPhase('recall')
          setMood('neutral')
          setSpeech('Now recall! Tap the healing ingredients you saw! 🧠')
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  function tapCard(item) {
    if (phase !== 'recall' || tapped.includes(item.id) || wrong.includes(item.id)) return
    if (correctIds.includes(item.id)) {
      const next = [...tapped, item.id]
      setTapped(next)
      if (next.length === correctIds.length) {
        setMood('excited')
        setSpeech('Amazing memory! You remembered them all! 🌟')
        setPhase('done')
        setTimeout(() => onComplete(correctIds), 1800)
      } else {
        setMood('happy')
        setSpeech('Yes! That was one of them! 🎯')
        setTimeout(() => { setMood('neutral'); setSpeech('Now recall! Tap the healing ingredients you saw! 🧠') }, 1500)
      }
    } else {
      setWrong(prev => [...prev, item.id])
      setMood('wrong')
      setSpeech('Oops! That wasn\'t a healing ingredient! 😣')
      setTimeout(() => { setMood('neutral'); setSpeech('Keep trying — you can do it! 💪') }, 1500)
    }
  }

  const isFlipped = phase === 'recall' || phase === 'done'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 460 }}>

      {/* Arjun */}
      <motion.div animate={{ background: arjunMood === 'wrong' ? 'rgba(255,80,80,0.1)' : arjunMood === 'excited' ? 'rgba(0,200,83,0.1)' : arjunMood === 'thinking' ? 'rgba(100,150,255,0.08)' : 'rgba(255,255,255,0.05)' }}
        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 22, border: '2px solid rgba(255,255,255,0.1)', width: '100%' }}>
        <ArjunCharacter mood={arjunMood} size={0.75} />
        <div style={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.p key={arjunSpeech}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.4, color: arjunMood === 'wrong' ? '#FF8A65' : arjunMood === 'excited' ? '#69F0AE' : arjunMood === 'thinking' ? '#82B1FF' : 'rgba(255,255,255,0.8)' }}>
              {arjunSpeech}
            </motion.p>
          </AnimatePresence>
          {phase === 'recall' && (
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
              Found: {tapped.length}/{correctIds.length} • Wrong: {wrong.length}
            </p>
          )}
        </div>
      </motion.div>

      {/* Phase label + countdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ padding: '4px 14px', borderRadius: 20, background: phase === 'memorise' ? 'rgba(100,150,255,0.2)' : 'rgba(255,180,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: phase === 'memorise' ? '#82B1FF' : '#FFD54F' }}>
            {phase === 'memorise' ? `👀 Memorise — ${countdown}s` : phase === 'recall' ? '🧠 Recall Mode' : '✅ Complete!'}
          </span>
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: '100%' }}>
        {items.map(item => {
          const isCorrect = correctIds.includes(item.id)
          const isTapped  = tapped.includes(item.id)
          const isWrong   = wrong.includes(item.id)
          const showFace  = !isFlipped || isTapped || isWrong
          return (
            <motion.div key={item.id}
              onClick={() => tapCard(item)}
              animate={isWrong ? { x: [-5, 5, -4, 4, 0] } : isTapped ? { scale: [1, 1.1, 1] } : {}}
              whileHover={isFlipped && !isTapped && !isWrong ? { scale: 1.04 } : {}}
              whileTap={isFlipped && !isTapped ? { scale: 0.92 } : {}}
              style={{
                height: 100, borderRadius: 16, cursor: isFlipped && !isTapped && !isWrong ? 'pointer' : 'default',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: isTapped ? 'rgba(0,200,83,0.18)' : isWrong ? 'rgba(255,80,80,0.15)' : isFlipped ? 'rgba(255,255,255,0.04)' : `${item.color}18`,
                border: `2px solid ${isTapped ? 'rgba(0,200,83,0.5)' : isWrong ? 'rgba(255,80,80,0.4)' : isFlipped ? 'rgba(255,255,255,0.12)' : `${item.color}55`}`,
                transition: 'all 0.25s',
                boxShadow: isCorrect && phase === 'memorise' ? `0 0 12px ${item.color}44` : 'none',
              }}>
              <AnimatePresence mode="wait">
                {showFace ? (
                  <motion.div key="face" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: '1.8rem' }}>{item.emoji}</span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 600, textAlign: 'center', color: 'var(--color-text-secondary)', lineHeight: 1.2 }}>{item.name}</span>
                    {phase === 'memorise' && isCorrect && (
                      <span style={{ fontSize: '0.5rem', color: '#69F0AE', fontWeight: 700 }}>✓ healing</span>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.15)' }}>❓</motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
