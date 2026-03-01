import type { ConstitutionType } from '../types'

// 24节气 key 类型
export type SolarTermKey =
  | 'LICHUN'    // 立春
  | 'YUSHUI'    // 雨水
  | 'JINGZHE'   // 惊蛰
  | 'CHUNFEN'   // 春分
  | 'QINGMING'  // 清明
  | 'GUYU'      // 谷雨
  | 'LIXIA'     // 立夏
  | 'XIAOMAN'   // 小满
  | 'MANGZHONG' // 芒种
  | 'XIAZHI'    // 夏至
  | 'XIAOSHU'   // 小暑
  | 'DASHU'     // 大暑
  | 'LIQIU'     // 立秋
  | 'CHUSHU'    // 处暑
  | 'BAILU'     // 白露
  | 'QIUFEN'    // 秋分
  | 'HANLU'     // 寒露
  | 'SHUANGJIANG' // 霜降
  | 'LIDONG'    // 立冬
  | 'XIAOXUE'   // 小雪
  | 'DAXUE'     // 大雪
  | 'DONGZHI'   // 冬至
  | 'XIAOHAN'   // 小寒
  | 'DAHAN'     // 大寒

// 节气信息接口
export interface SolarTermInfo {
  key: SolarTermKey
  name: string           // 中文名
  season: '春' | '夏' | '秋' | '冬'
  monthApprox: number    // 大约月份
  dayApprox: number      // 大约日期
  organ: string          // 对应脏腑
  nature: string         // 气候特点
  wellnessFocus: string  // 养生要点
  diet: string[]         // 推荐饮食
  avoid: string[]        // 避免饮食
  exercise: string[]     // 推荐运动
  precautions: string[]  // 注意事项
  benefitConstitutions: ConstitutionType[]  // 适合调养的体质
  cautionConstitutions: ConstitutionType[]  // 需要特别注意的体质
}

