import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User, UserRole, VerificationStatus } from '../types';
import {
  auth,
  db,
  observeAuthState,
  logoutUser,
  loginUser as firebaseLoginUser,
  registerUser as firebaseRegisterUser,
  loginWithGoogle as firebaseLoginWithGoogle,
} from '../firebase';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

const ADMIN_EMAIL = 'merveillematondo2027@gmail.com';

type ActionResult = { success: boolean; error?: string };
type GoogleResult = ActionResult & { isNewUser?: boolean; firebaseUser?: any };

type AccessRequest = {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  requestedRole: UserRole;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
};

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password?: string) => Promise<ActionResult>;
  loginWithGoogle: () => Promise<GoogleResult>;
  register: (userData: Partial<User>, password?: string) => Promise<ActionResult>;
  registerGoogleProfile: (userData: Partial<User>, firebaseUser: any) => Promise<ActionResult>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
  isRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  allUsers: User[];
  updateUserRole: (id: string, role: UserRole) => void;
  updateUserStatus: (id: string, status: VerificationStatus) => void;
  getAccessRequests: () => AccessRequest[];
  updateAccessRequest: (id: string, status: 'approved' | 'rejected') => void;
  requestProfessionalRole: (role: UserRole) => Promise<ActionResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const permissionsForRole = (role: UserRole): string[] => {
  if (role === UserRole.ADMIN) return ['ALL_ACCESS'];
  if (role === UserRole.AGENT || role === UserRole.AGENCY) {
    return ['VIEW_MARKETPLACE', 'CREATE_LISTING', 'MANAGE_OWN_LISTINGS', 'USE_MESSAGES'];
  }
  if (role === UserRole.OWNER) {
    return ['VIEW_MARKETPLACE', 'CREATE_PROPERTY', 'CREATE_LISTING', 'MANAGE_OWN_PROPERTIES', 'USE_MESSAGES'];
  }
  if (role === UserRole.STATE_AUDITOR) return ['VIEW_MARKETPLACE', 'STATE_AUDIT'];
  return ['VIEW_MARKETPLACE', 'USE_MESSAGES'];
};

