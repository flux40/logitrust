'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setLoading(false)
    }, 1000)
  }

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      info: "+1 (888) 123-4567",
      action: "tel:+18881234567",
      bg: "bg-blue-500/10",
      color: "text-blue-500"
    },
    {
      icon: Mail,
      title: "Email",
      info: "support@logitrust.com",
      action: "mailto:support@logitrust.com",
      bg: "bg-gold/10",
      color: "text-gold"
    },
    {
      icon: MapPin,
      title: "Office",
      info: "123 Logistics Avenue, New York, NY 10001",
      action: "#",
      bg: "bg-green-500/10",
      color: "text-green-500"
    },
    {
      icon: Clock,
      title: "Support Hours",
      info: "24/7 - Always Open",
      action: "#",
      bg: "bg-purple-500/10",
      color: "text-purple-500"
    }
  ]

  return (
    <section id="contact-us" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-gold font-semibold uppercase tracking-wide text-sm">
            Get In Touch
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2">
            Contact Us
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Have questions? We're here to help. Reach out to us anytime.
          </p>
        </motion.div>

        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info, index) => (
            <motion.a
              key={index}
              href={info.action}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all hover:scale-105 block group"
            >
              <div className={`${info.bg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <info.icon className={`w-8 h-8 ${info.color}`} />
              </div>
              <h3 className="font-bold text-navy text-lg mb-2">{info.title}</h3>
              <p className="text-gray-600 text-sm">{info.info}</p>
            </motion.a>
          ))}
        </div>

        {/* Contact Form & Map */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-gold" />
              <h3 className="text-2xl font-bold text-navy">Send us a message</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-navy font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-gold focus:outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-navy font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-gold focus:outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label className="block text-navy font-medium mb-2">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-gold focus:outline-none transition-colors"
                  placeholder="Shipping inquiry"
                />
              </div>
              
              <div>
                <label className="block text-navy font-medium mb-2">Message</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-gold focus:outline-none transition-colors resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold text-navy py-3 rounded-lg font-semibold hover:bg-gold/90 transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Sending...' : 'Send Message'}
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>

          {/* Map / Location */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="h-64 bg-gray-200 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933049!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316bb2ec0b%3A0xb89d1fe6bc499443!2sDowntown%20Conference%20Center!5e0!3m2!1sen!2sus!4v1699999999999!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="LogiTrust Office Location"
              ></iframe>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-navy text-lg mb-2">Visit Our Office</h3>
              <p className="text-gray-600 mb-2">
                123 Logistics Avenue, New York, NY 10001
              </p>
              <p className="text-gray-600">
                Monday - Friday: 9:00 AM - 6:00 PM EST
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}