import React from 'react';
import { Home, Plus, MessageSquare, Menu, BookOpen } from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';
import { useAuth } from '../../context/AuthContext';

export const BottomNav: React.FC = () => {
  const { activeNavTab, setActiveNavTab } = useProperties();
  const { isAuthenticated } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      
      <button
        onClick={() => setActiveNavTab('marketplace')}
        className={`flex flex-col items-center gap-1 ${
          activeNavTab === 'marketplace' ? 'text-[#1e3a8a]' : 'text-slate-500'
        }`}
      >
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-medium">Accueil</span>
      </button>

      <button
        onClick={() => setActiveNavTab('journal')}
        className={`flex flex-col items-center gap-1 ${
          activeNavTab === 'journal' ? 'text-[#1e3a8a]' : 'text-slate-500'
        }`}
      >
        <BookOpen className="w-6 h-6" />
        <span className="text-[10px] font-medium">Journal</span>
      </button>

      {/* Prominent Publish Button */}
      <div className="relative -top-5">
        <button
          onClick={() => setActiveNavTab(isAuthenticated ? 'owner_properties' : 'menu')}
          className="w-14 h-14 bg-[#1e3a8a] text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white hover:bg-[#1e40af] transition-colors"
        >
          <Plus className="w-7 h-7" />
        </button>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-[10px] font-medium text-slate-700">Publier</span>
        </div>
      </div>

      <button
        onClick={() => setActiveNavTab('messages')}
        className={`flex flex-col items-center gap-1 ${
          activeNavTab === 'messages' ? 'text-[#1e3a8a]' : 'text-slate-500'
        }`}
      >
        <MessageSquare className="w-6 h-6" />
        <span className="text-[10px] font-medium">Messages</span>
      </button>

      <button
        onClick={() => setActiveNavTab('navigation')}
        className={`flex flex-col items-center gap-1 ${
          activeNavTab === 'navigation' ? 'text-[#1e3a8a]' : 'text-slate-500'
        }`}
      >
        <Menu className="w-6 h-6" />
        <span className="text-[10px] font-medium">Menu</span>
      </button>
    </div>
  );
};
