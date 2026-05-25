/**
 * App.jsx — Main app with stage routing
 * Routes between Stage 1 (Diagnose), Stage 2 (Prepare), Stage 3 (Heal).
 * Manages top-level layout with animated gradient background.
 */
import React, { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameState } from './hooks/useGameState'
import Stage1_Diagnose from './stages/Stage1_Diagnose'
import Stage2_Prepare from './stages/Stage2_Prepare'
import Stage3_Heal from './stages/Stage3_Heal'
import SoundManager from './components/SoundManager'
import ProgressBar from './components/ProgressBar'
import HealerJournal from './components/HealerJournal'
import ParmanuAlbum from './components/ParmanuAlbum'
import BonusGames from './components/BonusGames'
import { ACTIONS } from './context/GameContext'

const stageComponents = {
  1: Stage1_Diagnose,
  2: Stage2_Prepare,
  3: Stage3_Heal,
}

const pageTransition = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
  transition: { duration: 0.4, ease: 'easeInOut' },
}

function App() {
  const { state, dispatch } = useGameState()
  const StageComponent = stageComponents[state.currentStage] || Stage1_Diagnose

  // ── Parmanu Album state ──
  // albumOpen: whether the album modal is visible
  // highlightId: the molecule ID to spotlight (set after a new unlock)
  const [albumOpen, setAlbumOpen] = React.useState(false)
  const [highlightId, setHighlightId] = React.useState(null)
  const [bonusOpen, setBonusOpen] = React.useState(false)
  const [dayMenuOpen, setDayMenuOpen] = React.useState(false)

  const isGameComplete = (state.earnedBadges || []).includes('junior_healing_scientist')

  // Listen for new unlocks and auto-open album on first unlock
  const prevUnlockedCountRef = React.useRef(0)
  React.useEffect(() => {
    const count = (state.unlockedParmanus || []).length
    if (count > prevUnlockedCountRef.current) {
      // Something was just unlocked — open the album and spotlight it
      const newest = (state.unlockedParmanus || []).slice(-1)[0]
      setHighlightId(newest)
      setAlbumOpen(true)
      // After 3 seconds remove the spotlight
      const timer = setTimeout(() => setHighlightId(null), 3000)
      prevUnlockedCountRef.current = count
      return () => clearTimeout(timer)
    }
    prevUnlockedCountRef.current = count
  }, [state.unlockedParmanus])

  return (
    <div className="bg-animated" style={{ minHeight: '100dvh', position: 'relative' }}>
      {/* Sound toggle */}
      <SoundManager />

      {/* Healer's Journal */}
      <HealerJournal currentDay={state.currentDay} />

      {/* ── Parmanu Album Button ── */}
      {/* Sits top-right corner, opposite the journal */}
      <motion.button
        id="parmanu-album-btn"
        onClick={() => setAlbumOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        animate={{
          boxShadow: (state.unlockedParmanus || []).length > 0
            ? ['0 0 0px rgba(255,215,0,0)', '0 0 16px rgba(255,215,0,0.5)', '0 0 0px rgba(255,215,0,0)']
            : 'none',
        }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        title="Open Parmanu Collection"
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: 'var(--radius-full, 999px)',
          background: 'rgba(27, 40, 56, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,215,0,0.2)',
          cursor: 'pointer',
          fontSize: '0.82rem',
          color: '#FFD700',
          fontWeight: 600,
        }}
      >
        <span>⚛️</span>
        <span>{(state.unlockedParmanus || []).length}/7</span>
      </motion.button>

      {/* ── Bonus Games Button ── */}
      {isGameComplete && (
        <motion.button
          id="bonus-games-btn"
          onClick={() => setBonusOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          title="Open Bonus Lab Games"
          style={{
            position: 'fixed',
            top: '16px',
            right: '90px',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-full, 999px)',
            background: 'rgba(0, 200, 83, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0,255,136,0.5)',
            cursor: 'pointer',
            fontSize: '0.82rem',
            color: 'white',
            fontWeight: 800,
            boxShadow: '0 0 16px rgba(0,255,136,0.3)',
          }}
        >
          <span>🎮</span>
          <span>Bonus Games</span>
        </motion.button>
      )}

      {/* Day indicator / Selector */}
      <div style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 50 }}>
        <button onClick={() => setDayMenuOpen(!dayMenuOpen)} style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
          borderRadius: 'var(--radius-full)', background: 'rgba(27, 40, 56, 0.8)',
          backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)',
          fontSize: '0.85rem', color: 'var(--color-text-secondary)', cursor: 'pointer'
        }}>
          <span style={{ color: 'var(--color-gold)' }}>Day {state.currentDay}</span>
          <span>/ 7 ▼</span>
        </button>
        <AnimatePresence>
          {dayMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: 'rgba(13, 27, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '120px' }}>
              {Array.from({ length: 7 }).map((_, i) => {
                const d = i + 1;
                // Allow navigating to any unlocked day
                const isUnlocked = isGameComplete || d <= (state.unlockedParmanus?.length || 0) + 1;
                if (!isUnlocked) return null;
                return (
                  <button key={d} onClick={() => { 
                    dispatch({ type: ACTIONS.SET_DAY, payload: d }); 
                    setDayMenuOpen(false); 
                  }}
                  style={{ padding: '8px 16px', background: d === state.currentDay ? 'rgba(255,215,0,0.15)' : 'transparent', color: d === state.currentDay ? '#FFD700' : 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}>
                    Day {d}
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stage content with page transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${state.currentStage}-${state.currentDay}`}
          {...pageTransition}
          style={{ minHeight: '100dvh' }}
        >
          <StageComponent />
        </motion.div>
      </AnimatePresence>

      {/* Bottom progress bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: 'rgba(13, 27, 42, 0.9)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <ProgressBar
          progress={state.healingProgress}
          color="#00FF88"
          label="Healing Progress"
        />
      </div>
      {/* ── Parmanu Album Modal ── */}
      <ParmanuAlbum
        isOpen={albumOpen}
        onClose={() => setAlbumOpen(false)}
        unlockedIds={state.unlockedParmanus || []}
        highlightId={highlightId}
      />

      {/* ── Bonus Games Modal ── */}
      <BonusGames 
        isOpen={bonusOpen} 
        onClose={() => setBonusOpen(false)} 
      />
    </div>
  )
}

export default App
