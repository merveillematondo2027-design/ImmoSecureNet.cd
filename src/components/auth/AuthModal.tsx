import React, { useEffect, useState } from 'react';
import {
  X,
  ShieldCheck,
  User as UserIcon,
  Building2,
  Layers,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'LOGIN' | 'REGISTER';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'LOGIN',
}) => {
  const {
    login,
    loginWithGoogle,
    register,
    registerGoogleProfile,
  } = useAuth();

  const [mode, setMode] = useState<
    'LOGIN' | 'ROLE_SELECT' | 'REGISTER_FORM' | 'FORGOT_PASSWORD'
  >(
    initialMode === 'REGISTER' ? 'ROLE_SELECT' : 'LOGIN'
  );

  const [selectedRole, setSelectedRole] = useState<UserRole>(
    UserRole.USER
  );

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<any>(null);

  // =========================
  // FORM FIELDS
  // =========================

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [professionalLicenseNumber, setProfessionalLicenseNumber] =
    useState('');
  const [identityCardNumber, setIdentityCardNumber] = useState('');
  const [accreditationCode, setAccreditationCode] = useState('');
  const [department, setDepartment] = useState('');

  // =========================
  // GOOGLE USER DATA
  // =========================

  useEffect(() => {
    if (
      pendingGoogleUser &&
      mode === 'REGISTER_FORM'
    ) {
      if (
        pendingGoogleUser.email &&
        !email
      ) {
        setEmail(pendingGoogleUser.email);
      }

      if (
        pendingGoogleUser.displayName &&
        !fullName
      ) {
        setFullName(
          pendingGoogleUser.displayName
        );
      }

      if (
        pendingGoogleUser.phoneNumber &&
        !phone
      ) {
        setPhone(
          pendingGoogleUser.phoneNumber
        );
      }
    }
  }, [
    pendingGoogleUser,
    mode,
    email,
    fullName,
    phone,
  ]);

  // =========================
  // RESET WHEN MODAL OPENS
  // =========================

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setShowPassword(false);

      if (initialMode === 'REGISTER') {
        setMode('ROLE_SELECT');
      } else {
        setMode('LOGIN');
      }
    }
  }, [isOpen, initialMode]);

  if (!isOpen) {
    return null;
  }

  // =========================
  // ROLE OPTIONS
  // =========================

  const roleOptions = [
    {
      role: UserRole.USER,
      title: 'Utilisateur standard',
      description:
        'Pour rechercher, comparer et consulter des biens immobiliers certifiés.',
      icon: UserIcon,
      badge: 'Accès Libre',
      badgeColor:
        'bg-emerald-50 text-emerald-800 border-emerald-200',
      isSensitive: false,
    },
    {
      role: UserRole.AGENT,
      title: 'Agent immobilier',
      description:
        'Pour publier, gérer des annonces et répondre aux demandes de visite.',
      icon: Building2,
      badge: 'Professionnel',
      badgeColor:
        'bg-blue-50 text-blue-700 border-blue-200',
      isSensitive: false,
    },
    {
      role: UserRole.AGENCY,
      title: 'Agence immobilière',
      description:
        'Pour piloter votre agence, votre équipe et votre portefeuille de biens.',
      icon: Building2,
      badge: 'Structure',
      badgeColor:
        'bg-indigo-50 text-indigo-700 border-indigo-200',
      isSensitive: false,
    },
    {
      role: UserRole.OWNER,
      title: 'Propriétaire / Bailleur',
      description:
        'Pour gérer vos propres biens, documents cadastraux et mandats.',
      icon: Layers,
      badge: 'Patrimoine',
      badgeColor:
        'bg-purple-50 text-purple-700 border-purple-200',
      isSensitive: false,
    },
    {
      role: UserRole.STATE_AUDITOR,
      title: 'Auditeur de l’État',
      description:
        'Ce rôle nécessite une autorisation administrative. Audit cadastre et conformité.',
      icon: ShieldCheck,
      badge: 'Sur autorisation',
      badgeColor:
        'bg-amber-50 text-amber-700 border-amber-200',
      isSensitive: true,
    },
  ];

  // =========================
  // LOGIN
  // =========================

  const handleLoginSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await login(
        email,
        password
      );

      if (res.success) {
        onClose();
      } else {
        setErrorMessage(
          res.error ||
            'Identifiants incorrects'
        );
      }
    } catch (error) {
      console.error(
        'Erreur connexion:',
        error
      );

      setErrorMessage(
        'Une erreur est survenue pendant la connexion.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // GOOGLE LOGIN
  // =========================

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res =
        await loginWithGoogle();

      if (res.success) {
        if (res.isNewUser) {
          setPendingGoogleUser(
            res.firebaseUser
          );

          setMode('ROLE_SELECT');
        } else {
          onClose();
        }
      } else {
        setErrorMessage(
          res.error ||
            'Erreur lors de la connexion avec Google.'
        );
      }
    } catch (error) {
      console.error(
        'Erreur Google:',
        error
      );

      setErrorMessage(
        'Impossible de terminer la connexion Google.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // SELECT ROLE
  // =========================

  const handleSelectRole = async (
    role: UserRole
  ) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setSuccessMessage(null);

    /*
     * IMPORTANT :
     * Un nouvel utilisateur Google qui choisit
     * Utilisateur standard peut être créé immédiatement.
     */

    if (
      pendingGoogleUser &&
      role === UserRole.USER
    ) {
      setIsLoading(true);

      try {
        const res =
          await registerGoogleProfile(
            {
              role: UserRole.USER,
            },
            pendingGoogleUser
          );

        if (res.success) {
          setSuccessMessage(
            'Compte créé avec succès !'
          );

          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          setErrorMessage(
            res.error ||
              'Erreur lors de la création du compte.'
          );
        }
      } catch (error) {
        console.error(
          'Erreur création profil Google:',
          error
        );

        setErrorMessage(
          'Impossible de créer votre profil.'
        );
      } finally {
        setIsLoading(false);
      }

      return;
    }

    setMode('REGISTER_FORM');
  };

  // =========================
  // REGISTER
  // =========================

  const handleRegisterSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const userData = {
      fullName,
      email: pendingGoogleUser
        ? email ||
          pendingGoogleUser.email
        : email,
      phone,
      role: selectedRole,
      companyName,
      professionalLicenseNumber,
      identityCardNumber,
      accreditationCode,
      department,
    };

    try {
      let res;

      if (pendingGoogleUser) {
        res =
          await registerGoogleProfile(
            userData,
            pendingGoogleUser
          );
      } else {
        res = await register(
          userData,
          password
        );
      }

      if (res.success) {
        setSuccessMessage(
          'Compte créé avec succès ! Redirection en cours...'
        );

        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setErrorMessage(
          res.error ||
            'Erreur lors de l’inscription.'
        );
      }
    } catch (error) {
      console.error(
        'Erreur inscription:',
        error
      );

      setErrorMessage(
        'Une erreur est survenue pendant l’inscription.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // CLOSE MODAL
  // =========================

  const handleClose = () => {
    if (isLoading) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    onClose();
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 text-slate-900">

        {/* HEADER */}

        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">

          <div className="flex items-center gap-2.5">

            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
            </div>

            <div>
              <h2 className="font-bold text-sm sm:text-base text-slate-900">

                {mode === 'LOGIN' &&
                  'Connexion Sécurisée'}

                {mode === 'ROLE_SELECT' &&
                  'Choisissez votre profil'}

                {mode === 'REGISTER_FORM' &&
                  'Formulaire d’inscription'}

                {mode === 'FORGOT_PASSWORD' &&
                  'Récupération de compte'}

              </h2>

              <p className="text-[11px] text-slate-500">
                ImmoSecureNet Authentication
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

        {/* BODY */}

        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-4">

          {/* ERROR */}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">

              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />

              <span>
                {errorMessage}
              </span>

            </div>
          )}

          {/* SUCCESS */}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">

              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />

              <span>
                {successMessage}
              </span>

            </div>
          )}

          {/* =========================
              LOGIN
          ========================= */}

          {mode === 'LOGIN' && (
            <form
              onSubmit={handleLoginSubmit}
              className="space-y-4"
            >

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email ou Identifiant
                </label>

                <input
                  type="email"
                  required
                  placeholder="votre.email@exemple.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>

                <div className="flex items-center justify-between mb-1">

                  <label className="text-xs font-semibold text-slate-700">
                    Mot de passe
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setMode(
                        'FORGOT_PASSWORD'
                      )
                    }
                    className="text-[11px] text-blue-700 hover:underline font-medium"
                  >
                    Mot de passe oublié ?
                  </button>

                </div>

                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>

                </div>

              </div>

              <div className="flex items-center gap-2">

                <input
                  type="checkbox"
                  id="rememberMe"
                  defaultChecked
                  className="rounded border-slate-300 text-blue-700 focus:ring-blue-500 w-3.5 h-3.5"
                />

                <label
                  htmlFor="rememberMe"
                  className="text-xs text-slate-600 select-none"
                >
                  Mémoriser cet appareil sécurisé
                </label>

              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >

                <KeyRound className="w-4 h-4" />

                <span>
                  {isLoading
                    ? 'Connexion en cours...'
                    : 'Se connecter'}
                </span>

              </button>

              {/* SEPARATOR */}

              <div className="relative flex items-center justify-center my-4">

                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>

                <div className="relative bg-white px-4 text-[10px] font-bold uppercase text-slate-400">
                  OU
                </div>

              </div>

              {/* GOOGLE */}

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >

                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >

                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />

                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />

                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />

                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />

                </svg>

                <span>
                  Continuer avec Google
                </span>

              </button>

              {/* REGISTER */}

              <div className="text-center pt-2 space-y-3">

                <p className="text-xs text-slate-500">

                  Pas encore de compte ?{' '}

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setMode('ROLE_SELECT');
                    }}
                    className="text-blue-700 hover:underline font-bold"
                  >
                    Créer un compte
                  </button>

                </p>

                <button
                  type="button"
                  onClick={handleClose}
                  className="text-[11px] text-slate-400 hover:text-slate-600 underline font-medium transition-colors"
                >
                  Continuer comme visiteur
                </button>

              </div>

            </form>
          )}

          {/* =========================
              ROLE SELECT
          ========================= */}

          {mode === 'ROLE_SELECT' && (
            <div className="space-y-3">

              <div className="text-xs text-slate-600">
                Sélectionnez le profil correspondant à vos activités sur ImmoSecureNet :
              </div>

              <div className="space-y-2">

                {roleOptions.map((opt) => {

                  const Icon = opt.icon;

                  return (
                    <button
                      key={opt.role}
                      type="button"
                      onClick={() =>
                        handleSelectRole(
                          opt.role
                        )
                      }
                      disabled={isLoading}
                      className="w-full text-left p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 cursor-pointer transition-all flex items-start justify-between gap-3 group shadow-xs disabled:opacity-50"
                    >

                      <div className="flex items-start gap-3">

                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">

                          <Icon className="w-4 h-4 text-blue-700" />

                        </div>

                        <div>

                          <div className="flex items-center gap-2 flex-wrap">

                            <span className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors">
                              {opt.title}
                            </span>

                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${opt.badgeColor}`}
                            >
                              {opt.badge}
                            </span>

                          </div>

                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {opt.description}
                          </p>

                        </div>

                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0 mt-2.5 transition-transform group-hover:translate-x-0.5" />

                    </button>
                  );
                })}

              </div>

              <div className="text-center pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setMode('LOGIN')
                  }
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Déjà un compte ?{' '}
                  <span className="text-blue-700 font-bold">
                    Se connecter
                  </span>
                </button>

              </div>

            </div>
          )}

          {/* =========================
              REGISTER FORM
          ========================= */}

          {mode === 'REGISTER_FORM' && (
            <form
              onSubmit={
                handleRegisterSubmit
              }
              className="space-y-3.5"
            >

              <button
                type="button"
                onClick={() =>
                  setMode('ROLE_SELECT')
                }
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 mb-1 font-medium"
              >

                <ArrowLeft className="w-3.5 h-3.5" />

                <span>
                  Changer de profil (
                  {selectedRole})
                </span>

              </button>

              {/* FULL NAME */}

              <div>

                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom complet ou Raison Sociale *
                </label>

                <input
                  type="text"
                  required
                  placeholder="Ex: Me Dieudonné Kasongo ou Prestige SARL"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(
                      e.target.value
                    )
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />

              </div>

              {/* EMAIL + PHONE */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Adresse Email professionnelle *
                  </label>

                  <input
                    type="email"
                    required
                    placeholder="contact@domaine.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />

                </div>

                <div>

                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Numéro de Téléphone *
                  </label>

                  <input
                    type="tel"
                    required
                    placeholder="+243 81 234 5678"
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                      )
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />

                </div>

              </div>

              {/* AGENT / AGENCY */}

              {(selectedRole ===
                UserRole.AGENT ||
                selectedRole ===
                  UserRole.AGENCY) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">

                  <div>

                    <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                      Nom de l’Agence / Structure
                    </label>

                    <input
                      type="text"
                      placeholder="Immo Prestige SARL"
                      value={companyName}
                      onChange={(e) =>
                        setCompanyName(
                          e.target.value
                        )
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                  </div>

                  <div>

                    <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                      N° Carte Pro / RCCM / Agrément
                    </label>

                    <input
                      type="text"
                      placeholder="CARD-PRO-2026/KIN"
                      value={
                        professionalLicenseNumber
                      }
                      onChange={(e) =>
                        setProfessionalLicenseNumber(
                          e.target.value
                        )
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                  </div>

                </div>
              )}

              {/* OWNER */}

              {selectedRole ===
                UserRole.OWNER && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">

                  <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                    Numéro de Pièce d’Identité / Passeport
                  </label>

                  <input
                    type="text"
                    placeholder="PASSPORT-CD-091823"
                    value={
                      identityCardNumber
                    }
                    onChange={(e) =>
                      setIdentityCardNumber(
                        e.target.value
                      )
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                  <p className="text-[10px] text-purple-700 mt-1">
                    Requis pour la certification de vos titres fonciers auprès de l’État.
                  </p>

                </div>
              )}

              {/* SENSITIVE ROLES */}

              {[
                UserRole.STATE_AUDITOR,
                UserRole.ADMIN,
                UserRole.DEVELOPER_AUDITOR,
              ].includes(
                selectedRole
              ) && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">

                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">

                    <Lock className="w-4 h-4 text-amber-700" />

                    <span>
                      Accréditation Sécurisée Obligatoire
                    </span>

                  </div>

                  <div>

                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Code d’invitation / Clé ministérielle *
                    </label>

                    <input
                      type="text"
                      required
                      placeholder="Code d'autorisation"
                      value={
                        accreditationCode
                      }
                      onChange={(e) =>
                        setAccreditationCode(
                          e.target.value
                        )
                      }
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono text-amber-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />

                  </div>

                  <div>

                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Département / Direction officielle
                    </label>

                    <input
                      type="text"
                      placeholder="Direction Générale du Cadastre"
                      value={department}
                      onChange={(e) =>
                        setDepartment(
                          e.target.value
                        )
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                  </div>

                </div>
              )}

              {/* PASSWORD */}

              {!pendingGoogleUser && (
                <div>

                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mot de passe sécurisé *
                  </label>

                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Minimum 8 caractères"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />

                </div>
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >

                <CheckCircle2 className="w-4 h-4" />

                <span>
                  {isLoading
                    ? 'Création du compte...'
                    : 'Finaliser mon inscription'}
                </span>

              </button>

            </form>
          )}

          {/* =========================
              FORGOT PASSWORD
          ========================= */}

          {mode ===
            'FORGOT_PASSWORD' && (
            <div className="space-y-4">

              <p className="text-xs text-slate-600">
                Saisissez votre adresse email.
                Un lien de réinitialisation
                sécurisé sera envoyé.
              </p>

              <input
                type="email"
                placeholder="votre.email@exemple.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={() => {
                  setSuccessMessage(
                    'Un email de sécurité a été expédié à votre adresse.'
                  );

                  setTimeout(() => {
                    setMode('LOGIN');
                  }, 1500);
                }}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
              >
                Envoyer le lien de récupération
              </button>

              <button
                type="button"
                onClick={() =>
                  setMode('LOGIN')
                }
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800"
              >
                Retour à la connexion
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};