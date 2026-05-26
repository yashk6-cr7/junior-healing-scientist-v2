/**
 * Day4_SpeedCatch.jsx — Falling Ingredient Catcher
 * Inspired by Fruit Ninja / Catch educational games
 * Ingredients fall from the top — tap correct ones, dodge wrong ones.
 * Miss a correct one = health drops. Tap wrong = penalty.
 * Catch all correct ingredients to win!
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArjunCharacter } from '../components/ArjunCharacter'
import { getAllIngredients } from '../data/remedies'

const GAME_W = 340
const GAME_H = 360
const FALL_SPEED_MS = 2800  // ms to cross full height
const SPAWN_INTERVAL = 900  // ms between spawns

export function Day4_SpeedCatch({ remedy, onComplete }) {
  const allItems = useMemo(() => getAllIngredients(remedy.day), [remedy.day])
  const correctIds = remedy.correctSet

  const [falling, setFalling]    = useState([]) // { uid, item, x, startTime }
  const [caught, setCaught]      = useState([]) // correctIds caught
  const [health, setHealth]      = useState(3)
  const [arjunMood, setMood]     = useState('neutral')
  const [arjunSpeech, setSpeech] = useState('Catch the healing ingredients falling from the sky! 🌟')
  const [started, setStarted]    = useState(false)
  const [combo, setCombo]        = useState(0)
  const [pops, setPops]          = useState([]) // { uid, x, y, text, color }

  const uidRef    = useRef(0)
  const timerRef  = useRef(null)
  const doneRef   = useRef(false)
  const caughtRef = useRef(caught)
  useEffect(() => { caughtRef.current = caught }, [caught])

  const spawnItem = useCallback(() => {
    const item = allItems[Math.floor(Math.random() * allItems.length)]
    const x    = 20 + Math.random() * (GAME_W - 80)
    setFalling(prev => [...prev, { uid: ++uidRef.current, item, x, startTime: Date.now() }])
  }, [allItems])

  const addPop = useCallback((uid, x, y, text, color) => {
    const id = uid + '_pop'
    setPops(prev => [...prev, { uid: id, x, y, text, color }])
    setTimeout(() => setPops(prev => prev.filter(p => p.uid !== id)), 900)
  }, [])

  function startGame() {
    setStarted(true)
    setMood('excited')
    setSpeech('Go! Catch the right ones! 🎯')
    setTimeout(() => { setMood('neutral'); setSpeech('') }, 1500)
  }

  // Spawn loop
  useEffect(() => {
    if (!started || doneRef.current) return
    spawnItem()
    timerRef.current = setInterval(spawnItem, SPAWN_INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [started, spawnItem])

  // Auto-remove items that fell past the bottom
  useEffect(() => {
    if (!started) return
    const interval = setInterval(() => {
      const now = Date.now()
      setFalling(prev => {
        const expired = prev.filter(f => (now - f.startTime) > FALL_SPEED_MS + 200)
        expired.forEach(f => {
          if (correctIds.includes(f.item.id) && !caughtRef.current.includes(f.item.id)) {
            setHealth(h => {
              const next = Math.max(0, h - 1)
              if (next <= 0 && !doneRef.current) {
                doneRef.current = true
                clearInterval(timerRef.current)
                setMood('wrong')
                setSpeech('Oh no… you missed too many! Try again! 😢')
                // Still proceed after 2s (educational — never block progress)
                setTimeout(() => onComplete(caughtRef.current.length > 0 ? caughtRef.current : [correctIds[0]]), 2500)
              }
              return next
            })
            setMood('wrong')
            setSpeech('Oops, missed one! 😣')
            setTimeout(() => { setMood('neutral'); setSpeech('') }, 1000)
          }
        })
        return prev.filter(f => (now - f.startTime) <= FALL_SPEED_MS + 200)
      })
    }, 200)
    return () => clearInterval(interval)
  }, [started, correctIds, onComplete])

  function catchItem(uid, item, x) {
    setFalling(prev => prev.filter(f => f.uid !== uid))
    const isCorrect = correctIds.includes(item.id)
    if (isCorrect && !caught.includes(item.id)) {
      const next = [...caught, item.id]
      setCaught(next)
      const newCombo = combo + 1
      setCombo(newCombo)
      addPop(uid, x, 300, newCombo >= 2 ? `+COMBO x${newCombo}! ✨` : '+1 ✅', '#69F0AE')
      if (next.length >= Math.min(3, correctIds.length)) {
        doneRef.current = true
        clearInterval(timerRef.current)
        setMood('excited')
        setSpeech('🏆 You caught all the healing ingredients!')
        setTimeout(() => onComplete(next), 1800)
      } else {
        setMood('happy')
        setSpeech(`Got it! ${Math.min(3, correctIds.length) - next.length} more! 💪`)
        setTimeout(() => { setMood('neutral'); setSpeech('') }, 1000)
      }
    } else if (!isCorrect) {
      setCombo(0)
      setHealth(h => Math.max(0, h - 1))
      addPop(uid, x, 300, '❌ Wrong!', '#FF8A65')
      setMood('yuck')
      setSpeech('That\'s not healing! Dodge those! 🚫')
      setTimeout(() => { setMood('neutral'); setSpeech('') }, 1000)
    }
  }

  if (!started) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <ArjunCharacter mood="excited" size={0.9} />
        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#FFD54F', textAlign: 'center' }}>⚡ Speed Round!</p>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: 300, lineHeight: 1.5 }}>
          Ingredients will fall from the sky.<br />
          <strong style={{ color: '#69F0AE' }}>Tap the healing ones</strong>, dodge the wrong ones!<br />
          You have <strong style={{ color: '#FF8A65' }}>3 lives ❤️</strong>.
        </p>
        <motion.button onClick={startGame}
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
          style={{ padding: '14px 36px', borderRadius: 24, background: `linear-gradient(135deg, ${remedy.color}, ${remedy.color}99)`, border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: `0 0 24px ${remedy.color}44` }}>
          🚀 Start!
        </motion.button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%', maxWidth: 400 }}>

      {/* Arjun + HUD */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', justifyContent: 'space-between' }}>
        <ArjunCharacter mood={arjunMood} size={0.6} />
        <div style={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.p key={arjunSpeech || 'quiet'}
              initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontSize: '0.85rem', fontWeight: 700, color: arjunMood === 'wrong' ? '#FF8A65' : arjunMood === 'happy' || arjunMood === 'excited' ? '#69F0AE' : 'rgba(255,255,255,0.7)', lineHeight: 1.3 }}>
              {arjunSpeech}
            </motion.p>
          </AnimatePresence>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>{'❤️'.repeat(health)}{'🖤'.repeat(Math.max(0, 3 - health))}</p>
          <p style={{ fontSize: '0.7rem', color: '#69F0AE', fontWeight: 700 }}>{caught.length}/{Math.min(3, correctIds.length)} caught</p>
          {combo >= 2 && <p style={{ fontSize: '0.65rem', color: '#FFD54F' }}>🔥 Combo x{combo}</p>}
        </div>
      </div>

      {/* Game area */}
      <div style={{ position: 'relative', width: GAME_W, height: GAME_H, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>

        {/* Pop-up score texts */}
        {pops.map(p => (
          <motion.div key={p.uid}
            initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.9 }}
            style={{ position: 'absolute', left: p.x, top: p.y, fontSize: '0.8rem', fontWeight: 800, color: p.color, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            {p.text}
          </motion.div>
        ))}

        {/* Falling items */}
        {falling.map(f => {
          const isC = correctIds.includes(f.item.id)
          return (
            <motion.button key={f.uid}
              initial={{ y: -60 }} animate={{ y: GAME_H + 60 }}
              transition={{ duration: FALL_SPEED_MS / 1000, ease: 'linear' }}
              onPointerDown={() => catchItem(f.uid, f.item, f.x)}
              style={{
                position: 'absolute', left: f.x, top: 0,
                width: 64, height: 64, borderRadius: '50%',
                background: `${f.item.color}22`,
                border: `3px solid ${isC ? f.item.color + '99' : 'rgba(255,80,80,0.4)'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                cursor: 'pointer', padding: 0, touchAction: 'none',
                boxShadow: isC ? `0 0 12px ${f.item.color}44` : 'none',
              }}>
              <span style={{ fontSize: '1.5rem', pointerEvents: 'none' }}>{f.item.emoji}</span>
              <span style={{ fontSize: '0.42rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textAlign: 'center', lineHeight: 1.1, pointerEvents: 'none' }}>
                {f.item.name.split(' ')[0]}
              </span>
            </motion.button>
          )
        })}

        {/* Guide bar at bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${remedy.color}66, transparent)` }} />
      </div>

      <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)', textAlign: 'center' }}>
        Tap the falling ingredient bubbles!
      </p>
    </div>
  )
}
