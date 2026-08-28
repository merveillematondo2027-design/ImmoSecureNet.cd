import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  Check,
  CheckCheck,
  FileText,
  Image,
  MapPin,
  MessageCircle,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  ShieldCheck,
  Smile,
  WalletCards,
} from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';
import { useAuth } from '../../context/AuthContext';
import { Conversation, UserRole } from '../../types';

type PendingChat = {
  listingId?: string;
  title?: string;
  price?: number;
  currency?: string;
  publisher?: {
    id: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
    companyName?: string;
    isVerified?: boolean;
  };
  publisherId?: string;
  publisherName?: string;
  listingTitle?: string;
  type?: string;
  shopId?: string;
  shopName?: string;
  productId?: string;
  productName?: string;
};

const messageText = (msg: any) => String(msg?.text ?? msg?.content ?? '');
const messageTime = (msg: any) => String(msg?.timestamp ?? new Date().toISOString());

export const MessagingView: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendChatMessage,
    showToast,
  } = useProperties();
  const { currentUser } = useAuth();

  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [showActions, setShowActions] = useState(false);
  const [localConversations, setLocalConversations] = useState<Conversation[]>(() => {
    try {
      const raw = localStorage.getItem('immosecure_client_conversations');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const base = Array.isArray(conversations) ? conversations : [];
    setLocalConversations((previous) => {
      const map = new Map<string, Conversation>();
      [...base, ...previous].forEach((conv) => map.set(conv.id, conv));
      return Array.from(map.values());
    });
  }, [conversations]);

  useEffect(() => {
    if (!currentUser) return;

    const raw = sessionStorage.getItem('immosecure_pending_chat') || sessionStorage.getItem('immosecure_pending_contact');
    if (!raw) return;

    try {
      const pending = JSON.parse(raw) as PendingChat;
      const contactId = pending.publisher?.id || pending.publisherId || pending.shopId || 'contact';
      const contactName = pending.publisher?.companyName || pending.publisher?.name || pending.publisherName || pending.shopName || 'Annonceur ImmoSecureNet';
      const subjectId = pending.listingId || pending.shopId || 'general';
      const subjectTitle = pending.title || pending.listingTitle || pending.productName || pending.shopName || 'Discussion ImmoSecureNet';
      const conversationId = `chat-${subjectId}-${currentUser.id}-${contactId}`;

      setLocalConversations((previous) => {
        const existing = previous.find((conv) => conv.id === conversationId || (pending.listingId && conv.propertyListingId === pending.listingId));
        if (existing) {
          setActiveConversationId(existing.id);
          return previous;
        }

        const created: Conversation = {
          id: conversationId,
          participants: [
            {
              id: currentUser.id,
              name: currentUser.fullName,
              role: currentUser.role,
              avatarUrl: currentUser.avatarUrl,
              isVerified: true,
            },
            {
              id: contactId,
              name: contactName,
              role: pending.publisher?.role || UserRole.USER,
              avatarUrl: pending.publisher?.avatarUrl,
              isVerified: pending.publisher?.isVerified ?? true,
            },
          ],
          unreadCount: 0,
          propertyListingId: pending.listingId,
          propertyTitle: subjectTitle,
          propertyContext: pending.listingId ? {
            title: subjectTitle,
            price: pending.price || 0,
            listingId: pending.listingId,
          } : undefined,
          lastMessage: `Discussion concernant ${subjectTitle}`,
          lastMessageAt: new Date().toISOString(),
          messages: [],
        };

        setActiveConversationId(created.id);
        return [created, ...previous];
      });
    } catch {
      // Ignore une demande de contact mal formée.
    } finally {
      sessionStorage.removeItem('immosecure_pending_chat');
      sessionStorage.removeItem('immosecure_pending_contact');
    }
  }, [currentUser?.id]);

  useEffect(() => {
    localStorage.setItem('immosecure_client_conversations', JSON.stringify(localConversations));
  }, [localConversations]);

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return localConversations
      .filter((conv) => filter === 'ALL' || Number(conv.unreadCount || 0) > 0)
      .filter((conv) => {
        if (!q) return true;
        const other = conv.participants.find((p) => p.id !== currentUser?.id) || conv.participants[0];
        return `${other?.name || ''} ${conv.propertyContext?.title || conv.propertyTitle || ''} ${conv.lastMessage || ''}`.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.lastMessageAt || b.lastMessageTimestamp || 0).getTime() - new Date(a.lastMessageAt || a.lastMessageTimestamp || 0).getTime());
  }, [filter, localConversations, searchQuery, currentUser?.id]);

  const activeConversation = localConversations.find((conv) => conv.id === activeConversationId) || null;
  const otherParticipant = activeConversation?.participants.find((p) => p.id !== currentUser?.id) || activeConversation?.participants[0];
  const totalUnread = localConversations.reduce((sum, conv) => sum + Number(conv.unreadCount || 0), 0);

  useEffect(() => {
    if (!activeConversation) return;
    setLocalConversations((previous) => previous.map((conv) => conv.id === activeConversation.id ? {
      ...conv,
      unreadCount: 0,
      messages: (conv.messages || []).map((msg: any) => msg.senderId === currentUser?.id ? msg : { ...msg, isRead: true }),
    } : conv));
    window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [activeConversation?.id]);

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = inputMessage.trim();
    if (!text || !activeConversation || !currentUser) return;

    const now = new Date().toISOString();
    const localMessage = {
      id: `msg-${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      text,
      content: text,
      timestamp: now,
      isRead: false,
    };

    setLocalConversations((previous) => previous.map((conv) => conv.id === activeConversation.id ? {
      ...conv,
      lastMessage: text,
      lastMessageAt: now,
      lastMessageTimestamp: now,
      messages: [...(conv.messages || []), localMessage],
    } : conv));

    if ((conversations || []).some((conv) => conv.id === activeConversation.id)) {
      await sendChatMessage(activeConversation.id, text);
    }

    setInputMessage('');
    window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const action = (label: string) => {
    setShowActions(false);
    showToast(`${label} sera ajouté à cette conversation.`, 'info');
  };

  if (!activeConversation) {
    return (
      <div className="fixed inset-x-0 top-[72px] bottom-[72px] md:static md:h-[calc(100vh-8rem)] bg-white md:rounded-3xl md:border md:border-slate-200 md:shadow-sm overflow-hidden z-20">
        <div className="h-full flex flex-col bg-white">
          <div className="px-4 pt-4 pb-3 border-b border-slate-100 bg-white shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-2xl font-black text-slate-950">Messages</h1>
                <p className="text-xs text-slate-500">Acheteurs, vendeurs et professionnels</p>
              </div>
              {totalUnread > 0 && <span className="min-w-7 h-7 px-2 rounded-full bg-[#16a34a] text-white text-xs font-black flex items-center justify-center">{totalUnread}</span>}
            </div>

            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une discussion"
                className="w-full rounded-full bg-slate-100 pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              />
            </div>

            <div className="flex gap-2 mt-3">
              <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-full text-xs font-bold ${filter === 'ALL' ? 'bg-[#1e3a8a] text-white' : 'bg-slate-100 text-slate-600'}`}>Toutes</button>
              <button onClick={() => setFilter('UNREAD')} className={`px-4 py-2 rounded-full text-xs font-bold ${filter === 'UNREAD' ? 'bg-[#16a34a] text-white' : 'bg-slate-100 text-slate-600'}`}>Non lues</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain">
            {filteredConversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center px-8 text-center text-slate-500">
                <MessageCircle className="w-12 h-12 text-slate-300 mb-3" />
                <p className="font-bold text-slate-800">Aucune conversation</p>
                <p className="text-xs mt-1">Touchez « Discuter » sur une annonce ou un magasin pour démarrer.</p>
              </div>
            ) : filteredConversations.map((conv) => {
              const other = conv.participants.find((p) => p.id !== currentUser?.id) || conv.participants[0];
              const unread = Number(conv.unreadCount || 0);
              return (
                <button key={conv.id} onClick={() => setActiveConversationId(conv.id)} className="w-full px-4 py-3 flex items-center gap-3 text-left border-b border-slate-100 active:bg-slate-100">
                  <div className="relative shrink-0">
                    {other?.avatarUrl ? <img src={other.avatarUrl} alt={other.name} className="w-14 h-14 rounded-full object-cover" /> : <div className="w-14 h-14 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-black text-lg">{other?.name?.charAt(0) || '?'}</div>}
                    {other?.isVerified && <span className="absolute right-0 bottom-0 w-5 h-5 rounded-full bg-[#16a34a] border-2 border-white flex items-center justify-center"><ShieldCheck className="w-3 h-3 text-white" /></span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`truncate text-[15px] ${unread ? 'font-black text-slate-950' : 'font-bold text-slate-800'}`}>{other?.name || 'Contact'}</span>
                      <span className={`text-[11px] shrink-0 ${unread ? 'font-bold text-[#16a34a]' : 'text-slate-400'}`}>{new Date(conv.lastMessageAt || conv.lastMessageTimestamp || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[11px] font-semibold text-[#1e3a8a] truncate mt-0.5">{conv.propertyContext?.title || conv.propertyTitle || 'ImmoSecureNet'}</p>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className={`text-sm truncate ${unread ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>{conv.lastMessage || 'Nouvelle discussion'}</p>
                      {unread > 0 && <span className="min-w-5 h-5 px-1 rounded-full bg-[#16a34a] text-white text-[10px] font-black flex items-center justify-center">{unread}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 top-[72px] bottom-[72px] md:static md:h-[calc(100vh-8rem)] bg-[#eef3f8] md:rounded-3xl md:border md:border-slate-200 md:shadow-sm overflow-hidden z-20">
      <div className="h-full flex flex-col">
        <header className="px-3 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => setActiveConversationId('')} className="w-10 h-10 flex items-center justify-center rounded-full text-[#1e3a8a] active:bg-slate-100">
              <ArrowLeft className="w-6 h-6" />
            </button>
            {otherParticipant?.avatarUrl ? <img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="w-11 h-11 rounded-full object-cover" /> : <div className="w-11 h-11 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-black">{otherParticipant?.name?.charAt(0) || '?'}</div>}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-[15px] text-slate-950 truncate">{otherParticipant?.name}</span>
                {otherParticipant?.isVerified && <ShieldCheck className="w-4 h-4 text-[#16a34a] shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-500 truncate">{activeConversation.propertyContext?.title || activeConversation.propertyTitle || 'En ligne'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" onClick={() => action('Appel')} className="w-10 h-10 flex items-center justify-center rounded-full text-[#1e3a8a] active:bg-slate-100"><Phone className="w-5 h-5" /></button>
            <button type="button" onClick={() => action('Options de conversation')} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 active:bg-slate-100"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-4 space-y-2.5">
          <div className="mx-auto max-w-sm bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm flex gap-3 items-start">
            <ShieldCheck className="w-7 h-7 text-[#1e3a8a] shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-sm text-slate-900">Discussion sécurisée</p>
              <p className="text-xs text-slate-500 mt-0.5">Cette conversation est liée à l’annonce ou au magasin sélectionné.</p>
            </div>
          </div>

          <div className="mx-auto w-fit px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-[10px] font-bold text-slate-500">Aujourd’hui</div>

          {(activeConversation.messages || []).length === 0 && (
            <div className="max-w-[85%] bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <p className="text-sm text-slate-800">Bonjour ! Merci pour votre intérêt. Comment pouvons-nous vous aider ?</p>
              <div className="text-[10px] text-slate-400 mt-1 text-right">Maintenant</div>
            </div>
          )}

          {(activeConversation.messages || []).map((msg: any) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[84%] px-3.5 py-2.5 rounded-2xl shadow-sm ${isMe ? 'bg-[#dce9ff] rounded-br-md' : 'bg-white border border-slate-200 rounded-bl-md'}`}>
                  <p className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">{messageText(msg)}</p>
                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-500">
                    <span>{new Date(messageTime(msg)).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && (msg.isRead ? <CheckCheck className="w-3.5 h-3.5 text-blue-600" /> : <Check className="w-3.5 h-3.5" />)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {showActions && (
          <div className="bg-white border-t border-slate-200 px-3 py-3 grid grid-cols-5 gap-2 shrink-0">
            {[
              ['Galerie', Image, () => action('Galerie')],
              ['Document', FileText, () => action('Document')],
              ['Localisation', MapPin, () => action('Localisation')],
              ['Rendez-vous', CalendarDays, () => action('Rendez-vous')],
              ['Paiement', WalletCards, () => action('Paiement')],
            ].map(([label, Icon, onClick]: any) => (
              <button key={label} type="button" onClick={onClick} className="flex flex-col items-center gap-1.5 text-[10px] font-bold text-slate-600">
                <span className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center"><Icon className="w-5 h-5" /></span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="bg-white border-t border-slate-200 p-2.5 flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => action('Emoji')} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 active:bg-slate-100"><Smile className="w-5 h-5" /></button>
          <div className="flex-1 rounded-full bg-slate-100 flex items-center px-3 min-w-0">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Écrire un message..."
              className="flex-1 min-w-0 bg-transparent py-3 text-sm outline-none"
            />
            <button type="button" onClick={() => setShowActions((value) => !value)} className="w-9 h-9 flex items-center justify-center text-slate-500"><Paperclip className="w-5 h-5" /></button>
            <button type="button" onClick={() => action('Caméra')} className="w-9 h-9 flex items-center justify-center text-slate-500"><Camera className="w-5 h-5" /></button>
          </div>
          <button type="submit" className="w-12 h-12 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform">
            {inputMessage.trim() ? <Send className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};
