import React, { useEffect, useState } from 'react';
import { User as UserIcon, Shield } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';
import { db } from '../../firebase';

interface HeaderProps { onOpenAuth: (initialView?: 'LOGIN' | 'REGISTER') => void; }

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const { setActiveNavTab } = useProperties();
  const [logoDataUrl, setLogoDataUrl] = useState('');

  useEffect(() => onSnapshot(
    doc(db, 'appSettings', 'branding'),
    (s) => setLogoDataUrl(s.exists() ? String(s.data()?.logoDataUrl || '') : ''),
    () => setLogoDataUrl('')
  ), []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={() => setActiveNavTab('marketplace')} className="flex items-center gap-2 sm:gap-3 min-w-0 text-left flex-1">
            <div className="w-10 h-11 sm:w-12 sm:h-12 relative flex items-center justify-center shrink-0">
              {logoDataUrl ? (
                <img src={logoDataUrl} alt="Logo ImmoSecureNet" className="w-full h-full object-contain" />
              ) : (
                <>
                  <Shield className="w-8 h-9 sm:w-10 sm:h-11 text-[#1e3a8a] absolute" strokeWidth={1.5} />
                  <div className="absolute inset-0 flex items-center justify-center"><div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#16a34a] rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#1e3a8a] rounded-sm" /></div></div>
                </>
              )}
            </div>

            <div className="flex flex-col min-w-0 leading-none overflow-hidden">
              <div className="flex items-baseline whitespace-nowrap">
                <span className="text-[20px] sm:text-3xl font-bold text-[#1e3a8a]">Immo</span>
                <span className="text-[20px] sm:text-3xl font-bold text-[#16a34a]">Secure</span>
                <span className="text-[20px] sm:text-3xl font-bold text-[#1e3a8a]">Net</span>
              </div>
              <span className="text-[7px] sm:text-[10px] font-black text-slate-700 tracking-[0.16em] mt-0.5">MULTIMODAL</span>
              <span className="text-[7px] sm:text-[10px] font-semibold text-black mt-1 whitespace-nowrap truncate">Le marché de l'habitat en ligne en toute sécurité</span>
            </div>
          </button>

          {!isAuthenticated ? (
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => onOpenAuth('LOGIN')} className="px-2 sm:px-4 py-2.5 rounded-xl bg-[#1e3a8a] text-white text-[9px] sm:text-xs font-black">CONNEXION</button>
              <button onClick={() => onOpenAuth('REGISTER')} className="px-2 sm:px-4 py-2.5 rounded-xl border border-[#1e3a8a] text-[#1e3a8a] text-[9px] sm:text-xs font-black bg-white">INSCRIPTION</button>
            </div>
          ) : (
            <button onClick={() => setActiveNavTab('menu')} className="flex flex-col items-center justify-center gap-1 shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center overflow-hidden">
                {currentUser?.avatarUrl ? <img src={currentUser.avatarUrl} alt="Profil" className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5" />}
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-700">PROFIL</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
