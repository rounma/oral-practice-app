// 外宾接待英文话术数据
// 来源：奶牛智慧健康管理系统｜外宾接待英文话术

export interface Sentence {
  id: string;
  en: string;
  zh: string;
  /** 连贯背诵段标记 */
  isParagraph?: boolean;
  /** 问答对：question 是外宾提问，answer 是应答 */
  isQA?: boolean;
  /** 小提示/专有名词标记 */
  isKeyTerm?: boolean;
}

export interface Section {
  id: string;
  title: string;
  subtitle: string;
  sentences: Sentence[];
}

export const SECTIONS: Section[] = [
  {
    id: 'company',
    title: '企业整体介绍',
    subtitle: '开场介绍公司，句子简短适合口头讲',
    sentences: [
      { id: 'c1', en: 'Welcome to Beijing Jiumuxing Technology Co., Ltd.', zh: '欢迎来到北京九牧星科技有限公司。' },
      { id: 'c2', en: 'We focus on smart dairy cow health management solutions.', zh: '我们专注于奶牛智慧健康管理整体解决方案。' },
      { id: 'c3', en: 'We are a technology-driven enterprise with independent R-D capabilities.', zh: '我们是技术驱动型企业，拥有自主研发能力。' },
      { id: 'c4', en: 'We develop AI-based systems for modern dairy farms.', zh: '我们面向现代化牧场研发人工智能管理系统。' },
      { id: 'c5', en: 'Our goal is to help farms improve animal welfare, reduce losses and raise milk production efficiency.', zh: '我们的目标是帮助牧场提升动物福利、降低养殖损耗、提高产奶效益。' },
      { id: 'c6', en: 'We have a number of independent intellectual property rights and patents.', zh: '我们拥有多项自主知识产权与专利。' },
      {
        id: 'c7',
        en: 'We are Beijing Jiumuxing Technology. We focus on smart dairy cow health management. Using AI and multi-sensor perception technology, we provide digital solutions for dairy farms. Our system helps farmers monitor cow status in real time, improve animal welfare and increase economic benefits. We own many patents and welcome global cooperation.',
        zh: '我们是北京九牧星科技，专注奶牛智慧健康管理。运用AI与多感知传感技术，为牧场提供数字化解决方案。系统帮助养殖户实时监控奶牛状态，提升动物福利，提高经济效益。我们拥有多项专利，欢迎全球合作。',
        isParagraph: true,
      },
    ],
  },
  {
    id: 'system',
    title: '系统产品讲解',
    subtitle: '讲解奶牛智慧健康管理系统核心内容',
    sentences: [
      { id: 's1', en: 'This is our smart dairy cow health management system.', zh: '这就是我们的奶牛智慧健康管理系统。' },
      { id: 's2', en: 'We collect cow data including body appearance, behavior posture and body-size features.', zh: '我们采集奶牛体型外貌、行为姿态、体尺体征相关数据。' },
      { id: 's3', en: 'Our equipment uses cameras and sensors, no need for wearable collars.', zh: '设备采用摄像头与传感器，不需要奶牛佩戴项圈。' },
      { id: 's4', en: 'The system monitors estrus, lameness, disease risks and feeding status automatically.', zh: '系统自动监测奶牛发情、肢蹄问题、疾病风险以及采食状态。' },
      { id: 's5', en: 'It gives early warning alerts on abnormal cow conditions.', zh: '对奶牛异常情况进行提前预警。' },
      { id: 's6', en: 'All data is displayed on the cloud platform, you can check it on computer or tablet.', zh: '全部数据展示在云平台，可以电脑、平板查看。' },
      { id: 's7', en: 'It helps farm staff reduce manual observation work.', zh: '帮助牧场减少大量人工巡检工作。' },
      { id: 's8', en: 'The system supports edge-cloud collaborative architecture.', zh: '系统采用端边云协同架构。' },
      { id: 's9', en: 'It can adapt to different scale dairy farms.', zh: '可适配不同规模的奶牛牧场。' },
      { id: 's10', en: 'We can do customized development according to farm actual needs.', zh: '我们可以根据牧场实际需求做定制化开发。' },
    ],
  },
  {
    id: 'demo',
    title: '现场演示对话',
    subtitle: '演示系统时的常用对话与提问应答',
    sentences: [
      { id: 'd1', en: 'Please look at this screen. I will show you how the system works.', zh: '请看屏幕，我给您演示系统如何运行。' },
      { id: 'd2', en: 'Here you can see real-time monitoring data of the cows.', zh: '这里可以看到奶牛实时监测数据。' },
      { id: 'd3', en: 'This is the warning message for abnormal individuals.', zh: '这是个体异常的预警信息。' },
      { id: 'd4', en: 'The system records historical data for analysis.', zh: '系统保存历史数据用于复盘分析。' },
      { id: 'd5', en: 'Would you like to know more about a certain function?', zh: '您想了解哪一项功能？' },
      { id: 'd6', en: 'Q: What data can you get?  A: Behavior, body condition, estrus and health risk information.', zh: '问：可以获取哪些数据？答：行为、体况、发情以及健康风险信息。', isQA: true },
      { id: 'd7', en: 'Q: Does the cow need to wear any device?  A: No wearable devices. We use video and sensor collection.', zh: '问：奶牛需要佩戴设备吗？答：不需要穿戴设备，我们通过视频与传感器采集。', isQA: true },
    ],
  },
  {
    id: 'business',
    title: '商务合作沟通',
    subtitle: '商务交流与合作洽谈话术',
    sentences: [
      { id: 'b1', en: 'We are interested in international market cooperation.', zh: '我们很希望开展国际市场合作。' },
      { id: 'b2', en: 'We can provide system deployment, technical training and after-sales support.', zh: '我们可以提供系统部署、技术培训和售后支持。' },
      { id: 'b3', en: 'We can adjust functions according to your local farming situation.', zh: '我们可以根据你们当地养殖情况调整系统功能。' },
      { id: 'b4', en: 'Could you tell me the main pain points of your local dairy farms?', zh: '可否介绍下你们当地牧场主要面临哪些痛点？' },
      { id: 'b5', en: 'We can arrange project case materials for your reference.', zh: '我们可以整理项目案例资料供您参考。' },
      { id: 'b6', en: "After today's visit, I will send you brochures and introduction documents by email.", zh: '参观结束后，我会邮件发送产品手册和介绍资料给您。' },
      { id: 'b7', en: 'We hope to explore long-term win-win cooperation together.', zh: '期待一起探索长期共赢合作。' },
    ],
  },
  {
    id: 'chat',
    title: '闲聊&应急短句',
    subtitle: '接待闲聊与听不懂时的应急句',
    sentences: [
      { id: 't1', en: 'Is dairy farming popular in your country?', zh: '奶牛养殖在贵国发展怎么样？' },
      { id: 't2', en: 'What scale of dairy farms are you mainly working with?', zh: '您主要对接什么规模的牧场？' },
      { id: 't3', en: 'Have you seen similar smart farm systems before?', zh: '您之前见过类似的智慧牧场系统吗？' },
      { id: 't4', en: 'If you have any questions, please feel free to stop me.', zh: '有任何问题，您可以随时打断提问。' },
      { id: 't5', en: 'Sorry, could you speak a little slower?', zh: '不好意思，可以说慢一点吗？' },
      { id: 't6', en: 'Let me note this point down, and we will follow-up later.', zh: '这点我记下，后续我们跟进。' },
      { id: 't7', en: 'I will confirm with our technical team and reply to you.', zh: '我和技术团队确认后回复您。' },
      { id: 't8', en: 'Let me get our technical colleague to explain this part.', zh: '我请技术同事来讲解这部分。' },
    ],
  },
  {
    id: 'keyterms',
    title: '高频专有名词',
    subtitle: '接待实操必记的英文术语',
    sentences: [
      { id: 'k1', en: 'smart dairy cow health management system', zh: '奶牛智慧健康管理系统', isKeyTerm: true },
      { id: 'k2', en: 'edge-cloud collaborative architecture', zh: '端边云协同架构', isKeyTerm: true },
      { id: 'k3', en: 'animal welfare', zh: '动物福利', isKeyTerm: true },
      { id: 'k4', en: 'early warning', zh: '预警', isKeyTerm: true },
      { id: 'k5', en: 'wearable device', zh: '穿戴设备', isKeyTerm: true },
      { id: 'k6', en: 'dairy farm', zh: '奶牛牧场', isKeyTerm: true },
    ],
  },
];
