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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="bg-white text-slate-900 min-h-screen flex flex-col font-sans selection:bg-rose-200 selection:text-rose-900">

      {/* HERO SECTION */}
      <section className="relative px-6 overflow-hidden flex flex-col items-center justify-center min-h-screen">

        {/* Background Blur Shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-100 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[40rem] h-[40rem] bg-stone-100 rounded-full blur-3xl opacity-70"></div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center justify-center"
        >
          <motion.div
            variants={fadeIn}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold tracking-wide mb-8 shadow-sm"
          >
            <Sparkles size={16} />
            Welcome to the New Era of Publishing
          </motion.div>

          <motion.h1
            variants={fadeIn}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold leading-[1.05] tracking-tight mb-8 text-slate-900"
          >
            Your Ideas,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500 italic pr-4">
              Magnified.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeIn}
            className="text-slate-500 max-w-2xl mx-auto text-xl md:text-2xl mb-12 font-medium leading-relaxed"
          >
            InkWell is the premier microservices platform for modern writers.
            Experience lightning-fast publishing, deep audience analytics,
            and beautiful typography.
          </motion.p>

          {!isLoggedIn ? (
            <motion.div
              variants={fadeIn}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link
                to="/register"
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Start Writing Free
                <ChevronRight size={20} />
              </Link>

              <Link
                to="/browse"
                className="bg-white text-slate-700 px-8 py-4 rounded-2xl border border-stone-200 font-bold text-lg hover:bg-stone-50 transition-all duration-300"
              >
                Explore Publications
              </Link>
            </motion.div>
          ) : (
            <motion.div variants={fadeIn}>
              <Link
                to="/dashboard"
                className="bg-rose-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-rose-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ChevronRight size={20} />
              </Link>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section className="bg-stone-50 py-32 border-y border-stone-200 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight">
              Engineered for Excellence
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Everything you need to write, publish, and scale your audience,
              built on a robust enterprise-grade microservices architecture.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: PenTool,
                color: "text-rose-500",
                bg: "bg-rose-50",
                title: "Distraction-Free Editor",
                desc: "A pristine, rich-text environment designed to keep you in the flow."
              },
              {
                icon: BarChart3,
                color: "text-amber-500",
                bg: "bg-amber-50",
                title: "Deep Analytics",
                desc: "Understand your audience with beautifully designed performance metrics."
              },
              {
                icon: Users,
                color: "text-blue-500",
                bg: "bg-blue-50",
                title: "Community Building",
                desc: "Build meaningful engagement through comments and newsletters."
              },
              {
                icon: Zap,
                color: "text-emerald-500",
                bg: "bg-emerald-50",
                title: "Lightning Fast",
                desc: "Powered by Spring Boot Microservices and React."
              },
              {
                icon: Shield,
                color: "text-indigo-500",
                bg: "bg-indigo-50",
                title: "Enterprise Security",
                desc: "JWT authentication and strong authorization built-in."
              },
              {
                icon: Sparkles,
                color: "text-purple-500",
                bg: "bg-purple-50",
                title: "SEO Optimized",
                desc: "Fast rendering and smart publishing for better rankings."
              }
            ].map((feat, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="bg-white p-10 rounded-[2rem] border border-stone-100 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-16 h-16 ${feat.bg} rounded-2xl flex items-center justify-center mb-8`}
                >
                  <feat.icon size={28} className={feat.color} />
                </div>

                <h3 className="text-2xl font-bold mb-4 text-slate-900">
                  {feat.title}
                </h3>

                <p className="text-slate-500 leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900"></div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white">
            Ready to shape the narrative?
          </h2>

          <p className="text-xl text-slate-300 mb-12 font-medium">
            Join the fastest-growing platform for independent writers.
          </p>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-slate-900 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-rose-50 transition-all duration-300"
          >
            Create Your Free Account
            <ChevronRight size={20} />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;