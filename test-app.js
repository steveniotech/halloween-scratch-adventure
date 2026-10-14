'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const D=require('./curriculum.js'),Q=require('./quiz.js'),S=require('./state.js');
const zh=/[\u3400-\u9fff]/;
const order=['gate','candy','bridge','maze','library','kitchen','tower','festival'];
assert.equal(D.lessons.length,8);assert.deepEqual(D.lessons.map(l=>l.id),order);assert.equal(new Set(order).size,8);
assert.equal(Q.questions.length,32);assert.equal(new Set(Q.questions.map(q=>q.id)).size,32);
function English(text){assert.ok(typeof text==='string'&&text.trim()&&!zh.test(text));assert.ok(!/\bTODO\b|lorem ipsum|placeholder/i.test(text));}
function walk(nodes,callback){for(const [index,n] of nodes.entries()){callback(n,index,nodes);walk(n.children,callback);walk(n.otherwise,callback);}}
function project(p,l){
 assert.ok(p.sprites.some(s=>s.name==='Explorer')&&p.sprites.some(s=>s.name==='Ghost'),'Same friends in every game');
 assert.ok(p.build.length>=5&&p.build.length<=7);assert.ok(p.stacks.length);const ids=p.stacks.map(s=>s.id);assert.equal(new Set(ids).size,ids.length);
 const names=new Set(['Stage',...p.sprites.map(s=>s.name)]),messages=new Set(p.messages),covered=new Set();
 for(const step of p.build){English(step.title);English(step.instruction);English(step.expected);assert.ok(step.stackIds.length);for(const id of step.stackIds){assert.ok(ids.includes(id),id);covered.add(id);}}
 for(const stack of p.stacks){assert.ok(covered.has(stack.id),'Missing milestone stack '+stack.id);assert.ok(names.has(stack.sprite));English(stack.title);English(stack.expected);assert.ok(['flag','receive','key','click','cloneStart'].includes(stack.nodes[0].type));
  walk(stack.nodes,(n,index,siblings)=>{
   assert.ok(D.labels[n.type]);assert.equal(n.category,D.labels[n.type][0]);assert.equal(n.label,D.labels[n.type][1]);
   if(['broadcast','broadcastWait','receive'].includes(n.type))assert.ok(messages.has(n.values.message),n.values.message);
   if(n.type==='set'||n.type==='change')assert.ok(p.variables.some(v=>v.name===n.values.variable&&(v.scope==='For all sprites'||v.owner===stack.sprite)),stack.id+' scoped '+n.values.variable);
   if(n.type==='deleteClone'||(n.type==='stop'&&n.values.option!=='other scripts in sprite'))assert.equal(index,siblings.length-1,'No blocks below a terminal cap');
   if(n.values.condition)for(const part of n.values.condition.parts){assert.ok(['Variables','Motion','Sensing','Operators'].includes(part.category));if(part.category==='Sensing'&&part.label==='touching [sprite] ?')assert.ok(names.has(part.values)||part.values==='edge');}
  });
  if(stack.nodes[0].type==='receive'&&stack.nodes[0].values.message.endsWith('_RESET'))walk(stack.nodes,n=>assert.ok(!['until','waitUntil','cloneStart','clone'].includes(n.type),'RESET must finish'));
 }
 for(const m of p.messages){assert.ok(p.stacks.some(s=>s.nodes[0].type==='receive'&&s.nodes[0].values.message===m)||m.endsWith('_PLAY'),'Declared receive for '+m);}
 assert.ok(p.stacks.some(s=>s.nodes[0].type==='flag'),'Green flag reset');let hasWin=false;for(const stack of p.stacks)walk(stack.nodes,n=>{if(n.type==='set'&&n.values.variable==='gameState'&&n.values.value==='won')hasWin=true;});assert.ok(hasWin,'Win state');
}
for(const [i,l] of D.lessons.entries()){
 assert.equal(l.nextLessonId,order[i+1]||null);assert.ok(l.story.length>=2&&l.story.length<=3);l.story.forEach(English);
 for(const text of [l.title,l.focus,l.mission,l.ending,l.reset,l.win,l.replay,l.creative,l.challenge,...l.plan,...l.reflect,...l.tests])English(text);
 assert.equal(l.plan.length,4);assert.ok(l.fixes.length>=3);l.fixes.forEach(f=>{English(f.bug);English(f.check);});assert.ok(l.sprites.length&&l.variables.length&&l.messages.length);
 for(const field of ['objective','prerequisites','newConcepts','reusedConcepts','demo','guided','questions','differentiation','timing','websiteVsScratchZh'])assert.ok(zh.test(l.teacher[field]),field);
 assert.ok(l.teacher.acceptanceZh.length>=4);assert.ok(l.teacher.misconceptions.length>=3);l.teacher.misconceptions.forEach(m=>assert.ok(zh.test(m.noteZh)&&zh.test(m.bugZh)));
 project(l,l);assert.equal(Q.forLesson(l.id).length,4);
 for(const q of Q.forLesson(l.id)){
  assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(o=>o.id)).size,4);assert.equal(new Set(q.options.map(o=>o.text)).size,4);
  assert.equal(q.options.filter(o=>o.id===q.correctOptionId).length,1);[q.prompt,q.concept,q.explanation,q.hint,...q.options.map(o=>o.text)].forEach(English);assert.ok(zh.test(q.teacherNoteZh));assert.equal(Q.grade(q.id,q.correctOptionId),true);assert.equal(Q.grade(q.id,'invalid'),false);
 }
}
assert.deepEqual(D.lessons[7].routes.map(r=>r.id),['A','B','C']);for(const r of D.lessons[7].routes){project(r,D.lessons[7]);assert.ok(r.tests.length>=3&&r.acceptance.length>=4&&r.acceptanceZh.length);}
assert.ok(D.integrationZh.steps.length>=8&&D.integrationZh.steps.some(t=>t.includes('GLOBAL_CLEANUP')));
console.log('Content checks passed: eight ordered connected lessons, 32 valid English questions with Chinese notes, all sections, 5–7 milestones, reset/win/replay, scoped variables/messages, and all three final routes.');
console.log('Script structure checks passed: all stacks covered, finite reset receivers, valid block categories and no instructions below delete/stop caps. These are not executed Scratch tests.');
let state=S.fresh();const id=order[0],questions=Q.forLesson(id),first=questions[0],wrong=first.options.find(o=>o.id!==first.correctOptionId).id;
for(const check of S.allowedChecks(id))S.setCheck(state,id,check,true);assert.equal(state.quizBadges.length,0,'Self-check cannot award');
S.confirmProject(state,id);assert.equal(state.quizBadges.length,0,'Teacher confirmation cannot award');S.revokeProject(state,id);assert.equal(S.stats(state,id).teacherConfirmed,false);
S.startQuiz(state,id);assert.equal(S.check(state),null);S.select(state,wrong);assert.equal(state.quiz.records[first.id].attempts,0,'Select is not check');assert.equal(S.check(state),false);assert.equal(S.next(state),false);assert.equal(S.check(state),null,'No double check');
assert.equal(S.hint(state),true);assert.equal(S.hint(state),false);S.retry(state);S.select(state,first.correctOptionId);S.check(state);S.next(state);
assert.equal(state.quiz.records[first.id].firstAttemptCorrect,false);assert.equal(state.quiz.records[first.id].firstOptionId,wrong);assert.equal(state.quiz.records[first.id].laterAttempts,1);assert.equal(S.stats(state,id).firstAccuracy,0);assert.equal(S.stats(state,id).attempted,1,'Unattempted excluded');assert.equal(S.stats(state,id).total,4);
for(const q of questions.slice(1)){S.select(state,q.correctOptionId);S.check(state);S.next(state);}
assert.equal(state.quiz.session.phase,'complete');assert.deepEqual(state.quizBadges,[id]);assert.equal(S.award(state,id),false);
assert.deepEqual(S.missedIds(state,id),[first.id]);
S.startQuiz(state,id,'review');assert.deepEqual(state.quiz.session.ids,[first.id]);S.select(state,first.correctOptionId);S.check(state);S.next(state);
assert.equal(state.quiz.records[first.id].firstAttemptCorrect,false);assert.equal(state.quiz.records[first.id].firstOptionId,wrong);assert.equal(state.quiz.records[first.id].laterAttempts,2);assert.equal(state.quizBadges.length,1);
assert.deepEqual(S.normalize(JSON.parse(JSON.stringify(state))),state);
const exported=JSON.parse(S.exportJSON(state));assert.equal(exported.schemaVersion,1);assert.ok(Number.isFinite(Date.parse(exported.exportedAt)));assert.deepEqual(exported.progress,state);
assert.equal(S.summary(state).attempted,4);assert.equal(S.summary(state).firstAccuracy,.75);assert.equal(S.summary(state).total,32);
S.confirmProject(state,'festival','B');assert.equal(state.teacherConfirmation.festival.route,'B');assert.equal(state.quizBadges.length,1);assert.equal(S.stats(state,'festival').quizComplete,false);
for(const l of D.lessons.slice(1)){S.startQuiz(state,l.id);for(const q of Q.forLesson(l.id)){S.select(state,q.correctOptionId);S.check(state);S.next(state);}}
assert.equal(state.quizBadges.length,8);assert.equal(new Set(state.quizBadges).size,8);assert.equal(S.summary(state).eventual,32);
function memory(initial){const data=new Map(initial||[]),writes=[],removes=[];return {data,writes,removes,getItem:k=>data.has(k)?data.get(k):null,setItem(k,v){writes.push(k);data.set(k,v);},removeItem(k){removes.push(k);data.delete(k);}};}
let storage=memory([[S.KEY,JSON.stringify(state)],['other','keep']]);const store=S.createStore(storage);assert.equal(store.status,'ok');store.reset();assert.deepEqual(storage.removes,[S.KEY]);assert.equal(storage.data.get('other'),'keep');assert.equal(storage.data.has(S.KEY),false);
assert.equal(S.KEY,'halloween-scratch-adventure:v1');
for(const [value,expected] of [['{ broken','malformed'],[JSON.stringify({schemaVersion:99}),'unsupported']]){
 const local=memory([[S.KEY,value]]),manager=S.createStore(local);assert.equal(manager.status,expected);S.activate(manager.state,'gate');assert.equal(manager.save(),false);assert.equal(local.data.get(S.KEY),value,'Never overwrite damaged data');manager.reset();assert.equal(local.data.has(S.KEY),false);assert.equal(manager.save(),true);
}
const malformedRecord=S.fresh();malformedRecord.quiz.records[first.id]={attempts:5};let badStore=S.createStore(memory([[S.KEY,JSON.stringify(malformedRecord)]]));assert.equal(badStore.status,'unsupported');
const denied={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');},removeItem(){throw new Error('blocked');}},blocked=S.createStore(denied);assert.equal(blocked.status,'blocked');S.activate(blocked.state,'gate');assert.equal(blocked.save(),false);assert.equal(blocked.state.activeLesson,'gate');assert.doesNotThrow(()=>JSON.parse(S.exportJSON(blocked.state)));assert.equal(blocked.reset(),false);
const empty=S.createStore(memory());assert.equal(empty.status,'empty');assert.equal(S.summary(empty.state).firstAccuracy,null);
console.log('Pure state checks passed: original first attempts retained through retry/review, one badge per lesson, separate self-check and teacher confirmation, versioned JSON, single-key reset, and blocked/malformed storage recovery.');
// Minimal DOM adapter executes shipped page handlers, not a browser engine.
function browser(initial=[],route='',storageOverride=null){
 const local=storageOverride||memory(initial),elements=new Map();let download='',focused=null;
 class Element{constructor(id=''){this.id=id;this.innerHTML='';this.textContent='';this.dataset={};this.checked=false;this.value='';this.hidden=false;this.disabled=false;this.open=false;this.isConnected=true;this.listeners={};}
  addEventListener(type,cb){(this.listeners[type]||(this.listeners[type]=[])).push(cb);}setAttribute(){}focus(){focused=this;document.activeElement=this;}querySelector(){return new Element();}contains(el){return el&&['dialog-confirm','dialog-cancel','manual-confirm','confirm-route'].includes(el.id);}showModal(){this.open=true;}close(){this.open=false;for(const cb of this.listeners.close||[])cb();}click(){if(this.download)download=this.download;}}
 const get=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id);};
 const document={getElementById:get,querySelector:get,createElement:()=>new Element(),documentElement:{lang:'en'},activeElement:new Element('outside')};
 const location={hash:route,pathname:'/adventure/index.html',search:''};
 const context=vm.createContext({document,location,history:{replaceState:()=>{location.hash='';}},window:{addEventListener(){}},localStorage:local,Blob:class{},URL:{createObjectURL:()=> 'blob:export',revokeObjectURL(){}},setTimeout:()=>1,console});
 for(const file of ['curriculum.js','quiz.js','state.js','app.js','teacher.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),context,{filename:file});
 function click(action,data={},teacher=false){const t=new Element();t.dataset={...data,[teacher?'teacher':'action']:action};const event={target:{closest:selector=>selector===(teacher?'[data-teacher]':'[data-action]')?t:null}};for(const cb of get('main').listeners.click)cb(event);}
 function change(t){for(const cb of get('main').listeners.change)cb({target:t});}
 return {local,get,context,click,change,download:()=>download,focus:()=>focused,Element};
}
const B=browser(),A=B.context.HalloweenApp,C=B.context.HalloweenState;
assert.equal((B.get('main').innerHTML.match(/class="map-card /g)||[]).length,8);assert.ok(!zh.test(B.get('main').innerHTML));
for(const l of D.lessons){B.click('lesson',{lesson:l.id});for(let section=0;section<10;section++){B.click('section',{section:String(section)});assert.ok(!zh.test(B.get('main').innerHTML),l.id+' section '+section);}}
B.click('lesson',{lesson:'gate'});B.click('section',{section:'3'});const checkElement=new B.Element();checkElement.dataset.selfCheck='build-1';checkElement.checked=true;B.change(checkElement);assert.equal(A.getState().selfChecks.gate['build-1'],true);assert.equal(A.getState().quizBadges.length,0);
B.click('section',{section:'6'});B.click('quiz-start');B.click('quiz-select',{option:wrong});assert.equal(A.getState().quiz.records[first.id].attempts,0);assert.ok(!B.get('main').innerHTML.includes('Not quite yet'));B.click('quiz-check');assert.match(B.get('main').innerHTML,/Not quite yet/);B.click('quiz-hint');B.click('quiz-retry');B.click('quiz-select',{option:first.correctOptionId});B.click('quiz-check');B.click('quiz-next');
const refreshed=browser([[S.KEY,B.local.data.get(S.KEY)]]);assert.equal(refreshed.context.HalloweenApp.getState().quiz.session.index,1);assert.match(refreshed.get('main').innerHTML,/Question 2 of 4/);
for(const q of questions.slice(1)){B.click('quiz-select',{option:q.correctOptionId});B.click('quiz-check');B.click('quiz-next');}assert.match(B.get('main').innerHTML,/Your Quick Check is complete/);assert.equal(A.getState().quizBadges.length,1);B.click('quiz-review');assert.equal(A.getState().quiz.session.ids.length,1);
A.showTeacher();assert.equal(B.context.document.documentElement.lang,'zh-CN');assert.match(B.get('main').innerHTML,/教师查看/);B.click('detail',{lesson:'gate'},true);assert.match(B.get('main').innerHTML,/作品验收清单/);
const before=JSON.stringify(A.getState()),writesBefore=B.local.writes.length;B.click('preview',{lesson:'gate'},true);B.click('section',{section:'3'});const previewCheck=new B.Element();previewCheck.dataset.selfCheck='build-2';previewCheck.checked=true;B.change(previewCheck);B.click('section',{section:'6'});B.click('quiz-start');
for(const q of questions){B.click('quiz-select',{option:q.correctOptionId});B.click('quiz-check');B.click('quiz-next');}assert.match(B.get('main').innerHTML,/Preview only/);assert.equal(JSON.stringify(A.getState()),before);assert.equal(B.local.writes.length,writesBefore);B.click('exit-preview');assert.equal(JSON.stringify(A.getState()),before);
B.click('export',{},true);assert.equal(B.download(),'halloween-scratch-adventure-progress.json');
B.click('detail',{lesson:'gate'},true);B.click('confirm',{lesson:'gate'},true);assert.equal(B.get('dialog-confirm').disabled,true);B.get('manual-confirm').onchange({target:{checked:true}});assert.equal(B.get('dialog-confirm').disabled,false);B.get('dialog-confirm').onclick();assert.equal(A.getState().teacherConfirmation.gate.confirmed,true);assert.equal(A.getState().quizBadges.length,1);B.click('revoke',{lesson:'gate'},true);assert.equal(A.getState().teacherConfirmation.gate,undefined);
// Both separate confirmation cancellation paths must preserve exact stored data.
B.local.data.set('unrelated','keep');const preserved=B.local.data.get(S.KEY);
A.resetProgress();assert.match(B.get('dialog-title').textContent,/第一次/);B.get('dialog-cancel').onclick();assert.equal(B.local.data.get(S.KEY),preserved);
A.resetProgress();B.get('dialog-confirm').onclick();assert.match(B.get('dialog-title').textContent,/第二次/);B.get('dialog-cancel').onclick();assert.equal(B.local.data.get(S.KEY),preserved);
A.resetProgress();B.get('dialog-confirm').onclick();B.get('dialog-confirm').onclick();assert.equal(A.getState().quizBadges.length,0);assert.equal(B.local.data.has(S.KEY),false);assert.equal(B.local.data.get('unrelated'),'keep');assert.ok(B.local.removes.every(k=>k===S.KEY));
// Damaged original survives normal UI use; recovery is explicit.
const broken=browser([[S.KEY,'{ bad JSON']]);broken.click('lesson',{lesson:'gate'});assert.equal(broken.local.data.get(S.KEY),'{ bad JSON');assert.equal(broken.get('storage-warning').hidden,false);assert.match(broken.get('storage-message').textContent,/not been replaced/);
// All final routes render complete build guide stacks in student mode.
for(const route of ['A','B','C']){B.click('lesson',{lesson:'festival'});const select=new B.Element('route-select');select.value=route;B.change(select);for(const section of ['1','3','4']){B.click('section',{section});assert.ok(!zh.test(B.get('main').innerHTML));if(section==='3')assert.match(B.get('main').innerHTML,/Final script overview/);}}
const deniedUI=browser([],'',denied);deniedUI.click('lesson',{lesson:'gate'});assert.equal(deniedUI.context.HalloweenApp.getState().activeLesson,'gate');assert.match(deniedUI.get('storage-message').textContent,/not saved/);assert.equal(deniedUI.get('storage-warning').hidden,false);
const teacherRoute=browser([],'#teacher');assert.match(teacherRoute.get('main').innerHTML,/教师查看/);
console.log('DOM-handler substitutes passed: all lesson sections, quiz wrong/hint/retry/completion/review, refresh, preview storage isolation, teacher confirmation, export, both reset cancellation paths and explicit malformed recovery. Not real-browser tests.');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');assert.ok(!zh.test(html));
for(const [,ref] of html.matchAll(/(?:src|href)="([^"#]+)"/g)){assert.ok(ref.startsWith('./'),'Relative runtime asset '+ref);assert.ok(fs.existsSync(path.join(__dirname,ref)));}
for(const file of ['curriculum.js','quiz.js','state.js','app.js','teacher.js','styles.css','index.html']){
 const text=fs.readFileSync(path.join(__dirname,file),'utf8');assert.ok(!/\beval\s*\(|new\s+Function\s*\(|\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage\.clear\s*\(|@import/.test(text));
 const external=[...text.matchAll(/https?:\/\/[^\s'"<>]+/g)].map(m=>m[0]);assert.ok(external.every(url=>url==='https://scratch.mit.edu/projects/editor/'),'Only explicit editor navigation permitted');
}
const app=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');assert.match(app,/target="_blank" rel="noopener noreferrer"/);assert.match(app,/src="\.\/assets\/adventure.svg"/);
assert.ok(fs.existsSync(path.join(__dirname,'assets/adventure.svg')));const svg=fs.readFileSync(path.join(__dirname,'assets/adventure.svg'),'utf8');assert.ok(!/<script|<image|href=|onload=/i.test(svg));
console.log('Static checks passed: relative local assets, no unexpected external runtime dependencies, no evaluation, no global storage clear, explicit protected Scratch editor link.');
console.log('All automated tests passed. Scratch gameplay and real-browser/accessibility checks remain NOT RUN.');
