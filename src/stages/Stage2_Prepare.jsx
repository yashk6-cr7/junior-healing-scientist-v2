/**
 * Stage2_Prepare.jsx — Remedy Preparation with Daily Minigames
 * Each day loads a unique minigame mechanic for ingredient selection.
 * Phases: select (minigame) → (crush?) → stir → heat → microscope → Stage 3
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameState } from '../hooks/useGameState'
import { ACTIONS } from '../context/GameContext'
import { getRemedyByDay, getAllIngredients, getWrongPickFeedback, PROPERTY_LABELS } from '../data/remedies'
import { Day1_Alchemy } from '../minigames/Day1_Alchemy'
import { Day4_SteamSetup } from '../minigames/Day4_SteamSetup'
import MolecularCinematics from '../components/animations/MolecularCinematics'
// Science descriptions per day for microscope phase
const MICRO_TEXT = {
  1: 'Watch Curcumin (gold) spread through the milk molecules, blocking the NF-kB germ alarm! ⚡',
  2: 'Eugenol from Tulsi leaves spirals outward, coating throat cells with a protective shield! 🛡️',
  3: 'Gingerol (orange) and honey (gold) home in on bacteria and dissolve their cell walls! 💥',
  4: 'Hot steam molecules rise upward, sweeping mucus particles out of nasal passages! 💨',
  5: 'Quercetin, allicin, and beta-carotene swirl together forming an immunity vortex! 🌪️',
  6: 'Piperine (dark) attaches to curcumin (gold), making it 2000% more absorbable! ✨',
  7: 'All six healing compounds converge, forming the ultimate Kadha healing stream! 👑',
}

// ─── ArjunFace — Full-body animated SVG character (120×170px) ──────────────
// mood: 'neutral' | 'happy' | 'wrong' | 'yuck' | 'excited'
function ArjunFace({ mood }) {
  const isHappy   = mood === 'happy' || mood === 'excited'
  const isWrong   = mood === 'wrong'
  const isYuck    = mood === 'yuck'
  const isExcited = mood === 'excited'

  // Mouth paths (large, drawn in 60x60 face area centred at cx=55)
  const mouth = isExcited ? 'M 36 57 Q 55 74 74 57'   // huge grin
    : isHappy  ? 'M 40 56 Q 55 70 70 56'              // smile
    : isWrong  ? 'M 40 64 Q 55 52 70 64'              // frown
    : isYuck   ? 'M 36 60 Q 45 54 55 60 Q 65 66 74 60'// wavy
    : 'M 42 60 Q 55 62 68 60'                          // neutral

  // Eye scale
  const eyeRy   = isWrong ? 2 : isYuck ? 2.5 : isExcited ? 8 : 6
  const eyeCol  = isWrong ? '#EF5350' : isHappy ? '#1565C0' : '#1a1a1a'
  // Eyebrow y offsets (inner/outer)
  const LBrow = isWrong  ? { x1:38,y1:32,x2:52,y2:28 }  // angry
              : isHappy  ? { x1:38,y1:27,x2:52,y2:30 }  // raised happy
              :             { x1:38,y1:30,x2:52,y2:30 }  // flat
  const RBrow = isWrong  ? { x1:58,y1:28,x2:72,y2:32 }
              : isHappy  ? { x1:58,y1:30,x2:72,y2:27 }
              :             { x1:58,y1:30,x2:72,y2:30 }

  // Shirt colour
  const shirtCol = isHappy ? '#1976D2' : isWrong ? '#546E7A' : '#37474F'
  // Arm positions
  const armL = isExcited ? 'M 35 110 Q 10 90 15 72' : isWrong ? 'M 35 110 Q 12 118 14 136' : 'M 35 110 Q 15 120 18 140'
  const armR = isExcited ? 'M 75 110 Q 100 90 95 72' : isWrong ? 'M 75 110 Q 98 118 96 136' : 'M 75 110 Q 95 120 92 140'

  return (
    <motion.div
      key={mood}
      animate={
        isWrong   ? { x: [-5, 5, -4, 4, -2, 2, 0], transition: { duration: 0.5 } } :
        isExcited ? { y: [0, -10, 0, -7, 0],        transition: { duration: 0.55 } } :
        isHappy   ? { y: [0, -5, 0],                transition: { duration: 0.4 } } :
        {}
      }
      style={{ position: 'relative', width: 110, height: 175, flexShrink: 0 }}>

      <svg viewBox="0 0 110 175" width="110" height="175" style={{ overflow: 'visible' }}>

        {/* ── Shadow ── */}
        <ellipse cx="55" cy="171" rx="28" ry="5" fill="rgba(0,0,0,0.25)" />

        {/* ── Legs ── */}
        <rect x="37" y="148" width="14" height="22" rx="5" fill="#1A237E" />
        <rect x="59" y="148" width="14" height="22" rx="5" fill="#1A237E" />
        {/* Shoes */}
        <ellipse cx="44" cy="170" rx="10" ry="5" fill="#212121" />
        <ellipse cx="66" cy="170" rx="10" ry="5" fill="#212121" />

        {/* ── Body / Shirt ── */}
        <rect x="28" y="108" width="54" height="44" rx="10" fill={shirtCol} />
        {/* Shirt collar V */}
        <path d="M 44 108 L 55 122 L 66 108" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
        {/* Shirt highlight */}
        <rect x="28" y="108" width="54" height="10" rx="10" fill="rgba(255,255,255,0.08)" />

        {/* ── Arms ── */}
        <path d={armL} fill="none" stroke={shirtCol} strokeWidth="13" strokeLinecap="round" />
        <path d={armR} fill="none" stroke={shirtCol} strokeWidth="13" strokeLinecap="round" />
        {/* Hands */}
        <circle cx={isExcited ? 15 : 18} cy={isExcited ? 72 : 140} r="8" fill="#FFCC80" />
        <circle cx={isExcited ? 95 : 92} cy={isExcited ? 72 : 140} r="8" fill="#FFCC80" />

        {/* ── Neck ── */}
        <rect x="47" y="98" width="16" height="13" rx="4" fill="#FFCC80" />

        {/* ── Head ── */}
        <ellipse cx="55" cy="62" rx="34" ry="36"
          fill="#FFCC80"
          stroke={isWrong ? '#EF5350' : isExcited ? '#FFD700' : '#E6A800'}
          strokeWidth="2"
        />
        {isExcited && <ellipse cx="55" cy="62" rx="34" ry="36" fill="none" stroke="#FFD700" strokeWidth="3" opacity="0.4" />}

        {/* ── Hair ── */}
        <ellipse cx="55" cy="30" rx="32" ry="18" fill="#3E2723" />
        <ellipse cx="55" cy="38" rx="34" ry="8" fill="#3E2723" />
        {/* Hair tuft */}
        <ellipse cx="55" cy="24" rx="10" ry="8" fill="#3E2723" />
        <ellipse cx="38" cy="28" rx="8" ry="6" fill="#3E2723" />
        <ellipse cx="72" cy="28" rx="8" ry="6" fill="#3E2723" />

        {/* ── Eyes ── */}
        <ellipse cx="41" cy="62" rx="7" ry={eyeRy} fill={eyeCol} />
        <ellipse cx="69" cy="62" rx="7" ry={eyeRy} fill={eyeCol} />
        {/* Eye shine */}
        {!isWrong && !isYuck && <>
          <circle cx="44" cy="58" r="2.5" fill="white" opacity="0.9" />
          <circle cx="72" cy="58" r="2.5" fill="white" opacity="0.9" />
        </>}
        {/* Star eyes when excited */}
        {isExcited && <>
          <polygon points="41,54 42.5,58.5 47,58.5 43.5,61.5 44.5,66 41,63 37.5,66 38.5,61.5 35,58.5 39.5,58.5" fill="#FFD700" />
          <polygon points="69,54 70.5,58.5 75,58.5 71.5,61.5 72.5,66 69,63 65.5,66 66.5,61.5 63,58.5 67.5,58.5" fill="#FFD700" />
        </>}
        {/* X-eyes when yuck */}
        {isYuck && <>
          <line x1="35" y1="56" x2="47" y2="68" stroke="#EF5350" strokeWidth="3" strokeLinecap="round" />
          <line x1="47" y1="56" x2="35" y2="68" stroke="#EF5350" strokeWidth="3" strokeLinecap="round" />
          <line x1="63" y1="56" x2="75" y2="68" stroke="#EF5350" strokeWidth="3" strokeLinecap="round" />
          <line x1="75" y1="56" x2="63" y2="68" stroke="#EF5350" strokeWidth="3" strokeLinecap="round" />
        </>}

        {/* ── Eyebrows ── */}
        <line x1={LBrow.x1} y1={LBrow.y1} x2={LBrow.x2} y2={LBrow.y2} stroke="#4E342E" strokeWidth="3" strokeLinecap="round" />
        <line x1={RBrow.x1} y1={RBrow.y1} x2={RBrow.x2} y2={RBrow.y2} stroke="#4E342E" strokeWidth="3" strokeLinecap="round" />

        {/* ── Nose ── */}
        <path d="M 52 70 Q 55 76 58 70" fill="none" stroke="#BF8A6E" strokeWidth="1.5" strokeLinecap="round" />

        {/* ── Mouth ── */}
        <path d={mouth} fill="none" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" />
        {/* Teeth when excited */}
        {isExcited && <path d="M 40 58 Q 55 72 70 58 L 70 65 Q 55 77 40 65 Z" fill="white" opacity="0.85" />}
        {/* Rosy cheeks when happy */}
        {isHappy && <>
          <ellipse cx="28" cy="74" rx="9" ry="5" fill="rgba(255,120,100,0.3)" />
          <ellipse cx="82" cy="74" rx="9" ry="5" fill="rgba(255,120,100,0.3)" />
        </>}
        {/* Sweat drops when wrong */}
        {isWrong && <>
          <ellipse cx="91" cy="46" rx="4" ry="6" fill="#40C4FF" opacity="0.75" />
          <ellipse cx="97" cy="60" rx="3" ry="5" fill="#40C4FF" opacity="0.55" />
        </>}
      </svg>

      {/* Sparkles when excited */}
      {isExcited && ['✦','✧','✦'].map((s, i) => (
        <motion.span key={i}
          animate={{ scale: [0, 1.5, 0], rotate: [0, 200] }}
          transition={{ duration: 0.7, delay: i * 0.15, repeat: 2 }}
          style={{
            position: 'absolute',
            top: [4, -4, 12][i], left: [92, 50, 104][i],
            fontSize: '1.1rem', color: '#FFD700', pointerEvents: 'none',
          }}>{s}</motion.span>
      ))}
    </motion.div>
  )
}

