import type { ConstitutionType } from '../types'

// 问卷题目数据结构
export interface ConstitutionQuestion {
  id: string           // 如 "q1", "q2"...
  text: string         // 题目文字
  constitutionType: ConstitutionType  // 属于哪种体质
  dimension: string    // 维度（如"总体特征"、"形体特征"等）
}

// 选项是统一的5级评分
export const ANSWER_OPTIONS = [
  { value: 1, label: '没有（不）' },
  { value: 2, label: '很少' },
  { value: 3, label: '有时' },
  { value: 4, label: '经常' },
  { value: 5, label: '总是' },
] as const

// 体质信息数据结构
export interface ConstitutionInfo {
  type: ConstitutionType
  name: string           // 中文名：平和质、气虚质等
  description: string    // 简要描述
  characteristics: string[]  // 主要特征
  susceptibility: string[]   // 易患疾病
  color: string         // 主题色 hex
  icon: string          // emoji图标
}

// ============================================================
// 9种体质完整信息
// ============================================================

export const CONSTITUTION_INFO: Record<ConstitutionType, ConstitutionInfo> = {
  BALANCED: {
    type: 'BALANCED',
    name: '平和质',
    description: '阴阳气血调和，体态适中，面色润泽，精力充沛，是最理想的体质状态。',
    characteristics: [
      '体形匀称健壮',
      '面色、肤色润泽',
      '头发稠密有光泽',
      '目光有神',
      '精力充沛，耐受寒热',
      '睡眠良好',
      '胃纳佳，二便正常',
      '舌色淡红，苔薄白',
      '脉和缓有力',
    ],
    susceptibility: [
      '平素患病较少',
    ],
    color: '#22c55e',
    icon: '🌿',
  },
  QI_DEFICIENCY: {
    type: 'QI_DEFICIENCY',
    name: '气虚质',
    description: '元气不足，以疲乏、气短、自汗等气虚表现为主要特征。',
    characteristics: [
      '容易疲乏',
      '声音低弱',
      '容易气短',
      '容易感冒',
      '喜静懒言',
      '精神不振',
      '舌淡红，舌边有齿痕',
      '脉弱',
    ],
    susceptibility: [
      '容易感冒',
      '病后迁延不愈',
      '易患内脏下垂',
      '虚劳',
    ],
    color: '#f59e0b',
    icon: '🍂',
  },
  YANG_DEFICIENCY: {
    type: 'YANG_DEFICIENCY',
    name: '阳虚质',
    description: '阳气不足，以畏寒怕冷、手足不温等虚寒表现为主要特征。',
    characteristics: [
      '手脚发凉',
      '胃脘部、背部或腰膝部怕冷',
      '衣服比别人穿得多',
      '耐受不了寒冷',
      '吃凉的东西感到不舒服',
      '大便稀溏',
      '舌淡胖嫩',
      '脉沉迟',
    ],
    susceptibility: [
      '易患痰饮、肿胀、泄泻等病',
      '感邪易从寒化',
      '易患寒痹',
    ],
    color: '#6366f1',
    icon: '❄️',
  },
  YIN_DEFICIENCY: {
    type: 'YIN_DEFICIENCY',
    name: '阴虚质',
    description: '阴液亏少，以口燥咽干、手足心热等虚热表现为主要特征。',
    characteristics: [
      '手足心热',
      '口燥咽干',
      '鼻微干',
      '眼睛干涩',
      '皮肤干燥',
      '大便干燥',
      '舌红少津少苔',
      '脉细数',
    ],
    susceptibility: [
      '易患虚劳、失精、不寐',
      '感邪易从热化',
      '易患阴亏燥热之病',
    ],
    color: '#ef4444',
    icon: '🔥',
  },
  PHLEGM_DAMPNESS: {
    type: 'PHLEGM_DAMPNESS',
    name: '痰湿质',
    description: '痰湿凝聚，以形体肥胖、腹部肥满、口黏苔腻等痰湿表现为主要特征。',
    characteristics: [
      '腹部肥满松软',
      '面部皮肤油脂较多',
      '多汗且黏',
      '容易胸闷、痰多',
      '口黏腻或甜',
      '身重不爽',
      '偏好甜食肥腻',
      '舌体胖大，苔白腻',
      '脉滑',
    ],
    susceptibility: [
      '易患消渴（糖尿病）',
      '中风（脑血管意外）',
      '胸痹（冠心病）',
      '眩晕（高血压）',
    ],
    color: '#a855f7',
    icon: '💧',
  },
  DAMP_HEAT: {
    type: 'DAMP_HEAT',
    name: '湿热质',
    description: '湿热内蕴，以面垢油光、口苦、苔黄腻等湿热表现为主要特征。',
    characteristics: [
      '面垢油光',
      '容易生痤疮粉刺',
      '口苦口臭',
      '大便黏滞不爽或燥结',
      '小便短黄',
      '身重困倦',
      '舌红，苔黄腻',
      '脉滑数',
    ],
    susceptibility: [
      '易患疮疖、黄疸',
      '热淋（泌尿系感染）',
      '带下病',
    ],
    color: '#f97316',
    icon: '🌡️',
  },
  BLOOD_STASIS: {
    type: 'BLOOD_STASIS',
    name: '血瘀质',
    description: '血行不畅，以肤色晦暗、舌质紫暗等血瘀表现为主要特征。',
    characteristics: [
      '肤色晦暗',
      '容易出现瘀斑',
      '面色晦暗',
      '嘴唇颜色偏暗',
      '眼眶暗黑',
      '容易健忘',
      '皮肤偏暗或色素沉着',
      '舌质暗，有瘀点瘀斑',
      '舌下络脉紫暗或增粗',
      '脉涩',
    ],
    susceptibility: [
      '易患症瘕（肿瘤）',
      '中风（脑血管意外）',
      '胸痹（冠心病）',
    ],
    color: '#7c3aed',
    icon: '🩸',
  },
  QI_STAGNATION: {
    type: 'QI_STAGNATION',
    name: '气郁质',
    description: '气机郁滞，以神情抑郁、忧虑脆弱等气郁表现为主要特征。',
    characteristics: [
      '神情抑郁',
      '情感脆弱',
      '忧郁寡欢',
      '胸胁胀满',
      '常叹气',
      '咽中如有异物梗阻',
      '容易受惊',
      '舌淡红，苔薄白',
      '脉弦',
    ],
    susceptibility: [
      '易患郁证（抑郁症）',
      '脏躁（癔症）',
      '不寐（失眠）',
      '梅核气（咽异感症）',
    ],
    color: '#64748b',
    icon: '🌫️',
  },
  SPECIAL: {
    type: 'SPECIAL',
    name: '特禀质',
    description: '先天失常，以生理缺陷、过敏反应等为主要特征。',
    characteristics: [
      '没有感冒也会打喷嚏',
      '没有感冒也会鼻塞、流鼻涕',
      '容易过敏（对药物、食物、气味、花粉等）',
      '皮肤容易起荨麻疹',
      '皮肤一抓就红，出现抓痕',
      '季节变化、气温变化容易身体不适',
    ],
    susceptibility: [
      '过敏性鼻炎',
      '过敏性哮喘',
      '荨麻疹',
      '花粉症',
      '药物过敏',
    ],
    color: '#ec4899',
    icon: '🌸',
  },
}

