import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArjunCharacter } from '../components/ArjunCharacter'
import { getAllIngredients, getWrongPickFeedback } from '../data/remedies'

const GOOD_LINES = [
  'Ah! The steam feels nice! ☁️',
  'I can breathe a bit better! 😤',
  'Smells like a forest! 🌲',
  'Nice and warm! ♨️',
]
const BAD_LINES = [
  "Ugh, that made it worse! 🤧",
  "Wait — that stings! 😣",
  "No no no! Not that one! 😖",
  "Eww! My throat burns more! 🥵",
]

/* ─── Steam Canvas ─── */
function SteamCanvas({ isHotWater, isEucalyptus, width, height }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    if (!isHotWater) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    function spawnSteam() {
      // Spawn 1-2 particles per frame
      for (let i = 0; i < 2; i++) {
        if (Math.random() > 0.4) continue
        particlesRef.current.push({
          x: W / 2 + (Math.random() - 0.5) * 80,
          y: H, // start at bottom (bowl level)
          vx: (Math.random() - 0.5) * 0.5,
          vy: -1 - Math.random() * 1.5, // float up
          r: 10 + Math.random() * 15,
          life: 1,
          maxLife: 100 + Math.random() * 50,
          color: isEucalyptus ? '#81C784' : '#E3F2FD' // tint green if oil added
        })
      }
    }

    function loop() {
      ctx.clearRect(0, 0, W, H)
      
      spawnSteam()

      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife)
      
      particlesRef.current.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.life++
        p.r += 0.2 // expands as it rises
        
        // fade in then fade out
        const progress = p.life / p.maxLife
        let alpha = 0
        if (progress < 0.2) alpha = progress / 0.2
        else alpha = 1 - ((progress - 0.2) / 0.8)
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.floor(alpha * (isEucalyptus ? 60 : 80)).toString(16).padStart(2, '0')
        ctx.fill()
      })

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [isHotWater, isEucalyptus])

  return (
    <canvas
      ref={canvasRef}
      width={width} height={height}
      style={{
        position: 'absolute', top: 0, left: 0,
        pointerEvents: 'none', zIndex: 10
      }}
    />
  )
}


