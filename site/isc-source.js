// Chinese project copy is transcribed from PDF pages 4–21, in source order.
// English entries translate that copy without adding claims or conclusions.
const iscSource=[
 {page:4,id:'context',en:'Background',zh:'设计背景',layout:'split',blocks:[
  ['','前脸智慧交互屏(isc)是布置在钛系列车型前围的LED矩阵灯屏；是方程豹作为个性化品牌在ehmi上的第一次尝试，这是方程豹汽车与外界交互的窗口，也是用户个性化的表达之地。','The front-facing ISC is an LED matrix display on the Titanium Series. It is FANGCHENGBAO’s first eHMI exploration as a personalized brand: a window for communication with the outside world and a space for personal expression.'],
  ['设计目标：','需求由产品团队输入，HMI团队根据isc的布置情况、车型配置等设计不同场景下isc显示的内容以及车机os里的isc设置界面。','The product team supplied requirements. The HMI team designed ISC content for different scenarios and the ISC settings in the vehicle OS, considering the display placement and vehicle configuration.','Design objective'],
  ['个人职责：','作为方程豹体验设计师负责用户场景定义及isc设置模块的体验设计及部分动效制作。isc显示内容由团队视觉设计师负责。','As a FANGCHENGBAO experience designer, I defined user scenarios, designed the ISC settings experience and produced selected motion work. The team’s visual designers created the display content.','My responsibilities']
 ],visuals:['background-car']},
 {page:5,en:'Background',zh:'设计背景',blocks:[],visuals:['survey','constraints'],layout:'stack'},
 {page:6,id:'hardware',en:'Hardware Info',zh:'硬件信息',layout:'split',blocks:[
  ['isc类型：','该isc的布置位置为前围，PWM调光技术、色温恒定、灰度等级8 bit = 256级。','The ISC is mounted on the front fascia, with PWM dimming, constant color temperature and 8-bit grayscale (256 levels).','ISC type'],
  ['','从参数、尺寸、技术来看，这块屏幕满足图案，简单字体的非彩色显示。','Its specifications, dimensions and technology support monochrome patterns and simple lettering.']
 ],visuals:['hardware']},
 {page:7,id:'challenges',en:'Design Challenges',zh:'设计挑战',blocks:[
  ['ISC体验设计中的挑战','','','Challenges in the ISC experience'],
  ['','Q1 如何让车内的用户清晰地感知车外的isc状态？','Q1 How can people inside the car clearly perceive the ISC state outside?'],
  ['','Q2 多非标场景下，如何约束用户用法，支持用户便捷调用？','Q2 How can usage be guided and access made convenient across non-standard scenarios?'],
  ['','Q3 如何改善用户对玩法和使用频率的顾虑？','Q3 How can concerns about available content and frequency of use be addressed?']
 ],visuals:[],layout:'questions'},
 {page:8,id:'perception',en:'How to Tackle the Challenge',zh:'如何解决',blocks:[
  ['Q1:如何让车内的用户清晰地感知车外的isc状态？','','','Q1: How can people inside the car clearly perceive the ISC state outside?'],
  ['','虽然是智慧交互屏，但是其本质上是媒体，优先级低于驾驶相关功能。因此在不干扰驾驶信息的情况下我们制作了相关卡片，帮助用户快速识别isc的状态；同时在3d车桌面做isc的实时映射，即使用户处在驾驶状态也可以从一级界面快速获取信息。','Although it is an intelligent communication display, it is essentially media and has a lower priority than driving functions. We created status cards without interfering with driving information, and mapped the ISC state onto the 3D vehicle desktop so people could access it from the primary screen even while driving.']
 ],visuals:['status-needs','desktop'],layout:'stack'},
 {page:9,en:'How to Tackle the Challenge',zh:'如何解决',blocks:[
  ['','在智慧交互屏设置模块里，我们沿用了3D车模状态映射，从ISC相关域控订阅SOME信号，实现ISC状态在HMI中可视。同时我们根据不同的设置场景调整车身姿态，便于用户理解和可视。','In ISC settings, we reused the 3D vehicle state mapping and subscribed to SOME signals from the relevant domain controller to visualize the ISC state in HMI. The vehicle pose changes with the setting scenario to support understanding and visibility.'],
  ['','我们希望ISC是车的一部分，显示内容和车嵌套在一起，连同车前脸的设计语言一起，更容易判断ISC内容的设置是否符合用户自己的审美以及准确性。','The ISC should feel like part of the car. Showing content on the vehicle, together with the front-fascia design, helps people judge whether the setting matches their aesthetic expectations and is accurate.'],
  ['','视觉风格上，采用方程豹的“星际战车”的设计语言，凸显战斗感和外星球的感觉。同时弱化环境，将用户视觉焦点转移到车的前脸上。','The visuals use FANGCHENGBAO’s interstellar-vehicle design language to convey a combative, otherworldly feel. The environment is subdued to focus attention on the front fascia.']
 ],visuals:['pose-driving','pose-parked','pose-creative'],layout:'poses'},
 {page:10,en:'How to Tackle the Challenge',zh:'如何解决',blocks:[
  ['Q2:多非标场景下，如何约束用户用法，同时支持用户便捷调出相应效果？','','','Q2: How can usage be guided while making effects easy to access across non-standard scenarios?'],
  ['','我们需要先探索归纳出isc的应用场景以及用户的相应行为。','We first needed to explore and organize ISC use scenarios and the corresponding user behaviors.']
 ],visuals:['research'],layout:'stack',sequence:['罗列','分析','归纳']},
 {page:11,id:'structure',en:'Structure Plane',zh:'结构层梳理',blocks:[
  ['','我们从“启动机制”及“呈现持续性”来对其进行分类。','We classified scenarios by activation mechanism and presentation duration.'],
  ['','从展示优先级来说，事件触发型>提前预设型\\安全相关>仪式相关','For presentation priority: event-driven > preset; safety-related > ceremonial.'],
  ['','同时瞬时反馈型的场景里都是非标场景，用户完全可以根据自己的喜好来展示自己喜欢的内容。因此我们需要制定相关的预设选择。','Instant-feedback scenarios are non-standard, allowing people to display content according to their preferences. We therefore needed relevant preset options.'],
  ['','第二象限里所涉及的场景特别多，但是不可能每一个都让用户灵活预设，因此我们再对它再进一步拆解。','The second quadrant contains many scenarios, but not all can be freely configured. We therefore broke them down further.'],
  ['','车辆信息同步类———开关设置\n氛围营造类———自由选择','Vehicle-information synchronization — on/off controls\nAtmosphere creation — free selection']
 ],visuals:['matrix'],layout:'stack'},
 {page:12,en:'Structure Plane',zh:'结构层梳理',blocks:[
  ['','从用户理解的角度，我们最终明确行车态-驻车态为一级功能，同时可以把需备案的方案和相对自由的方案区分开来。做然后把车辆信息相关的显示内容放进设置选项。','From the user’s perspective, driving and parked states became the primary functions, separating registered options from more flexible options. Vehicle-information content was then placed in settings.']
 ],visuals:['architecture'],layout:'diagram-first'},
 {page:13,id:'interface',en:'Skeleton & Surface Plane',zh:'框架层&表现层',blocks:[
  ['','根据前面梳理的场景归纳，我们将驻车场景分为四个场景。','Based on the scenario analysis, parked use was divided into four scenarios.'],
  ['','采用“选择场景—挑选内容—预览应用”的配置流程，让用户为不同场景搭配专属表达，并通过车模预览直观确认效果。','The configuration flow is select scenario — choose content — preview and apply. People can assign expressions to each scenario and confirm their effect on the vehicle preview.']
 ],visuals:['parked-scenes','parked'],layout:'stack'},
 {page:14,en:'Skeleton & Surface Plane',zh:'框架层&表现层',blocks:[
  ['显示内容列表决策','','','Display-content list decision'],
  ['','左侧的优势是同屏数量多，适合快速查找熟悉的内容；右侧更适合浏览和挑选效果。我们希望通过提高单条内容的辨识度，减少用户反复点击、试播和返回比较的过程。','The left option shows more items and supports quick retrieval of familiar content. The right is better for browsing and selecting effects. More recognizable individual items can reduce repeated selection, playback and comparison.'],
  ['','同时右侧卡片可容纳更多信息，帮助用户识别及操作。我们在评估方案数量后决定采用右边的方案。','The right-hand cards also accommodate more information for recognition and interaction. After evaluating the number of options, we chose the right-hand solution.']
 ],visuals:['card-decision','card-result'],layout:'stack'},
 {page:15,en:'Skeleton & Surface Plane',zh:'框架层&表现层',blocks:[
  ['','因法规的备案要求以及驾驶安全考虑，将行车灯语作为一个单独设置的场景，优先级上低于车辆信息同步等功能。','Considering registration requirements and driving safety, driving signals have a separate setting and lower priority than vehicle-information synchronization.'],
  ['','左侧集中展示灯语内容，右侧通过车模呈现选中效果，同样支持“选择—预览—应用”的操作流程。','Signal content is collected on the left, with the selected effect shown on the vehicle on the right, using the same select — preview — apply flow.']
 ],visuals:['driving'],layout:'stack'},
 {page:16,en:'Skeleton & Surface Plane',zh:'框架层&表现层',blocks:[
  ['','车辆状态同步相关场景属于标准化场景，展示内容由车辆状态决定。因此我们将其纳入「智能灯语设置」，提升其展示优先级，并提供开关，供用户自主启用或关闭。','Vehicle-state synchronization is standardized and its content is determined by the vehicle state. It is therefore included in Smart Signal Settings with higher presentation priority and controls for enabling or disabling it.']
 ],visuals:['settings','settings-detail'],layout:'stack'},
 {page:17,id:'creation',en:'How to Tackle the Challenge',zh:'如何解决',blocks:[
  ['Q3、如何改善用户对玩法和使用频率的顾虑，增加选装率？','','','Q3: How can concerns about content and frequency of use be addressed to increase option uptake?'],
  ['','通过创作板块去拓展玩法和支持个性化表达，缓解用户对内容有限、容易玩腻的顾虑。','Expand the possibilities and support personal expression through creation, addressing concerns about limited content and losing interest.']
 ],visuals:['creation-entry'],layout:'stack'},
 {page:18,en:'Skeleton & Surface Plane',zh:'框架层&表现层',blocks:[
  ['','费时的创作以及展示机会少，会使得创作功能变成一个尝鲜功能。因此我们把其往轻量创作的方向去设计，当然也很好地避开了led屏精度不够的缺陷。','Time-consuming creation and few opportunities to show it can make creation a one-time novelty. We therefore designed toward lightweight creation, also working around the LED display’s limited resolution.'],
  ['','减少颜色的选择；\n可选择动效预设；\n可实时查看图画转化结果；\n部分表达模板化；','Reduce color choices;\nOffer motion presets;\nShow drawing conversion results live;\nProvide templates for selected expressions;']
 ],visuals:['canvas','templates'],layout:'stack',captions:[['创意画布','Creative canvas'],['模板画布','Template canvas']]},
 {page:19,blocks:[],visuals:['collage'],layout:'collage'},
 {page:20,id:'exploration',en:'Project Outcome',zh:'在预研项目中的思考',blocks:[
  ['概念探索','“AI大模型上车”的预研项目中，ehmi有了更多的场景应用可能。','The exploratory AI-in-vehicle project opened up more possible eHMI use scenarios.','Concept exploration'],
  ['功能定义','让用户即使只有模糊概念的时候也可以定义“何时、何地、满足什么条件，播放什么灯语，以及如何结束”，激活isc的更多玩法。','Even with a vague idea, people can define when, where, under which conditions, what signal to play and how it ends, enabling more ways to use ISC.','Function definition'],
  ['主界面','采用“计划列表＋详情预览”的双栏布局，将计划管理与规则确认整合在同一页面。\n左侧支持计划选择、快速启停与试运行；右侧呈现所选计划的灯语效果、触发条件和播放设置，帮助用户在修改前了解“何时触发、播放什么、如何结束”，降低多计划管理中的查找与确认成本。','A two-column plan list and detail preview combine plan management with rule confirmation.\nThe left supports selecting, toggling and test-running plans. The right shows the selected effect, conditions and playback settings, helping people understand when it triggers, what it plays and how it ends before making changes, reducing the effort of finding and confirming multiple plans.','Main interface']
 ],visuals:['ai-overview'],layout:'stack'},
 {page:21,en:'Project Outcome',zh:'在预研项目中的思考',blocks:[],visuals:[],layout:'ai-steps',steps:[
  ['计划创建入口：','支持自然语言生成计划或手动配置，并通过场景示例启发用户。','Plan creation entry','Generate a plan through natural language or configure it manually, with scenario examples to inspire people.','ai-start'],
  ['计划配置页面','集中设置触发条件、灯语内容与播放规则，支持效果预览、试运行及保存。','Plan configuration','Configure conditions, signal content and playback rules together, with effect previews, test runs and saving.','ai-plan'],
  ['条件编辑状态：','在当前页面展开时间设置，保留右侧执行结果，方便用户对照调整，减少页面跳转。','Condition editing','Expand time settings on the current page while retaining the execution result on the right, supporting adjustments by comparison with fewer page changes.','ai-edit']
 ],closing:['当用户可以用一句话表达需求，设计的重点将进一步延伸到：系统如何拆解意图、用户如何确认结果，以及车辆如何准确执行。','When people can express a need in one sentence, design extends to how the system interprets intent, how people confirm results and how the vehicle executes accurately.']}
];
