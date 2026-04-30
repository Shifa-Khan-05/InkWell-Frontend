import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { webApi } from '../api/axios'; // ✅ Import webApi
import { Heart, User, ArrowLeft, Clock, Send, MessageSquare, Image as ImageIcon, Bookmark } from 'lucide-react';
import { toast } from 'react-toastify';
import usePageTitle from '../hooks/usePageTitle';

const PostDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    usePageTitle(post?.title);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);

    const currentUserId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('role') || 'READER';
    const isPro = userRole.includes('PREMIUM') || userRole.includes('ADMIN');

    useEffect(() => {
        const fetchAggregatedContent = async () => {
            try {
                // ✅ Calling the BFF endpoint (aggregates post + comments)
                const res = await webApi.get(`/view/post/${slug}?userId=${currentUserId || 0}`);
                const { post, comments } = res.data;
                
                setPost(post);
                setComments(comments);
                if (post.likedByCurrentUser) setLiked(true);

                // Check saved status if logged in
                if (currentUserId && currentUserId !== "null") {
                    const savedRes = await api.get(`/posts/${post.postId}/is-saved?userId=${currentUserId}`);
                    setSaved(savedRes.data);
                }
                
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

    const handleSavePost = async () => {
        if (!currentUserId) {
            toast.error("Login to save this story.");
            return;
        }

        if (!isPro) {
            toast.warning("Saving Manuscripts is a Pro feature! ✨ Upgrade to continue.", {
                onClick: () => navigate('/dashboard') // Suggest upgrade
            });
            return;
        }

        try {
            await api.post(`/posts/${post.postId}/save?userId=${currentUserId}`);
            setSaved(!saved);
            toast.success(saved ? "Removed from Library" : "Saved to Library 🔖");
        } catch (err) {
            toast.error("Action failed.");
        }
    };

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
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-6 py-16">
                <button onClick={() => navigate('/browse')} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-12 transition-all group font-bold tracking-tight bg-card px-5 py-2.5 rounded-full shadow-sm border border-border hover:shadow-md hover:-translate-y-0.5">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to feed
                </button>

                <header className="space-y-8 mb-14 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">{post.title}</h1>
                    <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm font-semibold tracking-wide border-y border-border py-6">
                        <div className="flex items-center gap-2">
                            <User size={18} className="text-primary" /> 
                            <Link to={`/profile/${post.authorId}`} className="text-foreground hover:text-primary transition-colors cursor-pointer">
                                {post.fullName || "Author"}
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={18} className="text-muted-foreground/60" /> 
                            <span>{post.readTimeMin || 3} min read</span>
                        </div>
                    </div>
                </header>

                <div className="w-full aspect-video rounded-[2.5rem] overflow-hidden border border-border bg-card mb-16 shadow-lg relative group">
                    {post.featuredImageUrl ? (
                        <img 
                            src={post.featuredImageUrl} 
                            alt={post.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => e.target.src = 'https://placehold.co/1200x675/f5f5f4/a8a29e/png?text=InkWell+Manuscript'}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                            <ImageIcon size={64} strokeWidth={1.5} className="mb-4 opacity-20" />
                            <p className="text-sm font-semibold uppercase tracking-widest opacity-40">Visual Manuscript Missing</p>
                        </div>
                    )}
                </div>

                <article className="prose prose-lg md:prose-xl max-w-none text-foreground/80 dark:text-foreground/90 leading-relaxed font-serif mb-24 px-4 md:px-8">
                    {post.content}
                </article>

                <div className="flex flex-col items-center justify-center py-16 border-t border-border space-y-8">
                    <div className="flex items-center gap-6">
                        {/* Like Button */}
                        <div className="flex flex-col items-center gap-2">
                            <button onClick={handleLike} className={`group flex justify-center items-center gap-4 px-10 py-5 rounded-full border-2 transition-all duration-300 ${liked ? 'bg-primary/10 border-primary/20 text-primary shadow-inner' : 'bg-card border-border text-muted-foreground hover:border-primary/20 hover:text-primary hover:shadow-md hover:-translate-y-1'}`}>
                                <Heart fill={liked ? "currentColor" : "none"} size={28} className={`transition-transform duration-300 ${liked ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className="text-2xl font-bold tracking-tight">{post.likesCount || 0}</span>
                            </button>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Appreciate</p>
                        </div>

                        {/* Save Button (Pro Feature) */}
                        <div className="flex flex-col items-center gap-2">
                            <button onClick={handleSavePost} className={`group flex justify-center items-center gap-4 px-10 py-5 rounded-full border-2 transition-all duration-300 ${saved ? 'bg-secondary/10 border-secondary/20 text-secondary shadow-inner' : 'bg-card border-border text-muted-foreground hover:border-secondary/20 hover:text-secondary hover:shadow-md hover:-translate-y-1'}`}>
                                <Bookmark fill={saved ? "currentColor" : "none"} size={28} className={`transition-transform duration-300 ${saved ? 'scale-110' : 'group-hover:scale-110'}`} />
                                {isPro && <span className="text-xs font-bold bg-secondary/20 text-secondary px-2 py-0.5 rounded-md">PRO</span>}
                            </button>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Library</p>
                        </div>
                    </div>
                </div>

                <section className="mt-16 space-y-10 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-foreground">
                            <MessageSquare className="text-primary" /> Discussions
                        </h3>
                    </div>

                    <form onSubmit={handleAddComment} className="relative group">
                        <textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="w-full bg-card border border-border rounded-[2rem] p-6 pr-20 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all min-h-[140px] resize-none text-foreground font-medium text-base shadow-sm placeholder:text-muted-foreground/40"
                        />
                        <button 
                            type="submit" 
                            disabled={!newComment.trim()}
                            className="absolute bottom-6 right-6 bg-primary p-4 rounded-full text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-md active:scale-95"
                        >
                            <Send size={20} />
                        </button>
                    </form>

                    <div className="space-y-6">
                        {comments && comments.length > 0 ? (
                            comments.map(comment => (
                                <div key={comment.commentId} className="bg-card p-8 rounded-3xl border border-border shadow-sm group hover:border-primary/20 transition-colors">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <User size={18} />
                                            </div>
                                            <span className="text-foreground font-bold tracking-tight">
                                                {comment.authorName || 'Anonymous'}
                                            </span>
                                        </div>
                                        <span className="text-muted-foreground/60 text-xs font-semibold tracking-wide">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">{comment.content}</p>
                                </div>
                            ))
                        ) : (
                            <div className="py-16 text-center border-2 border-dashed border-border rounded-3xl">
                                <p className="font-semibold tracking-wide text-muted-foreground">No active discussions yet.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PostDetails;