// ─── GrindBowl — drag-to-grind mechanic ──────────────────────────────────────
// User drags the pestle LEFT/RIGHT across the mortar to grind ingredients.
// Total horizontal distance dragged (500 px total) = 100% crushed.
// Pestle follows pointer X position. Dust bursts out on active grinding.
function GrindBowl({ remedyColor, crushProgress, onProgressChange, StepIndicator, ingredients, currentDay }) {
  const mortarRef = useRef(null)
  const lastXRef = useRef(null)
  const totalDistRef = useRef(crushProgress * 5) // resume: 500px = 100%
  const isActiveRef = useRef(false)
  const [pestleX, setPestleX] = useState(50) // 0-100% across mortar
  const [particles, setParticles] = useState([])

  const TOTAL_PX = 500 // total drag distance for 100%

  function getRelX(clientX) {
    const rect = mortarRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
  }

  function spawnParticles(x) {
    const id = Date.now() + Math.random()
    setParticles(prev => [...prev.slice(-10), { id, x, color: remedyColor }])
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 800)
  }

  function handleStart(clientX) {
    isActiveRef.current = true
    lastXRef.current = clientX
    setPestleX(getRelX(clientX))
  }

  function handleMove(clientX) {
    if (!isActiveRef.current || lastXRef.current === null) return
    const delta = Math.abs(clientX - lastXRef.current)
    lastXRef.current = clientX
    totalDistRef.current += delta
    const pct = Math.min(100, (totalDistRef.current / TOTAL_PX) * 100)
    onProgressChange(pct)
    const rx = getRelX(clientX)
    setPestleX(rx)
    if (delta > 3) spawnParticles(rx)
  }

  function handleEnd() {
    isActiveRef.current = false
    lastXRef.current = null
  }

  function onPointerDown(e) { e.currentTarget.setPointerCapture(e.pointerId); handleStart(e.clientX) }
  function onPointerMove(e) { handleMove(e.clientX) }
  function onPointerUp() { handleEnd() }
  function onTouchStart(e) { handleStart(e.touches[0].clientX) }
  function onTouchMove(e) { e.preventDefault(); handleMove(e.touches[0].clientX) }
  function onTouchEnd() { handleEnd() }

  const isDone = crushProgress >= 100
  const crushScale = 1 - (crushProgress / 100) * 0.35 // ingredients shrink as crushed
  const crushBlur = (crushProgress / 100) * 3

  // Science tip based on day
  const tips = {
    4: 'Crushing garlic releases Allicin — it only activates when cell walls break!',
    5: 'Ginger releases Gingerols when crushed — 10× more potent than whole ginger!',
    6: 'Black pepper releases Piperine when ground — makes turmeric 2000% more effective!',
    7: 'Crushing all spices together creates a synergistic blend — each amplifies the others!',
  }
  const tip = tips[currentDay] || tips[4]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100dvh', padding: '64px 16px 100px', gap: '14px' }}>
      <StepIndicator />

      <p style={{ color: '#f5c842', fontWeight: 600, fontSize: '0.9rem' }}>
        {isDone ? '✅ Perfectly crushed!' : 'Drag the pestle left & right across the mortar! 🪨'}
      </p>

      {/* Mortar & Pestle container */}
      <div style={{ position: 'relative', width: '280px', height: '200px', userSelect: 'none' }}>

        {/* Dust/spice particles flying out */}
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            animate={{ opacity: 0, y: -40, x: (Math.random() - 0.5) * 60, scale: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: '30%',
              width: '8px', height: '8px',
              borderRadius: '50%',
              background: p.color,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
        ))}

        {/* Pestle (draggable) — sits above mortar */}
        <motion.div
          style={{
            position: 'absolute',
            left: `${pestleX}%`,
            top: '0px',
            transform: 'translateX(-50%)',
            zIndex: 5,
            cursor: isActiveRef.current ? 'grabbing' : 'grab',
            touchAction: 'none',
          }}
          animate={{
            rotate: isActiveRef.current ? [-8, 8] : 0,
            y: isActiveRef.current ? [0, 4, 0] : 0,
          }}
          transition={{ duration: 0.15, repeat: isActiveRef.current ? Infinity : 0 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Pestle head */}
          <div style={{
            width: '22px', height: '70px',
            background: 'linear-gradient(180deg, #BCAAA4, #8D6E63)',
            borderRadius: '4px 4px 10px 10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            margin: '0 auto',
          }} />
          {/* Pestle tip */}
          <div style={{
            width: '28px', height: '16px',
            background: 'linear-gradient(180deg, #8D6E63, #5D4037)',
            borderRadius: '4px 4px 14px 14px',
            boxShadow: `0 2px 8px ${remedyColor}44`,
            margin: '-2px auto 0',
          }} />
        </motion.div>

        {/* Mortar bowl */}
        <div
          ref={mortarRef}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0, right: 0,
            height: '120px',
            cursor: 'grab',
            touchAction: 'none',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Mortar bowl shape */}
          <div style={{
            width: '100%', height: '100%',
            borderRadius: '0 0 140px 140px',
            background: 'linear-gradient(180deg, rgba(120,90,60,0.5), rgba(60,35,15,0.85))',
            border: '3px solid rgba(200,160,110,0.35)',
            boxShadow: 'inset 0 -12px 40px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Ground paste filling up */}
            <motion.div
              animate={{ height: `${crushProgress * 0.65}%` }}
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: `linear-gradient(0deg, ${remedyColor}66, ${remedyColor}33)`,
                transition: 'background 0.5s',
              }}
            />

            {/* Ingredient emojis — shrink & blur as crushed */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', gap: '6px', pointerEvents: 'none' }}>
              {ingredients.map((ing, i) => (
                <motion.span key={i}
                  animate={{
                    scale: crushScale,
                    rotate: isActiveRef.current ? [-8, 8, -5, 5, 0] : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontSize: '1.8rem',
                    display: 'block',
                    filter: `blur(${crushBlur}px)`,
                    transformOrigin: 'center',
                  }}>
                  {ing.emoji}
                </motion.span>
              ))}
            </div>

            {/* Grinding streak lines */}
            {isActiveRef.current && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 0.3, repeat: Infinity }}
                style={{
                  position: 'absolute', top: '30%',
                  left: `${pestleX - 10}%`, width: '20%', height: '3px',
                  background: `linear-gradient(90deg, transparent, ${remedyColor}88, transparent)`,
                  borderRadius: '2px',
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Drag distance hint */}
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>
        {Math.round(Math.min(totalDistRef.current, TOTAL_PX) / 5)}px / 100px dragged
      </p>

      {/* Progress bar */}
      <div style={{ width: '240px' }}>
        <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
          <motion.div
            animate={{ width: `${crushProgress}%` }}
            style={{ height: '100%', borderRadius: '4px', background: remedyColor }}
          />
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', textAlign: 'center', marginTop: '6px' }}>
          {isDone ? '✅ Perfectly crushed!' : `Crushed: ${Math.round(crushProgress)}%`}
        </p>
      </div>

      {/* Science tip */}
      <div style={{
        padding: '12px 16px', borderRadius: '12px', maxWidth: '320px',
        background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)',
      }}>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, textAlign: 'center' }}>
          💡 <strong>Science tip:</strong> {tip}
        </p>
      </div>
    </div>
  )
}

