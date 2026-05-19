"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, Package } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { name: "Homepage", href: "/" },
  { name: "Our Services", href: "/#our-services" },
  { name: "About Us", href: "/#about-us" },
  { name: "FAQ", href: "/#faq" },
  { name: "Contact Us", href: "/#contact-us" },
  { name: "Admin Chat", href: "/admin/chat" },
];

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
        scrolled ? "bg-navy/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Package className="w-8 h-8 text-gold transition-transform group-hover:scale-110" />
            <span className="text-white font-bold text-xl tracking-tight">
              Logi<span className="text-gold">Trust</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white/80 hover:text-gold transition-colors duration-200 text-sm font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-white hover:text-gold transition-colors duration-200 text-sm font-medium"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-gold text-navy px-5 py-2 rounded-lg font-semibold text-sm hover:bg-gold/90 transition-all duration-200 hover:scale-105"
            >
              Create Account
            </Link>
            <Link
              href="/track"
              className="border border-gold text-gold px-5 py-2 rounded-lg font-semibold text-sm hover:bg-gold/10 transition-all duration-200"
            >
              Track Shipment
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 focus:outline-none"
            aria-label="Toggle menu"
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
          className="md:hidden bg-navy/95 backdrop-blur-md border-t border-white/10"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-white/80 hover:text-gold transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 space-y-3 border-t border-white/10">
              <Link
                href="/login"
                className="block text-white/80 hover:text-gold transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block w-full bg-gold text-navy px-5 py-2 rounded-lg font-semibold text-center hover:bg-gold/90 transition-all"
                onClick={() => setIsOpen(false)}
              >
                Create Account
              </Link>
              <Link
                href="/track"
                className="block w-full border border-gold text-gold px-5 py-2 rounded-lg font-semibold text-center hover:bg-gold/10 transition-all"
                onClick={() => setIsOpen(false)}
              >
                Track Shipment
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}