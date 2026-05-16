"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const partners = [
  { name: "Amazon", logo: "https://logo.clearbit.com/amazon.com" },
  { name: "Walmart", logo: "https://logo.clearbit.com/walmart.com" },
  { name: "Target", logo: "https://logo.clearbit.com/target.com" },
  { name: "FedEx", logo: "https://logo.clearbit.com/fedex.com" },
  { name: "DHL", logo: "https://logo.clearbit.com/dhl.com" },
  { name: "UPS", logo: "https://logo.clearbit.com/ups.com" },
];

export default function Partners() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-gold font-semibold uppercase tracking-wide text-sm">
            Trusted Partners
          </p>
          <h2 className="text-3xl font-bold text-navy mt-2">
            We Work With Industry Leaders
          </h2>
        </div>

        <Swiper
          modules={[Autoplay]}
          spaceBetween={30}
          slidesPerView={2}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
          }}
          loop={true}
          className="py-8"
        >
          {partners.map((partner) => (
            <SwiperSlide key={partner.name}>
              <div className="flex justify-center grayscale hover:grayscale-0 transition-all duration-300">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-12 w-auto opacity-60 hover:opacity-100 transition-all"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/120x40/e2e8f0/64748b?text=" +
                      partner.name;
                  }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}