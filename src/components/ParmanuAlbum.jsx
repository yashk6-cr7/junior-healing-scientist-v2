/**
 * ParmanuAlbum.jsx — The Molecular Trading Card Collection
 * ─────────────────────────────────────────────────────────
 * A popup modal that shows all 7 Parmanu (atom/molecule) cards.
 * 
 * LOCKED cards:  Shown as glowing silhouettes with "???" labels.
 * UNLOCKED cards: Show the full trading card — molecule name, Sanskrit
 *                 name, what it does at the atomic level, and a live
 *                 canvas mini-animation showing the molecule in action.
 * 
 * Design: Ancient Sanskrit manuscript meets modern chemistry card.
 * 
 * Props:
 *   isOpen         {boolean}   — whether the album modal is visible
 *   onClose        {function}  — called when user closes the modal
 *   unlockedIds    {string[]}  — array of molecule IDs the player has collected
 *   highlightId    {string}    — if set, scroll to and spotlight this card (used after unlock)
 */

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { REMEDIES } from '../data/remedies'

// ─── All 7 parmanu in order ───────────────────────────────────────────────────
// We pull from the remedies data file so there's a single source of truth.
const ALL_PARMANUS = REMEDIES.map(r => r.parmanu).filter(Boolean)

// ─── Mini canvas animation — draws molecule-specific particle effect ──────────
// Each `particleRole` gets a different visual story:
//   'blocker'     — golden spheres home in and lock onto red receptor spots
//   'shield'      — green particles spiral outward coating the cell wall
//   'driller'     — orange particles spin into bacteria walls and burst them
//   'sweeper'     — cyan particles rise upward clearing grey mucus dots
//   'vortex'      — three streams spiral together into one convergent beam
//   'amplifier'   — purple particles latch onto gold and make them brighter
//   'convergence' — all six colors merge into one golden super-stream
function MoleculeCanvas({ parmanu, size = 160 }) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    let frame = 0

    // ── Build particle systems per role ──────────────────────────────────
    // Each particle is a plain JS object — no React state, direct mutation is fine here.
    const healers  = []   // the hero molecules (player's compound)
    const enemies  = []   // what they fight (bacteria / receptor sites / mucus)

    // Generic healer factory
    function makeHealer(overrides = {}) {
      return {
        x: W * 0.1 + Math.random() * W * 0.3,
        y: H * 0.1 + Math.random() * H * 0.8,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r: 3 + Math.random() * 3,
        angle: Math.random() * Math.PI * 2,
        alive: true,
        ...overrides,
      }
    }

    // Generic enemy factory
    function makeEnemy(overrides = {}) {
      return {
        x: W * 0.55 + Math.random() * W * 0.4,
        y: H * 0.1 + Math.random() * H * 0.8,
        r: 8 + Math.random() * 6,
        pulse: Math.random() * Math.PI * 2,
        alive: true,
        deathTimer: 0,
        ...overrides,
      }
    }

    const role = parmanu.particleRole

    // Spawn enemies (things the molecule attacks)
    for (let i = 0; i < 5; i++) enemies.push(makeEnemy())

    // Spawn healers (the molecule particles)
    const healerCount = role === 'convergence' ? 30 : 15
    for (let i = 0; i < healerCount; i++) {
      healers.push(makeHealer({
        // For convergence mode, spawn in 6 different colors
        color: role === 'convergence'
          ? ['#FFD700','#00E676','#FF8F00','#40C4FF','#F9A825','#CE93D8'][i % 6]
          : parmanu.particleColor,
      }))
    }

    // ── Draw loop ────────────────────────────────────────────────────────
    function draw() {
      frame++
      // Clear with dark background
      ctx.fillStyle = '#070d1a'
      ctx.fillRect(0, 0, W, H)

      // Draw enemies first (behind healers)
      enemies.forEach((e, ei) => {
        if (!e.alive) {
          // Death burst effect
          e.deathTimer++
          if (e.deathTimer < 20) {
            ctx.beginPath()
            ctx.arc(e.x, e.y, e.deathTimer * 2, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255, 100, 0, ${0.6 - e.deathTimer * 0.03})`
            ctx.fill()
          }
          return
        }
        e.pulse += 0.05
        const pr = e.r + Math.sin(e.pulse) * 1.5

        // Glow ring around enemy
        const grd = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, pr * 2.5)
        grd.addColorStop(0, parmanu.targetColor + 'AA')
        grd.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.beginPath()
        ctx.arc(e.x, e.y, pr * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        // Enemy body
        ctx.beginPath()
        ctx.arc(e.x, e.y, pr, 0, Math.PI * 2)
        ctx.fillStyle = parmanu.targetColor
        ctx.fill()

        // Enemy label
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.font = `bold ${Math.floor(pr * 0.9)}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(ei % 2 === 0 ? '🦠' : '⚡', e.x, e.y)
      })

      // Draw and move healer particles
      healers.forEach((h, hi) => {
        if (!h.alive) return
        h.angle += 0.04

        // ── Movement logic per role ──────────────────────────────
        if (role === 'blocker') {
          // Home toward nearest alive enemy
          const target = enemies.find(e => e.alive)
          if (target) {
            const dx = target.x - h.x
            const dy = target.y - h.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            h.vx += (dx / dist) * 0.15
            h.vy += (dy / dist) * 0.15
          }
          h.vx *= 0.9; h.vy *= 0.9
        } else if (role === 'shield') {
          // Spiral outward from centre
          const cx = W * 0.5, cy = H * 0.5
          const spiralAngle = (hi / healers.length) * Math.PI * 2 + frame * 0.03
          const spiralR = 20 + (frame * 0.3 + hi * 4) % (W * 0.45)
          h.x += ((cx + Math.cos(spiralAngle) * spiralR) - h.x) * 0.05
          h.y += ((cy + Math.sin(spiralAngle) * spiralR) - h.y) * 0.05
        } else if (role === 'driller') {
          // Spin and home toward enemy
          const target = enemies.find(e => e.alive)
          if (target) {
            const dx = target.x - h.x, dy = target.y - h.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            h.vx += (dx / dist) * 0.2 + Math.cos(h.angle) * 0.3
            h.vy += (dy / dist) * 0.2 + Math.sin(h.angle) * 0.3
          }
          h.vx *= 0.85; h.vy *= 0.85
        } else if (role === 'sweeper') {
          // Rise upward, slight sway
          h.vy -= 0.06
          h.vx += Math.sin(frame * 0.04 + hi) * 0.04
          if (h.y < -10) { h.y = H + 10; h.x = W * 0.2 + Math.random() * W * 0.6 }
        } else if (role === 'vortex') {
          // Three streams, each 120° apart, spiralling toward enemy centre
          const streamAngle = (hi % 3) * (Math.PI * 2 / 3) + frame * 0.04
          const target = enemies[0] || { x: W * 0.75, y: H * 0.5 }
          const dx = target.x - h.x, dy = target.y - h.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          h.vx += (dx / dist) * 0.15 + Math.cos(streamAngle) * 0.3
          h.vy += (dy / dist) * 0.15 + Math.sin(streamAngle) * 0.3
          h.vx *= 0.88; h.vy *= 0.88
        } else if (role === 'amplifier') {
          // Latch onto enemy, making it glow gold (enemy = curcumin here)
          const target = enemies[Math.floor(hi / 3)] || enemies[0]
          if (target && target.alive) {
            const dx = target.x - h.x, dy = target.y - h.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            h.vx += (dx / dist) * 0.12
            h.vy += (dy / dist) * 0.12
          }
          h.vx *= 0.88; h.vy *= 0.88
        } else if (role === 'convergence') {
          // All stream toward the very centre
          const cx = W * 0.6, cy = H * 0.5
          const dx = cx - h.x, dy = cy - h.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          h.vx += (dx / dist) * 0.18
          h.vy += (dy / dist) * 0.18
          h.vx *= 0.88; h.vy *= 0.88
        } else {
          h.vx += (Math.random() - 0.5) * 0.1
          h.vy += (Math.random() - 0.5) * 0.1
          h.vx *= 0.92; h.vy *= 0.92
        }

        h.x += h.vx; h.y += h.vy
        // Wrap edges
        if (h.x < -5) h.x = W + 5
        if (h.x > W + 5) h.x = -5
        if (h.y < -5 && role !== 'sweeper') h.y = H + 5
        if (h.y > H + 5) h.y = -5

        // ── Collision check with enemies ─────────────────────────
        enemies.forEach(e => {
          if (!e.alive) return
          const dx = h.x - e.x, dy = h.y - e.y
          if (Math.sqrt(dx * dx + dy * dy) < e.r + h.r) {
            e.alive = false
            // Respawn enemy after a delay using setTimeout
            setTimeout(() => {
              e.x = W * 0.55 + Math.random() * W * 0.4
              e.y = H * 0.1 + Math.random() * H * 0.8
              e.alive = true
              e.deathTimer = 0
            }, 1200)
          }
        })

        // ── Draw healer particle ──────────────────────────────────
        const glow = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.r * 4)
        glow.addColorStop(0, h.color + 'CC')
        glow.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.beginPath()
        ctx.arc(h.x, h.y, h.r * 4, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        ctx.beginPath()
        ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2)
        ctx.fillStyle = h.color
        ctx.fill()
      })

      // Draw dividing line between healer spawn zone and enemy zone
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 8])
      ctx.beginPath()
      ctx.moveTo(W * 0.5, 0)
      ctx.lineTo(W * 0.5, H)
      ctx.stroke()
      ctx.setLineDash([])

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [parmanu])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: '100%', height: `${size}px`, borderRadius: '10px', display: 'block' }}
    />
  )
}

