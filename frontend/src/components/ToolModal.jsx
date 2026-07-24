import React, { useState, useRef } from 'react';
import { API } from '../config';
import { saveResumeVersion } from './ResumeVersionManager';

const TOOL_META = {
  resume:       { title: '📄 Resume Analyzer',          color: '#2EC4A0', bg: '#E8FFF5' },
  roast:        { title: '🔥 Roast My Resume',           color: '#FF5722', bg: '#FFF3F0' },
  cover:        { title: '✉️ Cover Letter Generator',   color: '#FF7849', bg: '#FFF4F0' },
  linkedin:     { title: '💼 LinkedIn Optimizer',        color: '#C8A800', bg: '#FFFDE8' },
  salary:       { title: '💸 Salary Negotiation Coach',  color: '#7C6FCD', bg: '#F5F4FF' },
  interview:    { title: '🎯 Interview Question Bank',   color: '#2196F3', bg: '#F0FAFF' },
  mockinterview:{ title: '🎤 Mock Interview',            color: '#9C27B0', bg: '#F9F0FF' },
  skillgap:     { title: '📊 Skill Gap Analyzer',        color: '#0288D1', bg: '#E1F5FE' },
  roadmap:      { title: '🗺️ Career Roadmap Generator',  color: '#E91E8C', bg: '#FFF5F8' },
  careerpaths:  { title: '🚀 Career Paths',              color: '#FF9800', bg: '#FFF8F0' },
  coldemail:    { title: '🔗 Cold Email Generator',      color: '#FF5722', bg: '#FFF3F0' },
  scam:         { title: '🔍 Scam Checker',              color: '#00BCD4', bg: '#E0F7FA' },
};

function FileUploadZone({ onFile, file }) {
  const ref = useRef();
  const [dragging, setDragging] = useState(false);
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); };
  return (
    <div onClick={() => ref.current.click()} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}
      style={{ border: `2px dashed ${dragging ? '#7C6FCD' : file ? '#2EC4A0' : '#C4BBF0'}`, borderRadius: 14, padding: '16px', textAlign: 'center', cursor: 'pointer', background: dragging ? '#F5F2FF' : file ? '#F0FFF8' : '#FAFAFE', transition: 'all 0.2s', marginBottom: 12 }}>
      <input ref={ref} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }} onChange={e => e.target.files[0] && onFile(e.target.files[0])} />
      {file ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.4rem' }}>{file.name.endsWith('.pdf') ? '📋' : '📄'}</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: '#1A2B5C', fontSize: '0.87rem' }}>{file.name}</div>
            <div style={{ color: '#2EC4A0', fontSize: '0.76rem', fontWeight: 600 }}>✓ Ready · {(file.size/1024).toFixed(0)} KB</div>
          </div>
          <button onClick={e => { e.stopPropagation(); onFile(null); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '1.8rem', marginBottom: 5 }}>📁</div>
          <div style={{ fontWeight: 700, color: '#4A3FA8', fontSize: '0.87rem' }}>Upload Resume</div>
          <div style={{ color: '#888', fontSize: '0.74rem', marginTop: 2 }}>PDF, DOCX, DOC, TXT · Max 10MB · Drag & drop or click</div>
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score, size = 90, label, color = '#7C6FCD' }) {
  const r = (size/2)-8; const circ = 2*Math.PI*r; const dash = (score/100)*circ;
  return (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EEE" strokeWidth="7"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>
        <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize: size<80?13:17, fill:color }}>{score}</text>
      </svg>
      {label && <div style={{ fontSize:'0.7rem', fontWeight:700, color:'#6B7280', marginTop:2 }}>{label}</div>}
    </div>
  );
}

function Tag({ text, color='#7C6FCD', bg }) {
  return <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:50, background: bg||color+'18', color, fontSize:'0.75rem', fontWeight:700, margin:'2px 3px' }}>{text}</span>;
}

function Card({ title, children, accent }) {
  return (
    <div style={{ border:`1.5px solid ${accent||'#E8E4F8'}`, borderRadius:14, padding:'13px 16px', marginBottom:12, borderLeft:`4px solid ${accent||'#7C6FCD'}` }}>
      {title && <div style={{ fontWeight:800, fontSize:'0.78rem', color:accent||'#7C6FCD', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>{title}</div>}
      {children}
    </div>
  );
}

function AriaBox({ tip }) {
  return (
    <div style={{ background:'linear-gradient(135deg,#F5F4FF,#EDE9FF)', border:'1.5px solid #D0CBFF', borderRadius:14, padding:'13px 16px', display:'flex', gap:12, alignItems:'flex-start', marginTop:14 }}>
      <span style={{ fontSize:'1.4rem', flexShrink:0 }}>🦉</span>
      <div>
        <div style={{ fontWeight:800, color:'#4A3FA8', fontSize:'0.72rem', marginBottom:3 }}>ARIA'S TIP</div>
        <div style={{ fontSize:'0.86rem', color:'#3B2FA8', lineHeight:1.6 }}>{tip}</div>
      </div>
    </div>
  );
}

// ════ Result Components ════

function ResumeResult({ r }) {
  const sec = r.sections||{};
  return (
    <div>
      <div style={{ display:'flex', gap:16, justifyContent:'center', marginBottom:16, flexWrap:'wrap' }}>
        <ScoreRing score={r.overallScore||0} label="Overall" color="#7C6FCD"/>
        <ScoreRing score={r.atsCompatibility||0} label="ATS" color="#2EC4A0" size={80}/>
        {r.keywordAnalysis?.matchPercentage!=null && <ScoreRing score={r.keywordAnalysis.matchPercentage} label="Keywords" color="#FF7849" size={80}/>}
      </div>
      {r.strengths?.length>0 && <Card title="✅ Strengths" accent="#2EC4A0">{r.strengths.map((s,i)=><div key={i} style={{ fontSize:'0.86rem', color:'#1A2B5C', marginBottom:3 }}>• {s}</div>)}</Card>}
      {Object.keys(sec).length>0 && (
        <Card title="📊 Section Scores" accent="#7C6FCD">
          {Object.entries(sec).map(([k,v])=>(
            <div key={k} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontWeight:700, color:'#1A2B5C', fontSize:'0.83rem', textTransform:'capitalize' }}>{k}</span>
                <span style={{ fontWeight:800, color: v.score>=70?'#2EC4A0':v.score>=50?'#FFB700':'#F44336', fontSize:'0.83rem' }}>{v.score}/100</span>
              </div>
              <div style={{ height:6, background:'#EEE', borderRadius:3, overflow:'hidden' }}>
                <div style={{ width:`${v.score}%`, height:'100%', background: v.score>=70?'#2EC4A0':v.score>=50?'#FFB700':'#F44336', borderRadius:3 }}/>
              </div>
              {v.feedback && <div style={{ fontSize:'0.77rem', color:'#666', marginTop:3 }}>{v.feedback}</div>}
              {v.suggestion && <div style={{ fontSize:'0.77rem', color:'#7C6FCD', marginTop:2, fontStyle:'italic' }}>💡 {v.suggestion}</div>}
              {v.missingSkills?.length>0 && <div style={{ marginTop:3 }}>{v.missingSkills.map(s=><Tag key={s} text={s} color="#FF7849"/>)}</div>}
            </div>
          ))}
        </Card>
      )}
      {r.keywordAnalysis && (
        <Card title="🔑 Keywords" accent="#2196F3">
          {r.keywordAnalysis.found?.length>0 && <div style={{ marginBottom:8 }}><div style={{ fontSize:'0.74rem', fontWeight:700, color:'#4CAF50', marginBottom:3 }}>✓ Found</div>{r.keywordAnalysis.found.map(k=><Tag key={k} text={k} color="#2EC4A0"/>)}</div>}
          {r.keywordAnalysis.missing?.length>0 && <div><div style={{ fontSize:'0.74rem', fontWeight:700, color:'#F44336', marginBottom:3 }}>✗ Missing</div>{r.keywordAnalysis.missing.map(k=><Tag key={k} text={k} color="#FF7849"/>)}</div>}
        </Card>
      )}
      {r.improvements?.length>0 && (
        <Card title="🎯 Action Items" accent="#FF7849">
          {r.improvements.map((imp,i)=>(
            <div key={i} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start' }}>
              <span style={{ padding:'2px 7px', borderRadius:50, fontSize:'0.66rem', fontWeight:800, flexShrink:0, background: imp.priority==='high'?'#FFF0EE':imp.priority==='medium'?'#FFFDE8':'#F0FFF8', color: imp.priority==='high'?'#F44336':imp.priority==='medium'?'#FF9800':'#4CAF50' }}>{imp.priority?.toUpperCase()}</span>
              <div><div style={{ fontWeight:700, color:'#1A2B5C', fontSize:'0.82rem' }}>{imp.area}</div><div style={{ color:'#555', fontSize:'0.81rem', marginTop:2 }}>{imp.suggestion}</div></div>
            </div>
          ))}
        </Card>
      )}
      {r.ariaTip && <AriaBox tip={r.ariaTip}/>}
    </div>
  );
}

