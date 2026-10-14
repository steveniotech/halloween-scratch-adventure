# Halloween Scratch Adventure

An original, unofficial standard Scratch curriculum with **16 independent projects and 56 concept questions**. Students use English; teachers use Simplified Chinese. This is not ScratchJr or a Scratch auto-grader.

**Beginner — Pip’s First Halloween** is an eight-project connected prequel for first-time Scratch users in Grades 1–3. Pip gets ready at home, follows pumpkin lights, and formally meets Lumi in B7. B8 leads to the original Pumpkin Gate. Grade level does not guarantee readiness; teachers support emerging readers and guide the new supporting logic.

1. B1 **Pip Gets Ready** — events, four controls, sequence and reset; Space is a player declaration.
2. B2 **Follow the Pumpkin Light** — automatic arrival with wait until.
3. B3 **The Dancing Bat** — repeated bounded motion and continuous collision checks.
4. B4 **Three Candies for the Trip** — shared numeric score, set/change and finite one-time collection.
5. B5 **Pip Finds a Key** — shared state information and if/else.
6. B6 **The Garden Shortcut** — save coordinates and undo wall collisions.
7. B7 **Meet Lumi** — one finite CALL_LUMI sender and separate receivers.
8. B8 **Ready for the Adventure** — playing/won guards and integration; gettingReady explains initialization.

**Adventure — Halloween Rescue Adventure** retains all eight original lessons, their six milestones, all 32 original questions and the final three complete routes. Neither protected data file has changed. All lessons are accessible immediately; each track has its own progress summary and eight quiz badges. Website progress, student self-check and teacher confirmation are separate.

## Adventure route

1. **Pumpkin Gate** — arrows, reset, and a one-time goal.
2. **Candy Trail** — collect three unique candies; variables and visibility.
3. **Bat Bridge** — bounded bat motion, collision, and safe recovery.
4. **Ghost Maze** — key-before-exit conditions and geometric wall rollback.
5. **Haunted Library** — three unique books, precise broadcasts, then a revealed pumpkin.
6. **Potion Kitchen** — Moon Leaf → Glow Berry → Star Sugar, serialized clicks and retry.
7. **Pumpkin Tower** — hidden original, bounded clone spawning, five catches, cleanup.
8. **Halloween Festival** — choose one complete route: lantern collection, obstacle crossing, or ordered celebration clicks.

Each lesson contains a complete script overview, **six build milestones**, reset, play, a goal, a success ending, and replay. Final Festival contains full instructions and acceptance criteria for **all three routes**, but students build only one. All eight lessons are available immediately. My Blocks and the end-of-month integration plan are optional.

## 本地打开与教师设置

本次为现有网站的本地增量更新，**本次尚未提交、推送或发布**。现有线上地址保持不变；这些修改不会自动上线。可直接在现代浏览器打开 `index.html`；页面使用相对路径和普通延迟脚本，不依赖fetch、模块加载或构建工具。file地址的存储策略因浏览器而异，推荐课堂使用本地静态服务器：

```sh
cd /Users/steven/Projects/halloween-scratch-adventure
python3 -m http.server 8000 --bind 127.0.0.1
```

学生端：http://127.0.0.1:8000/

教师端：http://127.0.0.1:8000/#teacher

直接打开文件时，可在 `index.html` 后加 `#teacher`，或点击页脚 Teacher View。停止服务器时按 Control+C。Python仅用于可选开发服务器，不是课程依赖，网站没有后端代码。

教师界面不是登录保护的门户，只反映当前浏览器/当前会话的数据，不是班级统计。建议每课45–70分钟或拆为两次课堂；此数值只是可调整的规划估计。教师可查看教案、分层建议、问题、作品验收清单及每题中文说明。

## Build in Scratch; save separately

**Open Scratch Editor** is an explicit link to https://scratch.mit.edu/projects/editor/ in a separate tab. Scratch is an external service and needs access to that service. The curriculum itself makes no runtime network requests. No editor is embedded or loaded automatically.

