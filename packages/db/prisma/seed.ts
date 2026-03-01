import {
  PrismaClient,
  Role,
  ConstitutionType,
  RiskLevel,
  FollowupStatus,
  ServiceCategory,
  ContentType,
  ActivityStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ============================================================
  // 1. 医院
  // ============================================================
  const hospital = await prisma.hospital.create({
    data: {
      name: "北京中医药大学附属医院",
      level: "三甲",
      address: "北京市朝阳区北三环东路11号",
      config: {
        enableAIChat: true,
        enableConstitutionAssessment: true,
        enableFollowup: true,
        enableHealthDiary: true,
        maxDailyAssessments: 100,
      },
    },
  });

  // ============================================================
  // 2. 管理员用户
  // ============================================================
  await prisma.user.create({
    data: {
      phone: "13800000001",
      name: "系统管理员",
      role: Role.ADMIN,
      hospitalId: hospital.id,
    },
  });

  // ============================================================
  // 3. 医生用户
  // ============================================================
  const doctor1User = await prisma.user.create({
    data: {
      phone: "13900000001",
      name: "李明远",
      role: Role.DOCTOR,
      hospitalId: hospital.id,
      doctorProfile: {
        create: {
          title: "主任医师",
          department: "治未病科",
          specialty: "中医体质辨识与调理，擅长痰湿质、气虚质的综合调治",
          licenseNo: "TCMD-BJ-2015-00321",
        },
      },
    },
    include: { doctorProfile: true },
  });

  const doctor2User = await prisma.user.create({
    data: {
      phone: "13900000002",
      name: "王素芳",
      role: Role.DOCTOR,
      hospitalId: hospital.id,
      doctorProfile: {
        create: {
          title: "副主任医师",
          department: "中医内科",
          specialty: "阴虚质、血瘀质的辨治，中医养生与膏方调理",
          licenseNo: "TCMD-BJ-2017-00587",
        },
      },
    },
    include: { doctorProfile: true },
  });

  // ============================================================
  // 4. 患者用户（5个，各有不同体质和风险等级）
  // ============================================================

  // --- 患者1：张伟，气虚质 ---
  const patient1User = await prisma.user.create({
    data: {
      phone: "13600000001",
      name: "张伟",
      role: Role.PATIENT,
      hospitalId: hospital.id,
      patientProfile: {
        create: {
          gender: "男",
          birthDate: new Date("1978-03-15"),
          height: 172,
          weight: 68,
          allergies: ["花粉"],
          medicalHistory: ["慢性胃炎"],
          riskLevel: RiskLevel.MEDIUM,
          lastVisitDate: new Date("2026-02-10"),
          primaryConstitution: ConstitutionType.QI_DEFICIENCY,
        },
      },
    },
    include: { patientProfile: true },
  });

  // --- 患者2：刘芳，阴虚质 ---
  const patient2User = await prisma.user.create({
    data: {
      phone: "13600000002",
      name: "刘芳",
      role: Role.PATIENT,
      hospitalId: hospital.id,
      patientProfile: {
        create: {
          gender: "女",
          birthDate: new Date("1985-07-22"),
          height: 160,
          weight: 52,
          allergies: [],
          medicalHistory: ["甲状腺结节"],
          riskLevel: RiskLevel.LOW,
          lastVisitDate: new Date("2026-02-15"),
          primaryConstitution: ConstitutionType.YIN_DEFICIENCY,
        },
      },
    },
    include: { patientProfile: true },
  });

  // --- 患者3：陈建国，痰湿质 ---
  const patient3User = await prisma.user.create({
    data: {
      phone: "13600000003",
      name: "陈建国",
      role: Role.PATIENT,
      hospitalId: hospital.id,
      patientProfile: {
        create: {
          gender: "男",
          birthDate: new Date("1970-11-08"),
          height: 175,
          weight: 92,
          allergies: ["海鲜"],
          medicalHistory: ["高血压", "高脂血症", "脂肪肝"],
          riskLevel: RiskLevel.HIGH,
          lastVisitDate: new Date("2026-02-18"),
          primaryConstitution: ConstitutionType.PHLEGM_DAMPNESS,
        },
      },
    },
    include: { patientProfile: true },
  });

  // --- 患者4：赵雪梅，血瘀质 ---
  const patient4User = await prisma.user.create({
    data: {
      phone: "13600000004",
      name: "赵雪梅",
      role: Role.PATIENT,
      hospitalId: hospital.id,
      patientProfile: {
        create: {
          gender: "女",
          birthDate: new Date("1968-01-30"),
          height: 158,
          weight: 60,
          allergies: [],
          medicalHistory: ["子宫肌瘤", "月经不调"],
          riskLevel: RiskLevel.MEDIUM,
          lastVisitDate: new Date("2026-01-25"),
          primaryConstitution: ConstitutionType.BLOOD_STASIS,
        },
      },
    },
    include: { patientProfile: true },
  });

  // --- 患者5：孙浩然，平和质 ---
  const patient5User = await prisma.user.create({
    data: {
      phone: "13600000005",
      name: "孙浩然",
      role: Role.PATIENT,
      hospitalId: hospital.id,
      patientProfile: {
        create: {
          gender: "男",
          birthDate: new Date("1995-05-12"),
          height: 178,
          weight: 72,
          allergies: [],
          medicalHistory: [],
          riskLevel: RiskLevel.LOW,
          lastVisitDate: new Date("2026-02-20"),
          primaryConstitution: ConstitutionType.BALANCED,
        },
      },
    },
    include: { patientProfile: true },
  });

  // ============================================================
  // 5. 体质评估记录（每个患者1条）
  // ============================================================

  const assessment1 = await prisma.constitutionAssessment.create({
    data: {
      userId: patient1User.id,
      answers: {
        q1: 3,
        q2: 4,
        q3: 2,
        q4: 4,
        q5: 3,
        q6: 2,
        q7: 4,
        q8: 3,
        q9: 2,
        q10: 3,
        q11: 4,
        q12: 2,
        q13: 3,
        q14: 2,
        q15: 3,
        q16: 4,
        q17: 3,
        q18: 2,
        q19: 3,
        q20: 2,
        q21: 4,
        q22: 3,
        q23: 2,
        q24: 3,
        q25: 2,
        q26: 3,
        q27: 4,
        q28: 2,
        q29: 3,
        q30: 2,
        q31: 3,
        q32: 2,
        q33: 3,
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
      aiAnalysis:
        "该患者以气虚质为主，兼有阳虚倾向。主要表现为容易疲乏、气短懒言、易出汗、舌淡胖、脉虚弱。建议以补气健脾为主，兼顾温阳。注意饮食宜温补，避免生冷寒凉。日常可配合八段锦等柔和运动，循序渐进。慢性胃炎病史提示脾胃功能较弱，需重点调理中焦。",
    },
  });

  const assessment2 = await prisma.constitutionAssessment.create({
    data: {
      userId: patient2User.id,
      answers: {
        q1: 2,
        q2: 3,
        q3: 4,
        q4: 2,
        q5: 4,
        q6: 3,
        q7: 2,
        q8: 4,
        q9: 3,
        q10: 4,
        q11: 2,
        q12: 3,
        q13: 4,
        q14: 3,
        q15: 2,
        q16: 3,
        q17: 4,
        q18: 3,
        q19: 4,
        q20: 2,
        q21: 3,
        q22: 4,
        q23: 3,
        q24: 2,
        q25: 4,
        q26: 3,
        q27: 2,
        q28: 4,
        q29: 3,
        q30: 2,
        q31: 4,
        q32: 3,
        q33: 2,
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
      aiAnalysis:
        "该患者属阴虚质，兼有气郁倾向。表现为手足心热、口干咽燥、喜冷饮、面色潮红、舌红少苔、脉细数。甲状腺结节与阴虚内热、气郁痰凝有关。建议滋阴清热、疏肝理气。饮食宜清淡滋润，多食银耳、百合、莲子等养阴之品，忌辛辣燥热。保持心情舒畅，避免熬夜耗阴。",
    },
  });

  const assessment3 = await prisma.constitutionAssessment.create({
    data: {
      userId: patient3User.id,
      answers: {
        q1: 4,
        q2: 3,
        q3: 2,
        q4: 4,
        q5: 3,
        q6: 4,
        q7: 3,
        q8: 2,
        q9: 4,
        q10: 3,
        q11: 4,
        q12: 3,
        q13: 2,
        q14: 4,
        q15: 3,
        q16: 2,
        q17: 4,
        q18: 3,
        q19: 2,
        q20: 4,
        q21: 3,
        q22: 2,
        q23: 4,
        q24: 3,
        q25: 2,
        q26: 4,
        q27: 3,
        q28: 2,
        q29: 4,
        q30: 3,
        q31: 2,
        q32: 4,
        q33: 3,
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
      secondaryTypes: [
        ConstitutionType.QI_DEFICIENCY,
        ConstitutionType.DAMP_HEAT,
      ],
      aiAnalysis:
        "该患者为典型痰湿质，兼有气虚和湿热。体型偏胖，BMI超标，腹部肥满。面色淡黄而暗，口黏腻，身重不爽，舌体胖大有齿痕、苔白腻，脉滑。合并高血压、高脂血症和脂肪肝，属代谢综合征高风险人群。治宜健脾化痰、利湿降浊。饮食需严格控制，减少肥甘厚味，增加山药、薏仁、冬瓜等健脾祛湿食材。运动以有氧运动为主，每日至少30分钟。需定期监测血压血脂。",
    },
  });

  const assessment4 = await prisma.constitutionAssessment.create({
    data: {
      userId: patient4User.id,
      answers: {
        q1: 3,
        q2: 2,
        q3: 4,
        q4: 3,
        q5: 2,
        q6: 4,
        q7: 3,
        q8: 4,
        q9: 2,
        q10: 3,
        q11: 2,
        q12: 4,
        q13: 3,
        q14: 4,
        q15: 2,
        q16: 3,
        q17: 2,
        q18: 4,
        q19: 3,
        q20: 4,
        q21: 2,
        q22: 3,
        q23: 4,
        q24: 2,
        q25: 3,
        q26: 4,
        q27: 2,
        q28: 3,
        q29: 4,
        q30: 2,
        q31: 3,
        q32: 4,
        q33: 2,
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
      aiAnalysis:
        "该患者属血瘀质，兼有气郁。面色晦暗，眼眶偏黑，口唇紫暗，皮肤粗糙，有瘀斑。有子宫肌瘤和月经不调病史，与瘀血内停、气滞血瘀密切相关。舌质紫暗有瘀点，脉涩。治宜活血化瘀、行气通络。饮食宜用山楂、红花、桃仁等活血食材，忌寒凉收涩。推荐太极拳、瑜伽等促进气血运行的运动。情绪调节也很重要，避免抑郁多思。",
    },
  });

  const assessment5 = await prisma.constitutionAssessment.create({
    data: {
      userId: patient5User.id,
      answers: {
        q1: 2,
        q2: 2,
        q3: 1,
        q4: 2,
        q5: 1,
        q6: 2,
        q7: 1,
        q8: 2,
        q9: 1,
        q10: 2,
        q11: 1,
        q12: 2,
        q13: 1,
        q14: 2,
        q15: 1,
        q16: 2,
        q17: 1,
        q18: 2,
        q19: 1,
        q20: 2,
        q21: 1,
        q22: 2,
        q23: 1,
        q24: 2,
        q25: 1,
        q26: 2,
        q27: 1,
        q28: 2,
        q29: 1,
        q30: 2,
        q31: 1,
        q32: 2,
        q33: 1,
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
      aiAnalysis:
        "该患者属平和质，体态适中，面色红润，精力充沛，睡眠良好，二便正常。舌淡红苔薄白，脉和缓有力。目前健康状态良好，各项偏颇体质评分均较低。建议继续保持良好的生活习惯，饮食多样化，坚持适量运动。季节更替时注意适应性调节，保持情志平和。定期体质复查，预防偏颇体质的发展。",
    },
  });

  // ============================================================
  // 6. 养生方案（每个患者1个）
  // ============================================================

  await prisma.healthPlan.create({
    data: {
      userId: patient1User.id,
      assessmentId: assessment1.id,
      dietAdvice: {
        recommended: [
          "黄芪炖鸡",
          "山药粥",
          "大枣",
          "小米粥",
          "党参煲汤",
          "糯米",
          "红薯",
          "香菇",
        ],
        avoid: ["生冷瓜果", "冷饮", "苦瓜", "绿豆过量", "螃蟹", "西瓜过量"],
        recipes: [
          "黄芪党参炖老母鸡：黄芪30g、党参15g、老母鸡半只，炖2小时",
          "四君子粥：党参10g、白术10g、茯苓10g、甘草5g，煎汤后加大米煮粥",
          "山药薏米芡实粥：山药30g、薏米20g、芡实15g，大米适量煮粥",
        ],
      },
      exerciseAdvice: {
        type: "柔和有氧运动",
        recommended: ["八段锦", "太极拳", "散步", "慢跑（短时间）"],
        frequency: "每日1次，每次20-30分钟",
        precaution: "避免剧烈运动和大汗出，运动后注意保暖，循序渐进增加运动量",
      },
      lifestyleAdvice: {
        sleep: "晚10点前入睡，保证7-8小时睡眠，午休20-30分钟",
        daily: "避免过度劳累，注意劳逸结合，避风寒",
        seasonal: "春季注意防风保暖，冬季重点温补",
        bathing: "宜温水浴，避免冷水浴",
      },
      emotionAdvice: {
        principle: "保持心情愉悦，避免忧思过度",
        methods: ["听舒缓音乐", "与朋友交流", "培养兴趣爱好", "适当晒太阳"],
        warning: "气虚者易疲倦消沉，需注意自我鼓励，保持积极心态",
      },
      acupointAdvice: {
        points: [
          {
            name: "足三里",
            location: "外膝眼下三寸",
            method: "每日按揉3-5分钟",
            effect: "补中益气、健脾和胃",
          },
          {
            name: "气海",
            location: "脐下1.5寸",
            method: "艾灸或掌心温敷",
            effect: "培补元气",
          },
          {
            name: "关元",
            location: "脐下3寸",
            method: "艾灸10-15分钟",
            effect: "补肾固本、温阳益气",
          },
        ],
      },
      isActive: true,
    },
  });

  await prisma.healthPlan.create({
    data: {
      userId: patient2User.id,
      assessmentId: assessment2.id,
      dietAdvice: {
        recommended: [
          "银耳羹",
          "百合莲子汤",
          "枸杞",
          "黑芝麻",
          "鸭肉",
          "甲鱼",
          "梨",
          "蜂蜜",
        ],
        avoid: [
          "辣椒",
          "羊肉",
          "狗肉",
          "韭菜",
          "炒货",
          "烧烤",
          "烈酒",
          "油炸食品",
        ],
        recipes: [
          "银耳百合莲子羹：银耳1朵、百合20g、莲子15g、冰糖适量，慢炖1小时",
          "枸杞菊花茶：枸杞10g、菊花5g，沸水冲泡代茶饮",
          "沙参玉竹老鸭汤：沙参20g、玉竹15g、老鸭半只，炖2小时",
        ],
      },
      exerciseAdvice: {
        type: "中等强度、不过度出汗的运动",
        recommended: ["瑜伽", "游泳", "太极拳", "散步"],
        frequency: "每日1次，每次30-40分钟，避开正午高温时段",
        precaution: "避免高温环境运动，运动后及时补充水分，不宜大汗淋漓",
      },
      lifestyleAdvice: {
        sleep: "晚10点前入睡，保证7-8小时，避免熬夜耗阴",
        daily: "保持室内适当湿度，避免长时间使用电子屏幕",
        seasonal: "秋冬注意滋阴润燥，夏季防暑降温",
        bathing: "可用温水泡脚，加入菊花、枸杞",
      },
      emotionAdvice: {
        principle: "疏肝理气，保持情志舒畅",
        methods: ["冥想", "深呼吸练习", "书法绘画", "园艺花草"],
        warning: "阴虚兼气郁者容易焦虑烦躁，需学会情绪调节，及时疏导负面情绪",
      },
      acupointAdvice: {
        points: [
          {
            name: "三阴交",
            location: "内踝上三寸",
            method: "每日按揉3-5分钟",
            effect: "滋阴养血、调理肝脾肾",
          },
          {
            name: "太溪",
            location: "内踝后方凹陷处",
            method: "按揉2-3分钟",
            effect: "滋补肾阴",
          },
          {
            name: "涌泉",
            location: "足底前三分之一凹陷处",
            method: "睡前按揉",
            effect: "引火归元、滋阴降火",
          },
        ],
      },
      isActive: true,
    },
  });

  await prisma.healthPlan.create({
    data: {
      userId: patient3User.id,
      assessmentId: assessment3.id,
      dietAdvice: {
        recommended: [
          "冬瓜",
          "薏仁",
          "赤小豆",
          "荷叶",
          "山楂",
          "陈皮",
          "白萝卜",
          "芹菜",
        ],
        avoid: [
          "肥肉",
          "油炸食品",
          "甜食",
          "奶油",
          "冰激凌",
          "啤酒",
          "糯米",
          "榴莲",
        ],
        recipes: [
          "薏仁赤小豆汤：薏仁30g、赤小豆30g，煮水代茶饮，健脾祛湿",
          "荷叶冬瓜汤：鲜荷叶半张、冬瓜500g，加少许盐，清热利湿",
          "山楂陈皮饮：山楂15g、陈皮10g，沸水冲泡，消食化痰",
        ],
      },
      exerciseAdvice: {
        type: "中等到较高强度有氧运动",
        recommended: ["快走", "慢跑", "游泳", "骑自行车", "健身操"],
        frequency: "每日至少30分钟，每周5次以上",
        precaution:
          "注意循序渐进，运动强度可逐步增加，需配合控制饮食。监测血压心率，如有不适立即停止",
      },
      lifestyleAdvice: {
        sleep: "早睡早起，避免赖床，睡前不进食",
        daily: "保持居住环境干燥通风，避免潮湿。控制体重，BMI目标降至24以下",
        seasonal: "梅雨季节注意祛湿，三伏天可做三伏贴",
        bathing: "可用花椒、艾叶泡脚，温经散寒除湿",
      },
      emotionAdvice: {
        principle: "保持开朗乐观，避免过安过逸",
        methods: ["参加社交活动", "户外运动", "培养积极兴趣", "设定健康目标"],
        warning: "痰湿体质容易倦怠懒动，需要主动克服惰性，坚持运动计划",
      },
      acupointAdvice: {
        points: [
          {
            name: "丰隆",
            location: "外踝上八寸",
            method: "每日按揉5分钟",
            effect: "化痰祛湿、和胃降逆",
          },
          {
            name: "阴陵泉",
            location: "胫骨内侧髁下方凹陷处",
            method: "按揉3-5分钟",
            effect: "健脾利湿",
          },
          {
            name: "中脘",
            location: "脐上4寸",
            method: "顺时针按摩",
            effect: "健脾和胃、消食化滞",
          },
        ],
      },
      isActive: true,
    },
  });

  await prisma.healthPlan.create({
    data: {
      userId: patient4User.id,
      assessmentId: assessment4.id,
      dietAdvice: {
        recommended: [
          "山楂",
          "红花",
          "桃仁",
          "玫瑰花茶",
          "黑木耳",
          "醋",
          "红糖",
          "藏红花",
        ],
        avoid: ["寒凉生冷", "肥腻食物", "油炸烧烤", "过度饮酒"],
        recipes: [
          "山楂红糖饮：山楂15g、红糖适量，煮水饮用，活血化瘀",
          "黑木耳红枣汤：黑木耳10g、红枣5枚，慢炖1小时，养血活血",
          "玫瑰花当归茶：玫瑰花5g、当归3g，沸水冲泡，行气活血",
        ],
      },
      exerciseAdvice: {
        type: "促进气血运行的运动",
        recommended: ["太极拳", "瑜伽", "八段锦", "舞蹈", "散步"],
        frequency: "每日1次，每次30-40分钟",
        precaution: "注意保暖，避免在寒冷环境中运动，经期适当减少运动量",
      },
      lifestyleAdvice: {
        sleep: "保证充足睡眠，避免熬夜",
        daily: "注意保暖，尤其是腹部和下肢。避免久坐不动，每小时起身活动",
        seasonal: "冬季注意温经散寒，夏季适当出汗有助活血",
        bathing: "可用艾叶、红花泡脚，温经活血",
      },
      emotionAdvice: {
        principle: "舒畅情志，避免抑郁烦闷",
        methods: ["唱歌", "跳舞", "与朋友聚会", "旅行散心", "芳香疗法"],
        warning: "血瘀兼气郁者情绪容易低落，建议多参加社交活动，保持心情开朗",
      },
      acupointAdvice: {
        points: [
          {
            name: "血海",
            location: "髌底内侧上两寸",
            method: "每日按揉3-5分钟",
            effect: "活血化瘀、调经止痛",
          },
          {
            name: "合谷",
            location: "虎口处",
            method: "按揉2-3分钟",
            effect: "行气活血、通络止痛",
          },
          {
            name: "膈俞",
            location: "第七胸椎棘突下旁开1.5寸",
            method: "艾灸或拔罐",
            effect: "活血化瘀、理气宽胸",
          },
        ],
      },
      isActive: true,
    },
  });

  await prisma.healthPlan.create({
    data: {
      userId: patient5User.id,
      assessmentId: assessment5.id,
      dietAdvice: {
        recommended: [
          "五谷杂粮",
          "时令蔬果",
          "鱼类",
          "豆制品",
          "坚果适量",
          "绿茶",
          "蜂蜜",
        ],
        avoid: ["过度辛辣", "过度油腻", "过度生冷", "暴饮暴食"],
        recipes: [
          "五色养生粥：黑米、红豆、绿豆、黄豆、薏仁各适量，煮粥日常食用",
          "清蒸鲈鱼：鲈鱼一条，姜丝葱段少许，清蒸8分钟",
          "时令果蔬沙拉：当季新鲜蔬果，橄榄油柠檬汁调味",
        ],
      },
      exerciseAdvice: {
        type: "多样化运动",
        recommended: ["跑步", "游泳", "篮球", "羽毛球", "健身", "登山"],
        frequency: "每周运动4-5次，每次40-60分钟",
        precaution: "保持运动多样性，注意运动前热身和运动后拉伸",
      },
      lifestyleAdvice: {
        sleep: "规律作息，晚11点前入睡，睡眠7-8小时",
        daily: "保持规律生活节奏，适度工作，劳逸结合",
        seasonal: "顺应四时养生，春养肝、夏养心、秋养肺、冬养肾",
        bathing: "温水沐浴，可根据季节调整水温",
      },
      emotionAdvice: {
        principle: "保持平和心态，积极乐观",
        methods: ["阅读", "运动", "社交", "旅行", "冥想"],
        warning: "平和质状态良好，注意预防亚健康，避免长期高压力状态",
      },
      acupointAdvice: null,
      isActive: true,
    },
  });

  // ============================================================
  // 7. 健康日记（每个患者至少3条）
  // ============================================================

  // 患者1（张伟）的日记
  await prisma.diaryEntry.createMany({
    data: [
      {
        userId: patient1User.id,
        date: new Date("2026-02-20"),
        sleepHours: 7,
        sleepQuality: 3,
        moodScore: 3,
        exerciseMinutes: 20,
        exerciseType: "八段锦",
        dietNote: "早餐小米粥配红枣，午餐黄芪炖鸡，晚餐清淡蔬菜",
        symptoms: ["容易疲倦", "食后腹胀"],
        note: "今天练了八段锦，感觉比之前轻松一些，但下午还是有些乏力。",
      },
      {
        userId: patient1User.id,
        date: new Date("2026-02-21"),
        sleepHours: 7.5,
        sleepQuality: 4,
        moodScore: 4,
        exerciseMinutes: 25,
        exerciseType: "散步",
        dietNote: "四君子粥早餐，午餐正常，下午喝了红枣枸杞茶",
        symptoms: ["微微出汗"],
        note: "精神比昨天好，散步后微微出汗，没有明显不适。",
      },
      {
        userId: patient1User.id,
        date: new Date("2026-02-22"),
        sleepHours: 6.5,
        sleepQuality: 3,
        moodScore: 3,
        exerciseMinutes: 15,
        exerciseType: "八段锦",
        dietNote: "山药薏米粥，中午吃了香菇炖鸡",
        symptoms: ["疲倦", "气短"],
        note: "昨晚睡得不太好，今天气短明显，运动量减少了。",
      },
    ],
  });

  // 患者2（刘芳）的日记
  await prisma.diaryEntry.createMany({
    data: [
      {
        userId: patient2User.id,
        date: new Date("2026-02-19"),
        sleepHours: 6,
        sleepQuality: 3,
        moodScore: 3,
        exerciseMinutes: 40,
        exerciseType: "瑜伽",
        dietNote: "银耳百合羹，枸杞菊花茶，午餐清蒸鱼",
        symptoms: ["口干", "手心热"],
        note: "练瑜伽后感觉心情放松了很多，但入睡还是比较困难。",
      },
      {
        userId: patient2User.id,
        date: new Date("2026-02-20"),
        sleepHours: 6.5,
        sleepQuality: 3,
        moodScore: 4,
        exerciseMinutes: 30,
        exerciseType: "散步",
        dietNote: "沙参玉竹鸭汤，水果以梨为主",
        symptoms: ["口干减轻"],
        note: "坚持喝滋阴汤水，口干症状有所改善。",
      },
      {
        userId: patient2User.id,
        date: new Date("2026-02-21"),
        sleepHours: 7,
        sleepQuality: 4,
        moodScore: 4,
        exerciseMinutes: 35,
        exerciseType: "瑜伽",
        dietNote: "百合莲子粥，蜂蜜水，清炒时蔬",
        symptoms: [],
        note: "今天状态不错，睡眠改善了，没有明显不适症状。",
      },
    ],
  });

  // 患者3（陈建国）的日记
  await prisma.diaryEntry.createMany({
    data: [
      {
        userId: patient3User.id,
        date: new Date("2026-02-18"),
        sleepHours: 8,
        sleepQuality: 3,
        moodScore: 3,
        exerciseMinutes: 30,
        exerciseType: "快走",
        dietNote: "薏仁赤小豆汤，午餐减少主食量，晚餐冬瓜汤",
        symptoms: ["身体沉重", "痰多", "腹部胀满"],
        note: "开始控制饮食了，但还是觉得身体沉重，痰比较多。",
      },
      {
        userId: patient3User.id,
        date: new Date("2026-02-20"),
        sleepHours: 7.5,
        sleepQuality: 3,
        moodScore: 3,
        exerciseMinutes: 35,
        exerciseType: "快走",
        dietNote: "荷叶冬瓜汤，白萝卜排骨汤（少油），水果以苹果为主",
        symptoms: ["身重", "口黏"],
        note: "血压今天量了一下 145/90，需要继续注意。快走比昨天多走了5分钟。",
      },
      {
        userId: patient3User.id,
        date: new Date("2026-02-22"),
        sleepHours: 7,
        sleepQuality: 4,
        moodScore: 4,
        exerciseMinutes: 40,
        exerciseType: "慢跑",
        dietNote: "山楂陈皮饮，芹菜炒百合，全麦馒头",
        symptoms: ["痰多减轻"],
        note: "体重降了1斤，继续坚持。今天第一次尝试慢跑，跑了20分钟走了20分钟。",
      },
      {
        userId: patient3User.id,
        date: new Date("2026-02-24"),
        sleepHours: 7,
        sleepQuality: 4,
        moodScore: 4,
        exerciseMinutes: 45,
        exerciseType: "慢跑+快走",
        dietNote: "薏仁粥，清炒芹菜，蒸鱼",
        symptoms: [],
        note: "感觉身体轻松了一些，血压 138/88，稍有改善。",
      },
    ],
  });

  // 患者4（赵雪梅）的日记
  await prisma.diaryEntry.createMany({
    data: [
      {
        userId: patient4User.id,
        date: new Date("2026-02-17"),
        sleepHours: 6.5,
        sleepQuality: 3,
        moodScore: 3,
        exerciseMinutes: 30,
        exerciseType: "太极拳",
        dietNote: "玫瑰花茶，黑木耳红枣汤，当归炖鸡",
        symptoms: ["面色晦暗", "腹部隐痛"],
        note: "经期刚过，腹部还有些隐痛。打了一套太极拳，身体微微发热。",
      },
      {
        userId: patient4User.id,
        date: new Date("2026-02-19"),
        sleepHours: 7,
        sleepQuality: 4,
        moodScore: 4,
        exerciseMinutes: 35,
        exerciseType: "瑜伽",
        dietNote: "山楂红糖饮，午餐黑木耳炒山药",
        symptoms: ["肩颈僵硬"],
        note: "瑜伽对肩颈僵硬很有帮助，练完后舒服了很多。",
      },
      {
        userId: patient4User.id,
        date: new Date("2026-02-22"),
        sleepHours: 7.5,
        sleepQuality: 4,
        moodScore: 4,
        exerciseMinutes: 40,
        exerciseType: "八段锦+散步",
        dietNote: "玫瑰当归茶，红花泡脚",
        symptoms: [],
        note: "坚持活血化瘀的调理方案，感觉面色好了一些，精神也好了。",
      },
    ],
  });

  // 患者5（孙浩然）的日记
  await prisma.diaryEntry.createMany({
    data: [
      {
        userId: patient5User.id,
        date: new Date("2026-02-20"),
        sleepHours: 7.5,
        sleepQuality: 5,
        moodScore: 5,
        exerciseMinutes: 60,
        exerciseType: "跑步",
        dietNote: "五色养生粥，午餐正常，晚餐清蒸鲈鱼",
        symptoms: [],
        note: "状态很好，跑了5公里，配速5分半。",
      },
      {
        userId: patient5User.id,
        date: new Date("2026-02-22"),
        sleepHours: 8,
        sleepQuality: 5,
        moodScore: 5,
        exerciseMinutes: 50,
        exerciseType: "游泳",
        dietNote: "牛奶燕麦早餐，坚果，水果蔬菜沙拉",
        symptoms: [],
        note: "游了1500米，感觉非常棒，体力充沛。",
      },
      {
        userId: patient5User.id,
        date: new Date("2026-02-24"),
        sleepHours: 7,
        sleepQuality: 4,
        moodScore: 5,
        exerciseMinutes: 45,
        exerciseType: "羽毛球",
        dietNote: "杂粮饭，清炒时蔬，水煮虾",
        symptoms: [],
        note: "和朋友打了羽毛球，运动后精神很好。",
      },
    ],
  });

  // ============================================================
  // 8. 随访计划（医生1给患者1和患者3各创建1个）
  // ============================================================

  const followupPlan1 = await prisma.followupPlan.create({
    data: {
      doctorId: doctor1User.doctorProfile!.id,
      name: "气虚质综合调理随访",
      description:
        "针对张伟的气虚质体质，制定为期两个月的综合调理随访计划。重点关注疲劳改善情况、脾胃功能恢复、八段锦锻炼坚持情况以及整体精力提升。",
      targetConstitutions: [ConstitutionType.QI_DEFICIENCY],
      startDate: new Date("2026-02-10"),
      endDate: new Date("2026-04-10"),
      intervalDays: 14,
    },
  });

  const followupPlan2 = await prisma.followupPlan.create({
    data: {
      doctorId: doctor1User.doctorProfile!.id,
      name: "痰湿质代谢综合征管理随访",
      description:
        "针对陈建国的痰湿质体质合并高血压、高脂血症、脂肪肝，制定为期三个月的综合管理随访计划。重点关注体重、血压、血脂变化，饮食运动执行情况。",
      targetConstitutions: [ConstitutionType.PHLEGM_DAMPNESS],
      startDate: new Date("2026-02-18"),
      endDate: new Date("2026-05-18"),
      intervalDays: 7,
    },
  });

  // 创建随访登记（计划关联患者）
  const enrollment1 = await prisma.followupEnrollment.create({
    data: {
      planId: followupPlan1.id,
      patientId: patient1User.patientProfile!.id,
    },
  });

  const enrollment2 = await prisma.followupEnrollment.create({
    data: {
      planId: followupPlan2.id,
      patientId: patient3User.patientProfile!.id,
    },
  });

  // ============================================================
  // 9. 随访记录（每个计划2条）
  // ============================================================

  // 随访计划1的记录
  await prisma.followupRecord.createMany({
    data: [
      {
        enrollmentId: enrollment1.id,
        scheduledDate: new Date("2026-02-24"),
        completedDate: new Date("2026-02-24"),
        status: FollowupStatus.COMPLETED,
        feedback: {
          selfAssessment: "感觉比两周前精力有所改善",
          symptoms: ["疲倦减轻", "食欲改善", "偶有气短"],
          exerciseCompliance: "八段锦坚持每天练习，每次20分钟",
          dietCompliance: "基本按照方案执行，偶尔吃了冷饮",
          sleepQuality: "入睡比之前快了，但偶尔早醒",
        },
        aiSummary:
          "患者气虚症状有所改善，疲倦感减轻，食欲恢复。八段锦锻炼坚持良好，但运动量可适当增加。饮食方面需注意避免冷饮。睡眠改善中，建议继续调理。整体向好发展，继续当前方案。",
        riskFlag: false,
        riskNote: null,
      },
      {
        enrollmentId: enrollment1.id,
        scheduledDate: new Date("2026-03-10"),
        completedDate: null,
        status: FollowupStatus.PENDING,
        feedback: null,
        aiSummary: null,
        riskFlag: false,
        riskNote: null,
      },
    ],
  });

  // 随访计划2的记录
  await prisma.followupRecord.createMany({
    data: [
      {
        enrollmentId: enrollment2.id,
        scheduledDate: new Date("2026-02-25"),
        completedDate: new Date("2026-02-25"),
        status: FollowupStatus.COMPLETED,
        feedback: {
          selfAssessment: "身体沉重感有所减轻，但改善缓慢",
          weight: 91,
          bloodPressure: "142/88",
          symptoms: ["痰多减轻", "口黏减轻", "仍有腹胀"],
          exerciseCompliance: "快走和慢跑交替，每天30-40分钟",
          dietCompliance: "严格控制了油腻和甜食摄入，主食减量",
          bloodTestScheduled: true,
        },
        aiSummary:
          "患者体重较初始下降1kg，血压略有下降但仍偏高（142/88mmHg）。痰湿症状有所缓解，运动和饮食执行较好。建议继续保持，同时安排下次血脂复查。腹胀症状持续，可考虑加强健脾化湿方药。需密切关注血压变化。",
        riskFlag: true,
        riskNote: "血压控制仍未达标，需关注。建议患者居家每日监测血压并记录。",
      },
      {
        enrollmentId: enrollment2.id,
        scheduledDate: new Date("2026-03-04"),
        completedDate: null,
        status: FollowupStatus.PENDING,
        feedback: null,
        aiSummary: null,
        riskFlag: false,
        riskNote: null,
      },
    ],
  });

  // ============================================================
  // 10. 康养服务（4个）
  // ============================================================

  await prisma.wellnessService.createMany({
    data: [
      {
        name: "艾灸调理",
        category: ServiceCategory.MOXIBUSTION,
        description:
          "艾灸疗法是中医传统外治法之一，通过燃烧艾绒产生的热力与药力，刺激人体穴位，温通经络、调和气血、扶正祛邪。适合气虚、阳虚等虚寒体质人群日常保健调理。",
        benefits: ["温通经络", "补中益气", "温阳散寒", "调和脾胃", "提升免疫力"],
        precautions: ["空腹或过饱不宜施灸", "皮肤破损处禁灸", "孕妇腹部禁灸", "灸后2小时内勿洗冷水"],
        duration: "每次40-60分钟，建议疗程10次",
        price: "¥180/次，疗程价¥1600",
        suitableFor: [ConstitutionType.YANG_DEFICIENCY, ConstitutionType.QI_DEFICIENCY, ConstitutionType.PHLEGM_DAMPNESS],
        contraindicatedFor: [ConstitutionType.YIN_DEFICIENCY, ConstitutionType.DAMP_HEAT],
        isSeasonalOnly: false,
        coverImage: null,
        isActive: true,
        sortOrder: 1,
        hospitalId: hospital.id,
      },
      {
        name: "三伏天灸",
        category: ServiceCategory.SANFU_PATCH,
        description:
          "三伏贴是在一年中阳气最旺的三伏天（初伏、中伏、末伏），将特制中药膏贴敷于特定穴位，通过皮肤渗透发挥药力，扶阳固本、冬病夏治。对慢性支气管炎、哮喘、过敏性鼻炎、虚寒胃痛等冬季易发疾病有良好预防效果。",
        benefits: ["冬病夏治", "扶阳固本", "预防慢性呼吸道疾病", "改善虚寒体质", "增强免疫"],
        precautions: ["仅限三伏天期间", "皮肤过敏者慎用", "贴敷时间2-4小时", "起泡属正常反应勿强行撕除"],
        duration: "每次贴敷2-4小时，三伏各贴1次",
        price: "¥120/次，三次套餐¥320",
        suitableFor: [ConstitutionType.YANG_DEFICIENCY, ConstitutionType.PHLEGM_DAMPNESS, ConstitutionType.SPECIAL, ConstitutionType.QI_DEFICIENCY],
        contraindicatedFor: [ConstitutionType.YIN_DEFICIENCY, ConstitutionType.DAMP_HEAT],
        isSeasonalOnly: true,
        seasonalNote: "仅限每年三伏天期间（约7月中旬至8月中旬）开放",
        coverImage: null,
        isActive: true,
        sortOrder: 2,
        hospitalId: hospital.id,
      },
      {
        name: "经络推拿",
        category: ServiceCategory.TUINA,
        description:
          "中医推拿通过手法作用于体表特定部位，疏通经络、行气活血、理筋整复。针对气滞血瘀、颈肩腰腿痛等问题效果显著，可改善局部循环，缓解肌肉紧张疼痛。",
        benefits: ["疏通经络", "行气活血", "缓解疼痛", "改善循环", "放松肌肉"],
        precautions: ["骨折或严重骨质疏松禁用", "皮肤感染处禁推拿", "饭后1小时内不宜做", "血小板减少者慎用"],
        duration: "每次60分钟",
        price: "¥200/次，月卡（8次）¥1400",
        suitableFor: [ConstitutionType.BLOOD_STASIS, ConstitutionType.QI_STAGNATION, ConstitutionType.PHLEGM_DAMPNESS],
        contraindicatedFor: null,
        isSeasonalOnly: false,
        coverImage: null,
        isActive: true,
        sortOrder: 3,
        hospitalId: hospital.id,
      },
      {
        name: "体质针灸",
        category: ServiceCategory.ACUPUNCTURE,
        description:
          "根据患者体质辨识结果，选取相应经络穴位进行针刺调理，以【虚则补之、实则泻之】为原则，平衡阴阳气血，改善偏颇体质，预防疾病发生。适合阴虚内热、痰湿凝滞等体质问题的调理。",
        benefits: ["平衡阴阳", "调节气血", "疏通经络", "改善睡眠", "调节内分泌"],
        precautions: ["过度疲劳或饥饿时不宜针灸", "凝血功能异常者禁用", "孕妇特定穴位禁针", "针后局部勿受寒湿"],
        duration: "每次45分钟，建议疗程12次",
        price: "¥160/次，疗程价¥1700",
        suitableFor: [ConstitutionType.YIN_DEFICIENCY, ConstitutionType.PHLEGM_DAMPNESS, ConstitutionType.DAMP_HEAT, ConstitutionType.BLOOD_STASIS],
        contraindicatedFor: null,
        isSeasonalOnly: false,
        coverImage: null,
        isActive: true,
        sortOrder: 4,
        hospitalId: hospital.id,
      },
    ],
  });

  // ============================================================
  // 11. 义诊活动（2个）
  // ============================================================

  await prisma.wellnessActivity.create({
    data: {
      title: "春季治未病义诊",
      description:
        "值此春回大地之际，本院治未病科联合中医内科举办春季治未病义诊活动。专家团队将为市民免费提供体质辨识、健康状态评估及个性化养生指导，助您把握春季调养黄金时节，未病先防，已病防变。\n\n本次活动特别邀请主任医师李明远、副主任医师王素芳坐诊，提供面对面中医咨询服务。活动期间还将举行中医养生知识讲座，欢迎广大市民踊跃参与。",
      location: "北京中医药大学附属医院 门诊楼一楼大厅",
      department: "治未病科",
      startTime: new Date("2026-03-15T09:00:00.000Z"),
      endTime: new Date("2026-03-15T16:00:00.000Z"),
      capacity: 30,
      currentCount: 12,
      status: ActivityStatus.PUBLISHED,
      targetConstitutions: [
        ConstitutionType.QI_DEFICIENCY,
        ConstitutionType.YANG_DEFICIENCY,
        ConstitutionType.QI_STAGNATION,
      ],
      tags: ["义诊", "治未病", "春季养生", "免费"],
      publishedAt: new Date("2026-02-28T08:00:00.000Z"),
      hospitalId: hospital.id,
      publisherId: doctor1User.doctorProfile!.id,
    },
  });

  await prisma.wellnessActivity.create({
    data: {
      title: "中医体质与健康讲座",
      description:
        "本次讲座将由资深中医专家深入浅出地讲解中医九种体质理论，帮助大家认识自身体质特点，掌握日常养生调理的实用方法。内容涵盖：如何通过饮食、起居、运动等方式调节偏颇体质，以及不同季节的养生重点。\n\n活动完全免费，欢迎广大市民及患者家属参加。参与者将获赠中医养生手册一册。",
      location: "北京中医药大学附属医院 学术报告厅（二楼）",
      department: "中医内科",
      startTime: new Date("2026-03-22T14:00:00.000Z"),
      endTime: new Date("2026-03-22T16:30:00.000Z"),
      capacity: 50,
      currentCount: 8,
      status: ActivityStatus.PUBLISHED,
      targetConstitutions: null,
      tags: ["讲座", "中医养生", "体质调理", "免费"],
      publishedAt: new Date("2026-02-28T08:00:00.000Z"),
      hospitalId: hospital.id,
      publisherId: doctor2User.doctorProfile!.id,
    },
  });

  // ============================================================
  // 12. 健康内容（6篇）
  // ============================================================

  await prisma.healthContent.createMany({
    data: [
      // 节气文章 1：雨水
      {
        title: "雨水时节：祛湿健脾正当时",
        summary: "雨水节气湿气渐重，此时健脾祛湿是养生关键。中医推荐从饮食、起居双管齐下。",
        body: `雨水节气，天气回暖，雨量逐渐增多，湿气也随之加重。中医认为，"湿为阴邪，最易困脾"，此时若不注意祛湿，湿邪内困脾土，容易出现身体沉重、食欲不振、大便溏薄等症状。

**饮食调养**

雨水时节饮食宜清淡，多食健脾祛湿之品：
- 薏苡仁：健脾利水、渗湿除痹，可煮粥或煲汤
- 赤小豆：利水消肿，与薏仁同煮效果更佳
- 山药：健脾益气、补肺固肾，蒸食或熬粥均可
- 陈皮：理气健脾、燥湿化痰，泡茶饮用

**起居调护**

1. 保持室内通风干燥，避免潮湿环境
2. 不宜过早减衣，防止"倒春寒"
3. 适当增加户外活动，但避开阴雨天气
4. 早睡早起，保证充足睡眠

**推荐食疗方**

薏仁赤豆茯苓粥：薏苡仁30g、赤小豆30g、茯苓15g、大米适量，加水煮粥，加少许盐调味，早晚各一碗，连服一周，有良好的健脾祛湿效果。

痰湿体质和湿热体质的朋友，雨水节气尤需注意祛湿，可在医生指导下加用苍术、厚朴等芳香化湿中药。`,
        contentType: ContentType.SOLAR_TERM,
        solarTermKey: "YUSHUI",
        constitutions: [ConstitutionType.PHLEGM_DAMPNESS, ConstitutionType.DAMP_HEAT, ConstitutionType.QI_DEFICIENCY],
        isPublished: true,
        publishedAt: new Date("2026-02-19T08:00:00.000Z"),
        authorName: "李明远",
        source: "北京中医药大学附属医院治未病科",
        hospitalId: hospital.id,
        sortOrder: 1,
      },
      // 节气文章 2：惊蛰
      {
        title: "惊蛰养生：疏肝升阳迎春来",
        summary: "惊蛰雷动，阳气升腾，此时顺应天时疏肝理气，是春季养肝护肝的关键时节。",
        body: `惊蛰，是二十四节气中的第三个节气。《月令七十二候集解》记载："万物出乎震，震为雷，故曰惊蛰。"此时阳气上升，蛰虫惊醒，万物复苏。

**惊蛰与肝的关系**

中医认为春属木，与肝相应。春季是疏肝的最佳时机，若肝气郁结，不仅影响情绪，还会影响气血运行、消化吸收。惊蛰后阳气升腾更旺，需顺势疏泄肝气。

**养肝食物推荐**

- 韭菜：辛温，助阳升发，春季第一鲜
- 菠菜：味甘凉，补血润燥，养肝明目
- 枸杞：滋补肝肾，明目益精
- 菊花茶：清肝明目，散风清热

**情志调养**

肝主情志，惊蛰时节情绪容易波动，需注意：
1. 保持心情舒畅，学会释放压力
2. 避免大怒伤肝，遇事冷静处理
3. 多听舒缓音乐，有助于疏肝解郁
4. 适当户外活动，踏青赏春怡情

**运动建议**

晨起后可做八段锦或太极拳，缓慢舒展，帮助阳气生发、肝气条达。运动量不宜过大，微微出汗即可，勿大汗淋漓伤及正气。`,
        contentType: ContentType.SOLAR_TERM,
        solarTermKey: "JINGZHE",
        constitutions: [ConstitutionType.QI_STAGNATION, ConstitutionType.BLOOD_STASIS, ConstitutionType.QI_DEFICIENCY],
        isPublished: true,
        publishedAt: new Date("2026-03-06T08:00:00.000Z"),
        authorName: "王素芳",
        source: "北京中医药大学附属医院中医内科",
        hospitalId: hospital.id,
        sortOrder: 2,
      },
      // 体质调养 1：气虚质
      {
        title: "气虚质调养全指南",
        summary: "气虚质人群容易疲乏、气短、自汗，从饮食、运动、起居三方面入手，补气健脾是根本。",
        body: `气虚质是九种体质中最为常见的类型之一。主要表现为：平素语音低弱、气短懒言、容易疲乏、精神不振、易出汗，舌淡红、舌边有齿痕，脉弱。

**病因分析**

气虚多由先天禀赋不足、后天失养、久病、劳伤过度等因素导致。脾胃为"气血生化之源"，脾胃虚弱是气虚质形成的核心原因。

**饮食调养**

宜食：
- 黄芪：补气固表之要药，可煲汤或泡水代茶
- 党参：补中益气、健脾益肺
- 山药：健脾益气、补肺固肾
- 大枣：补气养血，每日3-5枚
- 小米粥：健脾胃，补虚损
- 糯米：补中益气

忌食：生冷、油腻、难消化食物，以及过于苦寒之品。

**推荐食疗方**

黄芪党参炖鸡：黄芪30g、党参20g、红枣5枚、老母鸡半只，加姜片炖2小时，喝汤食肉，每周1-2次，坚持2个月有明显补气效果。

**运动建议**

适合柔和舒缓的运动：八段锦、太极拳、散步、慢跑（短时间）。
- 每次运动时间不超过30分钟
- 运动后注意保暖，防止感冒
- 循序渐进，切勿剧烈运动大汗出

**穴位保健**

- 足三里：每日按揉5分钟，补中益气
- 气海：脐下1.5寸，艾灸或掌心温敷
- 关元：脐下3寸，补肾固本

**起居调养**

早睡早起，避免熬夜。午睡20-30分钟养精蓄锐。注意劳逸结合，不可过度疲劳。`,
        contentType: ContentType.CONSTITUTION_GUIDE,
        solarTermKey: null,
        constitutions: [ConstitutionType.QI_DEFICIENCY],
        isPublished: true,
        publishedAt: new Date("2026-02-15T08:00:00.000Z"),
        authorName: "李明远",
        source: "北京中医药大学附属医院治未病科",
        hospitalId: hospital.id,
        sortOrder: 3,
      },
      // 体质调养 2：阴虚质
      {
        title: "阴虚质调养：滋阴润燥有妙方",
        summary: "阴虚质手足心热、口燥咽干、大便干结，滋阴降火是调养核心，宜凉润忌辛燥。",
        body: `阴虚质的人群，阴液亏少，以干燥、热象、虚烦为主要特征。常见表现：手足心热、口燥咽干、鼻微干、喜冷饮、大便干燥、面色潮红，舌红少津、少苔，脉细数。

**常见困扰**

- 容易失眠多梦，入睡困难
- 情绪急躁，耐热性差
- 皮肤干燥，易生皱纹
- 眼睛干涩，视力疲劳
- 女性经量减少，月经推迟

**饮食调养**

宜食滋阴润燥之品：
- 银耳：滋阴润肺，被称为"平民燕窝"
- 百合：养阴润肺，清心安神
- 枸杞：滋补肝肾，明目润燥
- 沙参、玉竹：滋阴生津，润肺止咳
- 鸭肉、甲鱼：滋阴效果显著的动物性食材
- 蜂蜜：润燥补虚，每日早晚1匙

严格忌食：辣椒、花椒、羊肉、狗肉、韭菜、荔枝、龙眼等温热燥热之品；烧烤、炒货等煎炸食物。

**推荐食疗方**

银耳百合莲子羹：银耳1朵（提前泡发）、百合30g、莲子20g、冰糖适量，慢炖1.5小时至银耳黏稠，每日晚餐后食用，可有效改善口干、失眠症状。

**生活注意**

1. 避免熬夜，晚10点前入睡
2. 夏季避免长时间高温环境
3. 保持室内湿度，可用加湿器
4. 避免过度用眼，定期远眺
5. 情绪管理：学会冥想、深呼吸`,
        contentType: ContentType.CONSTITUTION_GUIDE,
        solarTermKey: null,
        constitutions: [ConstitutionType.YIN_DEFICIENCY],
        isPublished: true,
        publishedAt: new Date("2026-02-15T08:00:00.000Z"),
        authorName: "王素芳",
        source: "北京中医药大学附属医院中医内科",
        hospitalId: hospital.id,
        sortOrder: 4,
      },
      // 通用知识 1
      {
        title: "春季养生五要诀：顺时而为，健康常在",
        summary: "春季是一年养生的开端，把握春季养生五个关键点，为全年健康打好基础。",
        body: `《黄帝内经》云："春三月，此谓发陈，天地俱生，万物以荣。"春季阳气升发，万物复苏，正是养生保健的黄金季节。

**一、早起舒展，迎接阳气**

春季养生宜"夜卧早起，广步于庭，被发缓形"。早起后做5-10分钟舒展运动，帮助阳气升发，促进气血运行。推荐：
- 伸懒腰：刺激全身经络
- 转头活颈：预防颈椎问题
- 踮脚尖：刺激三阴交穴

**二、饮食清淡，辛甘疏肝**

春季饮食宜清淡，少食酸味（酸主收，不利阳气生发），多食辛甘之品助阳气疏发：
- 韭菜、葱白：辛温助阳
- 枸杞、桑葚：甘滋补益
- 大枣、蜂蜜：补脾益气

**三、情志调畅，避免郁怒**

春属肝木，肝主疏泄，喜条达而恶抑郁。春季情绪波动大，需注意：
- 遇事冷静，避免暴怒
- 多与朋友交流，倾诉郁积
- 户外踏青，怡情养性

**四、防寒防风，春捂有道**

"春捂秋冻"并非老生常谈。春季气温多变，早晚温差大，"春捂"要做到：
- 重点保护背部和腹部
- 气温低于15°C时不减衣
- 外出带备外套，防止受凉

**五、适度运动，循序渐进**

春季运动量宜逐步增加，不可骤然大量运动：
- 以有氧运动为主：快走、慢跑、太极
- 每次不超过1小时
- 出汗后及时更换衣物`,
        contentType: ContentType.KNOWLEDGE,
        solarTermKey: null,
        constitutions: [],
        isPublished: true,
        publishedAt: new Date("2026-02-20T08:00:00.000Z"),
        authorName: "编辑部",
        source: "北京中医药大学附属医院",
        hospitalId: hospital.id,
        sortOrder: 5,
      },
      // 通用知识 2
      {
        title: "中医泡脚指南：不同体质的最佳配方",
        summary: "泡脚是简单易行的中医保健方法，加入不同中药材，针对不同体质效果事半功倍。",
        body: `"春天洗脚，升阳固脱；夏天洗脚，湿邪乃除；秋天洗脚，肺肠润腑；冬天洗脚，丹田暖和。"泡脚是中医传统养生方法，坚持每晚泡脚20-30分钟，对改善睡眠、促进循环、调节体质有显著效果。

**泡脚基本要点**

- 水温：38-42°C，以感到舒适微热为宜
- 时间：每次15-30分钟，睡前1小时为佳
- 深度：水面没过踝关节以上
- 禁忌：饭后1小时内不宜泡脚；皮肤破损处禁泡

**不同体质配方**

🌿 气虚质——补气温阳方
配方：黄芪30g、党参20g、红枣5枚，煮水泡脚
功效：补气固表、温中健脾，改善疲乏气短

🔥 阳虚质——温阳散寒方
配方：艾叶30g、肉桂10g、干姜15g，煮水泡脚
功效：温阳散寒、温通经络，改善手脚冰凉

💧 阴虚质——滋阴降火方
配方：生地15g、知母10g、盐少许，煮水泡脚
功效：滋阴降火，改善足跟干裂、烦热

🌊 痰湿质——化湿通络方
配方：苍术15g、薏仁30g、花椒10g，煮水泡脚
功效：化湿通络、温经散寒，改善身重困倦

🌸 血瘀质——活血化瘀方
配方：红花10g、益母草20g、当归15g，煮水泡脚
功效：活血化瘀、温通血脉，改善手足紫暗

注意：上述配方仅供参考，具体用量请在医生指导下调整，过敏体质使用前需先做皮肤测试。`,
        contentType: ContentType.KNOWLEDGE,
        solarTermKey: null,
        constitutions: [],
        isPublished: true,
        publishedAt: new Date("2026-02-22T08:00:00.000Z"),
        authorName: "编辑部",
        source: "北京中医药大学附属医院",
        hospitalId: hospital.id,
        sortOrder: 6,
      },
    ],
  });

  console.log("Seed completed successfully!");
  console.log("Created:");
  console.log("  - 1 hospital");
  console.log("  - 1 admin user");
  console.log("  - 2 doctors with profiles");
  console.log("  - 5 patients with profiles");
  console.log("  - 5 constitution assessments");
  console.log("  - 5 health plans");
  console.log("  - 16 diary entries");
  console.log("  - 2 followup plans");
  console.log("  - 4 followup records");
  console.log("  - 4 wellness services");
  console.log("  - 2 wellness activities");
  console.log("  - 6 health contents");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