function RoastResult({ r }) {
  return (
    <div>
      <div style={{ textAlign:'center', marginBottom:16 }}>
        <div style={{ fontSize:'2.5rem', marginBottom:6 }}>🔥</div>
        <ScoreRing score={r.roastScore||0} label="Resume Score" color="#FF5722" size={100}/>
        {r.overallVerdict && <div style={{ marginTop:8, fontWeight:700, color:'#FF5722', fontSize:'0.93rem', fontStyle:'italic' }}>"{r.overallVerdict}"</div>}
      </div>
      {r.biggestMistake && <div style={{ background:'#FFF0EE', border:'2px solid #FF572230', borderRadius:12, padding:'12px 16px', marginBottom:12 }}><div style={{ fontWeight:800, color:'#FF5722', fontSize:'0.74rem', marginBottom:3 }}>🚨 BIGGEST MISTAKE</div><div style={{ fontSize:'0.86rem', color:'#1A2B5C' }}>{r.biggestMistake}</div></div>}
      {r.burns?.length>0 && (
        <Card title="🔥 The Roast" accent="#FF5722">
          {r.burns.map((b,i)=>(
            <div key={i} style={{ marginBottom:12, paddingLeft:8, borderLeft:'3px solid #FF572250' }}>
              <div style={{ fontWeight:800, color:'#FF5722', fontSize:'0.76rem' }}>{b.section}</div>
              <div style={{ fontSize:'0.84rem', color:'#333', marginTop:2 }}>{b.burn}</div>
              <div style={{ fontSize:'0.81rem', color:'#2EC4A0', marginTop:4, fontWeight:600 }}>✅ Fix: {b.fix}</div>
            </div>
          ))}
        </Card>
      )}
      {r.quickWins?.length>0 && <Card title="⚡ Quick Wins" accent="#2EC4A0">{r.quickWins.map((w,i)=><div key={i} style={{ fontSize:'0.84rem', color:'#1A2B5C', marginBottom:3 }}>• {w}</div>)}</Card>}
      {r.ariaTip && <AriaBox tip={r.ariaTip}/>}
    </div>
  );
}

function CoverLetterResult({ r }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(r.coverLetter||''); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  
  const download = () => {
    const blob = new Blob([r.coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover-letter.txt';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div>
      <Card title="✉️ Your Cover Letter" accent="#FF7849">
        <div style={{ fontSize:'0.86rem', color:'#1A2B5C', lineHeight:1.75, whiteSpace:'pre-wrap' }}>{r.coverLetter}</div>
        <div style={{ display:'flex', gap:8, marginTop:10 }}>
          <button onClick={copy} style={{ padding:'7px 14px', borderRadius:8, border:'none', cursor:'pointer', background: copied?'#2EC4A0':'#FF7849', color:'white', fontWeight:700, fontSize:'0.8rem' }}>{copied?'✓ Copied!':'📋 Copy'}</button>
          <button onClick={download} style={{ padding:'7px 14px', borderRadius:8, border:'none', cursor:'pointer', background:'#7C6FCD', color:'white', fontWeight:700, fontSize:'0.8rem' }}>📥 Download</button>
        </div>
      </Card>
      {r.highlights?.length>0 && <Card title="⭐ Key Highlights" accent="#C8A800">{r.highlights.map((h,i)=><div key={i} style={{ fontSize:'0.84rem', color:'#1A2B5C', marginBottom:3 }}>• {h}</div>)}</Card>}
      {r.keywordsUsed?.length>0 && <Card title="🔑 Keywords Used" accent="#2EC4A0">{r.keywordsUsed.map(k=><Tag key={k} text={k} color="#2EC4A0"/>)}</Card>}
      {r.tips?.length>0 && <Card title="💡 Tips" accent="#7C6FCD">{r.tips.map((t,i)=><div key={i} style={{ fontSize:'0.84rem', color:'#555', marginBottom:3 }}>• {t}</div>)}</Card>}
      {r.ariaTip && <AriaBox tip={r.ariaTip}/>}
    </div>
  );
}

function LinkedInResult({ r }) {
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}><ScoreRing score={r.profileScore||0} label="Profile Score" color="#C8A800" size={100}/></div>
      {r.headline?.suggestions?.length>0 && <Card title="💡 Headline Options" accent="#C8A800">{r.headline.suggestions.map((h,i)=><div key={i} style={{ padding:'8px 12px', background:'#FFFDE8', borderRadius:8, marginBottom:6, fontWeight:600, fontSize:'0.86rem', color:'#1A2B5C' }}>"{h}"</div>)}</Card>}
      {r.aboutSection?.rewrite && <Card title="📝 Rewritten About" accent="#2196F3"><div style={{ fontSize:'0.86rem', color:'#1A2B5C', lineHeight:1.75, whiteSpace:'pre-wrap' }}>{r.aboutSection.rewrite}</div></Card>}
      {r.keywords?.recommended?.length>0 && <Card title="🔑 Keywords" accent="#2EC4A0">{r.keywords.recommended.map(k=><Tag key={k} text={k} color="#2EC4A0"/>)}</Card>}
      {r.recruiterTips?.length>0 && <Card title="🎯 Recruiter Tips" accent="#7C6FCD">{r.recruiterTips.map((t,i)=><div key={i} style={{ fontSize:'0.84rem', color:'#555', marginBottom:4 }}>• {t}</div>)}</Card>}
      {r.ariaTip && <AriaBox tip={r.ariaTip}/>}
    </div>
  );
}