In the English Scratch editor, use **File → Save to your computer** to download an `.sb3` project. Use **File → Load from your computer** to reopen it. Keep the file as your teacher instructs. Online cloud saving requires a Scratch account and sign-in; this website requires neither and does not save Scratch projects. Downloading website JSON is not downloading an `.sb3` game.

Menu wording was checked against the official [Scratch editor menu source](https://github.com/scratchfoundation/scratch-gui/blob/develop/src/components/menu-bar/menu-bar.jsx) and [shared menu messages](https://github.com/scratchfoundation/scratch-gui/blob/develop/src/lib/shared-messages.js). UI wording can change; teachers should confirm the menu on their classroom version.

## Three separate statuses / 三种独立状态

- **Quick Check complete:** the website checks three Beginner or four Adventure concept answers. One pumpkin-light quiz badge per lesson, once only; the count is derived from actual lesson count.
- **Self-check:** build/test checkboxes are a student report. They do not prove correctness or award quiz badges.
- **Teacher-confirmed project:** a teacher manually tests the real Scratch game using acceptance criteria, then records that confirmation locally. It is not automatic project validation and can be revoked.

课堂验收请在真实Scratch运行游戏。不要将测验结果、自报勾选或教师确认混称为网站验证代码。十六课是十六个独立Scratch工程，用故事与技能串联；score、hasKey、背包及库存不会自动跨工程继承。网站徽章也不是Scratch工程变量。

中文教师附录「可选：月底整合 Adventure Map」给出额外整合方案：单一菜单控制器、currentLevel、每关START/END消息、有限重置、inactive门控、克隆删除、累计collectedLights及重玩语义。它要求重构和单独测试，不是广播就会自动合并项目。

## Instruction conventions and official checks

`curriculum.js` stores structured block-card data: selected sprite/Stage, block category, exact label template, input/dropdown values, nested branches, placement notes, and observable results. It is rendered as instructional cards, never evaluated as JavaScript or run as Scratch.

Names and control behavior were checked against official [English block messages](https://github.com/scratchfoundation/scratch-blocks/blob/develop/msg/js/en.js), [control implementation](https://github.com/scratchfoundation/scratch-vm/blob/develop/src/blocks/scratch3_control.js), [sensing implementation](https://github.com/scratchfoundation/scratch-vm/blob/develop/src/blocks/scratch3_sensing.js), and [green-flag/runtime behavior](https://github.com/scratchfoundation/scratch-vm/blob/develop/src/engine/runtime.js). Optional My Blocks guidance follows the official [My Blocks learning resource](https://resources.scratch.mit.edu/www/guides/en/ScratchLearningResource_MyBlocks.pdf).

The flag icon is described in text as `when green flag clicked`. No experimental while/for blocks are required. Every core loop uses standard repeat until. `delete this clone` is a terminal cap; no following block is attached. Data includes Conditions input guides for Sensing/Operators/variable reporters.

需要教师特别检查：

- Gate初学路径以Explorer复位、四向按键为核心，底部目标循环及结束消息可带做。
- 后续课Stage是唯一绿旗协调者。先设resetting和共享变量，再broadcast RESET and wait；RESET接收栈必须有限。PLAY使用普通broadcast，长循环不能放在RESET。
- 每个收集精灵有自己的collected变量，设1后才隐藏/计数。不能只依靠hide。
- Maze不用颜色侦测；使用固定、居中的WallA/WallB实体矩形，100%大小，5单位移动后回到oldX/oldY。背景装饰不是墙。
- Library显示Pumpkin后设置pumpkinReady；收集检测等待这个状态，不提前因三书直接获胜。
- Kitchen每次点击先拿busy锁，一个消息只判定一个期望progress，if/else错误分支归零。
- Tower原体隐藏；克隆落下循环后只可计一次并立即删除；miss和WIN都清理。绿旗的运行时清理旧脚本与克隆，之后再做显式状态复位。

这些是脚本人工逻辑复核结果，**不是已执行Scratch游戏的成功记录**。具体造型中心、尺寸、可玩路径和设备节奏仍须课堂实际验收。

## Storage, privacy, and recovery

Only key **`halloween-scratch-adventure:v1`** is used. Persisted fields: schema version, active lesson, validated build self-checks, quiz selections/attempts/first results/eventual correctness/hints/current quiz round, quiz badges, teacher confirmations, and timestamps. No names, Scratch usernames, emails, public project URLs, device identifiers, accounts, analytics, APIs, or uploads.

Your work stays in this browser on this device. Different browsers, devices, domains, file URLs, and local ports may have separate storage. Shared devices keep progress until reset. No JSON import in version 1.

Missing storage starts fresh. Malformed JSON or unsupported schema data blocks automatic saving and **does not overwrite the original record**. Work can continue in memory with an English warning. Export the current session where downloads are supported, then choose explicit recovery/reset with two separate confirmations if desired. This recovery removes the old key; it does not repair or import damaged data. Cancelling either confirmation keeps stored data. When storage is blocked, export preserves memory progress; failed reset cannot guarantee browser data was removed.

Teacher preview clones actual progress into memory: no saving, real badges, or changes to student records. Exiting restores the real state. Refresh exits preview. First-attempt results stay immutable through retries and missed-question review. Accuracy divides by attempted questions; attempted count and coverage are shown separately. Hints count distinct questions with a used hint. Later attempts have a separate counter.

Export downloads valid JSON with `schemaVersion`, `exportedAt`, `courses` (both tracks, stable lesson/question IDs and summaries), and `progress`. The existing progress schema remains version 1. Normalization now preserves earned badge IDs and unknown extension fields instead of deriving new badges during loading; no migration awards a Beginner badge. New Beginner records are created only on interaction. Original active lesson IDs still resolve. This is the only intentional compatibility adjustment to normalization; the storage key remains unchanged. Reset uses `removeItem` for this single key, never `localStorage.clear()`.

## Files and tests

- `index.html`: semantic shell and accessible dialog.
- `styles.css`: original responsive Halloween palette, focus states, nesting and reduced-motion rules.
- `curriculum.js`: all stories, projects, routes, scripts and Chinese teaching notes.
- `quiz.js`: 32 original questions and pure grading helpers.
- `beginner-curriculum.js`: eight prequel lessons, staged cards and Chinese support.
- `beginner-quiz.js`: 24 Beginner questions.
- `courses.js`: additive track registry; original exports remain compatible.
- `tests/baseline/`: immutable pre-change curriculum/question copies, original state module and SHA-256/HEAD manifest.
- `test-beginner.js`: preservation, content and original-state compatibility tests.
- `tests/`: optional local browser QA server, original-version state fixture and browser layout page.
- `state.js`: schema, storage recovery, quiz progression, statistics and badge logic.
- `app.js`: English student navigation, block cards, self-checks and quiz handlers.
- `teacher.js`: Chinese teacher view, preview, manual confirmation, export and reset.
- `test-app.js`: no-package content/state/handler tests.
- `assets/adventure.svg`: original local illustration; not a required Scratch asset.
- `TESTING.md`: actual checks, limitations and per-game manual acceptance.
- `.gitignore`: private data, secrets, caches and generated artifacts excluded.

Node.js is only needed to run the tests; no npm install or dependencies:

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

Content tests and mock DOM handlers do not prove game correctness, real browser behavior, or accessibility certification. See TESTING.md for actual results and unperformed checks.

## Existing GitHub site — this update is local

Repository: `steveniotech/halloween-scratch-adventure`. Existing URL remains [Halloween Scratch Adventure](https://steveniotech.github.io/halloween-scratch-adventure/); teacher URL ends in `/#teacher`. This task did not check live deployment status or change GitHub Pages. No commit, push or publication was performed. Local modifications are not live until a separately authorized push/deployment.

All runtime resources use relative paths. Direct `index.html`, a local static server, and the repository subpath are supported. No runtime fetch, dependencies, remote fonts, trackers or automatic audio were added.

For isolated browser QA (not classroom progress), run `python3 tests/serve.py`, open `http://127.0.0.1:8767/tests/fixture.html`, then its link. This seeds synthetic original-version progress only if that origin’s project key is missing. Do not seed a real classroom origin. `tests/browser-layout.html` measures the real site at 375px and inspects the export Blob while suppressing download.
