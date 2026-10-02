import React, { useEffect } from 'react';
import { Sparkles, Check, PartyPopper } from 'lucide-react';
import { blastPartyPopper } from '../../utils/confetti';

const PartyPopperCelebration = ({ memberName, communityName, onClose }) => {
  useEffect(() => {
    // Blast celebratory confetti once on mount
    blastPartyPopper();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#121212]/95 border border-[#B87333]/40 rounded-3xl p-8 text-center text-[#F5F2ED] backdrop-blur-2xl">
        {/* Glow accent */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#B87333]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Celebratory Icon */}
        <div className="relative mx-auto mb-5 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#B87333]/25 via-[#C98545]/15 to-[#1A1A1A] border border-[#B87333]/50 flex items-center justify-center">
          <PartyPopper size={40} className="text-[#E5A96A] animate-bounce" />
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#B87333] flex items-center justify-center">
            <Sparkles size={14} className="text-[#080808]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold tracking-tight text-[#F5F2ED] mb-2 font-serif">
          Request Approved! 🎉
        </h2>

        {/* Note / Short Welcome */}
        <p className="text-[#B87333] font-medium text-sm tracking-wide mb-3 uppercase">
          Welcome to the Community
        </p>
        
        <p className="text-sm text-[#A0A0A0] leading-relaxed mb-6">
          <strong className="text-[#F5F2ED] font-semibold">{memberName || 'The new member'}</strong> has been accepted into{' '}
          <strong className="text-[#E5A96A] font-semibold">{communityName || 'the community'}</strong>. They now have full access to community announcements, tickets, and discussions!
        </p>

        {/* Single Glassy Action Button - Zero Drop Shadows */}
        <button
          onClick={onClose}
          className="w-full py-3 px-6 rounded-xl font-semibold text-sm tracking-wide bg-gradient-to-r from-[#B87333]/25 via-[#B87333]/20 to-[#B87333]/15 hover:from-[#B87333]/35 hover:to-[#B87333]/25 dark:bg-none dark:bg-[#141414] hover:dark:bg-[#1E1E1E] border border-[#B87333]/50 hover:border-[#B87333] text-[#F5F2ED] backdrop-blur-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
        >
          <Check size={18} className="text-[#E5A96A]" />
          Awesome, Done!
        </button>
      </div>
    </div>
  );
};

export default PartyPopperCelebration;
