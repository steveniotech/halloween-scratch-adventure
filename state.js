'use strict';
(function(root){
 const node=typeof module!=='undefined'&&module.exports;
 const D=node?require('./curriculum.js'):root.HalloweenCurriculum;
 const Q=node?require('./quiz.js'):root.HalloweenQuiz;
 const KEY='halloween-scratch-adventure:v1',VERSION=1;
 const iso=()=>new Date().toISOString(),clone=value=>JSON.parse(JSON.stringify(value));
 const lesson=id=>D.lessons.find(l=>l.id===id),question=id=>Q.questions.find(q=>q.id===id);
 const validDate=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));
 const count=value=>Number.isSafeInteger(value)&&value>=0?Math.min(value,1000000):0;
 const isObject=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
 function fresh(){return {schemaVersion:VERSION,activeLesson:null,selfChecks:{},quiz:{records:{},session:null},quizBadges:[],teacherConfirmation:{},timestamps:{createdAt:iso(),latestActivityAt:null}};}
 function touch(state){state.timestamps.latestActivityAt=iso();}
 function allowedChecks(id){const l=lesson(id);return l?[...l.selfChecks.map(c=>c.id),...l.build.map((_,i)=>'build-'+(i+1))]:[];}
 function record(state,id){if(!question(id))throw new Error('Unknown question');return state.quiz.records[id]||(state.quiz.records[id]={selectedOptionId:null,firstOptionId:null,firstAttemptCorrect:null,eventualCorrect:false,attempts:0,laterAttempts:0,hintUsed:false,wrongOptionIds:[],lastAttemptAt:null});}
 function normalize(raw){
  if(!isObject(raw)||raw.schemaVersion!==VERSION||!isObject(raw.quiz)||!isObject(raw.quiz.records)||!isObject(raw.selfChecks)||!isObject(raw.teacherConfirmation)||!isObject(raw.timestamps)||!Array.isArray(raw.quizBadges))throw new Error('Unsupported state structure');
  const state=fresh();state.activeLesson=lesson(raw.activeLesson)?raw.activeLesson:null;
  state.timestamps.createdAt=validDate(raw.timestamps.createdAt)?raw.timestamps.createdAt:state.timestamps.createdAt;
  state.timestamps.latestActivityAt=validDate(raw.timestamps.latestActivityAt)?raw.timestamps.latestActivityAt:null;
  for(const l of D.lessons){
   const checks=raw.selfChecks[l.id];if(isObject(checks)){state.selfChecks[l.id]={};for(const id of allowedChecks(l.id))if(typeof checks[id]==='boolean')state.selfChecks[l.id][id]=checks[id];}
   const confirmation=raw.teacherConfirmation[l.id];if(isObject(confirmation)&&confirmation.confirmed===true&&validDate(confirmation.at))state.teacherConfirmation[l.id]={confirmed:true,at:confirmation.at,route:l.routes&&['A','B','C'].includes(confirmation.route)?confirmation.route:null};
  }
  for(const q of Q.questions){
   const r=raw.quiz.records[q.id];if(r===undefined)continue;if(!isObject(r))throw new Error('Invalid question record');const safe=record(state,q.id),valid=id=>q.options.some(o=>o.id===id);
   if(!Number.isSafeInteger(r.attempts)||r.attempts<0||(r.selectedOptionId!==null&&!valid(r.selectedOptionId))||(r.attempts>0&&!valid(r.firstOptionId))||typeof r.eventualCorrect!=='boolean'||typeof r.hintUsed!=='boolean'||!Array.isArray(r.wrongOptionIds))throw new Error('Invalid question record');
   safe.selectedOptionId=valid(r.selectedOptionId)?r.selectedOptionId:null;safe.attempts=count(r.attempts);safe.laterAttempts=Math.max(0,safe.attempts-1);
   safe.firstOptionId=safe.attempts&&valid(r.firstOptionId)?r.firstOptionId:null;
   safe.firstAttemptCorrect=safe.attempts&&safe.firstOptionId?Q.grade(q.id,safe.firstOptionId):null;
   safe.eventualCorrect=safe.attempts>0&&r.eventualCorrect===true;safe.hintUsed=r.hintUsed===true;
   safe.wrongOptionIds=Array.isArray(r.wrongOptionIds)?[...new Set(r.wrongOptionIds.filter(id=>valid(id)&&!Q.grade(q.id,id)))]:[];
   safe.lastAttemptAt=validDate(r.lastAttemptAt)?r.lastAttemptAt:null;
  }
  // Rewards are derived from actual eventual quiz answers, never from a build/teacher flag.
  state.quizBadges=D.lessons.filter(l=>Q.forLesson(l.id).every(q=>state.quiz.records[q.id]?.eventualCorrect)).map(l=>l.id);
  const run=raw.quiz.session;
  if(isObject(run)&&lesson(run.lessonId)&&Array.isArray(run.ids)&&run.ids.length&&new Set(run.ids).size===run.ids.length&&run.ids.every(id=>question(id)?.lessonId===run.lessonId)){
   const ids=run.ids.slice();state.quiz.session={lessonId:run.lessonId,mode:run.mode==='review'?'review':'practice',ids,index:Math.min(ids.length-1,count(run.index)),responses:{},phase:run.phase==='complete'?'complete':'question',newBadge:run.newBadge===true};
   for(const id of ids){const r=run.responses?.[id];if(!isObject(r))continue;const q=question(id);const selected=q.options.some(o=>o.id===r.selected)?r.selected:null;let status=['ready','wrong','correct'].includes(r.status)?r.status:'ready';if(status==='correct'&&(!Q.grade(id,selected)||!state.quiz.records[id]?.eventualCorrect))status='ready';state.quiz.session.responses[id]={selected,status,hintShown:r.hintShown===true,attempts:count(r.attempts)};}
   if(state.quiz.session.phase==='complete'&&!ids.every(id=>state.quiz.session.responses[id]?.status==='correct'))state.quiz.session.phase='question';
  }
  return state;
 }
 function activate(state,id){if(!lesson(id))return false;state.activeLesson=id;touch(state);return true;}
 function setCheck(state,id,checkId,value){if(!allowedChecks(id).includes(checkId))return false;(state.selfChecks[id]||(state.selfChecks[id]={}))[checkId]=value===true;touch(state);return true;}
 function confirmProject(state,id,route=null){if(!lesson(id))return false;state.teacherConfirmation[id]={confirmed:true,at:iso(),route:lesson(id).routes&&['A','B','C'].includes(route)?route:null};touch(state);return true;}
 function revokeProject(state,id){if(!lesson(id))return false;delete state.teacherConfirmation[id];touch(state);return true;}
 function missedIds(state,id){return Q.forLesson(id).filter(q=>state.quiz.records[q.id]?.firstAttemptCorrect===false).map(q=>q.id);}
 function startQuiz(state,id,mode='practice'){
  if(!lesson(id))return false;const ids=mode==='review'?missedIds(state,id):Q.forLesson(id).map(q=>q.id);if(!ids.length)return false;
  state.activeLesson=id;state.quiz.session={lessonId:id,mode,ids,index:0,responses:{},phase:'question',newBadge:false};touch(state);return true;
 }
 function response(state){const s=state.quiz.session;if(!s)return null;const id=s.ids[s.index];return s.responses[id]||(s.responses[id]={selected:null,status:'ready',hintShown:false,attempts:0});}
 function select(state,optionId){const s=state.quiz.session,r=response(state);if(!s||r.status!=='ready'||!question(s.ids[s.index]).options.some(o=>o.id===optionId))return false;r.selected=optionId;record(state,s.ids[s.index]).selectedOptionId=optionId;touch(state);return true;}
 function award(state,id){if(!lesson(id)||state.quizBadges.includes(id)||!Q.forLesson(id).every(q=>state.quiz.records[q.id]?.eventualCorrect))return false;state.quizBadges.push(id);touch(state);return true;}
 function check(state){
  const s=state.quiz.session,r=response(state);if(!s||r.status!=='ready'||r.selected===null)return null;
  const id=s.ids[s.index],saved=record(state,id),correct=Q.grade(id,r.selected);
  saved.attempts++;saved.laterAttempts=Math.max(0,saved.attempts-1);
  if(saved.firstAttemptCorrect===null){saved.firstOptionId=r.selected;saved.firstAttemptCorrect=correct;}
  saved.selectedOptionId=r.selected;saved.eventualCorrect=saved.eventualCorrect||correct;saved.lastAttemptAt=iso();
  if(!correct&&!saved.wrongOptionIds.includes(r.selected))saved.wrongOptionIds.push(r.selected);
  r.status=correct?'correct':'wrong';r.attempts++;if(award(state,s.lessonId))s.newBadge=true;touch(state);return correct;
 }
 function hint(state){const s=state.quiz.session,r=response(state);if(!s||r.hintShown)return false;r.hintShown=true;record(state,s.ids[s.index]).hintUsed=true;touch(state);return true;}
 function retry(state){const r=response(state);if(!r||r.status!=='wrong')return false;r.status='ready';r.selected=null;touch(state);return true;}
 function next(state){const s=state.quiz.session,r=response(state);if(!s||r.status!=='correct')return false;if(s.index===s.ids.length-1)s.phase='complete';else s.index++;touch(state);return true;}
 function stats(state,id){
  const questions=Q.forLesson(id),records=questions.map(q=>state.quiz.records[q.id]).filter(Boolean),attempted=records.filter(r=>r.attempts>0),firstCorrect=attempted.filter(r=>r.firstAttemptCorrect===true).length;
  const checks=allowedChecks(id),self=checks.filter(cid=>state.selfChecks[id]?.[cid]).length;
  return {total:questions.length,attempted:attempted.length,firstCorrect,firstAccuracy:attempted.length?firstCorrect/attempted.length:null,eventual:records.filter(r=>r.eventualCorrect).length,attempts:records.reduce((n,r)=>n+r.attempts,0),laterAttempts:records.reduce((n,r)=>n+r.laterAttempts,0),hints:records.filter(r=>r.hintUsed).length,quizComplete:state.quizBadges.includes(id),selfChecked:self,selfTotal:checks.length,teacherConfirmed:state.teacherConfirmation[id]?.confirmed===true};
 }
 function summary(state){const rows=D.lessons.map(l=>stats(state,l.id)),sum=key=>rows.reduce((n,r)=>n+r[key],0);const attempted=sum('attempted'),firstCorrect=sum('firstCorrect');return {total:Q.questions.length,attempted,firstCorrect,firstAccuracy:attempted?firstCorrect/attempted:null,eventual:sum('eventual'),attempts:sum('attempts'),laterAttempts:sum('laterAttempts'),hints:sum('hints'),badgeCount:state.quizBadges.length,lessonCount:D.lessons.length,latest:state.timestamps.latestActivityAt};}
 function exportJSON(state){return JSON.stringify({schemaVersion:VERSION,exportedAt:iso(),progress:state},null,2);}
 function resetStorage(storage){storage.removeItem(KEY);return fresh();}
 function createStore(provider){
  const obtain=()=>typeof provider==='function'?provider():provider;
  let state=fresh(),status='empty',saveAllowed=true;
  try{const text=obtain().getItem(KEY);if(text!==null&&text!==undefined){try{const raw=JSON.parse(text);state=normalize(raw);status='ok';}catch(error){status=error instanceof SyntaxError?'malformed':'unsupported';saveAllowed=false;}}}catch{status='blocked';saveAllowed=false;}
  return {get state(){return state;},get status(){return status;},save(){if(!saveAllowed)return false;try{obtain().setItem(KEY,JSON.stringify(state));status='ok';return true;}catch{status='blocked';saveAllowed=false;return false;}},reset(){let cleared=false;try{state=resetStorage(obtain());status='empty';saveAllowed=true;cleared=true;}catch{state=fresh();status='blocked';saveAllowed=false;}return cleared;}};
 }
 const api={KEY,VERSION,fresh,normalize,clone,activate,setCheck,confirmProject,revokeProject,missedIds,startQuiz,response,select,check,hint,retry,next,award,stats,summary,exportJSON,resetStorage,createStore,allowedChecks};
 root.HalloweenState=api;if(node)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
