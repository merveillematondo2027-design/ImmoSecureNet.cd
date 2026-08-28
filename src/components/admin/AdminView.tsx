import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building,
  Megaphone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Search,
  Activity,
  Terminal,
  Settings,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole, VerificationStatus, ListingStatus } from '../../types';
import { SponsoredAdsManager } from './SponsoredAdsManager';

export const AdminView: React.FC = () => {
  const { listings, updateListing, showToast, setActiveNavTab, activeNavTab } = useProperties();
  const { allUsers, updateUserRole, updateUserStatus } = useAuth();

  const [adminTab, setAdminTab] = useState<'USERS' | 'MODERATION' | 'STATS'>('USERS');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Count metrics
  const totalUsers = allUsers.length;
  const verifiedUsers = allUsers.filter((u) => u.verificationStatus === VerificationStatus.VERIFIED).length;
  const pendingListings = listings.filter((l) => l.status === ListingStatus.PENDING_REVIEW);
  const activeListings = listings.filter((l) => l.status === ListingStatus.ACTIVE);

  // Filtered users
  const filteredUsers = allUsers.filter((u) => {
    if (!userSearchQuery) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const handleListingModeration = async (listingId: string, approve: boolean) => {
    await updateListing(listingId, {
      status: approve ? ListingStatus.ACTIVE : ListingStatus.SUSPENDED,
    });
    showToast(approve ? 'Annonce approuvée et mise en ligne !' : 'Annonce rejetée.', approve ? 'success' : 'info');
  };

  // If activeNavTab is admin_sponsors, show SponsoredAdsManager
  if (activeNavTab === 'admin_sponsors') {
    return <SponsoredAdsManager />;
  }

  // If activeNavTab is admin_accueil, render the Welcome Shortcuts Hub
  if (activeNavTab === 'admin_accueil') {
    return (
      <div className="space-y-6 pb-12">
        {/* Welcome Hub Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">Centre de Contrôle Général Admin</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-extrabold">
                Super-Admin
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Bienvenue sur la console d'administration ImmoSecureNet. Pilotez l'ensemble des modules, vérifiez les accréditations professionnelles et régulez la plateforme.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-2 rounded-2xl border border-slate-800 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-semibold">Système 100% Opérationnel</span>
          </div>
        </div>

        {/* Quick Access Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Tableau de bord KPIs',
              desc: 'Utilisateurs, modération & permissions',
              icon: LayoutDashboard,
              action: () => setActiveNavTab('admin_dashboard'),
              color: 'from-blue-600 to-cyan-600',
            },
            {
              title: 'Régie Pubs Sponsor',
              desc: 'Bannières payantes & CTR',
              icon: Megaphone,
              action: () => setActiveNavTab('admin_sponsors'),
              color: 'from-purple-600 to-indigo-600',
            },
            {
              title: 'AuditLogs Système',
              desc: 'Télémétrie & sécurité temps réel',
              icon: Terminal,
              action: () => setActiveNavTab('dev_logs'),
              color: 'from-amber-600 to-orange-600',
            },
            {
              title: 'Catalogue Marketplace',
              desc: 'Consulter les annonces publiques',
              icon: Building,
              action: () => setActiveNavTab('marketplace'),
              color: 'from-emerald-600 to-teal-600',
            },
          ].map((tile, i) => {
            const Icon = tile.icon;
            return (
              <div
                key={i}
                onClick={tile.action}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-lg cursor-pointer transition-all hover:-translate-y-0.5 group space-y-3"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tile.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                    {tile.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{tile.desc}</p>
                </div>
                <div className="pt-2 flex items-center gap-1 text-xs text-cyan-400 font-semibold">
                  <span>Accéder</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Summary Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-slate-400 text-xs">Comptes Inscrits</div>
            <div className="text-2xl font-black text-white mt-1">{totalUsers}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Dont {verifiedUsers} certifiés</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-slate-400 text-xs">Annonces Actives</div>
            <div className="text-2xl font-black text-cyan-300 mt-1">{activeListings.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">En ligne sur Marketplace</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-slate-400 text-xs">Modération en attente</div>
            <div className="text-2xl font-black text-amber-300 mt-1">{pendingListings.length}</div>
            <div className="text-[10px] text-amber-400 mt-0.5">À valider</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-slate-400 text-xs">Sécurité du Serveur</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">100%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Zéro intrusion</div>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: Admin Dashboard with User Management and Moderation Queue
  return (
    <div className="space-y-6 pb-12">
      {/* Dashboard Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-white">Tableau de bord Administrateur</h1>
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold">
              Gestion des Rôles & Modération
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gérez les comptes utilisateurs, validez les accréditations et modérez les annonces soumises.
          </p>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'USERS', label: `Comptes & Permissions (${allUsers.length})`, icon: Users },
          { id: 'MODERATION', label: `File de Modération (${pendingListings.length})`, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: USER MANAGEMENT TABLE */}
      {adminTab === 'USERS' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur par nom, email ou rôle..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Utilisateur</th>
                    <th className="p-3.5">Rôle Système</th>
                    <th className="p-3.5">Statut Vérification</th>
                    <th className="p-3.5">Détails Pro</th>
                    <th className="p-3.5 text-right">Modifier Rôle / Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{user.fullName}</div>
                        <div className="text-[11px] text-slate-400">{user.email}</div>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={user.role}
                          onChange={(e) => {
                            updateUserRole(user.id, e.target.value as UserRole);
                            showToast(`Rôle de ${user.fullName} modifié en ${e.target.value}`, 'success');
                          }}
                          className="bg-slate-950 border border-slate-700 text-xs text-cyan-300 rounded-lg px-2 py-1 font-semibold focus:outline-none"
                        >
                          <option value={UserRole.USER}>USER (Standard)</option>
                          <option value={UserRole.AGENT}>AGENT (Immobilier)</option>
                          <option value={UserRole.AGENCY}>AGENCY (Agence)</option>
                          <option value={UserRole.OWNER}>OWNER (Propriétaire)</option>
                          <option value={UserRole.STATE_AUDITOR}>STATE_AUDITOR (Audit État)</option>
                          <option value={UserRole.ADMIN}>ADMIN (Administrateur)</option>
                          <option value={UserRole.DEVELOPER_AUDITOR}>DEVELOPER_AUDITOR (Dev)</option>
                        </select>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={user.verificationStatus}
                          onChange={(e) => {
                            updateUserStatus(user.id, e.target.value as VerificationStatus);
                            showToast(`Statut mis à jour`, 'info');
                          }}
                          className={`text-[10px] font-bold rounded-lg px-2 py-1 border focus:outline-none ${
                            user.verificationStatus === VerificationStatus.VERIFIED
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : user.verificationStatus === VerificationStatus.PENDING
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          <option value={VerificationStatus.VERIFIED}>VERIFIED (Certifié)</option>
                          <option value={VerificationStatus.PENDING}>PENDING (En attente)</option>
                          <option value={VerificationStatus.REJECTED}>REJECTED (Refusé)</option>
                          <option value={VerificationStatus.SUSPENDED}>SUSPENDED (Suspendu)</option>
                          <option value={VerificationStatus.BANNED}>BANNED (Banni)</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-[11px] text-slate-400">
                        {user.companyName || user.department || user.professionalLicenseNumber || 'Compte personnel'}
                      </td>
                      <td className="p-3.5 text-right">
                        {user.verificationStatus !== VerificationStatus.VERIFIED ? (
                          <button
                            onClick={() => {
                              updateUserStatus(user.id, VerificationStatus.VERIFIED);
                              showToast(`Accréditation validée pour ${user.fullName}`, 'success');
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold"
                          >
                            Valider compte
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-semibold">✓ Conforme</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LISTINGS MODERATION QUEUE */}
      {adminTab === 'MODERATION' && (
        <div className="space-y-3">
          {pendingListings.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <div className="font-semibold text-white">Toutes les annonces sont modérées</div>
              <p className="mt-1">Aucune annonce n'est actuellement en file d'attente.</p>
            </div>
          ) : (
            pendingListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={listing.mainPhoto}
                    alt={listing.title}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      En attente de validation
                    </span>
                    <h3 className="font-bold text-sm text-white mt-1">{listing.title}</h3>
                    <p className="text-xs text-slate-400">
                      Publié par : {listing.publishedBy.name} ({listing.publishedBy.companyName || 'Indépendant'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleListingModeration(listing.id, false)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Rejeter
                  </button>
                  <button
                    onClick={() => handleListingModeration(listing.id, true)}
                    className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                  >
                    Approuver la mise en ligne
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
