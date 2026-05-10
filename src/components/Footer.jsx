import React, { useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
         await api.post('/newsletter/subscribe', { email });
        toast.success("Welcome to the inner circle! Check your inbox. 📧");
        setEmail("");
    } catch (err) {
        toast.error(err.response?.data?.message || "Subscription failed.");
    }
};
  return (
    <footer className="bg-card border-t border-border mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 text-muted-foreground">
        
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-black text-xl font-serif italic">iw</span>
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tighter">InkWell</h2>
          </div>
          <p className="text-sm leading-relaxed font-medium opacity-80 max-w-xs">A sanctuary for digital manuscripts. Write, publish, and grow your audience in a world of curated stories.</p>
        </div>

        <div>
          <h3 className="text-foreground font-black uppercase tracking-[0.2em] text-[10px] mb-8">Explore</h3>
          <ul className="space-y-4 text-sm font-bold">
            <li className="hover:text-primary cursor-pointer transition-colors flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 bg-primary/20 rounded-full group-hover:bg-primary transition-colors"></span>
                Published Works
            </li>
            <li className="hover:text-primary cursor-pointer transition-colors flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 bg-primary/20 rounded-full group-hover:bg-primary transition-colors"></span>
                Taxonomy
            </li>
            <li className="hover:text-primary cursor-pointer transition-colors flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 bg-primary/20 rounded-full group-hover:bg-primary transition-colors"></span>
                Trending Narratives
            </li>
          </ul>
        </div>

        <div className="space-y-6">
          <h3 className="text-foreground font-black uppercase tracking-[0.2em] text-[10px] mb-2">Correspondence</h3>
          <p className="text-sm font-bold text-foreground/70">connect@inkwell.com</p>
          
          <form onSubmit={handleSubscribe} className="relative group">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 bg-primary text-primary-foreground text-[10px] font-black uppercase px-4 rounded-lg hover:bg-primary/90 transition-all shadow-sm">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-border/50 max-w-7xl mx-auto py-10 px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center md:text-left">
          © {new Date().getFullYear()} InkWell Publishing Systems. All rights reserved.
        </p>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
          <span className="hover:text-primary cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Terms</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Sitemap</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;