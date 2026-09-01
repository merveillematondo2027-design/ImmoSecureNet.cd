export enum UserRole {
  USER = 'client',
  AGENT = 'AGENT',
  AGENCY = 'AGENCY',
  OWNER = 'OWNER',
  SELLER = 'SELLER',
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
  taxComplianceStatus?: string;
  hasLitigationFlag?: boolean;
}

export interface ListingPublisher {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  companyName?: string;
  isVerified: boolean;
  phone?: string;
  email?: string;
}

export interface ListingLocation {
  address: string;
  city: string;
  neighborhood: string;
  country: string;
  province?: string;
  commune?: string;
  latitude?: number;
  longitude?: number;
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
  currency: string;
  location: ListingLocation;
  surface: number;
  bedrooms: number;
  bathrooms: number;
  features: string[];
  mainPhoto: string;
  galleryPhotos: string[];
  status: ListingStatus;
  publishedBy: ListingPublisher;
  viewsCount: number;
  inquiriesCount: number;
  isFeatured: boolean;
  publishedAt: string;
  updatedAt: string;
}

export interface SponsoredAd {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  targetUrl?: string;
  isActive: boolean;
  clicks?: number;
  impressions?: number;
  createdAt?: string;
}

export interface StateAuditLog {
  id: string;
  kind?: string;
  actorId?: string;
  actorName?: string;
  resourceType: string;
  resourceId: string;
  resourceIdentifier: string;
  action: string;
  justification: string;
  verdict: string;
  timestamp: string;
}

export interface DeveloperLog {
  id: string;
  kind?: string;
  level: LogLevel;
  module: string;
  message: string;
  details?: Record<string, unknown> | string;
  timestamp: string;
  userId?: string;
  ipAddress?: string;
  statusCode?: number;
  durationMs?: number;
}

export interface JournalEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  category: 'AUTH' | 'PROPERTY' | 'LISTING' | 'AUDIT' | 'ACCOUNT' | string;
  timestamp: string;
  ipAddress?: string;
  device?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  isVerified?: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: ConversationParticipant[];
  propertyListingId?: string | null;
  propertyTitle?: string;
  propertyContext?: any;
  lastMessage?: string;
  lastMessageAt?: string;
  lastMessageTimestamp?: string;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  senderId: string;
  senderName?: string;
  text?: string;
  content?: string;
  timestamp: string;
  isRead: boolean;
  readAt?: string;
}

export interface PropertyInquiry {
  id: string;
  listingId: string;
  listingTitle?: string;
  senderId: string;
  receiverId?: string;
  senderName?: string;
  senderEmail?: string;
  senderPhone?: string;
  message: string;
  inquiryType?: string;
  createdAt: string;
  status?: string;
}