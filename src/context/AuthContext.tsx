import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import {
  User,
  UserRole,
  VerificationStatus,
} from '../types';

import { INITIAL_USERS } from '../data/mockData';

import {
  auth,
  db,
  observeAuthState,
  logoutUser,
  loginUser as firebaseLoginUser,
  registerUser as firebaseRegisterUser,
  loginWithGoogle as firebaseLoginWithGoogle,
} from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

/**
 * ============================================================
 * CONFIGURATION IMM OSECURENET
 * ============================================================
 */

const ADMIN_EMAIL = 'merveillematondo2027@gmail.com';

const USER_STORAGE_PREFIX = 'immosecure_user_';
const ACCESS_REQUESTS_KEY = 'immosecure_access_requests';

/**
 * ============================================================
 * TYPE DU CONTEXTE
 * ============================================================
 */

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  token: string | null;

  login: (
    email: string,
    password?: string
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;

  loginWithGoogle: () => Promise<{
    success: boolean;
    isNewUser?: boolean;
    firebaseUser?: any;
    error?: string;
  }>;

  register: (
    userData: Partial<User>,
    password?: string
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;

  registerGoogleProfile: (
    userData: Partial<User>,
    firebaseUser: any
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;

  logout: () => void;

  updateProfile: (
    updatedData: Partial<User>
  ) => void;

  isRole: (
    roles: UserRole | UserRole[]
  ) => boolean;

  hasPermission: (
    permission: string
  ) => boolean;

  allUsers: User[];

  updateUserRole: (
    id: string,
    role: UserRole
  ) => void;

  updateUserStatus: (
    id: string,
    status: VerificationStatus
  ) => void;

  getAccessRequests: () => any[];

  updateAccessRequest: (
    id: string,
    status: 'approved' | 'rejected'
  ) => void;
}

/**
 * ============================================================
 * CONTEXT
 * ============================================================
 */

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

/**
 * ============================================================
 * AUTH PROVIDER
 * ============================================================
 */

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [currentUser, setCurrentUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [allUsers, setAllUsers] =
    useState<User[]>(INITIAL_USERS);

  const [accessRequests, setAccessRequests] = useState<any[]>([]);

  /**
   * ==========================================================
   * CHARGEMENT / SURVEILLANCE DE L'AUTHENTIFICATION FIREBASE
   * ==========================================================
   */

  useEffect(() => {
  const unsubscribe = observeAuthState(auth, async (firebaseUser) => {
    try {
      if (!firebaseUser) {
        setCurrentUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      const email = (firebaseUser.email || '').trim().toLowerCase();
      const ADMIN_EMAIL = 'merveillematondo2027@gmail.com';
      const userRef = doc(db, 'users', firebaseUser.uid);
      let profile: User | null = null;
      let finalRole = email === ADMIN_EMAIL ? UserRole.ADMIN : UserRole.USER;

      try {
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
          profile = docSnap.data() as User;
          
          // Force admin role for the admin email
          if (email === ADMIN_EMAIL && profile.role !== UserRole.ADMIN) {
             profile.role = UserRole.ADMIN;
             profile.permissions = ['ALL_ACCESS'];
             profile.verificationStatus = VerificationStatus.VERIFIED;
             await setDoc(userRef, profile, { merge: true });
          }
        } else {
          // Check local storage for migration
          const userStorageKey = `immosecure_user_${firebaseUser.uid}`;
          const savedLocal = localStorage.getItem(userStorageKey);
          
          if (savedLocal) {
            try {
              profile = JSON.parse(savedLocal) as User;
              profile.role = finalRole;
            } catch {
              profile = null;
            }
          }

          if (!profile) {
            profile = {
              id: firebaseUser.uid,
              email: email,
              fullName: firebaseUser.displayName || (email === ADMIN_EMAIL ? 'Administrateur Général' : 'Client'),
              phone: firebaseUser.phoneNumber || '',
              role: finalRole,
              verificationStatus: VerificationStatus.VERIFIED,
              createdAt: new Date().toISOString(),
              permissions: finalRole === UserRole.ADMIN ? ['ALL_ACCESS'] : ['VIEW_MARKETPLACE'],
              avatarUrl: firebaseUser.photoURL || undefined,
            };
          } else {
             profile.role = finalRole;
          }
          
          // Create in Firestore
          await setDoc(userRef, profile);
        }
      } catch (firestoreError) {
        console.error("Erreur Firestore (observeAuthState):", firestoreError);
        // Fallback to local
        const userStorageKey = `immosecure_user_${firebaseUser.uid}`;
        const savedLocal = localStorage.getItem(userStorageKey);
        if (savedLocal) {
          try {
            profile = JSON.parse(savedLocal) as User;
          } catch {}
        }
        if (!profile) {
           profile = {
              id: firebaseUser.uid,
              email: email,
              fullName: firebaseUser.displayName || 'Utilisateur',
              phone: firebaseUser.phoneNumber || '',
              role: finalRole,
              verificationStatus: VerificationStatus.VERIFIED,
              createdAt: new Date().toISOString(),
              permissions: finalRole === UserRole.ADMIN ? ['ALL_ACCESS'] : ['VIEW_MARKETPLACE'],
            };
        }
      }

      setCurrentUser(profile);
      
      try {
        const tokenStr = await firebaseUser.getIdToken(true);
        setToken(tokenStr);
      } catch (tokenError) {
        console.error('Erreur récupération token:', tokenError);
        setToken(null);
      }

      setLoading(false);

    } catch (error) {
      console.error('Erreur dans observeAuthState:', error);
      setCurrentUser(null);
      setToken(null);
      setLoading(false);
    }
  });

  return () => unsubscribe();
}, []);

  /**
   * ============================================================
   * SAUVEGARDE DU PROFIL COURANT
   * ============================================================
   */

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const storageKey =
      `${USER_STORAGE_PREFIX}${currentUser.id}`;

    localStorage.setItem(
      storageKey,
      JSON.stringify(currentUser)
    );
  }, [currentUser]);

  /**
   * ============================================================
   * CONNEXION EMAIL / MOT DE PASSE
   * ============================================================
   */

  const login = async (
    email: string,
    password?: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      /**
       * Compatibilité avec les anciens comptes démo.
       */

      if (!password) {
        const found =
          INITIAL_USERS.find(
            (u) =>
              u.email.toLowerCase() ===
              email.toLowerCase()
          );

        if (found) {
          setCurrentUser(found);
          setToken(
            `mock_token_${found.id}`
          );

          return {
            success: true,
          };
        }

        return {
          success: false,
          error:
            'Mot de passe requis',
        };
      }

      /**
       * Connexion Firebase
       */

      await firebaseLoginUser(
        auth,
        email,
        password
      );

      return {
        success: true,
      };
    } catch (error: any) {
      console.error(
        'Erreur connexion:',
        error
      );

      return {
        success: false,
        error:
          'Identifiants invalides',
      };
    }
  };

  /**
   * ============================================================
   * CONNEXION GOOGLE
   * ============================================================
   */

  const loginWithGoogle = async (): Promise<{
  success: boolean;
  isNewUser?: boolean;
  firebaseUser?: any;
  error?: string;
}> => {
  try {
    const credential = await firebaseLoginWithGoogle();
    const firebaseUser = credential.user;
    const email = firebaseUser.email?.trim().toLowerCase() || '';
    
    const userRef = doc(db, 'users', firebaseUser.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      if (email === 'merveillematondo2027@gmail.com') {
        const newAdmin = {
          id: firebaseUser.uid,
          email,
          fullName: firebaseUser.displayName || 'Administrateur Général',
          phone: firebaseUser.phoneNumber || '',
          role: UserRole.ADMIN,
          verificationStatus: VerificationStatus.VERIFIED,
          createdAt: new Date().toISOString(),
          permissions: ['ALL_ACCESS'],
          avatarUrl: firebaseUser.photoURL || undefined,
        } as User;
        
        await setDoc(userRef, newAdmin);
        setCurrentUser(newAdmin);
        
        return {
          success: true,
          isNewUser: false,
          firebaseUser,
        };
      }

      return {
        success: true,
        isNewUser: true,
        firebaseUser,
      };
    }

    return {
      success: true,
      isNewUser: false,
      firebaseUser,
    };
  } catch (error: any) {
    console.error('Erreur Google Authentication:', error);
    return {
      success: false,
      error: error?.message || 'Échec de la connexion avec Google',
    };
  }
};


  /**
   * ============================================================
   * INSCRIPTION EMAIL / MOT DE PASSE
   * ============================================================
   */

  const register = async (
    userData: Partial<User>,
    password?: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      if (
        !password ||
        !userData.email
      ) {
        return {
          success: false,
          error:
            'Email et mot de passe requis',
        };
      }

      const email =
        userData.email
          .trim()
          .toLowerCase();

      /**
       * Firebase crée le compte.
       */

      const userCredential =
        await firebaseRegisterUser(
          auth,
          email,
          password
        );

      /**
       * Empêche un utilisateur normal
       * de s'inscrire comme ADMIN.
       */

      const ADMIN_EMAIL = 'merveillematondo2027@gmail.com';

      const finalRole =
        email === ADMIN_EMAIL
          ? UserRole.ADMIN
          : userData.role ===
              UserRole.ADMIN
            ? UserRole.USER
            : userData.role ||
              UserRole.USER;

      const newUser = {
        id: userCredential.user.uid,
        email,
        fullName: userData.fullName || 'Nouvel Utilisateur',
        phone: userData.phone || '',
        role: finalRole,
        verificationStatus:
          finalRole === UserRole.USER || finalRole === UserRole.ADMIN
            ? VerificationStatus.VERIFIED
            : VerificationStatus.PENDING,
        createdAt: new Date().toISOString(),
        permissions:
          finalRole === UserRole.ADMIN
            ? ['ALL_ACCESS']
            : ['VIEW_MARKETPLACE', 'VIEW_OWN_JOURNAL'],
      } as User;

      const userRef = doc(db, 'users', newUser.id);
      await setDoc(userRef, newUser);

      setCurrentUser(newUser);

      /**
       * Créer une demande si rôle professionnel.
       */

      if (
        finalRole !== UserRole.USER &&
        finalRole !== UserRole.ADMIN
      ) {
        const requestId = `req-${Date.now()}`;
        const requestRef = doc(db, 'accessRequests', requestId);
        await setDoc(requestRef, {
            id: requestId,
            userId: newUser.id,
            email: newUser.email,
            fullName: newUser.fullName,
            requestedRole: finalRole,
            status: 'pending',
            createdAt: new Date().toISOString(),
        });
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error(
        'Erreur register:',
        error
      );

      return {
        success: false,
        error:
          'Erreur lors de l\'inscription',
      };
    }
  };

  /**
   * ============================================================
   * INSCRIPTION PROFIL GOOGLE
   * ============================================================
   */

  const registerGoogleProfile = async (
  userData: Partial<User>,
  firebaseUser: any
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!firebaseUser) {
      return {
        success: false,
        error: 'Utilisateur Google introuvable.',
      };
    }

    const email =
      firebaseUser.email ||
      userData.email ||
      '';

    const role =
      userData.role ||
      UserRole.USER;

    const newUser: User = {
      id: firebaseUser.uid,

      email,

      fullName:
        userData.fullName ||
        firebaseUser.displayName ||
        'Utilisateur',

      phone:
        userData.phone ||
        firebaseUser.phoneNumber ||
        '',

      role,

      /*
       * Utilisateur standard :
       * accès immédiat.
       *
       * Autres rôles :
       * demande en attente de validation
       * par l'administrateur général.
       */
      verificationStatus:
        role === UserRole.USER
          ? VerificationStatus.VERIFIED
          : VerificationStatus.PENDING,

      createdAt:
        new Date().toISOString(),

      permissions:
        role === UserRole.USER
          ? ['VIEW_MARKETPLACE']
          : ['VIEW_MARKETPLACE'],

      avatarUrl:
        firebaseUser.photoURL ||
        undefined,
    };

    /*
     * CAS PARTICULIER :
     * Administrateur général
     */
    if (
      email.trim().toLowerCase() ===
      'merveillematondo2027@gmail.com'
    ) {
      newUser.role = UserRole.ADMIN;

      newUser.verificationStatus =
        VerificationStatus.VERIFIED;

      newUser.permissions = ['ALL_ACCESS'];
    }

    /*
     * Sauvegarde du profil
     */
    const userRef = doc(db, 'users', newUser.id);
    await setDoc(userRef, newUser);

    /*
     * Mise à jour immédiate de l'utilisateur connecté
     */
    setCurrentUser(newUser);

    /*
     * Création d'une demande d'accès pour
     * les rôles professionnels / sensibles.
     */
    if (
      newUser.role !== UserRole.USER &&
      newUser.role !== UserRole.ADMIN
    ) {
      const requestId = `req-${Date.now()}`;
      const requestRef = doc(db, 'accessRequests', requestId);
      await setDoc(requestRef, {
          id: requestId,
          userId: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          requestedRole: newUser.role,
          status: 'pending',
          createdAt: new Date().toISOString(),
      });
    }

    /*
     * Récupération du token Firebase
     */
    try {
      const tokenStr =
        await firebaseUser.getIdToken();

      setToken(tokenStr);
    } catch (tokenError) {
      console.error(
        'Erreur récupération token Google :',
        tokenError
      );

      setToken(null);
    }

    return {
      success: true,
    };

  } catch (error) {

    console.error(
      'Erreur registerGoogleProfile:',
      error
    );

    return {
      success: false,
      error:
        'Erreur lors de la configuration du profil.',
    };
  }
};

  /**
   * ============================================================
   * DÉCONNEXION
   * ============================================================
   */

  const logout = async () => {
    try {
      await logoutUser(auth);

      setCurrentUser(null);
      setToken(null);
    } catch (error) {
      console.error(
        'Erreur déconnexion:',
        error
      );
    }
  };

  /**
   * ============================================================
   * CHARGEMENT DES UTILISATEURS
   * ============================================================
   */

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.STATE_AUDITOR || currentUser?.role === UserRole.DEVELOPER_AUDITOR) {
          const usersSnap = await getDocs(collection(db, 'users'));
          const usersList = usersSnap.docs.map(doc => doc.data() as User);
          
          const merged = [...INITIAL_USERS];
          
          usersList.forEach((user: User) => {
            const index = merged.findIndex((existing) => existing.id === user.id);
            if (index >= 0) {
              merged[index] = user;
            } else {
              merged.push(user);
            }
          });
          
          // Force Admin safety
          const adminIndex = merged.findIndex((u) => u.email?.toLowerCase() === 'merveillematondo2027@gmail.com');
          if (adminIndex >= 0) {
            merged[adminIndex].role = UserRole.ADMIN;
            merged[adminIndex].permissions = ['ALL_ACCESS'];
            merged[adminIndex].verificationStatus = VerificationStatus.VERIFIED;
          }
          
          setAllUsers(merged);

          if (currentUser?.role === UserRole.ADMIN) {
            const requestsSnap = await getDocs(collection(db, 'accessRequests'));
            setAccessRequests(requestsSnap.docs.map(doc => doc.data()));
          }
        } else {
          setAllUsers(INITIAL_USERS);
          setAccessRequests([]);
        }
      } catch (error) {
        console.error('Erreur chargement données depuis Firestore:', error);
      }
    };
    
    fetchUsers();
  }, [currentUser]);

  /**
   * ============================================================
   * MODIFIER LE RÔLE D'UN UTILISATEUR
   * ============================================================
   */

  const updateUserRole = async (
    id: string,
    role: UserRole
  ) => {
    const target = allUsers.find((user) => user.id === id);
    if (target?.email?.toLowerCase() === 'merveillematondo2027@gmail.com') {
      role = UserRole.ADMIN;
    }

    setAllUsers((previous) =>
      previous.map((user) => (user.id === id ? { ...user, role } : user))
    );

    try {
      const userRef = doc(db, 'users', id);
      await setDoc(userRef, { role }, { merge: true });
      
      if (currentUser?.id === id) {
        setCurrentUser({ ...currentUser, role });
      }
    } catch (error) {
      console.error('Erreur mise à jour rôle Firestore:', error);
    }
  };

  /**
   * ============================================================
   * MODIFIER LE STATUT
   * ============================================================
   */

  const updateUserStatus = async (
    id: string,
    status: VerificationStatus
  ) => {
    setAllUsers((previous) =>
      previous.map((user) => (user.id === id ? { ...user, verificationStatus: status } : user))
    );

    try {
      const userRef = doc(db, 'users', id);
      await setDoc(userRef, { verificationStatus: status }, { merge: true });
      
      if (currentUser?.id === id) {
        setCurrentUser({ ...currentUser, verificationStatus: status });
      }
    } catch (error) {
      console.error('Erreur mise à jour statut Firestore:', error);
    }
  };

  /**
   * ============================================================
   * DEMANDES D'ACCÈS
   * ============================================================
   */

  const getAccessRequests = () => {
    return accessRequests;
  };

  /**
   * ============================================================
   * APPROUVER / REFUSER UNE DEMANDE
   * ============================================================
   */

  const updateAccessRequest = async (
    id: string,
    status: 'approved' | 'rejected'
  ) => {
    if (currentUser?.role !== UserRole.ADMIN) {
      console.warn('Accès refusé : seul ADMIN peut gérer les demandes.');
      return;
    }

    const request = accessRequests.find((item: any) => item.id === id);
    if (!request) return;

    try {
      const requestRef = doc(db, 'accessRequests', id);
      await setDoc(
        requestRef,
        {
          status,
          processedAt: new Date().toISOString(),
          processedBy: currentUser.id,
        },
        { merge: true }
      );

      setAccessRequests((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );

      if (status === 'approved') {
        await updateUserRole(request.userId, request.requestedRole);
        await updateUserStatus(request.userId, VerificationStatus.VERIFIED);
      }

      if (status === 'rejected') {
        await updateUserStatus(request.userId, VerificationStatus.REJECTED);
      }
    } catch (error) {
      console.error('Erreur lors du traitement de la demande:', error);
    }
  };

  /**
   * ============================================================
   * CHANGEMENT DE RÔLE POUR MODE DÉMO
   * ============================================================
   */

  /**
   * ============================================================
   * MODIFIER LE PROFIL
   * ============================================================
   */

  const updateProfile = async (
    updatedData: Partial<User>
  ) => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      ...updatedData,
    };

    /**
     * L'ADMIN principal reste ADMIN.
     */
    if (updatedUser.email?.toLowerCase() === 'merveillematondo2027@gmail.com') {
      updatedUser.role = UserRole.ADMIN;
      updatedUser.verificationStatus = VerificationStatus.VERIFIED;
      updatedUser.permissions = ['ALL_ACCESS'];
    }

    try {
      const userRef = doc(db, 'users', currentUser.id);
      await setDoc(userRef, updatedUser, { merge: true });
      setCurrentUser(updatedUser);
      setAllUsers((prev) => prev.map((u) => u.id === currentUser.id ? updatedUser : u));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error);
    }
  };

  /**
   * ============================================================
   * VÉRIFICATION DU RÔLE
   * ============================================================
   */

  const isRole = (
    roles:
      | UserRole
      | UserRole[]
  ): boolean => {
    if (!currentUser) {
      return false;
    }

    if (Array.isArray(roles)) {
      return roles.includes(
        currentUser.role
      );
    }

    return (
      currentUser.role ===
      roles
    );
  };

  /**
   * ============================================================
   * VÉRIFICATION DES PERMISSIONS
   * ============================================================
   */

  const hasPermission = (
    permission: string
  ): boolean => {
    if (!currentUser) {
      return false;
    }

    /**
     * ADMIN = accès total
     */

    if (
      currentUser.role ===
      UserRole.ADMIN
    ) {
      return true;
    }

    return (
      currentUser.permissions?.includes(
        permission
      ) || false
    );
  };

  /**
   * ============================================================
   * ATTENTE DE FIREBASE
   * ============================================================
   */

  if (loading) {
    return null;
  }

  /**
   * ============================================================
   * PROVIDER
   * ============================================================
   */

  return (
    <AuthContext.Provider
      value={{
        currentUser,

        isAuthenticated:
          !!currentUser,

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

        getAccessRequests,

        updateAccessRequest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * ============================================================
 * HOOK useAuth
 * ============================================================
 *
 * ⚠️ Cette partie est indispensable.
 *
 * Les composants comme AuthModal,
 * MainAppContent, MessagingView, etc.
 * utilisent :
 *
 * const { ... } = useAuth();
 *
 * ============================================================
 */

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};