function SalaryResult({ r }) {
  return (
    <div>
      {r.salaryRange && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:14 }}>
          {[['Min',r.salaryRange.min,'#2196F3'],['Median',r.salaryRange.median,'#7C6FCD'],['Max',r.salaryRange.max,'#2EC4A0']].map(([lbl,val,c])=>(
            <div key={lbl} style={{ background:c+'10', border:`1.5px solid ${c}30`, borderRadius:12, padding:12, textAlign:'center' }}>
              <div style={{ fontSize:'0.68rem', fontWeight:800, color:c, marginBottom:4 }}>{lbl}</div>
              <div style={{ fontWeight:800, fontSize:'0.98rem', color:'#1A2B5C' }}>{val}</div>
            </div>
          ))}
        </div>
      )}
      {r.marketAnalysis && <Card title="📊 Market Analysis" accent="#2196F3"><div style={{ fontSize:'0.86rem', color:'#444', lineHeight:1.7 }}>{r.marketAnalysis}</div></Card>}
      {r.negotiationScripts?.map((s,i)=>(
        <Card key={i} title={`🗣️ ${s.scenario}`} accent="#7C6FCD">
          <div style={{ fontSize:'0.86rem', color:'#1A2B5C', lineHeight:1.7, fontStyle:'italic', background:'#F5F4FF', padding:'10px 12px', borderRadius:8 }}>"{s.script}"</div>
        </Card>
      ))}
      {r.strategies?.length>0 && <Card title="💡 Strategies" accent="#2EC4A0">{r.strategies.map((s,i)=><div key={i} style={{ fontSize:'0.84rem', color:'#444', marginBottom:4 }}>• {s}</div>)}</Card>}
      {r.ariaTip && <AriaBox tip={r.ariaTip}/>}
    </div>
  );
}

