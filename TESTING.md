# 测试记录与人工验收

## 本次增量更新：2026-10-14

修改前：Git根目录 `/Users/steven/Projects/halloween-scratch-adventure`；分支 `main`；HEAD `c398d485bcf3906395b9d1415b570b0d0368c270`；工作区干净。origin 为 `https://github.com/steveniotech/halloween-scratch-adventure.git`。本次未提交、推送、发布或配置Pages。

`tests/baseline/curriculum.js` 与 `quiz.js` 在编辑之前复制。SHA-256、HEAD、根目录及来源记录于 `tests/baseline/manifest.json`；原版 `state.js` 从该HEAD读取作为旧状态生成器。这不是修改后才生成的课程快照。

### 实际执行命令：全部 PASS

```sh
node --check curriculum.js
node --check quiz.js
node --check beginner-curriculum.js
node --check beginner-quiz.js
node --check courses.js
node --check state.js
node --check app.js
node --check teacher.js
node --check test-app.js
node --check test-beginner.js
node test-app.js
node test-beginner.js
```

- 原测试保留；只对总题数、首页卡片数和脚本加载顺序作增量调整。原Adventure专属断言仍检查8课、32题、六个里程碑、完整A/B/C路线。
- 保护数据：原两个源码与编辑前基线逐字一致；哈希一致；原课与题目对象深比较一致，包含ID、故事、积木、选项、答案、提示和教师说明。
- 新内容：8+8=16课，24+32=56题；Beginner各3题，Adventure各4题；唯一ID、有效关联、下一课衔接、全部段落、六里程碑、脚本覆盖、变量作用域、积木标签/类别、条件精灵引用。
- 原版模块生成代表性存档，包含首次错/对、重试、提示、全部八个徽章、自检、人工确认；新版本恢复逐字段一致，Adventure 8/8、Beginner 0/8。未知扩展字段/未知题记录/未知课记录/徽章ID保留；规范化幂等；不因加载新增徽章，Beginner记录按交互懒创建。
- 分轨统计排除未答题；自检与确认不授徽章；重复作答不重复授徽章；预览副本不写真实存储；导出JSON含两条路线元数据与原progress；reset仅删除原键。
- 原有损坏JSON、未知schema、被阻止存储安全行为仍通过。
- DOM替身执行实际处理函数：两条路线所有课段、三题/四题测验、答错/提示/重试/复习、教师筛选、B8预览隔离、刷新、确认/撤销、导出和两次重置取消。它们不是浏览器验证。
- 静态检查：所有实际运行时资源相对路径、无新外部依赖、无fetch/eval/全局存储清空；官方Scratch编辑器仍只通过点击打开。

### 真实浏览器：已运行，部分项目仍未运行

使用现有Google Chrome，通过原生UI工具操作；未安装浏览器、插件或依赖。

- PASS：直接file://打开首页，Beginner/Adventure两组、16课56题、分轨徽章。
- PASS：B1和B8学生预览；原Adventure 1与8页面；B8转场进入原Pumpkin Gate；原最终课路线选择入口保留。A/B/C全部脚本另有原内容回归及DOM处理函数检查，未逐条在浏览器重建游戏。
- PASS：B1选择后Check、错误反馈、提示、重试、正确反馈及Next入口。退出预览后真实题数与徽章仍为0。
- PASS：中文教师端、入门/冒险筛选、预览模式。
- PASS：独立 `127.0.0.1:8767` 测试源加载原版合成记录；子路径 `/halloween-scratch-adventure/index.html` 打开原activeLesson；首页Adventure 8/8、Beginner 0/8、原教师确认与自检恢复。
- PASS：两次重置确认分别取消，原8个徽章和32题记录仍可见。没有在真实浏览器执行最终删除。
- PASS：真实浏览器创建导出Blob并解析JSON，含两轨24/32题元数据；下载被QA页面主动抑制。**下载到磁盘：NOT RUN**，避免写入项目外的默认Downloads目录。
- PASS：Tab键焦点在主按钮上有明显描边；默认缩放页面可读。另实际检查原Pumpkin Gate页面175%与200%缩放，标题、返回按钮和分段导航仍可读，测试后恢复100%。
- PASS：`tests/browser-layout.html` 在真实Chrome的375px iframe内量测：首页、B1与B8 Build及展开完整总览的document宽度均为375，无页面级横向溢出。该测试执行真实布局引擎；不是物理移动设备验证。
- NOT RUN：物理移动设备、屏幕阅读器、操作系统减弱动态实际设置及完整可访问性认证。两轨全部页面的缩放矩阵未测试。

临时服务器实际命令：`python3 tests/serve.py`。首次沙箱绑定失败；获得批准后仅绑定127.0.0.1:8767并只服务本项目。fixture仅在测试源项目键不存在时写入合成记录，不会覆盖已有记录。该服务器不是网站运行依赖。

