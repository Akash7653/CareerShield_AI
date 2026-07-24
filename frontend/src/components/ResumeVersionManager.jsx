import React, { useState, useEffect } from 'react';

export default function ResumeVersionManager({ token, onClose }) {
  const [versions, setVersions] = useState([]);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    // Load saved versions from localStorage
    const savedVersions = JSON.parse(localStorage.getItem('resume_versions') || '[]');
    setVersions(savedVersions);
  }, []);

  const saveCurrentVersion = (resumeData, analysisResult) => {
    const newVersion = {
      id: Date.now(),
      name: `Version ${versions.length + 1}`,
      date: new Date().toISOString(),
      resumeData,
      analysisResult,
      score: analysisResult?.overallScore || 0
    };
    const updatedVersions = [...versions, newVersion];
    setVersions(updatedVersions);
    localStorage.setItem('resume_versions', JSON.stringify(updatedVersions));
  };

  const deleteVersion = (id) => {
    const updatedVersions = versions.filter(v => v.id !== id);
    setVersions(updatedVersions);
    localStorage.setItem('resume_versions', JSON.stringify(updatedVersions));
  };

  const compareVersions = () => {
    if (selectedVersions.length !== 2) return;
    const [v1, v2] = selectedVersions.map(id => versions.find(v => v.id === id));
    setComparison({
      version1: v1,
      version2: v2,
      scoreDiff: v2.score - v1.score,
      improvements: analyzeImprovements(v1, v2)
    });
  };

  const analyzeImprovements = (v1, v2) => {
    const improvements = [];
    if (v2.score > v1.score) {
      improvements.push(`Score improved by ${v2.score - v1.score} points`);
    }
    if (v2.analysisResult?.strengths?.length > v1.analysisResult?.strengths?.length) {
      improvements.push('More strengths identified');
    }
    if (v2.analysisResult?.improvements?.length < v1.analysisResult?.improvements?.length) {
      improvements.push('Fewer areas for improvement');
    }
    return improvements;
  };

  const downloadVersion = (version) => {
    const data = JSON.stringify(version, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${version.name}-${new Date(version.date).toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'var(--body-bg)',
    display: 'flex', flexDirection: 'column',
    fontFamily: "'Quicksand', 'Nunito', sans-serif"
  };

  const topBar = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', height: 64,
    background: 'white',
    borderBottom: '2px solid var(--lavender)',
    flexShrink: 0,
  };

  const versionCard = (version) => ({
    background: 'white',
    borderRadius: 12,
    padding: '16px 20px',
    border: '2px solid var(--lavender)',
    marginBottom: 12,
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  return (
    <div style={overlay}>
      {/* Top bar */}
      <div style={topBar}>
        <div>
          <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.25rem', color: 'var(--navy)' }}>
            📄 Resume Version Manager
          </div>
          <div style={{ fontSize: '0.72rem', color: '#8A90AA', fontWeight: 600 }}>
            Save, compare, and track your resume improvements
          </div>
        </div>
        <button onClick={onClose}
          style={{ padding: '7px 18px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg,var(--purple),#A08FFF)', color: 'white', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Back
        </button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '32px 48px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          
          {/* Comparison Section */}
          {comparison && (
            <div style={{ background: 'linear-gradient(135deg,#E8FFF5,var(--lavender))', borderRadius: 16, padding: 24, marginBottom: 24, border: '2px solid var(--lavender-dark)' }}>
              <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.2rem', color: 'var(--navy)', marginBottom: 16 }}>
                📊 Version Comparison
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ background: 'white', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 800, color: 'var(--purple)', fontSize: '0.85rem', marginBottom: 8 }}>
                    {comparison.version1.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8A90AA', marginBottom: 8 }}>
                    {new Date(comparison.version1.date).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)' }}>
                    {comparison.version1.score}
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 800, color: 'var(--purple)', fontSize: '0.85rem', marginBottom: 8 }}>
                    {comparison.version2.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8A90AA', marginBottom: 8 }}>
                    {new Date(comparison.version2.date).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: comparison.scoreDiff >= 0 ? '#2EC4A0' : '#F44336' }}>
                    {comparison.version2.score}
                  </div>
                </div>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '0.9rem', marginBottom: 12 }}>
                  Key Changes:
                </div>
                {comparison.improvements.length > 0 ? (
                  comparison.improvements.map((imp, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: 'var(--lavender)', borderRadius: 8, marginBottom: 8, fontSize: '0.85rem', color: 'var(--navy)' }}>
                      ✅ {imp}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '12px', color: '#8A90AA', fontSize: '0.85rem' }}>
                    No significant changes detected
                  </div>
                )}
              </div>
              <button 
                onClick={() => setComparison(null)}
                style={{ marginTop: 16, padding: '10px 20px', background: 'white', border: '2px solid var(--lavender)', borderRadius: 10, fontWeight: 700, color: 'var(--purple)', cursor: 'pointer' }}
              >
                Close Comparison
              </button>
            </div>
          )}

          {/* Version List */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            
            {/* Versions */}
            <div>
              <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.2rem', color: 'var(--navy)', marginBottom: 16 }}>
                📁 Saved Versions ({versions.length})
              </div>
              <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                {versions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: '#8A90AA', fontWeight: 600 }}>
                    No saved versions yet. Analyze your resume to save versions!
                  </div>
                ) : (
                  versions.map((version) => (
                    <div 
                      key={version.id}
                      style={{
                        ...versionCard(version),
                        borderColor: selectedVersions.includes(version.id) ? 'var(--purple)' : 'var(--lavender)',
                        background: selectedVersions.includes(version.id) ? 'var(--lavender)' : 'white'
                      }}
                      onClick={() => {
                        if (selectedVersions.includes(version.id)) {
                          setSelectedVersions(selectedVersions.filter(id => id !== version.id));
                        } else if (selectedVersions.length < 2) {
                          setSelectedVersions([...selectedVersions, version.id]);
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '0.9rem' }}>
                          {version.name}
                        </div>
                        <div style={{ 
                          padding: '4px 10px', 
                          borderRadius: 20, 
                          fontSize: '0.7rem', 
                          fontWeight: 700, 
                          background: version.score >= 80 ? '#E8FFF5' : version.score >= 60 ? '#FFFDE8' : '#FFF0EE',
                          color: version.score >= 80 ? '#2EC4A0' : version.score >= 60 ? '#FF9800' : '#F44336'
                        }}>
                          Score: {version.score}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#8A90AA', fontWeight: 600, marginBottom: 12 }}>
                        {new Date(version.date).toLocaleDateString()} at {new Date(version.date).toLocaleTimeString()}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); downloadVersion(version); }}
                          style={{ flex: 1, padding: '8px', background: 'var(--lavender)', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.75rem', color: 'var(--purple)', cursor: 'pointer' }}
                        >
                          📥 Download
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteVersion(version.id); }}
                          style={{ padding: '8px 12px', background: '#FFF0EE', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.75rem', color: '#C0405A', cursor: 'pointer' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Comparison Controls */}
            <div>
              <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.2rem', color: 'var(--navy)', marginBottom: 16 }}>
                🔍 Compare Versions
              </div>
              <div style={{ background: 'var(--lavender)', borderRadius: 16, padding: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.85rem', marginBottom: 8 }}>
                    Selected: {selectedVersions.length}/2
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8A90AA', fontWeight: 600 }}>
                    {selectedVersions.length === 0 
                      ? 'Select 2 versions to compare' 
                      : selectedVersions.length === 1 
                      ? 'Select 1 more version' 
                      : 'Ready to compare!'}
                  </div>
                </div>
                <button 
                  onClick={compareVersions}
                  disabled={selectedVersions.length !== 2}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: selectedVersions.length === 2 ? 'linear-gradient(135deg,var(--teal),#25A88A)' : 'var(--lavender)',
                    border: 'none',
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    color: selectedVersions.length === 2 ? 'white' : 'var(--purple)',
                    cursor: selectedVersions.length === 2 ? 'pointer' : 'not-allowed',
                    opacity: selectedVersions.length === 2 ? 1 : 0.6,
                  }}
                >
                  📊 Compare Selected Versions
                </button>
                
                <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--lavender-dark)' }}>
                  <div style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '0.85rem', marginBottom: 12 }}>
                    💡 Tips
                  </div>
                  <ul style={{ paddingLeft: 20, fontSize: '0.8rem', color: '#5A6488', lineHeight: 1.6 }}>
                    <li style={{ marginBottom: 8 }}>Save versions after each major resume update</li>
                    <li style={{ marginBottom: 8 }}>Compare versions to track your progress</li>
                    <li style={{ marginBottom: 8 }}>Download versions for backup or sharing</li>
                    <li>Delete old versions you no longer need</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Export helper function to be used by other components
export const saveResumeVersion = (resumeData, analysisResult) => {
  const savedVersions = JSON.parse(localStorage.getItem('resume_versions') || '[]');
  const newVersion = {
    id: Date.now(),
    name: `Version ${savedVersions.length + 1}`,
    date: new Date().toISOString(),
    resumeData,
    analysisResult,
    score: analysisResult?.overallScore || 0
  };
  const updatedVersions = [...savedVersions, newVersion];
  localStorage.setItem('resume_versions', JSON.stringify(updatedVersions));
  return newVersion;
};
