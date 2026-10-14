'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const A=require('./curriculum'),O=require('./quiz'),B=require('./beginner-curriculum'),N=require('./beginner-quiz'),C=require('./courses'),S=require('./state');
const manifest=require('./tests/baseline/manifest.json');
for(const f of ['curriculum.js','quiz.js']){assert.equal(crypto.createHash('sha256').update(fs.readFileSync('tests/baseline/'+f)).digest('hex'),manifest.sha256[f]);assert.equal(fs.readFileSync(f,'utf8'),fs.readFileSync('tests/baseline/'+f,'utf8'),'Protected source changed: '+f);}
assert.deepEqual(A.lessons,require('./tests/baseline/curriculum').lessons);assert.deepEqual(O.questions,require('./tests/baseline/quiz').questions);
assert.equal(crypto.createHash('sha256').update(fs.readFileSync('tests/baseline/state.js')).digest('hex'),manifest.sha256['state.js']);
assert.equal(manifest.head,'c398d485bcf3906395b9d1415b570b0d0368c270');
assert.equal(A.lessons.length,8);assert.equal(B.lessons.length,8);assert.equal(C.curriculum.lessons.length,16);assert.equal(O.questions.length,32);assert.equal(N.questions.length,24);assert.equal(C.quiz.questions.length,56);
assert.equal(new Set(C.curriculum.lessons.map(l=>l.id)).size,16);assert.equal(new Set(C.quiz.questions.map(q=>q.id)).size,56);
const english=t=>assert.ok(typeof t==='string'&&t.trim()&&!/[\u3400-\u9fff]/.test(t));
const walk=(nodes,fn)=>nodes.forEach((n,i)=>{fn(n,i,nodes);walk(n.children,fn);walk(n.otherwise,fn);});
for(const [i,l] of B.lessons.entries()){
 assert.ok(l.id.startsWith('beginner-'));assert.equal(l.track,'beginner');assert.equal(l.build.length,6);assert.equal(C.quiz.forLesson(l.id).length,3);
 assert.equal(l.nextLessonId,B.lessons[i+1]?.id||'gate');assert.ok(C.curriculum.lessons.some(n=>n.id===l.nextLessonId));assert.equal(l.story.length>=2&&l.story.length<=3,true);
 for(const key of ['title','focus','mission','ending','reset','win','replay','creative','challenge'])english(l[key]);for(const key of ['story','plan','reflect','tests']){assert.ok(l[key].length);l[key].forEach(english);}
 assert.equal(l.reflect.length,2);assert.ok(l.fixes.length>=3);l.fixes.forEach(f=>{english(f.bug);english(f.check);});
 const ids=new Set(l.stacks.map(s=>s.id));assert.equal(ids.size,l.stacks.length);const names=new Set(['Stage',...l.sprites.map(s=>s.name)]),covered=new Set();
 for(const step of l.build){[step.title,step.instruction,step.expected].forEach(english);for(const id of step.stackIds){assert.ok(ids.has(id));covered.add(id);}for(const [id,nodes] of Object.entries(step.stageNodes||{})){assert.ok(ids.has(id));assert.ok(nodes.length);}}
 for(const st of l.stacks){assert.ok(names.has(st.sprite));assert.ok(covered.has(st.id));assert.ok(['flag','key','receive'].includes(st.nodes[0].type));english(st.expected);walk(st.nodes,(n,i,siblings)=>{
  assert.deepEqual([n.category,n.label],B.labels[n.type]);
  if(['set','change'].includes(n.type))assert.ok(l.variables.some(v=>v.name===n.values.variable&&(v.scope==='For all sprites'||v.owner===st.sprite)));
  if(['broadcast','receive'].includes(n.type))assert.ok(l.messages.includes(n.values.message));
  if(n.type==='stop')assert.equal(i,siblings.length-1);
  for(const part of n.values.condition?.parts||[])if(part.category==='Sensing'&&part.label==='touching [sprite] ?')assert.ok(names.has(part.values));
 });}
 for(const key of ['storyPosition','objective','prerequisites','newConcepts','reusedConcepts','demo','guided','independent','readingSupport','questions','base','extension','websiteVsScratchZh'])assert.ok(/[\u3400-\u9fff]/.test(l.teacher[key]),key);
 assert.ok(l.teacher.acceptanceZh.length>=4);assert.ok(l.teacher.misconceptions.length>=3);
 for(const q of C.quiz.forLesson(l.id)){assert.ok(q.id.startsWith('beginner-'));assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(o=>o.id)).size,4);assert.equal(new Set(q.options.map(o=>o.text)).size,4);assert.equal(q.options.filter(o=>o.id===q.correctOptionId).length,1);[q.prompt,q.concept,q.explanation,q.hint,...q.options.map(o=>o.text)].forEach(english);assert.ok(/[\u3400-\u9fff]/.test(q.teacherNoteZh));assert.equal(C.quiz.grade(q.id,q.correctOptionId),true);}
}
for(const l of A.lessons){assert.equal(C.quiz.forLesson(l.id).length,4);assert.ok(C.curriculum.lessons.includes(l));}assert.deepEqual(A.lessons[7].routes.map(r=>r.id),['A','B','C']);
// Review architectural boundaries without executing Scratch.
for(const l of B.lessons.slice(0,6))assert.equal(l.messages.length,0);
for(const l of B.lessons.slice(0,7))assert.ok(!l.variables.some(v=>v.name==='gameState'));
assert.equal(B.lessons[0].sprites.length,1);assert.equal(B.lessons[0].variables.length,0);
const candy=B.lessons[3];for(const st of candy.stacks.filter(s=>s.sprite.startsWith('Candy'))){assert.deepEqual(st.nodes.map(n=>n.type),['flag','show','go','waitUntil','hide','change']);}
assert.deepEqual(B.lessons[6].messages,['CALL_LUMI']);assert.equal(B.lessons[6].stacks.filter(s=>s.nodes.some(n=>n.type==='broadcast')).length,1);
const exit=B.lessons[6].stacks.find(s=>s.sprite==='Exit'&&s.nodes[0].type==='receive');assert.deepEqual(exit.nodes.map(n=>n.type),['receive','show','waitUntil','sayFor','stop']);
const last=B.lessons[7];assert.ok(!last.stacks.some(s=>s.nodes.some(n=>n.type==='stop')));const win=last.stacks.find(s=>s.title==='Open once');let order=[];walk(win.nodes,n=>{if(n.type==='set'||n.type==='broadcast')order.push(n.type);});assert.deepEqual(order,['set','broadcast']);
// Representative original-version state is built with the original state module from HEAD fixture.
const Old=require('./tests/baseline/state');let old=Old.fresh();
for(const l of A.lessons){Old.startQuiz(old,l.id);for(const [i,q] of O.forLesson(l.id).entries()){
 if(i===0){Old.select(old,q.options.find(o=>o.id!==q.correctOptionId).id);Old.check(old);Old.hint(old);Old.retry(old);}
 Old.select(old,q.correctOptionId);Old.check(old);Old.next(old);
 }Old.setCheck(old,l.id,'build-1',true);Old.confirmProject(old,l.id,l.routes?'C':null);}
