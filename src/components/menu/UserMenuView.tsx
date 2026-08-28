import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Smartphone,
  Fingerprint,
  Lock,
  FileCheck2,
  ExternalLink,
  LogOut,
  Moon,
  Globe,
  Bell,
  HelpCircle,
  Sparkles,
  Layers,
  ChevronRight,
  Code2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';
import { UserRole } from '../../types';

export const UserMenuView: React.FC = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { showToast, setActiveNavTab } = useProperties();

  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [pushNotifEnabled, setPushNotifEnabled] = useState(true);

  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto">
      {/* Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 text-slate-900">
        <div className="flex items-center gap-4">
          {currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-blue-700 flex items-center justify-center text-xl font-bold text-white shadow-xs">
              {currentUser?.fullName?.charAt(0) || 'U'}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {currentUser?.fullName || 'Utilisateur Anonyme'}
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3 h-3" /> Certifié
              </span>
            </div>
            <p className="text-xs text-blue-700 font-medium">{currentUser?.email || 'visiteur@immosecure.net'}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {currentUser?.companyName || currentUser?.department || 'Particulier'}
            </p>
          </div>
        </div>
      </div>

      {/* Security & Authentication Preferences */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 text-slate-900">
        <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-700" />
          <span>Sécurité du Compte & Biométrie</span>
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-blue-700" />
              <div>
                <div className="text-xs font-semibold text-slate-900">Authentification Biométrique (Empreinte / FaceID)</div>
                <div className="text-[11px] text-slate-500">Verrouillage de l'application Android & Web</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={biometricEnabled}
              onChange={(e) => setBiometricEnabled(e.target.checked)}
              className="accent-blue-700 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-xs font-semibold text-slate-900">Double Facteur (2FA / OTP SMS)</div>
                <div className="text-[11px] text-slate-500">Protection obligatoire pour les transactions et audits</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              className="accent-blue-700 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-700" />
              <div>
                <div className="text-xs font-semibold text-slate-900">Notifications Push Mobiles</div>
                <div className="text-[11px] text-slate-500">Alertes temps réel sur les visites et titres</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={pushNotifEnabled}
              onChange={(e) => setPushNotifEnabled(e.target.checked)}
              className="accent-blue-700 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Android Mobile-First Readiness Card */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 shadow-xs space-y-3 text-slate-900">
        <div className="flex items-center gap-2 text-blue-800 font-bold text-xs sm:text-sm">
          <Smartphone className="w-4 h-4 text-blue-700" />
          <span>Architecture Prête pour Application Android (Kotlin / React Native)</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          L'interface ImmoSecureNet est modulaire, légère et respecte les normes Material Design 3 :
          Bottom Navigation tactile, Deep Links vers les annonces, offline caching des titres fonciers et chiffrement matériel KeyStore.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-slate-700 font-mono">
          <div className="p-2 rounded-xl bg-white border border-blue-200 text-center shadow-xs">
            <span className="text-emerald-700 font-bold">✓ PWA Ready</span>
          </div>
          <div className="p-2 rounded-xl bg-white border border-blue-200 text-center shadow-xs">
            <span className="text-blue-700 font-bold">✓ Touch 44px+</span>
          </div>
          <div className="p-2 rounded-xl bg-white border border-blue-200 text-center shadow-xs">
            <span className="text-purple-700 font-bold">✓ REST API</span>
          </div>
          <div className="p-2 rounded-xl bg-white border border-blue-200 text-center shadow-xs">
            <span className="text-amber-700 font-bold">✓ APK Target</span>
          </div>
        </div>
      </div>

      {/* Compliance & About */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 text-slate-900">
        <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-purple-700" />
          <span>Conformité Légale & Cadastre</span>
        </h3>

        <div className="divide-y divide-slate-100 text-xs text-slate-600">
          <div className="py-2.5 flex items-center justify-between">
            <span>Réglementation Foncière & Cadastrale</span>
            <span className="text-emerald-700 font-semibold">Conforme Loi N°73-021</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span>Chiffrement des Données Personnelles</span>
            <span className="text-blue-700 font-mono font-medium">AES-GCM-256</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span>Version de la Plateforme</span>
            <span className="text-slate-500 font-mono">v2.4.0 (Enterprise)</span>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      {isAuthenticated && (
        <button
          onClick={logout}
          className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Se déconnecter de la session sécurisée</span>
        </button>
      )}
    </div>
  );
};
