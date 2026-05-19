'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Package, Truck, Clock, Shield, CreditCard, Headphones } from 'lucide-react'
import Link from 'next/link'

const faqs = [
  {
    question: "How do I track my shipment?",
    answer: "You can track your shipment by entering your tracking ID on our tracking page. You'll receive real-time updates on your package location and estimated delivery time.",
    icon: Package
  },
  {
    question: "What are your delivery timeframes?",
    answer: "Delivery times vary based on the shipping method selected. Standard shipping takes 5-7 business days, Express takes 2-3 business days, and Overnight delivers next business day.",
    icon: Clock
  },
  {
    question: "How do I calculate shipping costs?",
    answer: "Shipping costs are calculated based on package weight, dimensions, origin, destination, and selected service level. Use our shipping calculator for an instant quote.",
    icon: CreditCard
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we offer international shipping to over 50 countries worldwide. Customs fees and duties may apply based on destination country regulations.",
    icon: Truck
  },
  {
    question: "What if my package is damaged?",
    answer: "If your package arrives damaged, please contact us within 24 hours of delivery. We'll initiate a claim and work to resolve the issue promptly.",
    icon: Shield
  },
  {
    question: "How can I contact customer support?",
    answer: "Our customer support team is available 24/7 via phone at +1 (888) 123-4567, email at support@logitrust.com, or live chat on our website.",
    icon: Headphones
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for business accounts.",
    icon: CreditCard
  },
  {
    question: "Can I change my delivery address after shipping?",
    answer: "Address changes may be possible if the package hasn't been dispatched yet. Contact our support team immediately for assistance.",
    icon: Truck
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-gold font-semibold uppercase tracking-wide text-sm">
            Common Questions
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Find answers to common questions about our logistics services
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <faq.icon className="w-6 h-6 text-gold" />
                  <span className="font-semibold text-navy text-lg">
                    {faq.question}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-2">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 text-center bg-gold/10 rounded-2xl p-8"
        >
          <h3 className="text-xl font-bold text-navy mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-4">
            Our support team is ready to help you 24/7
          </p>
          <Link
            href="/contact-us"
            className="inline-block bg-gold text-navy px-6 py-3 rounded-lg font-semibold hover:bg-gold/90 transition-all hover:scale-105"
          >
            Contact Us
          </Link>
        </motion.div>
      </div>
    </section>
  )
}