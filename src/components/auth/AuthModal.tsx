import React, { useEffect, useState } from 'react';
import { X, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'LOGIN' | 'REGISTER';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'LOGIN' }) => {
  const { login, loginWithGoogle, register } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setError('');
    setPassword('');
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = mode === 'LOGIN'
      ? await login(email, password)
      : await register({ email, fullName, phone }, password);
    setLoading(false);
    if (result.success) onClose();
    else setError(result.error || 'Action impossible.');
  };

  const google = async () => {
    setError('');
    setLoading(true);
    const result = await loginWithGoogle();
    setLoading(false);
    if (result.success) onClose();
    else setError(result.error || 'Connexion Google impossible.');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 pt-5">
          <div>
            <h2 className="text-xl font-black text-slate-950">{mode === 'LOGIN' ? 'Connexion' : 'Créer un compte'}</h2>
            <p className="text-xs text-slate-500 mt-1">{mode === 'LOGIN' ? 'Retrouvez votre compte ImmoSecureNet.' : 'Votre premier compte est toujours un compte utilisateur standard.'}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center" aria-label="Fermer"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <button onClick={google} disabled={loading} className="w-full py-3.5 rounded-xl border border-slate-300 bg-white font-bold text-sm text-slate-800 disabled:opacity-60">
            Continuer avec Google
          </button>

          <div className="flex items-center gap-3 text-[11px] text-slate-400"><span className="h-px bg-slate-200 flex-1" />OU<span className="h-px bg-slate-200 flex-1" /></div>

          <form onSubmit={submit} className="space-y-3">
            {mode === 'REGISTER' && (
              <>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Nom complet" className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Téléphone" className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm" />
              </>
            )}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Adresse e-mail" className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm" />
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Mot de passe" className="w-full border border-slate-300 rounded-xl px-4 pr-12 py-3 text-sm" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
            </div>
            {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700">{error}</div>}
            <button disabled={loading} className="w-full py-3.5 rounded-xl bg-[#1e3a8a] text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {mode === 'LOGIN' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {loading ? 'Patientez…' : mode === 'LOGIN' ? 'SE CONNECTER' : 'CRÉER MON COMPTE'}
            </button>
          </form>

          <button onClick={() => { setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setError(''); }} className="w-full text-sm font-bold text-[#1e3a8a] py-2">
            {mode === 'LOGIN' ? 'Pas encore de compte ? S’inscrire' : 'Déjà un compte ? Se connecter'}
          </button>

          {mode === 'REGISTER' && <p className="text-[11px] text-slate-500 text-center">Après connexion, vous pourrez demander un compte Business/Professionnel depuis votre profil : Agent/Agence ou Bailleur/Propriétaire.</p>}
        </div>
      </div>
    </div>
  );
};
