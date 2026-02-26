import { PrismaClient, Role, ConstitutionType, RiskLevel, FollowupStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ============================================================
  // 1. 医院
  // ============================================================
  const hospital = await prisma.hospital.create({
    data: {
      name: '北京中医药大学附属医院',
      level: '三甲',
      address: '北京市朝阳区北三环东路11号',
      config: {
        enableAIChat: true,
        enableConstitutionAssessment: true,
        enableFollowup: true,
        enableHealthDiary: true,
        maxDailyAssessments: 100,
      },
    },
  })

  // ============================================================
  // 2. 管理员用户
  // ============================================================
  await prisma.user.create({
    data: {
      phone: '13800000001',
      name: '系统管理员',
      role: Role.ADMIN,
      hospitalId: hospital.id,
    },
  })

  // ============================================================
  // 3. 医生用户
  // ============================================================
  const doctor1User = await prisma.user.create({
    data: {
      phone: '13900000001',
      name: '李明远',
      role: Role.DOCTOR,
      hospitalId: hospital.id,
      doctorProfile: {
        create: {
          title: '主任医师',
          department: '治未病科',
          specialty: '中医体质辨识与调理，擅长痰湿质、气虚质的综合调治',
          licenseNo: 'TCMD-BJ-2015-00321',
        },
      },
    },
    include: { doctorProfile: true },
  })

  const doctor2User = await prisma.user.create({
    data: {
      phone: '13900000002',
      name: '王素芳',
      role: Role.DOCTOR,
      hospitalId: hospital.id,
      doctorProfile: {
        create: {
          title: '副主任医师',
          department: '中医内科',
          specialty: '阴虚质、血瘀质的辨治，中医养生与膏方调理',
          licenseNo: 'TCMD-BJ-2017-00587',
        },
      },
    },
    include: { doctorProfile: true },
  })

  // ============================================================
  // 4. 患者用户（5个，各有不同体质和风险等级）
  // ============================================================

  // --- 患者1：张伟，气虚质 ---
  const patient1User = await prisma.user.create({
    data: {
      phone: '13600000001',
      name: '张伟',
      role: Role.PATIENT,
      hospitalId: hospital.id,
      patientProfile: {
        create: {
          gender: '男',
          birthDate: new Date('1978-03-15'),
          height: 172,
          weight: 68,
          allergies: ['花粉'],
          medicalHistory: ['慢性胃炎'],
          riskLevel: RiskLevel.MEDIUM,
          lastVisitDate: new Date('2026-02-10'),
          primaryConstitution: ConstitutionType.QI_DEFICIENCY,
        },
      },
    },
    include: { patientProfile: true },
  })

  // --- 患者2：刘芳，阴虚质 ---
  const patient2User = await prisma.user.create({
    data: {
      phone: '13600000002',
      name: '刘芳',
      role: Role.PATIENT,
      hospitalId: hospital.id,
      patientProfile: {
        create: {
          gender: '女',
          birthDate: new Date('1985-07-22'),
          height: 160,
          weight: 52,
          allergies: [],
          medicalHistory: ['甲状腺结节'],
          riskLevel: RiskLevel.LOW,
          lastVisitDate: new Date('2026-02-15'),
          primaryConstitution: ConstitutionType.YIN_DEFICIENCY,
        },
      },
    },
    include: { patientProfile: true },
  })

  // --- 患者3：陈建国，痰湿质 ---
  const patient3User = await prisma.user.create({
    data: {
      phone: '13600000003',
      name: '陈建国',
      role: Role.PATIENT,
      hospitalId: hospital.id,
      patientProfile: {
        create: {
          gender: '男',
          birthDate: new Date('1970-11-08'),
          height: 175,
          weight: 92,
          allergies: ['海鲜'],
          medicalHistory: ['高血压', '高脂血症', '脂肪肝'],
          riskLevel: RiskLevel.HIGH,
          lastVisitDate: new Date('2026-02-18'),
          primaryConstitution: ConstitutionType.PHLEGM_DAMPNESS,
        },
      },
    },
    include: { patientProfile: true },
  })

  // --- 患者4：赵雪梅，血瘀质 ---
  const patient4User = await prisma.user.create({
    data: {
      phone: '13600000004',
      name: '赵雪梅',
      role: Role.PATIENT,
      hospitalId: hospital.id,
      patientProfile: {
        create: {
          gender: '女',
          birthDate: new Date('1968-01-30'),
          height: 158,
          weight: 60,
          allergies: [],
          medicalHistory: ['子宫肌瘤', '月经不调'],
          riskLevel: RiskLevel.MEDIUM,
          lastVisitDate: new Date('2026-01-25'),
          primaryConstitution: ConstitutionType.BLOOD_STASIS,
        },
      },
    },
    include: { patientProfile: true },
  })

  // --- 患者5：孙浩然，平和质 ---
  const patient5User = await prisma.user.create({
    data: {
      phone: '13600000005',
      name: '孙浩然',
      role: Role.PATIENT,
      hospitalId: hospital.id,
      patientProfile: {
        create: {
          gender: '男',
          birthDate: new Date('1995-05-12'),
          height: 178,
          weight: 72,
          allergies: [],
          medicalHistory: [],
          riskLevel: RiskLevel.LOW,
          lastVisitDate: new Date('2026-02-20'),
          primaryConstitution: ConstitutionType.BALANCED,
        },
      },
    },
    include: { patientProfile: true },
  })

  // ============================================================
  // 5. 体质评估记录（每个患者1条）
  // ============================================================

  const assessment1 = await prisma.constitutionAssessment.create({
    data: {
      userId: patient1User.id,
      answers: {
        q1: 3, q2: 4, q3: 2, q4: 4, q5: 3, q6: 2, q7: 4, q8: 3, q9: 2,
        q10: 3, q11: 4, q12: 2, q13: 3, q14: 2, q15: 3, q16: 4, q17: 3,
        q18: 2, q19: 3, q20: 2, q21: 4, q22: 3, q23: 2, q24: 3, q25: 2,
        q26: 3, q27: 4, q28: 2, q29: 3, q30: 2, q31: 3, q32: 2, q33: 3,
      },
      scores: {
        BALANCED: 42,
        QI_DEFICIENCY: 78,
        YANG_DEFICIENCY: 45,
        YIN_DEFICIENCY: 32,
        PHLEGM_DAMPNESS: 38,
        DAMP_HEAT: 25,
        BLOOD_STASIS: 20,
        QI_STAGNATION: 35,
        SPECIAL: 15,
      },
      primaryType: ConstitutionType.QI_DEFICIENCY,
      secondaryTypes: [ConstitutionType.YANG_DEFICIENCY],
      aiAnalysis: '该患者以气虚质为主，兼有阳虚倾向。主要表现为容易疲乏、气短懒言、易出汗、舌淡胖、脉虚弱。建议以补气健脾为主，兼顾温阳。注意饮食宜温补，避免生冷寒凉。日常可配合八段锦等柔和运动，循序渐进。慢性胃炎病史提示脾胃功能较弱，需重点调理中焦。',
    },
  })

  const assessment2 = await prisma.constitutionAssessment.create({
    data: {
      userId: patient2User.id,
      answers: {
        q1: 2, q2: 3, q3: 4, q4: 2, q5: 4, q6: 3, q7: 2, q8: 4, q9: 3,
        q10: 4, q11: 2, q12: 3, q13: 4, q14: 3, q15: 2, q16: 3, q17: 4,
        q18: 3, q19: 4, q20: 2, q21: 3, q22: 4, q23: 3, q24: 2, q25: 4,
        q26: 3, q27: 2, q28: 4, q29: 3, q30: 2, q31: 4, q32: 3, q33: 2,
      },
      scores: {
        BALANCED: 48,
        QI_DEFICIENCY: 30,
        YANG_DEFICIENCY: 22,
        YIN_DEFICIENCY: 75,
        PHLEGM_DAMPNESS: 20,
        DAMP_HEAT: 35,
        BLOOD_STASIS: 28,
        QI_STAGNATION: 40,
        SPECIAL: 18,
      },
      primaryType: ConstitutionType.YIN_DEFICIENCY,
      secondaryTypes: [ConstitutionType.QI_STAGNATION],
      aiAnalysis: '该患者属阴虚质，兼有气郁倾向。表现为手足心热、口干咽燥、喜冷饮、面色潮红、舌红少苔、脉细数。甲状腺结节与阴虚内热、气郁痰凝有关。建议滋阴清热、疏肝理气。饮食宜清淡滋润，多食银耳、百合、莲子等养阴之品，忌辛辣燥热。保持心情舒畅，避免熬夜耗阴。',
    },
  })

  const assessment3 = await prisma.constitutionAssessment.create({
    data: {
      userId: patient3User.id,
      answers: {
        q1: 4, q2: 3, q3: 2, q4: 4, q5: 3, q6: 4, q7: 3, q8: 2, q9: 4,
        q10: 3, q11: 4, q12: 3, q13: 2, q14: 4, q15: 3, q16: 2, q17: 4,
        q18: 3, q19: 2, q20: 4, q21: 3, q22: 2, q23: 4, q24: 3, q25: 2,
        q26: 4, q27: 3, q28: 2, q29: 4, q30: 3, q31: 2, q32: 4, q33: 3,
      },
      scores: {
        BALANCED: 25,
        QI_DEFICIENCY: 55,
        YANG_DEFICIENCY: 40,
        YIN_DEFICIENCY: 20,
        PHLEGM_DAMPNESS: 85,
        DAMP_HEAT: 48,
        BLOOD_STASIS: 35,
        QI_STAGNATION: 30,
        SPECIAL: 12,
      },
      primaryType: ConstitutionType.PHLEGM_DAMPNESS,
      secondaryTypes: [ConstitutionType.QI_DEFICIENCY, ConstitutionType.DAMP_HEAT],
      aiAnalysis: '该患者为典型痰湿质，兼有气虚和湿热。体型偏胖，BMI超标，腹部肥满。面色淡黄而暗，口黏腻，身重不爽，舌体胖大有齿痕、苔白腻，脉滑。合并高血压、高脂血症和脂肪肝，属代谢综合征高风险人群。治宜健脾化痰、利湿降浊。饮食需严格控制，减少肥甘厚味，增加山药、薏仁、冬瓜等健脾祛湿食材。运动以有氧运动为主，每日至少30分钟。需定期监测血压血脂。',
    },
  })

  const assessment4 = await prisma.constitutionAssessment.create({
    data: {
      userId: patient4User.id,
      answers: {
        q1: 3, q2: 2, q3: 4, q4: 3, q5: 2, q6: 4, q7: 3, q8: 4, q9: 2,
        q10: 3, q11: 2, q12: 4, q13: 3, q14: 4, q15: 2, q16: 3, q17: 2,
        q18: 4, q19: 3, q20: 4, q21: 2, q22: 3, q23: 4, q24: 2, q25: 3,
        q26: 4, q27: 2, q28: 3, q29: 4, q30: 2, q31: 3, q32: 4, q33: 2,
      },
      scores: {
        BALANCED: 35,
        QI_DEFICIENCY: 42,
        YANG_DEFICIENCY: 30,
        YIN_DEFICIENCY: 38,
        PHLEGM_DAMPNESS: 28,
        DAMP_HEAT: 22,
        BLOOD_STASIS: 72,
        QI_STAGNATION: 50,
        SPECIAL: 10,
      },
      primaryType: ConstitutionType.BLOOD_STASIS,
      secondaryTypes: [ConstitutionType.QI_STAGNATION],
      aiAnalysis: '该患者属血瘀质，兼有气郁。面色晦暗，眼眶偏黑，口唇紫暗，皮肤粗糙，有瘀斑。有子宫肌瘤和月经不调病史，与瘀血内停、气滞血瘀密切相关。舌质紫暗有瘀点，脉涩。治宜活血化瘀、行气通络。饮食宜用山楂、红花、桃仁等活血食材，忌寒凉收涩。推荐太极拳、瑜伽等促进气血运行的运动。情绪调节也很重要，避免抑郁多思。',
    },
  })

  const assessment5 = await prisma.constitutionAssessment.create({
    data: {
      userId: patient5User.id,
      answers: {
        q1: 2, q2: 2, q3: 1, q4: 2, q5: 1, q6: 2, q7: 1, q8: 2, q9: 1,
        q10: 2, q11: 1, q12: 2, q13: 1, q14: 2, q15: 1, q16: 2, q17: 1,
        q18: 2, q19: 1, q20: 2, q21: 1, q22: 2, q23: 1, q24: 2, q25: 1,
        q26: 2, q27: 1, q28: 2, q29: 1, q30: 2, q31: 1, q32: 2, q33: 1,
      },
      scores: {
        BALANCED: 80,
        QI_DEFICIENCY: 18,
        YANG_DEFICIENCY: 15,
        YIN_DEFICIENCY: 20,
        PHLEGM_DAMPNESS: 12,
        DAMP_HEAT: 22,
        BLOOD_STASIS: 10,
        QI_STAGNATION: 16,
        SPECIAL: 8,
      },
      primaryType: ConstitutionType.BALANCED,
      secondaryTypes: [],
      aiAnalysis: '该患者属平和质，体态适中，面色红润，精力充沛，睡眠良好，二便正常。舌淡红苔薄白，脉和缓有力。目前健康状态良好，各项偏颇体质评分均较低。建议继续保持良好的生活习惯，饮食多样化，坚持适量运动。季节更替时注意适应性调节，保持情志平和。定期体质复查，预防偏颇体质的发展。',
    },
  })

  // ============================================================
  // 6. 养生方案（每个患者1个）
  // ============================================================

  await prisma.healthPlan.create({
    data: {
      userId: patient1User.id,
      assessmentId: assessment1.id,
      dietAdvice: {
        recommended: ['黄芪炖鸡', '山药粥', '大枣', '小米粥', '党参煲汤', '糯米', '红薯', '香菇'],
        avoid: ['生冷瓜果', '冷饮', '苦瓜', '绿豆过量', '螃蟹', '西瓜过量'],
        recipes: [
          '黄芪党参炖老母鸡：黄芪30g、党参15g、老母鸡半只，炖2小时',
          '四君子粥：党参10g、白术10g、茯苓10g、甘草5g，煎汤后加大米煮粥',
          '山药薏米芡实粥：山药30g、薏米20g、芡实15g，大米适量煮粥',
        ],
      },
      exerciseAdvice: {
        type: '柔和有氧运动',
        recommended: ['八段锦', '太极拳', '散步', '慢跑（短时间）'],
        frequency: '每日1次，每次20-30分钟',
        precaution: '避免剧烈运动和大汗出，运动后注意保暖，循序渐进增加运动量',
      },
      lifestyleAdvice: {
        sleep: '晚10点前入睡，保证7-8小时睡眠，午休20-30分钟',
        daily: '避免过度劳累，注意劳逸结合，避风寒',
        seasonal: '春季注意防风保暖，冬季重点温补',
        bathing: '宜温水浴，避免冷水浴',
      },
      emotionAdvice: {
        principle: '保持心情愉悦，避免忧思过度',
        methods: ['听舒缓音乐', '与朋友交流', '培养兴趣爱好', '适当晒太阳'],
        warning: '气虚者易疲倦消沉，需注意自我鼓励，保持积极心态',
      },
      acupointAdvice: {
        points: [
          { name: '足三里', location: '外膝眼下三寸', method: '每日按揉3-5分钟', effect: '补中益气、健脾和胃' },
          { name: '气海', location: '脐下1.5寸', method: '艾灸或掌心温敷', effect: '培补元气' },
          { name: '关元', location: '脐下3寸', method: '艾灸10-15分钟', effect: '补肾固本、温阳益气' },
        ],
      },
      isActive: true,
    },
  })

  await prisma.healthPlan.create({
    data: {
      userId: patient2User.id,
      assessmentId: assessment2.id,
      dietAdvice: {
        recommended: ['银耳羹', '百合莲子汤', '枸杞', '黑芝麻', '鸭肉', '甲鱼', '梨', '蜂蜜'],
        avoid: ['辣椒', '羊肉', '狗肉', '韭菜', '炒货', '烧烤', '烈酒', '油炸食品'],
        recipes: [
          '银耳百合莲子羹：银耳1朵、百合20g、莲子15g、冰糖适量，慢炖1小时',
          '枸杞菊花茶：枸杞10g、菊花5g，沸水冲泡代茶饮',
          '沙参玉竹老鸭汤：沙参20g、玉竹15g、老鸭半只，炖2小时',
        ],
      },
      exerciseAdvice: {
        type: '中等强度、不过度出汗的运动',
        recommended: ['瑜伽', '游泳', '太极拳', '散步'],
        frequency: '每日1次，每次30-40分钟，避开正午高温时段',
        precaution: '避免高温环境运动，运动后及时补充水分，不宜大汗淋漓',
      },
      lifestyleAdvice: {
        sleep: '晚10点前入睡，保证7-8小时，避免熬夜耗阴',
        daily: '保持室内适当湿度，避免长时间使用电子屏幕',
        seasonal: '秋冬注意滋阴润燥，夏季防暑降温',
        bathing: '可用温水泡脚，加入菊花、枸杞',
      },
      emotionAdvice: {
        principle: '疏肝理气，保持情志舒畅',
        methods: ['冥想', '深呼吸练习', '书法绘画', '园艺花草'],
        warning: '阴虚兼气郁者容易焦虑烦躁，需学会情绪调节，及时疏导负面情绪',
      },
      acupointAdvice: {
        points: [
          { name: '三阴交', location: '内踝上三寸', method: '每日按揉3-5分钟', effect: '滋阴养血、调理肝脾肾' },
          { name: '太溪', location: '内踝后方凹陷处', method: '按揉2-3分钟', effect: '滋补肾阴' },
          { name: '涌泉', location: '足底前三分之一凹陷处', method: '睡前按揉', effect: '引火归元、滋阴降火' },
        ],
      },
      isActive: true,
    },
  })

  await prisma.healthPlan.create({
    data: {
      userId: patient3User.id,
      assessmentId: assessment3.id,
      dietAdvice: {
        recommended: ['冬瓜', '薏仁', '赤小豆', '荷叶', '山楂', '陈皮', '白萝卜', '芹菜'],
        avoid: ['肥肉', '油炸食品', '甜食', '奶油', '冰激凌', '啤酒', '糯米', '榴莲'],
        recipes: [
          '薏仁赤小豆汤：薏仁30g、赤小豆30g，煮水代茶饮，健脾祛湿',
          '荷叶冬瓜汤：鲜荷叶半张、冬瓜500g，加少许盐，清热利湿',
          '山楂陈皮饮：山楂15g、陈皮10g，沸水冲泡，消食化痰',
        ],
      },
      exerciseAdvice: {
        type: '中等到较高强度有氧运动',
        recommended: ['快走', '慢跑', '游泳', '骑自行车', '健身操'],
        frequency: '每日至少30分钟，每周5次以上',
        precaution: '注意循序渐进，运动强度可逐步增加，需配合控制饮食。监测血压心率，如有不适立即停止',
      },
      lifestyleAdvice: {
        sleep: '早睡早起，避免赖床，睡前不进食',
        daily: '保持居住环境干燥通风，避免潮湿。控制体重，BMI目标降至24以下',
        seasonal: '梅雨季节注意祛湿，三伏天可做三伏贴',
        bathing: '可用花椒、艾叶泡脚，温经散寒除湿',
      },
      emotionAdvice: {
        principle: '保持开朗乐观，避免过安过逸',
        methods: ['参加社交活动', '户外运动', '培养积极兴趣', '设定健康目标'],
        warning: '痰湿体质容易倦怠懒动，需要主动克服惰性，坚持运动计划',
      },
      acupointAdvice: {
        points: [
          { name: '丰隆', location: '外踝上八寸', method: '每日按揉5分钟', effect: '化痰祛湿、和胃降逆' },
          { name: '阴陵泉', location: '胫骨内侧髁下方凹陷处', method: '按揉3-5分钟', effect: '健脾利湿' },
          { name: '中脘', location: '脐上4寸', method: '顺时针按摩', effect: '健脾和胃、消食化滞' },
        ],
      },
      isActive: true,
    },
  })

  await prisma.healthPlan.create({
    data: {
      userId: patient4User.id,
      assessmentId: assessment4.id,
      dietAdvice: {
        recommended: ['山楂', '红花', '桃仁', '玫瑰花茶', '黑木耳', '醋', '红糖', '藏红花'],
        avoid: ['寒凉生冷', '肥腻食物', '油炸烧烤', '过度饮酒'],
        recipes: [
          '山楂红糖饮：山楂15g、红糖适量，煮水饮用，活血化瘀',
          '黑木耳红枣汤：黑木耳10g、红枣5枚，慢炖1小时，养血活血',
          '玫瑰花当归茶：玫瑰花5g、当归3g，沸水冲泡，行气活血',
        ],
      },
      exerciseAdvice: {
        type: '促进气血运行的运动',
        recommended: ['太极拳', '瑜伽', '八段锦', '舞蹈', '散步'],
        frequency: '每日1次，每次30-40分钟',
        precaution: '注意保暖，避免在寒冷环境中运动，经期适当减少运动量',
      },
      lifestyleAdvice: {
        sleep: '保证充足睡眠，避免熬夜',
        daily: '注意保暖，尤其是腹部和下肢。避免久坐不动，每小时起身活动',
        seasonal: '冬季注意温经散寒，夏季适当出汗有助活血',
        bathing: '可用艾叶、红花泡脚，温经活血',
      },
      emotionAdvice: {
        principle: '舒畅情志，避免抑郁烦闷',
        methods: ['唱歌', '跳舞', '与朋友聚会', '旅行散心', '芳香疗法'],
        warning: '血瘀兼气郁者情绪容易低落，建议多参加社交活动，保持心情开朗',
      },
      acupointAdvice: {
        points: [
          { name: '血海', location: '髌底内侧上两寸', method: '每日按揉3-5分钟', effect: '活血化瘀、调经止痛' },
          { name: '合谷', location: '虎口处', method: '按揉2-3分钟', effect: '行气活血、通络止痛' },
          { name: '膈俞', location: '第七胸椎棘突下旁开1.5寸', method: '艾灸或拔罐', effect: '活血化瘀、理气宽胸' },
        ],
      },
      isActive: true,
    },
  })

  await prisma.healthPlan.create({
    data: {
      userId: patient5User.id,
      assessmentId: assessment5.id,
      dietAdvice: {
        recommended: ['五谷杂粮', '时令蔬果', '鱼类', '豆制品', '坚果适量', '绿茶', '蜂蜜'],
        avoid: ['过度辛辣', '过度油腻', '过度生冷', '暴饮暴食'],
        recipes: [
          '五色养生粥：黑米、红豆、绿豆、黄豆、薏仁各适量，煮粥日常食用',
          '清蒸鲈鱼：鲈鱼一条，姜丝葱段少许，清蒸8分钟',
          '时令果蔬沙拉：当季新鲜蔬果，橄榄油柠檬汁调味',
        ],
      },
      exerciseAdvice: {
        type: '多样化运动',
        recommended: ['跑步', '游泳', '篮球', '羽毛球', '健身', '登山'],
        frequency: '每周运动4-5次，每次40-60分钟',
        precaution: '保持运动多样性，注意运动前热身和运动后拉伸',
      },
      lifestyleAdvice: {
        sleep: '规律作息，晚11点前入睡，睡眠7-8小时',
        daily: '保持规律生活节奏，适度工作，劳逸结合',
        seasonal: '顺应四时养生，春养肝、夏养心、秋养肺、冬养肾',
        bathing: '温水沐浴，可根据季节调整水温',
      },
      emotionAdvice: {
        principle: '保持平和心态，积极乐观',
        methods: ['阅读', '运动', '社交', '旅行', '冥想'],
        warning: '平和质状态良好，注意预防亚健康，避免长期高压力状态',
      },
      acupointAdvice: null,
      isActive: true,
    },
  })

  // ============================================================
  // 7. 健康日记（每个患者至少3条）
  // ============================================================

  // 患者1（张伟）的日记
  await prisma.diaryEntry.createMany({
    data: [
      {
        userId: patient1User.id,
        date: new Date('2026-02-20'),
        sleepHours: 7,
        sleepQuality: 3,
        moodScore: 3,
        exerciseMinutes: 20,
        exerciseType: '八段锦',
        dietNote: '早餐小米粥配红枣，午餐黄芪炖鸡，晚餐清淡蔬菜',
        symptoms: ['容易疲倦', '食后腹胀'],
        note: '今天练了八段锦，感觉比之前轻松一些，但下午还是有些乏力。',
      },
      {
        userId: patient1User.id,
        date: new Date('2026-02-21'),
        sleepHours: 7.5,
        sleepQuality: 4,
        moodScore: 4,
        exerciseMinutes: 25,
        exerciseType: '散步',
        dietNote: '四君子粥早餐，午餐正常，下午喝了红枣枸杞茶',
        symptoms: ['微微出汗'],
        note: '精神比昨天好，散步后微微出汗，没有明显不适。',
      },
      {
        userId: patient1User.id,
        date: new Date('2026-02-22'),
        sleepHours: 6.5,
        sleepQuality: 3,
        moodScore: 3,
        exerciseMinutes: 15,
        exerciseType: '八段锦',
        dietNote: '山药薏米粥，中午吃了香菇炖鸡',
        symptoms: ['疲倦', '气短'],
        note: '昨晚睡得不太好，今天气短明显，运动量减少了。',
      },
    ],
  })

  // 患者2（刘芳）的日记
  await prisma.diaryEntry.createMany({
    data: [
      {
        userId: patient2User.id,
        date: new Date('2026-02-19'),
        sleepHours: 6,
        sleepQuality: 3,
        moodScore: 3,
        exerciseMinutes: 40,
        exerciseType: '瑜伽',
        dietNote: '银耳百合羹，枸杞菊花茶，午餐清蒸鱼',
        symptoms: ['口干', '手心热'],
        note: '练瑜伽后感觉心情放松了很多，但入睡还是比较困难。',
      },
      {
        userId: patient2User.id,
        date: new Date('2026-02-20'),
        sleepHours: 6.5,
        sleepQuality: 3,
        moodScore: 4,
        exerciseMinutes: 30,
        exerciseType: '散步',
        dietNote: '沙参玉竹鸭汤，水果以梨为主',
        symptoms: ['口干减轻'],
        note: '坚持喝滋阴汤水，口干症状有所改善。',
      },
      {
        userId: patient2User.id,
        date: new Date('2026-02-21'),
        sleepHours: 7,
        sleepQuality: 4,
        moodScore: 4,
        exerciseMinutes: 35,
        exerciseType: '瑜伽',
        dietNote: '百合莲子粥，蜂蜜水，清炒时蔬',
        symptoms: [],
        note: '今天状态不错，睡眠改善了，没有明显不适症状。',
      },
    ],
  })

  // 患者3（陈建国）的日记
  await prisma.diaryEntry.createMany({
    data: [
      {
        userId: patient3User.id,
        date: new Date('2026-02-18'),
        sleepHours: 8,
        sleepQuality: 3,
        moodScore: 3,
        exerciseMinutes: 30,
        exerciseType: '快走',
        dietNote: '薏仁赤小豆汤，午餐减少主食量，晚餐冬瓜汤',
        symptoms: ['身体沉重', '痰多', '腹部胀满'],
        note: '开始控制饮食了，但还是觉得身体沉重，痰比较多。',
      },
      {
        userId: patient3User.id,
        date: new Date('2026-02-20'),
        sleepHours: 7.5,
        sleepQuality: 3,
        moodScore: 3,
        exerciseMinutes: 35,
        exerciseType: '快走',
        dietNote: '荷叶冬瓜汤，白萝卜排骨汤（少油），水果以苹果为主',
        symptoms: ['身重', '口黏'],
        note: '血压今天量了一下 145/90，需要继续注意。快走比昨天多走了5分钟。',
      },
      {
        userId: patient3User.id,
        date: new Date('2026-02-22'),
        sleepHours: 7,
        sleepQuality: 4,
        moodScore: 4,
        exerciseMinutes: 40,
        exerciseType: '慢跑',
        dietNote: '山楂陈皮饮，芹菜炒百合，全麦馒头',
        symptoms: ['痰多减轻'],
        note: '体重降了1斤，继续坚持。今天第一次尝试慢跑，跑了20分钟走了20分钟。',
      },
      {
        userId: patient3User.id,
        date: new Date('2026-02-24'),
        sleepHours: 7,
        sleepQuality: 4,
        moodScore: 4,
        exerciseMinutes: 45,
        exerciseType: '慢跑+快走',
        dietNote: '薏仁粥，清炒芹菜，蒸鱼',
        symptoms: [],
        note: '感觉身体轻松了一些，血压 138/88，稍有改善。',
      },
    ],
  })

  // 患者4（赵雪梅）的日记
  await prisma.diaryEntry.createMany({
    data: [
      {
        userId: patient4User.id,
        date: new Date('2026-02-17'),
        sleepHours: 6.5,
        sleepQuality: 3,
        moodScore: 3,
        exerciseMinutes: 30,
        exerciseType: '太极拳',
        dietNote: '玫瑰花茶，黑木耳红枣汤，当归炖鸡',
        symptoms: ['面色晦暗', '腹部隐痛'],
        note: '经期刚过，腹部还有些隐痛。打了一套太极拳，身体微微发热。',
      },
      {
        userId: patient4User.id,
        date: new Date('2026-02-19'),
        sleepHours: 7,
        sleepQuality: 4,
        moodScore: 4,
        exerciseMinutes: 35,
        exerciseType: '瑜伽',
        dietNote: '山楂红糖饮，午餐黑木耳炒山药',
        symptoms: ['肩颈僵硬'],
        note: '瑜伽对肩颈僵硬很有帮助，练完后舒服了很多。',
      },
      {
        userId: patient4User.id,
        date: new Date('2026-02-22'),
        sleepHours: 7.5,
        sleepQuality: 4,
        moodScore: 4,
        exerciseMinutes: 40,
        exerciseType: '八段锦+散步',
        dietNote: '玫瑰当归茶，红花泡脚',
        symptoms: [],
        note: '坚持活血化瘀的调理方案，感觉面色好了一些，精神也好了。',
      },
    ],
  })

  // 患者5（孙浩然）的日记
  await prisma.diaryEntry.createMany({
    data: [
      {
        userId: patient5User.id,
        date: new Date('2026-02-20'),
        sleepHours: 7.5,
        sleepQuality: 5,
        moodScore: 5,
        exerciseMinutes: 60,
        exerciseType: '跑步',
        dietNote: '五色养生粥，午餐正常，晚餐清蒸鲈鱼',
        symptoms: [],
        note: '状态很好，跑了5公里，配速5分半。',
      },
      {
        userId: patient5User.id,
        date: new Date('2026-02-22'),
        sleepHours: 8,
        sleepQuality: 5,
        moodScore: 5,
        exerciseMinutes: 50,
        exerciseType: '游泳',
        dietNote: '牛奶燕麦早餐，坚果，水果蔬菜沙拉',
        symptoms: [],
        note: '游了1500米，感觉非常棒，体力充沛。',
      },
      {
        userId: patient5User.id,
        date: new Date('2026-02-24'),
        sleepHours: 7,
        sleepQuality: 4,
        moodScore: 5,
        exerciseMinutes: 45,
        exerciseType: '羽毛球',
        dietNote: '杂粮饭，清炒时蔬，水煮虾',
        symptoms: [],
        note: '和朋友打了羽毛球，运动后精神很好。',
      },
    ],
  })

  // ============================================================
  // 8. 随访计划（医生1给患者1和患者3各创建1个）
  // ============================================================

  const followupPlan1 = await prisma.followupPlan.create({
    data: {
      patientId: patient1User.patientProfile!.id,
      doctorId: doctor1User.doctorProfile!.id,
      name: '气虚质综合调理随访',
      description: '针对张伟的气虚质体质，制定为期两个月的综合调理随访计划。重点关注疲劳改善情况、脾胃功能恢复、八段锦锻炼坚持情况以及整体精力提升。',
      startDate: new Date('2026-02-10'),
      endDate: new Date('2026-04-10'),
      intervalDays: 14,
    },
  })

  const followupPlan2 = await prisma.followupPlan.create({
    data: {
      patientId: patient3User.patientProfile!.id,
      doctorId: doctor1User.doctorProfile!.id,
      name: '痰湿质代谢综合征管理随访',
      description: '针对陈建国的痰湿质体质合并高血压、高脂血症、脂肪肝，制定为期三个月的综合管理随访计划。重点关注体重、血压、血脂变化，饮食运动执行情况。',
      startDate: new Date('2026-02-18'),
      endDate: new Date('2026-05-18'),
      intervalDays: 7,
    },
  })

  // ============================================================
  // 9. 随访记录（每个计划2条）
  // ============================================================

  // 随访计划1的记录
  await prisma.followupRecord.createMany({
    data: [
      {
        planId: followupPlan1.id,
        scheduledDate: new Date('2026-02-24'),
        completedDate: new Date('2026-02-24'),
        status: FollowupStatus.COMPLETED,
        feedback: {
          selfAssessment: '感觉比两周前精力有所改善',
          symptoms: ['疲倦减轻', '食欲改善', '偶有气短'],
          exerciseCompliance: '八段锦坚持每天练习，每次20分钟',
          dietCompliance: '基本按照方案执行，偶尔吃了冷饮',
          sleepQuality: '入睡比之前快了，但偶尔早醒',
        },
        aiSummary: '患者气虚症状有所改善，疲倦感减轻，食欲恢复。八段锦锻炼坚持良好，但运动量可适当增加。饮食方面需注意避免冷饮。睡眠改善中，建议继续调理。整体向好发展，继续当前方案。',
        riskFlag: false,
        riskNote: null,
      },
      {
        planId: followupPlan1.id,
        scheduledDate: new Date('2026-03-10'),
        completedDate: null,
        status: FollowupStatus.PENDING,
        feedback: null,
        aiSummary: null,
        riskFlag: false,
        riskNote: null,
      },
    ],
  })

  // 随访计划2的记录
  await prisma.followupRecord.createMany({
    data: [
      {
        planId: followupPlan2.id,
        scheduledDate: new Date('2026-02-25'),
        completedDate: new Date('2026-02-25'),
        status: FollowupStatus.COMPLETED,
        feedback: {
          selfAssessment: '身体沉重感有所减轻，但改善缓慢',
          weight: 91,
          bloodPressure: '142/88',
          symptoms: ['痰多减轻', '口黏减轻', '仍有腹胀'],
          exerciseCompliance: '快走和慢跑交替，每天30-40分钟',
          dietCompliance: '严格控制了油腻和甜食摄入，主食减量',
          bloodTestScheduled: true,
        },
        aiSummary: '患者体重较初始下降1kg，血压略有下降但仍偏高（142/88mmHg）。痰湿症状有所缓解，运动和饮食执行较好。建议继续保持，同时安排下次血脂复查。腹胀症状持续，可考虑加强健脾化湿方药。需密切关注血压变化。',
        riskFlag: true,
        riskNote: '血压控制仍未达标，需关注。建议患者居家每日监测血压并记录。',
      },
      {
        planId: followupPlan2.id,
        scheduledDate: new Date('2026-03-04'),
        completedDate: null,
        status: FollowupStatus.PENDING,
        feedback: null,
        aiSummary: null,
        riskFlag: false,
        riskNote: null,
      },
    ],
  })

  console.log('Seed completed successfully!')
  console.log('Created:')
  console.log('  - 1 hospital')
  console.log('  - 1 admin user')
  console.log('  - 2 doctors with profiles')
  console.log('  - 5 patients with profiles')
  console.log('  - 5 constitution assessments')
  console.log('  - 5 health plans')
  console.log('  - 16 diary entries')
  console.log('  - 2 followup plans')
  console.log('  - 4 followup records')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
