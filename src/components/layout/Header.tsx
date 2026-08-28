import React from 'react';
import { Menu, Search, User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';

interface HeaderProps {
  onOpenAuth: (initialView?: 'LOGIN' | 'REGISTER') => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const { setActiveNavTab } = useProperties();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-start justify-between">
          
          {/* Logo Section */}
          <div 
            onClick={() => setActiveNavTab('marketplace')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer"
          >
            {/* Shield Icon */}
            <div className="w-10 h-12 sm:w-12 sm:h-14 relative flex items-center justify-center shrink-0">
              <Shield className="w-8 h-10 sm:w-10 sm:h-12 text-[#1e3a8a] absolute" strokeWidth={1.5} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#16a34a] rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#1e3a8a] rounded-sm"></div>
                </div>
              </div>
            </div>

            {/* Text Logo */}
            <div className="flex flex-col">
              <div className="flex items-baseline">
                <span className="text-xl sm:text-3xl font-bold text-[#1e3a8a] tracking-tight">Immo</span>
                <span className="text-xl sm:text-3xl font-bold text-[#16a34a] tracking-tight">Secure</span>
                <span className="text-xl sm:text-3xl font-bold text-[#1e3a8a] tracking-tight">Net</span>
              </div>
              <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 tracking-wider leading-none mt-0.5">MULTIMODAL</span>
              <span className="text-[7px] sm:text-[10px] font-bold uppercase tracking-widest leading-none mt-1">
                LE MARCHÉ DE L'HABITAT <span className="text-[#16a34a]">EN LIGNE EN TOUTE SÉCURITÉ</span>
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 sm:gap-6 mt-1">
            <button 
              onClick={() => setActiveNavTab('marketplace')}
              className="flex flex-col items-center justify-center gap-1 group shrink-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center group-hover:bg-[#1e40af] transition-colors">
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-700">RECHERCHE</span>
            </button>

            <button 
              onClick={() => {
                if (isAuthenticated) {
                  setActiveNavTab('menu');
                } else {
                  onOpenAuth('LOGIN');
                }
              }}
              className="flex flex-col items-center justify-center gap-1 group shrink-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center group-hover:bg-[#1e40af] transition-colors">
                <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-700">COMPTE</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
