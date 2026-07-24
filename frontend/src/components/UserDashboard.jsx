import React, { useState, useEffect } from 'react';
import { GuardianMini } from './GuardianSVG';

export default function UserDashboard({ user, token, onClose }) {
  const [stats, setStats] = useState({
    resumesAnalyzed: 0,
    interviewsPracticed: 0,
    coverLettersGenerated: 0,
    careerScore: 75
  });
  
  const [recentActivity, setRecentActivity] = useState([
    { type: 'resume', title: 'Resume Analysis', date: '2 hours ago', result: 'Score: 85/100' },
    { type: 'interview', title: 'Mock Interview', date: '1 day ago', result: 'Score: 72/100' },
    { type: 'cover', title: 'Cover Letter', date: '2 days ago', result: 'Generated for Google' },
  ]);

  const [goals, setGoals] = useState([
    { title: 'Improve Resume Score', progress: 85, target: 90 },
    { title: 'Practice Interviews', progress: 3, target: 10 },
    { title: 'Update LinkedIn', progress: 60, target: 100 },
  ]);

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'var(--body-bg)',
    display: 'flex', flexDirection: 'column',
    fontFamily: "'Quicksand', 'Nunito', sans-serif",
  };

  const topBar = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', height: 64,
    background: 'white',
    borderBottom: '2px solid var(--lavender)',
    flexShrink: 0,
  };

  const statCard = (icon, label, value, color) => ({
    background: 'white',
    borderRadius: 16,
    padding: '20px 24px',
    border: '1.5px solid var(--lavender)',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    minWidth: 200,
    boxShadow: '0 4px 12px rgba(124,111,205,0.08)',
  });

  const progressItem = (goal, index) => ({
    background: 'white',
    borderRadius: 12,
    padding: '16px 20px',
    marginBottom: 12,
    border: '1.5px solid var(--lavender)',
  });

  const activityItem = (activity) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: 'white',
    borderRadius: 10,
    marginBottom: 8,
    border: '1px solid var(--lavender)',
  });

  const getIconForType = (type) => {
    switch(type) {
      case 'resume': return '📄';
      case 'interview': return '🎤';
      case 'cover': return '✉️';
      default: return '📊';
    }
  };

  const getColorForType = (type) => {
    switch(type) {
      case 'resume': return '#2EC4A0';
      case 'interview': return '#9C27B0';
      case 'cover': return '#FF7849';
      default: return '#7C6FCD';
    }
  };

  return (
    <div style={overlay}>
      {/* Top bar */}
      <div style={topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <GuardianMini size={40} />
          <div>
            <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.25rem', color: 'var(--navy)', lineHeight: 1 }}>
              Your Dashboard
            </div>
            <div style={{ fontSize: '0.72rem', color: '#8A90AA', fontWeight: 600, marginTop: 2 }}>
              Welcome back, {user.firstName}! 👋
            </div>
          </div>
        </div>
        <button onClick={onClose}
          style={{ padding: '7px 18px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg,var(--purple),#A08FFF)', color: 'white', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Back
        </button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '32px 48px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
            <div style={statCard('📄', 'Resumes Analyzed', stats.resumesAnalyzed, '#2EC4A0')}>
              <div style={{ fontSize: '2.5rem' }}>📄</div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)' }}>{stats.resumesAnalyzed}</div>
                <div style={{ fontSize: '0.75rem', color: '#8A90AA', fontWeight: 600 }}>Resumes Analyzed</div>
              </div>
            </div>

            <div style={statCard('🎤', 'Interviews Practiced', stats.interviewsPracticed, '#9C27B0')}>
              <div style={{ fontSize: '2.5rem' }}>🎤</div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)' }}>{stats.interviewsPracticed}</div>
                <div style={{ fontSize: '0.75rem', color: '#8A90AA', fontWeight: 600 }}>Interviews Practiced</div>
              </div>
            </div>

            <div style={statCard('✉️', 'Cover Letters', stats.coverLettersGenerated, '#FF7849')}>
              <div style={{ fontSize: '2.5rem' }}>✉️</div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)' }}>{stats.coverLettersGenerated}</div>
                <div style={{ fontSize: '0.75rem', color: '#8A90AA', fontWeight: 600 }}>Cover Letters Generated</div>
              </div>
            </div>

            <div style={statCard('🎯', 'Career Score', stats.careerScore, '#7C6FCD')}>
              <div style={{ fontSize: '2.5rem' }}>🎯</div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)' }}>{stats.careerScore}</div>
                <div style={{ fontSize: '0.75rem', color: '#8A90AA', fontWeight: 600 }}>Career Score</div>
              </div>
            </div>
          </div>

          {/* Two column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            
            {/* Goals Progress */}
            <div>
              <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 16 }}>
                🎯 Your Goals
              </div>
              <div style={{ background: 'var(--lavender)', borderRadius: 16, padding: 20 }}>
                {goals.map((goal, index) => (
                  <div key={index} style={progressItem(goal, index)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.9rem' }}>{goal.title}</span>
                      <span style={{ fontWeight: 800, color: 'var(--purple)', fontSize: '0.85rem' }}>
                        {typeof goal.progress === 'number' && goal.progress <= 100 
                          ? `${goal.progress}%` 
                          : `${goal.progress}/${goal.target}`}
                      </span>
                    </div>
                    <div style={{ height: 8, background: '#E8E4F8', borderRadius: 4, overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          background: 'linear-gradient(135deg,var(--purple),#A08FFF)', 
                          borderRadius: 4,
                          width: typeof goal.progress === 'number' && goal.progress <= 100 
                            ? `${goal.progress}%` 
                            : `${(goal.progress / goal.target) * 100}%`,
                          transition: 'width 0.5s ease'
                        }} 
                      />
                    </div>
                  </div>
                ))}
                <button style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--lavender)',
                  border: '2px dashed var(--lavender-dark)',
                  borderRadius: 12,
                  color: 'var(--purple)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: 8,
                }}>
                  + Add New Goal
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 16 }}>
                📊 Recent Activity
              </div>
              <div style={{ background: 'var(--lavender)', borderRadius: 16, padding: 20 }}>
                {recentActivity.map((activity, index) => (
                  <div key={index} style={activityItem(activity)}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: getColorForType(activity.type) + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem',
                      flexShrink: 0,
                    }}>
                      {getIconForType(activity.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.9rem' }}>
                        {activity.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#8A90AA', fontWeight: 600 }}>
                        {activity.date}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 10px',
                      background: getColorForType(activity.type) + '15',
                      borderRadius: 20,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: getColorForType(activity.type),
                    }}>
                      {activity.result}
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px', color: '#8A90AA', fontWeight: 600 }}>
                    No recent activity yet. Start using the tools to see your progress!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginTop: 32 }}>
            <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 16 }}>
                ⚡ Quick Actions
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { icon: '📄', label: 'Analyze Resume', color: '#2EC4A0' },
                { icon: '🎤', label: 'Practice Interview', color: '#9C27B0' },
                { icon: '✉️', label: 'Cover Letter', color: '#FF7849' },
                { icon: '💬', label: 'Chat with Aria', color: '#7C6FCD' },
              ].map((action, index) => (
                <button
                  key={index}
                  style={{
                    padding: '16px 20px',
                    background: 'white',
                    border: '2px solid var(--lavender)',
                    borderRadius: 16,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(124,111,205,0.08)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = action.color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--lavender)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>{action.icon}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.9rem' }}>
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
