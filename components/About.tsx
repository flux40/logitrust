"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "20+", label: "Years of Experience" },
  { value: "50+", label: "Cities Around the World" },
  { value: "2M+", label: "Happy Clients" },
];

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section id="about-us" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden shadow-2xl"
          >
            <img
              src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
              alt="About LogiTrust"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
          </motion.div>

          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-gold font-semibold uppercase tracking-wide text-sm">
              About Us
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2">
              Your Trusted Logistics Partner Since 2004
            </h2>
            <p className="text-gray-600 mt-4 leading-relaxed">
              LogiTrust has been at the forefront of global logistics,
              delivering excellence through innovation and reliability. Our
              commitment to customer satisfaction drives everything we do.
            </p>
            <p className="text-gray-600 mt-4 leading-relaxed">
              With a network spanning 50+ cities worldwide, we ensure your
              shipments reach their destination safely and on time, every time.
            </p>

            {/* Stats */}
            <div ref={ref} className="grid grid-cols-3 gap-4 mt-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-gold">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            <button className="mt-8 bg-navy text-white px-8 py-3 rounded-lg font-semibold hover:bg-navy/90 transition-all hover:scale-105 inline-flex items-center gap-2">
              Read More →
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}