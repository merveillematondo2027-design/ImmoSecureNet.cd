import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PropertyProvider, useProperties } from './context/PropertyContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { AgentDashboardView } from './components/agent/AgentDashboardView';
import { OwnerPropertiesView } from './components/owner/OwnerPropertiesView';
import { StateAuditorView } from './components/audit/StateAuditorView';
import { AdminView } from './components/admin/AdminView';
import { BrandingSettings } from './components/admin/BrandingSettings';
import { DeveloperAuditLogsView } from './components/developer/DeveloperAuditLogsView';
import { JournalView } from './components/journal/JournalView';
import { MessagingView } from './components/messaging/MessagingView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { UserMenuView } from './components/menu/UserMenuView';
import { AuthModal } from './components/auth/AuthModal';
import { PropertyDetailModal } from './components/property/PropertyDetailModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CheckCircle2, AlertCircle, Info, X, Lock } from 'lucide-react';
import { VerificationStatus } from './types';
import { UserRole } from './types';

const ProtectedModule: React.FC<{
  children: React.ReactNode;
  title: string;
  description: string;
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER') => void;
  allowedRoles?: UserRole[];
}> = ({ children, title, description, onOpenAuth, allowedRoles }) => {
  const { currentUser } = useAuth();
  const { setActiveNavTab } = useProperties();
  
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-sm min-h-[50vh]">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-500 mb-8 max-w-md">{description}</p>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
          <button onClick={() => onOpenAuth('LOGIN')} className="w-full px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition-colors shadow-xs">Connexion</button>
          <button onClick={() => onOpenAuth('REGISTER')} className="w-full px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-colors shadow-xs">Créer un compte</button>
        </div>
      </div>
    );
  }

  if (currentUser.verificationStatus === VerificationStatus.PENDING) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-sm min-h-[50vh]">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 border border-amber-100"><AlertCircle className="w-8 h-8" /></div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Compte en attente de validation</h2>
        <p className="text-sm text-slate-500 mb-8 max-w-md">Votre demande de profil <strong>{currentUser.role}</strong> est en cours d'examen par notre équipe d'administration. Vous recevrez une notification dès que votre accès sera validé.</p>
      </div>
    );
  }

  if (currentUser.verificationStatus === VerificationStatus.REJECTED) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-sm min-h-[50vh]">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 border border-red-100"><X className="w-8 h-8" /></div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Demande refusée</h2>
        <p className="text-sm text-slate-500 mb-8 max-w-md">Votre demande d'accès a été refusée. Veuillez contacter le support si vous pensez qu'il s'agit d'une erreur.</p>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    setTimeout(() => {
      if (currentUser.role === UserRole.ADMIN) setActiveNavTab('admin_dashboard');
      else setActiveNavTab('marketplace');
    }, 0);
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-sm min-h-[50vh]">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 border border-red-100"><Lock className="w-8 h-8" /></div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Accès refusé</h2>
        <p className="text-sm text-slate-500 mb-8 max-w-md">Vous n'avez pas les permissions nécessaires pour accéder à cette page. Redirection en cours...</p>
      </div>
    );
  }

  return <>{children}</>;
};

const MainAppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeNavTab, selectedListing, setSelectedListing, toastMessage, setActiveNavTab } = useProperties();

  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === UserRole.ADMIN) {
        if (activeNavTab === 'marketplace') setActiveNavTab('admin_dashboard');
      } else {
        if (['admin_accueil', 'admin_dashboard', 'admin_sponsors', 'admin_branding'].includes(activeNavTab)) setActiveNavTab('marketplace');
      }
    }
  }, [currentUser?.role]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  const handleOpenAuth = (mode: 'LOGIN' | 'REGISTER' = 'LOGIN') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const renderActiveView = () => {
    switch (activeNavTab) {
      case 'marketplace': return <MarketplaceView />;
      case 'agent_dashboard': return <ProtectedModule title="Tableau de bord Agent" description="Vous devez être connecté en tant qu'agent pour accéder à ce module." onOpenAuth={handleOpenAuth}><AgentDashboardView /></ProtectedModule>;
      case 'owner_properties': return <ProtectedModule title="Mes Biens" description="Connectez-vous pour gérer votre patrimoine immobilier." onOpenAuth={handleOpenAuth}><OwnerPropertiesView /></ProtectedModule>;
      case 'audit': return <ProtectedModule title="Audit de l'État" description="Accès sécurisé pour l'audit. Veuillez vous connecter." onOpenAuth={handleOpenAuth}><StateAuditorView /></ProtectedModule>;
      case 'admin_accueil':
      case 'admin_dashboard':
      case 'admin_sponsors':
        return <ProtectedModule title="Administration" description="Connectez-vous pour accéder au panneau d'administration." onOpenAuth={handleOpenAuth} allowedRoles={[UserRole.ADMIN]}><AdminView /></ProtectedModule>;
      case 'admin_branding':
        return <ProtectedModule title="Identité visuelle" description="Accès réservé à l'administration." onOpenAuth={handleOpenAuth} allowedRoles={[UserRole.ADMIN]}><BrandingSettings /></ProtectedModule>;
      case 'dev_logs':
      case 'dev_dashboard': return <ProtectedModule title="Logs Développeur" description="Connectez-vous pour accéder aux logs applicatifs." onOpenAuth={handleOpenAuth}><DeveloperAuditLogsView /></ProtectedModule>;
      case 'journal': return <JournalView />;
      case 'messages': return <ProtectedModule title="Connectez-vous pour accéder à vos messages" description="Vous devez être connecté pour utiliser la messagerie sécurisée ImmoSecureNet." onOpenAuth={handleOpenAuth}><MessagingView /></ProtectedModule>;
      case 'notifications': return <ProtectedModule title="Connectez-vous pour accéder à vos notifications" description="Vous devez être connecté pour voir vos alertes et notifications en temps réel." onOpenAuth={handleOpenAuth}><NotificationsView /></ProtectedModule>;
      case 'menu': return <ProtectedModule title="Connectez-vous pour accéder au menu" description="Vous devez être connecté pour gérer vos paramètres et votre profil." onOpenAuth={handleOpenAuth}><UserMenuView /></ProtectedModule>;
      default: return <MarketplaceView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white font-sans antialiased">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md border animate-in slide-in-from-top-4 fade-in duration-200 text-xs sm:text-sm font-semibold max-w-md bg-white/95 border-slate-200 text-slate-800">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          {toastMessage.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
          <span className="flex-1">{toastMessage.message}</span>
        </div>
      )}

      <Header onOpenAuth={handleOpenAuth} />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar />
        <main className="flex-1 min-w-0 px-3 sm:px-6 lg:px-8 py-5 pb-20 md:pb-8 max-w-7xl mx-auto w-full">
          <ErrorBoundary key={activeNavTab}>{renderActiveView()}</ErrorBoundary>
        </main>
      </div>

      <BottomNav />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authModalMode} />

      {selectedListing && <PropertyDetailModal listing={selectedListing} onClose={() => setSelectedListing(null)} />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PropertyProvider>
        <MainAppContent />
      </PropertyProvider>
    </AuthProvider>
  );
}
