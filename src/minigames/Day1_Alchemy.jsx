/**
 * Day1_Alchemy.jsx — Ingredient Discovery with v1-style bowl animation
 * Layout: Bowl SVG (left) + Ingredient Shelf (right)
 * Ingredients animate dropping into the bowl. Wrong picks bounce out.
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
  const [wrongItem, setWrongItem] = useState(null) // item object of the bouncing reject
  const [bowlItems, setBowlItems] = useState([])   // items confirmed inside the bowl

  const allItems = useMemo(() => getAllIngredients(remedy.day), [remedy.day])
  const isAdded  = id => added.includes(id)

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
      setBowlItems(prev => [...prev, { id: item.id, emoji: item.emoji, color: item.color }])

      if (next.length === remedy.correctSet.length) {
        setMood('excited')
        setSpeech('YES! Perfect combination! 🏆')
        setTimeout(() => onComplete(next), 2000)
      } else {
        speak('happy', GOOD)
      }
    } else {
      const fb = getWrongPickFeedback(item)
      setWrongItem(item)
      setWC(c => c + 1)
      setDisc(prev => ({ ...prev, [item.id]: item.properties || [] }))
      setShake(fb.effect === 'worse')
      setTimeout(() => { setShake(false); setWrongItem(null) }, 900)
      speak(fb.effect === 'worse' ? 'wrong' : 'yuck', BAD)
    }
  }

  function handleReset() {
    setAdded([])
    setBowlItems([])
    setDisc({})
    setWC(0)
    setMood('neutral')
    setSpeech('')
  }

  return (
    <motion.div
      animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
      transition={{ duration: 0.45 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%' }}>

      {/* Arjun reaction panel */}
      <motion.div
        animate={{ background: arjunMood === 'wrong' ? 'rgba(255,80,80,0.12)' : (arjunMood === 'happy' || arjunMood === 'excited') ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.06)' }}
        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 18px', borderRadius: 22, border: '2px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: 720 }}>
        <ArjunCharacter mood={arjunMood} size={0.75} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Arjun says:</p>
          <AnimatePresence mode="wait">
            <motion.p key={arjunSpeech || 'idle'}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.4, color: arjunMood === 'wrong' ? '#FF8A65' : (arjunMood === 'happy' || arjunMood === 'excited') ? '#69F0AE' : 'rgba(255,255,255,0.75)' }}>
              {arjunSpeech || (added.length === 0 ? 'Tap an ingredient — watch my reaction! 🔬' : `${remedy.correctSet.length - added.length} more to go…`)}
            </motion.p>
          </AnimatePresence>
          {wrongCount > 0 && <p style={{ fontSize: '0.72rem', color: '#FF8A65', marginTop: 4 }}>Wrong picks: {wrongCount}x — use the clue tags!</p>}
        </div>
      </motion.div>

      {/* Main layout: bowl left, shelf right */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        alignItems: 'flex-start', gap: 28, width: '100%', maxWidth: 760,
      }}>

        {/* ── Bowl SVG ── */}
        <div style={{ flex: '1 1 240px', maxWidth: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 280, aspectRatio: '1.2' }}>
            <svg viewBox="0 0 300 250" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* Shadow */}
              <ellipse cx="150" cy="232" rx="100" ry="12" fill="rgba(0,0,0,0.3)" />

              {/* Bowl body */}
              <path d="M 40 100 Q 40 220 150 220 Q 260 220 260 100"
                fill="rgba(40,60,90,0.55)" stroke="#607D8B" strokeWidth="3" />

              {/* Liquid fill — rises as items are added */}
              <AnimatePresence>
                {bowlItems.length > 0 && (
                  <motion.path
                    key="liquid"
                    d={`M 52 ${185 - bowlItems.length * 12} Q 52 212 150 212 Q 248 212 248 ${185 - bowlItems.length * 12}`}
                    fill={`${remedy.color}55`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>

              {/* Bowl rim */}
              <ellipse cx="150" cy="100" rx="112" ry="22"
                fill="rgba(40,55,75,0.65)" stroke="#78909C" strokeWidth="3" />

              {/* Correct items inside bowl — drop in from above */}
              {bowlItems.map((item, i) => (
                <motion.text
                  key={item.id}
                  initial={{ y: -60, opacity: 0, scale: 0.5 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 180 }}
                  x={100 + (i % 3) * 38}
                  y={148 + Math.floor(i / 3) * 28}
                  fontSize="22"
                  textAnchor="middle">
                  {item.emoji}
                </motion.text>
              ))}

              {/* Wrong item — bounces up and out */}
              <AnimatePresence>
                {wrongItem && (
                  <motion.text
                    key={wrongItem.id + '-bounce'}
                    initial={{ x: 150, y: 160, opacity: 1, scale: 1 }}
                    animate={{ x: 100 + Math.random() * 100, y: 20, opacity: 0, rotate: 380, scale: 0.3 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.75, ease: 'easeOut' }}
                    fontSize="28" textAnchor="middle">
                    {wrongItem.emoji}
                  </motion.text>
                )}
              </AnimatePresence>

              {/* "drop here" placeholder */}
              {bowlItems.length === 0 && !wrongItem && (
                <text x="150" y="165" textAnchor="middle" fill="rgba(255,255,255,0.2)"
                  fontSize="13" fontFamily="var(--font-body)">
                  drop here
                </text>
              )}
            </svg>
          </div>

          {/* Added count */}
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
            In bowl: <strong style={{ color: remedy.color }}>{added.length} / {remedy.correctSet.length}</strong>
          </p>

          {/* Reset Bowl */}
          {added.length > 0 && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={handleReset}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ padding: '8px 20px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', cursor: 'pointer' }}>
              🗑️ Reset Bowl
            </motion.button>
          )}
        </div>

        {/* ── Ingredient Shelf ── */}
        <div style={{ flex: '1 1 240px', maxWidth: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Ingredient Shelf — Tap to Add
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(82px, 1fr))', gap: 10, width: '100%' }}>
            {allItems.map(item => {
              const a = isAdded(item.id)
              const disc = discovered[item.id]
              const isWrong = !!disc && !a
              return (
                <motion.button key={item.id}
                  onClick={() => tap(item)} disabled={a}
                  whileHover={!a ? { scale: 1.07, y: -3 } : {}} whileTap={!a ? { scale: 0.92 } : {}}
                  animate={wrongItem?.id === item.id ? { x: [-6, 6, -4, 4, 0] } : {}}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                    padding: isWrong ? '8px 6px' : '12px 8px', borderRadius: 14,
                    cursor: a ? 'default' : 'pointer',
                    background: a ? 'rgba(0,200,83,0.1)' : isWrong ? 'rgba(255,80,80,0.08)' : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${a ? 'rgba(0,200,83,0.35)' : isWrong ? 'rgba(255,80,80,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    position: 'relative', transition: 'all 0.2s', opacity: a ? 0.45 : 1,
                  }}>
                  {a && <span style={{ position: 'absolute', top: 3, right: 5, fontSize: '0.6rem' }}>✅</span>}
                  {isWrong && <span style={{ position: 'absolute', top: 3, right: 5, fontSize: '0.6rem' }}>❌</span>}
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${item.color}22`, border: `2px solid ${item.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    {item.emoji}
                  </div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 600, textAlign: 'center', color: isWrong ? 'rgba(255,120,100,0.8)' : 'var(--color-text-secondary)', lineHeight: 1.2 }}>{item.name}</span>
                  {isWrong && disc.slice(0, 2).map(p => (
                    <span key={p} style={{ fontSize: '0.47rem', color: 'rgba(255,160,100,0.85)', background: 'rgba(255,80,80,0.1)', borderRadius: 4, padding: '1px 4px', textAlign: 'center' }}>
                      {PROPERTY_LABELS[p] || p}
                    </span>
                  ))}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
