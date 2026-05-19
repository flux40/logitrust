'use client'

import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Partners from '@/components/Partners'
import Services from '@/components/Services'
import About from '@/components/About'
import Features from '@/components/Features'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'
import TrackingInput from '@/components/tracking/TrackingInput'
import FAQ from '@/components/FAQ'

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      
      {/* Tracking Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <TrackingInput />
        </div>
      </section>
      
      <Partners />
      <Services />
      <About />
      <Features />
      
      {/* FAQ Section */}
      <FAQ />
      
      
      <CTA />
      <Footer />
    </main>
  )
}