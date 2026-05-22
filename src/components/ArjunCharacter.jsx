/**
 * ArjunCharacter.jsx — Full-body animated SVG boy (110×175px)
 * mood: 'neutral' | 'happy' | 'wrong' | 'yuck' | 'excited' | 'thinking' | 'sleeping'
 */
import { motion } from 'framer-motion'

export function ArjunCharacter({ mood = 'neutral', size = 1 }) {
  const isHappy   = mood === 'happy' || mood === 'excited'
  const isWrong   = mood === 'wrong'
  const isYuck    = mood === 'yuck'
  const isExcited = mood === 'excited'
  const isThink   = mood === 'thinking'

  const W = Math.round(110 * size)
  const H = Math.round(175 * size)

  const mouth = isExcited ? 'M 36 57 Q 55 74 74 57'
    : isHappy   ? 'M 40 56 Q 55 70 70 56'
    : isWrong   ? 'M 40 64 Q 55 52 70 64'
    : isYuck    ? 'M 36 60 Q 45 54 55 60 Q 65 66 74 60'
    : isThink   ? 'M 44 60 Q 50 58 56 60 Q 62 62 68 60'
    : 'M 42 60 Q 55 62 68 60'

  const eyeRy  = isWrong ? 2 : isYuck ? 2.5 : isExcited ? 8 : isThink ? 5 : 6
  const eyeCol = isWrong ? '#EF5350' : isHappy ? '#1565C0' : '#1a1a1a'

  const LBrow = isWrong  ? { x1:38,y1:32,x2:52,y2:28 }
              : isHappy  ? { x1:38,y1:27,x2:52,y2:30 }
              : isThink  ? { x1:38,y1:27,x2:52,y2:29 }
              :             { x1:38,y1:30,x2:52,y2:30 }
  const RBrow = isWrong  ? { x1:58,y1:28,x2:72,y2:32 }
              : isHappy  ? { x1:58,y1:30,x2:72,y2:27 }
              : isThink  ? { x1:58,y1:28,x2:72,y2:30 }
              :             { x1:58,y1:30,x2:72,y2:30 }

  const shirtCol = isHappy ? '#1976D2' : isWrong ? '#546E7A' : '#37474F'
  const armL = isExcited ? 'M 35 110 Q 10 90 15 72'
             : isThink   ? 'M 35 110 Q 22 115 28 100'
             : isWrong   ? 'M 35 110 Q 12 118 14 136'
             :              'M 35 110 Q 15 120 18 140'
  const armR = isExcited ? 'M 75 110 Q 100 90 95 72'
             : isThink   ? 'M 75 110 Q 90 95 85 80'
             : isWrong   ? 'M 75 110 Q 98 118 96 136'
             :              'M 75 110 Q 95 120 92 140'

  return (
    <motion.div
      key={mood}
      animate={
        isWrong   ? { x: [-5, 5, -4, 4, -2, 2, 0], transition: { duration: 0.5 } } :
        isExcited ? { y: [0, -10, 0, -7, 0],        transition: { duration: 0.55 } } :
        isHappy   ? { y: [0, -5, 0],                transition: { duration: 0.4 } } :
        isThink   ? { rotate: [-2, 2, -2],           transition: { duration: 1.5, repeat: Infinity } } :
        {}
      }
      style={{ position: 'relative', width: W, height: H, flexShrink: 0 }}>

      <svg viewBox="0 0 110 175" width={W} height={H} style={{ overflow: 'visible' }}>

        {/* Shadow */}
        <ellipse cx="55" cy="171" rx="28" ry="5" fill="rgba(0,0,0,0.25)" />

        {/* Legs */}
        <rect x="37" y="148" width="14" height="22" rx="5" fill="#1A237E" />
        <rect x="59" y="148" width="14" height="22" rx="5" fill="#1A237E" />
        {/* Shoes */}
        <ellipse cx="44" cy="170" rx="10" ry="5" fill="#212121" />
        <ellipse cx="66" cy="170" rx="10" ry="5" fill="#212121" />

        {/* Body */}
        <rect x="28" y="108" width="54" height="44" rx="10" fill={shirtCol} />
        <path d="M 44 108 L 55 122 L 66 108" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="28" y="108" width="54" height="10" rx="10" fill="rgba(255,255,255,0.08)" />

        {/* Arms */}
        <path d={armL} fill="none" stroke={shirtCol} strokeWidth="13" strokeLinecap="round" />
        <path d={armR} fill="none" stroke={shirtCol} strokeWidth="13" strokeLinecap="round" />
        {/* Hands */}
        <circle cx={isExcited ? 15 : isThink ? 28 : 18} cy={isExcited ? 72 : isThink ? 100 : 140} r="8" fill="#FFCC80" />
        <circle cx={isExcited ? 95 : isThink ? 85 : 92} cy={isExcited ? 72 : isThink ? 80 : 140} r="8" fill="#FFCC80" />
        {/* Thinking finger on chin */}
        {isThink && <circle cx="55" cy="80" r="4" fill="#FFCC80" />}

        {/* Neck */}
        <rect x="47" y="98" width="16" height="13" rx="4" fill="#FFCC80" />

        {/* Head */}
        <ellipse cx="55" cy="62" rx="34" ry="36"
          fill="#FFCC80"
          stroke={isWrong ? '#EF5350' : isExcited ? '#FFD700' : '#E6A800'}
          strokeWidth="2"
        />
        {isExcited && <ellipse cx="55" cy="62" rx="34" ry="36" fill="none" stroke="#FFD700" strokeWidth="3" opacity="0.4" />}

        {/* Hair */}
        <ellipse cx="55" cy="30" rx="32" ry="18" fill="#3E2723" />
        <ellipse cx="55" cy="38" rx="34" ry="8" fill="#3E2723" />
        <ellipse cx="55" cy="24" rx="10" ry="8" fill="#3E2723" />
        <ellipse cx="38" cy="28" rx="8" ry="6" fill="#3E2723" />
        <ellipse cx="72" cy="28" rx="8" ry="6" fill="#3E2723" />

        {/* Eyes */}
        <ellipse cx="41" cy="62" rx="7" ry={eyeRy} fill={eyeCol} />
        <ellipse cx="69" cy="62" rx="7" ry={eyeRy} fill={eyeCol} />
        {!isWrong && !isYuck && <>
          <circle cx="44" cy="58" r="2.5" fill="white" opacity="0.9" />
          <circle cx="72" cy="58" r="2.5" fill="white" opacity="0.9" />
        </>}
        {isExcited && <>
          <polygon points="41,54 42.5,58.5 47,58.5 43.5,61.5 44.5,66 41,63 37.5,66 38.5,61.5 35,58.5 39.5,58.5" fill="#FFD700" />
          <polygon points="69,54 70.5,58.5 75,58.5 71.5,61.5 72.5,66 69,63 65.5,66 66.5,61.5 63,58.5 67.5,58.5" fill="#FFD700" />
        </>}
        {isYuck && <>
          <line x1="35" y1="56" x2="47" y2="68" stroke="#EF5350" strokeWidth="3" strokeLinecap="round" />
          <line x1="47" y1="56" x2="35" y2="68" stroke="#EF5350" strokeWidth="3" strokeLinecap="round" />
          <line x1="63" y1="56" x2="75" y2="68" stroke="#EF5350" strokeWidth="3" strokeLinecap="round" />
          <line x1="75" y1="56" x2="63" y2="68" stroke="#EF5350" strokeWidth="3" strokeLinecap="round" />
        </>}
        {isThink && <>
          <ellipse cx="41" cy="62" rx="7" ry="5" fill={eyeCol} />
          <ellipse cx="69" cy="62" rx="7" ry="5" fill={eyeCol} />
          {/* Thought bubble */}
          <circle cx="85" cy="35" r="12" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <circle cx="78" cy="50" r="5" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          <circle cx="73" cy="58" r="3" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <text x="85" y="39" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.7)">?</text>
        </>}

        {/* Eyebrows */}
        <line x1={LBrow.x1} y1={LBrow.y1} x2={LBrow.x2} y2={LBrow.y2} stroke="#4E342E" strokeWidth="3" strokeLinecap="round" />
        <line x1={RBrow.x1} y1={RBrow.y1} x2={RBrow.x2} y2={RBrow.y2} stroke="#4E342E" strokeWidth="3" strokeLinecap="round" />

        {/* Nose */}
        <path d="M 52 70 Q 55 76 58 70" fill="none" stroke="#BF8A6E" strokeWidth="1.5" strokeLinecap="round" />

        {/* Mouth */}
        <path d={mouth} fill="none" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" />
        {isExcited && <path d="M 40 58 Q 55 72 70 58 L 70 65 Q 55 77 40 65 Z" fill="white" opacity="0.85" />}
        {isHappy && <>
          <ellipse cx="28" cy="74" rx="9" ry="5" fill="rgba(255,120,100,0.3)" />
          <ellipse cx="82" cy="74" rx="9" ry="5" fill="rgba(255,120,100,0.3)" />
        </>}
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
            top: [4,-4,12][i], left: [92,50,104][i],
            fontSize: '1.1rem', color: '#FFD700', pointerEvents: 'none',
          }}>{s}</motion.span>
      ))}
    </motion.div>
  )
}