// ─── StirBowl — rotation-tracking stir mechanic ──────────────────────────────
// Tracks the angle of cursor/finger around the bowl center.
// Every degree rotated (clockwise or CCW) accumulates toward 100%.
// 3 full circles (1080°) = 100% mixed.
function StirBowl({ remedyColor, stirProgress, onProgressChange, StepIndicator, totalDegNeeded }) {
  const bowlRef = useRef(null)
  const lastAngleRef = useRef(null)    // last recorded angle in degrees
  const totalRotRef = useRef(stirProgress * totalDegNeeded / 100) // resume from saved
  const isActiveRef = useRef(false)    // pointer is down / finger is touching

  function getAngle(clientX, clientY) {
    const rect = bowlRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = clientX - cx
    const dy = clientY - cy
    return Math.atan2(dy, dx) * (180 / Math.PI) // -180 to 180
  }

  function handleStart(clientX, clientY) {
    isActiveRef.current = true
    lastAngleRef.current = getAngle(clientX, clientY)
  }

  function handleMove(clientX, clientY) {
    if (!isActiveRef.current || lastAngleRef.current === null) return
    const newAngle = getAngle(clientX, clientY)
    let delta = newAngle - lastAngleRef.current
    // Wrap around -180/180 boundary
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    // Count absolute rotation (either direction)
    totalRotRef.current += Math.abs(delta)
    lastAngleRef.current = newAngle
    const pct = Math.min(100, (totalRotRef.current / totalDegNeeded) * 100)
    onProgressChange(pct)
  }

  function handleEnd() {
    isActiveRef.current = false
    lastAngleRef.current = null
  }

  // Pointer events (mouse + stylus)
  function onPointerDown(e) { e.currentTarget.setPointerCapture(e.pointerId); handleStart(e.clientX, e.clientY) }
  function onPointerMove(e) { handleMove(e.clientX, e.clientY) }
  function onPointerUp() { handleEnd() }

  // Touch events (mobile fallback)
  function onTouchStart(e) { const t = e.touches[0]; handleStart(t.clientX, t.clientY) }
  function onTouchMove(e) { e.preventDefault(); const t = e.touches[0]; handleMove(t.clientX, t.clientY) }
  function onTouchEnd() { handleEnd() }

  const isDone = stirProgress >= 100
  const rotationDeg = (totalRotRef.current / totalDegNeeded) * 360 * 3

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100dvh', padding: '72px 16px 100px', gap: '16px' }}>
      <StepIndicator />
      <p style={{ color: '#f5c842', fontWeight: 600, fontSize: '0.9rem' }}>
        {isDone ? '✅ Perfectly mixed!' : 'Move your finger in circles inside the bowl! 🌀'}
      </p>

      {/* Bowl */}
      <div
        ref={bowlRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          width: '220px', height: '220px', borderRadius: '50%', cursor: 'crosshair',
          background: `radial-gradient(circle at 40% 40%, ${remedyColor}44, ${remedyColor}22)`,
          border: `3px solid ${remedyColor}${isDone ? 'ff' : '66'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 ${isDone ? 60 : 30}px ${remedyColor}${isDone ? '55' : '22'}`,
          position: 'relative',
          touchAction: 'none',
          userSelect: 'none',
          transition: 'box-shadow 0.3s, border-color 0.3s',
        }}
      >
        {/* Swirl trail rings */}
        {stirProgress > 10 && (
          <div style={{
            position: 'absolute', inset: 12, borderRadius: '50%',
            border: `2px dashed ${remedyColor}33`,
            animation: 'spin 4s linear infinite',
          }} />
        )}
        {stirProgress > 40 && (
          <div style={{
            position: 'absolute', inset: 30, borderRadius: '50%',
            border: `2px dashed ${remedyColor}44`,
            animation: 'spin 2.5s linear infinite reverse',
          }} />
        )}
        {/* Spiral emoji rotating with actual rotation amount */}
        <motion.span
          animate={{ rotate: rotationDeg }}
          transition={{ type: 'tween', ease: 'linear', duration: 0 }}
          style={{ fontSize: '3.5rem', display: 'block', pointerEvents: 'none', userSelect: 'none' }}>
          🌀
        </motion.span>
        {/* Centre ripple when done */}
        {isDone && (
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }} animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute', width: 60, height: 60, borderRadius: '50%',
              background: remedyColor, pointerEvents: 'none',
            }} />
        )}
      </div>

      {/* Circles counter */}
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>
        {Math.min(3, Math.floor(totalRotRef.current / 360))} / 3 circles completed
      </p>

      {/* Progress bar */}
      <div style={{ width: '220px' }}>
        <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
          <motion.div
            animate={{ width: `${stirProgress}%` }}
            style={{ height: '100%', borderRadius: '4px', background: remedyColor }}
          />
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', textAlign: 'center', marginTop: '6px' }}>
          Mix: {Math.round(stirProgress)}%
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function Stage2_Prepare() {
  const { state, dispatch } = useGameState()
  const remedy = getRemedyByDay(state.currentDay)

  const allItems = useMemo(() => {
    const items = getAllIngredients(state.currentDay)
    return [...items].sort(() => Math.random() - 0.5)
  }, [state.currentDay])

  const [addedIngredients, setAddedIngredients] = useState([])
  const [phase, setPhase] = useState('select')
  const [bowlItems, setBowlItems] = useState([])
  const [stirProgress, setStirProgress] = useState(0)
  const [temperature, setTemperature] = useState(25)
  const [isHeating, setIsHeating] = useState(false)
  const [crushProgress, setCrushProgress] = useState(0)
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const heatInterval = useRef(null)
  const isDay7 = state.currentDay >= 7
  const needsCrush = state.currentDay >= 4 && state.currentDay !== 4  // Day 4 skips crush

  // Handle completion from any minigame
  const handleMinigameComplete = useCallback((selectedIds) => {
    setAddedIngredients(selectedIds)
    const items = allItems.filter(i => selectedIds.includes(i.id))
    setBowlItems(items)
    // Day 4 (Steam Therapy) skips crush/stir/heat — go straight to microscope
    if (state.currentDay === 4) {
      setTimeout(() => setPhase('microscope'), 1500)
      return
    }
    setTimeout(() => {
      setPhase(needsCrush ? 'crush' : 'stir')
    }, 1500)
  }, [allItems, needsCrush, state.currentDay])
  const isComplete = useMemo(() => {
    if (!remedy) return false
    return remedy.correctSet.every(id => addedIngredients.includes(id))
  }, [addedIngredients, remedy])

  // Watch for completion → crush (Days 4-7) or stir (Days 1-3)
  useEffect(() => {
    if (isComplete && phase === 'select') {
      setTimeout(() => setPhase(needsCrush ? 'crush' : 'stir'), 1000)
    }
  }, [isComplete, phase, needsCrush])

  // Crush complete → stir
  useEffect(() => {
    if (phase === 'crush' && crushProgress >= 100) {
      setTimeout(() => setPhase('stir'), 600)
    }
  }, [phase, crushProgress])

  // Stir complete → heat
  useEffect(() => {
    if (phase === 'stir' && stirProgress >= 100) {
      setTimeout(() => setPhase('heat'), 500)
    }
  }, [phase, stirProgress])

  // Heat complete → microscope when temperature enters target range
  useEffect(() => {
    if (phase === 'heat' && remedy && temperature >= remedy.targetTemp - 5) {
      setTimeout(() => setPhase('microscope'), 800)
    }
  }, [phase, temperature, remedy])

  // Heating interval
  useEffect(() => {
    if (isHeating && phase === 'heat') {
      heatInterval.current = setInterval(() => {
        setTemperature(t => Math.min(90, t + 1.2))
      }, 80)
    } else {
      if (heatInterval.current) clearInterval(heatInterval.current)
    }
    return () => { if (heatInterval.current) clearInterval(heatInterval.current) }
  }, [isHeating, phase])

  const tempLabel = temperature < 40 ? '❄️ Cold' : temperature < 65 ? '🌡️ Warm' : temperature < 85 ? '🔥 Hot' : '✨ Perfect!'

  // ─── Interactive Microscope Canvas ───
  const bacteriaRef = useRef([])
  const curRef = useRef([])
  const pointerRef = useRef({ x: -999, y: -999, active: false })
  const [bacteriaKilled, setBacteriaKilled] = useState(0)
  const TOTAL_BACTERIA = 12

  useEffect(() => {
    if (phase !== 'microscope' || !canvasRef.current || !remedy?.parmanu) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const pInfo = remedy.parmanu

    // Init enemies
    bacteriaRef.current = Array.from({ length: TOTAL_BACTERIA }, (_, i) => ({
      id: i,
      x: 60 + Math.random() * (W - 120),
      y: 60 + Math.random() * (H - 120),
      r: 12 + Math.random() * 8,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      alive: true,
      deathAlpha: 1,
      pulse: Math.random() * Math.PI * 2,
    }))

    // Init healers (follow pointer)
    curRef.current = Array.from({ length: 60 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 40,
      y: H / 2 + (Math.random() - 0.5) * 40,
      r: 3 + Math.random() * 3,
      ox: (Math.random() - 0.5) * 35, // orbit offset from pointer
      oy: (Math.random() - 0.5) * 35,
      glow: 0.6 + Math.random() * 0.4,
      color: pInfo.particleRole === 'convergence' 
        ? ['#FFD700','#00E676','#FF8F00','#40C4FF','#F9A825','#CE93D8'][Math.floor(Math.random()*6)]
        : pInfo.particleColor
    }))

    let frame = 0
    let killed = 0

    // Pointer event handlers
    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = W / rect.width, scaleY = H / rect.height
      const cx = (e.touches ? e.touches[0].clientX : e.clientX)
      const cy = (e.touches ? e.touches[0].clientY : e.clientY)
      pointerRef.current = { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY, active: true }
    }
    const handleLeave = () => { pointerRef.current.active = false }
    canvas.addEventListener('mousemove', handleMove)
    canvas.addEventListener('touchmove', handleMove, { passive: true })
    canvas.addEventListener('mouseleave', handleLeave)
    canvas.addEventListener('touchend', handleLeave)

    function draw() {
      frame++
      ctx.fillStyle = '#070d1a'
      ctx.fillRect(0, 0, W, H)

      // Vignette
      const vig = ctx.createRadialGradient(W/2, H/2, W*0.2, W/2, H/2, W*0.75)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(0,0,0,0.6)')
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H)

      // Enemies
      bacteriaRef.current.forEach(b => {
        if (!b.alive) {
          b.deathAlpha -= 0.05
          if (b.deathAlpha > 0) {
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 2, 0, Math.PI * 2)
            ctx.fillStyle = `${pInfo.targetColor}${Math.floor(b.deathAlpha * 128).toString(16).padStart(2,'0')}`; ctx.fill()
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 0.5, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255,255,255,${b.deathAlpha})`; ctx.fill()
          }
          return
        }
        b.pulse += 0.04
        b.x += b.vx; b.y += b.vy
        if (b.x < b.r || b.x > W - b.r) b.vx *= -1
        if (b.y < b.r || b.y > H - b.r) b.vy *= -1

        const pulseR = b.r + Math.sin(b.pulse) * 1.5
        const bg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, pulseR * 2.5)
        bg.addColorStop(0, `${pInfo.targetColor}88`)
        bg.addColorStop(1, `${pInfo.targetColor}00`)
        ctx.beginPath(); ctx.arc(b.x, b.y, pulseR * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = bg; ctx.fill()
        
        ctx.beginPath(); ctx.arc(b.x, b.y, pulseR, 0, Math.PI * 2)
        ctx.fillStyle = pInfo.targetColor; ctx.fill()
        
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.font = `bold ${Math.floor(pulseR)}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🦠', b.x, b.y)
      })

      // Healer particles
      const { x: px, y: py, active } = pointerRef.current
      curRef.current.forEach(c => {
        const tx = active ? px + c.ox : W / 2 + c.ox + Math.cos(frame * 0.01 + c.oy) * 30
        const ty = active ? py + c.oy : H / 2 + c.oy + Math.sin(frame * 0.01 + c.ox) * 30
        c.x += (tx - c.x) * 0.1
        c.y += (ty - c.y) * 0.1
        c.glow = 0.5 + Math.sin(frame * 0.04 + c.ox) * 0.4

        const cg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r * 4)
        cg.addColorStop(0, `${c.color}CC`)
        cg.addColorStop(1, `${c.color}00`)
        ctx.beginPath(); ctx.arc(c.x, c.y, c.r * 4, 0, Math.PI * 2)
        ctx.fillStyle = cg; ctx.fill()
        ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2)
        ctx.fillStyle = c.color; ctx.fill()

        // Collision check
        bacteriaRef.current.forEach(b => {
          if (!b.alive) return
          const dx = c.x - b.x, dy = c.y - b.y
          if (Math.sqrt(dx*dx + dy*dy) < b.r + c.r * 1.5) {
            b.alive = false
            killed++
            setBacteriaKilled(killed)
          }
        })
      })

      // Instructions
      if (!active && frame < 200) {
        ctx.fillStyle = `${pInfo.particleColor}${Math.floor((0.6 + Math.sin(frame * 0.08) * 0.3) * 255).toString(16).padStart(2,'0')}`
        ctx.font = 'bold 13px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`Guide ${pInfo.moleculeName} into the germs!`, W / 2, H - 20)
        ctx.textAlign = 'left'
      }

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousemove', handleMove)
      canvas.removeEventListener('touchmove', handleMove)
      canvas.removeEventListener('mouseleave', handleLeave)
      canvas.removeEventListener('touchend', handleLeave)
    }
  }, [phase, remedy])

  const allKilled = bacteriaKilled >= TOTAL_BACTERIA
  useEffect(() => {
    // Transition to cinematic phase when bacteria are defeated
    if (allKilled && phase === 'microscope') {
      setTimeout(() => setPhase('cinematic'), 800)
    }
  }, [allKilled, phase])

  // Dispatch unlock action when reaching the parmanu_unlock phase
  useEffect(() => {
    if (phase === 'parmanu_unlock' && remedy?.parmanu) {
      dispatch({ type: ACTIONS.UNLOCK_PARMANU, payload: remedy.parmanu.id })
    }
  }, [phase, remedy, dispatch])


  function handleContinueToHeal() {
    dispatch({ type: ACTIONS.SET_STAGE, payload: 3 })
  }

  if (!remedy) return null

  // Step indicator — adds Crush step for Days 4-7
  const steps = needsCrush
    ? [{ n: 1, label: 'Find' }, { n: 2, label: 'Crush' }, { n: 3, label: 'Stir' }, { n: 4, label: 'Heat' }]
    : [{ n: 1, label: 'Find' }, { n: 2, label: 'Stir' }, { n: 3, label: 'Heat' }]
  const stepNum = phase === 'select' ? 1 : phase === 'crush' ? 2 : phase === 'stir' ? (needsCrush ? 3 : 2) : phase === 'heat' ? (needsCrush ? 4 : 3) : 5

  const StepIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700,
            background: stepNum > s.n ? '#00C853' : stepNum === s.n ? remedy.color : 'rgba(255,255,255,0.1)',
            color: stepNum >= s.n ? 'white' : 'rgba(255,255,255,0.4)',
            border: `2px solid ${stepNum > s.n ? '#00C853' : stepNum === s.n ? remedy.color : 'rgba(255,255,255,0.15)'}`,
          }}>
            {stepNum > s.n ? '✓' : s.n}
          </div>
          <span style={{ fontSize: '0.7rem', color: stepNum >= s.n ? 'var(--color-text-primary)' : 'rgba(255,255,255,0.3)' }}>{s.label}</span>
          {i < steps.length - 1 && <span style={{ color: 'rgba(255,255,255,0.12)', margin: '0 2px' }}>—</span>}
        </div>
      ))}
    </div>
  )

  // ═══ CRUSH PHASE (Days 4-7) ═══
  if (phase === 'crush') {
    const crushIngredients = [
      { emoji: '🧄', label: 'Garlic' }, { emoji: '🫚', label: 'Ginger' },
      { emoji: '⚫', label: 'Pepper' },
    ].slice(0, state.currentDay >= 6 ? 3 : state.currentDay >= 5 ? 2 : 1)

    return (
      <GrindBowl
        remedyColor={remedy.color}
        crushProgress={crushProgress}
        onProgressChange={setCrushProgress}
        StepIndicator={StepIndicator}
        ingredients={crushIngredients}
        currentDay={state.currentDay}
      />
    )
  }

  if (phase === 'stir') {
    const TOTAL_DEG_NEEDED = 1080 // 3 full circles = 100%

    return (
      <StirBowl
        remedyColor={remedy.color}
        stirProgress={stirProgress}
        onProgressChange={setStirProgress}
        StepIndicator={StepIndicator}
        totalDegNeeded={TOTAL_DEG_NEEDED}
      />
    )
  }

  // ═══ HEAT PHASE — Thermometer + Boiling Pot ═══
  if (phase === 'heat') {
    const fillH = Math.max(0, ((temperature - 20) / 70) * 200)
    const tempColor = temperature < 50 ? '#40C4FF' : temperature < 75 ? '#FFB74D' : '#FF5722'
    const boilIntensity = Math.max(0, (temperature - 30) / 60) // 0 → 1 as temp 30→90°C
    const numBubbles = Math.floor(boilIntensity * 8) + (boilIntensity > 0 ? 2 : 0)
    const showSteam = temperature > 60
    const liquidColor = temperature < 50
      ? remedy.color + '88'
      : temperature < 75
        ? remedy.color + 'bb'
        : remedy.color + 'ee'
    const bubbleSpeed = Math.max(0.4, 1.8 - boilIntensity * 1.4) // faster as hotter

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100dvh', padding: '60px 16px 100px', gap: '10px' }}>
        <StepIndicator />
        <p style={{ color: '#f5c842', fontWeight: 600, fontSize: '0.9rem' }}>
          Hold the flame to heat! Find the sweet spot 🔥
        </p>
        <p style={{ color: tempColor, fontSize: '2rem', fontWeight: 800, transition: 'color 0.3s' }}>
          {Math.round(temperature)}°C
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{tempLabel}</p>

        {/* ── Side-by-side: Thermometer + Boiling Pot ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '32px', marginTop: '4px' }}>

          {/* Thermometer */}
          <div style={{ position: 'relative', width: '50px', height: '240px', flexShrink: 0 }}>
            {/* Tube */}
            <div style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              width: '28px', height: '200px', bottom: '20px',
              borderRadius: '14px', background: 'rgba(255,255,255,0.06)',
              border: '2px solid rgba(255,255,255,0.15)', overflow: 'hidden',
            }}>
              {/* Fill */}
              <motion.div
                animate={{ height: `${fillH}px` }}
                transition={{ type: 'tween', ease: 'linear', duration: 0.15 }}
                style={{
                  position: 'absolute', bottom: 0, width: '100%',
                  background: tempColor,
                  borderRadius: '0 0 12px 12px',
                  boxShadow: `0 0 10px ${tempColor}88`,
                  transition: 'background 0.3s',
                }}
              />
              {/* Target zone indicator */}
              <div style={{
                position: 'absolute',
                bottom: `${((remedy.targetTemp - 5 - 20) / 70) * 200}px`,
                height: `${(10 / 70) * 200}px`,
                width: '100%',
                background: 'rgba(0,200,83,0.2)',
                borderTop: '1px dashed rgba(0,200,83,0.7)',
                borderBottom: '1px dashed rgba(0,200,83,0.7)',
              }} />
              {/* Tick marks */}
              {[40, 60, 80].map(t => (
                <div key={t} style={{
                  position: 'absolute', bottom: `${((t - 20) / 70) * 200}px`,
                  width: '100%', height: '1px',
                  borderTop: '1px dashed rgba(255,255,255,0.2)',
                }} />
              ))}
            </div>
            {/* Bulb */}
            <motion.div
              animate={{ boxShadow: isHeating ? `0 0 20px ${tempColor}` : 'none' }}
              style={{
                position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '36px', height: '36px', borderRadius: '50%',
                background: tempColor, transition: 'background 0.3s',
              }}
            />
            {/* Temp labels */}
            <span style={{ position: 'absolute', right: '100%', bottom: `${((remedy.targetTemp - 20) / 70) * 200 + 14}px`,
              fontSize: '0.6rem', color: '#00C853', whiteSpace: 'nowrap', marginRight: '4px', fontWeight: 700 }}>
              🎯
            </span>
          </div>

          {/* Boiling Pot */}
          <div style={{ position: 'relative', width: '160px', flexShrink: 0 }}>
            {/* Steam wisps above pot */}
            <div style={{ position: 'relative', height: '80px', overflow: 'visible' }}>
              {showSteam && Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, opacity: 0.7, scaleX: 1 }}
                  animate={{ y: -70, opacity: 0, scaleX: [1, 1.4, 0.8, 1.2, 0] }}
                  transition={{
                    duration: bubbleSpeed * 1.8,
                    repeat: Infinity,
                    delay: i * (bubbleSpeed * 0.4),
                    ease: 'easeOut',
                  }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: `${20 + i * 28}px`,
                    width: '14px', height: '28px',
                    borderRadius: '50%',
                    background: `rgba(255,255,255,${0.08 + boilIntensity * 0.12})`,
                    filter: 'blur(4px)',
                  }}
                />
              ))}
            </div>

            {/* Pot body */}
            <div style={{
              position: 'relative',
              width: '160px', height: '130px',
              background: 'rgba(255,255,255,0.06)',
              border: `2px solid rgba(255,255,255,0.15)`,
              borderRadius: '0 0 28px 28px',
              borderTop: 'none',
              overflow: 'hidden',
            }}>
              {/* Liquid fill */}
              <motion.div
                animate={{ height: `${70 + boilIntensity * 20}px` }}
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: `linear-gradient(180deg, ${liquidColor} 0%, ${remedy.color}cc 100%)`,
                  transition: 'background 0.5s',
                  borderRadius: '0 0 26px 26px',
                }}
              >
                {/* Liquid surface wave */}
                <motion.div
                  animate={{ x: [0, -20, 0, 20, 0] }}
                  transition={{ duration: bubbleSpeed * 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', top: -8, left: -10, right: -10, height: '16px',
                    background: liquidColor,
                    borderRadius: '50%',
                  }}
                />

                {/* Bubbles rising inside liquid */}
                {Array.from({ length: numBubbles }).map((_, i) => {
                  const size = 6 + Math.random() * 10
                  return (
                    <motion.div
                      key={i}
                      initial={{ y: 0, opacity: 0.9 }}
                      animate={{ y: -(70 + boilIntensity * 20), opacity: [0.9, 0.7, 0] }}
                      transition={{
                        duration: bubbleSpeed + Math.random() * 0.4,
                        repeat: Infinity,
                        delay: i * (bubbleSpeed * 0.25),
                        ease: 'easeOut',
                      }}
                      style={{
                        position: 'absolute',
                        bottom: `${Math.random() * 20}px`,
                        left: `${10 + i * (130 / numBubbles)}px`,
                        width: `${size}px`, height: `${size}px`,
                        borderRadius: '50%',
                        background: `rgba(255,255,255,${0.3 + boilIntensity * 0.4})`,
                        border: '1px solid rgba(255,255,255,0.5)',
                        boxShadow: `0 0 4px rgba(255,255,255,0.3)`,
                      }}
                    />
                  )
                })}
              </motion.div>

              {/* Flame glow at bottom when heating */}
              {isHeating && (
                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '30px',
                    background: 'linear-gradient(0deg, rgba(255,109,0,0.5), transparent)',
                    borderRadius: '0 0 26px 26px',
                  }}
                />
              )}
            </div>

            {/* Pot rim */}
            <div style={{
              width: '176px', height: '14px', marginLeft: '-8px',
              background: 'rgba(255,255,255,0.12)',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              position: 'relative', zIndex: 2,
            }} />

            {/* Flame label */}
            {isHeating && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ textAlign: 'center', marginTop: '6px', fontSize: '1.4rem' }}>
                🔥🔥🔥
              </motion.div>
            )}
          </div>
        </div>

        {/* Ingredient icons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          {bowlItems.map(item => <span key={item.id} style={{ fontSize: '1.5rem' }}>{item.emoji}</span>)}
        </div>

        {/* Flame button */}
        <motion.button
          onMouseDown={() => setIsHeating(true)} onMouseUp={() => setIsHeating(false)} onMouseLeave={() => setIsHeating(false)}
          onTouchStart={() => setIsHeating(true)} onTouchEnd={() => setIsHeating(false)}
          whileTap={{ scale: 0.9 }}
          animate={{ boxShadow: isHeating ? '0 0 40px rgba(255,109,0,0.6)' : '0 0 0px transparent' }}
          style={{
            width: '80px', height: '80px', borderRadius: '50%', fontSize: '2.2rem',
            background: isHeating ? 'rgba(255,109,0,0.4)' : 'rgba(255,109,0,0.15)',
            border: `3px solid ${isHeating ? '#FF6D00' : 'rgba(255,109,0,0.3)'}`,
            cursor: 'pointer', transition: 'background 0.2s, border 0.2s',
          }}>
          🔥
        </motion.button>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>Hold the flame to heat!</p>
      </div>
    )
  }

  // ═══ MICROSCOPE PHASE ═══
  if (phase === 'microscope' || phase === 'cinematic' || phase === 'parmanu_unlock') {
    const isCinematic = phase === 'cinematic'
    const isUnlocked = phase === 'parmanu_unlock'

    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100dvh', padding: '24px', gap: '12px',
        background: 'linear-gradient(180deg, rgba(7,13,26,0.8) 0%, rgba(0,0,0,0.95) 100%)',
        position: 'relative',
      }}>
        <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="font-heading"
          style={{ color: remedy.parmanu.color, fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', textAlign: 'center' }}>
          {remedy.parmanu.emoji} {remedy.parmanu.moleculeName} at work!
        </motion.h2>



        {/* Kill counter HUD */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', maxWidth: 600 }}>
          <div style={{ display: 'flex', align: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem' }}>🦠</span>
            <span style={{ color: remedy.parmanu.targetColor, fontWeight: 700, fontSize: '0.9rem' }}>
              {TOTAL_BACTERIA - bacteriaKilled} remaining
            </span>
          </div>
          <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)' }}>
            <motion.div
              animate={{ width: `${(bacteriaKilled / TOTAL_BACTERIA) * 100}%` }}
              style={{ height: '100%', borderRadius: '3px', background: remedy.parmanu.color }}
            />
          </div>
          <span style={{ color: remedy.parmanu.color, fontWeight: 700, fontSize: '0.9rem' }}>
            {bacteriaKilled}/{TOTAL_BACTERIA} 💥
          </span>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            width: '100%', maxWidth: '1100px', height: '540px',
            borderRadius: '16px', overflow: 'hidden',
            position: 'relative',
            display: 'flex'
          }}>
          {/* Only render interactive canvas during microscope phase */}
          {phase === 'microscope' && (
            <canvas ref={canvasRef} width={1100} height={540}
              style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }} />
          )}
          
          {/* Cinematic Animation Layer */}
          <AnimatePresence>
            {isCinematic && (
              <MolecularCinematics 
                day={state.currentDay} 
                onComplete={() => setPhase('parmanu_unlock')} 
              />
            )}
          </AnimatePresence>

          {/* Parmanu Unlocked Overlay */}
          <AnimatePresence>
            {isUnlocked && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                  padding: '24px', textAlign: 'center', zIndex: 100,
                }}>
                <motion.div
                  initial={{ scale: 0.5, y: 20 }} animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                  style={{
                    background: `linear-gradient(145deg, rgba(13,27,42,0.9), rgba(20,10,35,0.95))`,
                    border: `1.5px solid ${remedy.parmanu.color}`,
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: `0 0 40px ${remedy.parmanu.color}55`,
                    maxWidth: '400px'
                  }}
                >
                  <p style={{ fontSize: '3rem', margin: '0 0 12px 0', filter: `drop-shadow(0 0 10px ${remedy.parmanu.color})` }}>
                    {remedy.parmanu.emoji}
                  </p>
                  <p style={{ color: remedy.parmanu.color, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '4px' }}>
                    PARMANU UNLOCKED
                  </p>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.6rem', color: 'white' }}>
                    {remedy.parmanu.moleculeName}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '16px', fontStyle: 'italic' }}>
                    {remedy.parmanu.sanskritName}
                  </p>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
                    {remedy.parmanu.atomicAction}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem', textAlign: 'center', maxWidth: 400 }}>
          {phase === 'microscope' && `Use your finger to guide the ${remedy.parmanu.moleculeName} molecules into the germs!`}
          {isCinematic && 'Watch the molecular science unfold...'}
          {isUnlocked && '🎉 Brilliant science!'}
        </p>

        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: allKilled ? 0.3 : 3 }} className="btn-primary"
          onClick={handleContinueToHeal}
          style={{ padding: '14px 36px', fontSize: '1rem', marginTop: '4px' }}>
          {allKilled ? '🏆 Give Remedy to Arjun!' : 'Skip to Healing →'}
        </motion.button>
      </div>
    )
  }


  // ═══ DONE PHASE ═══
  if (phase === 'done') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: '24px' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉✨🎊</p>
          <h3 className="font-heading" style={{ color: remedy.color }}>{remedy.name} is Ready!</h3>
          <button className="btn-primary" onClick={handleContinueToHeal} style={{ marginTop: '24px' }}>
            Continue to Healing →
          </button>
        </motion.div>
      </div>
    )
  }

  // ═══ ROUTER — Unified Selection ═══
  function renderMinigame() {
    if (state.currentDay === 4) {
      return <Day4_SteamSetup remedy={remedy} onComplete={handleMinigameComplete} />
    }
    return <Day1_Alchemy remedy={remedy} onComplete={handleMinigameComplete} />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        minHeight: '100dvh', padding: '72px 16px 100px', gap: '20px',
      }}>
      {/* Title */}
      <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="font-heading"
        style={{ color: remedy.color, textAlign: 'center', fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', marginBottom: 8 }}>
        {remedy.icon} Prepare {remedy.name}
      </motion.h2>

      {/* Render the specific minigame for this day */}
      {renderMinigame()}



      {/* Success overlay */}
      <AnimatePresence>
        {isComplete && phase === 'select' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
            }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              style={{ textAlign: 'center', padding: '32px', borderRadius: '24px', background: 'rgba(13,27,42,0.95)', border: `2px solid ${remedy.color}66` }}>
              <p style={{ fontSize: '3rem', marginBottom: '8px' }}>🎉✨</p>
              <h3 className="font-heading" style={{ color: remedy.color, fontSize: '1.4rem' }}>
                Perfect Mix!
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                Entering microscopic world...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
