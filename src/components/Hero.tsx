"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Clock, Award } from "lucide-react";

interface HeroSlide {
  id: number;
  badge: string;
  anniversaryNumber: string;
  anniversaryLabel: string;
  title: string;
  subtitle: string;
  tagline?: string;
  description: string;
  price: string;
  image: string;
  link: string;
  accentGradient: string;
  glowColor: string;
  watermark: string;
  specs: { label: string; value: string }[];
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    badge: "145TH ANNIVERSARY CRAFTSMANSHIP EDITION",
    anniversaryNumber: "145",
    anniversaryLabel: "th",
    title: "Anniversary Heritage",
    subtitle: "Presage Classic Series • Tomioka Silk Dial",
    description: "Celebrating 145 years of Japanese precision horology with hand-textured silk dial artistry and 70-hour automatic caliber.",
    price: "₹ 1,30,000",
    image: "https://res.cloudinary.com/dphscxzb4/image/upload/v1784048472/timect/image_2.png",
    link: "/watches",
    accentGradient: "radial-gradient(ellipse at 70% 45%, rgba(20, 45, 70, 0.95), rgba(7, 13, 20, 0.98))",
    glowColor: "rgba(197, 160, 89, 0.3)",
    watermark: "PRESAGE",
    specs: [
      { label: "Caliber", value: "6R35 Mechanical" },
      { label: "Power Reserve", value: "70 Hours" },
      { label: "Crystal", value: "Dual Sapphire" },
      { label: "Water Resistance", value: "50m" },
    ],
  },
  {
    id: 2,
    badge: "EXCLUSIVE DEEP SEA CHRONOMETER",
    anniversaryNumber: "300",
    anniversaryLabel: "m",
    title: "HydroConquest Edition",
    subtitle: "Automatic Diver • Ceramic Unidirectional Bezel",
    description: "Engineered for marine depth and refined urban prestige. Featuring high-grade stainless steel and scratch-resistant ceramic.",
    price: "₹ 2,25,000",
    image: "https://res.cloudinary.com/dphscxzb4/image/upload/v1784048474/timect/image_4.png",
    link: "/product/hydroconquest-exclusive-edition",
    accentGradient: "radial-gradient(ellipse at 70% 45%, rgba(15, 52, 82, 0.95), rgba(5, 15, 26, 0.98))",
    glowColor: "rgba(56, 189, 248, 0.3)",
    watermark: "PROSPEX",
    specs: [
      { label: "Caliber", value: "L888 Automatic" },
      { label: "Power Reserve", value: "72 Hours" },
      { label: "Bezel", value: "Ceramic Diver" },
      { label: "Water Resistance", value: "300m" },
    ],
  },
  {
    id: 3,
    badge: "HIGH-BEAT MASTERPIECE",
    anniversaryNumber: "1881",
    anniversaryLabel: "est",
    title: "King Seiko Mechanical",
    subtitle: "Zaratsu Polished • Box-Shaped Sapphire Crystal",
    tagline: "Ultra-precise 36,000 vph high-beat movement crafted with legendary Zaratsu mirror polishing.",
    description: "Pure Japanese geometry meets vintage 1960s heritage design. Re-imagined for the modern luxury collector.",
    price: "₹ 2,10,000",
    image: "https://res.cloudinary.com/dphscxzb4/image/upload/v1784048480/timect/image_9.png",
    link: "/product/king-seiko-sla063",
    accentGradient: "radial-gradient(ellipse at 70% 45%, rgba(45, 34, 20, 0.95), rgba(12, 10, 8, 0.98))",
    glowColor: "rgba(212, 175, 55, 0.35)",
    watermark: "SEIKO",
    specs: [
      { label: "Caliber", value: "6L35 High-Beat" },
      { label: "Power Reserve", value: "45 Hours" },
      { label: "Polishing", value: "Zaratsu Mirror" },
      { label: "Water Resistance", value: "50m" },
    ],
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const activeSlide = HERO_SLIDES[currentSlide];

  const handleGoToSlide = (index: number) => {
    if (index === currentSlide || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleNext = () => {
    const nextIdx = (currentSlide + 1) % HERO_SLIDES.length;
    handleGoToSlide(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
    handleGoToSlide(prevIdx);
  };

  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 7000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [currentSlide]);

  return (
    <section className="hero relative select-none">
      {/* Background Accent & Radial Light Aura */}
      <div
        className="hero-glow-bg duration-700 ease-in-out"
        style={{ background: activeSlide.accentGradient }}
      />

      {/* Decorative Swirl Lines */}
      <div className="swirl" />

      {/* Editorial Watermark Text in Background */}
      <div className="absolute right-4 md:right-24 top-1/2 -translate-y-1/2 text-white/[0.03] text-[120px] md:text-[220px] font-black tracking-widest pointer-events-none uppercase font-serif z-0">
        {activeSlide.watermark}
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto min-h-[580px] md:min-h-[640px] flex flex-col justify-between px-6 md:px-16 pt-8 pb-4">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 text-white z-10 pt-4 lg:pt-0">
            {/* Top Luxury Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-amber-400/30 text-[11px] md:text-[12px] tracking-[0.2em] font-medium text-amber-200 uppercase mb-6 shadow-lg shadow-black/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>{activeSlide.badge}</span>
            </div>

            {/* Serif Anniversary & Title */}
            <div className="serif text-[46px] sm:text-[62px] lg:text-[76px] leading-[1.05] font-medium tracking-tight">
              <span>{activeSlide.anniversaryNumber}</span>
              {activeSlide.anniversaryLabel && (
                <span className="text-amber-300/90 font-light text-[0.5em] ml-1 uppercase inline-block align-baseline">
                  {activeSlide.anniversaryLabel}
                </span>
              )}
              <br />
              <span className="bg-gradient-to-r from-white via-slate-100 to-amber-100/90 bg-clip-text text-transparent">
                {activeSlide.title}
              </span>
            </div>

            {/* Subtitle & Description */}
            <div className="mt-4 space-y-2">
              <h3 className="text-sm md:text-base tracking-[0.12em] font-medium text-amber-200/90 uppercase">
                {activeSlide.subtitle}
              </h3>
              <p className="text-[14px] md:text-[16px] text-slate-300 font-light max-w-xl leading-relaxed tracked-sm">
                {activeSlide.description}
              </p>
            </div>

            {/* Specification Badges Bar */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg">
              {activeSlide.specs.map((spec, i) => (
                <div
                  key={i}
                  className="px-3 py-2 bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-sm text-left hover:border-amber-400/40 transition-colors"
                >
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">
                    {spec.label}
                  </div>
                  <div className="text-[12px] font-medium text-amber-100 truncate">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions & Pricing */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={activeSlide.link}
                className="btn-dark inline-flex items-center gap-3 bg-white text-black hover:bg-amber-300 hover:text-black font-semibold text-xs tracking-[0.18em] px-7 py-4 shadow-xl transition-all group"
              >
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <div className="flex items-center gap-3 px-5 py-3.5 bg-black/40 border border-white/15 backdrop-blur-md rounded-none">
                <span className="text-xs text-slate-400 tracking-widest uppercase">Price</span>
                <span className="text-base md:text-lg font-serif font-medium text-amber-200">
                  {activeSlide.price}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: High Precision Watch Image with Ambient Halo */}
          <div className="lg:col-span-5 flex justify-center items-center relative py-6 lg:py-0">
            {/* Glowing Spotlight Radial Backdrop */}
            <div
              className="hero-watch-glow"
              style={{ background: activeSlide.glowColor }}
            />

            {/* Watch Image */}
            <div className="relative z-10 w-full flex justify-center items-center">
              <img
                src={activeSlide.image}
                alt={activeSlide.title}
                className={`w-[78%] sm:w-[65%] lg:w-[88%] max-w-[420px] h-auto object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.75)] hero-float transition-all duration-500 ${
                  isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Carousel Navigation Controls & Dots */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10 text-xs text-slate-300">
          {/* Trust Highlights */}
          <div className="hidden md:flex items-center gap-8 text-[12px] tracking-[0.12em] font-light text-slate-300">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Japanese Horology</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>5-Year International Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Precision Tested</span>
            </div>
          </div>

          {/* Slide Indicator & Manual Controls */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2 text-[11px] tracking-widest text-slate-400 font-mono">
              <span className="text-amber-300 font-bold">0{currentSlide + 1}</span>
              <span>/</span>
              <span>0{HERO_SLIDES.length}</span>
            </div>

            {/* Left & Right Chevrons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                aria-label="Previous Slide"
                className="p-2 bg-white/5 hover:bg-white/15 border border-white/10 rounded-full text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Slide"
                className="p-2 bg-white/5 hover:bg-white/15 border border-white/10 rounded-full text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GSAP Compatible Pagination Dots (Right Side Floating) */}
      <div className="dots hidden lg:flex">
        {HERO_SLIDES.map((slide, index) => (
          <span
            key={slide.id}
            onClick={() => handleGoToSlide(index)}
            className={`heroDot ${index === currentSlide ? "" : "off"}`}
            title={`Slide ${index + 1}: ${slide.title}`}
          />
        ))}
      </div>
    </section>
  );
}