function InterviewResult({ r }) {
  const [exp, setExp] = useState(null);
  return (
    <div>
      {r.questions?.map((q,i)=>(
        <div key={i} style={{ border:'1.5px solid #E8E4F8', borderRadius:12, marginBottom:10, overflow:'hidden' }}>
          <button onClick={()=>setExp(exp===i?null:i)} style={{ width:'100%', padding:'11px 14px', background: exp===i?'#F5F4FF':'white', border:'none', textAlign:'left', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', gap:5, marginBottom:4 }}><Tag text={q.category} color={q.category==='behavioral'?'#FF7849':'#2196F3'}/><Tag text={q.difficulty||'medium'} color={q.difficulty==='hard'?'#F44336':'#FF9800'}/></div>
              <div style={{ fontWeight:700, color:'#1A2B5C', fontSize:'0.86rem' }}>{q.question}</div>
            </div>
            <span style={{ color:'#7C6FCD', marginLeft:8 }}>{exp===i?'▲':'▼'}</span>
          </button>
          {exp===i && q.starGuide && (
            <div style={{ padding:'0 14px 14px', background:'#FAFAFE' }}>
              {Object.entries(q.starGuide).map(([k,v])=>(
                <div key={k} style={{ marginBottom:5 }}><span style={{ fontWeight:800, color:'#7C6FCD', textTransform:'uppercase', fontSize:'0.7rem' }}>{k}: </span><span style={{ fontSize:'0.82rem', color:'#444' }}>{v}</span></div>
              ))}
              {q.tips && <div style={{ marginTop:7, padding:'7px 10px', background:'#FFF8E8', borderRadius:8, fontSize:'0.8rem', color:'#8B6800' }}>💡 {q.tips}</div>}
            </div>
          )}
        </div>
      ))}
      {r.questionsToAsk?.length>0 && <Card title="❓ Ask the Interviewer" accent="#2EC4A0">{r.questionsToAsk.map((q,i)=><div key={i} style={{ fontSize:'0.84rem', color:'#1A2B5C', marginBottom:4 }}>• {q}</div>)}</Card>}
      {r.ariaTip && <AriaBox tip={r.ariaTip}/>}
    </div>
  );
}

function MockInterviewResult({ r }) {
  const [exp, setExp] = useState(null);
  return (
    <div>
      {r.interviewTitle && <div style={{ textAlign:'center', fontFamily:"'Boogaloo',cursive", fontSize:'1.2rem', color:'#9C27B0', marginBottom:14 }}>{r.interviewTitle}</div>}
      {r.rounds?.map((round,ri)=>(
        <Card key={ri} title={`🎤 ${round.roundName}`} accent="#9C27B0">
          {round.questions?.map((q,qi)=>(
            <div key={qi} style={{ border:'1.5px solid #E8E4F8', borderRadius:10, marginBottom:8, overflow:'hidden' }}>
              <button onClick={()=>setExp(exp===`${ri}-${qi}`?null:`${ri}-${qi}`)} style={{ width:'100%', padding:'10px 13px', background: exp===`${ri}-${qi}`?'#F9F0FF':'white', border:'none', textAlign:'left', cursor:'pointer', display:'flex', justifyContent:'space-between' }}>
                <div><Tag text={q.type} color="#9C27B0"/><div style={{ fontWeight:700, color:'#1A2B5C', fontSize:'0.85rem', marginTop:4 }}>{q.q}</div></div>
                <span style={{ color:'#9C27B0' }}>{exp===`${ri}-${qi}`?'▲':'▼'}</span>
              </button>
              {exp===`${ri}-${qi}` && (
                <div style={{ padding:'0 13px 13px', background:'#FAFAFE' }}>
                  <div style={{ marginBottom:5 }}><span style={{ fontWeight:800, color:'#2EC4A0', fontSize:'0.72rem' }}>GREAT ANSWER: </span><span style={{ fontSize:'0.82rem', color:'#444' }}>{q.expectedAnswer}</span></div>
                  <div style={{ marginBottom:5 }}><span style={{ fontWeight:800, color:'#9C27B0', fontSize:'0.72rem' }}>FOLLOW-UP: </span><span style={{ fontSize:'0.82rem', color:'#444', fontStyle:'italic' }}>{q.followUp}</span></div>
                  <div><span style={{ fontWeight:800, color:'#F44336', fontSize:'0.72rem' }}>AVOID: </span><span style={{ fontSize:'0.82rem', color:'#888' }}>{q.redFlag}</span></div>
                </div>
              )}
            </div>
          ))}
        </Card>
      ))}
      {r.tips?.length>0 && <Card title="💡 Tips" accent="#2EC4A0">{r.tips.map((t,i)=><div key={i} style={{ fontSize:'0.84rem', color:'#444', marginBottom:4 }}>• {t}</div>)}</Card>}
      {r.ariaTip && <AriaBox tip={r.ariaTip}/>}
    </div>
  );
}

function SkillGapResult({ r }) {
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}><ScoreRing score={r.gapScore||0} label="Readiness" color="#0288D1" size={100}/></div>
      {r.currentLevel && <div style={{ textAlign:'center', color:'#555', fontSize:'0.86rem', marginBottom:14 }}>{r.currentLevel}</div>}
      {r.skillCategories?.map((cat,i)=>(
        <Card key={i} title={cat.category} accent={cat.priority==='high'?'#F44336':cat.priority==='medium'?'#FF9800':'#4CAF50'}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><div style={{ fontSize:'0.7rem', fontWeight:700, color:'#2EC4A0', marginBottom:3 }}>YOU HAVE ✓</div>{cat.have?.map(s=><Tag key={s} text={s} color="#2EC4A0"/>)}</div>
            <div><div style={{ fontSize:'0.7rem', fontWeight:700, color:'#F44336', marginBottom:3 }}>YOU NEED →</div>{cat.need?.map(s=><Tag key={s} text={s} color="#F44336"/>)}</div>
          </div>
        </Card>
      ))}
      {r.learningPath?.length>0 && (
        <Card title="📚 Learning Path" accent="#0288D1">
          {r.learningPath.map((l,i)=>(
            <div key={i} style={{ marginBottom:10, paddingLeft:8, borderLeft:'3px solid #0288D130' }}>
              <div style={{ fontWeight:800, color:'#1A2B5C', fontSize:'0.85rem' }}>{l.skill} <span style={{ color:'#FF9800', fontWeight:600, fontSize:'0.74rem' }}>⏱ {l.timeToLearn}</span></div>
              <div style={{ fontSize:'0.79rem', color:'#555', marginTop:2 }}>📖 {l.resource}</div>
              <div style={{ fontSize:'0.77rem', color:'#2EC4A0', marginTop:2 }}>Why: {l.why}</div>
            </div>
          ))}
        </Card>
      )}
      {r.timeToReady && <div style={{ textAlign:'center', background:'#E3F2FD', borderRadius:12, padding:'11px', marginTop:10, fontWeight:700, color:'#1565C0', fontSize:'0.9rem' }}>🎯 Ready in: {r.timeToReady}</div>}
      {r.ariaTip && <AriaBox tip={r.ariaTip}/>}
    </div>
  );
}

