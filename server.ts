import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps } from 'firebase-admin/app';
import firebaseConfig from './firebase-applet-config.json';

// Lazy initialize Firebase Admin
function getFirebaseAdmin() {
  if (!getApps().length) {
    try {
      initializeApp({
        projectId: firebaseConfig.projectId,
      });
    } catch (error) {
      console.warn("Failed to initialize Firebase Admin:", error);
    }
  }
  // Return the admin object or specific services if needed
  return {};
}

import {
  INITIAL_USERS,
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
} from './src/data/mockData';
import {
  User,
  UserRole,
  VerificationStatus,
  Property,
  Listing,
  StateAuditLog,
  DeveloperLog,
  JournalEntry,
  NotificationItem,
  SponsoredAd,
  Conversation,
  ChatMessage,
  PropertyInquiry,
  LogLevel,
} from './src/types';

// In-memory data store with live mutability
let users: User[] = [...INITIAL_USERS];
let properties: Property[] = [...INITIAL_PROPERTIES];
let listings: Listing[] = [...INITIAL_LISTINGS];
let sponsoredAds: SponsoredAd[] = [...INITIAL_SPONSORED_ADS];
let stateAuditLogs: StateAuditLog[] = [...INITIAL_STATE_AUDIT_LOGS];
let developerLogs: DeveloperLog[] = [...INITIAL_DEVELOPER_LOGS];
let journalEntries: JournalEntry[] = [...INITIAL_JOURNAL_ENTRIES];
let notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
let conversations: Conversation[] = [...INITIAL_CONVERSATIONS];
let messages: ChatMessage[] = [...INITIAL_MESSAGES];
let inquiries: PropertyInquiry[] = [...INITIAL_INQUIRIES];

