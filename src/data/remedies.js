/**
 * remedies.js — All 7 remedy definitions
 * DISCOVERY SYSTEM: 8-10 ingredients per day (4 correct + 4-6 distractors)
 * Player must experiment — no labels, no hints upfront.
 * Wrong picks reveal the ingredient's hidden properties as clues.
 */

export const PROPERTY_LABELS = {
  'anti-inflammatory': '🔥 Anti-inflammatory',
  'antiviral':         '🦠 Antiviral',
  'antibacterial':     '🧫 Antibacterial',
  'expectorant':       '💨 Expectorant',
  'warming':           '♨️ Warming',
  'cooling':           '❄️ Cooling',
  'immunity-boost':    '🛡️ Immunity booster',
  'bioenhancer':       '⚡ Bioenhancer',
  'antioxidant':       '✨ Antioxidant',
  'soothing':          '😌 Soothing',
  'decongestant':      '👃 Decongestant',
  'sugary':            '🍬 Sugary (no effect)',
  'junk':              '🚫 Junk food',
  'acidic':            '🧪 Too acidic',
  'carbonated':        '🥤 Carbonated (harmful)',
}

export const REMEDIES = [
  {
    day: 1,
    name: 'Haldi Milk',
    nameHindi: 'हल्दी दूध',
    subtitle: 'Golden Healing Milk',
    icon: '🥛',
    color: '#FFD700',
    colorLight: '#FFF9C4',
    targetTemp: 70,
    description: 'A warm golden drink made with turmeric and milk to fight infection.',
    requiredProperties: ['anti-inflammatory', 'antiviral', 'bioenhancer', 'soothing'],
    ingredients: [
      { id: 'milk',         name: 'Milk',            emoji: '🥛', color: '#FFFFFF',  properties: ['soothing', 'immunity-boost'] },
      { id: 'haldi',        name: 'Haldi (Turmeric)',emoji: '🟡', color: '#FFD700',  properties: ['anti-inflammatory', 'antiviral'] },
      { id: 'black_pepper', name: 'Black Pepper',    emoji: '⚫', color: '#555555',  properties: ['bioenhancer', 'warming'] },
    ],
    distractors: [
      // ⚠️ Honey is a distractor — Ayurveda says heating honey makes it toxic!
      { id: 'honey',     name: 'Honey',      emoji: '🍯', color: '#FFA000', properties: ['sugary'], wrongReason: '🍯 In Ayurveda, boiling honey creates toxins! Add it only after cooling.' },
      { id: 'ketchup',   name: 'Ketchup',    emoji: '🍅', color: '#FF1744', properties: ['acidic', 'junk'] },
      { id: 'ice_cream', name: 'Ice Cream',  emoji: '🍦', color: '#CE93D8', properties: ['cooling', 'sugary'] },
      { id: 'soda',      name: 'Soda',       emoji: '🥤', color: '#40C4FF', properties: ['carbonated', 'cooling'] },
      { id: 'oil',       name: 'Cooking Oil',emoji: '🫙', color: '#FFE082', properties: ['junk'] },
      { id: 'salt',      name: 'Salt',       emoji: '🧂', color: '#ECEFF1', properties: ['junk'] },
    ],
    correctSet: ['milk', 'haldi', 'black_pepper'],
    particleScene: 'HaldiParticles',
    parmanu: {
      id: 'curcumin',
      moleculeName: 'Curcumin',
      sanskritName: 'कुरकुमिन',
      sourceIngredient: 'Turmeric (Haldi)',
      emoji: '🟡',
      color: '#FFD700',
      atomicAction: 'Binds to NF-kB receptor and switches off the body\'s germ alarm signal.',
      kidsExplanation: 'Curcumin is like a tiny golden key that turns off the alarm that makes your body feel sick!',
      scienceFact: 'Curcumin can cross the blood-brain barrier, making it one of the most powerful natural anti-inflammatories known to science.',
      // Describes how particles behave in the canvas animation
      particleRole: 'blocker', // attacks receptor sites on bacteria
      particleColor: '#FFD700',
      targetColor: '#FF3D00', // bacteria/enemy color
    },
  },
  {
    day: 2,
    name: 'Tulsi Drink',
    nameHindi: 'तुलसी पेय',
    subtitle: 'Holy Basil Brew',
    icon: '🌿',
    color: '#00C853',
    colorLight: '#C8E6C9',
    targetTemp: 65,
    description: 'A herbal brew with holy basil leaves to boost immunity.',
    requiredProperties: ['antiviral', 'immunity-boost', 'warming', 'antibacterial'],
    ingredients: [
      { id: 'water',        name: 'Water',        emoji: '💧', color: '#40C4FF', properties: ['soothing'] },
      { id: 'tulsi_leaves', name: 'Tulsi Leaves', emoji: '🌿', color: '#00C853', properties: ['antiviral', 'immunity-boost'] },
      { id: 'ginger',       name: 'Ginger',       emoji: '🫚', color: '#FF8F00', properties: ['warming', 'antibacterial'] },
      { id: 'honey',        name: 'Honey',        emoji: '🍯', color: '#FFA000', properties: ['antibacterial', 'soothing'] },
    ],
    distractors: [
      { id: 'cola',       name: 'Cola',       emoji: '🥤', color: '#4E342E', properties: ['carbonated', 'sugary'] },
      { id: 'chips',      name: 'Chips',      emoji: '🍟', color: '#FFD54F', properties: ['junk', 'acidic'] },
      { id: 'cold_juice', name: 'Cold Juice', emoji: '🧃', color: '#66BB6A', properties: ['cooling', 'sugary'] },
      { id: 'coffee',     name: 'Coffee',     emoji: '☕', color: '#5D4037', properties: ['acidic', 'junk'] },
      { id: 'salt',       name: 'Salt',       emoji: '🧂', color: '#ECEFF1', properties: ['junk'] },
    ],
    correctSet: ['water', 'tulsi_leaves', 'ginger', 'honey'],
    particleScene: 'TulsiParticles',
    parmanu: {
      id: 'eugenol',
      moleculeName: 'Eugenol',
      sanskritName: 'यूजेनॉल',
      sourceIngredient: 'Tulsi (Holy Basil)',
      emoji: '🌿',
      color: '#00C853',
      atomicAction: 'Coats the surface of throat cells forming a protective antiviral shield layer.',
      kidsExplanation: 'Eugenol is like a tiny green shield that wraps around your throat cells so viruses can\'t get in!',
      scienceFact: 'Eugenol is also found in cloves and has been used in dentistry as a natural anaesthetic for over 100 years.',
      particleRole: 'shield', // spirals outward coating cells
      particleColor: '#00E676',
      targetColor: '#FF6D00',
    },
  },
  {
    day: 3,
    name: 'Ginger Honey',
    nameHindi: 'अदरक शहद',
    subtitle: 'Ginger Honey Mix',
    icon: '🫚',
    color: '#FF6D00',
    colorLight: '#FFE0B2',
    targetTemp: 60,
    description: 'Warm ginger and honey mixture to fight bacteria and soothe the throat.',
    requiredProperties: ['warming', 'antibacterial', 'soothing', 'antioxidant'],
    ingredients: [
      { id: 'warm_water',   name: 'Warm Water',  emoji: '♨️', color: '#BBDEFB', properties: ['warming', 'soothing'] },
      { id: 'ginger_juice', name: 'Ginger Juice',emoji: '🫚', color: '#FF6D00', properties: ['warming', 'antibacterial'] },
      { id: 'honey',        name: 'Honey',       emoji: '🍯', color: '#FFA000', properties: ['antibacterial', 'soothing'] },
      { id: 'lemon',        name: 'Lemon',       emoji: '🍋', color: '#FDD835', properties: ['antioxidant', 'antiviral'] },
    ],
    distractors: [
      { id: 'chocolate',  name: 'Chocolate',  emoji: '🍫', color: '#5D4037', properties: ['sugary', 'junk'] },
      { id: 'candy',      name: 'Candy',      emoji: '🍬', color: '#E040FB', properties: ['sugary', 'junk'] },
      { id: 'cold_water', name: 'Cold Water', emoji: '🧊', color: '#90CAF9', properties: ['cooling'] },
      { id: 'ketchup',    name: 'Ketchup',    emoji: '🍅', color: '#FF1744', properties: ['acidic', 'junk'] },
    ],
    correctSet: ['warm_water', 'ginger_juice', 'honey', 'lemon'],
    particleScene: 'GingerParticles',
    parmanu: {
      id: 'gingerol',
      moleculeName: 'Gingerol',
      sanskritName: 'जिंजरोल',
      sourceIngredient: 'Ginger (Adrak)',
      emoji: '🫚',
      color: '#FF6D00',
      atomicAction: 'Punctures and dissolves the cell walls of bacteria, neutralising them completely.',
      kidsExplanation: 'Gingerol is like a tiny drill that pokes holes in the walls of bad bacteria so they fall apart!',
      scienceFact: 'Gingerol is 6-8x more potent when combined with honey — honey helps it penetrate deeper into bacterial membranes.',
      particleRole: 'driller', // homes in on bacteria, breaks walls
      particleColor: '#FF8F00',
      targetColor: '#C62828',
    },
  },
  {
    day: 4,
    name: 'Steam Therapy',
    nameHindi: 'भाप चिकित्सा',
    subtitle: 'Healing Steam',
    icon: '💨',
    color: '#40C4FF',
    colorLight: '#E1F5FE',
    targetTemp: 80,
    description: 'Warm steam therapy to clear nasal passages and fight congestion.',
    requiredProperties: ['decongestant', 'warming', 'expectorant', 'antiviral'],
    ingredients: [
      { id: 'hot_water',  name: 'Hot Water',       emoji: '♨️', color: '#E3F2FD', properties: ['warming', 'decongestant'] },
      { id: 'eucalyptus', name: 'Eucalyptus Oil',  emoji: '🌿', color: '#43A047', properties: ['decongestant', 'expectorant', 'antiviral'] },
      { id: 'towel',      name: 'Towel',           emoji: '🧣', color: '#FFFFFF', properties: ['warming', 'soothing'] },
      { id: 'bowl',       name: 'Large Bowl',      emoji: '🥣', color: '#B0BEC5', properties: ['warming'] },
    ],
    distractors: [
      { id: 'cold_water', name: 'Cold Water', emoji: '🧊', color: '#90CAF9', properties: ['cooling'] },
      { id: 'fan',        name: 'Fan',        emoji: '💨', color: '#CFD8DC', properties: ['cooling'] },
      { id: 'soap',       name: 'Soap',       emoji: '🧼', color: '#CE93D8', properties: ['junk', 'acidic'] },
      { id: 'ice_pack',   name: 'Ice Pack',   emoji: '🧊', color: '#80DEEA', properties: ['cooling'] },
      { id: 'cola',       name: 'Cola',       emoji: '🥤', color: '#4E342E', properties: ['carbonated', 'sugary'] },
    ],
    correctSet: ['hot_water', 'eucalyptus', 'towel', 'bowl'],
    particleScene: 'SteamParticles',
    parmanu: {
      id: 'cineole',
      moleculeName: '1,8-Cineole',
      sanskritName: 'सिनेओल',
      sourceIngredient: 'Eucalyptus Oil',
      emoji: '💨',
      color: '#40C4FF',
      atomicAction: 'Rides steam molecules upward through nasal passages, sweeping mucus and blocking viral entry points.',
      kidsExplanation: 'Cineole rides on steam like a tiny surfer and clears all the sticky mucus blocking your nose!',
      scienceFact: 'Cineole is one of the only natural molecules proven to reduce the frequency of cough by up to 36% in clinical trials.',
      particleRole: 'sweeper', // rises upward like steam
      particleColor: '#40C4FF',
      targetColor: '#78909C',
    },
  },
  {
    day: 5,
    name: 'Herbal Soup',
    nameHindi: 'जड़ी-बूटी सूप',
    subtitle: 'Immunity Soup',
    icon: '🍲',
    color: '#FF8F00',
    colorLight: '#FFF3E0',
    targetTemp: 75,
    description: 'A warm herbal soup packed with garlic and spices for immunity.',
    requiredProperties: ['antibacterial', 'anti-inflammatory', 'immunity-boost', 'warming'],
    ingredients: [
      { id: 'vegetable_broth', name: 'Vegetable Broth', emoji: '🍲', color: '#FF8F00', properties: ['immunity-boost', 'soothing'] },
      { id: 'garlic',          name: 'Garlic',          emoji: '🧄', color: '#F5F5DC', properties: ['antibacterial', 'immunity-boost'] },
      { id: 'turmeric',        name: 'Turmeric',        emoji: '🟡', color: '#FFD700', properties: ['anti-inflammatory', 'antioxidant'] },
      { id: 'black_pepper',    name: 'Black Pepper',    emoji: '⚫', color: '#555555', properties: ['bioenhancer', 'warming'] },
    ],
    distractors: [
      { id: 'pizza',    name: 'Pizza',    emoji: '🍕', color: '#FF7043', properties: ['junk', 'acidic'] },
      { id: 'burger',   name: 'Burger',   emoji: '🍔', color: '#8D6E63', properties: ['junk', 'sugary'] },
      { id: 'iced_tea', name: 'Iced Tea', emoji: '🧊', color: '#B3E5FC', properties: ['cooling', 'sugary'] },
      { id: 'chips',    name: 'Chips',    emoji: '🍟', color: '#FFD54F', properties: ['junk', 'acidic'] },
      { id: 'soda',     name: 'Soda',     emoji: '🥤', color: '#40C4FF', properties: ['carbonated', 'cooling'] },
    ],
    correctSet: ['vegetable_broth', 'garlic', 'turmeric', 'black_pepper'],
    particleScene: 'SoupParticles',
    parmanu: {
      id: 'allicin',
      moleculeName: 'Allicin',
      sanskritName: 'एलिसिन',
      sourceIngredient: 'Garlic (Lahsun)',
      emoji: '🧄',
      color: '#FFFDE7',
      atomicAction: 'Allicin, quercetin, and beta-carotene form a vortex that attacks bacteria from multiple angles simultaneously.',
      kidsExplanation: 'Allicin is nature\'s own antibiotic — it spins like a vortex and hits bacteria from all sides at once!',
      scienceFact: 'Allicin is only released when garlic is crushed or chopped — the enzyme alliinase converts alliin into allicin in seconds.',
      particleRole: 'vortex', // swirls in a triple-helix attack pattern
      particleColor: '#F9A825',
      targetColor: '#E53935',
    },
  },
  {
    day: 6,
    name: 'Spice Mix',
    nameHindi: 'मसाला मिश्रण',
    subtitle: 'Trikatu Power Mix',
    icon: '⭐',
    color: '#E040FB',
    colorLight: '#F3E5F5',
    targetTemp: 85,
    description: 'A powerful spice mix (Trikatu) that amplifies all other remedies.',
    requiredProperties: ['bioenhancer', 'expectorant', 'warming', 'antibacterial'],
    ingredients: [
      { id: 'black_pepper', name: 'Black Pepper', emoji: '⚫', color: '#555555', properties: ['bioenhancer', 'warming'] },
      { id: 'long_pepper',  name: 'Long Pepper',  emoji: '🌶️', color: '#D32F2F', properties: ['expectorant', 'warming'] },
      { id: 'dry_ginger',   name: 'Dry Ginger',   emoji: '🫚', color: '#BCAAA4', properties: ['warming', 'antibacterial'] },
      { id: 'honey',        name: 'Honey',         emoji: '🍯', color: '#FFA000', properties: ['antibacterial', 'soothing'] },
    ],
    distractors: [
      { id: 'sugar',   name: 'Sugar',   emoji: '🍬', color: '#FFFFFF', properties: ['sugary'] },
      { id: 'salt',    name: 'Salt',    emoji: '🧂', color: '#ECEFF1', properties: ['junk'] },
      { id: 'vinegar', name: 'Vinegar', emoji: '🍶', color: '#FFF9C4', properties: ['acidic', 'cooling'] },
      { id: 'oil',     name: 'Cooking Oil', emoji: '🫙', color: '#FFE082', properties: ['junk'] },
    ],
    correctSet: ['black_pepper', 'long_pepper', 'dry_ginger', 'honey'],
    particleScene: 'SpiceParticles',
    parmanu: {
      id: 'piperine',
      moleculeName: 'Piperine',
      sanskritName: 'पिपेरिन',
      sourceIngredient: 'Black Pepper (Kali Mirch)',
      emoji: '⚫',
      color: '#E040FB',
      atomicAction: 'Attaches to curcumin molecules, inhibiting intestinal enzymes that would otherwise destroy curcumin before it reaches the blood.',
      kidsExplanation: 'Piperine is like a bodyguard for curcumin — it holds onto it tight so it doesn\'t get destroyed on its way into your blood!',
      scienceFact: 'Just 20mg of piperine increases curcumin absorption by 2000% — this is why black pepper and turmeric always appear together in traditional medicine.',
      particleRole: 'amplifier', // latches onto other particles, makes them glow brighter
      particleColor: '#CE93D8',
      targetColor: '#FFD700',
    },
  },
  {
    day: 7,
    name: 'Kadha',
    nameHindi: 'काढ़ा',
    subtitle: 'The Ultimate Healing Drink',
    icon: '👑',
    color: '#FFD700',
    colorLight: '#FFF9C4',
    targetTemp: 90,
    description: 'The ultimate healing Kadha combining all 7 days of wisdom.',
    requiredProperties: ['antiviral', 'anti-inflammatory', 'warming', 'bioenhancer', 'immunity-boost', 'antibacterial'],
    ingredients: [
      { id: 'water',       name: 'Water',               emoji: '💧', color: '#40C4FF', properties: ['soothing'] },
      { id: 'tulsi',       name: 'Tulsi',               emoji: '🌿', color: '#00C853', properties: ['antiviral', 'immunity-boost'] },
      { id: 'ginger',      name: 'Ginger',              emoji: '🫚', color: '#FF6D00', properties: ['warming', 'antibacterial'] },
      { id: 'haldi',       name: 'Haldi',               emoji: '🟡', color: '#FFD700', properties: ['anti-inflammatory', 'antiviral'] },
      { id: 'dalchini',    name: 'Dalchini (Cinnamon)', emoji: '🫕', color: '#8D6E63', properties: ['warming', 'antioxidant'] },
      { id: 'black_pepper',name: 'Black Pepper',        emoji: '⚫', color: '#555555', properties: ['bioenhancer', 'warming'] },
    ],
    distractors: [
      { id: 'soda',  name: 'Soda',  emoji: '🥤', color: '#FF5252', properties: ['carbonated', 'sugary'] },
      { id: 'chips', name: 'Chips', emoji: '🍟', color: '#FFD54F', properties: ['junk', 'acidic'] },
    ],
    correctSet: ['water', 'tulsi', 'ginger', 'haldi', 'dalchini', 'black_pepper'],
    particleScene: 'KadhaParticles',
    parmanu: {
      id: 'synergy',
      moleculeName: 'Master Synergy',
      sanskritName: 'समन्वय',
      sourceIngredient: 'Kadha (All 6 Ingredients)',
      emoji: '👑',
      color: '#FFD700',
      atomicAction: 'All six healing compounds converge in a chain reaction — each molecule amplifies the next, forming the ultimate healing stream.',
      kidsExplanation: 'When all 6 molecules join together, they form a golden chain that defeats every type of germ at the same time!',
      scienceFact: 'Polypharmacy synergy — multiple plant compounds working together — is the founding principle of Ayurvedic formulation (Rasayana).',
      particleRole: 'convergence', // all previous particle types appear and merge
      particleColor: '#FFD700',
      targetColor: '#FF0000',
    },
  },
]

export function getRemedyByDay(day) {
  return REMEDIES.find(r => r.day === day)
}

export function getAllIngredients(day) {
  const remedy = getRemedyByDay(day)
  if (!remedy) return []
  return [...remedy.ingredients, ...remedy.distractors].sort(() => Math.random() - 0.5)
}

export function getWrongPickFeedback(item) {
  // If item has a specific Ayurvedic/educational reason, show it
  if (item.wrongReason)     return { msg: item.wrongReason,                                          effect: 'neutral' }
  const props = item.properties || []
  if (props.includes('cooling'))    return { msg: '🥶 Too cold! Arjun is shivering more!',           effect: 'worse' }
  if (props.includes('carbonated')) return { msg: '😬 Soda made Arjun burp and cough!',              effect: 'worse' }
  if (props.includes('acidic'))     return { msg: '🔥 Too acidic! Arjun\'s throat burns!',           effect: 'worse' }
  if (props.includes('junk'))       return { msg: '😑 Junk food — zero medicinal value!',            effect: 'neutral' }
  if (props.includes('sugary'))     return { msg: '🍬 Too sweet — no healing effect here!',          effect: 'neutral' }
  return { msg: '😐 No change... that ingredient doesn\'t help here.',                               effect: 'neutral' }
}