// 24节气完整数据
export const SOLAR_TERM_INFO: Record<SolarTermKey, SolarTermInfo> = {
  LICHUN: {
    key: 'LICHUN',
    name: '立春',
    season: '春',
    monthApprox: 2,
    dayApprox: 4,
    organ: '肝',
    nature: '阳气初升，万物复苏',
    wellnessFocus: '疏肝理气，调畅情志，防风保暖',
    diet: ['韭菜', '菠菜', '春笋', '豆芽', '枸杞', '玫瑰花茶'],
    avoid: ['酸涩收敛', '辛辣过度', '生冷油腻'],
    exercise: ['散步', '太极拳', '八段锦', '踏青'],
    precautions: [
      '春捂保暖，不可过早减衣',
      '早睡早起，顺应阳气生发',
      '保持心情舒畅，避免抑郁烦躁',
      '注意防风，预防春季感冒',
    ],
    benefitConstitutions: ['QI_STAGNATION', 'BLOOD_STASIS', 'QI_DEFICIENCY'],
    cautionConstitutions: ['YIN_DEFICIENCY', 'DAMP_HEAT'],
  },
  YUSHUI: {
    key: 'YUSHUI',
    name: '雨水',
    season: '春',
    monthApprox: 2,
    dayApprox: 19,
    organ: '脾',
    nature: '雨水增多，湿气渐重',
    wellnessFocus: '健脾祛湿，调和脾胃，防湿邪入侵',
    diet: ['山药', '薏仁', '红豆', '鲫鱼', '茯苓粥', '陈皮'],
    avoid: ['生冷食物', '油腻厚味', '甜食过量'],
    exercise: ['慢跑', '骑行', '瑜伽', '八段锦'],
    precautions: [
      '注意保暖防湿，尤其腰腹部',
      '饮食清淡，易消化为主',
      '保持室内通风干燥',
      '适当减少户外活动于阴雨天气',
    ],
    benefitConstitutions: ['PHLEGM_DAMPNESS', 'QI_DEFICIENCY', 'BALANCED'],
    cautionConstitutions: ['PHLEGM_DAMPNESS', 'DAMP_HEAT'],
  },
  JINGZHE: {
    key: 'JINGZHE',
    name: '惊蛰',
    season: '春',
    monthApprox: 3,
    dayApprox: 6,
    organ: '肝',
    nature: '雷声初动，阳气升腾，万物苏醒',
    wellnessFocus: '疏肝升阳，防风祛邪，调畅气机',
    diet: ['鸭梨', '荸荠', '春韭', '芥菜', '蜂蜜水'],
    avoid: ['辛辣刺激', '肥甘厚味', '烟酒'],
    exercise: ['户外慢跑', '太极拳', '广场舞', '登山'],
    precautions: [
      '乍暖还寒，注意防寒保暖',
      '情绪波动大，需调节心态',
      '预防花粉过敏，特禀质人群尤需注意',
      '多喝水，保持体内水分充足',
    ],
    benefitConstitutions: ['QI_STAGNATION', 'QI_DEFICIENCY', 'BALANCED'],
    cautionConstitutions: ['SPECIAL', 'YIN_DEFICIENCY'],
  },
  CHUNFEN: {
    key: 'CHUNFEN',
    name: '春分',
    season: '春',
    monthApprox: 3,
    dayApprox: 21,
    organ: '肝',
    nature: '阴阳平衡，昼夜等长',
    wellnessFocus: '平衡阴阳，调和气血，疏肝健脾',
    diet: ['菠菜', '芹菜', '荠菜', '蒲公英', '桑葚'],
    avoid: ['过于温燥食物', '生冷寒凉'],
    exercise: ['踏青', '风筝', '慢跑', '太极'],
    precautions: [
      '注意阴阳平衡，饮食不偏颇',
      '春困现象明显，可适当午休',
      '保持规律作息，不要熬夜',
      '户外活动防晒，紫外线渐强',
    ],
    benefitConstitutions: ['BALANCED', 'QI_DEFICIENCY', 'BLOOD_STASIS'],
    cautionConstitutions: ['YIN_DEFICIENCY', 'DAMP_HEAT'],
  },
  QINGMING: {
    key: 'QINGMING',
    name: '清明',
    season: '春',
    monthApprox: 4,
    dayApprox: 5,
    organ: '肝',
    nature: '气清景明，万物吐故纳新',
    wellnessFocus: '疏肝柔肝，养血明目，畅达情志',
    diet: ['枸杞', '菊花茶', '桑叶', '猪肝', '荠菜'],
    avoid: ['辛辣刺激', '饮酒过量'],
    exercise: ['踏青扫墓', '慢跑', '太极拳', '气功'],
    precautions: [
      '扫墓时注意情绪调节，不可过度悲伤',
      '春雨绵绵防潮湿',
      '注意护眼，少看电子屏幕',
      '过敏体质做好防护措施',
    ],
    benefitConstitutions: ['QI_STAGNATION', 'BLOOD_STASIS', 'YIN_DEFICIENCY'],
    cautionConstitutions: ['SPECIAL', 'QI_DEFICIENCY'],
  },
  GUYU: {
    key: 'GUYU',
    name: '谷雨',
    season: '春',
    monthApprox: 4,
    dayApprox: 20,
    organ: '脾',
    nature: '雨量充沛，谷类生长',
    wellnessFocus: '健脾化湿，祛风防湿，补益肝肾',
    diet: ['香椿', '蛤蜊', '鲫鱼', '豆腐', '薏仁汤'],
    avoid: ['油腻重口', '甜食糕点过量'],
    exercise: ['游泳', '羽毛球', '慢跑', '瑜伽'],
    precautions: [
      '湿气较重，注意除湿健脾',
      '此时神经痛等疾病易发，注意保暖',
      '保持情绪稳定，避免过度焦虑',
      '谷雨后注意防蚊虫叮咬',
    ],
    benefitConstitutions: ['PHLEGM_DAMPNESS', 'DAMP_HEAT', 'QI_DEFICIENCY'],
    cautionConstitutions: ['PHLEGM_DAMPNESS', 'DAMP_HEAT'],
  },
  LIXIA: {
    key: 'LIXIA',
    name: '立夏',
    season: '夏',
    monthApprox: 5,
    dayApprox: 6,
    organ: '心',
    nature: '气温升高，夏季开始',
    wellnessFocus: '养心安神，清心降火，起居宜晚睡早起',
    diet: ['苦瓜', '莲子', '百合', '绿豆汤', '西瓜', '荷叶茶'],
    avoid: ['辛辣刺激', '油炸食品', '过多冷饮'],
    exercise: ['游泳', '清晨散步', '太极拳', '瑜伽（室内）'],
    precautions: [
      '防暑降温，避免长时间户外活动',
      '保持心情平静，戒躁戒怒',
      '午睡养心，不超过30分钟',
      '多补水，预防脱水中暑',
    ],
    benefitConstitutions: ['DAMP_HEAT', 'YIN_DEFICIENCY', 'QI_STAGNATION'],
    cautionConstitutions: ['YIN_DEFICIENCY', 'DAMP_HEAT', 'YANG_DEFICIENCY'],
  },
  XIAOMAN: {
    key: 'XIAOMAN',
    name: '小满',
    season: '夏',
    monthApprox: 5,
    dayApprox: 21,
    organ: '心',
    nature: '气温渐高，湿热并重',
    wellnessFocus: '清热祛湿，健脾利湿，养心安神',
    diet: ['冬瓜', '苋菜', '薏仁', '赤小豆', '荷叶粥'],
    avoid: ['肥甘厚腻', '过于辛辣', '酒精'],
    exercise: ['游泳', '清晨慢跑', '气功', '室内瑜伽'],
    precautions: [
      '注意防暑防湿，保持室内清爽',
      '饮食清淡，多吃清热利湿食物',
      '皮肤病、湿疹等易发，注意皮肤卫生',
      '保持心情愉悦，少生气',
    ],
    benefitConstitutions: ['PHLEGM_DAMPNESS', 'DAMP_HEAT', 'BALANCED'],
    cautionConstitutions: ['DAMP_HEAT', 'PHLEGM_DAMPNESS'],
  },
  MANGZHONG: {
    key: 'MANGZHONG',
    name: '芒种',
    season: '夏',
    monthApprox: 6,
    dayApprox: 6,
    organ: '心',
    nature: '麦类成熟，梅雨时节',
    wellnessFocus: '祛湿健脾，清心安神，防中暑',
    diet: ['绿豆', '冬瓜', '苦瓜', '丝瓜', '黄瓜', '西瓜'],
    avoid: ['油腻辛辣', '过凉食物', '甜腻之品'],
    exercise: ['早晨户外运动', '游泳', '太极拳'],
    precautions: [
      '梅雨季节潮湿，注意祛湿防霉',
      '天热易上火，保持心态平和',
      '劳逸结合，不可过度劳累',
      '注意补充水分和电解质',
    ],
    benefitConstitutions: ['PHLEGM_DAMPNESS', 'DAMP_HEAT', 'QI_STAGNATION'],
    cautionConstitutions: ['DAMP_HEAT', 'YIN_DEFICIENCY'],
  },
  XIAZHI: {
    key: 'XIAZHI',
    name: '夏至',
    season: '夏',
    monthApprox: 6,
    dayApprox: 21,
    organ: '心',
    nature: '阳极而阴生，一年中白昼最长',
    wellnessFocus: '滋阴潜阳，清心泻火，冬病夏治（三伏贴预备）',
    diet: ['莲藕', '百合', '银耳', '西瓜', '绿豆汤', '酸梅汤'],
    avoid: ['过食生冷', '辛辣燥热', '烟酒'],
    exercise: ['游泳', '早晚散步', '太极', '静坐养心'],
    precautions: [
      '阳气最旺，注意防暑降温',
      '冬病夏治的关键节点，阳虚体质可开始三伏贴疗程',
      '避免正午暴晒，防止中暑',
      '多吃清淡食物，避免暴饮暴食',
    ],
    benefitConstitutions: ['YANG_DEFICIENCY', 'PHLEGM_DAMPNESS', 'QI_DEFICIENCY'],
    cautionConstitutions: ['YIN_DEFICIENCY', 'DAMP_HEAT'],
  },
  XIAOSHU: {
    key: 'XIAOSHU',
    name: '小暑',
    season: '夏',
    monthApprox: 7,
    dayApprox: 7,
    organ: '心',
    nature: '天气炎热，进入暑期',
    wellnessFocus: '消暑清热，益气养阴，健脾化湿',
    diet: ['绿豆汤', '荷叶粥', '苦瓜', '西瓜', '酸梅汤', '冬瓜汤'],
    avoid: ['过凉生冷', '油腻辛辣', '过多甜食'],
    exercise: ['游泳', '清晨/傍晚运动', '室内运动'],
    precautions: [
      '三伏天前夕，阳虚痰湿体质可做三伏贴',
      '防暑降温，多饮温水',
      '保持心情平静，避免情绪激动',
      '饮食以清淡为主，少量多餐',
    ],
    benefitConstitutions: ['YANG_DEFICIENCY', 'PHLEGM_DAMPNESS', 'QI_DEFICIENCY'],
    cautionConstitutions: ['YIN_DEFICIENCY', 'DAMP_HEAT'],
  },
  DASHU: {
    key: 'DASHU',
    name: '大暑',
    season: '夏',
    monthApprox: 7,
    dayApprox: 23,
    organ: '心',
    nature: '一年中最热时节，三伏天中伏',
    wellnessFocus: '三伏贴最佳时期，冬病夏治，益气清暑，健脾养胃',
    diet: ['冬瓜排骨汤', '绿豆百合粥', '藿香正气饮', '酸梅汤', '莲子银耳羹'],
    avoid: ['过于生冷', '贪凉吹空调', '暴饮暴食'],
    exercise: ['清晨散步', '游泳', '室内有氧', '静养'],
    precautions: [
      '三伏贴最佳敷贴时间，阳虚/痰湿/过敏体质重点推荐',
      '防中暑，备防暑药品',
      '空调温度不宜过低，避免风扇直吹',
      '保证充足睡眠，午休养心',
    ],
    benefitConstitutions: ['YANG_DEFICIENCY', 'PHLEGM_DAMPNESS', 'QI_DEFICIENCY', 'SPECIAL'],
    cautionConstitutions: ['YIN_DEFICIENCY', 'DAMP_HEAT'],
  },
  LIQIU: {
    key: 'LIQIU',
    name: '立秋',
    season: '秋',
    monthApprox: 8,
    dayApprox: 7,
    organ: '肺',
    nature: '暑热渐退，秋风初至',
    wellnessFocus: '润肺生津，养阴防燥，收敛阳气',
    diet: ['雪梨', '百合', '银耳', '蜂蜜', '芝麻', '藕粉'],
    avoid: ['辛辣刺激', '煎炸烧烤', '过于燥热食物'],
    exercise: ['登山', '慢跑', '太极拳', '游泳（水温合适时）'],
    precautions: [
      '秋燥开始，注意润肺养阴',
      '早晚温差加大，注意适时增衣',
      '早睡早起，与鸡俱兴',
      '情志内敛，避免悲秋情绪',
    ],
    benefitConstitutions: ['YIN_DEFICIENCY', 'QI_DEFICIENCY', 'BALANCED'],
    cautionConstitutions: ['YIN_DEFICIENCY', 'SPECIAL'],
  },
  CHUSHU: {
    key: 'CHUSHU',
    name: '处暑',
    season: '秋',
    monthApprox: 8,
    dayApprox: 23,
    organ: '肺',
    nature: '暑热出走，秋凉渐来',
    wellnessFocus: '滋阴润燥，宣肺止咳，收敛精气',
    diet: ['银耳莲子羹', '沙参玉竹汤', '芝麻糊', '蜂蜜柚子茶'],
    avoid: ['辛辣发散', '过于燥热食物'],
    exercise: ['爬山', '慢跑', '太极拳', '八段锦'],
    precautions: [
      '早晚凉意明显，注意保暖防感冒',
      '秋燥渐重，多饮水润肺',
      '调节情绪，防秋愁',
      '睡眠规律，避免熬夜',
    ],
    benefitConstitutions: ['YIN_DEFICIENCY', 'QI_DEFICIENCY', 'PHLEGM_DAMPNESS'],
    cautionConstitutions: ['YIN_DEFICIENCY', 'QI_DEFICIENCY'],
  },
  BAILU: {
    key: 'BAILU',
    name: '白露',
    season: '秋',
    monthApprox: 9,
    dayApprox: 8,
    organ: '肺',
    nature: '天气转凉，露水凝白',
    wellnessFocus: '润肺止燥，温阳益气，养阴补肾',
    diet: ['白色食物', '银耳', '百合', '山药', '芡实', '核桃'],
    avoid: ['寒凉瓜果过多', '游泳（水已寒凉）'],
    exercise: ['早晨慢跑', '太极拳', '气功', '徒步'],
    precautions: [
      '白露身不露，早晚注意添衣',
      '过敏性鼻炎等疾病易发，特禀质需防护',
      '饮食以温热为主，少食生冷',
      '保持情绪稳定，调节心情',
    ],
    benefitConstitutions: ['YIN_DEFICIENCY', 'QI_DEFICIENCY', 'YANG_DEFICIENCY'],
    cautionConstitutions: ['SPECIAL', 'YANG_DEFICIENCY'],
  },
  QIUFEN: {
    key: 'QIUFEN',
    name: '秋分',
    season: '秋',
    monthApprox: 9,
    dayApprox: 23,
    organ: '肺',
    nature: '阴阳相半，气候宜人',
    wellnessFocus: '平衡阴阳，滋阴润燥，固表防寒',
    diet: ['梨', '葡萄', '柿子', '芋头', '红薯', '核桃'],
    avoid: ['寒凉生冷过量', '油腻辛辣'],
    exercise: ['登山', '快走', '慢跑', '太极'],
    precautions: [
      '昼夜温差大，防感冒',
      '注意润燥，多饮水',
      '避免过度运动出汗，防伤阳气',
      '保持情志平和，防悲秋',
    ],
    benefitConstitutions: ['BALANCED', 'YIN_DEFICIENCY', 'QI_STAGNATION'],
    cautionConstitutions: ['YANG_DEFICIENCY', 'QI_DEFICIENCY'],
  },
  HANLU: {
    key: 'HANLU',
    name: '寒露',
    season: '秋',
    monthApprox: 10,
    dayApprox: 8,
    organ: '肺',
    nature: '气温更凉，露水将凝',
    wellnessFocus: '温阳润燥，滋补肝肾，固护正气',
    diet: ['芝麻', '核桃', '银杏', '花生', '红枣', '枸杞'],
    avoid: ['生冷寒凉', '辛辣刺激过多'],
    exercise: ['太极拳', '气功', '室内瑜伽', '适度慢跑'],
    precautions: [
      '注意保暖，尤其是足部',
      '润燥养肺，多喝温热饮品',
      '关节炎等疾病易复发，注意关节保暖',
      '不宜再游泳，防寒湿入侵',
    ],
    benefitConstitutions: ['YANG_DEFICIENCY', 'QI_DEFICIENCY', 'YIN_DEFICIENCY'],
    cautionConstitutions: ['YANG_DEFICIENCY', 'QI_DEFICIENCY'],
  },
  SHUANGJIANG: {
    key: 'SHUANGJIANG',
    name: '霜降',
    season: '秋',
    monthApprox: 10,
    dayApprox: 23,
    organ: '脾',
    nature: '天气寒冷，霜始凝结',
    wellnessFocus: '健脾养胃，滋阴润燥，防寒保暖',
    diet: ['柿子', '栗子', '山药', '莲子', '红薯', '牛肉'],
    avoid: ['生冷寒凉', '冰冻食品'],
    exercise: ['慢跑', '登山', '太极', '室内运动'],
    precautions: [
      '初霜季节，防寒保暖最重要',
      '健脾益胃，为冬季进补打基础',
      '关节保暖，防风湿病加重',
      '早睡晚起，固护阳气',
    ],
    benefitConstitutions: ['PHLEGM_DAMPNESS', 'QI_DEFICIENCY', 'YANG_DEFICIENCY'],
    cautionConstitutions: ['YANG_DEFICIENCY', 'PHLEGM_DAMPNESS'],
  },
  LIDONG: {
    key: 'LIDONG',
    name: '立冬',
    season: '冬',
    monthApprox: 11,
    dayApprox: 7,
    organ: '肾',
    nature: '冬季开始，阳气收藏',
    wellnessFocus: '温补肾阳，收藏精气，防寒保暖',
    diet: ['羊肉', '韭菜', '核桃', '黑芝麻', '黑豆', '栗子汤'],
    avoid: ['生冷寒凉', '过于清淡（需温补）'],
    exercise: ['太极拳', '气功', '室内有氧', '散步'],
    precautions: [
      '冬藏时节，早睡晚起',
      '温补为主，切忌大汗出',
      '防寒保暖，重点护好颈部腰部',
      '减少户外剧烈运动',
    ],
    benefitConstitutions: ['YANG_DEFICIENCY', 'QI_DEFICIENCY', 'BLOOD_STASIS'],
    cautionConstitutions: ['DAMP_HEAT', 'YIN_DEFICIENCY'],
  },
  XIAOXUE: {
    key: 'XIAOXUE',
    name: '小雪',
    season: '冬',
    monthApprox: 11,
    dayApprox: 22,
    organ: '肾',
    nature: '气温骤降，开始降雪',
    wellnessFocus: '温补肾阳，安神养心，驱寒防冻',
    diet: ['羊肉炖萝卜', '枸杞炖鸡', '黑芝麻糊', '核桃粥', '生姜红糖茶'],
    avoid: ['生冷食物', '凉性食材过多'],
    exercise: ['室内太极', '气功', '瑜伽', '短暂散步'],
    precautions: [
      '防寒防冻，做好头部颈部保暖',
      '注意保持情绪稳定，冬季易情绪低落',
      '适当增加温补食物',
      '室内保持适当温度和湿度',
    ],
    benefitConstitutions: ['YANG_DEFICIENCY', 'QI_DEFICIENCY', 'BLOOD_STASIS'],
    cautionConstitutions: ['DAMP_HEAT', 'YIN_DEFICIENCY'],
  },
  DAXUE: {
    key: 'DAXUE',
    name: '大雪',
    season: '冬',
    monthApprox: 12,
    dayApprox: 7,
    organ: '肾',
    nature: '降雪量增大，寒冷加剧',
    wellnessFocus: '温肾壮阳，固精益气，防寒避风',
    diet: ['狗肉', '羊肉', '鹿肉', '当归炖老鸡', '核桃枸杞粥'],
    avoid: ['过于生冷', '寒凉瓜果'],
    exercise: ['室内太极', '八段锦', '瑜伽', '气功', '泡脚'],
    precautions: [
      '大雪封地，减少外出，保暖为要',
      '防滑防跌，户外行走注意安全',
      '温补不可过急，循序渐进',
      '每晚热水泡脚，温阳补肾',
    ],
    benefitConstitutions: ['YANG_DEFICIENCY', 'QI_DEFICIENCY', 'PHLEGM_DAMPNESS'],
    cautionConstitutions: ['DAMP_HEAT', 'YIN_DEFICIENCY', 'DAMP_HEAT'],
  },
  DONGZHI: {
    key: 'DONGZHI',
    name: '冬至',
    season: '冬',
    monthApprox: 12,
    dayApprox: 22,
    organ: '肾',
    nature: '一年中白昼最短，阴极阳生，进补黄金期',
    wellnessFocus: '补肾填精，温阳散寒，进补黄金时节',
    diet: ['饺子（北方传统）', '羊肉汤', '当归生姜羊肉汤', '糯米饭', '核桃补肾方'],
    avoid: ['过于生冷', '油腻难消化食物'],
    exercise: ['室内静养', '气功', '太极', '短暂散步'],
    precautions: [
      '冬至进补最佳时机，阳虚体质重点调补',
      '早睡晚起，保证充足睡眠',
      '避免情绪大起大落',
      '做好防寒保暖，避免受凉',
    ],
    benefitConstitutions: ['YANG_DEFICIENCY', 'QI_DEFICIENCY', 'BLOOD_STASIS', 'PHLEGM_DAMPNESS'],
    cautionConstitutions: ['DAMP_HEAT', 'YIN_DEFICIENCY'],
  },
  XIAOHAN: {
    key: 'XIAOHAN',
    name: '小寒',
    season: '冬',
    monthApprox: 1,
    dayApprox: 6,
    organ: '肾',
    nature: '天气进入最寒冷阶段',
    wellnessFocus: '温肾散寒，益气固表，防寒护阳',
    diet: ['羊肉', '核桃仁', '腰果', '桂圆', '枸杞', '红糖姜茶'],
    avoid: ['生冷寒凉食物', '过度消耗阳气的活动'],
    exercise: ['室内太极', '八段锦', '气功', '泡脚'],
    precautions: [
      '三九天前后，防寒第一位',
      '保暖要做全面，尤其背部和足部',
      '减少外出，室内保暖避风',
      '坚持温补，为春季做准备',
    ],
    benefitConstitutions: ['YANG_DEFICIENCY', 'QI_DEFICIENCY', 'PHLEGM_DAMPNESS'],
    cautionConstitutions: ['YANG_DEFICIENCY', 'QI_DEFICIENCY'],
  },
  DAHAN: {
    key: 'DAHAN',
    name: '大寒',
    season: '冬',
    monthApprox: 1,
    dayApprox: 20,
    organ: '肾',
    nature: '一年中最寒冷的节气，冬末交春',
    wellnessFocus: '温补固肾，敛藏精气，为迎春做准备',
    diet: ['糯米饭', '八宝粥', '当归枸杞炖羊肉', '黑豆猪脚汤'],
    avoid: ['辛辣发汗过多', '生冷寒凉', '熬夜消耗'],
    exercise: ['室内气功', '太极', '适当散步（避风）'],
    precautions: [
      '大寒防寒是第一要务',
      '冬末养藏，不可大汗出',
      '为迎接立春做准备，调节情志',
      '补肾藏精，为新一年打好基础',
    ],
    benefitConstitutions: ['YANG_DEFICIENCY', 'QI_DEFICIENCY', 'BLOOD_STASIS'],
    cautionConstitutions: ['DAMP_HEAT', 'YIN_DEFICIENCY'],
  },
}

