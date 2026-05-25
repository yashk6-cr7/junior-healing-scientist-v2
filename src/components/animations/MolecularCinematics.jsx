/**
 * MolecularCinematics.jsx  — v3.0 ULTRA
 *
 * 3000+ line, 4-phase, 7-second-per-phase, fully-labelled biological
 * animations for 6-12 year olds. Every molecule is named on-screen,
 * every action has a speech-bubble, every scene has annotated arrows.
 *
 * Tech: Framer Motion (animate arrays), SVG, React hooks.
 * No user interaction — pure award-winning cinematic science storytelling.
 */

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
const W = 800
const H = 560
const PHASE_MS = 7000   // 7 seconds per phase — slow enough to read everything

// ═══════════════════════════════════════════════════════════════════════════
// SHARED ATOMS
// ═══════════════════════════════════════════════════════════════════════════

/** Arrow-head SVG marker definitions — include once per SVG via <defs> */
function ArrowDefs({ id = 'arr', color = 'white' }) {
  return (
    <marker id={id} markerWidth="10" markerHeight="7"
      refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill={color} />
    </marker>
  )
}

/** Annotated arrow from (x1,y1) → (x2,y2) with label */
function Arrow({ x1, y1, x2, y2, label = '', color = 'rgba(255,255,255,0.7)',
  markerId = 'arr', delay = 0, fontSize = 11 }) {
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}>
      <motion.line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth={1.8} strokeDasharray="5 3"
        markerEnd={`url(#${markerId})`}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ delay, duration: 0.6 }}
      />
      {label && (
        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6}
          fill={color} fontSize={fontSize} textAnchor="middle" fontStyle="italic">
          {label}
        </text>
      )}
    </motion.g>
  )
}

/** Speech bubble with text */
function Bubble({ x, y, width = 160, text, color = '#FFD700', delay = 0, subtext = '' }) {
  const lineH = 18
  const lines = typeof text === 'string' ? [text] : text
  const h = 24 + lines.length * lineH + (subtext ? 20 : 0)
  return (
    <motion.g initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
      style={{ transformOrigin: `${x}px ${y}px` }}
      transition={{ delay, type: 'spring', stiffness: 160, damping: 14 }}>
      <rect x={x - width / 2} y={y - h / 2} width={width} height={h}
        rx={12} fill="rgba(0,0,0,0.88)" stroke={color} strokeWidth={1.8} />
      {/* Pointer triangle */}
      <polygon points={`${x - 8},${y + h / 2}  ${x + 8},${y + h / 2}  ${x},${y + h / 2 + 14}`}
        fill="rgba(0,0,0,0.88)" stroke={color} strokeWidth={1.8} />
      {lines.map((line, i) => (
        <text key={i} x={x} y={y - h / 2 + 20 + i * lineH}
          fill="white" fontSize={12.5} textAnchor="middle"
          fontWeight={i === 0 ? 700 : 400}>{line}</text>
      ))}
      {subtext && (
        <text x={x} y={y + h / 2 - 8} fill={color} fontSize={11}
          textAnchor="middle" fontStyle="italic">{subtext}</text>
      )}
    </motion.g>
  )
}

