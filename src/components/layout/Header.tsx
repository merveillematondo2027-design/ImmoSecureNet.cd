import React, { useEffect, useState } from 'react';
import { User as UserIcon, Shield } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';
import { db } from '../../firebase';

interface HeaderProps {
  onOpenAuth: (initialView?: 'LOGIN' | 'REGISTER') => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { isAuthenticated } = useAuth();
  const { setActiveNavTab } = useProperties();
  const [logoDataUrl, setLogoDataUrl] = useState('');

  useEffect(() => {
    const brandingRef = doc(db, 'appSettings', 'branding');
    return onSnapshot(
      brandingRef,
      (snap) => setLogoDataUrl(snap.exists() ? String(snap.data()?.logoDataUrl || '') : ''),
      (error) => console.warn('Logo personnalisé indisponible:', error)
    );
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setActiveNavTab('marketplace')}
            className="flex items-center gap-2 sm:gap-3 min-w-0 text-left flex-1"
          >
            <div className="w-11 h-12 sm:w-12 sm:h-12 relative flex items-center justify-center shrink-0">
              {logoDataUrl ? (
                <img src={logoDataUrl} alt="Logo ImmoSecureNet" className="w-full h-full object-contain" />
              ) : (
                <>
                  <Shield className="w-9 h-10 sm:w-10 sm:h-11 text-[#1e3a8a] absolute" strokeWidth={1.5} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#16a34a] rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#1e3a8a] rounded-sm" />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col min-w-0 leading-none overflow-hidden">
              <div className="flex items-baseline whitespace-nowrap">
                <span className="text-[22px] sm:text-3xl font-bold text-[#1e3a8a] tracking-tight">Immo</span>
                <span className="text-[22px] sm:text-3xl font-bold text-[#16a34a] tracking-tight">Secure</span>
                <span className="text-[22px] sm:text-3xl font-bold text-[#1e3a8a] tracking-tight">Net</span>
              </div>
              <span className="text-[8px] sm:text-[10px] font-black text-slate-700 tracking-[0.16em] leading-none mt-0.5">MULTIMODAL</span>
              <span className="text-[8px] sm:text-[10px] font-semibold text-black leading-none mt-1 whitespace-nowrap truncate">
                L’habitat en ligne en toute sécurité
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              if (isAuthenticated) setActiveNavTab('menu');
              else onOpenAuth('LOGIN');
            }}
            className="flex flex-col items-center justify-center gap-1 group shrink-0 pl-1"
          >
            <div className="w-10 h-10 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center group-hover:bg-[#1e40af] transition-colors">
              <UserIcon className="w-5 h-5" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-bold text-slate-700">COMPTE</span>
          </button>
        </div>
      </div>
    </header>
  );
};
