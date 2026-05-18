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
      { id: 'honey',        name: 'Honey',           emoji: '🍯', color: '#FFA000',  properties: ['antibacterial', 'soothing'] },
    ],
    distractors: [
      { id: 'ketchup',   name: 'Ketchup',    emoji: '🍅', color: '#FF1744', properties: ['acidic', 'junk'] },
      { id: 'ice_cream', name: 'Ice Cream',  emoji: '🍦', color: '#CE93D8', properties: ['cooling', 'sugary'] },
      { id: 'soda',      name: 'Soda',       emoji: '🥤', color: '#40C4FF', properties: ['carbonated', 'cooling'] },
      { id: 'oil',       name: 'Cooking Oil',emoji: '🫙', color: '#FFE082', properties: ['junk'] },
      { id: 'salt',      name: 'Salt',       emoji: '🧂', color: '#ECEFF1', properties: ['junk'] },
    ],
    correctSet: ['milk', 'haldi', 'black_pepper', 'honey'],
    particleScene: 'HaldiParticles',
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
  const props = item.properties || []
  if (props.includes('cooling'))    return { msg: '🥶 Too cold! Arjun is shivering more!',     effect: 'worse' }
  if (props.includes('carbonated')) return { msg: '😬 Soda made Arjun burp and cough!',        effect: 'worse' }
  if (props.includes('acidic'))     return { msg: '🔥 Too acidic! Arjun\'s throat burns!',     effect: 'worse' }
  if (props.includes('junk'))       return { msg: '😑 Junk food — zero medicinal value!',      effect: 'neutral' }
  if (props.includes('sugary'))     return { msg: '🍬 Too sweet — no healing effect here!',    effect: 'neutral' }
  return { msg: '😐 No change... that ingredient doesn\'t help here.',                          effect: 'neutral' }
}
