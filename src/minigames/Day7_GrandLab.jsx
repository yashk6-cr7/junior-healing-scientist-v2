/**
 * Day7_GrandLab.jsx — Grand Synthesis Lab
 * Inspired by Minecraft Crafting Table + Baba Is You property-logic
 * Player sees ALL properties the Kadha needs displayed as "property slots".
 * They pick ingredients from a grid. Each pick "fills" the properties it provides.
 * Visual: property tags light up green as they get covered.
 * Must cover all 6 required properties before submitting.
 * Wrong/redundant picks are allowed but the "synthesis" shows which slots are still empty.
 */
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArjunCharacter } from '../components/ArjunCharacter'
import { getAllIngredients, PROPERTY_LABELS } from '../data/remedies'

export function Day7_GrandLab({ remedy, onComplete }) {
  const allItems = useMemo(() => getAllIngredients(remedy.day), [remedy.day])
  const [selected, setSelected] = useState([]) // item ids chosen
  const [synthesised, setSynthesised] = useState(false)
  const [arjunMood, setMood]     = useState('thinking')
  const [arjunSpeech, setSpeech] = useState('Grand Lab! Pick 6 ingredients that cover all the healing properties! 🔬')

  // Which properties are currently covered by selected items
  const coveredProps = useMemo(() => {
    const all = allItems.filter(i => selected.includes(i.id))
    return new Set(all.flatMap(i => i.properties || []))
  }, [selected, allItems])

  const allCovered = remedy.requiredProperties.every(p => coveredProps.has(p))
  const coverage   = remedy.requiredProperties.filter(p => coveredProps.has(p)).length
  const total      = remedy.requiredProperties.length

  function toggleItem(item) {
    if (synthesised) return
    setSelected(prev => {
      if (prev.includes(item.id)) {
        return prev.filter(id => id !== item.id)
      } else {
        if (prev.length >= 8) return prev // max 8 picks
        return [...prev, item.id]
      }
    })
    // Update Arjun based on coverage (computed from the next selected state)
    const next = selected.includes(item.id)
      ? selected.filter(id => id !== item.id)
      : selected.length >= 8 ? selected : [...selected, item.id]
    const covered = new Set(allItems.filter(i => next.includes(i.id)).flatMap(i => i.properties || []))
    const covC = remedy.requiredProperties.filter(p => covered.has(p)).length
    if (covC === total) {
      setMood('excited'); setSpeech('All properties covered! Press Synthesise! ✨')
    } else if (covC >= Math.floor(total / 2)) {
      setMood('happy'); setSpeech(`${covC}/${total} properties covered — keep going! 💪`)
    } else if (covC > 0) {
      setMood('thinking'); setSpeech(`${covC}/${total} properties covered. What else does the Kadha need?`)
    } else {
      setMood('neutral'); setSpeech('Start picking! Each ingredient covers different healing properties.')
    }
  }

  function synthesise() {
    if (!allCovered) {
      setMood('wrong')
      setSpeech(`Still missing ${total - coverage} properties! Check the property board! 🔍`)
      return
    }
    setSynthesised(true)
    setMood('excited')
    setSpeech('🧪 Synthesising the Ultimate Kadha… SUCCESS! 👑')
    setTimeout(() => onComplete(selected), 2500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%', maxWidth: 500 }}>

      {/* Arjun */}
      <motion.div animate={{ background: arjunMood === 'wrong' ? 'rgba(255,80,80,0.1)' : arjunMood === 'excited' ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.05)' }}
        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px', borderRadius: 22, border: '2px solid rgba(255,255,255,0.1)', width: '100%' }}>
        <ArjunCharacter mood={arjunMood} size={0.7} />
        <div style={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.p key={arjunSpeech}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.4, color: arjunMood === 'wrong' ? '#FF8A65' : arjunMood === 'excited' ? '#FFD700' : 'rgba(255,255,255,0.8)' }}>
              {arjunSpeech}
            </motion.p>
          </AnimatePresence>
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
            Selected: {selected.length}/8 max · Properties covered: {coverage}/{total}
          </p>
        </div>
      </motion.div>

      {/* Property coverage board */}
      <div style={{ width: '100%', background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Required Properties</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {remedy.requiredProperties.map(prop => {
            const covered = coveredProps.has(prop)
            return (
              <motion.div key={prop}
                animate={{ scale: covered ? [1, 1.12, 1] : 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  padding: '4px 10px', borderRadius: 20,
                  background: covered ? 'rgba(105,240,174,0.18)' : 'rgba(255,255,255,0.05)',
                  border: `1.5px solid ${covered ? 'rgba(105,240,174,0.5)' : 'rgba(255,255,255,0.12)'}`,
                  fontSize: '0.68rem', fontWeight: 700,
                  color: covered ? '#69F0AE' : 'rgba(255,255,255,0.35)',
                  transition: 'all 0.25s',
                }}>
                {covered ? '✓ ' : ''}{PROPERTY_LABELS[prop]?.replace(/^.+? /, '') || prop}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Selected tray */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, width: '100%', justifyContent: 'center' }}>
          <AnimatePresence>
            {selected.map(id => {
              const item = allItems.find(i => i.id === id)
              if (!item) return null
              return (
                <motion.button key={id} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  onClick={() => toggleItem(item)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: `${item.color}22`, border: `1.5px solid ${item.color}55`, cursor: 'pointer', fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)' }}>
                  {item.emoji} {item.name} <span style={{ color: 'rgba(255,100,100,0.7)', marginLeft: 2 }}>✕</span>
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Ingredient grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))', gap: 8, width: '100%' }}>
        {allItems.map(item => {
          const isSelected = selected.includes(item.id)
          const itemProps  = item.properties || []
          const addsNew    = itemProps.some(p => remedy.requiredProperties.includes(p) && !coveredProps.has(p))
          return (
            <motion.button key={item.id}
              onClick={() => toggleItem(item)}
              whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.92 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 6px',
                borderRadius: 12, cursor: 'pointer',
                background: isSelected ? `${item.color}25` : addsNew ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.04)',
                border: `2px solid ${isSelected ? item.color + '70' : addsNew ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.18s',
                boxShadow: isSelected ? `0 0 10px ${item.color}44` : 'none',
              }}>
              <span style={{ fontSize: '1.4rem' }}>{item.emoji}</span>
              <span style={{ fontSize: '0.56rem', fontWeight: 600, textAlign: 'center', color: isSelected ? 'white' : 'var(--color-text-secondary)', lineHeight: 1.2 }}>{item.name}</span>
              {isSelected && <span style={{ fontSize: '0.5rem', color: '#69F0AE' }}>✓ added</span>}
              {!isSelected && addsNew && <span style={{ fontSize: '0.48rem', color: 'rgba(255,215,0,0.7)' }}>✦ useful</span>}
            </motion.button>
          )
        })}
      </div>

      {/* Synthesise button */}
      <motion.button onClick={synthesise} disabled={synthesised}
        whileHover={allCovered && !synthesised ? { scale: 1.06 } : {}}
        whileTap={allCovered ? { scale: 0.93 } : {}}
        animate={synthesised ? { scale: [1, 1.15, 1] } : {}}
        style={{
          padding: '14px 40px', borderRadius: 28,
          background: allCovered
            ? 'linear-gradient(135deg, #FFD700, #FF8F00)'
            : 'rgba(255,255,255,0.06)',
          border: `2px solid ${allCovered ? '#FFD70066' : 'rgba(255,255,255,0.12)'}`,
          color: allCovered ? '#1a1a1a' : 'rgba(255,255,255,0.3)',
          fontSize: '0.95rem', fontWeight: 800, cursor: allCovered ? 'pointer' : 'default',
          boxShadow: allCovered ? '0 0 28px rgba(255,215,0,0.35)' : 'none',
          transition: 'all 0.3s',
        }}>
        {synthesised ? '⚡ Synthesising…' : allCovered ? '⚗️ Synthesise the Kadha!' : `🔒 Cover ${total - coverage} more properties`}
      </motion.button>
    </div>
  )
}
