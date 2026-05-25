import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Day2_Experiment } from '../minigames/Day2_Experiment'
import { Day3_Memory } from '../minigames/Day3_Memory'
import { Day4_SpeedCatch } from '../minigames/Day4_SpeedCatch'
import { Day5_Dosage } from '../minigames/Day5_Dosage'
import { Day6_CardMatch } from '../minigames/Day6_CardMatch'
import { Day7_GrandLab } from '../minigames/Day7_GrandLab'
import { getRemedyByDay } from '../data/remedies'

const GAMES = [
  { id: 'shield', title: 'Cell Shield', icon: '🛡️', component: Day2_Experiment, day: 2 },
  { id: 'memory', title: 'Card Memory', icon: '🃏', component: Day3_Memory, day: 3 },
  { id: 'catch', title: 'Speed Catch', icon: '💨', component: Day4_SpeedCatch, day: 4 },
  { id: 'dosage', title: 'Perfect Dosage', icon: '⚖️', component: Day5_Dosage, day: 5 },
  { id: 'match', title: 'Molecule Match', icon: '🔬', component: Day6_CardMatch, day: 6 },
  { id: 'kadha', title: 'Grand Kadha Lab', icon: '🧪', component: Day7_GrandLab, day: 7 },
]

export default function BonusGames({ isOpen, onClose }) {
  const [activeGame, setActiveGame] = React.useState(null)

  if (!isOpen) return null

  const activeGameObj = GAMES.find(g => g.id === activeGame)
  const ActiveComponent = activeGameObj ? activeGameObj.component : null
  const remedy = activeGameObj ? getRemedyByDay(activeGameObj.day) : null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <h2 style={{ color: '#00E676', fontSize: '1.4rem', fontWeight: 800 }}>🎮 Bonus Lab Games</h2>
        <button onClick={() => activeGame ? setActiveGame(null) : onClose()} style={{
          background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 40, height: 40,
          color: 'white', fontSize: '1.2rem', cursor: 'pointer'
        }}>
          {activeGame ? '←' : '✕'}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <AnimatePresence mode="wait">
          {activeGame ? (
            <motion.div key="game" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div style={{ maxWidth: 800, margin: '0 auto', background: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
                <ActiveComponent remedy={remedy} onComplete={() => setActiveGame(null)} />
              </div>
            </motion.div>
          ) : (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', maxWidth: 800, margin: '0 auto' }}>
              {GAMES.map(game => (
                <motion.button key={game.id}
                  whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveGame(game.id)}
                  style={{
                    background: 'linear-gradient(145deg, rgba(20,30,50,0.8), rgba(10,15,30,0.9))',
                    border: '1px solid rgba(0,230,118,0.3)',
                    padding: '32px 16px', borderRadius: '20px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                    cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                  }}>
                  <span style={{ fontSize: '3rem' }}>{game.icon}</span>
                  <span style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700 }}>{game.title}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
