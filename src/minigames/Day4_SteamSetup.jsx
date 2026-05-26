/**
 * Day4_SteamSetup.jsx — Steam Therapy Preparation
 * Bowl is already on the table. Player adds only:
 *   1. Towel   → folds onto table
 *   2. Hot Water → fills bowl, steam rises
 *   3. Eucalyptus Oil → green tint
 * When all 3 added → Arjun bends face-down over bowl, towel drapes over head.
 * Calls onComplete() → Stage2_Prepare goes straight to microscope (skip stir/heat).
 */
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArjunCharacter } from '../components/ArjunCharacter'
import { getAllIngredients, getWrongPickFeedback } from '../data/remedies'

const GOOD_LINES = [
  'Ahh! The steam feels great! ☁️',
  'I can breathe better already! 😤',
  'Smells like a forest! 🌲',
  'Warm and soothing! ♨️',
]
const BAD_LINES = [
  "Ugh, that made it worse! 🤧",
  "Wait — that stings! 😣",
  "No no no! Not that one! 😖",
  "Eww! My nose burns! 🥵",
]

/* ─── Steam Canvas ─── */
function SteamCanvas({ active, isEucalyptus, resetKey }) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const pRef      = useRef([])

  // Clear on reset
  useEffect(() => {
    pRef.current = []
  }, [resetKey])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    function loop() {
      ctx.clearRect(0, 0, W, H)

      // Spawn only when active
      if (active && pRef.current.length < 60) {
        for (let i = 0; i < 2; i++) {
          pRef.current.push({
            x: W / 2 + (Math.random() - 0.5) * 60,
            y: H * 0.85,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -(1 + Math.random() * 1.5),
            r: 8 + Math.random() * 12,
            life: 0,
            maxLife: 80 + Math.random() * 40,
            color: isEucalyptus ? '#81C784' : '#E3F2FD',
          })
        }
      }

      pRef.current = pRef.current.filter(p => p.life < p.maxLife)
      pRef.current.forEach(p => {
        p.x  += p.vx
        p.y  += p.vy
        p.life++
        p.r  += 0.25

        const prog  = p.life / p.maxLife
        const alpha = prog < 0.2 ? prog / 0.2 : 1 - (prog - 0.2) / 0.8
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.floor(alpha * 70).toString(16).padStart(2, '0')
        ctx.fill()
      })

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [active, isEucalyptus])

  return (
    <canvas ref={canvasRef} width={300} height={300}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}
    />
  )
}

/* ─── Bowl SVG (always visible) ─── */
function Bowl({ hasWater, hasOil }) {
  const waterColor = hasOil ? '#81C784' : '#BBDEFB'
  return (
    <svg width="130" height="70" viewBox="0 0 130 70">
      {/* Back rim */}
      <ellipse cx="65" cy="16" rx="60" ry="11" fill="#90A4AE" />
      {/* Water fill */}
      {hasWater && (
        <motion.ellipse
          key="water"
          initial={{ ry: 0 }} animate={{ ry: 9 }}
          cx="65" cy="18" rx="56"
          fill={waterColor}
          transition={{ duration: 0.6 }}
        />
      )}
      {/* Front body */}
      <path d="M 5 16 Q 5 62 65 62 Q 125 62 125 16 Q 125 27 65 27 Q 5 27 5 16" fill="#B0BEC5" />
      {/* Rim highlight */}
      <path d="M 5 16 Q 5 27 65 27 Q 125 27 125 16" fill="none" stroke="#78909C" strokeWidth="2" />
      {/* Steam holes on rim when hot */}
      {hasWater && [30, 65, 100].map(x => (
        <motion.circle key={x} cx={x} cy={14} r={3} fill={waterColor}
          animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: x / 100 }}
        />
      ))}
    </svg>
  )
}

/* ─── Towel on table ─── */
function TowelOnTable() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', bounce: 0.5 }}
      style={{ position: 'absolute', bottom: 54, right: 18, zIndex: 12 }}
    >
      <svg width="70" height="40" viewBox="0 0 70 40">
        <rect x="2" y="8" width="66" height="28" rx="8" fill="#EF9A9A" stroke="#E57373" strokeWidth="2" />
        <path d="M 8 18 Q 35 23 62 18" stroke="#FFCDD2" strokeWidth="4" fill="none" />
        <path d="M 8 26 Q 35 31 62 26" stroke="#FFCDD2" strokeWidth="4" fill="none" />
        <text x="35" y="14" textAnchor="middle" fontSize="8" fill="#C62828" fontWeight="bold">TOWEL</text>
      </svg>
    </motion.div>
  )
}

