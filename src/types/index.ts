export enum UserRole {
  USER = 'client',
  AGENT = 'AGENT',
  AGENCY = 'AGENCY',
  OWNER = 'OWNER',
  STATE_AUDITOR = 'STATE_AUDITOR',
  ADMIN = 'admin_general',
  DEVELOPER_AUDITOR = 'DEVELOPER_AUDITOR',
}

export enum VerificationStatus {
  NOT_VERIFIED = 'NOT_VERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export enum PropertyType {
  APARTMENT = 'APARTMENT',
  VILLA = 'VILLA',
  HOUSE = 'HOUSE',
  LAND = 'LAND',
  COMMERCIAL = 'COMMERCIAL',
  BUILDING = 'BUILDING',
}

export enum ListingType {
  SALE = 'SALE',
  RENT = 'RENT',
}

export enum ListingStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  RENTED = 'RENTED',
  EXPIRED = 'EXPIRED',
  ARCHIVED = 'ARCHIVED',
  SUSPENDED = 'SUSPENDED',
}

export enum DocumentType {
  TITRE_FONCIER = 'TITRE_FONCIER',
  DIAGNOSTIC_TECHNIQUE = 'DIAGNOSTIC_TECHNIQUE',
  ATTESTATION_PROPRIETE = 'ATTESTATION_PROPRIETE',
  PLAN_CADASTRAL = 'PLAN_CADASTRAL',
  CARTE_PROFESSIONNELLE = 'CARTE_PROFESSIONNELLE',
  REGISTRE_COMMERCE = 'REGISTRE_COMMERCE',
  JUSTIFICATIF_IDENTITE = 'JUSTIFICATIF_IDENTITE',
  CERTIFICAT_NON_LITIGE = 'CERTIFICAT_NON_LITIGE',
}

export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
  SECURITY = 'SECURITY',
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  avatarUrl?: string;
  companyName?: string;
  professionalLicenseNumber?: string; // Carte pro / SIRET / NIF
  identityCardNumber?: string;
  department?: string; // e.g. "Direction Générale du Cadastre & Conservation des Titres" for STATE_AUDITOR
  accreditationCode?: string;
  createdAt: string;
  lastLoginAt?: string;
  permissions: string[];
  isTwoFactorEnabled?: boolean;
}

export interface PropertyDocument {
  id: string;
  propertyId: string;
  title: string;
  documentType: DocumentType;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  uploadedAt: string;
  isConfidential: boolean; // Confidential docs only visible to Owner, Agent, State Auditor, Admin
  notes?: string;
}

export interface Property {
  id: string;
  cadastralReference: string; // Cadastre ref e.g. "CAD-2026-KIN-0894"
  titleDeedNumber: string; // Numéro du titre foncier officiel
  ownerId: string;
  ownerName: string;
  propertyType: PropertyType;
  address: string;
  city: string;
  country: string;
  surface: number; // m²
  title?: string;
  location?: any;
  estimatedValue?: number;
  isPublishedOnMarketplace?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  yearBuilt?: number;
  verificationStatus: VerificationStatus;
  documents: PropertyDocument[];
  createdAt: string;
  updatedAt: string;
  taxComplianceStatus: 'CONFORME' | 'EN_COURS' | 'NON_CONFORME';
  hasLitigationFlag: boolean;
  notes?: string;
}

export interface Listing {
  id: string;
  propertyId: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  listingType: ListingType;
  propertyType: PropertyType;
  price: number;
  currency: 'USD' | 'EUR' | 'XAF' | 'FCFA';
  location: {
    address: string;
    city: string;
    neighborhood: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  surface: number; // m²
  bedrooms: number;
  bathrooms: number;
  features: string[]; // e.g. ['Piscine', 'Sécurité 24/7', 'Groupe électrogène', 'Vue panoramique', 'Parking 2 véhicules', 'Climatisation']
  mainPhoto: string;
  galleryPhotos: string[];
  status: ListingStatus;
  publishedBy: {
    id: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
    companyName?: string;
    isVerified: boolean;
    phone: string;
    email: string;
  };
  viewsCount: number;
  inquiriesCount: number;
  isFeatured?: boolean;
  publishedAt: string;
  updatedAt: string;
  virtualTourUrl?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  category: 'AUTH' | 'PROPERTY' | 'LISTING' | 'DOCUMENT' | 'AUDIT' | 'MESSAGE' | 'SECURITY';
  timestamp: string;
  ipAddress: string;
  device: string;
}

export interface StateAuditLog {
  id: string;
  auditorId: string;
  auditorName: string;
  auditorDepartment: string;
  action: 'CONSULTATION_DOSSIER' | 'VERIFICATION_CADASTRE' | 'VERIFICATION_DOCUMENT' | 'SIGNALEMENT_ANOMALIE' | 'VALIDATION_TITRE' | 'EXPORT_RAPPORT';
  resourceType: 'PROPERTY' | 'LISTING' | 'DOCUMENT' | 'USER' | 'AGENCY';
  resourceId: string;
  resourceIdentifier: string; // e.g. "CAD-2026-KIN-0894 - Villa La Palmeraie"
  justification: string; // Obligatoire pour accès aux données sensibles
  targetCadastralRef?: string;
  reason?: string;
  notes?: string;
  verdict: 'CONFORME' | 'ANOMALIE_SUSPECTE' | 'DOCUMENT_REQUIS' | 'CERTIFIE_AUTHENTIQUE' | 'SOUS_ENQUETE';
  timestamp: string;
  ipAddress: string;
  device: string;
}

export interface DeveloperLog {
  id: string;
  level: LogLevel;
  module: 'AUTH_SERVICE' | 'RBAC_SECURITY' | 'MARKETPLACE_API' | 'CADASTRE_SYNC' | 'DOC_VAULT' | 'WEBSOCKET_PUSH' | 'SPONSOR_ENGINE';
  message: string;
  details?: Record<string, unknown> | string;
  timestamp: string;
  userId?: string;
  ipAddress: string;
  statusCode?: number;
  durationMs?: number;
  stackTrace?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ACCOUNT' | 'SECURITY' | 'LISTING' | 'MESSAGE' | 'VALIDATION' | 'VERIFICATION' | 'AUDIT' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole: UserRole;
  text: string;
  attachmentUrl?: string;
  attachmentName?: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
    isVerified?: boolean;
  }[];
  lastMessage?: string;
  lastMessageTimestamp?: string;
  lastMessageAt?: string;
  unreadCount: number;
  propertyListingId?: string;
  propertyContext?: { title: string; price: number; listingId: string; };
  messages?: any[];
  propertyTitle?: string;
}

export interface SponsoredAd {
  id: string;
  title: string;
  tagline: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  sponsorName: string;
  sponsorBadge: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  impressionsCount: number;
  clicksCount: number;
  position: 'TOP_BANNER' | 'MARKETPLACE_CARD' | 'SIDEBAR';
}

export interface PropertyInquiry {
  id: string;
  listingId: string;
  listingTitle: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  message: string;
  inquiryType: 'VISIT_REQUEST' | 'PRICE_INFO' | 'LEGAL_DOCS' | 'FINANCING' | 'GENERAL';
  status: 'NEW' | 'CONTACTED' | 'SCHEDULED' | 'CLOSED';
  createdAt: string;
}