export function Day4_SteamSetup({ remedy, onComplete }) {
  const allItems = useMemo(() => getAllIngredients(remedy.day ?? 4), [remedy])

  const [addedIngredients, setAddedIngredients] = useState([])
  const [wrongItem, setWrongItem]               = useState(null)
  const [wrongMsg, setWrongMsg]                 = useState('')
  const [arjunMood, setMood]                    = useState('neutral')
  const [arjunSpeech, setSpeech]                = useState('')
  const [wrongCount, setWC]                     = useState(0)
  const [discovered, setDisc]                   = useState({})

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

      if (next.length === remedy.correctSet.length) {
        setMood('excited')
        setSpeech('Perfect setup! Time to inhale! 🧖‍♂️')
        setTimeout(() => onComplete(next), 2200)
      } else {
        speak('happy', GOOD_LINES)
      }
    } else {
      setWrongItem(item)
      setWrongMsg("That doesn't belong in a steam therapy! 💡")
      setWC(c => c + 1)
      setDisc(prev => ({ ...prev, [item.id]: item.properties || [] }))
      setTimeout(() => { setWrongItem(null); setWrongMsg('') }, 2000)
      const fb = getWrongPickFeedback(item)
      speak(fb.effect === 'worse' ? 'wrong' : 'yuck', BAD_LINES)
    }
  }

  function handleReset() {
    setAddedIngredients([])
    setWrongItem(null)
    setWrongMsg('')
    setMood('neutral')
    setSpeech('')
  }

  // Steam Station logic
  const hasBowl = isAdded('bowl')
  const hasWater = isAdded('hot_water')
  const hasOil = isAdded('eucalyptus')
  const hasTowel = isAdded('towel')

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
                ? 'Set up the steam station for me! 🧖‍♂️'
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

      {/* ── Main Layout: Table + Shelf ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        alignItems: 'flex-start', gap: '32px', width: '100%', maxWidth: '800px',
      }}>

        {/* ── Steam Station Column ── */}
        <div style={{ flex: '1 1 250px', maxWidth: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>

          <div style={{ position: 'relative', width: '100%', maxWidth: '300px', height: '350px', background: 'rgba(0,0,0,0.1)', borderRadius: 16, overflow: 'hidden' }}>
            
            {/* Table Line */}
            <div style={{ position: 'absolute', bottom: 30, left: 10, right: 10, height: 8, background: '#5D4037', borderRadius: 4 }} />
            
            {/* Arjun sitting behind table */}
            <div style={{ position: 'absolute', bottom: 38, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
              <ArjunCharacter mood={hasTowel ? 'excited' : (hasOil ? 'happy' : 'neutral')} size={1.2} />
            </div>

            {/* Towel Draped Over Head */}
            <AnimatePresence>
              {hasTowel && (
                <motion.div
                  initial={{ y: -200, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', bounce: 0.4 }}
                  style={{
                    position: 'absolute', top: 90, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 20, pointerEvents: 'none'
                  }}
                >
                  <svg width="180" height="150" viewBox="0 0 180 150">
                    {/* A draped towel shape */}
                    <path d="M 40 100 Q 20 20 90 10 Q 160 20 140 100 Q 145 140 150 150 L 30 150 Q 35 140 40 100 Z" fill="#EF9A9A" stroke="#E57373" strokeWidth="4" />
                    {/* Stripes on towel */}
                    <path d="M 38 120 Q 90 130 142 120" stroke="#FFCDD2" strokeWidth="6" fill="none" />
                    <path d="M 36 135 Q 90 145 144 135" stroke="#FFCDD2" strokeWidth="6" fill="none" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Steam Canvas (rises from bowl to Arjun's face) */}
            <div style={{ position: 'absolute', bottom: 38, left: 0, width: '100%', height: '200px', zIndex: 5 }}>
              <SteamCanvas isHotWater={hasWater && hasBowl} isEucalyptus={hasOil} width={300} height={200} />
            </div>

            {/* Bowl on table (in front of Arjun) */}
            <AnimatePresence>
              {hasBowl && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{ position: 'absolute', bottom: 34, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}
                >
                  <svg width="120" height="60" viewBox="0 0 120 60">
                    {/* Bowl back rim */}
                    <ellipse cx="60" cy="15" rx="55" ry="10" fill="#90A4AE" />
                    
                    {/* Water fill */}
                    {hasWater && (
                      <ellipse cx="60" cy="17" rx="52" ry="8" fill={hasOil ? "#81C784" : "#BBDEFB"} />
                    )}

                    {/* Bowl front body */}
                    <path d="M 5 15 Q 5 55 60 55 Q 115 55 115 15 Q 115 25 60 25 Q 5 25 5 15" fill="#B0BEC5" />
                    <path d="M 5 15 Q 5 25 60 25 Q 115 25 115 15" fill="none" stroke="#78909C" strokeWidth="2" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Wrong item indicator (drops and fades) */}
            <AnimatePresence>
              {wrongItem && (
                <motion.div
                  initial={{ y: -50, x: '-50%', opacity: 1 }}
                  animate={{ y: 250, opacity: 0, rotate: 180 }}
                  transition={{ duration: 1 }}
                  style={{ position: 'absolute', left: '50%', fontSize: '3rem', zIndex: 15 }}
                >
                  {wrongItem.emoji}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state hint */}
            {addedIngredients.length === 0 && (
              <p style={{ position: 'absolute', top: 20, width: '100%', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                Place items here...
              </p>
            )}

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
            Setup: <strong style={{ color: remedy.color }}>{addedIngredients.length} / {remedy.correctSet.length}</strong>
          </p>
          <motion.button onClick={handleReset} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{
              padding: '10px 24px', borderRadius: '24px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            }}>
            🗑️ Reset Station
          </motion.button>
        </div>

        {/* ── Ingredient Shelf ── */}
        <div style={{ flex: '1 1 250px', maxWidth: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Ingredient Shelf — Tap to Add
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', width: '100%' }}>
            {allItems.map(item => {
              const added   = isAdded(item.id)
              const disc    = discovered[item.id]
              const isWrong = !!disc && !added
              return (
                <motion.button key={item.id} onClick={() => handleIngredientTap(item)} disabled={added}
                  whileHover={!added ? { scale: 1.06, y: -2 } : {}} whileTap={!added ? { scale: 0.94 } : {}}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    padding: '12px 8px', borderRadius: '12px', position: 'relative',
                    background: added ? 'rgba(0,200,83,0.1)' : isWrong ? 'rgba(255,80,80,0.08)' : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${added ? 'rgba(0,200,83,0.3)' : isWrong ? 'rgba(255,80,80,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    cursor: added ? 'default' : 'pointer', opacity: added ? 0.4 : 1, transition: 'all 0.2s',
                  }}>
                  {added   && <span style={{ position: 'absolute', top: 3, right: 5, fontSize: '0.6rem' }}>✅</span>}
                  {isWrong && <span style={{ position: 'absolute', top: 3, right: 5, fontSize: '0.6rem' }}>❌</span>}
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${item.color}22`, border: `2px solid ${item.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    {item.emoji}
                  </div>
                  <span style={{ color: added ? '#69F0AE' : 'white', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>
                    {item.name}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