// 按自然顺序排列的节气序列（从立春开始）
export const SOLAR_TERM_SEQUENCE: SolarTermKey[] = [
  'LICHUN', 'YUSHUI', 'JINGZHE', 'CHUNFEN', 'QINGMING', 'GUYU',
  'LIXIA', 'XIAOMAN', 'MANGZHONG', 'XIAZHI', 'XIAOSHU', 'DASHU',
  'LIQIU', 'CHUSHU', 'BAILU', 'QIUFEN', 'HANLU', 'SHUANGJIANG',
  'LIDONG', 'XIAOXUE', 'DAXUE', 'DONGZHI', 'XIAOHAN', 'DAHAN',
]

/**
 * 根据当前月日近似推算当前节气
 */
export function getCurrentSolarTermKey(): SolarTermKey {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const day = now.getDate()

  // 每个节气的大约月日 [month, day]
  const termDates: [SolarTermKey, number, number][] = [
    ['LICHUN',    2,  4],
    ['YUSHUI',    2, 19],
    ['JINGZHE',   3,  6],
    ['CHUNFEN',   3, 21],
    ['QINGMING',  4,  5],
    ['GUYU',      4, 20],
    ['LIXIA',     5,  6],
    ['XIAOMAN',   5, 21],
    ['MANGZHONG', 6,  6],
    ['XIAZHI',    6, 21],
    ['XIAOSHU',   7,  7],
    ['DASHU',     7, 23],
    ['LIQIU',     8,  7],
    ['CHUSHU',    8, 23],
    ['BAILU',     9,  8],
    ['QIUFEN',    9, 23],
    ['HANLU',    10,  8],
    ['SHUANGJIANG', 10, 23],
    ['LIDONG',   11,  7],
    ['XIAOXUE',  11, 22],
    ['DAXUE',    12,  7],
    ['DONGZHI',  12, 22],
    ['XIAOHAN',   1,  6],
    ['DAHAN',     1, 20],
  ]

  // 将月日转换为一年中的天数（近似）
  const currentDayOfYear = (month - 1) * 30 + day

  // 找到最近的已过节气
  let bestKey: SolarTermKey = 'DAHAN'
  let bestDiff = Infinity

  for (const [key, m, d] of termDates) {
    const termDayOfYear = (m - 1) * 30 + d
    let diff = currentDayOfYear - termDayOfYear
    if (diff < 0) diff += 360 // 处理跨年
    if (diff < bestDiff) {
      bestDiff = diff
      bestKey = key
    }
  }

  return bestKey
}

/**
 * 获取指定体质适合调养的节气列表
 */
export function getSolarTermsByConstitution(constitution: ConstitutionType): SolarTermInfo[] {
  return SOLAR_TERM_SEQUENCE
    .map(key => SOLAR_TERM_INFO[key])
    .filter(info => info.benefitConstitutions.includes(constitution))
}
