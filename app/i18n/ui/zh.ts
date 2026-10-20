import type { UiDictionary } from "../types";

export const ui: UiDictionary = {
  meta: {
    title: "Anatomy Atelier — 像艺术家一样学解剖",
    description:
      "在互动解剖工作室中探索医学级细节的 3D 器官——心脏、大脑、肺、肝、肾、眼、肠、胰腺与皮肤。",
    ogTitle: "Anatomy Atelier — 像艺术家一样学解剖",
    ogDescription: "通过沉浸式、医学级细节的 3D 标本学习解剖学。",
    imageAlt: "一颗悬浮于基座之上的解剖学心脏标本，旁边是 Anatomy Atelier 字标",
  },
  brand: { tagline: "像艺术家一样学解剖", home: "Anatomy Atelier 首页" },
  nav: { explore: "探索", systems: "系统", lessons: "课程", library: "资料库", notes: "笔记" },
  search: { placeholder: "搜索器官或主题…", empty: "没有匹配的器官。" },
  profile: { open: "打开学习者档案" },
  language: { label: "语言", choose: "选择语言" },
  library: {
    title: "器官库", open: "打开器官库", close: "关闭器官库",
    saved: "已收藏的器官", viewAll: "查看全部器官",
    quoteLine1: "学习", quoteLine2: "是一种好奇心。", quoteSign: "继续探索吧！",
  },
  browse: {
    systemsLead: "看标本在人体中的位置。",
    libraryLead: "工作室中目前收录的全部器官。",
  },
  bodyMap: {
    lead: "点击有标注的器官即可打开 3D 标本。胃、胆囊、膀胱仅作位置参照。",
    landmark: "仅位置标注",
    noSpecimen: "暂无 3D 标本",
    viewSpecimen: "查看 3D 标本",
    labels: {
      brain: "大脑", eyeball: "眼", heart: "心脏",
      rightLung: "右肺", leftLung: "左肺", liver: "肝",
      gallbladder: "胆囊", stomach: "胃", pancreas: "胰腺",
      rightKidney: "右肾", leftKidney: "左肾",
      ascendingColon: "升结肠", transverseColon: "横结肠", descendingColon: "降结肠",
      smallIntestine: "小肠", bladder: "膀胱", skin: "皮肤",
    },
    blurbs: {
      gallbladder: "储存肝脏分泌的胆汁，并在消化时释放到肠道。",
      stomach: "一个肌性囊袋，开始对食物进行化学与机械消化。",
      bladder: "有弹性的储尿囊，在排空之前暂时容纳尿液。",
    },
  },
  tools: {
    label: "3D 查看器工具", rotate: "旋转", zoom: "缩放", isolate: "单独显示",
    section: "剖面", layers: "分层", compare: "对比", reset: "重置",
  },
  viewer: {
    title: "{organ}互动查看器",
    canvas: "可交互的 3D 解剖模型。拖动旋转，滚动缩放，点击圆点可阅读该结构的说明。",
    tip: "提示", tipDrag: "拖动以旋转", tipScroll: "滚动以缩放",
    tipClick: "点击圆点了解更多",
    loading: "正在准备{organ}", autoRotate: "自动旋转",
    caption: "3D 标本 · 点击圆点探索", structures: "本标本中的结构",
  },
  info: {
    kicker: "{organ}", keyFacts: "关键数据", size: "大小", weight: "重量", daily: "每日",
    location: "位置", bloodSupply: "血液供应", function: "功能",
    medical: "医学意义", didYouKnow: "你知道吗", viewLesson: "查看课程",
    animate: "动画", quiz: "测验", compare: "对比",
  },
  compare: {
    title: "器官对比", comparing: "正在对比", reference: "参照",
    primaryRole: "主要作用", scale: "尺度", vs: "对比", close: "关闭对比",
    pick: "更换", choose: "选择对照器官",
  },
  cards: {
    resources: "{organ}学习资源",
    microscopic: "显微视图", compareOrgans: "器官对比", functionAnimation: "功能动画",
    clinicalNotes: "临床要点", whereItWorks: "工作部位", commonConditions: "常见疾病",
    exploreTissue: "探索组织", openComparison: "打开对比", playAnimation: "播放动画",
    seeAll: "查看全部", seeSystem: "查看该系统",
    systemOrgans: "本系统器官", seeOrgan: "查看该器官", organAria: "查看{organ}标本",
    playAria: "播放{organ}的功能动画", systemAria: "查看{organ}在人体中的位置",
  },
  quiz: {
    start: "开始标注测验", find: "找出", progress: "第 {current} / {total} 题",
    correct: "正确", wrong: "还差一点", reveal: "那是{label}", answer: "{label}以绿色标出",
    done: "测验结束", score: "答对 {score} / {total}", retry: "再试一次",
    exit: "退出测验", hint: "在模型上点击对应的圆点",
  },
  lesson: { next: "下一步", prev: "上一步" },
  animation: { playing: "正在观察{organ}如何工作", stop: "停止动画" },
  modal: {
    guided: "引导式探索", close: "关闭", continueExploring: "继续探索",
    quizTitle: "{organ}快速测验", motionTitle: "运动中的{organ}",
    bodyTitle: "人体中的{organ}", insideTitle: "{organ}内部",
    quizPrompt: "以下哪种说法最能描述{organ}？",
    quizA: "它在维持身体运转中承担特定的专门作用",
    quizB: "它完全独立运作",
    quizC: "它只在睡眠时活动",
    lessonBody:
      "跟随高亮的结构，旋转标本，把形态与功能联系起来。这一段短暂的学习旨在建立稳固的心智模型。",
    systemIntro: "{location}。追踪{organ}如何与身体其余部分相连。",
    system: "系统", primaryRole: "主要作用", bloodSupply: "血液供应",
  },
};