/* ─── Cinematic: Arjun bends down + towel drapes ─── */
function SteamCinematic({ onDone, remedyColor }) {
  const [step, setStep] = useState(0)
  // step 0: normal → step 1: bend down → step 2: towel drops → step 3: steam puffs → done
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1000)
    const t2 = setTimeout(() => setStep(2), 2500)
    const t3 = setTimeout(() => setStep(3), 4200)
    const t4 = setTimeout(() => onDone(), 7500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [onDone])

  return (
    <div style={{ position: 'relative', width: 300, height: 340, margin: '0 auto', overflow: 'hidden', borderRadius: 16, background: 'rgba(0,0,0,0.12)' }}>
      {/* Table */}
      <div style={{ position: 'absolute', bottom: 28, left: 10, right: 10, height: 8, background: '#5D4037', borderRadius: 4, zIndex: 2 }} />

      {/* Arjun — behind table */}
      <motion.div
        animate={{ y: step >= 1 ? 40 : 0, scale: step >= 1 ? 1.05 : 1 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        style={{ position: 'absolute', bottom: 36, left: '50%', x: '-50%', zIndex: 1, transformOrigin: 'bottom center' }}
      >
        <ArjunCharacter mood={step >= 3 ? 'excited' : 'happy'} size={1.2} />
      </motion.div>

      {/* Bowl */}
      <div style={{ position: 'absolute', bottom: 36, left: '50%', x: '-50%', zIndex: 3 }}>
        <Bowl hasWater hasOil />
      </div>

      {/* Towel drapes over head and bowl - FULLY OPAQUE */}
      {step >= 2 && (
        <motion.div
          initial={{ y: -300, x: '-50%', opacity: 0 }}
          animate={{ y: step >= 2 ? 0 : -300, x: '-50%', opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.25, duration: 1.2 }}
          style={{ position: 'absolute', bottom: 26, left: '50%', zIndex: 20 }}
        >
          <svg width="280" height="240" viewBox="0 0 280 240" style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.3))' }}>
            {/* Main draped towel shape */}
            <path d="
              M 15 230
              C 20 150, 70 100, 100 60
              C 115 30, 165 30, 180 60
              C 210 100, 260 150, 265 230
              C 270 240, 10 240, 15 230 Z
            " fill="#EF9A9A" stroke="#D32F2F" strokeWidth="3" strokeLinejoin="round" />
            
            {/* Fabric Folds for realism */}
            <path d="M 100 60 C 90 120, 60 180, 30 232" stroke="#E57373" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 180 60 C 190 120, 220 180, 250 232" stroke="#E57373" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 140 35 C 130 100, 150 180, 140 236" stroke="#E57373" strokeWidth="2" fill="none" opacity="0.8" strokeLinecap="round" />
            
            {/* Towel Stripes (curved to show volume) */}
            <path d="M 32 175 C 100 200, 180 200, 248 175" stroke="#FFCDD2" strokeWidth="7" fill="none" />
            <path d="M 23 205 C 100 230, 180 230, 257 205" stroke="#FFCDD2" strokeWidth="7" fill="none" />
          </svg>
        </motion.div>
      )}

      {/* Steam escaping around the edges of the towel (in front of towel) */}
      {step >= 2 && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 25, pointerEvents: 'none' }}>
          {[...Array(14)].map((_, i) => (
            <motion.div key={i}
              initial={{ x: 150 + (Math.random() - 0.5) * 200, y: 260, scale: 0, opacity: 0.8 }}
              animate={{ x: 150 + (Math.random() - 0.5) * 260, y: 40 + Math.random() * 50, scale: 2.5 + Math.random(), opacity: 0 }}
              transition={{ duration: 2.5 + Math.random(), delay: i * 0.15, repeat: Infinity }}
              style={{ position: 'absolute', width: 35, height: 35, borderRadius: '50%', background: '#81C784', filter: 'blur(6px)' }}
            />
          ))}
        </div>
      )}

      {/* Ahh speech bubble */}
      {step >= 3 && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          style={{
            position: 'absolute', top: 20, right: 10, zIndex: 30,
            background: '#1B2A3B', border: '2px solid #40C4FF',
            borderRadius: 16, padding: '10px 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}
        >
          <p style={{ color: '#40C4FF', fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>Ahhhh... 😌</p>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>I can breathe!</p>
        </motion.div>
      )}
    </div>
  )
}

/* ─── Main Component ─── */
export function Day4_SteamSetup({ remedy, onComplete }) {
  // Only show these 3 ingredients (not bowl — it's already on table)
  const allItems = useMemo(() => {
    const items = getAllIngredients(remedy.day ?? 4)
    return items.filter(i => i.id !== 'bowl')
  }, [remedy])

  const [resetKey, setResetKey]         = useState(0)
  const [addedIngredients, setAdded]    = useState([])
  const [wrongItem, setWrongItem]       = useState(null)
  const [wrongMsg, setWrongMsg]         = useState('')
  const [arjunMood, setMood]            = useState('neutral')
  const [arjunSpeech, setSpeech]        = useState('')
  const [wrongCount, setWC]             = useState(0)
  const [discovered, setDisc]           = useState({})
  const [showCinematic, setShowCinematic] = useState(false)

  const isAdded  = id => addedIngredients.includes(id)
  const hasTowel = isAdded('towel')
  const hasWater = isAdded('hot_water')
  const hasOil   = isAdded('eucalyptus')
  const allDone  = hasTowel && hasWater && hasOil

  const speak = useCallback((mood, lines) => {
    setMood(mood)
    setSpeech(lines[Math.floor(Math.random() * lines.length)])
    setTimeout(() => { setMood('neutral'); setSpeech('') }, 2800)
  }, [])

  // Trigger cinematic when all 3 added
  useEffect(() => {
    if (allDone) {
      setMood('excited')
      setSpeech('Perfect! Time to inhale the steam! 🧖‍♂️')
      setTimeout(() => setShowCinematic(true), 1000)
    }
  }, [allDone])

  // Correct set for Day 4 is now towel + hot_water + eucalyptus (no bowl)
  const effectiveCorrectSet = remedy.correctSet.filter(id => id !== 'bowl')

  function handleIngredientTap(item) {
    if (isAdded(item.id)) return
    const isCorrect = effectiveCorrectSet.includes(item.id)

    if (isCorrect) {
      const next = [...addedIngredients, item.id]
      setAdded(next)
      speak('happy', GOOD_LINES)
    } else {
      setWrongItem(item)
      setWrongMsg("That doesn't belong in steam therapy! 💡")
      setWC(c => c + 1)
      setDisc(prev => ({ ...prev, [item.id]: item.properties || [] }))
      setTimeout(() => { setWrongItem(null); setWrongMsg('') }, 2000)
      const fb = getWrongPickFeedback(item)
      speak(fb.effect === 'worse' ? 'wrong' : 'yuck', BAD_LINES)
    }
  }

  function handleReset() {
    setAdded([])
    setWrongItem(null)
    setWrongMsg('')
    setMood('neutral')
    setSpeech('')
    setShowCinematic(false)
    setResetKey(k => k + 1)  // forces steam canvas to clear
  }

  function handleCinematicDone() {
    // Pass all selected + bowl so Stage2 knows what was collected
    onComplete([...addedIngredients, 'bowl'])
  }

  // ── Cinematic screen ──
  if (showCinematic) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
        <p className="font-heading" style={{ color: '#40C4FF', fontSize: '1.1rem', fontWeight: 800, textAlign: 'center' }}>
          ☁️ Steam Therapy in Action!
        </p>
        <SteamCinematic onDone={handleCinematicDone} remedyColor={remedy.color} />
      </motion.div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>

      {/* ── Arjun Reaction Panel ── */}
      <motion.div
        animate={{
          background: arjunMood === 'wrong' ? 'rgba(255,80,80,0.12)'
            : (arjunMood === 'happy' || arjunMood === 'excited') ? 'rgba(0,200,83,0.12)'
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
                : `${effectiveCorrectSet.length - addedIngredients.length} more to go…`)}
            </motion.p>
          </AnimatePresence>
          {wrongCount > 0 && (
            <p style={{ fontSize: '0.72rem', color: '#FF8A65', marginTop: 4 }}>Wrong picks: {wrongCount}× — use the clue tags!</p>
          )}
        </div>
      </motion.div>

      {/* ── Main Layout ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', gap: '32px', width: '100%', maxWidth: '800px' }}>

        {/* ── Steam Station ── */}
        <div style={{ flex: '1 1 250px', maxWidth: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>

          <div style={{ position: 'relative', width: '100%', maxWidth: 300, height: 340, borderRadius: 16, background: 'rgba(0,0,0,0.12)' }}>

            {/* Table */}
            <div style={{ position: 'absolute', bottom: 28, left: 10, right: 10, height: 8, background: '#5D4037', borderRadius: 4, zIndex: 2 }} />

            {/* Steam (only when water + bowl present) */}
            <SteamCanvas active={hasWater} isEucalyptus={hasOil} resetKey={resetKey} />

            {/* Arjun — behind table, mood reflects state */}
            <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
              <ArjunCharacter mood={hasOil ? 'happy' : hasWater ? 'happy' : 'neutral'} size={1.2} />
            </div>

            {/* Bowl — ALWAYS on table */}
            <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
              <Bowl hasWater={hasWater} hasOil={hasOil} />
            </div>

            {/* Towel on table when added */}
            {hasTowel && <TowelOnTable />}

            {/* Wrong item indicator */}
            <AnimatePresence>
              {wrongItem && (
                <motion.div
                  initial={{ y: 0, x: '-50%', opacity: 1 }}
                  animate={{ y: 200, x: '-50%', opacity: 0, rotate: 180 }}
                  transition={{ duration: 0.9 }}
                  style={{ position: 'absolute', top: 80, left: '50%', fontSize: '2.8rem', zIndex: 15 }}
                >
                  {wrongItem.emoji}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty hint */}
            {addedIngredients.length === 0 && (
              <p style={{ position: 'absolute', top: 16, width: '100%', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                Add ingredients to the bowl...
              </p>
            )}
          </div>

          {/* Wrong message */}
          <AnimatePresence>
            {wrongMsg && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'center', maxWidth: 260 }}>
                <p style={{ color: '#FFB74D', fontSize: '0.95rem', fontWeight: 600, marginBottom: 2 }}>Hmm, that doesn't belong here...</p>
                <p style={{ color: '#FF8A65', fontSize: '0.78rem' }}>{wrongMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
            Setup: <strong style={{ color: remedy.color }}>{addedIngredients.length} / {effectiveCorrectSet.length}</strong>
          </p>
          <motion.button onClick={handleReset} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{
              padding: '10px 24px', borderRadius: 24,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            }}>
            🗑️ Reset Station
          </motion.button>
        </div>

        {/* ── Ingredient Shelf ── */}
        <div style={{ flex: '1 1 250px', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Ingredient Shelf — Tap to Add
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10, width: '100%' }}>
            {allItems.map(item => {
              const added   = isAdded(item.id)
              const disc    = discovered[item.id]
              const isWrong = !!disc && !added
              return (
                <motion.button key={item.id} onClick={() => handleIngredientTap(item)} disabled={added}
                  whileHover={!added ? { scale: 1.06, y: -2 } : {}}
                  whileTap={!added ? { scale: 0.94 } : {}}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '12px 8px', borderRadius: 12, position: 'relative',
                    background: added ? 'rgba(0,200,83,0.1)' : isWrong ? 'rgba(255,80,80,0.08)' : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${added ? 'rgba(0,200,83,0.3)' : isWrong ? 'rgba(255,80,80,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    cursor: added ? 'default' : 'pointer', opacity: added ? 0.45 : 1, transition: 'all 0.2s',
                    minHeight: 48,
                  }}>
                  {added   && <span style={{ position: 'absolute', top: 3, right: 5, fontSize: '0.6rem' }}>✅</span>}
                  {isWrong && <span style={{ position: 'absolute', top: 3, right: 5, fontSize: '0.6rem' }}>❌</span>}
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: `${item.color}22`, border: `2px solid ${item.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                  }}>
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