// ─── Single Trading Card ─────────────────────────────────────────────────────
// locked  = silhouette (blur + ???)
// unlocked = full card with canvas animation
function ParmanuCard({ parmanu, isUnlocked, isHighlighted, index }) {
  const [isFlipped, setIsFlipped] = useState(false)

  // Auto-flip highlighted card to show back first
  useEffect(() => {
    if (isHighlighted && isUnlocked) {
      setIsFlipped(true)
      const t = setTimeout(() => setIsFlipped(false), 2000)
      return () => clearTimeout(t)
    }
  }, [isHighlighted, isUnlocked])

  if (!isUnlocked) {
    // ── Locked card: mysterious silhouette ──
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06 }}
        style={{
          width: '100%',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.03)',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          minHeight: '180px',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Mysterious shimmer */}
        <motion.div
          animate={{ x: ['−100%', '200%'] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.4, ease: 'linear' }}
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
            pointerEvents: 'none',
          }}
        />
        <span style={{ fontSize: '2rem', filter: 'grayscale(1) brightness(0.3)' }}>🧬</span>
        <span style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.2)', fontWeight: 900, letterSpacing: '0.3em' }}>???</span>
        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
          Complete Day {index + 1} to unlock
        </span>
        <div style={{
          marginTop: '6px',
          fontSize: '0.6rem',
          padding: '3px 10px',
          borderRadius: '999px',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.2)',
        }}>🔒 Locked</div>
      </motion.div>
    )
  }

  // ── Unlocked card ──
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, type: 'spring', damping: 14 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={() => setIsFlipped(f => !f)}
      style={{
        width: '100%',
        borderRadius: '16px',
        border: `1.5px solid ${parmanu.color}55`,
        background: `linear-gradient(145deg, rgba(13,27,42,0.95), rgba(20,10,35,0.98))`,
        boxShadow: isHighlighted
          ? `0 0 30px ${parmanu.color}66, 0 0 60px ${parmanu.color}33`
          : `0 0 12px ${parmanu.color}22`,
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s',
        minHeight: '260px',
        position: 'relative',
      }}
    >
      {/* Card header — always visible */}
      <div style={{
        padding: '10px 12px 8px',
        background: `linear-gradient(135deg, ${parmanu.color}22, transparent)`,
        borderBottom: `1px solid ${parmanu.color}22`,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: '1.5rem' }}>{parmanu.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: parmanu.color, lineHeight: 1.1 }}>
            {parmanu.moleculeName}
          </div>
          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>
            {parmanu.sanskritName}
          </div>
        </div>
        <span style={{
          fontSize: '0.55rem',
          color: 'rgba(255,255,255,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '999px',
          padding: '2px 6px',
        }}>✨ UNLOCKED</span>
      </div>

      {/* Flip front: Live mini canvas animation */}
      <AnimatePresence mode="wait">
        {!isFlipped ? (
          <motion.div
            key="front"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ padding: '10px', flex: 1 }}
          >
            {/* Live canvas animation */}
            <MoleculeCanvas parmanu={parmanu} size={130} />
            {/* Short atomic action text */}
            <p style={{
              fontSize: '0.62rem',
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center',
              marginTop: '8px',
              lineHeight: 1.4,
              padding: '0 4px',
            }}>
              {parmanu.kidsExplanation}
            </p>
            <p style={{
              fontSize: '0.5rem',
              color: 'rgba(255,255,255,0.2)',
              textAlign: 'center',
              marginTop: '4px',
            }}>Tap to see science →</p>
          </motion.div>
        ) : (
          /* Flip back: Science detail */
          <motion.div
            key="back"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            {/* Source ingredient badge */}
            <div style={{
              fontSize: '0.6rem',
              padding: '3px 10px',
              borderRadius: '999px',
              background: parmanu.color + '22',
              border: `1px solid ${parmanu.color}55`,
              color: parmanu.color,
              textAlign: 'center',
              fontWeight: 600,
            }}>
              From: {parmanu.sourceIngredient}
            </div>

            {/* Atomic action */}
            <div>
              <p style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>
                ⚛️ Atomic Action
              </p>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-text-primary, white)', lineHeight: 1.5 }}>
                {parmanu.atomicAction}
              </p>
            </div>

            {/* Science fact */}
            <div style={{
              padding: '8px 10px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              marginTop: 'auto',
            }}>
              <p style={{ fontSize: '0.56rem', color: parmanu.color, fontWeight: 700, marginBottom: '3px' }}>
                🔬 Science Fact
              </p>
              <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                {parmanu.scienceFact}
              </p>
            </div>
            <p style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
              Tap to see animation ←
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Album Modal ────────────────────────────────────────────────────────
export default function ParmanuAlbum({ isOpen, onClose, unlockedIds = [], highlightId = null }) {
  const unlockedCount = unlockedIds.length

  return (
    <AnimatePresence>
      {isOpen && (
        // ── Backdrop ──
        <motion.div
          key="parmanu-album-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-end',  // slide up from bottom like a sheet
            justifyContent: 'center',
          }}
        >
          {/* ── Sheet panel ── */}
          <motion.div
            key="parmanu-album-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 22, stiffness: 200 }}
            onClick={e => e.stopPropagation()}  // don't close when clicking inside
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '88dvh',
              background: 'linear-gradient(180deg, #0d1b2e 0%, #0a0d1a 100%)',
              borderRadius: '24px 24px 0 0',
              border: '1px solid rgba(255,255,255,0.08)',
              borderBottom: 'none',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* ── Header ── */}
            <div style={{
              padding: '16px 20px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexShrink: 0,
            }}>
              {/* Drag handle */}
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '36px',
                height: '4px',
                borderRadius: '2px',
                background: 'rgba(255,255,255,0.12)',
              }} />

              <div>
                <h2 style={{
                  fontFamily: 'var(--font-heading, serif)',
                  color: '#FFD700',
                  fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                  margin: 0,
                }}>⚛️ Parmanu Collection</h2>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
                  {unlockedCount}/{ALL_PARMANUS.length} molecules unlocked
                </p>
              </div>

              {/* Progress dots */}
              <div style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
                {ALL_PARMANUS.map((p, i) => (
                  <motion.div
                    key={p.id}
                    animate={{
                      background: unlockedIds.includes(p.id) ? p.color : 'rgba(255,255,255,0.1)',
                      boxShadow: unlockedIds.includes(p.id) ? `0 0 6px ${p.color}` : 'none',
                    }}
                    style={{ width: 8, height: 8, borderRadius: '50%' }}
                  />
                ))}
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                style={{
                  width: 30, height: 30,
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >×</button>
            </div>

            {/* ── Intro text (Acharya Kanad quote) ── */}
            <div style={{
              padding: '10px 20px',
              background: 'rgba(255,215,0,0.04)',
              borderBottom: '1px solid rgba(255,215,0,0.08)',
              flexShrink: 0,
            }}>
              <p style={{ fontSize: '0.66rem', color: 'rgba(255,215,0,0.6)', textAlign: 'center', fontStyle: 'italic', margin: 0 }}>
                "In the smallest particle lies the secret of the universe." — Acharya Kanad, 6th century BCE
              </p>
            </div>

            {/* ── Card grid ── */}
            <div style={{
              overflowY: 'auto',
              flex: 1,
              padding: '16px 16px 32px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              alignContent: 'start',
            }}>
              {ALL_PARMANUS.map((parmanu, index) => (
                <ParmanuCard
                  key={parmanu.id}
                  parmanu={parmanu}
                  isUnlocked={unlockedIds.includes(parmanu.id)}
                  isHighlighted={highlightId === parmanu.id}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