function RoadmapResult({ r }) {
  return (
    <div>
      {r.roadmapTitle && <div style={{ textAlign:'center', fontFamily:"'Boogaloo',cursive", fontSize:'1.3rem', color:'#E91E8C', marginBottom:8 }}>{r.roadmapTitle}</div>}
      {r.summary && <div style={{ color:'#555', fontSize:'0.87rem', textAlign:'center', marginBottom:14, lineHeight:1.6 }}>{r.summary}</div>}
      {r.skillsGap && (
        <Card title="📊 Skills Gap" accent="#FF7849">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><div style={{ fontWeight:700, color:'#2EC4A0', fontSize:'0.72rem', marginBottom:3 }}>YOU HAVE ✓</div>{r.skillsGap.have?.map(s=><Tag key={s} text={s} color="#2EC4A0"/>)}</div>
            <div><div style={{ fontWeight:700, color:'#FF7849', fontSize:'0.72rem', marginBottom:3 }}>YOU NEED →</div>{r.skillsGap.need?.map(s=><Tag key={s} text={s} color="#FF7849"/>)}</div>
          </div>
        </Card>
      )}
      {r.phases?.map((phase,i)=>(
        <div key={i} style={{ display:'flex', gap:12, marginBottom:10, alignItems:'flex-start' }}>
          <div style={{ width:34, height:34, borderRadius:'50%', background:'#E91E8C', color:'white', fontWeight:800, fontSize:'0.88rem', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{phase.phase}</div>
          <div style={{ flex:1, border:'1.5px solid #FCE4EC', borderRadius:12, padding:'11px 14px' }}>
            <div style={{ fontWeight:800, color:'#1A2B5C', fontSize:'0.88rem' }}>{phase.title}</div>
            <div style={{ color:'#E91E8C', fontSize:'0.74rem', fontWeight:700, marginBottom:5 }}>⏱ {phase.duration}</div>
            {phase.goals?.map((g,j)=><div key={j} style={{ fontSize:'0.82rem', color:'#444', marginBottom:3 }}>• {g}</div>)}
            {phase.milestone && <div style={{ marginTop:5, padding:'6px 10px', background:'#FFF0F6', borderRadius:8, fontSize:'0.79rem', color:'#C2185B', fontWeight:600 }}>🏁 {phase.milestone}</div>}
          </div>
        </div>
      ))}
      {r.ariaTip && <AriaBox tip={r.ariaTip}/>}
    </div>
  );
}

function CareerPathsResult({ r }) {
  return (
    <div>
      {r.paths?.map((p,i)=>(
        <Card key={i} title={`${p.emoji||'🚀'} ${p.title}`} accent="#FF9800">
          <div style={{ fontSize:'0.84rem', color:'#555', lineHeight:1.6, marginBottom:8 }}>{p.description}</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:8 }}>
            {[['💰',p.avgSalary],['⏱',p.timeToEntry],['📈',(p.demandLevel||'')+ ' demand']].map(([icon,val])=>(
              <div key={icon} style={{ background:'#FFF8F0', borderRadius:8, padding:'7px', textAlign:'center' }}>
                <div style={{ fontSize:'0.9rem' }}>{icon}</div>
                <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#1A2B5C' }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom:7 }}><div style={{ fontSize:'0.7rem', fontWeight:700, color:'#FF9800', marginBottom:3 }}>KEY SKILLS</div>{p.keySkills?.map(s=><Tag key={s} text={s} color="#FF9800"/>)}</div>
          <div style={{ background:'#FFF8F0', borderRadius:8, padding:'7px 12px', fontSize:'0.81rem', color:'#E65100' }}>👉 First step: {p.firstStep}</div>
        </Card>
      ))}
      {r.bestFit && <div style={{ background:'#E8F5E9', border:'1.5px solid #A5D6A7', borderRadius:12, padding:'11px 16px', marginTop:8, fontSize:'0.86rem', color:'#1B5E20', fontWeight:600 }}>🏆 Best fit for you: {r.bestFit}</div>}
      {r.ariaTip && <AriaBox tip={r.ariaTip}/>}
    </div>
  );
}

function ColdEmailResult({ r }) {
  const [tab, setTab] = useState('email');
  const [copied, setCopied] = useState(false);
  const content = tab==='email'?r.message:tab==='linkedin'?r.linkedinVersion:r.followUpMessage;
  const copy = () => { navigator.clipboard.writeText(content||''); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  
  const download = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cold-email-${tab}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div>
      {r.subject && <div style={{ background:'#FFF3F0', border:'1.5px solid #FF552230', borderRadius:10, padding:'9px 14px', marginBottom:12, fontWeight:700, color:'#FF5722', fontSize:'0.86rem' }}>📌 Subject: {r.subject}</div>}
      <div style={{ display:'flex', gap:6, marginBottom:10 }}>
        {[['email','📧 Email'],['linkedin','💼 LinkedIn'],['followup','🔄 Follow-up']].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ padding:'6px 12px', borderRadius:8, border:`1.5px solid ${tab===id?'#FF5722':'#E8E4F8'}`, background: tab===id?'#FF5722':'white', color: tab===id?'white':'#555', fontWeight:700, fontSize:'0.76rem', cursor:'pointer' }}>{lbl}</button>
        ))}
      </div>
      <div style={{ background:'#FAFAFE', border:'1.5px solid #E8E4F8', borderRadius:12, padding:'13px 15px', fontSize:'0.86rem', color:'#1A2B5C', lineHeight:1.75, whiteSpace:'pre-wrap', marginBottom:10 }}>{content}</div>
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={copy} style={{ padding:'7px 14px', borderRadius:8, border:'none', cursor:'pointer', background: copied?'#2EC4A0':'#FF5722', color:'white', fontWeight:700, fontSize:'0.8rem' }}>{copied?'✓ Copied!':'📋 Copy'}</button>
        <button onClick={download} style={{ padding:'7px 14px', borderRadius:8, border:'none', cursor:'pointer', background:'#7C6FCD', color:'white', fontWeight:700, fontSize:'0.8rem' }}>📥 Download</button>
      </div>
      {r.tips?.length>0 && <Card title="💡 Tips" accent="#FF5722">{r.tips.map((t,i)=><div key={i} style={{ fontSize:'0.84rem', color:'#444', marginBottom:3 }}>• {t}</div>)}</Card>}
      {r.ariaTip && <AriaBox tip={r.ariaTip}/>}
    </div>
  );
}

function ScamResult({ r }) {
  const colors = { safe:'#2EC4A0', caution:'#FF9800', danger:'#F44336' };
  const c = colors[r.verdict]||'#999';
  return (
    <div>
      <div style={{ textAlign:'center', marginBottom:16 }}>
        <div style={{ fontSize:'2.5rem', marginBottom:6 }}>{r.verdict==='safe'?'✅':r.verdict==='caution'?'⚠️':'🚨'}</div>
        <ScoreRing score={r.safetyScore||0} size={100} label="Safety Score" color={c}/>
        <div style={{ marginTop:8, fontWeight:800, color:c, fontSize:'0.98rem', textTransform:'uppercase' }}>{r.verdict}</div>
        {r.companyName!=='Unknown' && <div style={{ color:'#888', fontSize:'0.81rem', marginTop:3 }}>{r.companyName} · {r.roleName}</div>}
      </div>
      {r.redFlags?.length>0 && (
        <Card title="🚩 Red Flags" accent="#F44336">
          {r.redFlags.map((f,i)=>(
            <div key={i} style={{ marginBottom:8, paddingLeft:8, borderLeft:`3px solid ${f.severity==='critical'?'#F44336':f.severity==='warning'?'#FF9800':'#2196F3'}` }}>
              <div style={{ fontWeight:700, color:'#1A2B5C', fontSize:'0.84rem' }}>{f.flag}</div>
              <div style={{ color:'#666', fontSize:'0.79rem', marginTop:2 }}>{f.explanation}</div>
            </div>
          ))}
        </Card>
      )}
      {r.greenFlags?.length>0 && <Card title="✅ Green Flags" accent="#2EC4A0">{r.greenFlags.map((f,i)=><div key={i} style={{ fontSize:'0.84rem', color:'#444', marginBottom:3 }}>✓ {f.flag} — <span style={{ color:'#666' }}>{f.explanation}</span></div>)}</Card>}
      {r.recommendations?.length>0 && <Card title="📋 Recommendations" accent="#7C6FCD">{r.recommendations.map((rec,i)=><div key={i} style={{ fontSize:'0.84rem', color:'#444', marginBottom:3 }}>• {rec}</div>)}</Card>}
      {r.ariaTip && <AriaBox tip={r.ariaTip}/>}
    </div>
  );
}

