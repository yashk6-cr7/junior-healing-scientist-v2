/**
 * Day1_Alchemy.jsx — Ingredient Discovery (Kanad's observe-and-infer method)
 * Player taps ingredients with NO hints. Arjun reacts. Wrong picks reveal
 * hidden properties. Player deduces the correct set through observation.
 */
import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArjunCharacter } from '../components/ArjunCharacter'
import { getAllIngredients, getWrongPickFeedback, PROPERTY_LABELS } from '../data/remedies'

const GOOD = ['Ooh yes! That smells healing! ✨', 'Perfect! My nose tingles! 🌟', 'Yes! Grandma uses that! 🙏', 'That one helps! I can feel it! 💪']
const BAD  = ['Ugh, that made it worse! 🤧', 'Wait — that stings! 😣', 'No no no! Not that one! 😖', 'Eww! My throat burns more! 🥵']

export function Day1_Alchemy({ remedy, onComplete }) {
  const [added, setAdded]         = useState([])
  const [discovered, setDisc]     = useState({}) // id → properties[]
  const [wrongCount, setWC]       = useState(0)
  const [arjunMood, setMood]      = useState('neutral')
  const [arjunSpeech, setSpeech]  = useState('')
  const [shake, setShake]         = useState(false)
  const [wrongItem, setWrongItem] = useState(null)

  const allItems = useMemo(() => getAllIngredients(remedy.day), [remedy.day])
  const isAdded = id => added.includes(id)



  const speak = useCallback((mood, lines) => {
    setMood(mood)
    setSpeech(lines[Math.floor(Math.random() * lines.length)])
    setTimeout(() => { setMood('neutral'); setSpeech('') }, 2800)
  }, [])

  function tap(item) {
    if (isAdded(item.id)) return
    const correct = remedy.correctSet.includes(item.id)
    if (correct) {
      const next = [...added, item.id]
      setAdded(next)
      if (next.length === remedy.correctSet.length) {
        setMood('excited'); setSpeech('YES! Perfect combination! 🏆')
        setTimeout(() => onComplete(next), 2000)
      } else {
        speak('happy', GOOD)
      }
    } else {
      const fb = getWrongPickFeedback(item)
      setWrongItem(item.id)
      setWC(c => c + 1)
      setDisc(prev => ({ ...prev, [item.id]: item.properties || [] }))
      setShake(fb.effect === 'worse')
      setTimeout(() => { setShake(false); setWrongItem(null) }, 600)
      speak(fb.effect === 'worse' ? 'wrong' : 'yuck', BAD)
    }
  }

  return (
    <motion.div animate={shake ? { x: [-7, 7, -5, 5, 0] } : {}} transition={{ duration: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 500 }}>

      {/* Arjun panel */}
      <motion.div animate={{ background: arjunMood === 'wrong' ? 'rgba(255,80,80,0.12)' : arjunMood === 'happy' || arjunMood === 'excited' ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.06)' }}
        style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '14px 20px', borderRadius: 24, border: '2px solid rgba(255,255,255,0.1)', width: '100%' }}>
        <ArjunCharacter mood={arjunMood} size={0.85} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Arjun says:</p>
          <AnimatePresence mode="wait">
            <motion.p key={arjunSpeech || 'idle'}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.4, color: arjunMood === 'wrong' ? '#FF8A65' : arjunMood === 'happy' || arjunMood === 'excited' ? '#69F0AE' : 'rgba(255,255,255,0.75)' }}>
              {arjunSpeech || (added.length === 0 ? 'Tap an ingredient — watch my reaction! 🔬' : `${remedy.correctSet.length - added.length} more to go…`)}
            </motion.p>
          </AnimatePresence>
          {wrongCount > 0 && <p style={{ fontSize: '0.75rem', color: '#FF8A65', marginTop: 4 }}>Wrong picks: {wrongCount}x — use the clue tags!</p>}
        </div>
      </motion.div>

      {/* Progress */}
      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
        Ingredients added: <strong style={{ color: remedy.color }}>{added.length} / {remedy.correctSet.length}</strong>
      </p>

      {/* Ingredient shelf */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 10, width: '100%' }}>
        {allItems.map(item => {
          const a = isAdded(item.id)
          const disc = discovered[item.id]
          const isWrong = !!disc && !a
          return (
            <motion.button key={item.id}
              onClick={() => tap(item)} disabled={a}
              animate={wrongItem === item.id ? { x: [-5, 5, -3, 3, 0] } : {}}
              whileHover={!a ? { scale: 1.05, y: -2 } : {}} whileTap={!a ? { scale: 0.93 } : {}}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: isWrong ? '8px 6px' : '12px 8px', borderRadius: 14, cursor: a ? 'default' : 'pointer',
                background: a ? 'rgba(0,200,83,0.1)' : isWrong ? 'rgba(255,80,80,0.08)' : 'rgba(255,255,255,0.06)',
                border: `2px solid ${a ? 'rgba(0,200,83,0.35)' : isWrong ? 'rgba(255,80,80,0.3)' : 'rgba(255,255,255,0.1)'}`,
                position: 'relative', transition: 'all 0.2s', opacity: a ? 0.45 : 1,
              }}>
              {a && <span style={{ position: 'absolute', top: 3, right: 5, fontSize: '0.65rem' }}>✅</span>}
              {isWrong && <span style={{ position: 'absolute', top: 3, right: 5, fontSize: '0.65rem' }}>❌</span>}
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${item.color}22`, border: `2px solid ${item.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                {item.emoji}
              </div>
              <span style={{ fontSize: '0.62rem', fontWeight: 600, textAlign: 'center', color: isWrong ? 'rgba(255,120,100,0.8)' : 'var(--color-text-secondary)', lineHeight: 1.2 }}>{item.name}</span>
              {isWrong && disc.slice(0, 2).map(p => (
                <span key={p} style={{ fontSize: '0.48rem', color: 'rgba(255,160,100,0.85)', background: 'rgba(255,80,80,0.1)', borderRadius: 4, padding: '1px 4px', textAlign: 'center' }}>
                  {PROPERTY_LABELS[p] || p}
                </span>
              ))}
            </motion.button>
          )
        })}
      </div>

      {/* Reset */}
      {added.length > 0 && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => { setAdded([]); setDisc({}); setWC(0); setMood('neutral'); setSpeech('') }}
          style={{ padding: '8px 20px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', cursor: 'pointer' }}>
          🗑️ Reset Bowl
        </motion.button>
      )}
    </motion.div>
  )
}
