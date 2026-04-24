import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
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
        const fetchFullContent = async () => {
            try {
                const postRes = await api.get(`/posts/slug/${slug}?userId=${currentUserId || 0}`);
                setPost(postRes.data);
                if (postRes.data.likedByCurrentUser) setLiked(true);

                // Fetch existing approved comments
                const commentRes = await api.get(`/comments/post/${postRes.data.postId}`);
                setComments(commentRes.data);
            } catch (err) {
                toast.error("Story not found.");
                navigate('/browse');
            } finally {
                setLoading(false);
            }
        };
        fetchFullContent();
    }, [slug, navigate, currentUserId]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!currentUserId) {
            toast.error("Please login to join the discussion.");
            return;
        }
        if (!newComment.trim()) return;

        try {
            // ✅ FIXED: Using /add to match the updated Backend mapping
            await api.post('/comments/add', {
                postId: post.postId,
                userId: currentUserId,
                content: newComment,
                parentId: 0 
            });
            
            // ✅ UX: Since status is PENDING, we don't add it to the local list yet
            toast.info("Narrative submitted for moderation. 🛡️", {
                position: "bottom-center",
                autoClose: 5000
            });
            
            setNewComment("");
        } catch (err) {
            console.error("Comment Error:", err);
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
            setPost(prev => ({ ...prev, likesCount: liked ? prev.likesCount - 1 : prev.likesCount + 1 }));
            setLiked(!liked);
        } catch (err) {
            toast.error("Action failed.");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="text-blue-500 font-mono animate-pulse uppercase tracking-[0.5em]">InkWell Syncing...</div>
        </div>
    );

    if (!post) return null;

    return (
        <div className="max-w-5xl mx-auto px-6 py-16 text-white min-h-screen">
            {/* Back Button */}
            <button onClick={() => navigate('/browse')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-10 transition group font-black uppercase text-[10px] tracking-widest">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" /> Back to feed
            </button>

            {/* Header Section */}
            <header className="space-y-8 mb-12">
                <h1 className="text-6xl md:text-8xl font-black italic leading-[0.9] tracking-tighter uppercase">{post.title}</h1>
                
                <div className="flex items-center gap-6 text-gray-500 text-[10px] uppercase font-black tracking-[0.2em] border-y border-gray-900 py-8">
                    <div className="flex items-center gap-2">
                        <User size={14} className="text-blue-500" /> 
                        <span className="text-white">{post.fullName || "Author"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={14} /> 
                        <span>{post.readTimeMin || 3} min read</span>
                    </div>
                </div>
            </header>

            {/* Featured Image Section */}
            <div className="w-full aspect-video rounded-[50px] overflow-hidden border border-gray-800 bg-gray-900 mb-16 shadow-2xl relative">
                {post.featuredImageUrl ? (
                    <img 
                        src={post.featuredImageUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/1200x675?text=Image+Unavailable'}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-800">
                        <ImageIcon size={64} strokeWidth={1} className="mb-4 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Visual Manuscript Missing</p>
                    </div>
                )}
            </div>

            {/* Article Content */}
            <article className="text-gray-300 text-2xl leading-relaxed whitespace-pre-wrap font-serif italic mb-20 border-l-4 border-blue-600/20 pl-10">
                {post.content}
            </article>

            {/* Appreciation Section */}
            <div className="flex flex-col items-center justify-center py-20 border-t border-gray-900 space-y-4">
                <button onClick={handleLike} className={`group flex items-center gap-6 px-16 py-8 rounded-[50px] border-2 transition-all duration-700 ${liked ? 'bg-red-600 border-red-600 shadow-[0_0_50px_-12px_rgba(220,38,38,0.5)]' : 'bg-black border-gray-800 hover:border-red-600/50 hover:scale-105'}`}>
                    <Heart fill={liked ? "white" : "none"} className={liked ? "text-white" : "group-hover:text-red-500 transition"} size={40} />
                    <span className="text-5xl font-black italic tracking-tighter">{post.likesCount || 0}</span>
                </button>
                <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.5em] mt-4">Appreciate this narrative</p>
            </div>

            {/* Discussions Section */}
            <section className="mt-20 space-y-12 max-w-3xl mx-auto">
                <div className="flex items-center justify-between border-b border-gray-900 pb-6">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <MessageSquare className="text-blue-500" /> Discussions
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 bg-gray-900 px-3 py-1 rounded-full">
                        {comments.filter(c => c.status === 'APPROVED').length} Verified
                    </span>
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="relative group">
                    <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="JOIN THE CONVERSATION..."
                        className="w-full bg-gray-900/30 border border-gray-800 rounded-[40px] p-8 pr-24 outline-none focus:border-blue-600 focus:bg-black transition-all min-h-[150px] resize-none text-gray-200 font-bold text-sm tracking-tight placeholder:text-gray-700"
                    />
                    <button 
                        type="submit" 
                        disabled={!newComment.trim()}
                        className="absolute bottom-8 right-8 bg-blue-600 p-5 rounded-3xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-2xl hover:scale-110 active:scale-95"
                    >
                        <Send size={24} />
                    </button>
                </form>

                {/* Comments List */}
                <div className="space-y-8">
                    {comments.filter(c => c.status === "APPROVED").length > 0 ? (
                        comments.filter(c => c.status === "APPROVED").map(comment => (
                            <div key={comment.commentId} className="bg-gray-900/10 p-10 rounded-[45px] border border-gray-800/40 hover:border-blue-600/30 transition-all group">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <User size={18} />
                                        </div>
                                        <span className="text-white font-black text-xs uppercase tracking-tighter">
                                            @{comment.authorName || 'anonymous'}
                                        </span>
                                    </div>
                                    <span className="text-gray-700 text-[10px] font-black uppercase tracking-widest">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-400 leading-relaxed font-medium text-lg">{comment.content}</p>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center border-2 border-dashed border-gray-900 rounded-[50px] text-gray-800 italic">
                            <p className="font-black uppercase tracking-[0.3em] text-xs">No active discussions found</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default PostDetails;