import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  CheckCheck,
  MessageCircle,
  Paperclip,
  Search,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';
import { useAuth } from '../../context/AuthContext';
import { Conversation, UserRole } from '../../types';

type PendingChat = {
  listingId: string;
  title: string;
  price: number;
  currency: string;
  publisher: {
    id: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
    companyName?: string;
    isVerified?: boolean;
  };
};

const messageText = (msg: any) => String(msg?.text ?? msg?.content ?? '');
const messageTime = (msg: any) => String(msg?.timestamp ?? new Date().toISOString());

export const MessagingView: React.FC = () => {
  const { conversations, activeConversationId, setActiveConversationId, sendChatMessage } = useProperties();
  const { currentUser } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
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
    const raw = sessionStorage.getItem('immosecure_pending_chat');
    if (!raw || !currentUser) return;

    try {
      const pending = JSON.parse(raw) as PendingChat;
      const conversationId = `listing-${pending.listingId}-${currentUser.id}-${pending.publisher.id}`;
      setLocalConversations((previous) => {
        const existing = previous.find((conv) => conv.id === conversationId || conv.propertyListingId === pending.listingId && conv.participants.some((p) => p.id === pending.publisher.id));
        if (existing) {
          setActiveConversationId(existing.id);
          return previous;
        }

        const created: Conversation = {
          id: conversationId,
          participants: [
            { id: currentUser.id, name: currentUser.fullName, role: currentUser.role, avatarUrl: currentUser.avatarUrl, isVerified: true },
            { id: pending.publisher.id, name: pending.publisher.companyName || pending.publisher.name, role: pending.publisher.role, avatarUrl: pending.publisher.avatarUrl, isVerified: pending.publisher.isVerified },
          ],
          unreadCount: 0,
          propertyListingId: pending.listingId,
          propertyTitle: pending.title,
          propertyContext: { title: pending.title, price: pending.price, listingId: pending.listingId },
          lastMessage: `Discussion concernant ${pending.title}`,
          lastMessageAt: new Date().toISOString(),
          messages: [],
        };
        setActiveConversationId(created.id);
        return [created, ...previous];
      });
    } catch {
      // ignore malformed pending chat
    } finally {
      sessionStorage.removeItem('immosecure_pending_chat');
    }
  }, [currentUser?.id]);

  useEffect(() => {
    localStorage.setItem('immosecure_client_conversations', JSON.stringify(localConversations));
  }, [localConversations]);

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return localConversations
      .filter((conv) => filter === 'ALL' || (conv.unreadCount || 0) > 0)
      .filter((conv) => {
        if (!q) return true;
        const other = conv.participants.find((p) => p.id !== currentUser?.id) || conv.participants[0];
        return `${other?.name || ''} ${conv.propertyContext?.title || conv.propertyTitle || ''} ${conv.lastMessage || ''}`.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.lastMessageAt || b.lastMessageTimestamp || 0).getTime() - new Date(a.lastMessageAt || a.lastMessageTimestamp || 0).getTime());
  }, [filter, localConversations, searchQuery, currentUser?.id]);

  const activeConversation = localConversations.find((conv) => conv.id === activeConversationId) || filteredConversations[0] || null;

  useEffect(() => {
    if (!activeConversation) return;
    if (activeConversation.id !== activeConversationId) setActiveConversationId(activeConversation.id);
    setLocalConversations((previous) => previous.map((conv) => {
      if (conv.id !== activeConversation.id) return conv;
      return {
        ...conv,
        unreadCount: 0,
        messages: (conv.messages || []).map((msg: any) => msg.senderId === currentUser?.id ? msg : { ...msg, isRead: true }),
      };
    }));
    window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [activeConversation?.id]);

  const handleSelect = (id: string) => setActiveConversationId(id);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const otherParticipant = activeConversation?.participants.find((p) => p.id !== currentUser?.id) || activeConversation?.participants[0];
  const totalUnread = localConversations.reduce((sum, conv) => sum + Number(conv.unreadCount || 0), 0);

  return (
    <div className="h-[calc(100vh-7.5rem)] min-h-[560px] pb-4">
      <div className="h-full bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-[340px_1fr]">
        <aside className={`${activeConversation ? 'hidden md:flex' : 'flex'} flex-col min-h-0 border-r border-slate-200 bg-white`}>
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-black text-xl text-slate-900">Messages</h1>
                <p className="text-xs text-slate-500">Discussions liées à vos annonces</p>
              </div>
              {totalUnread > 0 && <span className="min-w-6 h-6 px-1.5 rounded-full bg-[#1e3a8a] text-white text-[11px] font-black flex items-center justify-center">{totalUnread}</span>}
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher une discussion" className="w-full bg-slate-100 border border-transparent rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-blue-300" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setFilter('ALL')} className={`px-3 py-1.5 rounded-full text-xs font-bold ${filter === 'ALL' ? 'bg-[#1e3a8a] text-white' : 'bg-slate-100 text-slate-600'}`}>Tous</button>
              <button onClick={() => setFilter('UNREAD')} className={`px-3 py-1.5 rounded-full text-xs font-bold ${filter === 'UNREAD' ? 'bg-[#16a34a] text-white' : 'bg-slate-100 text-slate-600'}`}>Non lus</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-8 text-slate-500"><MessageCircle className="w-10 h-10 text-slate-300 mb-3" /><p className="text-sm font-semibold">Aucune conversation</p><p className="text-xs mt-1">Cliquez sur « Discuter » depuis une annonce pour contacter son annonceur.</p></div>
            ) : filteredConversations.map((conv) => {
              const other = conv.participants.find((p) => p.id !== currentUser?.id) || conv.participants[0];
              const selected = conv.id === activeConversation?.id;
              const unread = Number(conv.unreadCount || 0);
              return (
                <button key={conv.id} onClick={() => handleSelect(conv.id)} className={`w-full p-3.5 flex items-start gap-3 text-left border-b border-slate-100 transition-colors ${selected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                  <div className="relative shrink-0">
                    {other?.avatarUrl ? <img src={other.avatarUrl} alt={other.name} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-black">{other?.name?.charAt(0) || '?'}</div>}
                    {other?.isVerified && <span className="absolute -right-0.5 -bottom-0.5 w-4 h-4 rounded-full bg-[#16a34a] border-2 border-white flex items-center justify-center"><ShieldCheck className="w-2.5 h-2.5 text-white" /></span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2"><span className={`text-sm truncate ${unread ? 'font-black text-slate-950' : 'font-bold text-slate-800'}`}>{other?.name}</span><span className={`text-[10px] shrink-0 ${unread ? 'text-[#16a34a] font-bold' : 'text-slate-400'}`}>{new Date(conv.lastMessageAt || conv.lastMessageTimestamp || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span></div>
                    <div className="text-[11px] font-semibold text-[#1e3a8a] truncate mt-0.5">{conv.propertyContext?.title || conv.propertyTitle || 'Annonce ImmoSecureNet'}</div>
                    <div className="flex items-center justify-between gap-2 mt-1"><p className={`text-xs truncate ${unread ? 'font-bold text-slate-700' : 'text-slate-500'}`}>{conv.lastMessage || 'Nouvelle discussion'}</p>{unread > 0 && <span className="min-w-5 h-5 px-1 rounded-full bg-[#16a34a] text-white text-[10px] font-black flex items-center justify-center">{unread}</span>}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className={`${activeConversation ? 'flex' : 'hidden md:flex'} min-h-0 flex-col bg-[#f4f7fb]`}>
          {activeConversation && otherParticipant ? (
            <>
              <header className="h-16 px-3 sm:px-5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={() => setActiveConversationId('')} className="md:hidden text-[#1e3a8a] text-sm font-black">‹</button>
                  {otherParticipant.avatarUrl ? <img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-black">{otherParticipant.name.charAt(0)}</div>}
                  <div className="min-w-0"><div className="flex items-center gap-1.5"><span className="font-black text-sm text-slate-900 truncate">{otherParticipant.name}</span>{otherParticipant.isVerified && <ShieldCheck className="w-4 h-4 text-[#16a34a]" />}</div><p className="text-[11px] text-slate-500 truncate">{activeConversation.propertyContext?.title || 'Annonce ImmoSecureNet'}</p></div>
                </div>
                {activeConversation.propertyContext && <div className="text-right hidden sm:block"><div className="font-black text-sm text-[#1e3a8a]">{activeConversation.propertyContext.price.toLocaleString('fr-FR')} $</div><div className="text-[10px] text-slate-400">Réf. {activeConversation.propertyContext.listingId}</div></div>}
              </header>

              <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-5 space-y-2.5">
                <div className="mx-auto w-fit px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-semibold text-slate-500">Discussion sécurisée liée à l’annonce</div>
                {(activeConversation.messages || []).length === 0 && <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-4 text-center mt-6"><MessageCircle className="w-8 h-8 text-[#1e3a8a] mx-auto" /><p className="font-bold text-sm text-slate-900 mt-2">Commencez la discussion</p><p className="text-xs text-slate-500 mt-1">Votre message sera adressé à l’annonceur qui a publié ce bien.</p></div>}
                {(activeConversation.messages || []).map((msg: any) => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[82%] sm:max-w-[68%] px-3.5 py-2.5 rounded-2xl shadow-sm ${isMe ? 'bg-[#dce9ff] text-slate-900 rounded-br-md' : 'bg-white border border-slate-200 text-slate-900 rounded-bl-md'}`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{messageText(msg)}</p>
                        <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-slate-500"><span>{new Date(messageTime(msg)).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>{isMe && (msg.isRead ? <CheckCheck className="w-3.5 h-3.5 text-blue-600" /> : <Check className="w-3.5 h-3.5" />)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-end gap-2 shrink-0">
                <button type="button" className="w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100 flex items-center justify-center shrink-0" aria-label="Joindre un fichier"><Paperclip className="w-5 h-5" /></button>
                <textarea rows={1} value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} placeholder="Écrire un message…" className="flex-1 min-h-10 max-h-28 resize-none rounded-2xl bg-slate-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                <button type="submit" disabled={!inputMessage.trim()} className="w-10 h-10 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center disabled:opacity-40 shrink-0"><Send className="w-4 h-4" /></button>
              </form>
            </>
          ) : <div className="h-full flex flex-col items-center justify-center text-center p-8"><MessageCircle className="w-14 h-14 text-slate-300" /><h2 className="font-black text-lg text-slate-800 mt-4">Vos messages ImmoSecureNet</h2><p className="text-sm text-slate-500 mt-1 max-w-sm">Sélectionnez une conversation ou ouvrez une annonce puis cliquez sur « Discuter ».</p></div>}
        </section>
      </div>
    </div>
  );
};
