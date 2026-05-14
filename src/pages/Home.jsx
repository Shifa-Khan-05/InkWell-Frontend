import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Star,
  PenTool,
  Globe,
  BarChart,
  TrendingUp,
  CheckCircle2
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

const testimonials = [
  {
    quote: "InkWell transformed my writing process by eliminating repetitive formatting and improving efficiency. Scaling my narrative workflow has never been easier!",
    name: "James Carter",
    role: "Bestselling Author",
    image: "https://ui-avatars.com/api/?name=James+Carter&background=2d3748&color=fff"
  },
  {
    quote: "With InkWell, I cut manual work and improved accuracy. My focus is now on high-impact chapters while the platform handles the rest!",
    name: "Sophia Martinez",
    role: "Editor-in-Chief",
    image: "https://ui-avatars.com/api/?name=Sophia+Martinez&background=2d3748&color=fff"
  },
  {
    quote: "Data-driven insights doubled my reader engagement. I now engage readers at the right time with smarter, data-backed decisions!",
    name: "David Reynolds",
    role: "Content Strategist",
    image: "https://ui-avatars.com/api/?name=David+Reynolds&background=2d3748&color=fff"
  },
  {
    quote: "Community support is now seamless. Reader response time improved drastically, and satisfaction levels are at an all-time high, thanks to InkWell.",
    name: "Emily Wong",
    role: "Indie Publisher",
    image: "https://ui-avatars.com/api/?name=Emily+Wong&background=2d3748&color=fff"
  }
];

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
    <div className="bg-background text-foreground min-h-screen flex flex-col selection:bg-primary/30 selection:text-primary transition-colors duration-500 overflow-x-hidden relative">
      
      {/* Subtle Starry Background Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20" style={{ backgroundImage: 'radial-gradient(circle, var(--foreground) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 py-20 overflow-hidden z-10">
        
        {/* Dynamic Background Blob - Purple/Primary */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] sm:w-[50rem] h-[30rem] sm:h-[50rem] bg-primary/30 rounded-full blur-[100px] sm:blur-[150px] mix-blend-screen dark:mix-blend-lighten pointer-events-none"></div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center"
        >
          <motion.div
            variants={fadeIn}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-foreground text-sm font-semibold mb-8 shadow-sm backdrop-blur-md"
          >
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full mr-1">New</span>
            Professional Writing Suite
          </motion.div>

          <motion.h1
            variants={fadeIn}
            className="text-5xl sm:text-7xl md:text-8xl font-bold leading-tight tracking-tight mb-6 max-w-4xl"
          >
            Intelligent Publishing for Modern Creators.
          </motion.h1>

          <motion.p
            variants={fadeIn}
            className="text-muted-foreground max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl mb-10 font-medium leading-relaxed tracking-tight"
          >
            InkWell brings professional writing tools to your fingertips & streamlines storytelling.
          </motion.p>

          <motion.div
            variants={fadeIn}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full sm:w-auto"
          >
            {!isLoggedIn ? (
              <>
                <Link to="/register" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 w-full sm:w-auto">
                  Start Writing <ArrowUpRight size={20} />
                </Link>
                <Link to="/browse" className="bg-card hover:bg-muted border border-border text-foreground px-8 py-4 rounded-xl font-bold text-lg transition-all w-full sm:w-auto">
                  View Library
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 w-full sm:w-auto">
                Go to Dashboard <ArrowUpRight size={20} />
              </Link>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURE SHOWCASE 1 */}
      <section className="relative py-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight max-w-3xl mx-auto">
              Publishing Tools That Take Your Writing to the Next Level
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
              We provide artisan tools, intelligent analytics, and global reach that help you create smarter, not harder.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 sm:gap-20 items-center mb-24 sm:mb-32">
            <div className="order-2 lg:order-1 relative group">
              <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-all duration-700 pointer-events-none"></div>
              <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl bg-card">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop" alt="Dashboard Workflow" className="w-full h-auto opacity-90 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-card border border-border text-xs font-bold tracking-wide">
                Workflow Automation
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">Streamline your publishing</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We help you streamline your writing process by automating formatting, distribution, and audience engagement, saving time and cutting down errors.
              </p>
              <div className="flex flex-wrap gap-3 pt-4">
                <span className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-bold">Smart Formatting</span>
                <span className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-bold">Global Distribution</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 sm:gap-20 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-card border border-border text-xs font-bold tracking-wide">
                Reach & Analytics
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">Accelerate Audience Growth</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Tools for audience engagement, personalized distribution, and automated content delivery that scales your reach and builds a stronger personal brand.
              </p>
              <div className="flex flex-wrap gap-3 pt-4">
                <span className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-bold">Readers</span>
                <span className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-bold">Content</span>
                <span className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-bold">Newsletters</span>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full group-hover:bg-blue-500/30 transition-all duration-700 pointer-events-none"></div>
              <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl bg-card">
                <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop" alt="Analytics Dashboard" className="w-full h-auto opacity-90 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section className="relative py-24 sm:py-32 z-10 bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
              Our Simple, Smart, and Scalable Process
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
              We design, develop, and implement publishing tools that help you work smarter, not harder.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-card border border-border rounded-[2rem] p-8 sm:p-10 hover:border-primary/50 transition-colors group relative overflow-hidden">
              <div className="text-xs font-bold bg-muted w-fit px-3 py-1 rounded-md mb-4 text-muted-foreground">Step 1</div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">Smart Drafting</h3>
              <p className="text-muted-foreground mb-8">Start with our distraction-free artisan editor that auto-formats and saves as you go.</p>
              <div className="h-40 sm:h-48 rounded-xl overflow-hidden border border-border shadow-inner relative">
                <img src="https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800&auto=format&fit=crop" alt="Smart Drafting" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" />
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-[2rem] p-8 sm:p-10 hover:border-primary/50 transition-colors group relative overflow-hidden">
              <div className="text-xs font-bold bg-muted w-fit px-3 py-1 rounded-md mb-4 text-muted-foreground">Step 2</div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">Global Distribution</h3>
              <p className="text-muted-foreground mb-8">Publish your work to a global audience with a single click, perfectly optimized for reading.</p>
              <div className="h-40 sm:h-48 rounded-xl overflow-hidden border border-border shadow-inner relative">
                <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop" alt="Global Distribution" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-[2rem] p-8 sm:p-10 hover:border-primary/50 transition-colors group relative overflow-hidden">
              <div className="text-xs font-bold bg-muted w-fit px-3 py-1 rounded-md mb-4 text-muted-foreground">Step 3</div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">Audience Analytics</h3>
              <p className="text-muted-foreground mb-8">Track reader engagement, read times, and demographic growth with our powerful dashboard.</p>
              <div className="h-40 sm:h-48 rounded-xl overflow-hidden border border-border shadow-inner relative">
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop" alt="Audience Analytics" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-[2rem] p-8 sm:p-10 hover:border-primary/50 transition-colors group relative overflow-hidden">
              <div className="text-xs font-bold bg-muted w-fit px-3 py-1 rounded-md mb-4 text-muted-foreground">Step 4</div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">Monetization & Growth</h3>
              <p className="text-muted-foreground mb-8">Build a loyal subscriber base, manage premium content, and scale your writing career.</p>
              <div className="h-40 sm:h-48 rounded-xl overflow-hidden border border-border shadow-inner relative">
                <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop" alt="Monetization & Growth" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CASE STUDY SECTION */}
      <section className="relative py-24 sm:py-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
              See How InkWell Transforms Authors
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground font-medium">
              See how our publishing suite streamlines operations, boosts reach and drives growth.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center bg-card border border-border rounded-[3rem] overflow-hidden shadow-sm">
            <div className="h-full min-h-[400px] relative">
              <img src="https://images.unsplash.com/photo-1455390582262-044cdead2708?q=80&w=1000&auto=format&fit=crop" alt="Premium Writer Setup" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card hidden lg:block"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent lg:hidden block"></div>
            </div>
            
            <div className="p-8 sm:p-12 lg:p-16 space-y-8">
              <div className="font-bold text-2xl tracking-tighter italic text-primary">IndiePublish.</div>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                "InkWell's distribution tools increased reader engagement by 40% for our Indie Authors"
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                IndiePublish, a collective of independent writers, faced platform fatigue and fragmented distribution. Our ecosystem optimized their publishing cycles, helping them reach audiences faster and with less overhead.
              </p>
              
              <div className="space-y-4 pt-4">
                <p className="font-bold text-foreground">Impact :</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle2 size={20} className="text-primary" />
                    <span className="font-medium text-foreground">40% Higher Read Rates</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle2 size={20} className="text-primary" />
                    <span className="font-medium text-foreground">35% Faster Publishing</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle2 size={20} className="text-primary" />
                    <span className="font-medium text-foreground">20% More Subscribers</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle2 size={20} className="text-primary" />
                    <span className="font-medium text-foreground">25% Increase in Reach</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="relative py-24 sm:py-32 z-10 bg-muted/10 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
              Why Authors Love InkWell
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground font-medium">
              Real creators, real results with intelligent publishing.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto"
          >
            {testimonials.map((test, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="bg-card border border-border p-8 sm:p-10 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Subtle gradient at the bottom mimicking the screenshot */}
                <div className="absolute -bottom-20 left-0 right-0 h-40 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none"></div>
                
                <div className="flex gap-1 text-foreground mb-6">
                  {[1,2,3,4,5].map(star => <Star key={star} size={20} fill="currentColor" stroke="none" />)}
                </div>
                
                <p className="text-lg sm:text-xl text-foreground font-medium leading-relaxed mb-8 relative z-10">
                  "{test.quote}"
                </p>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-border bg-muted">
                    <img src={test.image} alt={test.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{test.name}</h4>
                    <p className="text-sm text-muted-foreground">{test.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FLOATING ACTION BUTTONS */}
      <div className="fixed bottom-8 right-8 z-50 hidden lg:flex flex-col gap-3">
        {!isLoggedIn && (
           <Link to="/register" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center justify-between gap-2 border border-primary/50">
             Use For Free <ArrowUpRight size={16} />
           </Link>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Home;