// ============================================================
// 标准60+道问卷题目（参照《中医体质分类与判定》标准）
// ============================================================

export const CONSTITUTION_QUESTIONS: ConstitutionQuestion[] = [
  // ========== 平和质 BALANCED（8题）==========
  {
    id: 'q1',
    text: '您精力充沛吗？',
    constitutionType: 'BALANCED',
    dimension: '总体特征',
  },
  {
    id: 'q2',
    text: '您容易疲乏吗？',
    constitutionType: 'BALANCED',
    dimension: '总体特征',
  },
  {
    id: 'q3',
    text: '您说话声音低弱无力吗？',
    constitutionType: 'BALANCED',
    dimension: '声音特征',
  },
  {
    id: 'q4',
    text: '您感到闷闷不乐、情绪低沉吗？',
    constitutionType: 'BALANCED',
    dimension: '情志特征',
  },
  {
    id: 'q5',
    text: '您比一般人耐受不了寒冷（冬天的寒冷，夏天的冷空调、电扇等）吗？',
    constitutionType: 'BALANCED',
    dimension: '寒热适应',
  },
  {
    id: 'q6',
    text: '您能适应外界自然和社会环境的变化吗？',
    constitutionType: 'BALANCED',
    dimension: '适应能力',
  },
  {
    id: 'q7',
    text: '您容易失眠吗？',
    constitutionType: 'BALANCED',
    dimension: '睡眠特征',
  },
  {
    id: 'q8',
    text: '您容易忘事（健忘）吗？',
    constitutionType: 'BALANCED',
    dimension: '认知特征',
  },

  // ========== 气虚质 QI_DEFICIENCY（8题）==========
  {
    id: 'q9',
    text: '您容易疲乏吗？',
    constitutionType: 'QI_DEFICIENCY',
    dimension: '总体特征',
  },
  {
    id: 'q10',
    text: '您容易气短（呼吸短促、接不上气）吗？',
    constitutionType: 'QI_DEFICIENCY',
    dimension: '呼吸特征',
  },
  {
    id: 'q11',
    text: '您容易心慌吗？',
    constitutionType: 'QI_DEFICIENCY',
    dimension: '心脏功能',
  },
  {
    id: 'q12',
    text: '您容易头晕或站起时晕眩吗？',
    constitutionType: 'QI_DEFICIENCY',
    dimension: '头部症状',
  },
  {
    id: 'q13',
    text: '您比别人容易感冒吗？',
    constitutionType: 'QI_DEFICIENCY',
    dimension: '免疫功能',
  },
  {
    id: 'q14',
    text: '您喜欢安静、懒得说话吗？',
    constitutionType: 'QI_DEFICIENCY',
    dimension: '性格特征',
  },
  {
    id: 'q15',
    text: '您说话声音低弱无力吗？',
    constitutionType: 'QI_DEFICIENCY',
    dimension: '声音特征',
  },
  {
    id: 'q16',
    text: '您活动量稍大就容易出虚汗吗？',
    constitutionType: 'QI_DEFICIENCY',
    dimension: '出汗特征',
  },

  // ========== 阳虚质 YANG_DEFICIENCY（7题）==========
  {
    id: 'q17',
    text: '您手脚发凉吗？',
    constitutionType: 'YANG_DEFICIENCY',
    dimension: '四肢特征',
  },
  {
    id: 'q18',
    text: '您胃脘部、背部或腰膝部怕冷吗？',
    constitutionType: 'YANG_DEFICIENCY',
    dimension: '寒冷敏感',
  },
  {
    id: 'q19',
    text: '您感到怕冷、衣服比别人穿得多吗？',
    constitutionType: 'YANG_DEFICIENCY',
    dimension: '寒冷敏感',
  },
  {
    id: 'q20',
    text: '您比一般人耐受不了寒冷（冬天的寒冷，夏天的冷空调、电扇等）吗？',
    constitutionType: 'YANG_DEFICIENCY',
    dimension: '寒热适应',
  },
  {
    id: 'q21',
    text: '您比别人容易感冒吗？',
    constitutionType: 'YANG_DEFICIENCY',
    dimension: '免疫功能',
  },
  {
    id: 'q22',
    text: '您吃（喝）凉的东西会感到不舒服或者怕吃（喝）凉的东西吗？',
    constitutionType: 'YANG_DEFICIENCY',
    dimension: '饮食偏好',
  },
  {
    id: 'q23',
    text: '您受凉或吃（喝）凉的东西后，容易拉肚子吗？',
    constitutionType: 'YANG_DEFICIENCY',
    dimension: '消化功能',
  },

  // ========== 阴虚质 YIN_DEFICIENCY（8题）==========
  {
    id: 'q24',
    text: '您感到手脚心发热吗？',
    constitutionType: 'YIN_DEFICIENCY',
    dimension: '四肢特征',
  },
  {
    id: 'q25',
    text: '您感觉身体、脸上发热吗？',
    constitutionType: 'YIN_DEFICIENCY',
    dimension: '热感特征',
  },
  {
    id: 'q26',
    text: '您皮肤或口唇干吗？',
    constitutionType: 'YIN_DEFICIENCY',
    dimension: '皮肤特征',
  },
  {
    id: 'q27',
    text: '您口唇的颜色比一般人红吗？',
    constitutionType: 'YIN_DEFICIENCY',
    dimension: '唇色特征',
  },
  {
    id: 'q28',
    text: '您容易便秘或大便干燥吗？',
    constitutionType: 'YIN_DEFICIENCY',
    dimension: '消化功能',
  },
  {
    id: 'q29',
    text: '您面部两颧潮红或偏红吗？',
    constitutionType: 'YIN_DEFICIENCY',
    dimension: '面色特征',
  },
  {
    id: 'q30',
    text: '您感到眼睛干涩吗？',
    constitutionType: 'YIN_DEFICIENCY',
    dimension: '眼部特征',
  },
  {
    id: 'q31',
    text: '您感到口干咽燥、总想喝水吗？',
    constitutionType: 'YIN_DEFICIENCY',
    dimension: '口咽特征',
  },

  // ========== 痰湿质 PHLEGM_DAMPNESS（8题）==========
  {
    id: 'q32',
    text: '您感到胸闷或腹部胀满吗？',
    constitutionType: 'PHLEGM_DAMPNESS',
    dimension: '胸腹特征',
  },
  {
    id: 'q33',
    text: '您感到身体沉重不轻松或不爽快吗？',
    constitutionType: 'PHLEGM_DAMPNESS',
    dimension: '身体感觉',
  },
  {
    id: 'q34',
    text: '您腹部肥满松软吗？',
    constitutionType: 'PHLEGM_DAMPNESS',
    dimension: '形体特征',
  },
  {
    id: 'q35',
    text: '您有额部油脂分泌多的现象吗？',
    constitutionType: 'PHLEGM_DAMPNESS',
    dimension: '皮肤特征',
  },
  {
    id: 'q36',
    text: '您上眼睑比别人肿（上眼睑有轻微隆起的现象）吗？',
    constitutionType: 'PHLEGM_DAMPNESS',
    dimension: '眼部特征',
  },
  {
    id: 'q37',
    text: '您嘴里有黏黏的感觉吗？',
    constitutionType: 'PHLEGM_DAMPNESS',
    dimension: '口腔特征',
  },
  {
    id: 'q38',
    text: '您平时痰多，特别是咽喉部总感到有痰堵着吗？',
    constitutionType: 'PHLEGM_DAMPNESS',
    dimension: '痰涎特征',
  },
  {
    id: 'q39',
    text: '您舌苔厚腻或有舌苔厚厚的感觉吗？',
    constitutionType: 'PHLEGM_DAMPNESS',
    dimension: '舌象特征',
  },

  // ========== 湿热质 DAMP_HEAT（7题）==========
  {
    id: 'q40',
    text: '您面部或鼻部有油腻感或者油亮发光吗？',
    constitutionType: 'DAMP_HEAT',
    dimension: '面部特征',
  },
  {
    id: 'q41',
    text: '您容易生痤疮或者疮疖吗？',
    constitutionType: 'DAMP_HEAT',
    dimension: '皮肤特征',
  },
  {
    id: 'q42',
    text: '您感到口苦或嘴里有异味吗？',
    constitutionType: 'DAMP_HEAT',
    dimension: '口腔特征',
  },
  {
    id: 'q43',
    text: '您大便黏滞不爽、有解不尽的感觉吗？',
    constitutionType: 'DAMP_HEAT',
    dimension: '排便特征',
  },
  {
    id: 'q44',
    text: '您小便时尿道有发热感、尿色浓（深）吗？',
    constitutionType: 'DAMP_HEAT',
    dimension: '小便特征',
  },
  {
    id: 'q45',
    text: '您带下色黄（指女性白带颜色发黄）吗？（男性跳过此题，计分记为未选）',
    constitutionType: 'DAMP_HEAT',
    dimension: '生殖特征',
  },
  {
    id: 'q46',
    text: '您的阴囊部位潮湿吗？（女性跳过此题，计分记为未选）',
    constitutionType: 'DAMP_HEAT',
    dimension: '生殖特征',
  },

  // ========== 血瘀质 BLOOD_STASIS（7题）==========
  {
    id: 'q47',
    text: '您的皮肤在不知不觉中会出现青紫瘀斑（皮下出血）吗？',
    constitutionType: 'BLOOD_STASIS',
    dimension: '皮肤特征',
  },
  {
    id: 'q48',
    text: '您两颧部有细微红丝（毛细血管扩张）吗？',
    constitutionType: 'BLOOD_STASIS',
    dimension: '面部特征',
  },
  {
    id: 'q49',
    text: '您身体上有哪里疼痛吗？',
    constitutionType: 'BLOOD_STASIS',
    dimension: '疼痛特征',
  },
  {
    id: 'q50',
    text: '您面色晦暗或容易出现褐斑吗？',
    constitutionType: 'BLOOD_STASIS',
    dimension: '面色特征',
  },
  {
    id: 'q51',
    text: '您容易有黑眼圈吗？',
    constitutionType: 'BLOOD_STASIS',
    dimension: '眼部特征',
  },
  {
    id: 'q52',
    text: '您容易忘事（健忘）吗？',
    constitutionType: 'BLOOD_STASIS',
    dimension: '认知特征',
  },
  {
    id: 'q53',
    text: '您口唇颜色偏暗吗？',
    constitutionType: 'BLOOD_STASIS',
    dimension: '唇色特征',
  },

  // ========== 气郁质 QI_STAGNATION（7题）==========
  {
    id: 'q54',
    text: '您感到闷闷不乐、情绪低沉吗？',
    constitutionType: 'QI_STAGNATION',
    dimension: '情志特征',
  },
  {
    id: 'q55',
    text: '您容易精神紧张、焦虑不安吗？',
    constitutionType: 'QI_STAGNATION',
    dimension: '情志特征',
  },
  {
    id: 'q56',
    text: '您多愁善感、感情脆弱吗？',
    constitutionType: 'QI_STAGNATION',
    dimension: '情感特征',
  },
  {
    id: 'q57',
    text: '您容易感到害怕或受到惊吓吗？',
    constitutionType: 'QI_STAGNATION',
    dimension: '情志特征',
  },
  {
    id: 'q58',
    text: '您的胁肋部或乳房胀痛吗？',
    constitutionType: 'QI_STAGNATION',
    dimension: '胸胁特征',
  },
  {
    id: 'q59',
    text: '您无缘无故叹气吗？',
    constitutionType: 'QI_STAGNATION',
    dimension: '气机特征',
  },
  {
    id: 'q60',
    text: '您咽喉部有异物感，且吐之不出、咽之不下吗？',
    constitutionType: 'QI_STAGNATION',
    dimension: '咽喉特征',
  },

  // ========== 特禀质 SPECIAL（7题）==========
  {
    id: 'q61',
    text: '您没有感冒时也会打喷嚏吗？',
    constitutionType: 'SPECIAL',
    dimension: '鼻部症状',
  },
  {
    id: 'q62',
    text: '您没有感冒时也会鼻塞、流鼻涕吗？',
    constitutionType: 'SPECIAL',
    dimension: '鼻部症状',
  },
  {
    id: 'q63',
    text: '您有因季节变化、温度变化或异味等原因而咳喘的现象吗？',
    constitutionType: 'SPECIAL',
    dimension: '呼吸症状',
  },
  {
    id: 'q64',
    text: '您容易过敏（对药物、食物、气味、花粉或在季节交替、气候变化时）吗？',
    constitutionType: 'SPECIAL',
    dimension: '过敏症状',
  },
  {
    id: 'q65',
    text: '您的皮肤容易起荨麻疹（风团、风疹块、风疙瘩）吗？',
    constitutionType: 'SPECIAL',
    dimension: '皮肤症状',
  },
  {
    id: 'q66',
    text: '您的皮肤因过敏出现过紫癜（紫红色瘀点、瘀斑）吗？',
    constitutionType: 'SPECIAL',
    dimension: '皮肤症状',
  },
  {
    id: 'q67',
    text: '您的皮肤一抓就红，并出现抓痕吗？',
    constitutionType: 'SPECIAL',
    dimension: '皮肤症状',
  },
]

// 获取指定体质的题目
export function getQuestionsByType(type: ConstitutionType): ConstitutionQuestion[] {
  return CONSTITUTION_QUESTIONS.filter(q => q.constitutionType === type)
}

// 获取所有体质类型列表
export const CONSTITUTION_TYPES: ConstitutionType[] = [
  'BALANCED',
  'QI_DEFICIENCY',
  'YANG_DEFICIENCY',
  'YIN_DEFICIENCY',
  'PHLEGM_DAMPNESS',
  'DAMP_HEAT',
  'BLOOD_STASIS',
  'QI_STAGNATION',
  'SPECIAL',
]
