"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, Package } from "lucide-react";

const navLinks = ["Homepage", "Our Services", "About Us", "FAQ", "Contact Us"];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-lg" : ""
      }`}
      style={{
        backgroundColor: scrolled ? '#07152B' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Package className="w-8 h-8" style={{ color: '#F4B400' }} />
            <span className="text-white font-bold text-xl tracking-tight">
              Logi<span style={{ color: '#F4B400' }}>Trust</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-white/80 hover:text-gold transition-colors duration-200 text-sm font-medium"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button className="text-white hover:text-gold transition-colors duration-200 text-sm font-medium">
              Login
            </button>
            <button 
              className="px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: '#F4B400', color: '#07152B' }}
            >
              Create Account
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden"
          style={{ backgroundColor: '#07152B' }}
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="block text-white/80 hover:text-gold transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                {link}
              </a>
            ))}
            <div className="pt-4 space-y-3">
              <button className="w-full text-white/80 hover:text-gold transition-colors py-2">
                Login
              </button>
              <button 
                className="w-full px-5 py-2 rounded-lg font-semibold transition-all"
                style={{ backgroundColor: '#F4B400', color: '#07152B' }}
              >
                Create Account
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}