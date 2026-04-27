import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { webApi } from '../api/axios'; // ✅ Import webApi
import { Heart, User, ArrowLeft, Clock, Send, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const PostDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);

    const currentUserId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchAggregatedContent = async () => {
            try {
                // ✅ Calling the BFF endpoint (aggregates post + comments)
                const res = await webApi.get(`/view/post/${slug}?userId=${currentUserId || 0}`);
                
                // Data comes back as { post: {...}, comments: [...] }
                const { post, comments } = res.data;
                
                setPost(post);
                setComments(comments);
                if (post.likedByCurrentUser) setLiked(true);
                
            } catch (err) {
                console.error("Aggregation Error:", err);
                toast.error("Manuscript not found.");
                navigate('/browse');
            } finally {
                setLoading(false);
            }
        };
        fetchAggregatedContent();
    }, [slug, navigate, currentUserId]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!currentUserId) {
            toast.error("Please login to join the discussion.");
            return;
        }
        if (!newComment.trim()) return;

        try {
            await api.post('/comments/add', {
                postId: post.postId,
                userId: currentUserId,
                content: newComment,
                parentId: 0 
            });

            // Note: Notification is handled by RabbitMQ in the backend now!
            toast.info("Narrative submitted for moderation. 🛡️", {
                position: "bottom-center",
                autoClose: 5000
            });
            
            setNewComment("");
        } catch (err) {
            toast.error("Failed to post comment.");
        }
    };

    const handleLike = async () => {
        if (!currentUserId) {
            toast.error("Login to appreciate this story.");
            return;
        }

        try {
            await api.post(`/posts/${post.postId}/like?userId=${currentUserId}`);
            
            const newLikedStatus = !liked;
            setPost(prev => ({ 
                ...prev, 
                likesCount: liked ? prev.likesCount - 1 : prev.likesCount + 1 
            }));
            setLiked(newLikedStatus);
            // RabbitMQ handles the notification in the backend automatically!
        } catch (err) {
            toast.error("Action failed.");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-stone-200 border-t-amber-600 rounded-full animate-spin"></div>
                <div className="text-slate-500 font-medium tracking-wide">Assembling Narrative...</div>
            </div>
        </div>
    );

    if (!post) return null;

    return (
        <div className="min-h-screen bg-stone-50 text-slate-900 selection:bg-amber-200 selection:text-amber-900">
            <div className="max-w-4xl mx-auto px-6 py-16">
                <button onClick={() => navigate('/browse')} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-12 transition-all group font-bold tracking-tight bg-white px-5 py-2.5 rounded-full shadow-sm border border-stone-200 hover:shadow-md hover:-translate-y-0.5">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to feed
                </button>

                <header className="space-y-8 mb-14 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">{post.title}</h1>
                    <div className="flex flex-wrap items-center justify-center gap-8 text-slate-500 text-sm font-semibold tracking-wide border-y border-stone-200 py-6">
                        <div className="flex items-center gap-2">
                            <User size={18} className="text-amber-600" /> 
                            <span className="text-slate-700">{post.fullName || "Author"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={18} className="text-stone-400" /> 
                            <span>{post.readTimeMin || 3} min read</span>
                        </div>
                    </div>
                </header>

                <div className="w-full aspect-video rounded-[2.5rem] overflow-hidden border border-stone-100 bg-white mb-16 shadow-lg relative group">
                    {post.featuredImageUrl ? (
                        <img 
                            src={post.featuredImageUrl} 
                            alt={post.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => e.target.src = 'https://placehold.co/1200x675/f5f5f4/a8a29e/png?text=InkWell+Manuscript'}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-300">
                            <ImageIcon size={64} strokeWidth={1.5} className="mb-4 text-stone-200" />
                            <p className="text-sm font-semibold uppercase tracking-widest text-stone-400">Visual Manuscript Missing</p>
                        </div>
                    )}
                </div>

                <article className="prose prose-lg md:prose-xl max-w-none text-slate-700 leading-relaxed font-serif mb-24 px-4 md:px-8">
                    {post.content}
                </article>

                <div className="flex flex-col items-center justify-center py-16 border-t border-stone-200 space-y-6">
                    <button onClick={handleLike} className={`group flex justify-center items-center gap-4 px-12 py-6 rounded-full border-2 transition-all duration-300 ${liked ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-inner' : 'bg-white border-stone-200 text-slate-400 hover:border-rose-200 hover:text-rose-500 hover:shadow-md hover:-translate-y-1'}`}>
                        <Heart fill={liked ? "currentColor" : "none"} size={32} className={`transition-transform duration-300 ${liked ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="text-3xl font-bold tracking-tight">{post.likesCount || 0}</span>
                    </button>
                    <p className="text-slate-400 text-sm font-semibold tracking-wide">Appreciate this narrative</p>
                </div>

                <section className="mt-16 space-y-10 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                        <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-slate-900">
                            <MessageSquare className="text-amber-600" /> Discussions
                        </h3>
                    </div>

                    <form onSubmit={handleAddComment} className="relative group">
                        <textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="w-full bg-white border border-stone-200 rounded-[2rem] p-6 pr-20 outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all min-h-[140px] resize-none text-slate-700 font-medium text-base shadow-sm placeholder:text-stone-400"
                        />
                        <button 
                            type="submit" 
                            disabled={!newComment.trim()}
                            className="absolute bottom-6 right-6 bg-amber-600 p-4 rounded-full text-white hover:bg-amber-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
                        >
                            <Send size={20} />
                        </button>
                    </form>

                    <div className="space-y-6">
                        {comments && comments.length > 0 ? (
                            comments.map(comment => (
                                <div key={comment.commentId} className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm group">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                                <User size={18} />
                                            </div>
                                            <span className="text-slate-900 font-bold tracking-tight">
                                                {comment.authorName || 'Anonymous'}
                                            </span>
                                        </div>
                                        <span className="text-stone-400 text-xs font-semibold tracking-wide">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed">{comment.content}</p>
                                </div>
                            ))
                        ) : (
                            <div className="py-16 text-center border-2 border-dashed border-stone-200 rounded-3xl">
                                <p className="font-semibold tracking-wide text-stone-500">No active discussions yet.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PostDetails;