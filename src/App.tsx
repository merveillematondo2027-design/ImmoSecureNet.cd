import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PropertyProvider, useProperties } from './context/PropertyContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { FurnitureMarketplaceView } from './components/furniture/FurnitureMarketplaceView';
import { HotelPartnersView } from './components/hotels/HotelPartnersView';
import { ConnectivityPartnersView } from './components/connectivity/ConnectivityPartnersView';
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
import { InformationView } from './components/menu/InformationView';
import { AuthModal } from './components/auth/AuthModal';
import { PropertyDetailModal } from './components/property/PropertyDetailModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CheckCircle2, AlertCircle, Info, X, Lock } from 'lucide-react';
import { VerificationStatus, UserRole } from './types';

const ProtectedModule: React.FC<{ children: React.ReactNode; title: string; description: string; onOpenAuth: (mode: 'LOGIN' | 'REGISTER') => void; allowedRoles?: UserRole[]; }> = ({ children, title, description, onOpenAuth, allowedRoles }) => {
  const { currentUser } = useAuth();
  const { setActiveNavTab } = useProperties();
  if (!currentUser) return <div className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-3xl text-center shadow-sm min-h-[50vh]"><div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100"><Lock className="w-8 h-8" /></div><h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2><p className="text-sm text-slate-500 mb-8 max-w-md">{description}</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xs"><button onClick={() => onOpenAuth('LOGIN')} className="w-full px-5 py-3 bg-blue-700 text-white rounded-xl font-semibold">Connexion</button><button onClick={() => onOpenAuth('REGISTER')} className="w-full px-5 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold">Créer un compte</button></div></div>;
  if (currentUser.verificationStatus === VerificationStatus.PENDING) return <div className="p-6 bg-white border border-slate-200 rounded-3xl text-center min-h-[40vh] flex flex-col items-center justify-center"><AlertCircle className="w-10 h-10 text-amber-600 mb-4" /><h2 className="font-bold text-lg">Compte en attente de validation</h2><p className="text-sm text-slate-500 mt-2">Votre demande est en cours d'examen.</p></div>;
  if (currentUser.verificationStatus === VerificationStatus.REJECTED) return <div className="p-6 bg-white border border-slate-200 rounded-3xl text-center min-h-[40vh] flex flex-col items-center justify-center"><X className="w-10 h-10 text-red-600 mb-4" /><h2 className="font-bold text-lg">Demande refusée</h2><p className="text-sm text-slate-500 mt-2">Contactez le support pour plus d'informations.</p></div>;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) { setTimeout(() => setActiveNavTab(currentUser.role === UserRole.ADMIN ? 'admin_dashboard' : 'marketplace'), 0); return <div className="p-6 bg-white border border-slate-200 rounded-3xl text-center"><Lock className="w-8 h-8 text-red-600 mx-auto mb-3" /><h2 className="font-bold">Accès refusé</h2></div>; }
  return <>{children}</>;
};

const MainAppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeNavTab, selectedListing, setSelectedListing, toastMessage, setActiveNavTab } = useProperties();
  React.useEffect(() => { if (!currentUser) return; if (currentUser.role === UserRole.ADMIN && activeNavTab === 'marketplace') setActiveNavTab('admin_dashboard'); if (currentUser.role !== UserRole.ADMIN && ['admin_accueil', 'admin_dashboard', 'admin_sponsors', 'admin_branding'].includes(activeNavTab)) setActiveNavTab('marketplace'); }, [currentUser?.role]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const handleOpenAuth = (mode: 'LOGIN' | 'REGISTER' = 'LOGIN') => { setAuthModalMode(mode); setIsAuthModalOpen(true); };
  const renderActiveView = () => {
    switch (activeNavTab) {
      case 'marketplace': return <MarketplaceView />;
      case 'furniture_marketplace': return <FurnitureMarketplaceView />;
      case 'hotel_partners': return <HotelPartnersView />;
      case 'connectivity_partners': return <ConnectivityPartnersView />;
      case 'accounts': case 'menu': return <UserMenuView onOpenAuth={handleOpenAuth} />;
      case 'services': return <InformationView kind="services" />;
      case 'about': return <InformationView kind="about" />;
      case 'contact': return <InformationView kind="contact" />;
      case 'settings': return <InformationView kind="settings" />;
      case 'agent_dashboard': return <ProtectedModule title="Tableau de bord Agent" description="Connectez-vous pour accéder à ce module." onOpenAuth={handleOpenAuth}><AgentDashboardView /></ProtectedModule>;
      case 'owner_properties': return <ProtectedModule title="Mes Biens" description="Connectez-vous pour gérer votre patrimoine immobilier." onOpenAuth={handleOpenAuth}><OwnerPropertiesView /></ProtectedModule>;
      case 'audit': return <ProtectedModule title="Audit de l'État" description="Accès sécurisé pour l'audit." onOpenAuth={handleOpenAuth}><StateAuditorView /></ProtectedModule>;
      case 'admin_accueil': case 'admin_dashboard': case 'admin_sponsors': return <ProtectedModule title="Administration" description="Connectez-vous pour accéder au panneau d'administration." onOpenAuth={handleOpenAuth} allowedRoles={[UserRole.ADMIN]}><AdminView /></ProtectedModule>;
      case 'admin_branding': return <ProtectedModule title="Identité visuelle" description="Accès réservé à l'administration." onOpenAuth={handleOpenAuth} allowedRoles={[UserRole.ADMIN]}><BrandingSettings /></ProtectedModule>;
      case 'dev_logs': case 'dev_dashboard': return <ProtectedModule title="Logs Développeur" description="Connectez-vous pour accéder aux logs applicatifs." onOpenAuth={handleOpenAuth}><DeveloperAuditLogsView /></ProtectedModule>;
      case 'journal': return <JournalView />;
      case 'messages': return <ProtectedModule title="Connectez-vous pour accéder à vos messages" description="Vous devez être connecté pour utiliser la messagerie ImmoSecureNet." onOpenAuth={handleOpenAuth}><MessagingView /></ProtectedModule>;
      case 'notifications': return <ProtectedModule title="Connectez-vous pour accéder à vos notifications" description="Vous devez être connecté pour voir vos alertes." onOpenAuth={handleOpenAuth}><NotificationsView /></ProtectedModule>;
      default: return <MarketplaceView />;
    }
  };
  return <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col font-sans antialiased overflow-x-hidden">{toastMessage && <div className="fixed top-4 left-3 right-3 sm:left-auto sm:right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold max-w-md bg-white/95 border-slate-200 text-slate-800">{toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}{toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}{toastMessage.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}<span className="flex-1">{toastMessage.message}</span></div>}<Header onOpenAuth={handleOpenAuth} /><div className="flex-1 flex max-w-[1600px] w-full mx-auto min-w-0"><Sidebar /><main className="flex-1 min-w-0 px-3 sm:px-6 lg:px-8 py-4 sm:py-5 pb-24 md:pb-8 max-w-7xl mx-auto w-full"><ErrorBoundary key={activeNavTab}>{renderActiveView()}</ErrorBoundary></main></div><BottomNav /><AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authModalMode} />{selectedListing && <PropertyDetailModal listing={selectedListing} onClose={() => setSelectedListing(null)} />}</div>;
};

export default function App() { return <AuthProvider><PropertyProvider><MainAppContent /></PropertyProvider></AuthProvider>; }
