import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Property,
  Listing,
  PropertyType,
  ListingType,
  ListingStatus,
  VerificationStatus,
  SponsoredAd,
  StateAuditLog,
  DeveloperLog,
  JournalEntry,
  NotificationItem,
  ChatMessage,
  Conversation,
  PropertyInquiry,
  LogLevel,
  UserRole
} from '../types';
import {
  INITIAL_PROPERTIES,
  INITIAL_LISTINGS,
  INITIAL_SPONSORED_ADS,
  INITIAL_STATE_AUDIT_LOGS,
  INITIAL_DEVELOPER_LOGS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_INQUIRIES,
} from '../data/mockData';
import { useAuth } from './AuthContext';

export interface FilterState {
  searchQuery: string;
  city: string;
  propertyType: string;
  listingType: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  verifiedOnly: boolean;
  cadastreVerifiedOnly: boolean;
  sortBy: 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'SURFACE_DESC' | 'POPULAR';
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  city: '',
  propertyType: '',
  listingType: '',
  minPrice: 0,
  maxPrice: 2000000,
  bedrooms: 0,
  verifiedOnly: false,
  cadastreVerifiedOnly: false,
  sortBy: 'NEWEST',
};

interface PropertyContextType {
  properties: Property[];
  listings: Listing[];
  sponsoredAds: SponsoredAd[];
  stateAuditLogs: StateAuditLog[];
  developerLogs: DeveloperLog[];
  journalEntries: JournalEntry[];
  notifications: NotificationItem[];
  conversations: Conversation[];
  messages: ChatMessage[];
  inquiries: PropertyInquiry[];
  filters: FilterState;
  favorites: string[];
  selectedListing: Listing | null;
  activeNavTab: string;
  activeSubView?: string;
  activeConversationId: string | null;
  toastMessage: { message: string; type: 'success' | 'error' | 'info' } | null;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  toggleFavorite: (listingId: string) => void;
  setSelectedListing: (listing: Listing | null) => void;
  setActiveNavTab: (tab: string) => void;
  setActiveSubView: (view?: string) => void;
  setActiveConversationId: (id: string | null) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  createListing: (listingData: Partial<Listing>) => Promise<boolean>;
  logStateAuditAction: (action: any) => Promise<void>;
  addProperty?: (property: Partial<Property>) => Promise<boolean>;
  updateListing: (id: string, listingData: Partial<Listing>) => Promise<boolean>;
  deleteListing: (id: string) => Promise<boolean>;
  createProperty: (propData: Partial<Property>) => Promise<boolean>;
  updateProperty: (id: string, propData: Partial<Property>) => Promise<boolean>;
  submitInquiry: (inquiryData: Partial<PropertyInquiry>) => Promise<boolean>;
  sendChatMessage: (conversationId: string, content: string) => Promise<boolean>;
  performStateAudit: (auditData: {
    resourceType: StateAuditLog['resourceType'];
    resourceId: string;
    resourceIdentifier: string;
    action: StateAuditLog['action'];
    justification: string;
    verdict: StateAuditLog['verdict'];
  }) => Promise<{ success: boolean; error?: string }>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  sendMessage: (conversationId: string, text: string) => void;
  createSponsoredAd: (adData: Partial<SponsoredAd>) => Promise<boolean>;
  toggleSponsoredAd: (id: string) => void;
  deleteSponsoredAd: (id: string) => void;
  trackSponsoredAdClick: (id: string) => void;
  addDeveloperLogEntry: (level: LogLevel, module: DeveloperLog['module'], message: string, details?: Record<string, unknown> | string) => void;
  clearDeveloperLogs: () => void;
  refreshData: () => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [sponsoredAds, setSponsoredAds] = useState<SponsoredAd[]>(INITIAL_SPONSORED_ADS);
  const [stateAuditLogs, setStateAuditLogs] = useState<StateAuditLog[]>(INITIAL_STATE_AUDIT_LOGS);
  const [developerLogs, setDeveloperLogs] = useState<DeveloperLog[]>(INITIAL_DEVELOPER_LOGS);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(INITIAL_JOURNAL_ENTRIES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inquiries, setInquiries] = useState<PropertyInquiry[]>(INITIAL_INQUIRIES);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('immosecure_favorites');
    return saved ? JSON.parse(saved) : ['lst-001'];
  });
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [activeNavTab, setActiveNavTab] = useState<string>('marketplace');
  const [activeSubView, setActiveSubView] = useState<string | undefined>(undefined);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    localStorage.setItem('immosecure_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  const addJournal = useCallback((action: string, details: string, category: JournalEntry['category'] = 'AUTH') => {
    if (!currentUser) return;
    const newEntry: JournalEntry = {
      id: `jrn-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action,
      details,
      category,
      timestamp: new Date().toISOString(),
      ipAddress: '197.242.10.4',
      device: 'Android Terminal (Touch / Mobile)',
    };
    setJournalEntries((prev) => [newEntry, ...prev]);
  }, [currentUser]);

  const addDeveloperLogEntry = useCallback((
    level: LogLevel,
    module: DeveloperLog['module'],
    message: string,
    details?: Record<string, unknown> | string
  ) => {
    const newLog: DeveloperLog = {
      id: `dev-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      level,
      module,
      message,
      details,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id,
      ipAddress: '127.0.0.1',
      statusCode: 200,
      durationMs: Math.floor(Math.random() * 25) + 4,
    };
    setDeveloperLogs((prev) => [newLog, ...prev]);
  }, [currentUser]);

  const fetchBackendData = useCallback(async () => {
    try {
      const [listRes, propRes, adsRes] = await Promise.all([
        fetch('/api/listings').catch(() => null),
        fetch('/api/properties').catch(() => null),
        fetch('/api/sponsors').catch(() => null),
      ]);

      if (listRes && listRes.ok) {
        const data = await listRes.json();
        setListings(data);
      }
      if (propRes && propRes.ok) {
        const data = await propRes.json();
        setProperties(data);
      }
      if (adsRes && adsRes.ok) {
        const data = await adsRes.json();
        setSponsoredAds(data);
      }
    } catch {
      // Keep local state
    }
  }, []);

  useEffect(() => {
    fetchBackendData();
  }, [fetchBackendData]);

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const toggleFavorite = (listingId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(listingId);
      const updated = exists ? prev.filter((id) => id !== listingId) : [...prev, listingId];
      showToast(exists ? 'Retiré des favoris' : 'Ajouté aux favoris avec succès !', 'info');
      addJournal(
        exists ? 'Favori retiré' : 'Favori ajouté',
        `Annonce ID ${listingId} ${exists ? 'supprimée des' : 'ajoutée aux'} favoris`,
        'LISTING'
      );
      return updated;
    });
  };

  const createListing = async (listingData: Partial<Listing>): Promise<boolean> => {
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData),
      });
      if (res.ok) {
        const created = await res.json();
        setListings((prev) => [created, ...prev]);
        showToast('Annonce publiée avec succès sur la Marketplace !', 'success');
        addJournal('Publication d’annonce', `Annonce "${created.title}" créée`, 'LISTING');
        return true;
      }
    } catch {
      // Local fallback
    }

    const fallbackListing: Listing = {
      id: `lst-${Date.now()}`,
      propertyId: listingData.propertyId || 'prop-custom',
      title: listingData.title || 'Nouvelle annonce immobilière',
      shortDescription: listingData.shortDescription || '',
      fullDescription: listingData.fullDescription || '',
      listingType: listingData.listingType || ListingType.SALE,
      propertyType: listingData.propertyType || PropertyType.APARTMENT,
      price: listingData.price || 150000,
      currency: listingData.currency || 'USD',
      location: listingData.location || {
        address: 'Kinshasa',
        city: 'Kinshasa',
        neighborhood: 'Gombe',
        country: 'RD Congo',
      },
      surface: listingData.surface || 120,
      bedrooms: listingData.bedrooms || 2,
      bathrooms: listingData.bathrooms || 1,
      features: listingData.features || ['Sécurité', 'Climatisation'],
      mainPhoto: listingData.mainPhoto || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      galleryPhotos: listingData.galleryPhotos || [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      ],
      status: listingData.status || ListingStatus.ACTIVE,
      publishedBy: listingData.publishedBy || {
        id: currentUser?.id || 'usr-custom',
        name: currentUser?.fullName || 'Agent Immo',
        role: currentUser?.role || UserRole.AGENT,
        isVerified: true,
        phone: currentUser?.phone || '+243 81 000 0000',
        email: currentUser?.email || 'agent@immosecure.net',
      },
      viewsCount: 1,
      inquiriesCount: 0,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setListings((prev) => [fallbackListing, ...prev]);
    showToast('Annonce créée avec succès !', 'success');
    addJournal('Publication d’annonce', `Annonce "${fallbackListing.title}" créée`, 'LISTING');
    return true;
  };

  const updateListing = async (id: string, listingData: Partial<Listing>): Promise<boolean> => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...listingData, updatedAt: new Date().toISOString() } : l))
    );
    showToast('Annonce mise à jour avec succès.', 'success');
    addJournal('Modification d’annonce', `Mise à jour de l'annonce ID: ${id}`, 'LISTING');
    return true;
  };

  const deleteListing = async (id: string): Promise<boolean> => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    showToast('Annonce supprimée.', 'info');
    addJournal('Suppression d’annonce', `Suppression de l'annonce ID: ${id}`, 'LISTING');
    return true;
  };

  const createProperty = async (propData: Partial<Property>): Promise<boolean> => {
    const newProp: Property = {
      id: `prop-${Date.now()}`,
      cadastralReference: propData.cadastralReference || `CAD-${Date.now()}`,
      titleDeedNumber: propData.titleDeedNumber || `TF-${Date.now()}`,
      ownerId: currentUser?.id || 'usr-owner-04',
      ownerName: currentUser?.fullName || 'Propriétaire',
      propertyType: propData.propertyType || PropertyType.APARTMENT,
      address: propData.address || 'Adresse déclarée',
      city: propData.city || 'Kinshasa',
      country: propData.country || 'RD Congo',
      surface: propData.surface || 100,
      bedrooms: propData.bedrooms || 2,
      bathrooms: propData.bathrooms || 1,
      floors: propData.floors || 1,
      yearBuilt: propData.yearBuilt || 2024,
      verificationStatus: propData.verificationStatus || VerificationStatus.PENDING,
      documents: propData.documents || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      taxComplianceStatus: 'EN_COURS',
      hasLitigationFlag: false,
      notes: propData.notes,
    };

    setProperties((prev) => [newProp, ...prev]);
    showToast('Nouveau bien immobilier enregistré dans votre patrimoine !', 'success');
    addJournal('Déclaration de bien', `Bien Cadastre ${newProp.cadastralReference} enregistré`, 'PROPERTY');
    return true;
  };

  const updateProperty = async (id: string, propData: Partial<Property>): Promise<boolean> => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...propData, updatedAt: new Date().toISOString() } : p))
    );
    showToast('Informations du bien mises à jour.', 'success');
    addJournal('Modification de bien', `Mise à jour du bien Cadastre ID: ${id}`, 'PROPERTY');
    return true;
  };

  const submitInquiry = async (inquiryData: Partial<PropertyInquiry>): Promise<boolean> => {
    const newInquiry: PropertyInquiry = {
      id: `inq-${Date.now()}`,
      listingId: inquiryData.listingId || 'lst-001',
      listingTitle: inquiryData.listingTitle || 'Demande immobilière',
      senderName: inquiryData.senderName || currentUser?.fullName || 'Visiteur',
      senderEmail: inquiryData.senderEmail || currentUser?.email || 'client@immosecure.net',
      senderPhone: inquiryData.senderPhone || currentUser?.phone || '+243 81 000 0000',
      message: inquiryData.message || 'Demande de visite ou informations complémentaires.',
      inquiryType: inquiryData.inquiryType || 'VISIT_REQUEST',
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };

    setInquiries((prev) => [newInquiry, ...prev]);
    showToast('Votre demande a été transmise en toute sécurité au professionnel vérifié !', 'success');
    addJournal('Demande de contact', `Message envoyé pour l'annonce ${newInquiry.listingTitle}`, 'MESSAGE');

    // Notify agent/agency
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: 'usr-agent-02',
      title: 'Nouvelle demande reçue',
      message: `${newInquiry.senderName} vous a envoyé une demande concernant ${newInquiry.listingTitle}`,
      type: 'MESSAGE',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    return true;
  };

  const logStateAuditAction = async (action: any): Promise<void> => {
    console.log("logStateAuditAction", action);
  };
  
  const performStateAudit = async (auditData: {
    resourceType: StateAuditLog['resourceType'];
    resourceId: string;
    resourceIdentifier: string;
    action: StateAuditLog['action'];
    justification: string;
    verdict: StateAuditLog['verdict'];
  }): Promise<{ success: boolean; error?: string }> => {
    if (!auditData.justification || auditData.justification.trim().length < 5) {
      return {
        success: false,
        error: 'La justification légale et le numéro de mission sont obligatoires pour tout acte d’audit étatique.',
      };
    }

    const newAuditLog: StateAuditLog = {
      id: `aud-log-${Date.now()}`,
      auditorId: currentUser?.id || 'usr-auditor-05',
      auditorName: currentUser?.fullName || 'Auditeur d’État',
      auditorDepartment: currentUser?.department || 'Ministère des Affaires Foncières & Cadastre',
      action: auditData.action,
      resourceType: auditData.resourceType,
      resourceId: auditData.resourceId,
      resourceIdentifier: auditData.resourceIdentifier,
      justification: auditData.justification,
      verdict: auditData.verdict,
      timestamp: new Date().toISOString(),
      ipAddress: '10.144.20.18 (Réseau GovNet Sécurisé)',
      device: 'Android Terminal Certifié v14.2',
    };

    setStateAuditLogs((prev) => [newAuditLog, ...prev]);
    addJournal('Acte d’Audit de l’État', `Audit sur ${auditData.resourceIdentifier} [Verdict: ${auditData.verdict}]`, 'AUDIT');
    addDeveloperLogEntry(
      LogLevel.SECURITY,
      'RBAC_SECURITY',
      `State audit executed on ${auditData.resourceIdentifier}`,
      { auditor: currentUser?.fullName, justification: auditData.justification, verdict: auditData.verdict }
    );
    showToast(`Audit enregistré avec succès. Rapport légal horodaté #${newAuditLog.id}.`, 'success');

    return { success: true };
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('Toutes les notifications sont marquées comme lues.', 'info');
  };

  const sendMessage = (conversationId: string, text: string) => {
    if (!text.trim() || !currentUser) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      text,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, lastMessage: text, lastMessageTimestamp: newMsg.timestamp } : c))
    );
    addJournal('Message envoyé', `Message transmis dans la messagerie interne sécurisée`, 'MESSAGE');
  };

  const createSponsoredAd = async (adData: Partial<SponsoredAd>): Promise<boolean> => {
    const newAd: SponsoredAd = {
      id: `ad-${Date.now()}`,
      title: adData.title || 'Campagne Sponsorisée ImmoSecureNet',
      tagline: adData.tagline || 'Partenaire Immobilier Officiel',
      description: adData.description || 'Description de la publicité',
      imageUrl: adData.imageUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
      targetUrl: adData.targetUrl || 'https://immosecure.net',
      sponsorName: adData.sponsorName || 'Partenaire Certifié',
      sponsorBadge: adData.sponsorBadge || 'Sponsor Vérifié',
      startDate: adData.startDate || new Date().toISOString().split('T')[0],
      endDate: adData.endDate || '2026-12-31',
      isActive: true,
      impressionsCount: 0,
      clicksCount: 0,
      position: adData.position || 'TOP_BANNER',
    };

    setSponsoredAds((prev) => [newAd, ...prev]);
    showToast('Campagne publicitaire sponsorisée activée !', 'success');
    addJournal('Campagne Sponsorisée', `Création de la pub "${newAd.title}"`, 'SECURITY');
    return true;
  };

  const toggleSponsoredAd = (id: string) => {
    setSponsoredAds((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
    showToast('Statut de la campagne modifié.', 'info');
  };

  const deleteSponsoredAd = (id: string) => {
    setSponsoredAds((prev) => prev.filter((a) => a.id !== id));
    showToast('Publicité supprimée.', 'info');
  };

  const trackSponsoredAdClick = (id: string) => {
    setSponsoredAds((prev) =>
      prev.map((a) => (a.id === id ? { ...a, clicksCount: a.clicksCount + 1 } : a))
    );
  };

  const clearDeveloperLogs = () => {
    setDeveloperLogs(INITIAL_DEVELOPER_LOGS.slice(0, 3));
    showToast('Logs de simulation réinitialisés.', 'info');
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        listings,
        sponsoredAds,
        stateAuditLogs,
        developerLogs,
        journalEntries,
        notifications,
        conversations,
        messages,
        inquiries,
        filters,
        favorites,
        selectedListing,
        activeNavTab,
        activeSubView,
        activeConversationId,
        toastMessage,
        setFilters,
        resetFilters,
        toggleFavorite,
        setSelectedListing,
        setActiveNavTab,
        setActiveSubView,
        setActiveConversationId,
        showToast,
        createListing,
        updateListing,
        deleteListing,
        createProperty,
        updateProperty,
        submitInquiry,
        logStateAuditAction,
        sendChatMessage: async (id: string, content: string) => { sendMessage(id, content); return true; },
        performStateAudit,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        sendMessage,
        createSponsoredAd,
        toggleSponsoredAd,
        deleteSponsoredAd,
        trackSponsoredAdClick,
        addDeveloperLogEntry,
        clearDeveloperLogs,
        refreshData: fetchBackendData,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
};
