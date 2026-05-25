/**
 * Day1_Alchemy.jsx
 * V1-accurate bowl: liquid stream pours from above + particle splash on contact.
 * Uses canvas overlay for the pour + splash particle system.
 * Arjun reaction panel from v2 is kept above.
 */
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArjunCharacter } from '../components/ArjunCharacter'
import { getAllIngredients, getWrongPickFeedback, PROPERTY_LABELS } from '../data/remedies'

const GOOD_LINES = [
  'Ooh yes! That smells healing! ✨',
  'Perfect! My nose tingles! 🌟',
  'Yes! Grandma uses that! 🙏',
  'That one helps! I can feel it! 💪',
]
const BAD_LINES = [
  "Ugh, that made it worse! 🤧",
  "Wait — that stings! 😣",
  "No no no! Not that one! 😖",
  "Eww! My throat burns more! 🥵",
]

/* ─── BowlCanvas: draws the pouring liquid + particles ─── */
function BowlCanvas({ pourEvent, liquidColor, liquidLevel }) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const stateRef  = useRef({ particles: [], stream: null })

  // Kick off a pour animation whenever pourEvent changes
  useEffect(() => {
    if (!pourEvent) return
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.width, H = canvas.height

    const streamX = W / 2
    const streamTopY = 10          // starts above the bowl
    const surfaceY   = H - 20 - liquidLevel * 60  // surface of liquid in canvas coords

    // Stream state
    stateRef.current.stream = {
      x: streamX,
      topY: streamTopY,
      bottomY: streamTopY,      // grows downward
      targetY: surfaceY,
      color: pourEvent.color,
      done: false,
      elapsed: 0,
    }
    stateRef.current.particles = []
  }, [pourEvent])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    function spawnSplash(x, y, color) {
      for (let i = 0; i < 22; i++) {
        const angle = (Math.random() * Math.PI * 2)
        const speed = 1 + Math.random() * 3.5
        stateRef.current.particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          r: 2 + Math.random() * 3,
          alpha: 1,
          color,
        })
      }
    }

    function loop() {
      ctx.clearRect(0, 0, W, H)
      const { stream, particles } = stateRef.current

      // Draw stream
      if (stream && !stream.done) {
        stream.bottomY = Math.min(stream.bottomY + 14, stream.targetY)
        const grad = ctx.createLinearGradient(stream.x - 8, stream.topY, stream.x + 8, stream.bottomY)
        grad.addColorStop(0, stream.color + 'cc')
        grad.addColorStop(1, stream.color + '88')
        ctx.beginPath()
        ctx.roundRect
          ? ctx.roundRect(stream.x - 7, stream.topY, 14, stream.bottomY - stream.topY, 7)
          : ctx.rect(stream.x - 7, stream.topY, 14, stream.bottomY - stream.topY)
        ctx.fillStyle = grad
        ctx.fill()

        // When stream reaches surface → spawn splash, stop growing, fade stream
        if (stream.bottomY >= stream.targetY) {
          if (!stream.splashed) {
            spawnSplash(stream.x, stream.targetY, stream.color)
            stream.splashed = true
          }
          stream.elapsed++
          if (stream.elapsed > 18) stream.done = true
        }
      }

      // Draw & update particles
      stateRef.current.particles = particles.filter(p => p.alpha > 0.02)
      stateRef.current.particles.forEach(p => {
        p.x  += p.vx
        p.y  += p.vy
        p.vy += 0.18   // gravity
        p.alpha -= 0.035
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0')
        ctx.fill()
      })

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={300} height={250}
      style={{
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}

/* ─── Main Component ─── */
export function Day1_Alchemy({ remedy, onComplete }) {
  const allItems = useMemo(() => getAllIngredients(remedy.day ?? 1), [remedy])

  const [addedIngredients, setAddedIngredients] = useState([])
  const [bowlItems, setBowlItems]               = useState([])
  const [wrongItem, setWrongItem]               = useState(null)
  const [wrongMsg, setWrongMsg]                 = useState('')
  const [arjunMood, setMood]                    = useState('neutral')
  const [arjunSpeech, setSpeech]               = useState('')
  const [wrongCount, setWC]                     = useState(0)
  const [discovered, setDisc]                   = useState({})
  // pourEvent triggers a new canvas pour+splash animation
  const [pourEvent, setPourEvent]               = useState(null)

  const isAdded = id => addedIngredients.includes(id)

  const speak = useCallback((mood, lines) => {
    setMood(mood)
    setSpeech(lines[Math.floor(Math.random() * lines.length)])
    setTimeout(() => { setMood('neutral'); setSpeech('') }, 2800)
  }, [])

  function handleIngredientTap(item) {
    if (isAdded(item.id)) return
    const isCorrect = remedy.correctSet.includes(item.id)

    if (isCorrect) {
      const next = [...addedIngredients, item.id]
      setAddedIngredients(next)
      setBowlItems(prev => [...prev, { id: item.id, emoji: item.emoji, color: item.color }])
      // Trigger pour animation with ingredient colour
      setPourEvent({ color: item.color, id: item.id, ts: Date.now() })

      if (next.length === remedy.correctSet.length) {
        setMood('excited')
        setSpeech('YES! Perfect combination! 🏆')
        setTimeout(() => onComplete(next), 2200)
      } else {
        speak('happy', GOOD_LINES)
      }
    } else {
      setWrongItem(item)
      setWrongMsg("That ingredient didn't mix well! Try another 💡")
      setWC(c => c + 1)
      setDisc(prev => ({ ...prev, [item.id]: item.properties || [] }))
      // Trigger pour + bounce for wrong item too (shows wrong colour then bounces)
      setPourEvent({ color: item.color, id: item.id + '-w', ts: Date.now() })
      setTimeout(() => { setWrongItem(null); setWrongMsg('') }, 2000)
      const fb = getWrongPickFeedback(item)
      speak(fb.effect === 'worse' ? 'wrong' : 'yuck', BAD_LINES)
    }
  }

  function handleReset() {
    setAddedIngredients([])
    setBowlItems([])
    setWrongItem(null)
    setWrongMsg('')
    setPourEvent(null)
    setMood('neutral')
    setSpeech('')
  }

  const liquidLevel = bowlItems.length  // 0-N, drives liquid fill height

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>

      {/* ── Arjun Reaction Panel ── */}
      <motion.div
        animate={{
          background: arjunMood === 'wrong'
            ? 'rgba(255,80,80,0.12)'
            : (arjunMood === 'happy' || arjunMood === 'excited')
              ? 'rgba(0,200,83,0.12)'
              : 'rgba(255,255,255,0.06)',
        }}
        style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '12px 18px', borderRadius: 22,
          border: '2px solid rgba(255,255,255,0.1)',
          width: '100%', maxWidth: '720px',
        }}>
        <ArjunCharacter mood={arjunMood} size={0.75} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            Arjun says:
          </p>
          <AnimatePresence mode="wait">
            <motion.p key={arjunSpeech || 'idle'}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.4,
                color: arjunMood === 'wrong' ? '#FF8A65'
                  : (arjunMood === 'happy' || arjunMood === 'excited') ? '#69F0AE'
                  : 'rgba(255,255,255,0.75)',
              }}>
              {arjunSpeech || (addedIngredients.length === 0
                ? 'Tap an ingredient — watch my reaction! 🔬'
                : `${remedy.correctSet.length - addedIngredients.length} more to go…`)}
            </motion.p>
          </AnimatePresence>
          {wrongCount > 0 && (
            <p style={{ fontSize: '0.72rem', color: '#FF8A65', marginTop: 4 }}>
              Wrong picks: {wrongCount}× — use the clue tags!
            </p>
          )}
        </div>
      </motion.div>

      {/* ── Main Layout: Bowl + Shelf ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        alignItems: 'flex-start', gap: '32px', width: '100%', maxWidth: '800px',
      }}>

        {/* ── Bowl Column ── */}
        <div style={{ flex: '1 1 250px', maxWidth: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>

          {/* Bowl SVG + Canvas overlay */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px', aspectRatio: '1.2' }}>

            {/* V1 SVG Bowl */}
            <svg viewBox="0 0 300 250" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* Shadow */}
              <ellipse cx="150" cy="230" rx="100" ry="15" fill="rgba(0,0,0,0.3)" />

              {/* Bowl body */}
              <path d="M 40 100 Q 40 220 150 220 Q 260 220 260 100"
                fill="rgba(40,60,90,0.5)" stroke="#607D8B" strokeWidth="3" />

              {/* Liquid fill — static path, rises with each correct item */}
              {liquidLevel > 0 && (
                <motion.path
                  key={liquidLevel}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  d={`M 50 ${180 - liquidLevel * 15} Q 50 210 150 210 Q 250 210 250 ${180 - liquidLevel * 15}`}
                  fill={`${remedy.color}55`}
                />
              )}

              {/* Bowl rim */}
              <ellipse cx="150" cy="100" rx="112" ry="22"
                fill="rgba(40,55,75,0.6)" stroke="#78909C" strokeWidth="3" />

              {/* Items in bowl — exact v1 motion.text drop-in */}
              {bowlItems.map((item, i) => (
                <motion.text
                  key={item.id}
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  x={100 + (i % 3) * 40}
                  y={145 + Math.floor(i / 3) * 28}
                  fontSize="22"
                  textAnchor="middle">
                  {item.emoji}
                </motion.text>
              ))}

              {/* Wrong item bounce out */}
              {wrongItem && (
                <motion.text
                  key={wrongItem.id + '-bounce'}
                  initial={{ x: 150, y: 150, opacity: 1 }}
                  animate={{ x: 80 + Math.random() * 140, y: 30, opacity: 0, rotate: 360 }}
                  transition={{ duration: 0.75, ease: 'easeOut' }}
                  fontSize="28"
                  textAnchor="middle">
                  {wrongItem.emoji}
                </motion.text>
              )}

              {/* "drop here" when empty */}
              {bowlItems.length === 0 && !wrongItem && (
                <text x="150" y="165" textAnchor="middle"
                  fill="rgba(255,255,255,0.25)" fontSize="14" fontFamily="var(--font-body)">
                  drop here
                </text>
              )}
            </svg>

            {/* Canvas overlay: pouring liquid stream + particle splash */}
            <BowlCanvas
              pourEvent={pourEvent}
              liquidColor={remedy.color}
              liquidLevel={liquidLevel}
            />
          </div>

          {/* Wrong message */}
          <AnimatePresence>
            {wrongMsg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'center', maxWidth: '260px' }}>
                <p className="font-heading" style={{ color: '#FFB74D', fontSize: '1rem', marginBottom: '4px' }}>
                  Hmm, that doesn't seem right...
                </p>
                <p style={{ color: '#FF8A65', fontSize: '0.8rem' }}>{wrongMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Counter + Reset */}
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
            In bowl:{' '}
            <strong style={{ color: remedy.color }}>
              {addedIngredients.length} / {remedy.correctSet.length}
            </strong>
          </p>
          <motion.button
            onClick={handleReset}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{
              padding: '10px 24px', borderRadius: '24px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer',
            }}>
            🗑️ Reset Bowl
          </motion.button>
        </div>

        {/* ── Ingredient Shelf ── */}
        <div style={{ flex: '1 1 250px', maxWidth: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
          <p style={{
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em',
            color: 'var(--color-text-secondary)', textTransform: 'uppercase',
          }}>
            Ingredient Shelf — Tap to Add
          </p>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '10px', width: '100%',
          }}>
            {allItems.map(item => {
              const added   = isAdded(item.id)
              const disc    = discovered[item.id]
              const isWrong = !!disc && !added
              return (
                <motion.button key={item.id}
                  onClick={() => handleIngredientTap(item)}
                  disabled={added}
                  whileHover={!added ? { scale: 1.06, y: -2 } : {}}
                  whileTap={!added ? { scale: 0.94 } : {}}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    padding: '12px 8px', borderRadius: '12px', position: 'relative',
                    background: added ? 'rgba(0,200,83,0.1)' : isWrong ? 'rgba(255,80,80,0.08)' : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${added ? 'rgba(0,200,83,0.3)' : isWrong ? 'rgba(255,80,80,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    cursor: added ? 'default' : 'pointer',
                    opacity: added ? 0.4 : 1,
                    transition: 'all 0.2s',
                  }}>
                  {added   && <span style={{ position: 'absolute', top: 3, right: 5, fontSize: '0.6rem' }}>✅</span>}
                  {isWrong && <span style={{ position: 'absolute', top: 3, right: 5, fontSize: '0.6rem' }}>❌</span>}
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: `${item.color}22`, border: `2px solid ${item.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                  }}>
                    {item.emoji}
                  </div>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.2,
                    color: isWrong ? 'rgba(255,120,100,0.8)' : 'var(--color-text-secondary)',
                  }}>
                    {item.name}
                  </span>
                  {isWrong && disc.slice(0, 2).map(p => (
                    <span key={p} style={{
                      fontSize: '0.47rem', color: 'rgba(255,160,100,0.85)',
                      background: 'rgba(255,80,80,0.1)', borderRadius: 4, padding: '1px 4px', textAlign: 'center',
                    }}>
                      {PROPERTY_LABELS[p] || p}
                    </span>
                  ))}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
