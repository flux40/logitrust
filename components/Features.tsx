"use client";

import { motion } from "framer-motion";
import { MapPin, Zap, Shield, Headphones } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Real-time Tracking",
    description:
      "Monitor your shipment from pickup to delivery with live GPS tracking.",
  },
  {
    icon: Zap,
    title: "Fast Delivery",
    description: "Express shipping options with guaranteed delivery windows.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Bank-level encryption for all financial transactions.",
  },
  {
    icon: Headphones,
    title: "24/7 Customer Support",
    description: "Round-the-clock assistance from our logistics experts.",
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-gold font-semibold uppercase tracking-wide text-sm">
            Why Choose Us
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2">
            Premium Features for Peace of Mind
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="text-center p-6 rounded-2xl bg-gray-50 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gold transition-colors">
                <feature.icon className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}