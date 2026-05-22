/**
 * Day6_CardMatch.jsx — Molecule ↔ Plant Visual Card Flip
 * Inspired by classic Concentration / Memory card matching game
 * 4 pairs: molecule icon (left) ↔ plant name (right)
 * Tap a card to flip it. Match molecule to its plant source.
 * Matched pairs stay revealed with a green glow.
 * All 4 matched → Complete!
 */
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArjunCharacter } from '../components/ArjunCharacter'

// Molecule ↔ Plant pair data for Day 6 (Spice Mix / Trikatu theme)
const PAIRS = [
  { id: 'curcumin',   molecule: '⬡',  moleculeName: 'Curcumin',   plant: '🟡', plantName: 'Turmeric',      color: '#FFD700' },
  { id: 'piperine',   molecule: '⬢',  moleculeName: 'Piperine',   plant: '⚫', plantName: 'Black Pepper',  color: '#9E9E9E' },
  { id: 'gingerol',   molecule: '⬣',  moleculeName: 'Gingerol',   plant: '🫚', plantName: 'Ginger',         color: '#FF6D00' },
  { id: 'eugenol',    molecule: '○',  moleculeName: 'Eugenol',    plant: '🌿', plantName: 'Tulsi Leaves',  color: '#00C853' },
]

function buildDeck(pairs) {
  const cards = []
  pairs.forEach(p => {
    cards.push({ uid: `${p.id}_mol`, pairId: p.id, type: 'molecule', label: p.moleculeName, icon: p.molecule, color: p.color })
    cards.push({ uid: `${p.id}_pln`, pairId: p.id, type: 'plant',    label: p.plantName,    icon: p.plant,    color: p.color })
  })
  return cards.sort(() => Math.random() - 0.5)
}

export function Day6_CardMatch({ remedy, onComplete }) {
  const [deck]           = useState(() => buildDeck(PAIRS))
  const [flipped, setFlipped] = useState([])    // uids currently face-up (max 2)
  const [matched, setMatched] = useState([])    // pairIds matched
  const [blocked, setBlocked] = useState(false) // prevent rapid taps during check
  const [arjunMood, setMood]  = useState('thinking')
  const [arjunSpeech, setSpeech] = useState('Match the molecule to the plant it comes from! 🔬')
  const [attempts, setAttempts] = useState(0)

  const flip = useCallback((card) => {
    if (blocked || flipped.length >= 2 || flipped.includes(card.uid) || matched.includes(card.pairId)) return
    const nextFlipped = [...flipped, card.uid]
    setFlipped(nextFlipped)

    if (nextFlipped.length === 2) {
      setBlocked(true)
      setAttempts(a => a + 1)
      const [a, b] = nextFlipped.map(uid => deck.find(c => c.uid === uid))
      if (a.pairId === b.pairId) {
        // Match!
        const nextMatched = [...matched, a.pairId]
        setMatched(nextMatched)
        setFlipped([])
        setBlocked(false)
        setMood('happy')
        const mol = a.type === 'molecule' ? a : b
        const plt = a.type === 'plant' ? a : b
        setSpeech(`✅ ${mol.label} comes from ${plt.label}! Correct!`)
        if (nextMatched.length === PAIRS.length) {
          setMood('excited')
          setSpeech('🌟 All molecules matched! You\'re a real scientist!')
          setTimeout(() => onComplete(remedy.correctSet), 1800)
        } else {
          setTimeout(() => { setMood('thinking'); setSpeech('Great match! Keep going! 🔬') }, 1600)
        }
      } else {
        // No match — flip back after 1.2s
        setMood('wrong')
        setSpeech('Not a match… try to remember where you saw them! 🧠')
        setTimeout(() => {
          setFlipped([])
          setBlocked(false)
          setMood('thinking')
          setSpeech('Match the molecule to the plant it comes from! 🔬')
        }, 1300)
      }
    }
  }, [blocked, flipped, matched, deck, onComplete, remedy])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 420 }}>

      {/* Arjun */}
      <motion.div animate={{ background: arjunMood === 'wrong' ? 'rgba(255,80,80,0.1)' : arjunMood === 'excited' ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.05)' }}
        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px', borderRadius: 22, border: '2px solid rgba(255,255,255,0.1)', width: '100%' }}>
        <ArjunCharacter mood={arjunMood} size={0.7} />
        <div style={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.p key={arjunSpeech}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.4, color: arjunMood === 'wrong' ? '#FF8A65' : arjunMood === 'excited' ? '#69F0AE' : 'rgba(255,255,255,0.8)' }}>
              {arjunSpeech}
            </motion.p>
          </AnimatePresence>
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
            Matched: {matched.length}/{PAIRS.length} · Attempts: {attempts}
          </p>
        </div>
      </motion.div>

      {/* Card grid — 4 columns, 2 rows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, width: '100%' }}>
        {deck.map(card => {
          const isFaceUp  = flipped.includes(card.uid)
          const isMatched = matched.includes(card.pairId)
          const show      = isFaceUp || isMatched

          return (
            <motion.div key={card.uid}
              onClick={() => flip(card)}
              whileHover={!show && !blocked ? { scale: 1.06, y: -3 } : {}}
              whileTap={!show ? { scale: 0.92 } : {}}
              animate={{
                rotateY: show ? 0 : 180,
                scale: isMatched ? [1, 1.08, 1] : 1,
              }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              style={{
                height: 90, borderRadius: 14,
                cursor: !show && !blocked ? 'pointer' : 'default',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                background: isMatched
                  ? `${card.color}22`
                  : isFaceUp
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(255,255,255,0.04)',
                border: `2px solid ${isMatched
                  ? card.color + '66'
                  : isFaceUp
                  ? 'rgba(255,255,255,0.25)'
                  : 'rgba(255,255,255,0.08)'}`,
                boxShadow: isMatched ? `0 0 14px ${card.color}44` : 'none',
                // Removed backfaceVisibility: 'hidden' so the back is visible when rotated 180
              }}>

              {show ? (
                <>
                  <span style={{
                    fontSize: card.type === 'molecule' ? '2rem' : '1.6rem',
                    color: card.type === 'molecule' ? card.color : 'white',
                    fontWeight: card.type === 'molecule' ? 900 : 400,
                  }}>{card.icon}</span>
                  <span style={{ fontSize: '0.5rem', textAlign: 'center', fontWeight: 700, color: 'rgba(255,255,255,0.6)', lineHeight: 1.2 }}>{card.label}</span>
                  <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)' }}>{card.type === 'molecule' ? '🧬' : '🌿'}</span>
                </>
              ) : (
                <span style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.12)', transform: 'rotateY(180deg)' }}>🔬</span>
              )}
            </motion.div>
          )
        })}
      </div>

      <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
        🧬 = molecule   🌿 = plant source · Match each pair!
      </p>
    </div>
  )
}
