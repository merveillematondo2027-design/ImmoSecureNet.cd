import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, CheckCheck, MessageCircle, MoreVertical, Paperclip, Phone, Search, Send, ShieldCheck } from 'lucide-react';
import { collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useProperties } from '../../context/PropertyContext';
import { useAuth } from '../../context/AuthContext';
import { Conversation, UserRole } from '../../types';

type PendingChat = {
  listingId?: string; title?: string; price?: number; publisherId?: string; publisherName?: string;
  listingTitle?: string; shopId?: string; shopName?: string; productName?: string;
  publisher?: { id: string; name: string; role: UserRole; avatarUrl?: string; companyName?: string; isVerified?: boolean };
};

type LiveMessage = {
  id: string; senderId: string; senderName?: string; text: string; timestamp: string; isRead: boolean;
};

export const MessagingView: React.FC = () => {
  const { conversations, activeConversationId, setActiveConversationId, sendChatMessage, showToast } = useProperties();
  const { currentUser } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [messageMap, setMessageMap] = useState<Record<string, LiveMessage[]>>({});
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    const raw = sessionStorage.getItem('immosecure_pending_chat') || sessionStorage.getItem('immosecure_pending_contact');
    if (!raw) return;
    void (async () => {
      try {
        const pending = JSON.parse(raw) as PendingChat;
        const contactId = pending.publisher?.id || pending.publisherId || pending.shopId;
        if (!contactId || contactId === currentUser.id) return;
        const contactName = pending.publisher?.companyName || pending.publisher?.name || pending.publisherName || pending.shopName || 'Annonceur ImmoSecureNet';
        const subjectId = pending.listingId || pending.shopId || 'general';
        const subjectTitle = pending.title || pending.listingTitle || pending.productName || pending.shopName || 'Discussion ImmoSecureNet';
        const pair = [currentUser.id, contactId].sort().join('_');
        const conversationId = `conv_${subjectId}_${pair}`;
        const ref = doc(db, 'conversations', conversationId);
        await setDoc(ref, {
          id: conversationId,
          participantIds: [currentUser.id, contactId],
          participants: [
            { id: currentUser.id, name: currentUser.fullName, role: currentUser.role, avatarUrl: currentUser.avatarUrl || null, isVerified: true },
            { id: contactId, name: contactName, role: pending.publisher?.role || UserRole.USER, avatarUrl: pending.publisher?.avatarUrl || null, isVerified: pending.publisher?.isVerified ?? true },
          ],
          propertyListingId: pending.listingId || null,
          propertyTitle: subjectTitle,
          propertyContext: pending.listingId ? { title: subjectTitle, price: pending.price || 0, listingId: pending.listingId } : null,
          lastMessage: `Discussion concernant ${subjectTitle}`,
          lastMessageAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }, { merge: true });
        setActiveConversationId(conversationId);
      } catch (error) {
        console.error('Création conversation impossible:', error);
      } finally {
        sessionStorage.removeItem('immosecure_pending_chat');
        sessionStorage.removeItem('immosecure_pending_contact');
      }
    })();
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser) return;
    const unsubs = conversations.map((conv) => onSnapshot(collection(db, 'conversations', conv.id, 'messages'), (snap) => {
      const messages = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }) as LiveMessage)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setMessageMap((prev) => ({ ...prev, [conv.id]: messages }));
    }));
    return () => unsubs.forEach((u) => u());
  }, [conversations.map((c) => c.id).join('|'), currentUser?.id]);

  const unreadFor = (conv: Conversation) => (messageMap[conv.id] || []).filter((m) => m.senderId !== currentUser?.id && !m.isRead).length;
  const totalUnread = conversations.reduce((sum, conv) => sum + unreadFor(conv), 0);

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...conversations]
      .filter((conv) => filter === 'ALL' || unreadFor(conv) > 0)
      .filter((conv) => {
        const other = conv.participants.find((p) => p.id !== currentUser?.id) || conv.participants[0];
        return !q || `${other?.name || ''} ${conv.propertyTitle || ''} ${conv.lastMessage || ''}`.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.lastMessageAt || b.lastMessageTimestamp || 0).getTime() - new Date(a.lastMessageAt || a.lastMessageTimestamp || 0).getTime());
  }, [conversations, messageMap, filter, searchQuery, currentUser?.id]);

  const activeConversation = conversations.find((conv) => conv.id === activeConversationId) || null;
  const activeMessages = activeConversation ? (messageMap[activeConversation.id] || []) : [];
  const otherParticipant = activeConversation?.participants.find((p) => p.id !== currentUser?.id) || activeConversation?.participants[0];

  useEffect(() => {
    if (!activeConversation || !currentUser) return;
    activeMessages.filter((m) => m.senderId !== currentUser.id && !m.isRead).forEach((m) => {
      void updateDoc(doc(db, 'conversations', activeConversation.id, 'messages', m.id), { isRead: true, readAt: new Date().toISOString() });
    });
    window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  }, [activeConversation?.id, activeMessages.length, currentUser?.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text || !activeConversation) return;
    const ok = await sendChatMessage(activeConversation.id, text);
    if (ok) setInputMessage('');
  };

  if (!activeConversation) {
    return <div className="fixed inset-x-0 top-[72px] bottom-[72px] md:static md:h-[calc(100vh-8rem)] bg-white md:rounded-3xl md:border md:border-slate-200 overflow-hidden z-20">
      <div className="h-full flex flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-slate-100 shrink-0">
          <div className="flex justify-between items-center mb-3"><div><h1 className="text-2xl font-black">Messages</h1><p className="text-xs text-slate-500">Discussions ImmoSecureNet en temps réel</p></div>{totalUnread > 0 && <span className="min-w-7 h-7 px-2 rounded-full bg-[#16a34a] text-white text-xs font-black flex items-center justify-center">{totalUnread}</span>}</div>
          <div className="relative"><Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/><input value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Rechercher une discussion" className="w-full rounded-full bg-slate-100 pl-12 pr-4 py-3 text-sm outline-none"/></div>
          <div className="flex gap-2 mt-3"><button onClick={()=>setFilter('ALL')} className={`px-4 py-2 rounded-full text-xs font-bold ${filter==='ALL'?'bg-[#1e3a8a] text-white':'bg-slate-100'}`}>Toutes</button><button onClick={()=>setFilter('UNREAD')} className={`px-4 py-2 rounded-full text-xs font-bold ${filter==='UNREAD'?'bg-[#16a34a] text-white':'bg-slate-100'}`}>Non lues</button></div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-center px-8 text-slate-500"><MessageCircle className="w-12 h-12 text-slate-300 mb-3"/><p className="font-bold text-slate-800">Aucune conversation</p><p className="text-xs mt-1">Touchez « Discuter » sur une annonce pour démarrer.</p></div> : filteredConversations.map((conv) => {
            const other = conv.participants.find((p)=>p.id!==currentUser?.id) || conv.participants[0]; const unread = unreadFor(conv);
            return <button key={conv.id} onClick={()=>setActiveConversationId(conv.id)} className="w-full px-4 py-3 flex items-center gap-3 text-left border-b border-slate-100 active:bg-slate-100">
              <div className="relative shrink-0">{other?.avatarUrl?<img src={other.avatarUrl} alt={other.name} className="w-14 h-14 rounded-full object-cover"/>:<div className="w-14 h-14 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-black text-lg">{other?.name?.charAt(0)||'?'}</div>}{other?.isVerified&&<ShieldCheck className="absolute -right-1 bottom-0 w-5 h-5 text-[#16a34a] bg-white rounded-full"/>}</div>
              <div className="flex-1 min-w-0"><div className="flex justify-between gap-2"><span className={`truncate ${unread?'font-black':'font-bold'}`}>{other?.name||'Contact'}</span><span className="text-[11px] text-slate-400">{new Date(conv.lastMessageAt||conv.lastMessageTimestamp||Date.now()).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</span></div><p className="text-[11px] font-semibold text-[#1e3a8a] truncate">{conv.propertyTitle||'ImmoSecureNet'}</p><div className="flex justify-between gap-2 mt-1"><p className={`text-sm truncate ${unread?'font-semibold text-slate-800':'text-slate-500'}`}>{conv.lastMessage||'Nouvelle discussion'}</p>{unread>0&&<span className="min-w-5 h-5 px-1 rounded-full bg-[#16a34a] text-white text-[10px] font-black flex items-center justify-center">{unread}</span>}</div></div>
            </button>;
          })}
        </div>
      </div>
    </div>;
  }

  return <div className="fixed inset-x-0 top-[72px] bottom-[72px] md:static md:h-[calc(100vh-8rem)] bg-[#eef3f8] md:rounded-3xl md:border md:border-slate-200 overflow-hidden z-20">
    <div className="h-full flex flex-col">
      <header className="px-3 py-2.5 bg-white border-b flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0"><button onClick={()=>setActiveConversationId(null)} className="w-10 h-10 flex items-center justify-center"><ArrowLeft className="w-6 h-6 text-[#1e3a8a]"/></button>{otherParticipant?.avatarUrl?<img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="w-11 h-11 rounded-full object-cover"/>:<div className="w-11 h-11 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-black">{otherParticipant?.name?.charAt(0)||'?'}</div>}<div className="min-w-0"><div className="flex items-center gap-1"><span className="font-black text-[15px] truncate">{otherParticipant?.name}</span>{otherParticipant?.isVerified&&<ShieldCheck className="w-4 h-4 text-[#16a34a]"/>}</div><p className="text-[11px] text-slate-500 truncate">{activeConversation.propertyTitle||'Discussion sécurisée'}</p></div></div>
        <div className="flex"><button onClick={()=>showToast('Appel : connexion téléphonique à brancher au numéro du professionnel.', 'info')} className="w-10 h-10 flex items-center justify-center"><Phone className="w-5 h-5 text-[#1e3a8a]"/></button><button className="w-10 h-10 flex items-center justify-center"><MoreVertical className="w-5 h-5"/></button></div>
      </header>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-2">
        <div className="mx-auto max-w-sm bg-white border rounded-2xl p-3 text-xs text-slate-600 flex gap-2"><ShieldCheck className="w-5 h-5 text-[#16a34a] shrink-0"/><span>Cette discussion est liée à l’annonce et à son annonceur sur ImmoSecureNet.</span></div>
        {activeMessages.map((msg) => { const mine = msg.senderId===currentUser?.id; return <div key={msg.id} className={`flex ${mine?'justify-end':'justify-start'}`}><div className={`max-w-[82%] rounded-2xl px-3 py-2 shadow-sm ${mine?'bg-[#dff7d8] text-slate-900 rounded-br-md':'bg-white text-slate-900 rounded-bl-md'}`}><p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p><div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-500"><span>{new Date(msg.timestamp).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</span>{mine&&(msg.isRead?<CheckCheck className="w-3.5 h-3.5 text-blue-600"/>:<Check className="w-3.5 h-3.5"/>)}</div></div></div>; })}
        <div ref={bottomRef}/>
      </div>
      <form onSubmit={handleSend} className="bg-white border-t p-2.5 flex items-end gap-2 shrink-0"><button type="button" onClick={()=>showToast('Les pièces jointes seront enregistrées dans Firebase Storage.', 'info')} className="w-10 h-10 flex items-center justify-center text-slate-500"><Paperclip className="w-5 h-5"/></button><textarea value={inputMessage} onChange={(e)=>setInputMessage(e.target.value)} rows={1} placeholder="Message" className="flex-1 max-h-28 min-h-10 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm outline-none resize-none"/><button type="submit" disabled={!inputMessage.trim()} className="w-11 h-11 rounded-full bg-[#16a34a] text-white flex items-center justify-center disabled:opacity-40"><Send className="w-5 h-5"/></button></form>
    </div>
  </div>;
};