/** Molecule badge: coloured circle + symbol + name label */
function Molecule({ cx, cy, r = 26, color, symbol, name, delay = 0,
  glowColor, initialX, initialY, targetX, targetY, showTrail = false }) {
  const gid = `mg-${name.replace(/\s/g, '')}`
  const hasMotion = targetX !== undefined
  return (
    <motion.g
      initial={hasMotion ? { x: (initialX || 0) - cx, y: (initialY || 0) - cy, opacity: 0, scale: 0.4 }
        : { opacity: 0, scale: 0.4 }}
      animate={hasMotion ? { x: 0, y: 0, opacity: 1, scale: 1 }
        : { opacity: 1, scale: 1 }}
      transition={{ delay, duration: 1.8, ease: 'easeInOut' }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      {/* Glow aura */}
      <motion.circle cx={cx} cy={cy} r={r + 12}
        fill={glowColor || color} opacity={0.2}
        animate={{ r: [r + 10, r + 20, r + 10], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      />
      {/* Body */}
      <circle cx={cx} cy={cy} r={r} fill={color} />
      <circle cx={cx} cy={cy} r={r - 4} fill="rgba(255,255,255,0.12)" />
      {/* Symbol */}
      <text x={cx} y={cy + 7} fontSize={symbol.length > 2 ? 16 : 20}
        textAnchor="middle" fill="white" fontWeight="bold">{symbol}</text>
      {/* Name label */}
      <text x={cx} y={cy + r + 16} fontSize={11.5} textAnchor="middle"
        fill="rgba(255,255,255,0.85)" fontWeight={600}>{name}</text>
      {/* Trail dots */}
      {showTrail && [1, 2, 3].map(i => (
        <motion.circle key={i} cx={cx - i * 22} cy={cy} r={r / (i + 1)}
          fill={color}
          animate={{ opacity: [0.5 / i, 0.1 / i, 0.5 / i] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </motion.g>
  )
}

/** Pulsating ring emitted from a cell */
function PulseRing({ cx, cy, r, color, delay = 0, strokeWidth = 3 }) {
  return (
    <motion.circle cx={cx} cy={cy}
      initial={{ r, opacity: 0.9, strokeWidth }}
      animate={{ r: r + 50, opacity: 0 }}
      transition={{ delay, duration: 2.2, repeat: Infinity, repeatDelay: 0.4 }}
      fill="none" stroke={color} strokeWidth={strokeWidth}
    />
  )
}

/** Generic dark background gradient */
function BG({ id, c1, c2, cx = '50%', cy = '55%' }) {
  return (
    <radialGradient id={id} cx={cx} cy={cy} r="70%">
      <stop offset="0%" stopColor={c1} />
      <stop offset="100%" stopColor={c2} />
    </radialGradient>
  )
}

/** Floating ambient dots */
function Ambient({ n = 24, color, seed = 0 }) {
  const pts = Array.from({ length: n }, (_, i) => ({
    x: ((i * 137.5 + seed) % W),
    y: ((i * 97.3 + seed * 2) % H),
    r: 2 + (i % 4),
    d: 2.5 + (i % 5),
    dl: (i * 0.18) % 3,
  }))
  return (
    <g>
      {pts.map((p, i) => (
        <motion.circle key={i} cx={p.x} cy={p.y} r={p.r}
          fill={color}
          animate={{ opacity: [0, 0.45, 0], y: [p.y, p.y - 70, p.y - 140], scale: [0, 1, 0] }}
          transition={{ delay: p.dl, duration: p.d, repeat: Infinity, repeatDelay: p.dl * 0.5 }}
        />
      ))}
    </g>
  )
}

/** Glowing filter definition */
function GlowFilter({ id, blur = 5, color }) {
  return (
    <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={blur} result="coloredBlur" />
      <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  )
}

/** Section header label in SVG */
function SVGLabel({ x, y, text, color = 'rgba(255,255,255,0.35)', fontSize = 10.5, delay = 0 }) {
  return (
    <motion.text x={x} y={y} fill={color} fontSize={fontSize} textAnchor="middle"
      fontWeight={700} letterSpacing="0.12em" textTransform="uppercase"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}>
      {text}
    </motion.text>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// DAY 1 ─ HALDI MILK
// Phases: Blood vessel → Liver scissors → Piperine blocks → Curcumin docks
// ═══════════════════════════════════════════════════════════════════════════
function Day1_Animation({ phase }) {
  // ── blood cells path through vessel
  const bcells = Array.from({ length: 8 }, (_, i) => ({ id: i, delay: i * 0.5 }))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs>
        <BG id="bg1" c1="#0D1B2A" c2="#040C14" />
        <GlowFilter id="gld" blur={6} />
        <GlowFilter id="purp" blur={5} />
        <GlowFilter id="red" blur={4} />
        <linearGradient id="vessel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(183,28,28,0.35)" />
          <stop offset="50%" stopColor="rgba(198,40,40,0.55)" />
          <stop offset="100%" stopColor="rgba(183,28,28,0.35)" />
        </linearGradient>
        <ArrowDefs id="a1" color="rgba(255,255,255,0.7)" />
        <ArrowDefs id="agold" color="#FFD700" />
        <ArrowDefs id="agreen" color="#4CAF50" />
      </defs>
      <rect width={W} height={H} fill="url(#bg1)" />
      <Ambient n={22} color="#1565C0" seed={1} />

      {/* ══ BLOOD VESSEL (runs horizontally through scene) ══ */}
      <path d={`M 0 ${H * 0.5} Q 200 ${H * 0.48} 400 ${H * 0.5} Q 600 ${H * 0.52} ${W} ${H * 0.5}`}
        fill="url(#vessel)" strokeWidth={80}
        stroke="rgba(183,28,28,0.25)"
      />
      {/* Vessel walls */}
      <path d={`M 0 ${H * 0.46} Q 200 ${H * 0.44} 400 ${H * 0.46} Q 600 ${H * 0.48} ${W} ${H * 0.46}`}
        fill="none" stroke="rgba(239,83,80,0.4)" strokeWidth={3} />
      <path d={`M 0 ${H * 0.54} Q 200 ${H * 0.52} 400 ${H * 0.54} Q 600 ${H * 0.56} ${W} ${H * 0.54}`}
        fill="none" stroke="rgba(239,83,80,0.4)" strokeWidth={3} />

      <SVGLabel x={400} y={H * 0.38} text="BLOOD VESSEL" color="rgba(239,83,80,0.5)" fontSize={11} delay={0.3} />

      {/* Flowing red blood cells */}
      {bcells.map(c => (
        <motion.g key={c.id}
          initial={{ x: -60, y: H * 0.5 }}
          animate={{ x: W + 60 }}
          transition={{ delay: c.delay, duration: 5, repeat: Infinity, ease: 'linear' }}
        >
          <ellipse cx={0} cy={0} rx={20} ry={12} fill="#EF5350" opacity={0.8} />
          <ellipse cx={0} cy={0} rx={10} ry={6} fill="#B71C1C" opacity={0.5} />
        </motion.g>
      ))}

      {/* ══ LIVER (left region) ══ */}
      <motion.g initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 1 }}>
        <ellipse cx={140} cy={220} rx={110} ry={90}
          fill="rgba(121,85,72,0.35)" stroke="#A1887F" strokeWidth={2.5} />
        <text x={140} y={200} fill="#BCAAA4" fontSize={13} textAnchor="middle" fontWeight={700}>LIVER</text>
        <text x={140} y={218} fill="rgba(255,255,255,0.5)" fontSize={10} textAnchor="middle">checkpoint</text>

        {/* Scissors enzymes inside liver */}
        {[0, 1].map(i => (
          <motion.g key={i}
            style={{ transformOrigin: `${105 + i * 70}px ${240}px` }}
            animate={phase === 1 || phase === 2
              ? { rotate: [0, 20, -20, 0] } : { rotate: [-40] } }
            transition={{ duration: 0.4, repeat: phase <= 2 ? Infinity : 0 }}
          >
            <text x={105 + i * 70} y={248} fontSize={26} textAnchor="middle">✂️</text>
          </motion.g>
        ))}
        <text x={140} y={290} fill={phase <= 1 ? '#EF9A9A' : '#A5D6A7'} fontSize={10.5} textAnchor="middle" fontWeight={600}>
          {phase <= 1 ? 'DESTROYS medicine!' : phase === 2 ? '🚫 BLOCKED!' : '✅ Disabled'}
        </text>
      </motion.g>

      {/* ══ INFLAMED CELL (right region) ══ */}
      <motion.g>
        {/* Pain signals radiating from cell (phases 1-2) */}
        {phase <= 2 && [0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => (
          <motion.g key={`pain-${i}`}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ delay: i * 0.12, duration: 1, repeat: Infinity }}
          >
            <line
              x1={640 + Math.cos(ang * Math.PI / 180) * 75}
              y1={300 + Math.sin(ang * Math.PI / 180) * 70}
              x2={640 + Math.cos(ang * Math.PI / 180) * 95}
              y2={300 + Math.sin(ang * Math.PI / 180) * 88}
              stroke="#EF5350" strokeWidth={3} strokeLinecap="round"
            />
          </motion.g>
        ))}
        {/* Pulse rings */}
        {phase <= 2 && <>
          <PulseRing cx={640} cy={300} r={80} color="#EF5350" delay={0} />
          <PulseRing cx={640} cy={300} r={80} color="#EF5350" delay={1.1} />
        </>}
        {/* Healing rings (phase 3-4) */}
        {phase >= 3 && <>
          <PulseRing cx={640} cy={300} r={80} color="#4CAF50" delay={0} />
          <PulseRing cx={640} cy={300} r={80} color="#4CAF50" delay={1.1} />
        </>}
        {/* Cell body */}
        <motion.circle cx={640} cy={300} r={78}
          animate={{
            fill: phase >= 3 ? '#1B5E20' : '#B71C1C',
            stroke: phase >= 3 ? '#4CAF50' : '#EF5350',
          }}
          transition={{ duration: 1.5 }}
          stroke={phase >= 3 ? '#4CAF50' : '#EF5350'} strokeWidth={3}
        />
        {/* Organelles */}
        <circle cx={620} cy={285} r={18} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        <circle cx={660} cy={310} r={12} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        {/* Cell face */}
        <motion.text x={640} y={314} fontSize={48} textAnchor="middle"
          animate={{ scale: phase >= 3 ? [1, 1.15, 1] : [1, 1.05, 1] }}
          style={{ transformOrigin: '640px 314px' }}
          transition={{ duration: 1.5, repeat: Infinity }}>
          {phase >= 3 ? '😊' : '😫'}
        </motion.text>
        <text x={640} y={400} fill={phase >= 3 ? '#A5D6A7' : '#EF9A9A'} fontSize={11} textAnchor="middle" fontWeight={600}>
          {phase >= 3 ? 'HEALTHY — INFLAMMATION OFF' : 'INFLAMED — NF-kB alarm ON 🔔'}
        </text>

        {/* NF-kB Receptor on cell surface */}
        <motion.g animate={{ y: phase >= 3 ? 0 : [0, -2, 0] }}
          transition={{ duration: 0.8, repeat: phase < 3 ? Infinity : 0 }}>
          <rect x={614} y={215} width={52} height={70} rx={12}
            fill={phase >= 3 ? '#2E7D32' : '#7F0000'}
            stroke={phase >= 3 ? '#4CAF50' : '#EF5350'} strokeWidth={2.5} />
          <circle cx={640} cy={245} r={14}
            fill={phase >= 3 ? '#4CAF50' : '#B71C1C'} />
          <rect x={635} y={255} width={10} height={20} rx={3}
            fill={phase >= 3 ? '#388E3C' : '#880000'} />
          <text x={640} y={200} fill="rgba(255,255,255,0.55)" fontSize={9.5} textAnchor="middle">NF-kB Receptor</text>
          {/* Curcumin key in lock (phase 3+) */}
          {phase >= 3 && (
            <motion.g initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: 0 }}
              style={{ transformOrigin: '640px 245px' }}
              transition={{ type: 'spring', stiffness: 220, delay: 0.3 }}>
              <circle cx={640} cy={245} r={15} fill="#FFD700" filter="url(#gld)" />
              <text x={640} y={250} fontSize={14} textAnchor="middle">⚡</text>
            </motion.g>
          )}
        </motion.g>
      </motion.g>

      {/* ══ PIPERINE MOLECULE (appears phase 2) ══ */}
      {phase >= 2 && (
        <Molecule cx={200} cy={H * 0.5}
          r={28} color="#7B1FA2" symbol="🛡️" name="Piperine"
          delay={0.3} glowColor="#AB47BC"
          initialX={50} initialY={H * 0.5}
        />
      )}

      {/* ══ PIPERINE BLOCK EFFECT (phase 2) ══ */}
      {phase === 2 && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
          <motion.circle cx={140} cy={248} r={50}
            fill="rgba(123,31,162,0.25)" stroke="#AB47BC" strokeWidth={2.5}
            animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />
          <text x={140} y={255} fontSize={32} textAnchor="middle">🚫</text>
          <Bubble x={140} y={150} text={['Piperine BLOCKS', 'the scissors!', 'Medicine is safe!']}
            color="#AB47BC" delay={2} />
        </motion.g>
      )}

      {/* ══ CURCUMIN TRAVELING (phase 3) ══ */}
      {phase >= 3 && (
        <motion.g>
          <motion.g
            initial={{ x: 50, y: H * 0.5 }}
            animate={{ x: [50, 240, 430, 565], y: [H * 0.5, H * 0.49, H * 0.5, 230] }}
            transition={{ duration: 3.5, ease: 'easeInOut', delay: 0.2 }}
          >
            <circle cx={0} cy={0} r={30} fill="#F57F17" filter="url(#gld)" />
            <circle cx={0} cy={0} r={22} fill="#FFD700" />
            <text x={0} y={8} fontSize={22} textAnchor="middle">⚡</text>
            <text x={0} y={52} fill="#FFE082" fontSize={12} textAnchor="middle" fontWeight={700}>Curcumin</text>
            {/* Trail */}
            {[1, 2, 3].map(i => (
              <circle key={i} cx={-i * 22} cy={0} r={14 - i * 3}
                fill="#FFD700" opacity={0.3 / i} />
            ))}
          </motion.g>
          <Bubble x={350} y={420} text={['Curcumin travels', 'safely to the sick cell!']}
            color="#FFD700" delay={2.5} />
          <Arrow x1={350} y1={400} x2={580} y2={300} color="#FFD700" markerId="agold" delay={3} />
        </motion.g>
      )}

      {/* ══ HEALING WAVE (phase 4) ══ */}
      {phase === 4 && (
        <motion.g>
          {[0, 1, 2, 3, 4].map(i => (
            <motion.circle key={i} cx={640} cy={300}
              initial={{ r: 78, opacity: 0.8 }}
              animate={{ r: 78 + i * 60, opacity: 0 }}
              transition={{ delay: i * 0.3, duration: 2.5, repeat: Infinity }}
              fill="none" stroke="#4CAF50" strokeWidth={3}
            />
          ))}
          <Bubble x={400} y={160} width={210}
            text={['NF-kB alarm is OFF!', 'Inflammation stopped.', 'Arjun feels better! 😊']}
            color="#4CAF50" delay={0.5} subtext="Curcumin did it!" />
          <motion.text x={640} y={480} fill="#4CAF50" fontSize={14} textAnchor="middle" fontWeight={700}
            initial={{ opacity: 0, y: 500 }} animate={{ opacity: 1, y: 480 }} transition={{ delay: 1.5 }}>
            ✅ INFLAMMATION HEALED!
          </motion.text>
        </motion.g>
      )}

      {/* ══ PHASE 1 ANNOTATION ══ */}
      {phase === 1 && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <Bubble x={400} y={420} width={240}
            text={['The liver uses scissors', '(enzymes) to CUT UP', 'medicine before it helps!']}
            color="#EF5350" delay={1.2} />
          <Arrow x1={290} y1={400} x2={170} y2={280} color="rgba(239,83,80,0.8)" markerId="a1" delay={2} />
          <text x={640} y={440} fill="rgba(255,255,255,0.55)" fontSize={11} textAnchor="middle">
            The sick cell is angry 😫
          </text>
        </motion.g>
      )}
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// DAY 2 ─ TULSI DRINK (Eugenol)
// Phases: Healthy throat cells → Eugenol arrives → Hex shield forms → Virus bounces
// ═══════════════════════════════════════════════════════════════════════════
function Day2_Animation({ phase }) {
  const W = 800, H = 560
  const hexAngles = [0, 60, 120, 180, 240, 300]
  const hexR = 108

  // 6 hex positions for shield
  const hexPositions = [
    { x: 400, y: 250 },          // center
    ...hexAngles.map(a => ({
      x: 400 + Math.cos(a * Math.PI / 180) * hexR,
      y: 250 + Math.sin(a * Math.PI / 180) * hexR * 0.75,
    }))
  ]

  const viruses = [
    { sx: 740, sy: 100, tx: 448, ty: 225, bounce: { x: 750, y: 40 } },
    { sx: 760, sy: 280, tx: 490, ty: 253, bounce: { x: 770, y: 340 } },
    { sx: 740, sy: 430, tx: 450, ty: 295, bounce: { x: 750, y: 490 } },
  ]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs>
        <BG id="bg2" c1="#0A1628" c2="#030810" />
        <GlowFilter id="grn" blur={6} />
        <GlowFilter id="virusGlow" blur={4} />
        <ArrowDefs id="a2" color="rgba(255,255,255,0.7)" />
        <ArrowDefs id="agreen2" color="#00C853" />
      </defs>
      <rect width={W} height={H} fill="url(#bg2)" />
      <Ambient n={20} color="#00C853" seed={2} />

      {/* ══ THROAT LINING ══ */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {/* Background tissue */}
        <rect x={0} y={400} width={W} height={160} fill="rgba(183,28,28,0.12)" />
        <path d="M 0 400 Q 200 380 400 400 Q 600 420 800 400" fill="none"
          stroke="rgba(239,83,80,0.25)" strokeWidth={3} />
        <text x={60} y={530} fill="rgba(255,255,255,0.2)" fontSize={10.5} fontWeight={600}>
          THROAT LINING
        </text>
      </motion.g>

      {/* ══ HEALTHY CELLS (3 cells in a row) ══ */}
      {[240, 400, 560].map((cx, i) => (
        <motion.g key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.25, duration: 0.9 }}>
          {/* Cell body */}
          <motion.circle cx={cx} cy={440} r={55}
            fill="#1A237E" stroke="#3F51B5" strokeWidth={2.5}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.6 }}
          />
          {/* Nucleus */}
          <circle cx={cx} cy={440} r={22} fill="rgba(63,81,181,0.5)" stroke="#7986CB" strokeWidth={1.5} />
          <text x={cx} y={447} fontSize={28} textAnchor="middle">😊</text>
          {/* Receptor spots */}
          {[-22, 0, 22].map(dx => (
            <motion.circle key={dx} cx={cx + dx} cy={386} r={7}
              animate={{ fill: phase >= 2 ? '#00C853' : '#F44336' }}
              transition={{ duration: 0.8, delay: 0.5 }}
              stroke="white" strokeWidth={1.5}
            />
          ))}
          <text x={cx} y={510} fill="#9FA8DA" fontSize={10} textAnchor="middle">Healthy Cell {i + 1}</text>
        </motion.g>
      ))}

      {/* ══ EUGENOL MOLECULES arriving (phase 1) ══ */}
      {phase >= 1 && Array.from({ length: 8 }).map((_, i) => {
        const angle = i * 45 * Math.PI / 180
        const distanceOff = 280
        const finalX = hexPositions[i % hexPositions.length]?.x || 400
        const finalY = hexPositions[i % hexPositions.length]?.y || 250
        return (
          <motion.g key={`eug-${i}`}
            initial={{ x: 740, y: 50 + i * 60, opacity: 0, scale: 0 }}
            animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            style={{ x: 0, y: 0 }}
            transition={{ delay: 0.4 + i * 0.2, duration: 1.8, ease: 'easeOut' }}
          >
            <motion.g
              initial={{ cx: 740, cy: 50 + i * 60 }}
              animate={{ cx: finalX, cy: finalY }}
            >
              <circle cx={finalX} cy={finalY} r={14} fill="#00C853" filter="url(#grn)" />
              <text x={finalX} y={finalY + 5} fontSize={13} textAnchor="middle">🍃</text>
            </motion.g>
          </motion.g>
        )
      })}

      {/* ══ HEX SHIELD (phase 2+) ══ */}
      {phase >= 2 && hexPositions.map((pos, i) => (
        <motion.g key={`hex-${i}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
          transition={{ delay: 0.1 + i * 0.15, type: 'spring', stiffness: 140, damping: 12 }}
        >
          <motion.polygon
            points={`${pos.x},${pos.y - 40} ${pos.x + 35},${pos.y - 20} ${pos.x + 35},${pos.y + 20} ${pos.x},${pos.y + 40} ${pos.x - 35},${pos.y + 20} ${pos.x - 35},${pos.y - 20}`}
            fill="rgba(0,200,83,0.18)"
            stroke="#00C853"
            strokeWidth={2.5}
            filter="url(#grn)"
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.1 }}
          />
          <text x={pos.x} y={pos.y + 8} fontSize={18} textAnchor="middle">🍃</text>
        </motion.g>
      ))}

      {/* Shield outer boundary glow */}
      {phase >= 2 && (
        <motion.ellipse cx={400} cy={250} rx={148} ry={115}
          fill="none" stroke="#00C853" strokeWidth={3}
          filter="url(#grn)"
          strokeDasharray="10 5"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0.5, 0.9, 0.5], scale: 1 }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      )}
      {phase === 2 && (
        <Bubble x={400} y={110} width={220}
          text={['Eugenol molecules link', 'together like armour!', 'Hexagon shield ACTIVE!']}
          color="#00C853" delay={1.5} subtext="🛡️ SHIELD UP" />
      )}

      {/* ══ VIRUSES (phase 3 attack; phase 4 defeated) ══ */}
      {phase >= 3 && viruses.map((v, i) => (
        <motion.g key={`virus-${i}`}>
          {/* Virus body */}
          <motion.g
            initial={{ x: v.sx, y: v.sy, opacity: 0 }}
            animate={phase === 3
              ? { x: [v.sx, v.tx + 30, v.sx + 60], y: [v.sy, v.ty, v.sy - 50], opacity: [0, 1, 1, 0], rotate: [0, 0, 180] }
              : { opacity: 0 }
            }
            transition={{ delay: 0.3 + i * 0.5, duration: 3.5 }}
          >
            <circle cx={0} cy={0} r={24} fill="#C62828" filter="url(#virusGlow)" />
            {/* Spikes */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, j) => (
              <line key={j}
                x1={Math.cos(ang * Math.PI / 180) * 24}
                y1={Math.sin(ang * Math.PI / 180) * 24}
                x2={Math.cos(ang * Math.PI / 180) * 37}
                y2={Math.sin(ang * Math.PI / 180) * 37}
                stroke="#EF5350" strokeWidth={3.5} strokeLinecap="round"
              />
            ))}
            <text x={0} y={9} fontSize={22} textAnchor="middle">😈</text>
            {/* Impact explosion */}
            <motion.text x={-30} y={-30} fontSize={30}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.8, 0], opacity: [0, 1, 0] }}
              transition={{ delay: 1.5 + i * 0.3, duration: 0.8 }}>
              💥
            </motion.text>
          </motion.g>
        </motion.g>
      ))}

      {/* Virus labels */}
      {phase === 3 && (
        <>
          <motion.text x={700} y={100} fill="#EF5350" fontSize={12} fontWeight={700}
            initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: 0.5, duration: 3, repeat: Infinity }}>
            VIRUS ATTACK! 🦠
          </motion.text>
          <Bubble x={400} y={420} text={['Viruses try to attach', 'to healthy cells…']}
            color="#EF5350" delay={0.3} />
        </>
      )}

      {phase === 4 && (
        <>
          <Bubble x={400} y={130} width={230}
            text={['BLOCKED! Viruses bounce', 'right off the shield!', 'Your cells are safe! 🎉']}
            color="#00C853" delay={0.5} subtext="✅ INFECTION STOPPED" />
          {/* Bounced virus ghosts */}
          {[200, 600, 400].map((x, i) => (
            <motion.text key={i} x={x} y={60 + i * 80} fontSize={30}
              initial={{ opacity: 0.7, y: 60 + i * 80 }}
              animate={{ opacity: 0, y: 60 + i * 80 - 80 }}
              transition={{ delay: 0.5 + i * 0.4, duration: 1.5 }}>
              😈
            </motion.text>
          ))}
          {/* Victory check */}
          <motion.text x={400} y={490} fill="#00C853" fontSize={15} textAnchor="middle" fontWeight={700}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
            ✅ EUGENOL SHIELD — MISSION COMPLETE!
          </motion.text>
        </>
      )}
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// DAY 3 ─ GINGER HONEY (Gingerol + Osmosis)
// Phases: Bacteria shown → Honey wave (osmosis) → Bacteria shrinks → Gingerol drills
// ═══════════════════════════════════════════════════════════════════════════
function Day3_Animation({ phase }) {
  const bumpAngles = [0, 45, 90, 135, 180, 225, 270, 315]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs>
        <BG id="bg3" c1="#1A0E00" c2="#0A0500" />
        <GlowFilter id="hnyGlow" blur={7} />
        <GlowFilter id="drillGlow" blur={5} />
        <ArrowDefs id="a3" color="rgba(255,255,255,0.7)" />
        <ArrowDefs id="ahoney" color="#FFB300" />
        <radialGradient id="bact3" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#66BB6A" />
          <stop offset="100%" stopColor="#1B5E20" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#bg3)" />
      <Ambient n={18} color="#FFB300" seed={3} />

      {/* ══ BACTERIA (scales down in phase 2-3) ══ */}
      <motion.g
        style={{ transformOrigin: '400px 300px' }}
        animate={phase >= 2
          ? { scale: phase >= 3 ? 0.55 : 0.78 }
          : { scale: 1 }}
        transition={{ duration: 2.5, ease: 'easeInOut' }}
      >
        {/* Outer slime layer */}
        <motion.ellipse cx={400} cy={300} rx={148} ry={125}
          fill="rgba(100,200,100,0.12)" stroke="#66BB6A"
          strokeWidth={2} strokeDasharray="6 4"
          animate={{ rx: [148, 156, 148], ry: [125, 133, 125] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        />
        {/* Cell wall */}
        <motion.ellipse cx={400} cy={300} rx={128} ry={108}
          fill="url(#bact3)" stroke="#4CAF50" strokeWidth={4}
          animate={phase === 1 ? { rx: [128, 136, 128], ry: [108, 116, 108] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {/* Surface bumps */}
        {bumpAngles.map((angle, i) => (
          <motion.circle key={i}
            cx={400 + Math.cos(angle * Math.PI / 180) * 126}
            cy={300 + Math.sin(angle * Math.PI / 180) * 106}
            r={16} fill="#2E7D32" stroke="#66BB6A" strokeWidth={1.5}
            animate={{ r: [16, 19, 16] }}
            transition={{ delay: i * 0.18, duration: 1.3, repeat: Infinity }}
          />
        ))}
        {/* Ribosome dots */}
        {[[-30, -20], [20, -30], [-20, 30], [30, 20], [0, -40]].map(([dx, dy], i) => (
          <circle key={i} cx={400 + dx} cy={300 + dy} r={6}
            fill="rgba(255,255,255,0.2)" />
        ))}
        {/* Face */}
        <motion.text x={400} y={318} fontSize={58} textAnchor="middle"
          style={{ transformOrigin: '400px 318px' }}
          animate={{
            rotate: phase === 1 ? [-4, 4, -4] : [],
            scale: phase >= 3 ? [1, 0.7, 0] : [1, 1.05, 1]
          }}
          transition={{ duration: phase >= 3 ? 2 : 0.8, repeat: phase < 3 ? Infinity : 0 }}>
          {phase === 1 ? '😈' : phase === 2 ? '😰' : '💀'}
        </motion.text>
        {/* Flagella */}
        {phase === 1 && [0, 1, 2].map(i => (
          <motion.path key={i}
            d={`M ${520 + i * 15} ${270 + i * 18} Q ${575} ${250 + i * 15} ${615 + i * 10} ${280 + i * 18}`}
            fill="none" stroke="#66BB6A" strokeWidth={3} strokeLinecap="round"
            animate={{ d: [
              `M ${520 + i * 15} ${270 + i * 18} Q ${575} ${250 + i * 15} ${615 + i * 10} ${280 + i * 18}`,
              `M ${520 + i * 15} ${270 + i * 18} Q ${570} ${270 + i * 15} ${608 + i * 10} ${258 + i * 18}`,
            ]}}
            transition={{ duration: 0.45, repeat: Infinity, repeatType: 'reverse' }}
          />
        ))}
        {/* DNA strand inside */}
        <motion.path d="M 370 280 Q 385 260 400 280 Q 415 300 430 280"
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
        <motion.path d="M 370 280 Q 385 300 400 280 Q 415 260 430 280"
          fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={2} />
        <text x={400} y={400} fill="rgba(255,255,255,0.3)" fontSize={10} textAnchor="middle">DNA</text>
      </motion.g>

      {/* ══ HONEY WAVE (phase 1+ sweeping in) ══ */}
      {phase >= 1 && (
        <motion.g>
          <motion.circle cx={400} cy={300} r={430}
            fill="none" stroke="#FFB300" strokeWidth={22} opacity={0.35}
            initial={{ r: 500, opacity: 0 }}
            animate={{ r: [500, 150, 148], opacity: [0, 0.45, 0.45] }}
            transition={{ duration: 2.8, ease: 'easeOut' }}
            filter="url(#hnyGlow)"
          />
          {/* Honey droplets around the cell */}
          {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((angle, i) => (
            <motion.g key={`honey-${i}`}
              initial={{ x: 400 + Math.cos(angle * Math.PI / 180) * 350,
                y: 300 + Math.sin(angle * Math.PI / 180) * 310,
                opacity: 0 }}
              animate={{
                x: 400 + Math.cos(angle * Math.PI / 180) * 148,
                y: 300 + Math.sin(angle * Math.PI / 180) * 128,
                opacity: [0, 1, 0.7]
              }}
              transition={{ delay: i * 0.1, duration: 2 }}
            >
              <text fontSize={20} textAnchor="middle">🍯</text>
            </motion.g>
          ))}
          <SVGLabel x={160} y={190} text="HONEY SURROUNDS" color="#FFB300" fontSize={11} delay={2} />
          {phase === 1 && (
            <Bubble x={160} y={340} width={180}
              text={['Honey is SUPER sweet!', 'Sugar pulls water', 'out of the bacteria.']}
              color="#FFB300" delay={2.5} subtext="Osmosis at work!" />
          )}
        </motion.g>
      )}

      {/* ══ WATER ARROWS (osmosis — phase 2) ══ */}
      {phase >= 2 && [0, 1, 2, 3, 4, 5, 6, 7].map(i => {
        const angle = i * 45
        const r1 = 78, r2 = 200
        const sx = 400 + Math.cos(angle * Math.PI / 180) * r1
        const sy = 300 + Math.sin(angle * Math.PI / 180) * r1
        const ex = 400 + Math.cos(angle * Math.PI / 180) * r2
        const ey = 300 + Math.sin(angle * Math.PI / 180) * (r2 * 0.85)
        return (
          <motion.g key={`water-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.95, 0] }}
            transition={{ delay: 0.3 + i * 0.15, duration: 2.5, repeat: 2 }}
          >
            <line x1={sx} y1={sy} x2={ex} y2={ey}
              stroke="#40C4FF" strokeWidth={2.5} strokeDasharray="8 5" />
            <text x={ex} y={ey + 6} fontSize={15} textAnchor="middle">💧</text>
          </motion.g>
        )
      })}
      {phase === 2 && (
        <Bubble x={400} y={460} width={220}
          text={['Water leaves the bacteria', 'through its own walls!', 'It shrinks and weakens.']}
          color="#40C4FF" delay={1.5} subtext="Osmosis = water flow" />
      )}

      {/* ══ GINGEROL DRILLS (phase 3) ══ */}
      {phase >= 3 && [0, 1, 2, 3].map(i => {
        const angle = (i * 90 + 45) * Math.PI / 180
        const startR = 340, endR = 128
        const sx = 400 + Math.cos(angle) * startR
        const sy = 300 + Math.sin(angle) * startR * 0.9
        const ex = 400 + Math.cos(angle) * endR * 0.85
        const ey = 300 + Math.sin(angle) * endR * 0.78
        return (
          <motion.g key={`drill-${i}`}>
            <motion.g
              initial={{ x: sx, y: sy, scale: 0.5, opacity: 0 }}
              animate={{ x: [sx, (sx + ex) / 2, ex], y: [sy, (sy + ey) / 2, ey], scale: [0.5, 1.4, 1], opacity: [0, 1, 0.9] }}
              transition={{ delay: 0.4 + i * 0.35, duration: 2.2, ease: 'easeIn' }}
            >
              <motion.text x={0} y={0} fontSize={36} textAnchor="middle"
                animate={{ rotate: [0, 1440] }}
                transition={{ duration: 2.2, ease: 'linear' }}>
                🔩
              </motion.text>
              <text x={0} y={48} fill="#FF6D00" fontSize={10} textAnchor="middle" fontWeight={700}>Gingerol</text>
            </motion.g>
          </motion.g>
        )
      })}
      {phase === 3 && (
        <Bubble x={640} y={180} width={180}
          text={['Gingerol DRILLS into', 'the weakened wall!', 'Holes everywhere!']}
          color="#FF6D00" delay={1.5} />
      )}

      {/* ══ EXPLOSION + VICTORY (phase 4) ══ */}
      {phase === 4 && (
        <motion.g>
          {['💥', '✨', '💫', '⭐', '🌟', '✨', '💥'].map((em, i) => {
            const angle = i * (360 / 7) * Math.PI / 180
            const r = 100 + (i % 3) * 40
            return (
              <motion.text key={i}
                x={400 + Math.cos(angle) * r}
                y={300 + Math.sin(angle) * r}
                fontSize={30 + (i % 3) * 10} textAnchor="middle"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.8] }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}>
                {em}
              </motion.text>
            )
          })}
          <Bubble x={400} y={160} width={240}
            text={['Bacteria DESTROYED!', 'Honey + Ginger team = 💪', 'Infection cleared!']}
            color="#FF6D00" delay={1} subtext="🎉 Sore throat healed!" />
          <motion.text x={400} y={500} fill="#FF6D00" fontSize={15} textAnchor="middle" fontWeight={700}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
            ✅ BACTERIA ELIMINATED — THROAT HEALED!
          </motion.text>
        </motion.g>
      )}

      {/* Phase 1 intro annotation */}
      {phase === 1 && (
        <Bubble x={640} y={180} width={180}
          text={['This is a bad bacteria', 'that causes sore throat!', 'Let\'s destroy it! 😤']}
          color="#EF5350" delay={1} />
      )}
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// DAY 4 ─ STEAM THERAPY (Cineole)
// Phases: Blocked nasal passage → Blood vessels dilate → Steam rises → Mucus melts
// ═══════════════════════════════════════════════════════════════════════════
function Day4_Animation({ phase }) {
  const mucusData = [
    { y: 50, label: 'Upper Block', delay: 0.8 },
    { y: 190, label: 'Middle Block', delay: 1.3 },
    { y: 330, label: 'Lower Block', delay: 1.8 },
  ]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs>
        <BG id="bg4" c1="#0D1B1E" c2="#030A0C" />
        <GlowFilter id="stmGlow" blur={5} />
        <GlowFilter id="cineGlow" blur={6} />
        <linearGradient id="wallLeft" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(239,83,80,0.1)" />
          <stop offset="100%" stopColor="rgba(183,28,28,0.3)" />
        </linearGradient>
        <linearGradient id="wallRight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(183,28,28,0.3)" />
          <stop offset="100%" stopColor="rgba(239,83,80,0.1)" />
        </linearGradient>
        <linearGradient id="mucusGrad4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7CB342" />
          <stop offset="100%" stopColor="#33691E" />
        </linearGradient>
        <ArrowDefs id="a4" color="rgba(255,255,255,0.7)" />
        <ArrowDefs id="ablue" color="#40C4FF" />
      </defs>
      <rect width={W} height={H} fill="url(#bg4)" />

      {/* ══ NASAL PASSAGE CROSS SECTION ══ */}
      {/* Left wall */}
      <motion.rect x={0} y={0} width={230} height={H}
        fill="url(#wallLeft)" stroke="#E57373" strokeWidth={3}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
      />
      {/* Right wall */}
      <motion.rect x={570} y={0} width={230} height={H}
        fill="url(#wallRight)" stroke="#E57373" strokeWidth={3}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
      />
      {/* Cilia on walls */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.g key={`cilia-${i}`}>
          <motion.line x1={230} y1={50 + i * 50} x2={240} y2={30 + i * 50}
            stroke="#EF9A9A" strokeWidth={2} strokeLinecap="round"
            animate={{ x2: [240, 225, 240] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }} />
          <motion.line x1={570} y1={50 + i * 50} x2={560} y2={30 + i * 50}
            stroke="#EF9A9A" strokeWidth={2} strokeLinecap="round"
            animate={{ x2: [560, 575, 560] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }} />
        </motion.g>
      ))}

      <SVGLabel x={400} y={26} text="NASAL PASSAGE — CROSS SECTION" color="rgba(255,255,255,0.28)" fontSize={11} delay={0.4} />
      <SVGLabel x={115} y={540} text="NASAL WALL" color="rgba(239,83,80,0.4)" fontSize={10} delay={0.5} />
      <SVGLabel x={685} y={540} text="NASAL WALL" color="rgba(239,83,80,0.4)" fontSize={10} delay={0.5} />
      <SVGLabel x={400} y={540} text="AIRWAY" color="rgba(255,255,255,0.2)" fontSize={10} delay={0.5} />

      {/* ══ MUCUS BLOCKS ══ */}
      {mucusData.map((m, i) => (
        <motion.g key={`mucus-${i}`}>
          {/* Bond lines inside mucus */}
          {phase < 4 && [-70, 0, 70].map(dx => (
            <motion.g key={dx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <line x1={400 + dx} y1={m.y + 35} x2={400 + dx} y2={m.y + 105}
                stroke="#AED581" strokeWidth={2.5} strokeDasharray="5 3"
                opacity={0.8} />
              <circle cx={400 + dx} cy={m.y + 35} r={5} fill="#CDDC39" />
              <circle cx={400 + dx} cy={m.y + 105} r={5} fill="#CDDC39" />
            </motion.g>
          ))}
          {/* Main mucus body */}
          <motion.rect x={234} y={m.y + 30} width={332} height={95} rx={46}
            fill="url(#mucusGrad4)"
            stroke="#9CCC65" strokeWidth={2}
            animate={phase >= 4
              ? { scaleX: [1, 0.4, 0], opacity: [1, 0.6, 0] }
              : { opacity: 1 }}
            style={{ transformOrigin: `400px ${m.y + 77}px` }}
            transition={{ delay: m.delay, duration: 2, ease: 'easeInOut' }}
          />
          <motion.text x={400} y={m.y + 85} fill="rgba(255,255,255,0.55)" fontSize={10}
            textAnchor="middle" fontWeight={600}
            animate={phase >= 4 ? { opacity: 0 } : { opacity: 1 }}>
            {m.label}
          </motion.text>
        </motion.g>
      ))}

      {/* ══ BLOOD VESSELS dilating (phase 2+) ══ */}
      {phase >= 2 && (
        <motion.g>
          <motion.path d={`M 0 ${H} Q 115 ${H - 60} 230 ${H}`}
            fill="none" stroke="#EF5350"
            initial={{ strokeWidth: 4 }} animate={{ strokeWidth: [4, 16, 16] }}
            transition={{ duration: 2, delay: 0.3 }}
          />
          <motion.path d={`M ${W} ${H} Q 685 ${H - 60} 570 ${H}`}
            fill="none" stroke="#EF5350"
            initial={{ strokeWidth: 4 }} animate={{ strokeWidth: [4, 16, 16] }}
            transition={{ duration: 2, delay: 0.3 }}
          />
          <Bubble x={400} y={490} width={240}
            text={['Blood vessels WIDEN!', 'More healing blood', 'rushes to the nose!']}
            color="#EF5350" delay={1.2} />
        </motion.g>
      )}

      {/* ══ STEAM PARTICLES with Cineole (phase 2+) ══ */}
      {phase >= 2 && Array.from({ length: 22 }).map((_, i) => {
        const lane = 240 + (i % 8) * 42
        return (
          <motion.g key={`steam-${i}`}
            initial={{ x: lane, y: H + 20, opacity: 0 }}
            animate={{
              y: [H + 20, H * 0.6, H * 0.3, 20, -40],
              x: [lane, lane + Math.sin(i) * 18, lane - Math.sin(i) * 14, lane + Math.sin(i) * 10, lane],
              opacity: [0, 0.95, 0.95, 0.6, 0],
              scale: [0.4, 1.1, 1.3, 1, 0.4],
            }}
            transition={{
              delay: 1 + i * 0.2,
              duration: 5.5,
              repeat: Infinity,
              repeatDelay: 0.4,
            }}
          >
            <circle cx={0} cy={0} r={15} fill="#40C4FF" opacity={0.85} filter="url(#cineGlow)" />
            <text x={0} y={5} fontSize={11} textAnchor="middle" fill="white" fontWeight="bold">C</text>
            <text x={0} y={-22} fill="#40C4FF" fontSize={9} textAnchor="middle">Cineole</text>
          </motion.g>
        )
      })}

      {/* ══ CINEOLE CUTTING BONDS (phase 3) ══ */}
      {phase >= 3 && mucusData.map((m, i) => (
        <motion.g key={`cut-${i}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: [0, 1.5, 1] }}
          style={{ transformOrigin: `400px ${m.y + 75}px` }}
          transition={{ delay: m.delay + 0.2, type: 'spring', stiffness: 180 }}
        >
          <motion.text x={400} y={m.y + 80} fontSize={28} textAnchor="middle"
            animate={{ rotate: [-20, 20, -20] }}
            style={{ transformOrigin: `400px ${m.y + 80}px` }}
            transition={{ duration: 0.5, repeat: 6 }}>
            ✂️
          </motion.text>
          <motion.circle cx={400} cy={m.y + 72} r={38}
            fill="none" stroke="#40C4FF" strokeWidth={2}
            animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 0.8, repeat: 4 }}
          />
        </motion.g>
      ))}
      {phase === 3 && (
        <Bubble x={640} y={250} width={170}
          text={['Cineole cuts the', 'mucus protein bonds!', '✂️ Snip snip!']}
          color="#40C4FF" delay={1} />
      )}

      {/* ══ CLEAR AIRWAY (phase 4) ══ */}
      {phase === 4 && (
        <motion.g>
          {/* Open channel glow */}
          <motion.rect x={235} y={30} width={330} height={H - 60} rx={30}
            fill="rgba(0,200,83,0.08)" stroke="#00C853" strokeWidth={2} strokeDasharray="10 5"
            initial={{ opacity: 0 }} animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Air flow arrows */}
          {[80, 200, 320, 440].map((y, j) => (
            <motion.g key={`air-${j}`}
              initial={{ x: 230, opacity: 0 }}
              animate={{ x: [230, 570], opacity: [0, 1, 1, 0] }}
              transition={{ delay: 1 + j * 0.4, duration: 2, repeat: Infinity, repeatDelay: 0.6 }}
            >
              <text fontSize={22} y={y}>💨</text>
              <text x={20} y={y} fill="#40C4FF" fontSize={10}>→→→</text>
            </motion.g>
          ))}
          <Bubble x={400} y={280} width={200}
            text={['AIRWAY CLEAR!', 'Mucus all gone!', 'Breathing is easy 😊']}
            color="#00C853" delay={1.5} subtext="✅ Steam therapy worked!" />
        </motion.g>
      )}

      {/* Phase 1 annotation */}
      {phase === 1 && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <Bubble x={400} y={260} width={210}
            text={['Thick mucus blocks', 'the breathing passage!', 'Can\'t breathe through nose!']}
            color="#9CCC65" delay={1.2} subtext="⚠️ Nasal congestion" />
        </motion.g>
      )}
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// DAY 5 ─ HERBAL SOUP (Allicin)
// Phases: Garlic crushed + allicin forms → Vortex forms → Locks enzyme → Victory
// ═══════════════════════════════════════════════════════════════════════════
function Day5_Animation({ phase }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs>
        <BG id="bg5" c1="#0E0D00" c2="#050400" />
        <GlowFilter id="alGlow" blur={6} />
        <GlowFilter id="bact5" blur={4} />
        <ArrowDefs id="a5" color="rgba(255,255,255,0.7)" />
        <ArrowDefs id="ayellow" color="#F9A825" />
        <radialGradient id="bacteriaGrd5" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#388E3C" />
          <stop offset="100%" stopColor="#1B5E20" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#bg5)" />
      <Ambient n={20} color="#F9A825" seed={5} />

      {/* ══ GARLIC CRUSHING (phase 1) ══ */}
      {phase === 1 && (
        <motion.g>
          <motion.text x={160} y={310} fontSize={90} textAnchor="middle"
            animate={{ scale: [1, 0.65, 1.3, 0.8], rotate: [0, -8, 8, 0] }}
            style={{ transformOrigin: '160px 310px' }}
            transition={{ duration: 2, repeat: 2 }}>
            🧄
          </motion.text>
          <Bubble x={160} y={160} width={180}
            text={['Garlic is CRUSHED!', 'Two chemicals mix', 'inside the cell...']}
            color="#F9A825" delay={0.5} />

          {/* Chemical reaction arrows */}
          <motion.text x={240} y={280} fontSize={20}
            initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0, 1] }}
            transition={{ delay: 1, duration: 0.5, repeat: 3 }}>→</motion.text>

          {/* Allicin molecules forming and flying out */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = i * 45 * Math.PI / 180
            return (
              <motion.g key={i}
                initial={{ x: 160, y: 290, scale: 0, opacity: 0 }}
                animate={{
                  x: 160 + Math.cos(angle) * 140,
                  y: 290 + Math.sin(angle) * 120,
                  scale: 1, opacity: 1
                }}
                transition={{ delay: 1.5 + i * 0.12, duration: 1.2, type: 'spring', stiffness: 120 }}
              >
                <circle cx={0} cy={0} r={18} fill="#F9A825" filter="url(#alGlow)" />
                <text x={0} y={6} fontSize={14} textAnchor="middle" fill="#1A1A00" fontWeight="bold">A</text>
                <text x={0} y={-26} fill="#F9A825" fontSize={9} textAnchor="middle">Allicin</text>
              </motion.g>
            )
          })}
          <text x={160} y={430} fill="#F9A825" fontSize={12} textAnchor="middle" fontWeight={700}>
            ALLICIN RELEASED! ⚡
          </text>
        </motion.g>
      )}

      {/* ══ BACTERIA TARGET (phases 2-4) ══ */}
      {phase >= 2 && (
        <motion.g>
          <motion.circle cx={560} cy={290} r={90}
            fill="url(#bacteriaGrd5)" stroke="#4CAF50" strokeWidth={3}
            animate={phase < 4
              ? { r: [90, 96, 90], fill: ['#1B5E20', '#2E7D32', '#1B5E20'] }
              : { r: [90, 60, 30, 0], opacity: [1, 0.6, 0.2, 0] }}
            transition={{ duration: phase < 4 ? 1.8 : 1.8, repeat: phase < 4 ? Infinity : 0 }}
          />
          {/* Organelles */}
          <circle cx={540} cy={275} r={20} fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <circle cx={578} cy={305} r={14} fill="rgba(255,255,255,0.05)" />
          {/* Face */}
          <motion.text x={560} y={305} fontSize={54} textAnchor="middle"
            animate={phase === 4 ? { scale: [1, 0, 0] } : { scale: [1, 1.05, 1] }}
            style={{ transformOrigin: '560px 305px' }}
            transition={{ duration: phase === 4 ? 1.8 : 1.5, repeat: phase < 4 ? Infinity : 0 }}>
            {phase >= 4 ? '💀' : '🦠'}
          </motion.text>

          {/* O2 Breathing Enzyme — the key target */}
          <motion.g>
            <rect x={534} y={185} width={52} height={72} rx={12}
              fill={phase >= 3 ? '#7F0000' : '#2E7D32'}
              stroke={phase >= 3 ? '#EF5350' : '#66BB6A'} strokeWidth={2.5} />
            <circle cx={560} cy={214} r={14}
              fill={phase >= 3 ? '#B71C1C' : '#388E3C'} />
            <rect x={556} y={220} width={8} height={22} rx={3}
              fill={phase >= 3 ? '#880000' : '#2E7D32'} />
            <text x={560} y={175} fill="rgba(255,255,255,0.6)" fontSize={9.5} textAnchor="middle">O₂ Enzyme</text>
            <text x={560} y={277} fill={phase >= 3 ? '#EF9A9A' : '#A5D6A7'}
              fontSize={9} textAnchor="middle">
              {phase >= 3 ? 'BLOCKED!' : '← breathes here'}
            </text>
            {/* Allicin locked in (phase 3) */}
            {phase >= 3 && (
              <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{ transformOrigin: '560px 214px' }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}>
                <circle cx={560} cy={214} r={16} fill="#F9A825" filter="url(#alGlow)" />
                <text x={560} y={219} fontSize={14} textAnchor="middle">🔒</text>
              </motion.g>
            )}
          </motion.g>

          {/* Arrow to enzyme */}
          <Arrow x1={400} y1={180} x2={530} y2={215} color="rgba(249,168,37,0.7)"
            markerId="ayellow" label="ENZYME TARGET" delay={0.8} />
        </motion.g>
      )}

      {/* ══ ALLICIN VORTEX (phase 2) ══ */}
      {phase === 2 && (
        <motion.g>
          {Array.from({ length: 20 }).map((_, i) => {
            const orbitAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
            const radii = [200, 170, 140, 110]
            const r = radii[Math.floor(i / 5)]
            const startAng = (i * 18) * Math.PI / 180
            const speed = 2.5 + (i % 4) * 0.8
            return (
              <motion.g key={`vortex-${i}`}
                style={{ transformOrigin: '560px 290px' }}
                animate={{ rotate: [i * 18, i * 18 + 360] }}
                transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
              >
                <circle
                  cx={560 + Math.cos(startAng) * r}
                  cy={290 + Math.sin(startAng) * r * 0.7}
                  r={13} fill="#F9A825" filter="url(#alGlow)" opacity={0.85}
                />
              </motion.g>
            )
          })}
          <Bubble x={280} y={200} width={180}
            text={['Allicin forms a', 'SPINNING VORTEX!', 'Getting closer...']}
            color="#F9A825" delay={1} subtext="⚡ Charging up!" />
        </motion.g>
      )}

      {/* ══ PHASE 3 LOCK ANNOTATION ══ */}
      {phase === 3 && (
        <Bubble x={300} y={230} width={200}
          text={['Allicin LOCKS the', 'breathing enzyme!', 'No oxygen = 💀 bacteria']}
          color="#F9A825" delay={0.8} subtext="Enzyme inhibition!" />
      )}

      {/* ══ PHASE 4 VICTORY ══ */}
      {phase === 4 && (
        <motion.g>
          {['💥', '✨', '⭐', '💫', '🌟'].map((em, i) => {
            const ang = i * 72 * Math.PI / 180
            return (
              <motion.text key={i} x={560 + Math.cos(ang) * 90} y={290 + Math.sin(ang) * 90}
                fontSize={34} textAnchor="middle"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.6, 1.2], opacity: [0, 1, 0.9] }}
                transition={{ delay: i * 0.14, type: 'spring', stiffness: 200 }}>
                {em}
              </motion.text>
            )
          })}
          <Bubble x={290} y={290} width={220}
            text={['Bacteria suffocated!', 'Allicin is a natural', 'antibiotic! Incredible!']}
            color="#F9A825" delay={0.8} subtext="✅ Infection cleared!" />
          <motion.text x={400} y={500} fill="#F9A825" fontSize={14} textAnchor="middle" fontWeight={700}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
            ✅ ALLICIN WINS — BACTERIA ELIMINATED!
          </motion.text>
        </motion.g>
      )}
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// DAY 6 ─ SPICE MIX / TRIKATU (Bioavailability)
// Phases: Enzymes destroy medicine → Trikatu blocks enzymes → Medicine floods
// ═══════════════════════════════════════════════════════════════════════════
function Day6_Animation({ phase }) {
  const enzymePositions = [70, 200, 330, 460]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs>
        <BG id="bg6" c1="#100A20" c2="#050315" />
        <GlowFilter id="trGlow" blur={5} />
        <GlowFilter id="medGlow" blur={4} />
        <GlowFilter id="enzGlow" blur={6} />
        <linearGradient id="wallGrad6" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4A148C" />
          <stop offset="100%" stopColor="#7B1FA2" />
        </linearGradient>
        <ArrowDefs id="a6" color="rgba(255,255,255,0.7)" />
      </defs>
      <rect width={W} height={H} fill="url(#bg6)" />
      <Ambient n={18} color="#CE93D8" seed={6} />

      {/* ══ INTESTINAL WALL (center) ══ */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <rect x={310} y={0} width={180} height={H} fill="url(#wallGrad6)" opacity={0.6} />
        {/* Wall texture lines */}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={310} y1={i * 48} x2={490} y2={i * 48}
            stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
        ))}
      </motion.g>

      {/* Column labels */}
      <SVGLabel x={155} y={34} text="GUT (INSIDE BODY)" color="rgba(255,255,255,0.35)" fontSize={11} delay={0.4} />
      <SVGLabel x={400} y={34} text="INTESTINE WALL" color="rgba(224,64,251,0.5)" fontSize={11} delay={0.4} />
      <SVGLabel x={645} y={34} text="BLOODSTREAM" color="rgba(79,195,247,0.5)" fontSize={11} delay={0.4} />

      {/* ══ WALL ENZYMES (The destroyers) ══ */}
      {enzymePositions.map((y, i) => {
        const isBlocked = phase >= 2
        return (
          <motion.g key={`enzyme-${i}`}
            initial={{ x: 400, y: y + 50, scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.2, type: 'spring' }}
          >
            {/* Enzyme body */}
            <motion.path d="M -25 -20 Q 0 -35 25 -20 Q 40 0 25 20 Q 0 35 -25 20 Q -40 0 -25 -20"
              fill={isBlocked ? '#4A148C' : '#E53935'}
              stroke={isBlocked ? '#7B1FA2' : '#FFCDD2'} strokeWidth={2}
              filter="url(#enzGlow)"
              animate={{ rotate: isBlocked ? 0 : [0, 15, -15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {/* Chomping teeth */}
            {!isBlocked && [-10, 0, 10].map(dx => (
              <polygon key={dx} points={`${dx - 4},-8 ${dx + 4},-8 ${dx},2`} fill="white" />
            ))}
            {!isBlocked && [-10, 0, 10].map(dx => (
              <polygon key={dx} points={`${dx - 4},8 ${dx + 4},8 ${dx},-2`} fill="white" />
            ))}
            <text x={0} y={35} fill={isBlocked ? '#CE93D8' : '#FFCDD2'} fontSize={10} textAnchor="middle" fontWeight={700}>
              {isBlocked ? 'BLOCKED' : 'UGT Enzyme'}
            </text>
            {isBlocked && (
              <motion.text x={0} y={5} fontSize={28} textAnchor="middle"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}>
                🔒
              </motion.text>
            )}
          </motion.g>
        )
      })}

      {/* ══ TRIKATU MOLECULES (Piperine) (phase 2) ══ */}
      {phase >= 2 && enzymePositions.map((y, i) => (
        <motion.g key={`trikatu-${i}`}
          initial={{ x: 120, y: y + 50, opacity: 0, scale: 0.5 }}
          animate={{ x: [120, 200, 310, 380], y: [y + 50, y + 50, y + 50, y + 50], opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1.1, 0.9] }}
          transition={{ delay: 0.4 + i * 0.28, duration: 1.5, ease: 'easeIn' }}
        >
          <circle cx={0} cy={0} r={22} fill="#F57F17" filter="url(#trGlow)" />
          <text x={0} y={7} fontSize={18} textAnchor="middle">🌶️</text>
          <text x={0} y={-30} fill="#FFCC02" fontSize={9.5} textAnchor="middle" fontWeight={700}>Piperine</text>
        </motion.g>
      ))}

      {/* ══ MEDICINE FLOW (Curcumin) ══ */}
      {/* Phase 1: Medicine gets destroyed by enzymes */}
      {phase === 1 && enzymePositions.map((y, i) => (
        <motion.g key={`med-destroy-${i}`}
          initial={{ x: 150, y: y + 50, opacity: 0 }}
          animate={{ x: [150, 360], opacity: [0, 1] }}
          transition={{ delay: 1 + i * 0.5, duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
        >
          <circle cx={0} cy={0} r={12} fill="#FFD700" filter="url(#medGlow)" />
          <text x={0} y={4} fontSize={10} textAnchor="middle" fontWeight={800} fill="#665200">C</text>
          {/* Explosion when it hits the enzyme */}
          <motion.text x={0} y={5} fontSize={30} textAnchor="middle"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 2, 0], opacity: [0, 1, 0] }}
            transition={{ delay: 1.4 + i * 0.5, duration: 0.6, repeat: Infinity, repeatDelay: 1.9 }}>
            💥
          </motion.text>
        </motion.g>
      ))}

      {/* Phase 3-4: Medicine passes safely! (FLOOD) */}
      {phase >= 3 && (
        Array.from({ length: 28 }).map((_, i) => (
          <motion.g key={`flood-${i}`}
            initial={{ x: 150, y: 30 + (i % 7) * 78, opacity: 0, scale: 0.5 }}
            animate={{
              x: [150, 350, 450, 550, 760],
              y: [30 + (i % 7) * 78,
                30 + (i % 7) * 78 + Math.sin(i * 1.1) * 22,
                30 + (i % 7) * 78 + Math.cos(i * 0.8) * 16,
                30 + (i % 7) * 78 + Math.sin(i * 1.3) * 12,
                30 + (i % 7) * 78],
              opacity: [0, 1, 1, 1, 0],
              scale: [0.5, 1.3, 1, 1, 0.5],
            }}
            transition={{ delay: 0.8 + i * 0.12, duration: 3.5, repeat: Infinity, repeatDelay: 0.3 }}
          >
            <circle cx={0} cy={0} r={12} fill="#FFD700" filter="url(#medGlow)" />
            <text x={0} y={4} fontSize={10} textAnchor="middle" fontWeight={800} fill="#665200">C</text>
          </motion.g>
        ))
      )}

      {/* ══ COMPARISON PANEL (phase 3-4) ══ */}
      {phase >= 3 && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
          <rect x={510} y={380} width={270} height={155} rx={14}
            fill="rgba(0,0,0,0.82)" stroke="#FFD700" strokeWidth={1.8} />
          <text x={645} y={403} fill="#FFD700" fontSize={11} textAnchor="middle" fontWeight={700}>
            BIOAVAILABILITY INCREASE
          </text>
          <text x={645} y={428} fill="rgba(255,255,255,0.6)" fontSize={10.5} textAnchor="middle">
            Curcumin alone: ~5% enters blood
          </text>
          <rect x={528} y={437} width={50} height={12} rx={4} fill="#EF5350" opacity={0.7} />
          <text x={645} y={468} fill="rgba(255,255,255,0.6)" fontSize={10.5} textAnchor="middle">
            With Piperine: up to 2000% more!
          </text>
          <rect x={528} y={477} width={214} height={12} rx={4} fill="#00E676" opacity={0.7} />
          <motion.text x={645} y={516} fill="#00E676" fontSize={18} textAnchor="middle" fontWeight={800}
            animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            🚀 20× MORE MEDICINE!
          </motion.text>
        </motion.g>
      )}

      {/* Phase annotations */}
      {phase === 1 && (
        <Bubble x={155} y={150} width={220}
          text={['Curcumin medicine is', 'destroyed by enzymes', 'in the intestine wall! 💥']}
          color="#E53935" delay={1} subtext="⚠️ Low Bioavailability" />
      )}
      {phase === 2 && (
        <Bubble x={155} y={150} width={220}
          text={['Piperine (black pepper)', 'LOCKS those enzymes! 🔒', 'They can\'t destroy it now!']}
          color="#F57F17" delay={1.5} subtext="💪 Enzyme inhibition" />
      )}
      {phase >= 3 && (
        <Bubble x={155} y={150} width={210}
          text={['With the enzymes blocked,', 'the medicine safely enters', 'the bloodstream!']}
          color="#00E676" delay={0.5} subtext="✅ Bio-enhancement complete!" />
      )}
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// DAY 7 ─ MASTER KADHA (Synergy / Polypharmacy)
// Phases: All 6 heroes introduced → Orbit charging → Convergence → SYNERGY!
// ═══════════════════════════════════════════════════════════════════════════
function Day7_Animation({ phase }) {
  const heroes = [
    { name: 'Curcumin',  color: '#FFD700', emoji: '⚡', angle: 0,   info: 'Stops inflammation alarm' },
    { name: 'Piperine',  color: '#AB47BC', emoji: '🛡️', angle: 60,  info: 'Blocks liver enzymes' },
    { name: 'Eugenol',   color: '#00C853', emoji: '🍃', angle: 120, info: 'Shields healthy cells' },
    { name: 'Gingerol',  color: '#FF6D00', emoji: '🔩', angle: 180, info: 'Drills bacteria walls' },
    { name: 'Allicin',   color: '#F9A825', emoji: '💛', angle: 240, info: 'Blocks O₂ enzyme' },
    { name: 'Cineole',   color: '#40C4FF', emoji: '💧', angle: 300, info: 'Melts mucus blockages' },
  ]

  const orbitR = phase === 1 ? 220 : phase === 2 ? 155 : 85

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs>
        <BG id="bg7" c1="#0D001A" c2="#050008" />
        <GlowFilter id="heroGlow7" blur={7} />
        <GlowFilter id="corGlow" blur={9} />
        <ArrowDefs id="a7" color="rgba(255,255,255,0.7)" />
      </defs>
      <rect width={W} height={H} fill="url(#bg7)" />

      {/* Stars */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.circle key={i}
          cx={(i * 137.5) % W} cy={(i * 97.3) % H}
          r={1 + (i % 3)} fill="white"
          animate={{ opacity: [0.15, 0.6, 0.15] }}
          transition={{ delay: (i * 0.13) % 3, duration: 2 + (i % 4), repeat: Infinity }}
        />
      ))}

      {/* ══ CENTRAL TARGET ══ */}
      <motion.g>
        {/* Ripple rings */}
        {[0, 1, 2, 3, 4].map(i => (
          <motion.circle key={i} cx={400} cy={285}
            animate={{ r: [65, 65 + i * 55], opacity: [0.7, 0] }}
            transition={{ delay: i * 0.5, duration: 2.8, repeat: Infinity }}
            fill="none"
            stroke={phase >= 3 ? '#FFD700' : '#EF5350'} strokeWidth={2.5}
          />
        ))}
        {/* Body */}
        <motion.circle cx={400} cy={285} r={65}
          animate={{
            fill: phase >= 4 ? ['#1B5E20', '#2E7D32', '#1B5E20'] : ['#B71C1C', '#880E0E', '#B71C1C'],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          stroke={phase >= 4 ? '#4CAF50' : '#EF5350'} strokeWidth={3}
        />
        <motion.text x={400} y={302} fontSize={50} textAnchor="middle"
          animate={{ scale: [1, 1.1, 1] }} style={{ transformOrigin: '400px 302px' }}
          transition={{ duration: 1.5, repeat: Infinity }}>
          {phase >= 4 ? '✨' : '🦠'}
        </motion.text>
        {phase === 1 && (
          <text x={400} y={372} fill="#EF9A9A" fontSize={10.5} textAnchor="middle" fontWeight={600}>
            INFECTION — all systems active
          </text>
        )}
      </motion.g>

      {/* ══ 6 HERO MOLECULES ══ */}
      {heroes.map((hero, i) => {
        const rad = hero.angle * Math.PI / 180
        const hx = 400 + Math.cos(rad) * orbitR
        const hy = 285 + Math.sin(rad) * orbitR * 0.72
        return (
          <motion.g key={hero.name}
            animate={{ x: hx - 400, y: hy - 285 }}
            style={{ transformOrigin: '400px 285px' }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          >
            {/* Orbit trail */}
            {phase === 2 && (
              <motion.circle cx={400} cy={285} r={orbitR + 8}
                fill="none" stroke={hero.color} strokeWidth={1} opacity={0.2}
                strokeDasharray="4 8"
              />
            )}
            {/* Molecule body */}
            <motion.circle cx={400} cy={285} r={26}
              fill={hero.color}
              animate={{ r: [26, 30, 26] }}
              transition={{ delay: i * 0.2, duration: 1.8, repeat: Infinity }}
              filter="url(#heroGlow7)"
            />
            <text x={400} y={292} fontSize={22} textAnchor="middle">{hero.emoji}</text>

            {/* Name + info label (phase 1 only — when spaced out to read) */}
            {phase === 1 && (
              <>
                <text x={400} y={320} fill={hero.color} fontSize={10.5} textAnchor="middle" fontWeight={700}>
                  {hero.name}
                </text>
                <text x={400} y={334} fill="rgba(255,255,255,0.6)" fontSize={9.5} textAnchor="middle">
                  {hero.info}
                </text>
              </>
            )}
          </motion.g>
        )
      })}

      {/* ══ PHASE 2: ORBIT LABELS ══ */}
      {phase === 2 && (
        <Bubble x={160} y={160} width={190}
          text={['All 6 heroes orbit', 'the infection!', 'Getting faster...']}
          color="#FFD700" delay={0.5} subtext="⚡ Charging synergy..." />
      )}

      {/* ══ PHASE 3: CONVERGENCE FLASH ══ */}
      {phase === 3 && (
        <motion.g>
          {/* Converging beams from each hero */}
          {heroes.map((hero, i) => {
            const rad = hero.angle * Math.PI / 180
            const sx = 400 + Math.cos(rad) * 85
            const sy = 285 + Math.sin(rad) * 85 * 0.72
            return (
              <motion.line key={i}
                x1={sx} y1={sy} x2={400} y2={285}
                stroke={hero.color} strokeWidth={4}
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: [0, 0.9, 0.9, 0], pathLength: [0, 1, 1, 0] }}
                transition={{ delay: 0.3 + i * 0.12, duration: 2 }}
              />
            )
          })}
          <Bubble x={400} y={440} width={230}
            text={['All molecules strike', 'AT THE SAME TIME!', 'From every direction!']}
            color="#FFD700" delay={1} subtext="🌟 POLYPHARMACY SYNERGY" />
        </motion.g>
      )}

      {/* ══ PHASE 4: VICTORY ══ */}
      {phase === 4 && (
        <motion.g>
          {/* Rainbow explosion rings */}
          {heroes.map((hero, i) => (
            <motion.circle key={i} cx={400} cy={285}
              initial={{ r: 65, opacity: 0.8 }}
              animate={{ r: 65 + (i + 1) * 55, opacity: 0 }}
              transition={{ delay: i * 0.22, duration: 2, repeat: Infinity }}
              fill="none" stroke={hero.color} strokeWidth={4}
            />
          ))}
          {/* Fireworks */}
          {['🎆', '🎇', '✨', '🌟', '💥', '🎉', '🏆'].map((em, i) => {
            const ang = i * (360 / 7) * Math.PI / 180
            const r = 120 + (i % 3) * 40
            return (
              <motion.text key={i}
                x={400 + Math.cos(ang) * r}
                y={285 + Math.sin(ang) * r * 0.75}
                fontSize={30 + (i % 3) * 10} textAnchor="middle"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.6, 1.2], opacity: [0, 1, 0.9] }}
                transition={{ delay: 0.5 + i * 0.13, type: 'spring', stiffness: 180 }}>
                {em}
              </motion.text>
            )
          })}
          <Bubble x={400} y={130} width={250}
            text={['SYNERGY COMPLETE!', '6 molecules — 1 mission.', 'Arjun is HEALED! 🎉']}
            color="#FFD700" delay={1} subtext="✅ Polypharmacy works!" />
          <motion.text x={400} y={510} fill="#FFD700" fontSize={15} textAnchor="middle" fontWeight={800}
            animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
            ⚡ MASTER KADHA — FULL RECOVERY ACHIEVED! ⚡
          </motion.text>
        </motion.g>
      )}
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE SCRIPT — 4 phases per day, kid-friendly labels and body text
// ═══════════════════════════════════════════════════════════════════════════
const PHASE_SCRIPT = {
  1: [
    { label: '🔬 Phase 1 — Inside the Bloodstream',
      body: 'The liver is like a strict security guard. It sees new medicine and tries to chop it up with scissors (enzymes) before it can reach the sick cell!' },
    { label: '🛡️ Phase 2 — Piperine Blocks the Scissors',
      body: 'But Piperine (from black pepper) rushes in and wraps around the scissors — BLOCKED! Now the liver cannot destroy the medicine.' },
    { label: '⚡ Phase 3 — Curcumin Travels to the Sick Cell',
      body: 'Safe from the liver, golden Curcumin zooms through the blood and finds the inflamed, angry cell. It fits perfectly into the NF-kB receptor — like a key in a lock!' },
    { label: '✅ Phase 4 — Inflammation Switched OFF!',
      body: 'With Curcumin in the lock, the NF-kB alarm is turned OFF. The cell stops sending pain signals. Swelling goes down. Arjun starts to feel better! 😊' },
  ],
  2: [
    { label: '🔬 Phase 1 — The Throat Under Attack',
      body: 'Healthy throat cells are doing their job. But viruses are flying in from outside, looking for a cell to grab onto and infect!' },
    { label: '🍃 Phase 2 — Eugenol Molecules Arrive',
      body: 'Eugenol from Tulsi spreads over every single throat cell and links together — tile by tile — forming a powerful hexagonal shield.' },
    { label: '🛡️ Phase 3 — Shield Powers Up!',
      body: 'The hexagonal shield glows bright green around all the cells. Viruses fly in, smash into the shield, and BOUNCE right off! They can\'t attach!' },
    { label: '✅ Phase 4 — Infection Stopped!',
      body: 'Every virus attack is defeated. Your healthy cells are completely safe. No new infection can start! Tulsi built an invisible fortress. 🏰' },
  ],
  3: [
    { label: '🔬 Phase 1 — A Dangerous Bacteria',
      body: 'This is Streptococcus — the germ that causes sore throat! It has flagella (tails) to swim around and a tough cell wall to protect itself.' },
    { label: '🍯 Phase 2 — Honey Uses Osmosis!',
      body: 'Honey is SO rich in sugar that it creates an osmosis pull — like a tiny vacuum cleaner — pulling water molecules OUT of the bacteria through its own wall. The germ shrivels!' },
    { label: '🔩 Phase 3 — Gingerol Drills Through!',
      body: 'Now that the wall is weakened, Gingerol molecules (from ginger) spin like power drills and punch holes right through the bacteria\'s wall. Fatal breach!' },
    { label: '💥 Phase 4 — Bacteria Destroyed!',
      body: 'The bacteria bursts apart. Honey softened it, Gingerol finished it. Your throat is clear. The Honey-Ginger team is a winning combination! 🏆' },
  ],
  4: [
    { label: '🔬 Phase 1 — Nasal Passage Blocked',
      body: 'Three big chunks of thick mucus (snot!) are blocking the nasal passage. Every breath feels like breathing through a blocked straw!' },
    { label: '♨️ Phase 2 — Steam Dilates Blood Vessels',
      body: 'The hot steam makes the tiny blood vessels inside the nose walls get WIDER (dilate). More warm healing blood rushes in, and Cineole molecules ride the steam upward.' },
    { label: '✂️ Phase 3 — Cineole Cuts the Mucus Bonds',
      body: 'Mucus is held together by protein chains. Cineole from eucalyptus acts like tiny scissors, snipping those chains. The solid gooey block starts to dissolve into liquid!' },
    { label: '💨 Phase 4 — Airway Clear!',
      body: 'The dissolved mucus drains away naturally. The nasal passage is completely open! Fresh air flows freely. Breathing is easy again. Steam therapy works! 😮‍💨' },
  ],
  5: [
    { label: '🔬 Phase 1 — Garlic Creates Allicin',
      body: 'When garlic is crushed or chewed, two chemicals inside it (Alliin + Alliinase) collide and react instantly to make a brand new molecule: Allicin — a natural antibiotic!' },
    { label: '⚡ Phase 2 — Allicin Vortex Forms',
      body: 'Allicin molecules enter the bloodstream and start orbiting the bacteria faster and faster, forming a spinning vortex that tightens with every second.' },
    { label: '🔒 Phase 3 — Locking the Breathing Enzyme',
      body: 'Allicin reaches the bacteria\'s oxygen enzyme — the part that lets it breathe. It locks onto it like a padlock, completely blocking it. The bacteria starts to suffocate.' },
    { label: '✅ Phase 4 — Bacteria Eliminated!',
      body: 'Without oxygen, the bacteria dies. Allicin is one of nature\'s most powerful antibiotics — and it comes from a humble kitchen ingredient: garlic! 🧄' },
  ],
  6: [
    { label: '🔬 Phase 1 — The Intestine\'s Tiny Gates',
      body: 'Your intestine wall has tiny gates (transporters). Normally, they are almost shut — only a little medicine squeezes through. Most is wasted and passed out of the body!' },
    { label: '🌶️ Phase 2 — Trikatu Forces Gates Open',
      body: 'Trikatu (black pepper + long pepper + dry ginger) sends molecules to the intestine gates. They push and pry the gates open MUCH wider than normal — like a crowbar!' },
    { label: '🚀 Phase 3 — Medicine Floods the Bloodstream',
      body: 'With wide-open gates, a massive flood of medicine molecules pours through into the blood! Studies show Trikatu can increase absorption by up to 2000%!' },
    { label: '✅ Phase 4 — Super Absorption Complete!',
      body: 'This is called Bio-Enhancement — Trikatu makes every other medicine MORE powerful! That\'s why it\'s added to Ayurvedic recipes. Tiny spice, HUGE effect! 🌶️' },
  ],
  7: [
    { label: '⚡ Phase 1 — Meet the 6 Molecular Heroes',
      body: 'Master Kadha contains ALL six active molecules: Curcumin, Piperine, Eugenol, Gingerol, Allicin, and Cineole. Each one has a unique superpower!' },
    { label: '🌀 Phase 2 — All Heroes Orbit Together',
      body: 'In the bloodstream, all 6 molecules orbit the infection site together. Their combined presence is called Polypharmacy — medicine working as a team!' },
    { label: '✨ Phase 3 — Synergy Strike!',
      body: 'All six molecules attack the infection at exactly the same moment from every direction. There is no escape. Each molecule does its specific job simultaneously!' },
    { label: '🏆 Phase 4 — Full Recovery!',
      body: 'Piperine opened gates, Curcumin silenced alarms, Eugenol shielded cells, Gingerol destroyed bacteria, Allicin blocked enzymes, Cineole cleared mucus. HEALED! 🎉' },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// CHROME COMPONENTS — shared outer shell
// ═══════════════════════════════════════════════════════════════════════════

function PhaseProgressBar({ phase, total, color }) {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px',
      background: 'rgba(255,255,255,0.1)', zIndex: 30 }}>
      <motion.div
        animate={{ width: `${(phase / total) * 100}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{ height: '100%', background: color, borderRadius: '0 3px 3px 0',
          boxShadow: `0 0 10px ${color}` }}
      />
    </div>
  )
}

function PhaseTimer({ phase, total, durationMs, color }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    setElapsed(0)
    const interval = setInterval(() => setElapsed(e => e + 100), 100)
    return () => clearInterval(interval)
  }, [phase])
  const pct = Math.min(1, elapsed / durationMs)
  return (
    <div style={{ position: 'absolute', top: '5px', right: '12px', zIndex: 30,
      display: 'flex', alignItems: 'center', gap: '6px' }}>
      <svg width="28" height="28">
        <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
        <motion.circle cx="14" cy="14" r="11" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${2 * Math.PI * 11}`}
          strokeDashoffset={`${2 * Math.PI * 11 * (1 - pct)}`}
          strokeLinecap="round"
          style={{ transformOrigin: '14px 14px', rotate: '-90deg' }}
        />
      </svg>
      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem' }}>
        {phase}/{total}
      </span>
    </div>
  )
}

function PhaseSubtitle({ phase, label, body, color }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={phase}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.55 }}
        style={{
          width: '300px',
          padding: '32px 24px',
          background: '#050D18',
          borderLeft: `1px solid ${color}33`,
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flexShrink: 0
        }}>
        <p style={{ color, fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.14em', margin: '0 0 12px' }}>
          {label}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: '1.05rem', margin: 0,
          lineHeight: 1.6 }}>
          {body}
        </p>
      </motion.div>
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════
const DAY_COLORS = { 1: '#FFD700', 2: '#00C853', 3: '#FF6D00', 4: '#40C4FF', 5: '#F9A825', 6: '#CE93D8', 7: '#E040FB' }
const DAY_NAMES  = {
  1: 'Haldi Milk — Curcumin & Piperine',
  2: 'Tulsi Drink — Eugenol Shield',
  3: 'Ginger Honey — Osmosis & Gingerol',
  4: 'Steam Therapy — Cineole Clears Mucus',
  5: 'Herbal Soup — Allicin Antibiotic',
  6: 'Spice Mix — Trikatu Bio-Enhancement',
  7: 'Master Kadha — Full Synergy',
}
const ANIM_MAP = { 1: Day1_Animation, 2: Day2_Animation, 3: Day3_Animation, 4: Day4_Animation, 5: Day5_Animation, 6: Day6_Animation, 7: Day7_Animation }
const TOTAL_PHASES = 4

export default function MolecularCinematics({ day, onComplete }) {
  const [phase, setPhase] = useState(1)
  const color = DAY_COLORS[day] || '#FFD700'
  const AnimComponent = ANIM_MAP[day] || Day1_Animation
  const script = PHASE_SCRIPT[day] || PHASE_SCRIPT[1]
  const currentScript = script[phase - 1] || script[0]

  useEffect(() => { setPhase(1) }, [day])

  useEffect(() => {
    const t = setTimeout(() => {
      if (phase < TOTAL_PHASES) {
        setPhase(p => p + 1)
      } else {
        setTimeout(() => { if (onComplete) onComplete() }, 1400)
      }
    }, PHASE_MS)
    return () => clearTimeout(t)
  }, [phase, onComplete])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: '#030812',
        display: 'flex', flexDirection: 'row', overflow: 'hidden', zIndex: 50 }}>
      {/* Progress bar */}
      <PhaseProgressBar phase={phase} total={TOTAL_PHASES} color={color} />
      {/* Timer ring */}
      <PhaseTimer phase={phase} total={TOTAL_PHASES} durationMs={PHASE_MS} color={color} />

      {/* Day title */}
      <div style={{ position: 'absolute', top: '6px', left: 0, right: '60px', zIndex: 20,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
        <motion.p style={{ color, fontSize: '0.82rem', fontWeight: 700, margin: 0,
          letterSpacing: '0.05em', textShadow: `0 0 14px ${color}` }}>
          🔬 {DAY_NAMES[day] || `Day ${day} Molecular View`}
        </motion.p>
        {/* Phase dots */}
        <div style={{ display: 'flex', gap: '5px', marginLeft: '8px' }}>
          {Array.from({ length: TOTAL_PHASES }).map((_, i) => (
            <motion.div key={i}
              animate={{ scale: i + 1 === phase ? 1.5 : 1, opacity: i + 1 <= phase ? 1 : 0.25 }}
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: color }}
            />
          ))}
        </div>
      </div>

      {/* SVG canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', marginTop: '0px' }}>
        <AnimComponent phase={phase} />
      </div>
      
      {/* Subtitle strip - Rendered below the canvas instead of over it */}
      <PhaseSubtitle phase={phase} label={currentScript.label}
        body={currentScript.body} color={color} />
    </motion.div>
  )
}
