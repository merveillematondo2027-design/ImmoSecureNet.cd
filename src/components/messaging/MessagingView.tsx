import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  Building,
  User,
  Paperclip,
  Check,
  CheckCheck,
  Search,
} from 'lucide-react';
import { useProperties } from '../../context/PropertyContext';
import { useAuth } from '../../context/AuthContext';
import { Conversation, ChatMessage } from '../../types';

export const MessagingView: React.FC = () => {
  const { conversations, activeConversationId, setActiveConversationId, sendChatMessage } = useProperties();
  const { currentUser } = useAuth();

  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Protect against undefined or null
  const safeConversations = Array.isArray(conversations) ? conversations : [];
  
  // Filtering conversations by search
  const filteredConversations = safeConversations.filter(conv => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const otherParticipant = conv.participants.find((p) => p.id !== currentUser?.id);
    return otherParticipant?.name?.toLowerCase().includes(q) || conv.propertyContext?.title.toLowerCase().includes(q);
  });

  const activeConversation = safeConversations.find((c) => c.id === activeConversationId) || filteredConversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConversation) return;

    sendChatMessage(activeConversation.id, inputMessage.trim());
    setInputMessage('');
  };

  const isLoading = typeof conversations === 'undefined';
  const isError = conversations === null;
  const isEmpty = !isLoading && !isError && safeConversations.length === 0;

  return (
    <div className="space-y-4 pb-12 h-[calc(100vh-8rem)] min-h-[500px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white">Messagerie Sécurisée ImmoSecureNet</h1>
            <p className="text-[11px] text-slate-400">Échanges chiffrés et vérifiés entre professionnels et clients</p>
          </div>
        </div>
      </div>

      {/* States: Loading, Error, Empty */}
      {isLoading && (
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-3">
           <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-sm text-slate-400">Chargement de vos conversations...</p>
        </div>
      )}

      {isError && (
        <div className="flex-1 bg-red-900/20 border border-red-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-3">
          <ShieldCheck className="w-8 h-8 text-red-400" />
          <p className="text-sm text-red-400">Impossible de charger vos conversations.</p>
        </div>
      )}

      {isEmpty && (
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-3">
          <MessageSquare className="w-10 h-10 text-slate-600" />
          <p className="text-sm text-slate-400">Vous n'avez encore aucune conversation.</p>
        </div>
      )}

      {/* Main Messaging Interface (Split View: Left list, Right chat) */}
      {!isLoading && !isError && !isEmpty && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl p-3">
        {/* Left: Conversations List */}
        <div className="border-r border-slate-800/80 pr-3 flex flex-col min-h-0 space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
            {filteredConversations.length === 0 ? (
               <div className="text-center p-4 text-xs text-slate-500">Aucune conversation trouvée.</div>
            ) : (
            (filteredConversations ?? []).map((conv) => {
              const otherParticipant = conv.participants.find((p) => p.id !== currentUser?.id) || conv.participants[0];
              const isSelected = activeConversation?.id === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/10 border border-blue-500/40 text-white'
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={otherParticipant.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={otherParticipant.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    {otherParticipant.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                        <ShieldCheck className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-white truncate">{otherParticipant.name}</div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(conv.lastMessageAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {conv.propertyContext && (
                      <div className="text-[10px] text-cyan-300 truncate font-medium mt-0.5">
                        🏠 {conv.propertyContext.title}
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>

        {/* Right: Active Chat View */}
        {activeConversation ? (
          <div className="md:col-span-2 flex flex-col min-h-0 pl-1">
            {/* Top Chat Bar */}
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-white font-bold text-xs">
                  {activeConversation.participants[0].name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">{activeConversation.participants[0].name}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-[10px] text-cyan-400 font-medium">
                    {activeConversation.propertyContext?.title || 'Discussion Immobilière'}
                  </p>
                </div>
              </div>

              {activeConversation.propertyContext && (
                <div className="text-right">
                  <div className="text-xs font-bold text-white">
                    {activeConversation.propertyContext.price.toLocaleString('fr-FR')} $
                  </div>
                  <div className="text-[10px] text-slate-400">Réf: {activeConversation.propertyContext.listingId}</div>
                </div>
              )}
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3">
              {(activeConversation.messages || []).map((msg) => {
                const isMe = msg.senderId === currentUser?.id || msg.senderId === 'usr-agent-02' || msg.senderRole === currentUser?.role;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md p-3 rounded-2xl text-xs space-y-1 ${
                        isMe
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none shadow-md'
                          : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/60'
                      }`}
                    >
                      <div>{msg.content}</div>
                      <div
                        className={`text-[9px] flex items-center justify-end gap-1 ${
                          isMe ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        <span>{new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-cyan-200" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 shrink-0">
              <input
                type="text"
                placeholder="Écrivez votre message sécurisé..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="p-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 rounded-2xl hover:from-cyan-300 hover:to-blue-400 transition-colors shrink-0 shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="md:col-span-2 flex items-center justify-center text-slate-500 text-xs">
            Sélectionnez une conversation pour échanger
          </div>
        )}
      </div>
      )}
    </div>
  );
};
