import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { webApi } from '../api/axios'; // ✅ Import webApi
import { Heart, User, ArrowLeft, Clock, Send, MessageSquare, Image as ImageIcon, Bookmark } from 'lucide-react';
import { toast } from 'react-toastify';
import usePageTitle from '../hooks/usePageTitle';

// ✅ SUB-COMPONENT: POST HEADER
const PostHeader = ({ post }) => (
    <header className="space-y-6 sm:space-y-8 mb-10 sm:mb-14 text-center">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1] sm:leading-[1.1] px-2">{post.title}</h1>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-muted-foreground text-xs sm:text-sm font-bold tracking-wide border-y border-border py-4 sm:py-6">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg text-primary"><User size={14} sm:size={18} /></div> 
                <Link to={`/profile/${post.authorId}`} className="text-foreground hover:text-primary transition-colors cursor-pointer">
                    {post.fullName || "Author"}
                </Link>
            </div>
            <div className="flex items-center gap-2">
                <Clock size={14} sm:size={18} className="text-muted-foreground/60" /> 
                <span>{post.readTimeMin || 3} min read</span>
            </div>
        </div>
    </header>
);

// ✅ SUB-COMPONENT: POST VISUAL
const PostVisual = ({ post }) => (
    <div className="w-full aspect-video rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden border border-border bg-card mb-10 sm:mb-16 shadow-lg relative group">
        {post.featuredImageUrl ? (
            <img 
                src={post.featuredImageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => { e.target.src = 'https://placehold.co/1200x675/f5f5f4/a8a29e/png?text=InkWell+Manuscript'; }}
            />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-6">
                <ImageIcon size={48} sm:size={64} strokeWidth={1.5} className="mb-4 opacity-20" />
                <p className="text-[10px] sm:text-sm font-black uppercase tracking-widest opacity-40 text-center">Visual Manuscript Missing</p>
            </div>
        )}
    </div>
);

// ✅ SUB-COMPONENT: DISCUSSION SECTION
const DiscussionSection = ({ comments, newComment, setNewComment, onSubmit }) => (
    <section className="mt-12 sm:mt-16 space-y-8 sm:space-y-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-xl sm:text-2xl font-black tracking-tighter flex items-center gap-3 text-foreground">
                <MessageSquare className="text-primary" /> Discussions
            </h3>
        </div>

        <form onSubmit={onSubmit} className="relative group">
            <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full bg-card border border-border rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 pr-16 sm:pr-20 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all min-h-[120px] sm:min-h-[140px] resize-none text-foreground font-bold text-sm sm:text-base shadow-sm placeholder:text-muted-foreground/30"
            />
            <button 
                type="submit" 
                disabled={!newComment.trim()}
                className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 bg-primary p-3 sm:p-4 rounded-full text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-md active:scale-95"
            >
                <Send size={18} sm:size={20} />
            </button>
        </form>

        <div className="space-y-4 sm:space-y-6">
            {comments && comments.length > 0 ? (
                comments.map(comment => (
                    <div key={comment.commentId} className="bg-card p-6 sm:p-8 rounded-[1.5rem] sm:rounded-3xl border border-border shadow-sm group hover:border-primary/20 transition-colors">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <User size={14} sm:size={18} />
                                </div>
                                <span className="text-foreground font-black text-sm sm:text-base tracking-tight truncate max-w-[150px] sm:max-w-none">
                                    {comment.authorName || 'Anonymous'}
                                </span>
                            </div>
                            <span className="text-muted-foreground/50 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">{comment.content}</p>
                    </div>
                ))
            ) : (
                <div className="py-12 sm:py-16 text-center border-2 border-dashed border-border rounded-[1.5rem] sm:rounded-3xl">
                    <p className="font-bold tracking-tight text-muted-foreground text-sm">No active discussions yet.</p>
                </div>
            )}
        </div>
    </section>
);

// ✅ MAIN COMPONENT: POST DETAILS
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
                const res = await webApi.get(`/view/post/${slug}?userId=${currentUserId || 0}`);
                const { post: fetchedPost, comments: fetchedComments } = res.data;
                
                setPost(fetchedPost);
                setComments(fetchedComments);
                if (fetchedPost.likedByCurrentUser) setLiked(true);

                if (currentUserId && currentUserId !== "null") {
                    const savedRes = await api.get(`/posts/${fetchedPost.postId}/is-saved?userId=${currentUserId}`);
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
                onClick: () => navigate('/dashboard')
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
            toast.info("Narrative submitted for moderation. 🛡️", { position: "bottom-center", autoClose: 5000 });
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
        } catch (err) {
            toast.error("Action failed.");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
            <div className="flex flex-col items-center space-y-4 transition-all">
                <div className="w-12 h-12 border-4 border-stone-200 border-t-amber-600 rounded-full animate-spin"></div>
                <div className="text-slate-500 font-bold uppercase tracking-widest text-xs">Assembling Narrative...</div>
            </div>
        </div>
    );

    if (!post) return null;

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
                <button onClick={() => navigate('/browse')} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 sm:mb-12 transition-all group font-bold tracking-tight bg-card px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-sm border border-border hover:shadow-md hover:-translate-y-0.5 text-sm sm:text-base">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to feed
                </button>

                <PostHeader post={post} />
                <PostVisual post={post} />

                <article className="prose prose-base sm:prose-lg md:prose-xl max-w-none text-foreground/80 dark:text-foreground/90 leading-[1.8] font-serif mb-16 sm:mb-24 px-2 sm:px-8">
                    {post.content}
                </article>

                <div className="flex flex-col items-center justify-center py-12 sm:py-16 border-t border-border space-y-8">
                    <div className="flex items-center gap-4 sm:gap-8">
                        <div className="flex flex-col items-center gap-2">
                            <button onClick={handleLike} className={`group flex justify-center items-center gap-3 sm:gap-4 px-8 sm:px-10 py-4 sm:py-5 rounded-full border-2 transition-all duration-300 ${liked ? 'bg-primary/10 border-primary/20 text-primary shadow-inner' : 'bg-card border-border text-muted-foreground hover:border-primary/20 hover:text-primary hover:shadow-md hover:-translate-y-1'}`}>
                                <Heart fill={liked ? "currentColor" : "none"} size={24} sm:size={28} className={`transition-transform duration-300 ${liked ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className="text-xl sm:text-2xl font-black tracking-tighter">{post.likesCount || 0}</span>
                            </button>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Appreciate</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <button onClick={handleSavePost} className={`group flex justify-center items-center gap-3 sm:gap-4 px-8 sm:px-10 py-4 sm:py-5 rounded-full border-2 transition-all duration-300 ${saved ? 'bg-secondary/10 border-secondary/20 text-secondary shadow-inner' : 'bg-card border-border text-muted-foreground hover:border-secondary/20 hover:text-secondary hover:shadow-md hover:-translate-y-1'}`}>
                                <Bookmark fill={saved ? "currentColor" : "none"} size={24} sm:size={28} className={`transition-transform duration-300 ${saved ? 'scale-110' : 'group-hover:scale-110'}`} />
                                {isPro && <span className="text-[10px] font-black bg-secondary/20 text-secondary px-2 py-0.5 rounded-md">PRO</span>}
                            </button>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Library</p>
                        </div>
                    </div>
                </div>

                <DiscussionSection 
                    comments={comments} 
                    newComment={newComment} 
                    setNewComment={setNewComment} 
                    onSubmit={handleAddComment} 
                />
            </div>
        </div>
    );
};

export default PostDetails;