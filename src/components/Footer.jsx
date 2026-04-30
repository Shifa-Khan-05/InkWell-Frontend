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
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-12 text-muted-foreground">
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center">
              <span className="text-background font-bold text-xl font-serif">iw</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">InkWell</h2>
          </div>
          <p className="text-sm leading-relaxed">A sanctuary for digital manuscripts. Write, publish, and grow your audience in a world of curated stories.</p>
        </div>

        <div>
          <h3 className="text-foreground font-bold uppercase tracking-widest text-xs mb-6">Explore</h3>
          <ul className="space-y-3 text-sm font-medium">
            <li className="hover:text-primary cursor-pointer transition-colors">Published Works</li>
            <li className="hover:text-primary cursor-pointer transition-colors">Taxonomy</li>
            <li className="hover:text-primary cursor-pointer transition-colors">Trending Narratives</li>
          </ul>
        </div>

        <div>
          <h3 className="text-foreground font-bold uppercase tracking-widest text-xs mb-6">Correspondence</h3>
          <p className="text-sm mb-4">support@inkwell.com</p>
          
          <form onSubmit={handleSubscribe} className="space-y-2">
            <input 
              type="email" 
              placeholder="Newsletter signup" 
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-foreground text-background text-[10px] font-bold uppercase py-2 rounded-lg hover:bg-foreground/90 transition-all">
              Join
            </button>
          </form>

          <div className="mt-6 flex gap-4">
            {/* Social icons could go here */}
          </div>
        </div>
      </div>

      <div className="border-t border-border/50 max-w-6xl mx-auto py-8 px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs font-medium text-muted-foreground/60">
          © {new Date().getFullYear()} InkWell Platform. All rights reserved.
        </p>
        <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;