### Scratch资料核对与人工逻辑复核

已读取官方 [English block messages](https://raw.githubusercontent.com/scratchfoundation/scratch-blocks/develop/msg/js/en.js)、[Control实现](https://raw.githubusercontent.com/scratchfoundation/scratch-vm/develop/src/blocks/scratch3_control.js) 与 [Sensing实现](https://raw.githubusercontent.com/scratchfoundation/scratch-vm/develop/src/blocks/scratch3_sensing.js)。新增forever为标准Control块；wait until、stop all、key pressed与touching按标准用法教授。网站结构化卡片不是可执行Scratch代码。

人工复核：B1空格不验证位置，标记不是库存；B2等待后先说话再停全部；B3单蝙蝠有界路线、安全复位、短冷却、远离终点；B4唯一即时score复位、有限一次收集而非hide万能锁；B5先门触碰再钥匙分支；B6小步实体墙与双坐标回退；B7唯一有限发送，出口接收显示后才启动目标检测；B8先gettingReady、即时有限复位后短yield，收集等playing，先won再广播、四向和空格均门控，无stop all主结束。初始化不依赖绿旗帽的固定顺序。

**实际Scratch搭建/游戏运行：全部 NOT RUN。** 本次没有导入或生成.sb3，也没有声称Scratch执行正确。

### 新八课人工验收（全部待执行）

- [ ] B1 Pip Gets Ready：Pip唯一角色、四方向独立栈；旗回起点并清空说话；帽/包只是背景；门边及远处空格都说Ready；重玩。
- [ ] B2 Follow the Pumpkin Light：起点无重叠；等待期间方向键可用；触碰南瓜后说2秒再停全部；旗恢复。
- [ ] B3 The Dancing Bat：一蝙蝠固定x=-50、y±80往返；Pip起点(-190,0)；碰撞回安全点并冷却0.4秒；Finish与危险分离；成功停全部；重玩。
- [ ] B4 Three Candies for the Trip：score共享且唯一即时归零；先验一个糖果；三个各计一次；站在隐藏点不重复加；3分结束；全部复位。
- [ ] B5 Pip Finds a Key：hasKey=0/1表示信息；先设1再隐藏；远处空格无效；门边无钥匙提醒、有钥匙结束；旗复位。
- [ ] B6 The Garden Shortcut：20×24角色，两墙30×180和指定中心；5单位移动；oldX/oldY为Pip私有且使用Motion报告块；先一墙后两墙；上下绕行可达出口；重玩。
- [ ] B7 Meet Lumi：开始Lumi/Exit隐藏，提前去隐藏出口不赢；Bell触碰+空格只发一次CALL_LUMI；Lumi与Exit正确接收；显示后才检测；重复召唤无副作用；旗重玩。
- [ ] B8 Ready for the Adventure：gettingReady初始化，playing允许输入；Charm有限一次收集；门检查有物；先won再GATE_OPEN；Gate换open、Lumi完整结尾；胜后键和收集停玩；旗全部恢复。

### 仍需课堂编辑复核

教师需在标准Scratch搭建全部八个新工程，检查实际造型几何、路径可达性、按键节奏、并发输入与反复绿旗；朗读英文故事/题目及干扰项，确认低阅读量支持有效。带做与独立练习不能混称。完成Beginner不保证孩子能独立完成全部Adventure；Stage协调、复杂条件、药水顺序、克隆生命周期仍需单独教。原八课验收也仍应执行。

以下是2026-10-13历史测试记录；其中“浏览器未运行”等结论只描述当时，不覆盖本次新增结果。

---


## 本次实际运行结果（2026-10-13）

下列六个JavaScript语法检查和自动测试均通过：

```sh
node --check curriculum.js
node --check quiz.js
node --check state.js
node --check app.js
node --check teacher.js
node --check test-app.js
node test-app.js
```

- 8课顺序、唯一ID、32题、每课4题、四选一正确ID、英文题目/说明/提示及中文教师说明。
- 所有课程段落、每课6个构建里程碑、完整脚本引用、重置/获胜/重玩、至少3项具体排错。
- 最终课A/B/C三条完整路线及作用域、消息、终止积木位置；RESET接收栈均有限。
- 原始首次结果在重试/复习中保留；后续次数单独计数；未作答不进入准确率分母，覆盖另列。
- 徽章每课一次；Self-check和教师确认不能单独发测验徽章。
- JSON有schemaVersion及exportedAt；单键reset；缺失、阻止、损坏及未知结构存储处理。
- **DOM替身**执行实际页面处理函数：全部课段、答错/提示/重试/完成/复习、刷新恢复、预览隔离、人工确认/撤销、导出及两个重置取消路径。
- 本地相对资源、无意外外部运行时依赖、无eval/new Function、无localStorage.clear。
- 原创SVG通过Python标准XML解析；没有远程图像引用或脚本。

测试结果是内容与纯逻辑/页面处理函数的检查，不是Scratch引擎测试，也不是浏览器测试。

## 明确未运行

- **真实浏览器测试：NOT RUN。** 可用浏览器清单为空；未安装浏览器或工具。
- **实际Scratch游戏运行：NOT RUN。** 已人工审阅脚本逻辑并核对官方积木/菜单资料，未在Scratch搭建或运行项目。
- 未做截图、真实下载、移动设备、键盘、屏幕阅读器、缩放、减弱动态或可访问性认证。
- 未启动本地服务器或执行真实项目子路径加载。
- 未创建远程仓库、初始化Git、commit、push或GitHub Pages发布。

## 脚本人工逻辑复核

已检查绿旗协调、有限RESET握手、PLAY循环、角色/变量作用域及准确广播名；收集先锁定再计数；退出状态禁用正常游戏；蝙蝠停glide；墙体使用明确精灵矩形并回退旧坐标；图书馆先显示再设置pumpkinReady；药水busy在yield前获取，一个消息只判一个阶段；塔楼原体隐藏、生成检查延时后的状态、循环外单次计分、漏接删除、结束清理，delete cap下无积木。

可选Adventure Map整合方案也复核了单一绿旗入口、清理后切关、inactive门控、独立复位及不重复累计灯。先REMOVE_SPARKS（末端delete this clone）再GLOBAL_CLEANUP（剩余原体停其他脚本并hide），避免旧生成器延迟醒来后重复生成。

上述推理不替代实际Scratch验收。以下所有复选框仍未完成。

## 逐游戏Scratch验收清单

### 1. Pumpkin Gate

- [ ] 绿旗把Explorer复位到(-190,-110)，Gate为dim、背景为dark、状态为playing。
- [ ] 四向按键每次移动5单位，胜利后不响应。
- [ ] 触碰Gate只触发一次亮灯和Lumi消息。
- [ ] 胜利后再点绿旗能完整重玩。

### 2. Candy Trail

- [ ] 绿旗score为0，三个糖果显示且collected为0。
- [ ] 在同一个糖果位置停留只得1分。
- [ ] 三个唯一糖果使score恰好3并触发一次胜利。
- [ ] 胜利后停玩，绿旗恢复位置、可见性和各收集状态。

### 3. Bat Bridge

- [ ] Explorer起点(-190,0)不与蝙蝠路径重叠。
- [ ] 两蝙蝠在指定固定端点与y行内往返。
- [ ] 碰撞一次后回安全起点，等待0.4秒后可继续操作。
- [ ] Gate获胜一次、蝙蝠停止、按键停用，绿旗完整恢复。

### 4. Ghost Maze

- [ ] hasKey复位为0、Key显示、角色不在墙内。
- [ ] WallA/WallB为固定实体矩形，每个5单位移动后碰撞回退。
- [ ] 无钥匙触碰Exit不胜利；先取钥匙后到出口才胜利。
- [ ] 重玩恢复钥匙、角色和所有共享状态。

### 5. Haunted Library

- [ ] 三个书籍各计一次，Ghost消息不重复加分。
- [ ] books=3后有限REVEAL接收栈显示Pumpkin并设pumpkinReady=1。
- [ ] 只有触碰已经显示的Pumpkin才胜利。
- [ ] 绿旗恢复三本书、books=0、隐藏Pumpkin、pumpkinReady=0。

### 6. Potion Kitchen

- [ ] 配方严格Moon Leaf→Glow Berry→Star Sugar，progress依次0/1/2/3。
- [ ] busy在广播前获取，单次点击只处理一个阶段。
- [ ] 错误原料将progress设置为0并可重新开始。
- [ ] progress=3只胜利一次，停止点击推进；绿旗清空配方与busy。

### 7. Pumpkin Tower

- [ ] 原体Spark隐藏，只由原体每0.7秒最多生成一次。
- [ ] 每克隆随机x在-200至200，落下后至多计1分并删除。
- [ ] 漏接y<-170删除，成功后停止生成并清理剩余克隆。
- [ ] score不超过5；中途/胜利后绿旗均不遗留旧克隆或旧加分。

### 8. Halloween Festival

- [ ] 只选择A/B/C之一，并具备该路线全部Stage、精灵及结束脚本。
- [ ] A：三个灯笼各计1分；B：碰撞回安全起点，到舞台胜利；C：Drum→Ribbon→Lantern严格三步。
- [ ] 所选路线有开始、可玩目标、唯一胜利及停玩；Lumi感谢Pip，背景变lit。
- [ ] 绿旗恢复所选路线所有值、位置和可见性，可再次完整游玩。

路线 A — Collect festival lanterns

- [ ] 3个唯一灯笼各计1分；绿旗恢复全部状态。
- [ ] score=3结束并停用控制，Lumi感谢、背景lit。

路线 B — Avoid playful obstacles

- [ ] 2个有界障碍，碰撞回安全位置；到FestivalStage胜利。
- [ ] 结束立即停止glide和按键，绿旗可重玩，Lumi感谢、背景lit。

路线 C — Click the celebration order

- [ ] Drum→Ribbon→Lantern，busy锁防止重叠，错序设progress=0。
- [ ] progress=3结束并停用点击，绿旗复位灯与配方，Lumi感谢、背景lit。

## 课程编辑与初学路径复核

- [ ] 在教室版本Scratch逐项对照积木标签、参数和下拉选择；核对每个角色全部栈。
- [ ] 在造型编辑器居中原创建图，确认尺寸、100%大小与位置，尤其两面实体墙。
- [ ] 初学者先独立做第一课复位和按键，再带做目标循环/消息；不将广播掌握作为第一课自主要求。
- [ ] 验证每课从新项目开始就有完整玩法，不需要前课共享库存。
- [ ] 朗读英文题目和干扰项，确认8–11岁学生能理解且没有歧义。
- [ ] 调整班级节奏与分层帮助；45–70分钟只作规划估计。
- [ ] 最终课只选一条路线；可选My Blocks不是基础完成条件。

## 网站学生流程

- [ ] 直接打开index.html；首页8课立即可选，三个状态分别显示。
- [ ] Story、Mission、Before You Code、Plan、Build、Play and Test、Fix It、Quick Check、Make It Yours、Reflect和Ending全部可用。
- [ ] 勾选构建里程碑只增加Self-check；不产生测验徽章。
- [ ] 单选不揭答案；Check后错误有文字反馈、解释、提示及重试。
- [ ] 正确才可Next；四题最终正确获一个灯徽章，复做不再奖励。
- [ ] Review Missed只重放原始首次未答对题，原始首次记录不改变。
- [ ] 每条最终路线的所有脚本卡和验收内容可读；换路线不代表另一作品已构建。
- [ ] Open Scratch Editor只在点击后开官方新标签；没有自动嵌入或加载。
- [ ] 在Scratch实际检查File菜单保存/载入.sb3流程；网站JSON不冒充工程文件。

## 存储 / 预览 / 重置 / 导出

- [ ] 刷新后保留活动课、自报清单、选项、首次结果、后续次数、提示、徽章和教师确认。
- [ ] 直接#teacher进入中文视图；首次率显示分子与已尝试数，覆盖单独显示。
- [ ] 预览中勾选、答题和完成，不写入真实存储或奖励；退出恢复实际数据。
- [ ] 真实JSON下载可解析，schemaVersion=1，exportedAt有效；没有JSON导入入口。
- [ ] 第一重置确认取消不改数据；第二确认取消也不改数据。
- [ ] 仅在可丢弃的测试记录中确认两次重置，核对只删除halloween-scratch-adventure:v1。
- [ ] 损坏JSON与未知版本显示恢复提示；正常操作不覆盖原始记录；明确恢复前可取消。
- [ ] 存储被阻止/空间不足时会话继续，英文警告不称已保存，中文教师可导出内存数据。
- [ ] 存储删除失败时不要假定原始记录已清除；权限恢复后再检查。
- [ ] 人工确认需勾选已实际验收，再记录；撤销不影响测验结果。

## 键盘 / 手机 / 缩放 / 动态

- [ ] Tab/Shift+Tab及Enter/Space可操作菜单、选项、检查、复选框及原生下拉选择。
- [ ] 对话框取消/Escape、焦点限制及关闭后焦点恢复（包括第二次确认）。
- [ ] 屏幕阅读器能理解积木嵌套、else分支、选择状态与反馈；不只靠颜色。
- [ ] 375px、平板、桌面及200%/400%缩放无控件裁切；表格只在自身区域横向滚动。
- [ ] prefers-reduced-motion下无卡片移动；无闪烁、自动音效或跳吓。

## 未来GitHub Pages子路径

- [ ] 上传与发布另行授权后，检查仓库子路径/及/#teacher的真实页面。
- [ ] 所有CSS/JS/SVG从相对路径加载，不指向域名根目录。
- [ ] Network只出现本地课程资源，未点击时没有Scratch、字体、分析或API请求。
- [ ] 本地与发布域名存储可能不同，不承诺自动迁移。

## 已知限制

无Scratch自动评分、无班级云同步、无教师认证、无JSON导入、无自动跨项目背包、无自动Scratch工程保存。自报及人工确认都在本浏览器；共享设备可被其他使用者查看或修改。已验证的内容结构不证明实际课堂作品必然无错。
