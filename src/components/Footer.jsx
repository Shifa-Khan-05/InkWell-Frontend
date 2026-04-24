import React from "react";

const Footer = () => {

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
        // We call the Gateway (8080) which routes to Newsletter-Service (8086)
        const response = await api.post('/newsletter/subscribe', { email });
        toast.success("Welcome to the inner circle! Check your inbox. 📧");
        setEmail("");
    } catch (err) {
        toast.error(err.response?.data?.message || "Subscription failed.");
    }
};
  return (
    <footer className="bg-black border-t border-gray-800 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8 text-gray-400">
        
        <div>
          <h2 className="text-xl font-bold text-white mb-3">InkWell</h2>
          <p>Write, publish, and grow your audience.</p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Explore</h3>
          <ul className="space-y-2">
            <li>Posts</li>
            <li>Categories</li>
            <li>Tags</li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Connect</h3>
          <p>support@inkwell.com</p>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm pb-4">
        © 2026 InkWell
      </div>
    </footer>
  );
};

export default Footer;