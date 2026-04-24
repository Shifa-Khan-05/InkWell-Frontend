import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      
    

      {/* HERO */}
      <section className="text-center py-28 px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          Write. Publish. <br />
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Inspire the world.
          </span>
        </h1>

        <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-10">
          InkWell is a modern blogging platform for creators who want
          powerful tools, beautiful writing experience, and real audience growth.
        </p>

        {!isLoggedIn && (
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 rounded-lg font-semibold hover:opacity-90"
            >
              Start Writing
            </Link>

            <button className="border border-gray-700 px-8 py-3 rounded-lg hover:bg-gray-900">
              Explore Posts
            </button>
          </div>
        )}
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-10">
        
        <div className="bg-gray-900 p-6 rounded-xl hover:shadow-xl transition">
          <h3 className="text-xl font-bold mb-3">✍️ Rich Editor</h3>
          <p className="text-gray-400">
            Create stunning blogs with media, formatting, and tags.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl hover:shadow-xl transition">
          <h3 className="text-xl font-bold mb-3">📊 Analytics</h3>
          <p className="text-gray-400">
            Track engagement, readers, and performance.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl hover:shadow-xl transition">
          <h3 className="text-xl font-bold mb-3">💬 Engagement</h3>
          <p className="text-gray-400">
            Comments, likes, and community interaction.
          </p>
        </div>

      </section>

      {/* CTA */}
      <section className="text-center py-20 px-6">
        <h2 className="text-3xl font-bold mb-4">
          Start your writing journey today
        </h2>
        <p className="text-gray-400 mb-6">
          Join creators building their audience on InkWell.
        </p>

        <Link
          to="/register"
          className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-lg font-semibold"
        >
          Get Started
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default Home;