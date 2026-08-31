import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { User, UserRole, VerificationStatus } from '../types';
import { auth, db, observeAuthState, logoutUser, loginUser as firebaseLoginUser, registerUser as firebaseRegisterUser, loginWithGoogle as firebaseLoginWithGoogle } from '../firebase';

const ADMIN_EMAIL = 'merveillematondo2027@gmail.com';
type Result = { success: boolean; error?: string };
type GoogleResult = Result & { isNewUser?: boolean; firebaseUser?: any };

interface AuthContextType {
  currentUser: User | null; isAuthenticated: boolean; token: string | null;
  login: (email: string, password?: string) => Promise<Result>;
  loginWithGoogle: () => Promise<GoogleResult>;
  register: (userData: Partial<User>, password?: string) => Promise<Result>;
  registerGoogleProfile: (userData: Partial<User>, firebaseUser: any) => Promise<Result>;
  logout: () => void; updateProfile: (updatedData: Partial<User>) => void;
  isRole: (roles: UserRole | UserRole[]) => boolean; hasPermission: (permission: string) => boolean;
  allUsers: User[]; updateUserRole: (id: string, role: UserRole) => void;
  updateUserStatus: (id: string, status: VerificationStatus) => void;
  getAccessRequests: () => any[]; updateAccessRequest: (id: string, status: 'approved' | 'rejected') => void;
  requestProfessionalRole: (role: UserRole) => Promise<Result>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const makeStandardProfile = (u: any): User => {
  const email = String(u.email || '').trim().toLowerCase();
  const admin = email === ADMIN_EMAIL;
  return { id: u.uid, email, fullName: u.displayName || (admin ? 'Administrateur Général' : 'Utilisateur'), phone: u.phoneNumber || '', role: admin ? UserRole.ADMIN : UserRole.USER, verificationStatus: VerificationStatus.VERIFIED, avatarUrl: u.photoURL || undefined, createdAt: new Date().toISOString(), permissions: admin ? ['ALL_ACCESS'] : ['VIEW_MARKETPLACE', 'VIEW_OWN_JOURNAL'] };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [accessRequests, setAccessRequests] = useState<any[]>([]);

  const refreshAdminData = async () => {
    try {
      const [u, r] = await Promise.all([getDocs(collection(db, 'users')), getDocs(collection(db, 'accessRequests'))]);
      setAllUsers(u.docs.map(d => d.data() as User));
      setAccessRequests(r.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.warn('Données admin indisponibles', e); }
  };

  useEffect(() => observeAuthState(auth, async (firebaseUser) => {
    if (!firebaseUser) { setCurrentUser(null); setToken(null); setAllUsers([]); setAccessRequests([]); return; }
    try {
      const ref = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(ref);
      let profile = snap.exists() ? snap.data() as User : makeStandardProfile(firebaseUser);
      if (!snap.exists()) await setDoc(ref, profile);
      if ((firebaseUser.email || '').trim().toLowerCase() === ADMIN_EMAIL && profile.role !== UserRole.ADMIN) {
        profile = { ...profile, role: UserRole.ADMIN, verificationStatus: VerificationStatus.VERIFIED, permissions: ['ALL_ACCESS'] };
        await setDoc(ref, profile, { merge: true });
      }
      setCurrentUser(profile); setToken(await firebaseUser.getIdToken());
      if (profile.role === UserRole.ADMIN) await refreshAdminData();
    } catch (e) { console.error('Profil Firestore inaccessible', e); setCurrentUser(null); setToken(null); }
  }), []);

  const login = async (email: string, password?: string): Promise<Result> => {
    if (!password) return { success: false, error: 'Mot de passe requis.' };
    try { await firebaseLoginUser(auth, email.trim().toLowerCase(), password); return { success: true }; }
    catch { return { success: false, error: 'Email ou mot de passe incorrect.' }; }
  };

  const loginWithGoogle = async (): Promise<GoogleResult> => {
    try {
      const credential = await firebaseLoginWithGoogle(); const u = credential.user; const ref = doc(db, 'users', u.uid); const snap = await getDoc(ref);
      if (!snap.exists()) await setDoc(ref, makeStandardProfile(u));
      return { success: true, isNewUser: !snap.exists(), firebaseUser: u };
    } catch (e: any) { return { success: false, error: e?.message || 'Connexion Google impossible.' }; }
  };

  const register = async (data: Partial<User>, password?: string): Promise<Result> => {
    if (!data.email || !password) return { success: false, error: 'Email et mot de passe requis.' };
    try {
      const c = await firebaseRegisterUser(auth, data.email.trim().toLowerCase(), password);
      const profile = { ...makeStandardProfile(c.user), fullName: data.fullName || 'Utilisateur', phone: data.phone || '' };
      await setDoc(doc(db, 'users', c.user.uid), profile); setCurrentUser(profile); return { success: true };
    } catch { return { success: false, error: 'Impossible de créer le compte.' }; }
  };

  const registerGoogleProfile = async (data: Partial<User>, u: any): Promise<Result> => {
    if (!u) return { success: false, error: 'Utilisateur Google introuvable.' };
    try { const ref = doc(db, 'users', u.uid); const snap = await getDoc(ref); const base = snap.exists() ? snap.data() as User : makeStandardProfile(u); const profile = { ...base, fullName: data.fullName || base.fullName, phone: data.phone ?? base.phone, role: base.email === ADMIN_EMAIL ? UserRole.ADMIN : UserRole.USER, verificationStatus: VerificationStatus.VERIFIED }; await setDoc(ref, profile, { merge: true }); setCurrentUser(profile); return { success: true }; }
    catch { return { success: false, error: 'Impossible d’enregistrer le profil.' }; }
  };

  const requestProfessionalRole = async (role: UserRole): Promise<Result> => {
    if (!currentUser) return { success: false, error: 'Connexion requise.' };
    if (![UserRole.AGENT, UserRole.AGENCY, UserRole.OWNER].includes(role)) return { success: false, error: 'Type de compte invalide.' };
    try { const id = `${currentUser.id}_${role}`; await setDoc(doc(db, 'accessRequests', id), { id, userId: currentUser.id, email: currentUser.email, fullName: currentUser.fullName, requestedRole: role, status: 'pending', createdAt: new Date().toISOString() }); return { success: true }; }
    catch { return { success: false, error: 'Impossible d’envoyer la demande.' }; }
  };

  const logout = () => { void logoutUser(auth); };
  const updateProfile = (data: Partial<User>) => { if (!currentUser) return; const safe: any = { ...data }; delete safe.role; delete safe.permissions; delete safe.verificationStatus; setCurrentUser({ ...currentUser, ...safe }); void setDoc(doc(db, 'users', currentUser.id), safe, { merge: true }); };
  const updateUserRole = (id: string, role: UserRole) => { void updateDoc(doc(db, 'users', id), { role }).then(refreshAdminData); };
  const updateUserStatus = (id: string, verificationStatus: VerificationStatus) => { void updateDoc(doc(db, 'users', id), { verificationStatus }).then(refreshAdminData); };
  const updateAccessRequest = (id: string, status: 'approved' | 'rejected') => { void (async () => { const ref = doc(db, 'accessRequests', id); const s = await getDoc(ref); if (!s.exists()) return; const r = s.data(); await updateDoc(ref, { status, processedAt: new Date().toISOString() }); await updateDoc(doc(db, 'users', r.userId), status === 'approved' ? { role: r.requestedRole, verificationStatus: VerificationStatus.VERIFIED } : { verificationStatus: VerificationStatus.VERIFIED }); await refreshAdminData(); })(); };

  return <AuthContext.Provider value={{ currentUser, isAuthenticated: !!currentUser, token, login, loginWithGoogle, register, registerGoogleProfile, logout, updateProfile, isRole: roles => !!currentUser && (Array.isArray(roles) ? roles.includes(currentUser.role) : currentUser.role === roles), hasPermission: p => !!currentUser && (currentUser.permissions.includes('ALL_ACCESS') || currentUser.permissions.includes(p)), allUsers, updateUserRole, updateUserStatus, getAccessRequests: () => accessRequests, updateAccessRequest, requestProfessionalRole }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => { const c = useContext(AuthContext); if (!c) throw new Error('useAuth doit être utilisé dans AuthProvider'); return c; };