// ════ Main ToolModal ════
export default function ToolModal({ toolId, token, onClose, showToast }) {
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc]     = useState('');
  const [tone, setTone]           = useState('professional');
  const [headline, setHeadline]   = useState('');
  const [about, setAbout]         = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills]       = useState('');
  const [industry, setIndustry]   = useState('');
  const [role, setRole]           = useState('');
  const [company, setCompany]     = useState('');
  const [location, setLocation]   = useState('');
  const [currentSalary, setCurrentSalary] = useState('');
  const [expLevel, setExpLevel]   = useState('');
  const [dreamRole, setDreamRole] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [timeline, setTimeline]   = useState('6 months');
  const [targetName, setTargetName] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [background, setBackground] = useState('');
  const [msgType, setMsgType]     = useState('cold email');
  const [jobOffer, setJobOffer]   = useState('');
  const [useFile, setUseFile]     = useState(true);

  if (!toolId) return null;
  const meta = TOOL_META[toolId] || { title: toolId, color: '#7C6FCD', bg: '#F5F4FF' };

  const S = {
    overlay: { position:'fixed', inset:0, background:'rgba(20,30,70,0.55)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(6px)' },
    modal: { background:'white', borderRadius:24, width:'100%', maxWidth:700, maxHeight:'92vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 32px 80px rgba(0,0,0,0.25)' },
    header: { background:meta.bg, borderBottom:`2px solid ${meta.color}33`, padding:'17px 22px', display:'flex', alignItems:'center', justifyContent:'space-between' },
    title: { fontFamily:"'Boogaloo',cursive", fontSize:'1.4rem', color:'#1A2B5C' },
    close: { width:33, height:33, borderRadius:'50%', background:'rgba(0,0,0,0.1)', border:'none', fontSize:'0.95rem', cursor:'pointer' },
    body: { flex:1, overflowY:'auto', padding:22 },
    label: { display:'block', fontSize:'0.72rem', fontWeight:800, color:'#1A2B5C', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.3px' },
    input: { width:'100%', padding:'10px 13px', borderRadius:11, border:'1.5px solid #E8E4F8', fontFamily:"'Quicksand',sans-serif", fontSize:'0.87rem', fontWeight:600, color:'#1A2B5C', outline:'none', marginBottom:12, boxSizing:'border-box' },
    textarea: { width:'100%', padding:'10px 13px', borderRadius:11, border:'1.5px solid #E8E4F8', fontFamily:"'Quicksand',sans-serif", fontSize:'0.85rem', fontWeight:500, color:'#1A2B5C', outline:'none', resize:'vertical', marginBottom:12, lineHeight:1.6, boxSizing:'border-box' },
    row: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
    btn: { width:'100%', padding:13, background:`linear-gradient(135deg,${meta.color},${meta.color}CC)`, color:'white', border:'none', borderRadius:13, fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:'0.97rem', cursor: loading?'not-allowed':'pointer', boxShadow:`0 4px 16px ${meta.color}44`, marginBottom:14, opacity: loading?0.75:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 },
    toggle: { display:'flex', gap:6, marginBottom:10 },
    toggleBtn: (active) => ({ padding:'6px 13px', borderRadius:8, border:`1.5px solid ${active?meta.color:'#E8E4F8'}`, background: active?meta.color+'15':'white', color: active?meta.color:'#888', fontWeight:700, fontSize:'0.77rem', cursor:'pointer' }),
    select: { width:'100%', padding:'10px 13px', borderRadius:11, border:'1.5px solid #E8E4F8', fontFamily:"'Quicksand',sans-serif", fontSize:'0.87rem', fontWeight:600, color:'#1A2B5C', outline:'none', marginBottom:12, background:'white' },
  };

  const spinner = <span style={{ width:17, height:17, border:'2.5px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }}/>;

  const call = async (endpoint, bodyData, isForm=false) => {
    setLoading(true); setResult(null); setError('');
    try {
      let body, headers = { Authorization:`Bearer ${token}` };
      if (isForm) { body=bodyData; } else { headers['Content-Type']='application/json'; body=JSON.stringify(bodyData); }
      const res = await fetch(`${API}/api/tools/${endpoint}`, { method:'POST', headers, body });
      const data = await res.json();
      if (!res.ok) setError(data.error||'Something went wrong.');
      else { 
        setResult(data.result); 
        showToast?.('✅ Done!','Results ready below','🦉');
        
        // Auto-save resume analysis results
        if ((endpoint === 'resume' || endpoint === 'roast') && data.result) {
          try {
            saveResumeVersion(resumeText || resumeFile?.name, data.result);
          } catch (e) {
            console.log('Could not auto-save resume version:', e);
          }
        }
      }
    } catch { setError('Network error — please check your connection and try again.'); }
    setLoading(false);
  };

  const buildFD = (fields, file) => {
    const fd = new FormData();
    Object.entries(fields).forEach(([k,v])=>{ if(v) fd.append(k,v); });
    if (file) fd.append('resume', file);
    return fd;
  };

  const ResumeInput = () => (
    <div>
      <div style={S.toggle}>
        <button style={S.toggleBtn(useFile)} onClick={()=>setUseFile(true)}>📁 Upload File</button>
        <button style={S.toggleBtn(!useFile)} onClick={()=>setUseFile(false)}>📝 Paste Text</button>
      </div>
      {useFile ? <FileUploadZone onFile={setResumeFile} file={resumeFile}/> : <textarea style={{...S.textarea, minHeight:140}} value={resumeText} onChange={e=>setResumeText(e.target.value)} placeholder="Paste your resume content here..."/>}
    </div>
  );

  const submitResume = (endpoint, extra={}) => {
    if (!resumeFile && !resumeText.trim()) { setError('Please upload a resume file or paste text.'); return; }
    if (resumeFile) call(endpoint, buildFD(extra, resumeFile), true);
    else call(endpoint, { resumeText, ...extra });
  };

  const renderForm = () => {
    switch (toolId) {
      case 'resume': return <>
        <label style={S.label}>Resume *</label><ResumeInput/>
        <label style={S.label}>Job Description (Optional — for keyword matching)</label>
        <textarea style={{...S.textarea, minHeight:90}} value={jobDesc} onChange={e=>setJobDesc(e.target.value)} placeholder="Paste the job description to match against..."/>
        <button style={S.btn} onClick={()=>submitResume('resume',{jobDescription:jobDesc})}>{loading?spinner:'📄 Analyze My Resume'}</button>
      </>;

      case 'roast': return <>
        <label style={S.label}>Resume *</label><ResumeInput/>
        <button style={S.btn} onClick={()=>submitResume('roast')}>{loading?spinner:'🔥 Roast My Resume'}</button>
      </>;

      case 'cover': return <>
        <label style={S.label}>Resume *</label><ResumeInput/>
        <label style={S.label}>Job Description *</label>
        <textarea style={{...S.textarea, minHeight:100}} value={jobDesc} onChange={e=>setJobDesc(e.target.value)} placeholder="Paste the job description..."/>
        <label style={S.label}>Tone</label>
        <select style={S.select} value={tone} onChange={e=>setTone(e.target.value)}>{['professional','enthusiastic','formal','creative','concise'].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}</select>
        <button style={S.btn} onClick={()=>{ if(!jobDesc.trim()){setError('Job description required.');return;} submitResume('cover-letter',{jobDescription:jobDesc,tone}); }}>{loading?spinner:'✉️ Generate Cover Letter'}</button>
      </>;

      case 'linkedin': return <>
        <label style={S.label}>Current Headline *</label>
        <input style={S.input} value={headline} onChange={e=>setHeadline(e.target.value)} placeholder="e.g. B.Tech Student | Aspiring SDE"/>
        <label style={S.label}>About / Summary *</label>
        <textarea style={{...S.textarea,minHeight:110}} value={about} onChange={e=>setAbout(e.target.value)} placeholder="Paste your current LinkedIn About section..."/>
        <div style={S.row}>
          <div><label style={S.label}>Skills</label><input style={S.input} value={skills} onChange={e=>setSkills(e.target.value)} placeholder="Python, React..."/></div>
          <div><label style={S.label}>Industry</label><input style={S.input} value={industry} onChange={e=>setIndustry(e.target.value)} placeholder="e.g. Tech, Finance..."/></div>
        </div>
        <button style={S.btn} onClick={()=>{ if(!headline&&!about){setError('Provide headline or about.');return;} call('linkedin',{headline,about,experience,skills,industry}); }}>{loading?spinner:'💼 Optimize LinkedIn'}</button>
      </>;

      case 'salary': return <>
        <div style={S.row}>
          <div><label style={S.label}>Job Role *</label><input style={S.input} value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Software Engineer"/></div>
          <div><label style={S.label}>Location *</label><input style={S.input} value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Bangalore"/></div>
        </div>
        <div style={S.row}>
          <div><label style={S.label}>Experience</label><input style={S.input} value={experience} onChange={e=>setExperience(e.target.value)} placeholder="e.g. 2 years / Fresher"/></div>
          <div><label style={S.label}>Company Type</label><select style={S.select} value={expLevel} onChange={e=>setExpLevel(e.target.value)}>{['','Startup','MNC','Product Company','Service Company'].map(t=><option key={t} value={t}>{t||'Select...'}</option>)}</select></div>
        </div>
        <div style={S.row}>
          <div><label style={S.label}>Current Salary</label><input style={S.input} value={currentSalary} onChange={e=>setCurrentSalary(e.target.value)} placeholder="e.g. ₹4 LPA"/></div>
          <div><label style={S.label}>Key Skills</label><input style={S.input} value={skills} onChange={e=>setSkills(e.target.value)} placeholder="React, Node..."/></div>
        </div>
        <button style={S.btn} onClick={()=>{ if(!role||!location){setError('Role and location required.');return;} call('salary',{role,experience,location,currentSalary,companyType:expLevel,skills}); }}>{loading?spinner:'💸 Get Salary Insights'}</button>
      </>;

      case 'interview': return <>
        <label style={S.label}>Target Role *</label>
        <input style={S.input} value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Frontend Developer"/>
        <div style={S.row}>
          <div><label style={S.label}>Company</label><input style={S.input} value={company} onChange={e=>setCompany(e.target.value)} placeholder="e.g. Google, Infosys"/></div>
          <div><label style={S.label}>Experience Level</label><select style={S.select} value={expLevel} onChange={e=>setExpLevel(e.target.value)}>{['','Fresher','Mid-level (2-5 yrs)','Senior (5+ yrs)'].map(t=><option key={t} value={t}>{t||'Select...'}</option>)}</select></div>
        </div>
        <div style={S.row}>
          <div><label style={S.label}>Question Type</label><select style={S.select} value={industry} onChange={e=>setIndustry(e.target.value)}>{['','Both (recommended)','Technical only','Behavioral only'].map(t=><option key={t} value={t}>{t||'Both (recommended)'}</option>)}</select></div>
          <div><label style={S.label}>Industry</label><input style={S.input} value={skills} onChange={e=>setSkills(e.target.value)} placeholder="e.g. IT, Banking..."/></div>
        </div>
        <button style={S.btn} onClick={()=>{ if(!role){setError('Please specify the role.');return;} call('interview',{role,company,experienceLevel:expLevel,type:industry}); }}>{loading?spinner:'🎯 Generate Questions'}</button>
      </>;

      case 'mockinterview': return <>
        <label style={S.label}>Target Role *</label>
        <input style={S.input} value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Software Engineer"/>
        <div style={S.row}>
          <div><label style={S.label}>Company</label><input style={S.input} value={company} onChange={e=>setCompany(e.target.value)} placeholder="e.g. Google, TCS..."/></div>
          <div><label style={S.label}>Level</label><select style={S.select} value={expLevel} onChange={e=>setExpLevel(e.target.value)}>{['Fresher','Junior (1-2 yrs)','Mid-level (3-5 yrs)','Senior (5+ yrs)'].map(t=><option key={t}>{t}</option>)}</select></div>
        </div>
        <label style={S.label}>Interview Round</label>
        <select style={S.select} value={industry} onChange={e=>setIndustry(e.target.value)}>{['HR + Technical','HR only','Technical only','Managerial Round'].map(t=><option key={t}>{t}</option>)}</select>
        <button style={S.btn} onClick={()=>{ if(!role){setError('Please specify the role.');return;} call('mock-interview',{role,company,level:expLevel,round:industry}); }}>{loading?spinner:'🎤 Start Mock Interview'}</button>
      </>;

      case 'skillgap': return <>
        <label style={S.label}>Target Role *</label>
        <input style={S.input} value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Data Scientist, Full Stack Dev..."/>
        <label style={S.label}>Your Current Skills</label>
        <input style={S.input} value={skills} onChange={e=>setSkills(e.target.value)} placeholder="Python, HTML, Excel... (comma separated)"/>
        <div style={S.row}>
          <div><label style={S.label}>Experience Level</label><select style={S.select} value={expLevel} onChange={e=>setExpLevel(e.target.value)}>{['Fresher','1-2 years','3-5 years','5+ years'].map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label style={S.label}>Industry</label><input style={S.input} value={industry} onChange={e=>setIndustry(e.target.value)} placeholder="e.g. Tech, Finance..."/></div>
        </div>
        <button style={S.btn} onClick={()=>{ if(!role){setError('Please specify your target role.');return;} call('skill-gap',{targetRole:role,currentSkills:skills,experienceLevel:expLevel,industry}); }}>{loading?spinner:'📊 Analyze Skill Gap'}</button>
      </>;

      case 'roadmap': return <>
        <label style={S.label}>Dream Role *</label>
        <input style={S.input} value={dreamRole} onChange={e=>setDreamRole(e.target.value)} placeholder="e.g. Data Scientist at a startup"/>
        <div style={S.row}>
          <div><label style={S.label}>Current Status</label><input style={S.input} value={currentRole} onChange={e=>setCurrentRole(e.target.value)} placeholder="e.g. Final year B.Tech student"/></div>
          <div><label style={S.label}>Timeline</label><select style={S.select} value={timeline} onChange={e=>setTimeline(e.target.value)}>{['3 months','6 months','1 year','2 years'].map(t=><option key={t}>{t}</option>)}</select></div>
        </div>
        <label style={S.label}>Current Skills</label>
        <input style={S.input} value={currentSkills} onChange={e=>setCurrentSkills(e.target.value)} placeholder="Python, HTML, SQL..."/>
        <label style={S.label}>Education</label>
        <input style={S.input} value={experience} onChange={e=>setExperience(e.target.value)} placeholder="e.g. B.Tech CSE from XYZ"/>
        <button style={S.btn} onClick={()=>{ if(!dreamRole){setError('Please specify your dream role.');return;} call('roadmap',{dreamRole,currentRole,currentSkills,education:experience,timeline}); }}>{loading?spinner:'🗺️ Build My Roadmap'}</button>
      </>;

      case 'careerpaths': return <>
        <label style={S.label}>Your Background</label>
        <textarea style={{...S.textarea,minHeight:80}} value={resumeText} onChange={e=>setResumeText(e.target.value)} placeholder="e.g. B.Tech CSE student, built web apps, interested in AI..."/>
        <label style={S.label}>Current Skills</label>
        <input style={S.input} value={skills} onChange={e=>setSkills(e.target.value)} placeholder="Python, React, SQL..."/>
        <div style={S.row}>
          <div><label style={S.label}>Interests</label><input style={S.input} value={industry} onChange={e=>setIndustry(e.target.value)} placeholder="e.g. AI, finance, gaming..."/></div>
          <div><label style={S.label}>Experience</label><select style={S.select} value={expLevel} onChange={e=>setExpLevel(e.target.value)}>{['Fresher','1-2 years','3-5 years','5+ years'].map(t=><option key={t}>{t}</option>)}</select></div>
        </div>
        <label style={S.label}>Education</label>
        <input style={S.input} value={experience} onChange={e=>setExperience(e.target.value)} placeholder="e.g. B.Tech CSE, MBA Finance..."/>
        <button style={S.btn} onClick={()=>call('career-paths',{background:resumeText,currentSkills:skills,interests:industry,education:experience,experience:expLevel})}>{loading?spinner:'🚀 Discover Career Paths'}</button>
      </>;

      case 'coldemail': return <>
        <div style={S.row}>
          <div><label style={S.label}>Target Person</label><input style={S.input} value={targetName} onChange={e=>setTargetName(e.target.value)} placeholder="e.g. Priya Sharma"/></div>
          <div><label style={S.label}>Target Company *</label><input style={S.input} value={targetCompany} onChange={e=>setTargetCompany(e.target.value)} placeholder="e.g. Google India"/></div>
        </div>
        <div style={S.row}>
          <div><label style={S.label}>Their Role</label><input style={S.input} value={targetRole} onChange={e=>setTargetRole(e.target.value)} placeholder="e.g. Engineering Manager"/></div>
          <div><label style={S.label}>Message Type</label><select style={S.select} value={msgType} onChange={e=>setMsgType(e.target.value)}>{['cold email','referral request','informational interview','job inquiry'].map(t=><option key={t}>{t}</option>)}</select></div>
        </div>
        <label style={S.label}>Your Background</label>
        <textarea style={{...S.textarea,minHeight:80}} value={background} onChange={e=>setBackground(e.target.value)} placeholder="e.g. B.Tech CSE, interested in SDE role, built XYZ projects..."/>
        <button style={S.btn} onClick={()=>{ if(!targetCompany){setError('Target company required.');return;} call('cold-email',{targetName,targetCompany,targetRole,yourBackground:background,messageType:msgType}); }}>{loading?spinner:'🔗 Generate Email'}</button>
      </>;

      case 'scam': return <>
        <label style={S.label}>Paste Job Offer / Posting *</label>
        <textarea style={{...S.textarea,minHeight:180}} value={jobOffer} onChange={e=>setJobOffer(e.target.value)} placeholder="Paste the full job offer, email, or posting here. Include salary, requirements, company name, everything..."/>
        <button style={S.btn} onClick={()=>{ if(!jobOffer.trim()||jobOffer.trim().length<20){setError('Please paste a complete job posting.');return;} call('scam-check',{jobDescription:jobOffer}); }}>{loading?spinner:'🔍 Check for Scams'}</button>
      </>;

      default: return <p>Tool coming soon!</p>;
    }
  };

  const renderResult = () => {
    if (!result) return null;
    switch (toolId) {
      case 'resume':        return <ResumeResult r={result}/>;
      case 'roast':         return <RoastResult r={result}/>;
      case 'cover':         return <CoverLetterResult r={result}/>;
      case 'linkedin':      return <LinkedInResult r={result}/>;
      case 'salary':        return <SalaryResult r={result}/>;
      case 'interview':     return <InterviewResult r={result}/>;
      case 'mockinterview': return <MockInterviewResult r={result}/>;
      case 'skillgap':      return <SkillGapResult r={result}/>;
      case 'roadmap':       return <RoadmapResult r={result}/>;
      case 'careerpaths':   return <CareerPathsResult r={result}/>;
      case 'coldemail':     return <ColdEmailResult r={result}/>;
      case 'scam':          return <ScamResult r={result}/>;
      default: return <pre style={{ fontSize:'0.8rem', whiteSpace:'pre-wrap' }}>{JSON.stringify(result,null,2)}</pre>;
    }
  };

  return (
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.modal}>
        <div style={S.header}>
          <div style={S.title}>{meta.title}</div>
          <button style={S.close} onClick={onClose}>✕</button>
        </div>
        <div style={S.body}>
          {renderForm()}
          {error && <div style={{ background:'#FFF0EE', border:'1.5px solid #FFCCBB', borderRadius:12, padding:'11px 15px', color:'#C62828', fontSize:'0.86rem', fontWeight:600, marginBottom:14 }}>⚠️ {error}</div>}
          {loading && (
            <div style={{ textAlign:'center', padding:'22px 0', color:'#7C6FCD' }}>
              <div style={{ fontSize:'2rem', marginBottom:7 }}>🦉</div>
              <div style={{ fontWeight:700, fontSize:'0.9rem' }}>Aria is thinking...</div>
              <div style={{ color:'#999', fontSize:'0.78rem', marginTop:3 }}>Usually takes 5-15 seconds</div>
            </div>
          )}
          {renderResult()}
        </div>
      </div>
    </div>
  );
}
