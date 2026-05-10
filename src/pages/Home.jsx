import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PenTool,
  BarChart3,
  Users,
  ChevronRight,
  Zap,
  Shield,
  Sparkles
} from "lucide-react";

import Footer from "../components/Footer";
import usePageTitle from "../hooks/usePageTitle";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Home = () => {
  usePageTitle('Home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col selection:bg-primary/30 selection:text-primary transition-colors duration-500 overflow-x-hidden">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20 overflow-hidden">
        
        {/* Dynamic Background Blobs */}
        <div className="absolute top-0 -left-20 w-[20rem] sm:w-[40rem] h-[20rem] sm:h-[40rem] bg-primary/20 rounded-full blur-[80px] sm:blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-soft-light opacity-50"></div>
        <div className="absolute top-40 -right-20 w-[15rem] sm:w-[35rem] h-[15rem] sm:h-[35rem] bg-secondary/20 rounded-full blur-[80px] sm:blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-soft-light opacity-50"></div>
        <div className="absolute -bottom-40 left-1/3 w-[25rem] sm:w-[45rem] h-[25rem] sm:h-[45rem] bg-accent/20 rounded-full blur-[80px] sm:blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-soft-light opacity-30"></div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 max-w-6xl mx-auto text-center"
        >
          <motion.div
            variants={fadeIn}
            className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-8 sm:mb-10 shadow-sm backdrop-blur-sm"
          >
            <Sparkles size={14} className="animate-pulse" />
            Digital Manuscripts
          </motion.div>

          <motion.h1
            variants={fadeIn}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-black leading-[1.1] sm:leading-[0.95] tracking-tighter mb-8 sm:mb-10"
          >
            Write. Publish.
            <br />
            <span className="golden-gradient-text italic">Captivate.</span>
          </motion.h1>

          <motion.p
            variants={fadeIn}
            className="text-muted-foreground/80 max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl mb-10 sm:mb-14 font-medium leading-relaxed tracking-tight px-2"
          >
            InkWell is the artisan's platform for modern publishing. 
            Craft beautiful stories with ease.
          </motion.p>

          <motion.div
            variants={fadeIn}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 w-full max-w-xs sm:max-w-none mx-auto"
          >
            {!isLoggedIn ? (
              <>
                <Link to="/register" className="btn-primary group relative overflow-hidden px-8 sm:px-10 py-4 sm:py-5 text-lg shadow-2xl shadow-primary/30 w-full sm:w-auto">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Start Writing <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </Link>
                <Link to="/browse" className="px-8 sm:px-10 py-4 sm:py-5 rounded-full border border-border font-bold text-lg hover:bg-muted transition-all backdrop-blur-sm w-full sm:w-auto">
                  Explore Library
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="btn-primary flex items-center justify-center gap-2 text-lg shadow-2xl shadow-primary/30 px-10 sm:px-12 py-4 sm:py-5 w-full sm:w-auto">
                Go to Workbench <ChevronRight size={20} />
              </Link>
            )}
          </motion.div>
        </motion.div>

        {/* Hero Visual - Abstract Floating Cards (Responsive hiding on tiny screens) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-16 sm:mt-24 w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 opacity-60 dark:opacity-40 grayscale hover:grayscale-0 transition-all duration-700 select-none pointer-events-none px-4 sm:px-6"
        >
          <div className="hidden sm:flex p-6 sm:p-8 bg-gradient-to-br from-card to-muted rounded-[2rem] sm:rounded-[2.5rem] border border-border flex-col justify-end gap-3 shadow-sm">
             <PenTool size={32} className="text-primary/50 mb-auto" />
             <div className="h-2 w-20 bg-primary/20 rounded-full"></div>
             <div className="h-2 w-32 bg-muted-foreground/20 rounded-full"></div>
             <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Artisan Drafting</p>
          </div>
          <div className="p-8 sm:p-10 bg-gradient-to-br from-card to-muted rounded-[2rem] sm:rounded-[2.5rem] border border-border sm:-mt-10 shadow-2xl flex flex-col justify-end gap-4">
             <Sparkles size={40} className="text-amber-500/50 mb-auto" />
             <div className="h-3 w-24 bg-amber-500/20 rounded-full"></div>
             <div className="h-3 w-40 bg-muted-foreground/20 rounded-full"></div>
             <div className="h-3 w-28 bg-muted-foreground/20 rounded-full"></div>
             <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Global Pulse</p>
          </div>
          <div className="hidden md:flex p-8 bg-gradient-to-br from-card to-muted rounded-[2.5rem] border border-border flex flex-col justify-end gap-3 shadow-sm">
             <Shield size={32} className="text-primary/50 mb-auto" />
             <div className="h-2 w-16 bg-primary/20 rounded-full"></div>
             <div className="h-2 w-28 bg-muted-foreground/20 rounded-full"></div>
             <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Identity Vault</p>
          </div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative py-20 sm:py-32 bg-muted/40 border-y border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 tracking-tighter">
              Crafted for Auteurs
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground font-medium max-w-2xl mx-auto px-4">
              InkWell blends elegance with high-performance cloud architecture.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {[
              {
                icon: PenTool,
                color: "text-rose-500",
                title: "Artisan Editor",
                desc: "A focused writing environment where every stroke feels intentional."
              },
              {
                icon: BarChart3,
                color: "text-amber-500",
                title: "Impact Analytics",
                desc: "Detailed insights into how your ideas resonate globally."
              },
              {
                icon: Users,
                color: "text-blue-500",
                title: "Global Audience",
                desc: "Connect directly with readers who value depth and quality."
              },
              {
                icon: Zap,
                color: "text-emerald-500",
                title: "Cloud Engine",
                desc: "Lightning-fast distribution powered by microservices."
              },
              {
                icon: Shield,
                color: "text-indigo-500",
                title: "Trust Vault",
                desc: "Your intellectual property is protected by enterprise security."
              },
              {
                icon: Sparkles,
                color: "text-purple-500",
                title: "Presence Optimized",
                desc: "Automatic SEO and performance tuning for every work."
              }
            ].map((feat, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="glass-card p-8 sm:p-12 rounded-[2rem] sm:rounded-[3rem] group hover:-translate-y-2 transition-all duration-500"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-background border border-border flex items-center justify-center mb-6 sm:mb-8 shadow-sm group-hover:border-primary/50 group-hover:shadow-primary/10 transition-all">
                  <feat.icon size={28} className={feat.color} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 tracking-tight group-hover:text-primary transition-colors text-foreground">
                  {feat.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* RECENT ACTIVITY / STATS SECTION */}
      <section className="py-16 sm:py-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto glass-card rounded-[2.5rem] sm:rounded-[4rem] p-10 sm:p-16 flex flex-col md:flex-row items-center justify-between gap-10 sm:gap-12 border-primary/10 text-center md:text-left">
          <div>
            <h3 className="text-3xl sm:text-4xl font-black mb-3 sm:mb-4 text-foreground">The InkWell Pulse</h3>
            <p className="text-muted-foreground font-medium text-sm sm:text-base">Thousands of authors are shaping the future of writing.</p>
          </div>
          <div className="flex gap-8 sm:gap-12">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black golden-gradient-text">12k+</div>
              <div className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-60">Manuscripts</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black golden-gradient-text">850k</div>
              <div className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-60">Readers</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 sm:py-40 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-foreground"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-8 sm:mb-10 text-background tracking-tighter">
            Your masterpiece starts here.
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-background/70 mb-10 sm:mb-14 font-medium leading-relaxed px-4">
            Join the most ambitious publishing platform.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-10 py-5 sm:px-12 sm:py-6 rounded-full font-black text-lg sm:text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20 w-full sm:w-auto"
          >
            Get Started Now
            <ChevronRight size={24} />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;