old.activeLesson='gate';old.unknownExtension={keep:['original',42]};old.quiz.records['old-unknown-question']={custom:'retain'};old.selfChecks['old-unknown-lesson']={custom:true};old.teacherConfirmation['old-unknown-lesson']={custom:'keep'};old.quiz.extra={keep:true};old.quizBadges.push('old-unknown-badge');
const restored=S.normalize(old);assert.deepEqual(restored.quiz.records,old.quiz.records);assert.deepEqual(restored.selfChecks,old.selfChecks);assert.deepEqual(restored.teacherConfirmation,old.teacherConfirmation);assert.deepEqual(restored.quizBadges,old.quizBadges);assert.deepEqual(restored.unknownExtension,old.unknownExtension);assert.deepEqual(restored.quiz.extra,old.quiz.extra);assert.equal(restored.activeLesson,'gate');assert.deepEqual(S.normalize(restored),restored);
assert.equal(S.summary(restored,'adventure').badgeCount,8);assert.equal(S.summary(restored,'beginner').badgeCount,0);assert.equal(S.summary(restored,'adventure').total,32);assert.equal(S.summary(restored,'beginner').total,24);assert.equal(S.summary(restored,'beginner').attempted,0);assert.equal(S.summary(restored,'beginner').firstAccuracy,null);
for(const l of B.lessons){assert.equal(restored.selfChecks[l.id],undefined);for(const q of C.quiz.forLesson(l.id))assert.equal(restored.quiz.records[q.id],undefined);}
const neverAward=S.fresh();neverAward.quiz.records=JSON.parse(JSON.stringify(old.quiz.records));assert.equal(S.normalize(neverAward).quizBadges.length,0,'Load must not grant badges');
const copy=S.clone(restored);S.startQuiz(copy,'beginner-ready');S.select(copy,N.questions[0].correctOptionId);S.check(copy);assert.equal(restored.quiz.records[N.questions[0].id],undefined);
const exported=JSON.parse(S.exportJSON(restored));assert.equal(exported.schemaVersion,1);assert.deepEqual(exported.courses.map(t=>t.id),['beginner','adventure']);assert.equal(exported.courses[0].questionIds.length,24);assert.equal(exported.courses[1].questionIds.length,32);assert.deepEqual(exported.progress,restored);assert.equal(S.KEY,'halloween-scratch-adventure:v1');
console.log('Preservation PASS: source hashes and original lesson/question objects match the pre-change HEAD baseline, including Festival routes.');
console.log('Beginner content PASS: 8 + 8 lessons, 24 + 32 questions, unique IDs, sections, six milestones, valid structured blocks and architecture boundaries.');
console.log('Old-state compatibility PASS: original module fixture, first attempts/retries/hints/badges/self-check/confirmations, unknown data, lazy Beginner records, idempotence, track statistics and export.');

const beginnerOnly=S.fresh();for(const check of S.allowedChecks('beginner-ready'))S.setCheck(beginnerOnly,'beginner-ready',check,true);S.confirmProject(beginnerOnly,'beginner-ready');assert.equal(S.summary(beginnerOnly,'beginner').badgeCount,0);assert.equal(S.summary(beginnerOnly,'beginner').firstAccuracy,null);assert.equal(C.quiz.grade('invalid',undefined),false);
