"use client";

import { useRef, useState, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "@studio-freight/lenis";
import { getNewArrivals, getRecommended, Product } from "@/db/actions";

import Preloader from "@/components/Preloader";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import NewArrivals from "@/components/NewArrivals";
import Recommended from "@/components/Recommended";
import ShopByCategory from "@/components/ShopByCategory";
import ForHimHer from "@/components/ForHimHer";
import Quote from "@/components/Quote";
import Footer from "@/components/Footer";
import {
  applyScroll,
  getSavedScroll,
  isPopNav,
} from "@/lib/scroll-memory";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

let homeCatalogCache: { arrivals: Product[]; recs: Product[] } | null = null;

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [skipIntro] = useState(() => {
    if (typeof window === "undefined") return false;
    return isPopNav() && getSavedScroll("/") != null;
  });
  const [productsLoaded, setProductsLoaded] = useState(
    () => homeCatalogCache != null,
  );
  const [newArrivals, setNewArrivals] = useState<Product[]>(
    () => homeCatalogCache?.arrivals ?? [],
  );
  const [recommended, setRecommended] = useState<Product[]>(
    () => homeCatalogCache?.recs ?? [],
  );

  const productsLoadedRef = useRef(productsLoaded);
  const introFinishedRef = useRef(false);
  const triggerExitRef = useRef<() => void>(() => {});

  useLayoutEffect(() => {
    if (!skipIntro) return;
    const y = getSavedScroll("/") ?? 0;
    applyScroll(y);
  }, [skipIntro]);

  useEffect(() => {
    productsLoadedRef.current = productsLoaded;
    triggerExitRef.current();
  }, [productsLoaded]);

  useEffect(() => {
    if (skipIntro && productsLoaded) {
      const y = getSavedScroll("/") ?? 0;
      applyScroll(y);
      lenisRef.current?.scrollTo(y, { immediate: true });
    }
  }, [skipIntro, productsLoaded]);

  useEffect(() => {
    if (homeCatalogCache) return;
    Promise.all([getNewArrivals(), getRecommended()])
      .then(([arrivals, recs]) => {
        homeCatalogCache = { arrivals, recs };
        setNewArrivals(arrivals);
        setRecommended(recs);
        setProductsLoaded(true);
      })
      .catch((err) => {
        console.error("Error loading products:", err);
        setProductsLoaded(true); // fallback to let user see site anyway
      });
  }, []);

  useGSAP(() => {
    // Lenis setup
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    } as any);

    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const onTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTicker);
    gsap.ticker.lagSmoothing(0);

    // Elements
    const preloader = document.querySelector(".preloader");
    const preloaderLine = document.querySelector(".preloader-line");
    const preloaderLogo = document.querySelector(".preloader-logo");
    const header = document.querySelector("header");
    const heroHeading = document.querySelector(".hero .serif");
    const heroText = document.querySelector(".hero p");
    const heroBtn = document.querySelector(".hero .btn-dark");
    const heroImg = document.querySelector(".hero img");
    const scrollProgress = document.querySelector(".scroll-progress");
    const backToTop = document.querySelector(".back-to-top");

    const showPageFully = () => {
      gsap.set(header, { yPercent: 0, opacity: 1 });
      gsap.set(heroHeading, { autoAlpha: 1, y: 0 });
      gsap.set(heroText, { autoAlpha: 1, y: 0 });
      gsap.set(heroBtn, { autoAlpha: 1, y: 0 });
      gsap.set(heroImg, { scale: 1, opacity: 1 });
      gsap.set(".heroDot", { autoAlpha: 1, x: 0 });
      if (document.querySelectorAll(".prod-item").length > 0) {
        gsap.set(".prod-item", { opacity: 1, y: 0 });
      }
      gsap.set(".cat-tile", {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      });
      gsap.set("footer .footer-col", { opacity: 1, y: 0 });
      document.querySelectorAll(".bg-\\[\\#f4f4f2\\] *").forEach((el) => {
        if (el.tagName !== "IMG") gsap.set(el, { opacity: 1, y: 0 });
      });
      if (preloader) gsap.set(preloader, { yPercent: -100, autoAlpha: 0 });
    };

    function playExitAnimation() {
      const tlExit = gsap.timeline();
      tlExit
        .to(".preloader-text", { autoAlpha: 0, duration: 0.3 })
        .to(preloaderLogo, { autoAlpha: 0, duration: 0.4, y: -20 }, "-=0.2")
        .to(preloaderLine, { autoAlpha: 0, duration: 0.3 }, "-=0.3")
        .to(preloader, { yPercent: -100, duration: 0.8, ease: "power3.inOut" })
        .call(() => {
          initPageAnimations();
        });
    }

    function initPageAnimations() {
      const tlLoad = gsap.timeline();

      tlLoad
        .to(header, {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
        })
        .to(
          heroImg,
          { scale: 1, opacity: 1, duration: 1.2, ease: "power3.out" },
          "-=0.5"
        )
        .to(
          heroHeading,
          { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" },
          "-=1"
        )
        .to(
          heroText,
          { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" },
          "-=0.6"
        )
        .to(
          heroBtn,
          { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.6"
        )
        .to(
          ".heroDot",
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.6"
        );

      initScrollAnimations();
    }

    function initScrollAnimations() {
      // Scroll Progress
      const handleScroll = () => {
        const scrollPx = document.documentElement.scrollTop;
        const winHeightPx =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
        const scrolled = `${(scrollPx / winHeightPx) * 100}%`;
        if (scrollProgress)
          (scrollProgress as HTMLElement).style.width = scrolled;

        if (scrollPx > 500) {
          backToTop?.classList.add("visible");
        } else {
          backToTop?.classList.remove("visible");
        }
      };
      window.addEventListener("scroll", handleScroll);

      if (backToTop) {
        backToTop.addEventListener("click", () => {
          lenis.scrollTo(0, {
            duration: 1.2,
            easing: (t: number) =>
              Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        });
      }
      // Hero Parallax
      gsap.to(".hero .swirl", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(heroImg, {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Product Carousel Reveal
      const productCards = document.querySelectorAll(
        ".group.cursor-pointer, .group\\/card.cursor-pointer"
      );
      productCards.forEach((card) => card.classList.add("prod-item"));

      if (productCards.length > 0) {
        ScrollTrigger.batch(".prod-item", {
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              stagger: 0.1,
              duration: 0.8,
              ease: "power3.out",
            }),
          start: "top 85%",
        });
      }

      // Category Grid Reveal
      ScrollTrigger.batch(".cat-tile", {
        onEnter: (batch) =>
          gsap.to(batch, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            stagger: 0.1,
            duration: 1,
            ease: "power3.out",
          }),
        start: "top 80%",
      });

      // Featured Watch Reveal
      gsap.fromTo(
        ".grid.md\\:grid-cols-2 .watch-wrap",
        { clipPath: "inset(10% 10% 10% 10%)", opacity: 0 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".grid.md\\:grid-cols-2",
            start: "top 75%",
          },
        }
      );

      // Quote Section
      ScrollTrigger.batch(".bg-\\[\\#f4f4f2\\] *:not(img)", {
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "power2.out",
          }),
        start: "top 85%",
      });

      // Footer
      ScrollTrigger.batch("footer .footer-col", {
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "power2.out",
          }),
        start: "top 95%",
      });
    }

    if (skipIntro) {
      showPageFully();
      const y = getSavedScroll("/") ?? 0;
      applyScroll(y);
      lenis.scrollTo(y, { immediate: true });
      initScrollAnimations();
    } else {
      gsap.set(header, { yPercent: -100, opacity: 0 });
      gsap.set(heroHeading, { autoAlpha: 0, y: 30 });
      gsap.set(heroText, { autoAlpha: 0, y: 30 });
      gsap.set(heroBtn, { autoAlpha: 0, y: 30 });
      gsap.set(heroImg, { scale: 1.08, opacity: 0 });
      gsap.set(".heroDot", { autoAlpha: 0, x: -20 });

      if (document.querySelectorAll(".prod-item").length > 0) {
        gsap.set(".prod-item", { opacity: 0, y: 40 });
      }
      gsap.set(".cat-tile", { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" });
      gsap.set("footer .footer-col", { opacity: 0, y: 20 });
      document.querySelectorAll(".bg-\\[\\#f4f4f2\\] *").forEach((el) => {
        if (el.tagName !== "IMG") gsap.set(el, { opacity: 0, y: 20 });
      });

      const checkAndExit = () => {
        if (introFinishedRef.current && productsLoadedRef.current) {
          playExitAnimation();
        }
      };

      triggerExitRef.current = checkAndExit;

      const tlPreload = gsap.timeline({
        onComplete: () => {
          introFinishedRef.current = true;
          checkAndExit();
        },
      });

      tlPreload
        .to(preloaderLogo, { autoAlpha: 1, duration: 0.6, ease: "power2.out" })
        .to(
          preloaderLine,
          { scaleX: 1, duration: 1.2, ease: "expo.inOut" },
          "-=0.3"
        );
    }

    // Button Press Animation
    const allButtons = document.querySelectorAll("button");
    const onMouseDown = (e: Event) =>
      gsap.to(e.currentTarget, { scale: 0.98, duration: 0.1 });
    const onMouseUp = (e: Event) =>
      gsap.to(e.currentTarget, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });

    allButtons.forEach((btn) => {
      btn.addEventListener("mousedown", onMouseDown);
      btn.addEventListener("mouseup", onMouseUp);
      btn.addEventListener("mouseleave", onMouseUp);
    });

    return () => {
      allButtons.forEach((btn) => {
        btn.removeEventListener("mousedown", onMouseDown);
        btn.removeEventListener("mouseup", onMouseUp);
        btn.removeEventListener("mouseleave", onMouseUp);
      });
      gsap.ticker.remove(onTicker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, { scope: containerRef, dependencies: [skipIntro, productsLoaded] });

  return (
    <div ref={containerRef}>
      <div className="scroll-progress"></div>
      {!skipIntro && <Preloader />}
      <div className="back-to-top">↑</div>
      <Header />
      <Hero />
      <NewArrivals products={newArrivals} />
      <Recommended products={recommended} />
      <ShopByCategory />
      <ForHimHer />
      <Quote />
      <Footer />
    </div>
  );
}
