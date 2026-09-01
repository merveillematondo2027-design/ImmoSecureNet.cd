import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
  UserRole,
} from '../types';
import { PropertyTypeKey } from '../data/propertyCatalog';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

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

export type CartItem = {
  id: string;
  userId: string;
  listingId: string;
  title: string;
  price: number;
  currency: string;
  image: string;
  createdAt: string;
};

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '', city: '', propertyType: '', listingType: '', minPrice: 0, maxPrice: 2000000,
  bedrooms: 0, verifiedOnly: false, cadastreVerifiedOnly: false, sortBy: 'NEWEST',
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
  cartItems: CartItem[];
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
  addToCart: (listing: Listing) => Promise<boolean>;
  removeFromCart: (listingId: string) => Promise<boolean>;
  setSelectedListing: (listing: Listing | null) => void;
  setActiveNavTab: (tab: string) => void;
  setActiveSubView: (view?: string) => void;
  setActiveConversationId: (id: string | null) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  createListing: (listingData: Partial<Listing>) => Promise<boolean>;
  logStateAuditAction: (action: any) => Promise<void>;
  updateListing: (id: string, listingData: Partial<Listing>) => Promise<boolean>;
  deleteListing: (id: string) => Promise<boolean>;
  createProperty: (propData: Partial<Property>) => Promise<boolean>;
  updateProperty: (id: string, propData: Partial<Property>) => Promise<boolean>;
  submitInquiry: (inquiryData: Partial<PropertyInquiry>) => Promise<boolean>;
  sendChatMessage: (conversationId: string, content: string) => Promise<boolean>;
  performStateAudit: (auditData: {
    resourceType: StateAuditLog['resourceType']; resourceId: string; resourceIdentifier: string;
    action: StateAuditLog['action']; justification: string; verdict: StateAuditLog['verdict'];
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

const mergeById = <T extends { id: string }>(...groups: T[][]): T[] => {
  const map = new Map<string, T>();
  groups.flat().forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
};

const catalogKeyFromLegacy = (type?: PropertyType): PropertyTypeKey => {
  if (type === PropertyType.LAND) return 'landParcel';
  if (type === PropertyType.VILLA) return 'villa';
  if (type === PropertyType.HOUSE) return 'house';
  if (type === PropertyType.BUILDING) return 'apartmentBuilding';
  if (type === PropertyType.COMMERCIAL) return 'commercialHouse';
  return 'apartment';
};

const legacyTypeFromCatalog = (value: unknown): PropertyType => {
  const key = String(value || 'apartment');
  if (Object.values(PropertyType).includes(key as PropertyType)) return key as PropertyType;
  if (key === 'landParcel') return PropertyType.LAND;
  if (key === 'villa') return PropertyType.VILLA;
  if (key === 'apartmentBuilding') return PropertyType.BUILDING;
  if (['office', 'commercialHouse', 'factory', 'industrialPremises', 'storageSpace'].includes(key)) return PropertyType.COMMERCIAL;
  if (['house', 'furnishedResidence', 'hostel'].includes(key)) return PropertyType.HOUSE;
  return PropertyType.APARTMENT;
};

const normalizeListing = (id: string, data: any, forcedType?: ListingType): Listing => {
  const listingType = forcedType || data.listingType || (data.transactionType === 'rental' ? ListingType.RENT : ListingType.SALE);
  const propertyTypeKey = Object.values(PropertyType).includes(data.propertyType)
    ? catalogKeyFromLegacy(data.propertyType)
    : String(data.propertyType || data.propertyTypeKey || 'apartment') as PropertyTypeKey;
  const details = data.propertyDetails || {};
  const location = data.location || { address: '', city: '', neighborhood: '', country: 'RD Congo' };
  return {
    ...data,
    id,
    listingType,
    propertyType: legacyTypeFromCatalog(propertyTypeKey),
    propertyTypeKey,
    propertyDetails: details,
    location: {
      address: String(location.address || ''),
      city: String(location.city || location.cityName || location.cityId || ''),
      neighborhood: String(location.neighborhood || location.neighborhoodName || location.neighborhoodId || ''),
      country: String(location.country || 'RD Congo'),
      coordinates: location.coordinates,
      provinceId: location.provinceId,
      cityId: location.cityId,
      communeId: location.communeId,
      neighborhoodId: location.neighborhoodId,
    },
    bedrooms: Number(details.bedrooms === '9_plus' ? 9 : details.bedrooms ?? data.bedrooms ?? 0),
  } as Listing;
};

const collectionForListingType = (type: ListingType) => type === ListingType.RENT ? 'rentalProperties' : 'saleProperties';

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [publicListings, setPublicListings] = useState<Listing[]>([]);
  const [ownListings, setOwnListings] = useState<Listing[]>([]);
  const [adminListings, setAdminListings] = useState<Listing[]>([]);
  const [sponsoredAds, setSponsoredAds] = useState<SponsoredAd[]>([]);
  const [stateAuditLogs, setStateAuditLogs] = useState<StateAuditLog[]>([]);
  const [developerLogs, setDeveloperLogs] = useState<DeveloperLog[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages] = useState<ChatMessage[]>([]);
  const [inquiries, setInquiries] = useState<PropertyInquiry[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [activeNavTab, setActiveNavTab] = useState('marketplace');
  const [activeSubView, setActiveSubView] = useState<string | undefined>();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const listings = useMemo(() => currentUser?.role === UserRole.ADMIN
    ? adminListings
    : mergeById(publicListings, ownListings), [currentUser?.role, publicListings, ownListings, adminListings]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ message, type });
    window.setTimeout(() => setToastMessage(null), 4000);
  }, []);

  useEffect(() => onSnapshot(collection(db, 'properties'), (snap) => setProperties(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }) as Property)), (error) => console.warn('properties:', error.code)), []);

  // Migration progressive : les deux nouvelles collections sont canoniques, l'ancienne collection listings reste lue temporairement.
  useEffect(() => {
    let rental: Listing[] = [];
    let sale: Listing[] = [];
    let legacy: Listing[] = [];
    const sync = () => setPublicListings(mergeById(legacy, sale, rental));
    const unsubs = [
      onSnapshot(query(collection(db, 'rentalProperties'), where('status', '==', ListingStatus.ACTIVE)), (snap) => { rental = snap.docs.map((d) => normalizeListing(d.id, d.data(), ListingType.RENT)); sync(); }, (error) => console.warn('rentalProperties:', error.code)),
      onSnapshot(query(collection(db, 'saleProperties'), where('status', '==', ListingStatus.ACTIVE)), (snap) => { sale = snap.docs.map((d) => normalizeListing(d.id, d.data(), ListingType.SALE)); sync(); }, (error) => console.warn('saleProperties:', error.code)),
      onSnapshot(query(collection(db, 'listings'), where('status', '==', ListingStatus.ACTIVE)), (snap) => { legacy = snap.docs.map((d) => normalizeListing(d.id, d.data())); sync(); }, (error) => console.warn('legacy listings:', error.code)),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  useEffect(() => onSnapshot(collection(db, 'sponsoredAds'), (snap) => setSponsoredAds(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }) as SponsoredAd)), (error) => console.warn('sponsoredAds:', error.code)), []);

  useEffect(() => {
    setOwnListings([]); setAdminListings([]); setFavorites([]); setCartItems([]); setNotifications([]); setConversations([]); setInquiries([]); setJournalEntries([]); setStateAuditLogs([]); setDeveloperLogs([]);
    if (!currentUser) return;
    const unsubs: Array<() => void> = [];

    if (currentUser.role === UserRole.ADMIN) {
      let rental: Listing[] = []; let sale: Listing[] = []; let legacy: Listing[] = [];
      const sync = () => setAdminListings(mergeById(legacy, sale, rental));
      unsubs.push(onSnapshot(collection(db, 'rentalProperties'), (snap) => { rental = snap.docs.map((d) => normalizeListing(d.id, d.data(), ListingType.RENT)); sync(); }, (error) => console.warn('admin rental:', error.code)));
      unsubs.push(onSnapshot(collection(db, 'saleProperties'), (snap) => { sale = snap.docs.map((d) => normalizeListing(d.id, d.data(), ListingType.SALE)); sync(); }, (error) => console.warn('admin sale:', error.code)));
      unsubs.push(onSnapshot(collection(db, 'listings'), (snap) => { legacy = snap.docs.map((d) => normalizeListing(d.id, d.data())); sync(); }, (error) => console.warn('admin legacy:', error.code)));
    } else if ([UserRole.AGENT, UserRole.AGENCY, UserRole.OWNER].includes(currentUser.role)) {
      let rental: Listing[] = []; let sale: Listing[] = []; let legacy: Listing[] = [];
      const sync = () => setOwnListings(mergeById(legacy, sale, rental));
      unsubs.push(onSnapshot(query(collection(db, 'rentalProperties'), where('publishedBy.id', '==', currentUser.id)), (snap) => { rental = snap.docs.map((d) => normalizeListing(d.id, d.data(), ListingType.RENT)); sync(); }, (error) => console.warn('own rental:', error.code)));
      unsubs.push(onSnapshot(query(collection(db, 'saleProperties'), where('publishedBy.id', '==', currentUser.id)), (snap) => { sale = snap.docs.map((d) => normalizeListing(d.id, d.data(), ListingType.SALE)); sync(); }, (error) => console.warn('own sale:', error.code)));
      unsubs.push(onSnapshot(query(collection(db, 'listings'), where('publishedBy.id', '==', currentUser.id)), (snap) => { legacy = snap.docs.map((d) => normalizeListing(d.id, d.data())); sync(); }, (error) => console.warn('own legacy:', error.code)));
    }

    unsubs.push(onSnapshot(query(collection(db, 'favorites'), where('userId', '==', currentUser.id)), (snap) => setFavorites(snap.docs.map((d) => String(d.data().listingId))), (error) => console.warn('favorites:', error.code)));
    unsubs.push(onSnapshot(query(collection(db, 'carts'), where('userId', '==', currentUser.id)), (snap) => setCartItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }) as CartItem)), (error) => console.warn('carts:', error.code)));
    unsubs.push(onSnapshot(query(collection(db, 'notifications'), where('userId', '==', currentUser.id)), (snap) => setNotifications(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }) as NotificationItem)), (error) => console.warn('notifications:', error.code)));
    unsubs.push(onSnapshot(query(collection(db, 'conversations'), where('participantIds', 'array-contains', currentUser.id)), (snap) => setConversations(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }) as Conversation)), (error) => console.warn('conversations:', error.code)));
    unsubs.push(onSnapshot(query(collection(db, 'inquiries'), where('senderId', '==', currentUser.id)), (snap) => setInquiries(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }) as PropertyInquiry)), (error) => console.warn('inquiries:', error.code)));
    unsubs.push(onSnapshot(query(collection(db, 'journal'), where('userId', '==', currentUser.id)), (snap) => setJournalEntries(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }) as JournalEntry)), (error) => console.warn('journal:', error.code)));

    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.STATE_AUDITOR) {
      unsubs.push(onSnapshot(collection(db, 'auditLogs'), (snap) => {
        const raw = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setStateAuditLogs(raw.filter((x: any) => x.kind === 'STATE_AUDIT') as StateAuditLog[]);
        setDeveloperLogs(raw.filter((x: any) => x.kind === 'DEVELOPER') as DeveloperLog[]);
      }, (error) => console.warn('auditLogs:', error.code)));
    }

    return () => unsubs.forEach((u) => u());
  }, [currentUser?.id, currentUser?.role]);

  const addJournal = useCallback(async (action: string, details: string, category: JournalEntry['category'] = 'AUTH') => {
    if (!currentUser) return;
    await addDoc(collection(db, 'journal'), {
      userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role,
      action, details, category, timestamp: new Date().toISOString(), ipAddress: '', device: navigator.userAgent,
    });
  }, [currentUser]);

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const toggleFavorite = (listingId: string) => {
    if (!currentUser) { setActiveNavTab('menu'); showToast('Connectez-vous ou créez un compte pour utiliser les favoris.', 'info'); return; }
    void (async () => {
      const ref = doc(db, 'favorites', `${currentUser.id}_${listingId}`);
      if (favorites.includes(listingId)) { await deleteDoc(ref); showToast('Retiré des favoris.', 'info'); }
      else { await setDoc(ref, { userId: currentUser.id, listingId, createdAt: new Date().toISOString() }); showToast('Ajouté aux favoris.', 'success'); }
    })();
  };

  const addToCart = async (listing: Listing) => {
    if (!currentUser) { setActiveNavTab('menu'); showToast('Connectez-vous ou créez un compte pour utiliser le panier.', 'info'); return false; }
    try {
      await setDoc(doc(db, 'carts', `${currentUser.id}_${listing.id}`), {
        userId: currentUser.id, listingId: listing.id, title: listing.title, price: listing.price,
        currency: listing.currency, image: listing.mainPhoto, createdAt: new Date().toISOString(),
      });
      showToast('Annonce ajoutée à Mon panier.', 'success'); return true;
    } catch (error) { console.error(error); showToast('Ajout au panier impossible.', 'error'); return false; }
  };

  const removeFromCart = async (listingId: string) => {
    if (!currentUser) return false;
    try { await deleteDoc(doc(db, 'carts', `${currentUser.id}_${listingId}`)); return true; } catch { return false; }
  };

  const createListing = async (listingData: Partial<Listing>): Promise<boolean> => {
    if (!currentUser || ![UserRole.AGENT, UserRole.AGENCY, UserRole.OWNER, UserRole.ADMIN].includes(currentUser.role)) {
      showToast('Un compte professionnel validé est requis pour publier.', 'error'); return false;
    }
    try {
      const listingType = listingData.listingType || ListingType.SALE;
      const collectionName = collectionForListingType(listingType);
      const ref = doc(collection(db, collectionName));
      const now = new Date().toISOString();
      const source: any = listingData;
      const propertyTypeKey: PropertyTypeKey = source.propertyTypeKey || catalogKeyFromLegacy(listingData.propertyType);
      const status = currentUser.role === UserRole.ADMIN ? (listingData.status || ListingStatus.ACTIVE) : ListingStatus.PENDING_REVIEW;
      const publishedBy = listingData.publishedBy || {
        id: currentUser.id, name: currentUser.fullName, role: currentUser.role, avatarUrl: currentUser.avatarUrl || null,
        companyName: currentUser.companyName || null, isVerified: currentUser.verificationStatus === VerificationStatus.VERIFIED,
        phone: currentUser.phone || '', email: currentUser.email,
      };
      const location: any = listingData.location || {};
      const propertyDetails = source.propertyDetails || {
        bedrooms: String(listingData.bedrooms || 0), parkingCapacity: '0', generator: false, solarPanels: false,
        waterTank: false, furnished: false, swimmingPool: false, shortStayAvailable: false,
      };
      await setDoc(ref, {
        id: ref.id,
        propertyId: listingData.propertyId || ref.id,
        propertyType: propertyTypeKey,
        transactionType: listingType === ListingType.RENT ? 'rental' : 'sale',
        title: listingData.title || 'Nouvelle annonce immobilière',
        description: listingData.fullDescription || listingData.shortDescription || '',
        shortDescription: listingData.shortDescription || '',
        fullDescription: listingData.fullDescription || '',
        price: Number(listingData.price || 0),
        currency: listingData.currency || 'USD',
        location: {
          provinceId: location.provinceId || '', cityId: location.cityId || '', communeId: location.communeId || '', neighborhoodId: location.neighborhoodId || '',
          address: location.address || '', city: location.city || '', neighborhood: location.neighborhood || '', country: location.country || 'RD Congo',
          latitude: location.latitude ?? location.coordinates?.lat ?? null, longitude: location.longitude ?? location.coordinates?.lng ?? null,
        },
        propertyDetails,
        surface: Number(listingData.surface || 0), bathrooms: Number(listingData.bathrooms || 0),
        features: listingData.features || [], mainPhoto: listingData.mainPhoto || '', galleryPhotos: listingData.galleryPhotos || [],
        status, publishedBy, viewsCount: 0, inquiriesCount: 0, isFeatured: false, publishedAt: now, createdAt: now, updatedAt: now,
      });
      await addJournal('Publication d’annonce', `Annonce « ${listingData.title || 'Nouvelle annonce immobilière'} » soumise`, 'LISTING');
      showToast(currentUser.role === UserRole.ADMIN ? 'Annonce publiée.' : 'Annonce envoyée à l’administration pour validation.', 'success');
      return true;
    } catch (error) { console.error(error); showToast('Publication impossible.', 'error'); return false; }
  };

  const updateListing = async (id: string, listingData: Partial<Listing>) => {
    const current = listings.find((item) => item.id === id);
    if (!current) return false;
    try {
      const payload: any = { ...listingData, updatedAt: new Date().toISOString() };
      if (listingData.propertyType) payload.propertyType = catalogKeyFromLegacy(listingData.propertyType);
      delete payload.listingType;
      await updateDoc(doc(db, collectionForListingType(current.listingType), id), payload);
      return true;
    } catch (error) { console.error(error); showToast('Modification impossible.', 'error'); return false; }
  };

  const deleteListing = async (id: string) => {
    const current = listings.find((item) => item.id === id);
    if (!current) return false;
    try { await deleteDoc(doc(db, collectionForListingType(current.listingType), id)); showToast('Annonce supprimée.', 'info'); return true; }
    catch (error) { console.error(error); showToast('Suppression impossible.', 'error'); return false; }
  };

  const createProperty = async (propData: Partial<Property>) => {
    if (!currentUser || ![UserRole.AGENT, UserRole.AGENCY, UserRole.OWNER, UserRole.ADMIN].includes(currentUser.role)) {
      showToast('Un compte professionnel validé est requis.', 'error'); return false;
    }
    try {
      const ref = doc(collection(db, 'properties')); const now = new Date().toISOString();
      const property: Property = {
        id: ref.id, cadastralReference: propData.cadastralReference || '', titleDeedNumber: propData.titleDeedNumber || '',
        ownerId: currentUser.id, ownerName: currentUser.fullName, propertyType: propData.propertyType || PropertyType.APARTMENT,
        address: propData.address || '', city: propData.city || 'Kinshasa', country: propData.country || 'RD Congo',
        surface: Number(propData.surface || 0), bedrooms: propData.bedrooms || 0, bathrooms: propData.bathrooms || 0,
        floors: propData.floors || 0, yearBuilt: propData.yearBuilt || new Date().getFullYear(),
        verificationStatus: VerificationStatus.PENDING, documents: propData.documents || [], createdAt: now, updatedAt: now,
        taxComplianceStatus: 'EN_COURS', hasLitigationFlag: false, notes: propData.notes,
      };
      await setDoc(ref, property); showToast('Bien enregistré.', 'success'); return true;
    } catch (error) { console.error(error); showToast('Enregistrement impossible.', 'error'); return false; }
  };

  const updateProperty = async (id: string, propData: Partial<Property>) => {
    try { await updateDoc(doc(db, 'properties', id), { ...propData, updatedAt: new Date().toISOString() }); return true; }
    catch (error) { console.error(error); showToast('Modification impossible.', 'error'); return false; }
  };

  const submitInquiry = async (inquiryData: Partial<PropertyInquiry>) => {
    if (!currentUser) { setActiveNavTab('menu'); showToast('Connectez-vous ou créez un compte pour contacter l’annonceur.', 'info'); return false; }
    const listing = listings.find((l) => l.id === inquiryData.listingId);
    if (!listing) return false;
    try {
      const ref = doc(collection(db, 'inquiries'));
      await setDoc(ref, {
        id: ref.id, listingId: listing.id, listingTitle: listing.title,
        senderId: currentUser.id, receiverId: listing.publishedBy.id,
        senderName: currentUser.fullName, senderEmail: currentUser.email, senderPhone: currentUser.phone,
        message: inquiryData.message || '', inquiryType: inquiryData.inquiryType || 'GENERAL', status: 'NEW', createdAt: new Date().toISOString(),
      });
      showToast('Votre demande a été envoyée à l’annonceur.', 'success'); return true;
    } catch (error) { console.error(error); showToast('Envoi impossible.', 'error'); return false; }
  };

  const sendChatMessage = async (conversationId: string, content: string) => {
    if (!currentUser || !content.trim()) return false;
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversation = await getDoc(conversationRef);
      if (!conversation.exists()) return false;
      const messageRef = doc(collection(conversationRef, 'messages'));
      const now = new Date().toISOString();
      await setDoc(messageRef, {
        id: messageRef.id, conversationId, senderId: currentUser.id, senderName: currentUser.fullName,
        senderRole: currentUser.role, text: content.trim(), timestamp: now, isRead: false,
      });
      await updateDoc(conversationRef, { lastMessage: content.trim(), lastMessageAt: now, lastMessageTimestamp: now });
      return true;
    } catch (error) { console.error(error); showToast('Message non envoyé.', 'error'); return false; }
  };

  const sendMessage = (conversationId: string, text: string) => { void sendChatMessage(conversationId, text); };

  const logStateAuditAction = async (action: any) => {
    if (!currentUser) return;
    await addDoc(collection(db, 'auditLogs'), { kind: 'STATE_AUDIT', actorId: currentUser.id, ...action, timestamp: new Date().toISOString() });
  };

  const performStateAudit = async (auditData: { resourceType: StateAuditLog['resourceType']; resourceId: string; resourceIdentifier: string; action: StateAuditLog['action']; justification: string; verdict: StateAuditLog['verdict']; }) => {
    if (!currentUser || auditData.justification.trim().length < 5) return { success: false, error: 'Justification obligatoire.' };
    try {
      await addDoc(collection(db, 'auditLogs'), {
        kind: 'STATE_AUDIT', actorId: currentUser.id, auditorId: currentUser.id, auditorName: currentUser.fullName,
        auditorDepartment: currentUser.department || '', ...auditData, timestamp: new Date().toISOString(), ipAddress: '', device: navigator.userAgent,
      });
      showToast('Audit enregistré.', 'success'); return { success: true };
    } catch { return { success: false, error: 'Enregistrement de l’audit impossible.' }; }
  };

  const markNotificationAsRead = (id: string) => { void updateDoc(doc(db, 'notifications', id), { isRead: true }); };
  const markAllNotificationsAsRead = () => { notifications.filter((n) => !n.isRead).forEach((n) => void updateDoc(doc(db, 'notifications', n.id), { isRead: true })); };

  const createSponsoredAd = async (adData: Partial<SponsoredAd>) => {
    if (currentUser?.role !== UserRole.ADMIN) return false;
    try {
      const ref = doc(collection(db, 'sponsoredAds'));
      await setDoc(ref, {
        id: ref.id, title: adData.title || '', tagline: adData.tagline || '', description: adData.description || '',
        imageUrl: adData.imageUrl || '', targetUrl: adData.targetUrl || '', sponsorName: adData.sponsorName || '', sponsorBadge: adData.sponsorBadge || '',
        startDate: adData.startDate || new Date().toISOString().split('T')[0], endDate: adData.endDate || '', isActive: true,
        impressionsCount: 0, clicksCount: 0, position: adData.position || 'MARKETPLACE_CARD',
      });
      return true;
    } catch { return false; }
  };

  const toggleSponsoredAd = (id: string) => { const ad = sponsoredAds.find((a) => a.id === id); if (ad) void updateDoc(doc(db, 'sponsoredAds', id), { isActive: !ad.isActive }); };
  const deleteSponsoredAd = (id: string) => { void deleteDoc(doc(db, 'sponsoredAds', id)); };
  const trackSponsoredAdClick = (id: string) => { const ad = sponsoredAds.find((a) => a.id === id); if (ad) void updateDoc(doc(db, 'sponsoredAds', id), { clicksCount: Number(ad.clicksCount || 0) + 1 }); };

  const addDeveloperLogEntry = (level: LogLevel, module: DeveloperLog['module'], message: string, details?: Record<string, unknown> | string) => {
    if (!currentUser) return;
    void addDoc(collection(db, 'auditLogs'), {
      kind: 'DEVELOPER', actorId: currentUser.id, level, module, message, details: details || null,
      timestamp: new Date().toISOString(), userId: currentUser.id, ipAddress: '', statusCode: 200, durationMs: 0,
    });
  };
  const clearDeveloperLogs = () => showToast('Les journaux réels ne sont pas effacés depuis le client.', 'info');

  return <PropertyContext.Provider value={{
    properties, listings, sponsoredAds, stateAuditLogs, developerLogs, journalEntries, notifications, conversations, messages, inquiries,
    cartItems, filters, favorites, selectedListing, activeNavTab, activeSubView, activeConversationId, toastMessage,
    setFilters, resetFilters, toggleFavorite, addToCart, removeFromCart, setSelectedListing, setActiveNavTab, setActiveSubView,
    setActiveConversationId, showToast, createListing, updateListing, deleteListing, createProperty, updateProperty, submitInquiry,
    logStateAuditAction, sendChatMessage, performStateAudit, markNotificationAsRead, markAllNotificationsAsRead, sendMessage,
    createSponsoredAd, toggleSponsoredAd, deleteSponsoredAd, trackSponsoredAdClick, addDeveloperLogEntry, clearDeveloperLogs,
    refreshData: () => undefined,
  }}>{children}</PropertyContext.Provider>;
};

export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (!context) throw new Error('useProperties must be used within a PropertyProvider');
  return context;
};
