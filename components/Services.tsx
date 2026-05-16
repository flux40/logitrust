"use client";

import { motion } from "framer-motion";
import { Truck, Package, Settings } from "lucide-react";

const services = [
  {
    title: "Truckload Shipping",
    description:
      "Full truckload solutions for large shipments with dedicated vehicles and real-time tracking.",
    icon: Truck,
    image:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "LTL Shipping",
    description:
      "Cost-effective less-than-truckload shipping for smaller freight, consolidated for efficiency.",
    icon: Package,
    image:
      "https://images.unsplash.com/photo-1580674285054-bed31e145f59?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Logistics Solution",
    description:
      "End-to-end supply chain management with custom strategies for your business needs.",
    icon: Settings,
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Services() {
  return (
    <section id="our-services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-gold font-semibold uppercase tracking-wide text-sm">
            Our Services
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2">
            Comprehensive Logistics Solutions
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Tailored shipping and logistics services designed to meet your
            unique business requirements.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={cardVariants}
              whileHover={{ y: -10 }}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="h-56 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold transition-colors duration-300">
                  <service.icon className="w-6 h-6 text-gold group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600">{service.description}</p>
                <button className="mt-4 text-gold font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn More →
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}