function addDevLog(
  level: LogLevel,
  module: DeveloperLog['module'],
  message: string,
  details?: Record<string, unknown> | string,
  statusCode = 200,
  userId?: string
) {
  const newLog: DeveloperLog = {
    id: `dev-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    level,
    module,
    message,
    details,
    timestamp: new Date().toISOString(),
    userId,
    ipAddress: '127.0.0.1',
    statusCode,
    durationMs: Math.floor(Math.random() * 30) + 5,
  };
  developerLogs.unshift(newLog);
}

function addJournalEntry(
  userId: string,
  userName: string,
  userRole: UserRole,
  action: string,
  details: string,
  category: JournalEntry['category'] = 'AUTH'
) {
  const newEntry: JournalEntry = {
    id: `jrn-${Date.now()}`,
    userId,
    userName,
    userRole,
    action,
    details,
    category,
    timestamp: new Date().toISOString(),
    ipAddress: '197.242.10.4',
    device: 'Android Web App (Mobile / Touch)',
  };
  journalEntries.unshift(newEntry);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log incoming API calls
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      const start = Date.now();
      res.on('finish', () => {
        if (!req.path.includes('/api/dev-logs')) {
          addDevLog(
            res.statusCode >= 500
              ? LogLevel.ERROR
              : res.statusCode >= 400
              ? LogLevel.WARNING
              : LogLevel.INFO,
            'MARKETPLACE_API',
            `${req.method} ${req.path}`,
            { query: req.query, status: res.statusCode, durationMs: Date.now() - start },
            res.statusCode
          );
        }
      });
    }
    next();
  });

  // ==========================================
  // AUTH ROUTES
  // ==========================================
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, role } = req.body;
    let foundUser = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());

    // If logging in by role quick-switch
    if (!foundUser && role) {
      foundUser = users.find((u) => u.role === role);
    }

    if (!foundUser) {
      addDevLog(LogLevel.SECURITY, 'AUTH_SERVICE', `Failed login attempt for email: ${email}`, { email }, 401);
      return res.status(401).json({ error: 'Identifiants invalides ou utilisateur introuvable.' });
    }

    if (foundUser.verificationStatus === VerificationStatus.SUSPENDED) {
      addDevLog(LogLevel.SECURITY, 'AUTH_SERVICE', `Suspended user attempted login: ${foundUser.email}`, { userId: foundUser.id }, 403);
      return res.status(403).json({ error: 'Votre compte a été suspendu par l’administration.' });
    }

    addJournalEntry(foundUser.id, foundUser.fullName, foundUser.role, 'Connexion réussie', `Connexion à l'espace ${foundUser.role}`, 'AUTH');
    addDevLog(LogLevel.INFO, 'AUTH_SERVICE', `User authenticated: ${foundUser.email}`, { role: foundUser.role, userId: foundUser.id });

    res.json({
      user: foundUser,
      token: `sec_token_${foundUser.id}_${Date.now()}`,
    });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const {
      fullName,
      email,
      phone,
      role,
      companyName,
      professionalLicenseNumber,
      identityCardNumber,
      accreditationCode,
      department,
    } = req.body;

    if (!fullName || !email || !role) {
      return res.status(400).json({ error: 'Champs obligatoires manquants.' });
    }

    // Check sensitive roles requirement
    if ([UserRole.STATE_AUDITOR, UserRole.ADMIN, UserRole.DEVELOPER_AUDITOR].includes(role)) {
      const validCodes = ['ETAT-GOV-2026', 'ADMIN-ROOT-SEC', 'DEV-AUDIT-4096'];
      if (!accreditationCode || !validCodes.some((code) => accreditationCode.includes(code))) {
        addDevLog(LogLevel.SECURITY, 'RBAC_SECURITY', `Unauthorized attempt to register sensitive role ${role}`, { email, accreditationCode }, 403);
        return res.status(403).json({
          error: `Code d'accréditation invalide pour le profil sensible ${role}. Ce profil nécessite une invitation officielle.`,
        });
      }
    }

    // Default permissions per role
    let permissions = ['VIEW_MARKETPLACE', 'VIEW_OWN_JOURNAL'];
    let initialStatus = VerificationStatus.NOT_VERIFIED;

    switch (role) {
      case UserRole.AGENT:
      case UserRole.AGENCY:
        permissions = ['VIEW_MARKETPLACE', 'CREATE_LISTING', 'EDIT_OWN_LISTINGS', 'VIEW_AGENT_DASHBOARD', 'VIEW_OWN_JOURNAL'];
        initialStatus = VerificationStatus.PENDING;
        break;
      case UserRole.OWNER:
        permissions = ['VIEW_MARKETPLACE', 'MANAGE_OWN_PROPERTIES', 'UPLOAD_DEEDS', 'VIEW_OWN_JOURNAL'];
        initialStatus = VerificationStatus.PENDING;
        break;
      case UserRole.STATE_AUDITOR:
        permissions = ['VIEW_MARKETPLACE', 'AUDIT_ALL_PROPERTIES', 'VERIFY_DEEDS', 'GENERATE_STATE_REPORTS', 'FLAG_FRAUD', 'VIEW_AUDIT_TRAIL', 'VIEW_OWN_JOURNAL'];
        initialStatus = VerificationStatus.VERIFIED;
        break;
      case UserRole.ADMIN:
        permissions = ['SUPER_ADMIN_ALL', 'MANAGE_USERS', 'MODERATE_LISTINGS', 'MANAGE_SPONSORS', 'VIEW_PLATFORM_STATS', 'VIEW_SYSTEM_LOGS'];
        initialStatus = VerificationStatus.VERIFIED;
        break;
      case UserRole.DEVELOPER_AUDITOR:
        permissions = ['DEV_VIEW_ALL_LOGS', 'SECURITY_ANALYSIS', 'API_METRICS', 'EXPORT_LOGS'];
        initialStatus = VerificationStatus.VERIFIED;
        break;
      default:
        permissions = ['VIEW_MARKETPLACE', 'SEND_INQUIRY', 'VIEW_OWN_JOURNAL'];
        initialStatus = VerificationStatus.VERIFIED;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      fullName,
      email,
      phone: phone || '+243 80 000 0000',
      role,
      verificationStatus: initialStatus,
      companyName,
      professionalLicenseNumber,
      identityCardNumber,
      accreditationCode,
      department,
      createdAt: new Date().toISOString(),
      permissions,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    };

    users.push(newUser);
    addJournalEntry(newUser.id, newUser.fullName, newUser.role, 'Création de compte', `Inscription avec le profil ${newUser.role}`, 'AUTH');
    addDevLog(LogLevel.INFO, 'AUTH_SERVICE', `New user registered: ${newUser.email} (${newUser.role})`, { userId: newUser.id });

    res.status(201).json({
      user: newUser,
      token: `sec_token_${newUser.id}_${Date.now()}`,
    });
  });

  // ==========================================
  // PROPERTIES & CADASTRE
  // ==========================================
  app.get('/api/properties', (req: Request, res: Response) => {
    const { ownerId, search } = req.query;
    let result = [...properties];

    if (ownerId) {
      result = result.filter((p) => p.ownerId === ownerId);
    }
    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter(
        (p) =>
          p.cadastralReference.toLowerCase().includes(q) ||
          p.titleDeedNumber.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q)
      );
    }

    res.json(result);
  });

  app.post('/api/properties', (req: Request, res: Response) => {
    const newPropData = req.body;
    const newProperty: Property = {
      ...newPropData,
      id: `prop-${Date.now()}`,
      verificationStatus: VerificationStatus.PENDING,
      documents: newPropData.documents || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      taxComplianceStatus: 'EN_COURS',
      hasLitigationFlag: false,
    };
    properties.unshift(newProperty);

    addJournalEntry(
      newProperty.ownerId,
      newProperty.ownerName,
      UserRole.OWNER,
      'Déclaration de bien immobilier',
      `Enregistrement du bien Cadastre: ${newProperty.cadastralReference}`,
      'PROPERTY'
    );
    addDevLog(LogLevel.INFO, 'CADASTRE_SYNC', `Property declared: ${newProperty.cadastralReference}`, { propertyId: newProperty.id });

    res.status(201).json(newProperty);
  });

  app.put('/api/properties/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = properties.findIndex((p) => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Bien non trouvé.' });

    properties[index] = {
      ...properties[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    res.json(properties[index]);
  });

  // ==========================================
  // LISTINGS & MARKETPLACE
  // ==========================================
  app.get('/api/listings', (req: Request, res: Response) => {
    const {
      city,
      type,
      listingType,
      minPrice,
      maxPrice,
      bedrooms,
      verifiedOnly,
      search,
      status,
      publisherId,
    } = req.query;

    let result = [...listings];

    if (publisherId) {
      result = result.filter((l) => l.publishedBy.id === publisherId);
    }
    if (status) {
      result = result.filter((l) => l.status === status);
    }
    if (city) {
      result = result.filter((l) => l.location.city.toLowerCase().includes(String(city).toLowerCase()));
    }
    if (type) {
      result = result.filter((l) => l.propertyType === type);
    }
    if (listingType) {
      result = result.filter((l) => l.listingType === listingType);
    }
    if (minPrice) {
      result = result.filter((l) => l.price >= Number(minPrice));
    }
    if (maxPrice) {
      result = result.filter((l) => l.price <= Number(maxPrice));
    }
    if (bedrooms) {
      result = result.filter((l) => l.bedrooms >= Number(bedrooms));
    }
    if (verifiedOnly === 'true') {
      result = result.filter((l) => l.publishedBy.isVerified);
    }
    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.location.neighborhood.toLowerCase().includes(q) ||
          l.location.city.toLowerCase().includes(q) ||
          l.shortDescription.toLowerCase().includes(q)
      );
    }

    res.json(result);
  });

  app.get('/api/listings/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const listing = listings.find((l) => l.id === id);
    if (!listing) return res.status(404).json({ error: 'Annonce non trouvée.' });

    // Increment views count
    listing.viewsCount += 1;
    res.json(listing);
  });

  app.post('/api/listings', (req: Request, res: Response) => {
    const listingData = req.body;
    const newListing: Listing = {
      ...listingData,
      id: `lst-${Date.now()}`,
      viewsCount: 0,
      inquiriesCount: 0,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    listings.unshift(newListing);

    addJournalEntry(
      newListing.publishedBy.id,
      newListing.publishedBy.name,
      newListing.publishedBy.role,
      'Création d’annonce',
      `Publication de l'annonce: ${newListing.title}`,
      'LISTING'
    );

    res.status(201).json(newListing);
  });

  app.put('/api/listings/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = listings.findIndex((l) => l.id === id);
    if (index === -1) return res.status(404).json({ error: 'Annonce non trouvée.' });

    listings[index] = {
      ...listings[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    res.json(listings[index]);
  });

  app.delete('/api/listings/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    listings = listings.filter((l) => l.id !== id);
    res.json({ success: true, message: 'Annonce supprimée.' });
  });

  // ==========================================
  // INQUIRIES & CONTACT
  // ==========================================
  app.post('/api/inquiries', (req: Request, res: Response) => {
    const { listingId, listingTitle, senderName, senderEmail, senderPhone, message, inquiryType } = req.body;
    const newInquiry: PropertyInquiry = {
      id: `inq-${Date.now()}`,
      listingId,
      listingTitle,
      senderName,
      senderEmail,
      senderPhone,
      message,
      inquiryType: inquiryType || 'VISIT_REQUEST',
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };
    inquiries.unshift(newInquiry);

    // Update listing inquiries counter
    const l = listings.find((item) => item.id === listingId);
    if (l) l.inquiriesCount += 1;

    res.status(201).json(newInquiry);
  });

  app.get('/api/inquiries', (req: Request, res: Response) => {
    res.json(inquiries);
  });

  // ==========================================
  // STATE AUDIT LOGS (Strict tracking with Justification)
  // ==========================================
  app.get('/api/state-audit-logs', (req: Request, res: Response) => {
    res.json(stateAuditLogs);
  });

  app.post('/api/state-audit-logs', (req: Request, res: Response) => {
    const { auditorId, auditorName, auditorDepartment, action, resourceType, resourceId, resourceIdentifier, justification, verdict } = req.body;

    if (!justification || justification.trim().length < 5) {
      return res.status(400).json({
        error: 'Une justification légale formelle est obligatoire pour tout acte d’audit étatique.',
      });
    }

    const newAuditLog: StateAuditLog = {
      id: `aud-log-${Date.now()}`,
      auditorId: auditorId || 'usr-auditor-05',
      auditorName: auditorName || 'Auditeur d’État',
      auditorDepartment: auditorDepartment || 'Ministère des Affaires Foncières',
      action,
      resourceType,
      resourceId,
      resourceIdentifier,
      justification,
      verdict: verdict || 'CONFORME',
      timestamp: new Date().toISOString(),
      ipAddress: '10.144.20.18 (GovNet)',
      device: 'Android Terminal Certifié GovSec',
    };

    stateAuditLogs.unshift(newAuditLog);
    addDevLog(LogLevel.SECURITY, 'RBAC_SECURITY', `State audit action executed by ${auditorName}: ${action}`, { auditId: newAuditLog.id });

    res.status(201).json(newAuditLog);
  });

  // ==========================================
  // DEVELOPER AUDIT LOGS
  // ==========================================
  app.get('/api/dev-logs', (req: Request, res: Response) => {
    const { level, module, search } = req.query;
    let result = [...developerLogs];

    if (level && level !== 'ALL') {
      result = result.filter((l) => l.level === level);
    }
    if (module && module !== 'ALL') {
      result = result.filter((l) => l.module === module);
    }
    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter((l) => l.message.toLowerCase().includes(q) || l.ipAddress.includes(q));
    }

    res.json(result);
  });

  app.delete('/api/dev-logs', (req: Request, res: Response) => {
    developerLogs = developerLogs.slice(0, 5); // Keep initial
    res.json({ success: true, message: 'Logs de test réinitialisés.' });
  });

  // ==========================================
  // USER JOURNAL
  // ==========================================
  app.get('/api/journal', (req: Request, res: Response) => {
    const { userId } = req.query;
    let result = [...journalEntries];
    if (userId) {
      result = result.filter((j) => j.userId === userId);
    }
    res.json(result);
  });

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  app.get('/api/notifications', (req: Request, res: Response) => {
    const { userId } = req.query;
    let result = [...notifications];
    if (userId) {
      result = result.filter((n) => n.userId === userId || n.userId === 'all');
    }
    res.json(result);
  });

  app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
    const { id } = req.params;
    const notif = notifications.find((n) => n.id === id);
    if (notif) notif.isRead = true;
    res.json({ success: true });
  });

  app.post('/api/notifications/mark-all-read', (req: Request, res: Response) => {
    notifications.forEach((n) => (n.isRead = true));
    res.json({ success: true });
  });

  // ==========================================
  // SPONSORED ADS (Pubs Sponsor)
  // ==========================================
  app.get('/api/sponsors', (req: Request, res: Response) => {
    res.json(sponsoredAds);
  });

  app.post('/api/sponsors', (req: Request, res: Response) => {
    const newAd: SponsoredAd = {
      ...req.body,
      id: `ad-${Date.now()}`,
      impressionsCount: 0,
      clicksCount: 0,
      isActive: true,
    };
    sponsoredAds.unshift(newAd);
    res.status(201).json(newAd);
  });

  app.put('/api/sponsors/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = sponsoredAds.findIndex((a) => a.id === id);
    if (index === -1) return res.status(404).json({ error: 'Publicité non trouvée.' });

    sponsoredAds[index] = { ...sponsoredAds[index], ...req.body };
    res.json(sponsoredAds[index]);
  });

  app.delete('/api/sponsors/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    sponsoredAds = sponsoredAds.filter((a) => a.id !== id);
    res.json({ success: true, message: 'Publicité supprimée.' });
  });

  app.post('/api/sponsors/:id/click', (req: Request, res: Response) => {
    const { id } = req.params;
    const ad = sponsoredAds.find((a) => a.id === id);
    if (ad) ad.clicksCount += 1;
    res.json({ success: true });
  });

  // ==========================================
  // ADMIN USER MANAGEMENT
  // ==========================================
  app.get('/api/users', (req: Request, res: Response) => {
    res.json(users);
  });

  app.patch('/api/users/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { verificationStatus, role } = req.body;
    const user = users.find((u) => u.id === id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

    if (verificationStatus) user.verificationStatus = verificationStatus;
    if (role) user.role = role;

    addDevLog(LogLevel.SECURITY, 'RBAC_SECURITY', `Admin modified user ${user.email}`, { updatedRole: role, status: verificationStatus });
    res.json(user);
  });

  // ==========================================
  // MESSAGING
  // ==========================================
  app.get('/api/conversations', (req: Request, res: Response) => {
    res.json(conversations);
  });

  app.get('/api/messages/:conversationId', (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const convMessages = messages.filter((m) => m.conversationId === conversationId);
    res.json(convMessages);
  });

  app.post('/api/messages', (req: Request, res: Response) => {
    const { conversationId, senderId, senderName, senderRole, text } = req.body;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: conversationId || 'conv-001',
      senderId,
      senderName,
      senderRole,
      text,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    messages.push(newMsg);

    // Update conversation lastMessage
    const conv = conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = text;
      conv.lastMessageTimestamp = newMsg.timestamp;
    }

    res.status(201).json(newMsg);
  });

  // ==========================================
  // STATS & KPIS
  // ==========================================
  app.get('/api/stats', (req: Request, res: Response) => {
    const stats = {
      totalUsers: users.length,
      activeListings: listings.filter((l) => l.status === 'ACTIVE').length,
      pendingListings: listings.filter((l) => l.status === 'PENDING_REVIEW').length,
      totalProperties: properties.length,
      verifiedProperties: properties.filter((p) => p.verificationStatus === VerificationStatus.VERIFIED).length,
      totalAudits: stateAuditLogs.length,
      totalInquiries: inquiries.length,
      securityLogsCount: developerLogs.filter((d) => d.level === LogLevel.SECURITY || d.level === LogLevel.ERROR).length,
    };
    res.json(stats);
  });

  // ==========================================
  // VITE & STATIC FILES
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
        watch: process.env.DISABLE_HMR === 'true' ? null : undefined
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ImmoSecureNet Server running at http://localhost:${PORT}`);
  });
}

startServer();