const normalizeProfile = (firebaseUser: any, existing?: Partial<User>): User => {
  const email = String(firebaseUser?.email || existing?.email || '').trim().toLowerCase();
  const isAdmin = email === ADMIN_EMAIL;
  const role = isAdmin ? UserRole.ADMIN : (existing?.role || UserRole.USER);
  return {
    id: firebaseUser.uid,
    email,
    fullName: existing?.fullName || firebaseUser.displayName || (isAdmin ? 'Administrateur Général' : 'Utilisateur'),
    phone: existing?.phone || firebaseUser.phoneNumber || '',
    role,
    verificationStatus: isAdmin ? VerificationStatus.VERIFIED : (existing?.verificationStatus || VerificationStatus.VERIFIED),
    avatarUrl: existing?.avatarUrl || firebaseUser.photoURL || undefined,
    companyName: existing?.companyName,
    professionalLicenseNumber: existing?.professionalLicenseNumber,
    identityCardNumber: existing?.identityCardNumber,
    department: existing?.department,
    accreditationCode: existing?.accreditationCode,
    createdAt: existing?.createdAt || new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    permissions: isAdmin ? ['ALL_ACCESS'] : (existing?.permissions?.length ? existing.permissions : permissionsForRole(role)),
    isTwoFactorEnabled: existing?.isTwoFactorEnabled,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);

  useEffect(() => {
    return observeAuthState(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        setToken(null);
        setAllUsers([]);
        setAccessRequests([]);
        return;
      }

      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userRef);
        const existing = snap.exists() ? (snap.data() as Partial<User>) : undefined;
        const profile = normalizeProfile(firebaseUser, existing);
        await setDoc(userRef, profile, { merge: true });
        setCurrentUser(profile);
        setToken(await firebaseUser.getIdToken(true));
      } catch (error) {
        console.error('Initialisation du profil Firebase impossible:', error);
        setCurrentUser(null);
        setToken(null);
      }
    });
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.id);
    return onSnapshot(userRef, (snap) => {
      if (snap.exists()) setCurrentUser(snap.data() as User);
    });
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === UserRole.ADMIN) {
      return onSnapshot(collection(db, 'users'), (snap) => {
        setAllUsers(snap.docs.map((d) => d.data() as User));
      });
    }
    setAllUsers([currentUser]);
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    if (!currentUser) return;
    const requestsQuery = currentUser.role === UserRole.ADMIN
      ? collection(db, 'accessRequests')
      : query(collection(db, 'accessRequests'), where('userId', '==', currentUser.id));
    return onSnapshot(requestsQuery, (snap) => {
      setAccessRequests(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AccessRequest, 'id'>) })));
    });
  }, [currentUser?.id, currentUser?.role]);

  const login = async (email: string, password?: string): Promise<ActionResult> => {
    if (!password) return { success: false, error: 'Mot de passe requis.' };
    try {
      await firebaseLoginUser(auth, email.trim(), password);
      return { success: true };
    } catch (error: any) {
      console.error('Erreur connexion Firebase:', error);
      return { success: false, error: 'Email ou mot de passe incorrect.' };
    }
  };

  const loginWithGoogle = async (): Promise<GoogleResult> => {
    try {
      const credential = await firebaseLoginWithGoogle();
      const firebaseUser = credential.user;
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);
      const profile = normalizeProfile(firebaseUser, snap.exists() ? (snap.data() as Partial<User>) : { role: UserRole.USER });
      await setDoc(userRef, profile, { merge: true });
      setCurrentUser(profile);
      return { success: true, isNewUser: !snap.exists(), firebaseUser };
    } catch (error: any) {
      console.error('Erreur Google Authentication:', error);
      return { success: false, error: error?.message || 'Échec de la connexion avec Google.' };
    }
  };

  const register = async (userData: Partial<User>, password?: string): Promise<ActionResult> => {
    if (!userData.email || !password) return { success: false, error: 'Email et mot de passe requis.' };
    try {
      const email = userData.email.trim().toLowerCase();
      const credential = await firebaseRegisterUser(auth, email, password);
      const profile = normalizeProfile(credential.user, {
        ...userData,
        role: email === ADMIN_EMAIL ? UserRole.ADMIN : UserRole.USER,
        verificationStatus: VerificationStatus.VERIFIED,
        permissions: permissionsForRole(email === ADMIN_EMAIL ? UserRole.ADMIN : UserRole.USER),
      });
      await setDoc(doc(db, 'users', credential.user.uid), profile);
      setCurrentUser(profile);
      return { success: true };
    } catch (error: any) {
      console.error('Erreur inscription Firebase:', error);
      const message = error?.code === 'auth/email-already-in-use'
        ? 'Cet email possède déjà un compte.'
        : 'Impossible de créer le compte.';
      return { success: false, error: message };
    }
  };

  const registerGoogleProfile = async (userData: Partial<User>, firebaseUser: any): Promise<ActionResult> => {
    if (!firebaseUser) return { success: false, error: 'Utilisateur Google introuvable.' };
    try {
      const profile = normalizeProfile(firebaseUser, { ...userData, role: UserRole.USER, verificationStatus: VerificationStatus.VERIFIED });
      await setDoc(doc(db, 'users', firebaseUser.uid), profile, { merge: true });
      setCurrentUser(profile);
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Impossible d’enregistrer le profil Google.' };
    }
  };

  const requestProfessionalRole = async (role: UserRole): Promise<ActionResult> => {
    if (!currentUser) return { success: false, error: 'Connectez-vous d’abord.' };
    if (![UserRole.AGENT, UserRole.AGENCY, UserRole.OWNER].includes(role)) {
      return { success: false, error: 'Type de compte professionnel invalide.' };
    }
    try {
      const requestId = `${currentUser.id}-${role}`;
      await setDoc(doc(db, 'accessRequests', requestId), {
        id: requestId,
        userId: currentUser.id,
        email: currentUser.email,
        fullName: currentUser.fullName,
        requestedRole: role,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Impossible d’envoyer la demande professionnelle.' };
    }
  };

  const logout = () => { void logoutUser(auth); };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const safe: Partial<User> = {
      fullName: updatedData.fullName ?? currentUser.fullName,
      phone: updatedData.phone ?? currentUser.phone,
      avatarUrl: updatedData.avatarUrl ?? currentUser.avatarUrl,
      companyName: updatedData.companyName ?? currentUser.companyName,
    };
    void setDoc(doc(db, 'users', currentUser.id), safe, { merge: true });
  };

  const updateUserRole = (id: string, role: UserRole) => {
    if (currentUser?.role !== UserRole.ADMIN) return;
    void setDoc(doc(db, 'users', id), {
      role,
      permissions: permissionsForRole(role),
      verificationStatus: VerificationStatus.VERIFIED,
    }, { merge: true });
  };

  const updateUserStatus = (id: string, status: VerificationStatus) => {
    if (currentUser?.role !== UserRole.ADMIN) return;
    void setDoc(doc(db, 'users', id), { verificationStatus: status }, { merge: true });
  };

  const updateAccessRequest = (id: string, status: 'approved' | 'rejected') => {
    if (currentUser?.role !== UserRole.ADMIN) return;
    void (async () => {
      const ref = doc(db, 'accessRequests', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const request = snap.data() as AccessRequest;
      if (status === 'approved') {
        await setDoc(doc(db, 'users', request.userId), {
          role: request.requestedRole,
          verificationStatus: VerificationStatus.VERIFIED,
          permissions: permissionsForRole(request.requestedRole),
        }, { merge: true });
      }
      await updateDoc(ref, { status, processedAt: new Date().toISOString() });
    })();
  };

  const isRole = (roles: UserRole | UserRole[]) => {
    if (!currentUser) return false;
    return (Array.isArray(roles) ? roles : [roles]).includes(currentUser.role);
  };

  const hasPermission = (permission: string) => Boolean(currentUser?.permissions?.includes('ALL_ACCESS') || currentUser?.permissions?.includes(permission));
  const value = useMemo<AuthContextType>(() => ({
    currentUser,
    isAuthenticated: Boolean(currentUser),
    token,
    login,
    loginWithGoogle,
    register,
    registerGoogleProfile,
    logout,
    updateProfile,
    isRole,
    hasPermission,
    allUsers,
    updateUserRole,
    updateUserStatus,
    getAccessRequests: () => accessRequests,
    updateAccessRequest,
    requestProfessionalRole,
  }), [currentUser, token, allUsers, accessRequests]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
