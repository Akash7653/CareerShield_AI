import React, { useState } from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import ShieldScore from './ShieldScore';
import FeaturesGrid from './FeaturesGrid';
import ChatSection from './ChatSection';
import { HowSection, SafetySection, CtaSection } from './Sections';
import ToolModal from './ToolModal';
import LiveInterview from './LiveInterview';
import ChatPage from './ChatPage';

export default function MainApp({ user, setUser, token, onLogout, showToast }) {
  const [activeTool, setActiveTool] = useState(null);
  const [showLiveInterview, setShowLiveInterview] = useState(false);
  const [showChatPage, setShowChatPage] = useState(false);

  const scrollTo = (id) => {
    if (id === 'guardian') {
      setShowChatPage(true);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openTool = (toolId) => {
    if (toolId === 'mockinterview') {
      setShowLiveInterview(true);
    } else if (toolId === 'chat' || toolId === 'guardian') {
      setShowChatPage(true);
    } else {
      setActiveTool(toolId);
    }
  };
  const closeTool = () => setActiveTool(null);

  // Full-page overlays
  if (showChatPage) {
    return <ChatPage token={token} onClose={() => setShowChatPage(false)} />;
  }

  if (showLiveInterview) {
    return <LiveInterview token={token} onClose={() => setShowLiveInterview(false)} />;
  }

  return (
    <div style={{ position: 'relative' }}>
      <Navbar user={user} onLogout={onLogout} onSectionClick={scrollTo} />
      <main>
        <HeroSection user={user} onStartJourney={() => scrollTo('superpowers')} onViewScore={() => scrollTo('shield-score')} />
        <div id="shield-score">
          <ShieldScore user={user} onImproveScore={() => scrollTo('superpowers')} />
        </div>
        <FeaturesGrid onOpenTool={openTool} />
        <ChatSection token={token} onOpenFullChat={() => setShowChatPage(true)} />
        <HowSection />
        <SafetySection onCheckScam={() => openTool('scam')} />
        <CtaSection onGetStarted={() => scrollTo('superpowers')} />
      </main>

      {activeTool && (
        <ToolModal toolId={activeTool} token={token} onClose={closeTool} showToast={showToast} setUser={setUser} />
      )}
    </div>
  );
}
