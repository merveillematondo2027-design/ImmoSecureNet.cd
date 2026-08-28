import React from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';
import { NotificationItem } from '../../types';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationAsRead } = useProperties();

  const getIcon = (type: string) => {
    switch (type) {
      case 'AUDIT_ALERT':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'PROPERTY_VERIFIED':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'INQUIRY_RECEIVED':
        return <Building className="w-4 h-4 text-blue-700" />;
      case 'SECURITY_ALERT':
        return <ShieldCheck className="w-4 h-4 text-purple-700" />;
      default:
        return <Bell className="w-4 h-4 text-blue-700" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Centre de Notifications</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
              {notifications.filter((n) => !n.isRead).length} non lues
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mises à jour foncières, validations cadastrales et alertes sécurisées.
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => markNotificationAsRead(n.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
              n.isRead
                ? 'bg-white/80 border-slate-200 text-slate-600'
                : 'bg-white border-blue-300 text-slate-900 shadow-xs ring-1 ring-blue-100'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900">{n.title}</h3>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                <div className="text-[10px] text-slate-400 pt-0.5">
                  {new Date(n.createdAt).toLocaleString('fr-FR')}
                </div>
              </div>
            </div>

            {!n.isRead && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markNotificationAsRead(n.id);
                }}
                className="text-blue-700 hover:text-blue-800 text-xs font-semibold shrink-0 p-1 rounded-lg hover:bg-blue-50"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
