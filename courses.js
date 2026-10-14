'use strict';
(function(root){
 const node=typeof module!=='undefined'&&module.exports;
 const adventure=node?require('./curriculum.js'):root.HalloweenCurriculum;
 const beginner=node?require('./beginner-curriculum.js'):root.HalloweenBeginnerCurriculum;
 const oldQuiz=node?require('./quiz.js'):root.HalloweenQuiz;
 const newQuiz=node?require('./beginner-quiz.js'):root.HalloweenBeginnerQuiz;
 const tracks=[{id:'beginner',label:'Beginner',title:'Pip’s First Halloween',cta:'Start Here',lessons:beginner.lessons},{id:'adventure',label:'Adventure',title:'Halloween Rescue Adventure',cta:'Continue Your Adventure',lessons:adventure.lessons}];
 const lessons=tracks.flatMap(t=>t.lessons),questions=[...oldQuiz.questions,...newQuiz.questions];
 const curriculum={...adventure,lessons,tracks,labels:beginner.labels,trackOf:id=>tracks.find(t=>t.lessons.some(l=>l.id===id)),number:id=>{const t=tracks.find(t=>t.lessons.some(l=>l.id===id));return t?(t.id==='beginner'?'B':'Adventure ')+(t.lessons.findIndex(l=>l.id===id)+1):'';}};
 const quiz={questions,forLesson:id=>questions.filter(q=>q.lessonId===id),grade:(id,option)=>{const q=questions.find(q=>q.id===id);return !!q&&q.options.some(o=>o.id===option)&&q.correctOptionId===option;}};
 const api={curriculum,quiz};root.HalloweenCourses=api;if(node)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
