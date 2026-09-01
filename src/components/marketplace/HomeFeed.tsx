import React, { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { Heart, MessageCircle, Send, Share2 } from 'lucide-react';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';
import { Listing } from '../../types';

type FeedComment = {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
};

const FeedPost: React.FC<{ listing: Listing }> = ({ listing }) => {
  const { currentUser } = useAuth();
  const { setSelectedListing, setActiveNavTab, showToast } = useProperties();
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const likesQuery = query(collection(db, 'feedLikes'), where('postId', '==', listing.id));
    return onSnapshot(likesQuery, (snapshot) => {
      setLikeCount(snapshot.size);
      setLiked(Boolean(currentUser && snapshot.docs.some((item) => item.data().userId === currentUser.id)));
    });
  }, [listing.id, currentUser?.id]);

  useEffect(() => {
    if (!commentOpen) return;
    const commentsQuery = query(collection(db, 'feedComments'), where('postId', '==', listing.id));
    return onSnapshot(commentsQuery, (snapshot) => {
      const next = snapshot.docs
        .map((item) => ({ id: item.id, ...(item.data() as Omit<FeedComment, 'id'>) }))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setComments(next);
    });
  }, [listing.id, commentOpen]);

  const requireAccount = () => {
    if (currentUser) return true;
    showToast('Connectez-vous ou créez un compte pour effectuer cette action.', 'info');
    setActiveNavTab('menu');
    return false;
  };

  const toggleLike = async () => {
    if (!requireAccount() || !currentUser) return;
    const likeId = `${listing.id}_${currentUser.id}`;
    const likeRef = doc(db, 'feedLikes', likeId);
    if (liked) {
      await deleteDoc(likeRef);
      return;
    }
    await setDoc(likeRef, {
      postId: listing.id,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
    });
  };

  const submitComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requireAccount() || !currentUser) return;
    const text = commentText.trim();
    if (!text) return;
    await addDoc(collection(db, 'feedComments'), {
      postId: listing.id,
      userId: currentUser.id,
      userName: currentUser.fullName,
      text,
      createdAt: new Date().toISOString(),
    });
    setCommentText('');
    setCommentOpen(true);
  };

  const share = async () => {
    const shareData = {
      title: listing.title,
      text: `${listing.title} — ${listing.location.city}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Lien copié. Vous pouvez maintenant le partager.', 'success');
      }
    } catch {
      // Le partage natif peut être fermé volontairement par l'utilisateur.
    }
  };

  const messagePublisher = () => {
    sessionStorage.setItem('immosecure_pending_contact', JSON.stringify({
      type: 'LISTING',
      listingId: listing.id,
      publisherId: listing.publishedBy.id,
      publisherName: listing.publishedBy.name,
      listingTitle: listing.title,
      price: listing.price,
    }));
    setActiveNavTab('messages');
  };

  return (
    <article className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-50 text-[#1e3a8a] flex items-center justify-center font-black shrink-0">
          {listing.publishedBy.avatarUrl ? (
            <img src={listing.publishedBy.avatarUrl} alt={listing.publishedBy.name} className="w-full h-full object-cover" />
          ) : (
            listing.publishedBy.name?.slice(0, 1)?.toUpperCase() || 'I'
          )}
        </div>
        <div className="min-w-0">
          <div className="font-black text-sm text-slate-900 truncate">{listing.publishedBy.name}</div>
          <div className="text-[11px] text-slate-500 truncate">{listing.location.neighborhood}, {listing.location.city}</div>
        </div>
      </div>

      <button type="button" onClick={() => setSelectedListing(listing)} className="w-full text-left">
        <div className="px-4 pb-3">
          <h3 className="font-black text-base text-slate-900">{listing.title}</h3>
          <p className="text-sm text-slate-600 mt-1 line-clamp-3">{listing.shortDescription || listing.fullDescription}</p>
        </div>
        <img src={listing.mainPhoto} alt={listing.title} className="w-full aspect-video object-cover bg-slate-100" />
      </button>

      <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100">
        <span>{likeCount} J’aime</span>
        <button type="button" onClick={() => setCommentOpen((value) => !value)}>{comments.length ? `${comments.length} commentaire(s)` : 'Commentaires'}</button>
      </div>

      <div className="grid grid-cols-4 border-b border-slate-100">
        <button type="button" onClick={() => void toggleLike()} className={`py-3 flex items-center justify-center gap-1.5 text-xs font-bold ${liked ? 'text-[#1e3a8a]' : 'text-slate-600'}`}>
          <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} /> J’aime
        </button>
        <button type="button" onClick={() => setCommentOpen((value) => !value)} className="py-3 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600">
          <MessageCircle className="w-4 h-4" /> Commenter
        </button>
        <button type="button" onClick={() => void share()} className="py-3 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600">
          <Share2 className="w-4 h-4" /> Partager
        </button>
        <button type="button" onClick={messagePublisher} className="py-3 flex items-center justify-center gap-1.5 text-xs font-bold text-[#16a34a]">
          <Send className="w-4 h-4" /> Message
        </button>
      </div>

      {commentOpen && (
        <div className="p-4 space-y-3 bg-slate-50/70">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-xl px-3 py-2 border border-slate-100">
                <div className="text-xs font-black text-slate-800">{comment.userName}</div>
                <div className="text-sm text-slate-700 mt-0.5">{comment.text}</div>
              </div>
            ))}
          </div>
          <form onSubmit={submitComment} className="flex gap-2">
            <input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Écrire un commentaire..."
              className="flex-1 min-w-0 border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white"
            />
            <button type="submit" className="w-11 h-11 rounded-xl bg-[#1e3a8a] text-white flex items-center justify-center shrink-0" aria-label="Envoyer le commentaire">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </article>
  );
};

export const HomeFeed: React.FC<{ listings: Listing[] }> = ({ listings }) => {
  const shuffled = useMemo(() => [...listings].sort(() => Math.random() - 0.5), [listings]);

  return (
    <section className="space-y-3 pt-2">
      <div>
        <h2 className="font-black text-xl text-slate-900">Fil d’actualité</h2>
        <p className="text-xs text-slate-500 mt-1">Les publications de la plateforme, réunies dans un seul fil.</p>
      </div>
      <div className="space-y-4">
        {shuffled.map((listing) => <FeedPost key={listing.id} listing={listing} />)}
        {!shuffled.length && (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center text-sm text-slate-500">
            Aucune publication disponible pour le moment.
          </div>
        )}
      </div>
    </section>
  );
};
