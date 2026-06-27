import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Phone,
  MapPin
} from 'lucide-react';
import api from '../api';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  // Dynamic data states
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // Navigation states
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Carousel states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const isTransitioning = useRef(false);

  // Selected products state (interactive cart integration with Order section)
  const [selectedProducts, setSelectedProducts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tony_cart') || '[]');
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('tony_cart', JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  // Toast notification state
  const [toast, setToast] = useState({ visible: false, message: '' });

  // Order form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    address: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Refs for elements and GSAP targets
  const prefersReducedMotion = useRef(false);
  const autoplayRef = useRef(null);
  const toastRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const headerRef = useRef(null);

  // Carousel sub-elements refs
  const slidesRef = useRef([]);
  const slideBgsRef = useRef([]);
  const slideCategoryRef = useRef([]);
  const slideTitleRef = useRef([]);
  const slideDescRef = useRef([]);
  const slidePriceRef = useRef([]);
  const slideCtaRef = useRef([]);

  // Products Section refs
  const productsSectionRef = useRef(null);
  const productsTitleRef = useRef(null);
  const productsSubRef = useRef(null);
  const productCardsRef = useRef([]);

  // Order Section refs
  const orderSectionRef = useRef(null);
  const orderLeftRef = useRef(null);
  const orderRightRef = useRef(null);
  const orderStepsRef = useRef([]);
  const successCardRef = useRef(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [bannersRes, productsRes, categoriesRes, settingsRes, testimonialsRes] = await Promise.all([
          api.get('/content/banners'),
          api.get('/products?status=active'),
          api.get('/products/categories'),
          api.get('/settings'),
          api.get('/content/testimonials')
        ]);

        if (bannersRes.data.success) {
          setBanners(bannersRes.data.banners);
        }
        if (productsRes.data.success) {
          setProducts(productsRes.data.products);
        }
        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.categories);
        }
        if (settingsRes.data.success) {
          setSettings(settingsRes.data.settings);
        }
        if (testimonialsRes.data.success) {
          setTestimonials(testimonialsRes.data.testimonials);
        }
      } catch (err) {
        console.error("Error loading storefront data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Detect scroll for floating navbar
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (autoplayRef.current) autoplayRef.current.kill();
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Autoplay function
  const startAutoplay = () => {
    if (autoplayRef.current) autoplayRef.current.kill();
    autoplayRef.current = gsap.delayedCall(5, () => {
      handleManualNav('next');
    });
  };

  // Carousel navigation handler
  const handleManualNav = (direction) => {
    if (banners.length === 0 || isTransitioning.current) return;
    isTransitioning.current = true;

    if (autoplayRef.current) autoplayRef.current.kill();

    setPrevIndex(currentIndex);
    if (direction === 'next') {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  // Carousel transition effect
  useEffect(() => {
    if (prevIndex === null || banners.length === 0) return;

    const incomingSlide = slidesRef.current[currentIndex];
    const outgoingSlide = slidesRef.current[prevIndex];
    const incomingBg = slideBgsRef.current[currentIndex];
    const outgoingBg = slideBgsRef.current[prevIndex];

    const incomingCategory = slideCategoryRef.current[currentIndex];
    const incomingTitle = slideTitleRef.current[currentIndex];
    const incomingDesc = slideDescRef.current[currentIndex];
    const incomingPrice = slidePriceRef.current[currentIndex];
    const incomingCta = slideCtaRef.current[currentIndex];

    // Kill any running animations on these elements
    gsap.killTweensOf([incomingSlide, outgoingSlide, incomingBg, outgoingBg]);
    gsap.killTweensOf([incomingCategory, incomingTitle, incomingDesc, incomingPrice, incomingCta]);

    const motion = !prefersReducedMotion.current;

    // Reset slide z-indexing & preparation
    gsap.set(incomingSlide, { zIndex: 10, opacity: 0, pointerEvents: 'auto' });
    gsap.set(outgoingSlide, { zIndex: 5, pointerEvents: 'none' });
    if (incomingBg && motion) gsap.set(incomingBg, { scale: 1.05 });

    const tl = gsap.timeline({
      onComplete: () => {
        isTransitioning.current = false;
        slidesRef.current.forEach((slide, idx) => {
          if (slide) {
            gsap.set(slide, {
              zIndex: idx === currentIndex ? 10 : 0
            });
          }
        });
      }
    });

    // Crossfade slide containers
    tl.to(incomingSlide, { opacity: 1, duration: motion ? 0.8 : 0.1, ease: 'power2.inOut' }, 0);
    tl.to(outgoingSlide, { opacity: 0, duration: motion ? 0.8 : 0.1, ease: 'power2.inOut' }, 0);

    // Zoom background on incoming
    if (incomingBg && motion) {
      tl.to(incomingBg, { scale: 1.15, duration: 5, ease: 'power1.out' }, 0.2);
    }

    // Slide up + Fade in stagger on incoming text elements
    tl.fromTo(
      [incomingCategory, incomingTitle, incomingDesc, incomingPrice, incomingCta].filter(Boolean),
      { y: motion ? 35 : 0, opacity: 0 },
      { y: 0, opacity: 1, duration: motion ? 0.9 : 0.2, stagger: motion ? 0.12 : 0, ease: 'power3.out' },
      0.3
    );

    // Restart autoplay timer
    startAutoplay();
  }, [currentIndex, prevIndex, banners]);

  // GSAP animations setup once dynamic data loads
  useEffect(() => {
    if (loading) return;

    if (banners.length > 0) {
      // Initial setup of slides
      slidesRef.current.forEach((slide, idx) => {
        if (slide) {
          gsap.set(slide, {
            opacity: idx === 0 ? 1 : 0,
            zIndex: idx === 0 ? 10 : 0,
            pointerEvents: idx === 0 ? 'auto' : 'none'
          });
        }
      });

      // Animate initial first slide background and text elements
      const activeBg = slideBgsRef.current[0];
      const activeCategory = slideCategoryRef.current[0];
      const activeTitle = slideTitleRef.current[0];
      const activeDesc = slideDescRef.current[0];
      const activePrice = slidePriceRef.current[0];
      const activeCta = slideCtaRef.current[0];

      const motion = !prefersReducedMotion.current;

      if (activeBg && motion) gsap.set(activeBg, { scale: 1.05 });

      const tl = gsap.timeline();
      if (activeBg && motion) {
        tl.to(activeBg, { scale: 1.15, duration: 5, ease: 'power1.out' }, 0);
      }
      tl.fromTo(
        [activeCategory, activeTitle, activeDesc, activePrice, activeCta].filter(Boolean),
        { y: motion ? 30 : 0, opacity: 0 },
        { y: 0, opacity: 1, duration: motion ? 1 : 0.2, stagger: motion ? 0.15 : 0, ease: 'power3.out' },
        0.2
      );

      startAutoplay();
    }

    // Scroll Trigger animation for Products section
    const trigger = productsSectionRef.current;
    if (trigger) {
      const cards = productCardsRef.current.filter(Boolean);
      const motion = !prefersReducedMotion.current;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trigger,
          start: "top 80%",
          toggleActions: "play none none none",
          once: true,
        }
      });

      tl.fromTo(
        productsTitleRef.current,
        { y: motion ? 30 : 0, opacity: 0 },
        { y: 0, opacity: 1, duration: motion ? 0.6 : 0.2, ease: "power2.out" }
      );

      tl.fromTo(
        productsSubRef.current,
        { y: motion ? 20 : 0, opacity: 0 },
        { y: 0, opacity: 1, duration: motion ? 0.5 : 0.2, ease: "power2.out" },
        "-=0.4"
      );

      if (cards.length > 0) {
        tl.fromTo(
          cards,
          { y: motion ? 50 : 0, opacity: 0 },
          { y: 0, opacity: 1, duration: motion ? 0.8 : 0.2, stagger: motion ? 0.12 : 0, ease: "power3.out" },
          "-=0.3"
        );
      }
    }

    // Scroll Trigger animation for Order section
    const orderTrigger = orderSectionRef.current;
    if (orderTrigger) {
      const steps = orderStepsRef.current.filter(Boolean);
      const motion = !prefersReducedMotion.current;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: orderTrigger,
          start: "top 75%",
          toggleActions: "play none none none",
          once: true,
        }
      });

      tl.fromTo(
        orderLeftRef.current,
        { x: motion ? -40 : 0, opacity: 0 },
        { x: 0, opacity: 1, duration: motion ? 0.8 : 0.2, ease: "power2.out" }
      );

      if (steps.length > 0) {
        tl.fromTo(
          steps,
          { y: motion ? 30 : 0, opacity: 0 },
          { y: 0, opacity: 1, duration: motion ? 0.6 : 0.2, stagger: motion ? 0.15 : 0, ease: "power2.out" },
          "-=0.4"
        );
      }

      tl.fromTo(
        orderRightRef.current,
        { x: motion ? 40 : 0, opacity: 0 },
        { x: 0, opacity: 1, duration: motion ? 0.8 : 0.2, ease: "power2.out" },
        "-=0.6"
      );
    }
  }, [loading]);

  // Success message scale-in animation when isSuccess changes
  useEffect(() => {
    if (isSuccess && successCardRef.current) {
      const motion = !prefersReducedMotion.current;
      gsap.fromTo(
        successCardRef.current,
        { scale: motion ? 0.85 : 1, opacity: 0 },
        { scale: 1, opacity: 1, duration: motion ? 0.6 : 0.2, ease: "back.out(1.4)" }
      );
    }
  }, [isSuccess]);

  // Toast notification helper
  const showToast = (message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, message });
  };

  // Toast animation effect
  useEffect(() => {
    if (toast.visible && toastRef.current) {
      const motion = !prefersReducedMotion.current;
      gsap.killTweensOf(toastRef.current);

      gsap.fromTo(
        toastRef.current,
        { y: motion ? 40 : 0, opacity: 0 },
        { y: 0, opacity: 1, duration: motion ? 0.4 : 0.1, ease: "power2.out" }
      );

      toastTimeoutRef.current = setTimeout(() => {
        gsap.to(toastRef.current, {
          y: motion ? 20 : 0,
          opacity: 0,
          duration: motion ? 0.3 : 0.1,
          ease: "power2.in",
          onComplete: () => setToast({ visible: false, message: '' })
        });
      }, 3000);
    }
  }, [toast]);

  // Add product to cart selection
  const handleAddProduct = (product) => {
    const prodId = product._id || product.id;
    const prodName = product.name || product.title;
    if (!selectedProducts.some((p) => (p._id || p.id) === prodId)) {
      setSelectedProducts((prev) => [...prev, product]);
      showToast(`Added ${prodName} to your bag`);
    } else {
      showToast(`${prodName} is already in your bag`);
    }
  };

  // Calculate cart estimated total
  const calculateTotal = () => {
    const sum = selectedProducts.reduce((acc, p) => {
      let val = 0;
      if (typeof p.price === 'number') {
        val = p.price;
      } else if (typeof p.price === 'string') {
        val = parseInt(p.price.replace(/[^\d]/g, ''), 10);
      }
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    return sum.toLocaleString() + " DH";
  };

  // Smooth scroll handler
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Form submission handler to submit order to API
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.city || !formData.address) {
      showToast("Please fill out all required fields.");
      return;
    }
    if (selectedProducts.length === 0) {
      showToast("Your bag is empty. Please select products to order.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = selectedProducts.map(p => ({
        product: p._id || p.id,
        product_name: p.name || p.title,
        quantity: 1,
        price: typeof p.price === 'number' ? p.price : parseInt(p.price.replace(/[^\d]/g, ''), 10),
        size: p.sizes ? (typeof p.sizes === 'string' ? p.sizes.split(',')[0] : p.sizes[0]) : 'M'
      }));

      const payload = {
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: '',
        shipping_address: formData.address,
        shipping_city: formData.city,
        notes: formData.notes,
        items: orderItems
      };

      const res = await api.post('/orders', payload);
      if (res.data.success) {
        setIsSuccess(true);
        setSubmittedData({
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
          items: selectedProducts.map(p => ({
            title: p.name || p.title,
            price: formatPrice(p.price)
          }))
        });

        // Reset form
        setFormData({
          name: '',
          phone: '',
          city: '',
          address: '',
          notes: ''
        });
        setSelectedProducts([]);
      } else {
        showToast(res.data.message || "Failed to place order.");
      }
    } catch (err) {
      console.error("Order submission failed:", err);
      showToast("Could not place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to split title and wrap the last word in red
  const renderTitle = (title) => {
    if (!title) return '';
    const words = title.split(' ');
    if (words.length <= 1) return title;
    const lastWord = words[words.length - 1];
    const mainText = words.slice(0, -1).join(' ') + ' ';
    return (
      <>
        {mainText}
        <span className="text-[#B5232B] font-semibold transition-colors duration-300">{lastWord}</span>
      </>
    );
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) {
      const backendUrl = api.defaults.baseURL.replace('/api', '');
      return `${backendUrl}${url}`;
    }
    return url;
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '';
    if (typeof price === 'number') return `${price} DH`;
    if (price.endsWith('DH')) return price;
    return `${price} DH`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#241B14] flex flex-col items-center justify-center space-y-4">
        <div className="font-display font-medium tracking-[0.25em] text-white uppercase text-xl animate-pulse">
          Tony Original
        </div>
        <div className="w-16 h-[2px] bg-[#C9A24B] transition-all duration-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EC] text-[#241B14] font-sans overflow-x-hidden selection:bg-[#C9A24B] selection:text-[#241B14]">

      {/* ─────────────────── FLOATING BRAND NAVBAR ─────────────────── */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${isScrolled
          ? 'bg-[#F8F4EC]/95 backdrop-blur-md text-[#241B14] border-b border-[#241B14]/10 shadow-sm py-4'
          : 'bg-transparent text-white py-6'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo / Brand Name */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-display font-medium tracking-[0.25em] text-lg md:text-xl uppercase select-none cursor-pointer hover:opacity-85 transition-opacity"
          >
            Tony <span className="font-light text-xs md:text-sm tracking-[0.15em] ml-1 opacity-80">— Maison Marocaine</span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-10 text-xs font-semibold tracking-[0.2em] uppercase">
            <button
              onClick={() => scrollToSection('products')}
              className="hover:text-[#C9A24B] transition-colors duration-300 cursor-pointer"
            >
              Collection
            </button>
            <button
              onClick={() => scrollToSection('products')}
              className="hover:text-[#C9A24B] transition-colors duration-300 cursor-pointer"
            >
              Our Products
            </button>
            <button
              onClick={() => scrollToSection('order')}
              className="hover:text-[#C9A24B] transition-colors duration-300 cursor-pointer"
            >
              Order Now
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => scrollToSection('order')}
              className="relative p-2 hover:text-[#C9A24B] transition-colors duration-300 cursor-pointer flex items-center gap-1.5"
              aria-label="Bag selection"
            >
              <ShoppingBag size={18} />
              {selectedProducts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#B5232B] text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {selectedProducts.length}
                </span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 focus:outline-none cursor-pointer"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#F8F4EC] text-[#241B14] border-b border-[#241B14]/15 shadow-xl py-8 px-6 animate-fade-in flex flex-col space-y-5 text-center font-semibold tracking-widest text-xs uppercase">
            <button
              onClick={() => scrollToSection('products')}
              className="py-2.5 border-b border-[#241B14]/5 hover:text-[#C9A24B]"
            >
              Collection
            </button>
            <button
              onClick={() => scrollToSection('products')}
              className="py-2.5 border-b border-[#241B14]/5 hover:text-[#C9A24B]"
            >
              Our Products
            </button>
            <button
              onClick={() => scrollToSection('order')}
              className="py-2.5 hover:text-[#C9A24B]"
            >
              Order Now
            </button>
          </div>
        )}
      </header>

      {/* ─────────────────── SECTION 1: HERO CAROUSEL ─────────────────── */}
      <section className="relative h-screen w-full overflow-hidden bg-[#241B14]">
        {banners.map((banner, idx) => (
          <div
            key={banner._id || idx}
            ref={(el) => (slidesRef.current[idx] = el)}
            className="absolute inset-0 w-full h-full flex flex-col-reverse lg:flex-row overflow-hidden"
          >
            {/* Left Column: Product Info Content */}
            <div className="w-full lg:w-1/2 h-[55vh] lg:h-full bg-[#241B14] flex items-center justify-start px-6 sm:px-12 md:px-16 lg:px-20 py-10 lg:py-16 relative border-t lg:border-t-0 lg:border-r border-white/5">
              <div className="max-w-2xl text-left select-none w-full">

                {/* Category Eyebrow */}
                <div
                  ref={(el) => (slideCategoryRef.current[idx] = el)}
                  className="mb-3 md:mb-4"
                >
                  <span className="text-[#C9A24B] uppercase tracking-[0.25em] text-[10px] md:text-xs font-bold inline-flex items-center gap-2">
                    <Sparkles size={12} className="animate-pulse" />
                    {banner.category || "Premium Streetwear"}
                  </span>
                </div>

                {/* Big Serif Headline */}
                <h1
                  ref={(el) => (slideTitleRef.current[idx] = el)}
                  className="font-display text-white text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl leading-[1.2] mb-4 md:mb-5 tracking-wide uppercase font-medium"
                >
                  {renderTitle(banner.title)}
                </h1>

                {/* Description */}
                <p
                  ref={(el) => (slideDescRef.current[idx] = el)}
                  className="font-sans text-[#F8F4EC]/75 text-xs sm:text-sm md:text-base mb-6 md:mb-8 leading-relaxed font-light max-w-xl"
                >
                  {banner.subtitle}
                </p>

                {/* Price tag (if any) */}
                {(banner.price || banner.originalPrice) && (
                  <div
                    ref={(el) => (slidePriceRef.current[idx] = el)}
                    className="flex items-center gap-3 mb-6 md:mb-8"
                  >
                    <span className="font-display text-[#C9A24B] text-xl sm:text-2xl md:text-3xl font-semibold tracking-wider">
                      {formatPrice(banner.price)}
                    </span>
                    {banner.originalPrice && (
                      <span className="font-sans text-white/40 text-base line-through tracking-wide">
                        {formatPrice(banner.originalPrice)}
                      </span>
                    )}
                  </div>
                )}

                {/* Action CTA */}
                <div ref={(el) => (slideCtaRef.current[idx] = el)}>
                  <button
                    onClick={() => {
                      if (banner.cta_link && banner.cta_link.startsWith('#')) {
                        scrollToSection(banner.cta_link.substring(1));
                      } else {
                        window.location.href = banner.cta_link || '#products';
                      }
                    }}
                    className="border-2 border-[#C9A24B] text-white hover:bg-[#C9A24B] hover:text-[#241B14] px-8 py-3.5 tracking-widest uppercase text-xs font-semibold transition-all duration-300 rounded-none w-fit shadow-lg cursor-pointer flex items-center gap-2 hover:translate-x-1.5"
                  >
                    <span>{banner.cta_text || 'View Product'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

              </div>
            </div>

            {/* Right Column: Product Image */}
            <div className="w-full lg:w-1/2 h-[45vh] lg:h-full relative overflow-hidden bg-[#241B14] flex items-center justify-center">
              <div
                ref={(el) => (slideBgsRef.current[idx] = el)}
                className="w-[38%] h-[50%] flex items-center justify-center"
              >
                <img
                  src={getImageUrl(banner.image_url)}
                  alt={banner.title}
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
              {/* Subtle left-edge vignette to blend with text column */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#241B14]/50 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        ))}

        {/* Carousel controls: Side Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => handleManualNav('prev')}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-16 md:h-16 flex items-center justify-center border border-white/20 bg-[#241B14]/30 hover:bg-[#C9A24B] hover:border-[#C9A24B] hover:text-[#241B14] text-white transition-all duration-300 rounded-full cursor-pointer group"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => handleManualNav('next')}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-16 md:h-16 flex items-center justify-center border border-white/20 bg-[#241B14]/30 hover:bg-[#C9A24B] hover:border-[#C9A24B] hover:text-[#241B14] text-white transition-all duration-300 rounded-full cursor-pointer group"
              aria-label="Next slide"
            >
              <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
        )}

        {/* Carousel indicators: Dot Buttons */}
        {banners.length > 1 && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-3">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (idx === currentIndex || isTransitioning.current) return;
                  if (autoplayRef.current) autoplayRef.current.kill();
                  setPrevIndex(currentIndex);
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${idx === currentIndex
                  ? 'w-8 bg-[#C9A24B] shadow-lg shadow-[#C9A24B]/30'
                  : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Bottom Decoration: Fixed Moroccan-inspired stripe bar */}
        <div className="absolute bottom-0 left-0 w-full h-[6px] flex z-20">
          <div className="flex-1 h-full bg-[#B5232B]" /> {/* Red */}
          <div className="flex-1 h-full bg-[#0B6E4F]" /> {/* Green */}
          <div className="flex-1 h-full bg-[#C9A24B]" /> {/* Gold */}
        </div>
      </section>

      {/* ─────────────────── SECTION 2: PRODUCTS GRID ─────────────────── */}
      <section
        id="products"
        ref={productsSectionRef}
        className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32 scroll-mt-20"
      >
        {/* Section Heading & Subtitle */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <h2
            ref={productsTitleRef}
            className="font-display text-4xl md:text-5xl font-medium tracking-wide uppercase text-[#241B14] mb-4"
          >
            Our Products
          </h2>
          <p
            ref={productsSubRef}
            className="font-sans text-sm md:text-base text-[#241B14]/70 leading-relaxed font-light"
          >
            {settings.about_text || "Curated Moroccan luxury. Each piece is designed meticulously and handcrafted individually by master artisans using premium sustainable materials."}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {products.map((product, idx) => (
            <div
              key={product._id || idx}
              ref={(el) => (productCardsRef.current[idx] = el)}
              className="group bg-[#F8F4EC] border border-[#241B14]/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between h-full"
            >
              <div>
                {/* Product image with dynamic scale */}
                <div className="relative aspect-[4/5] overflow-hidden bg-[#241B14]/5">
                  <img
                    src={getImageUrl(product.image_url)}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Category Badge overlay */}
                  <span className="absolute top-4 left-4 text-[9px] tracking-wider uppercase font-semibold px-3 py-1 rounded-full bg-[#241B14] text-[#F8F4EC] shadow-sm">
                    {product.category_name || "Premium Streetwear"}
                  </span>
                </div>

                {/* Product details */}
                <div className="p-6">
                  <h3 className="font-display font-medium text-lg md:text-xl tracking-wide text-[#241B14] mb-1.5 group-hover:text-[#B5232B] transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="font-sans text-[11px] tracking-widest text-[#241B14]/50 uppercase mb-3 font-semibold">
                    {product.category_name || "Premium Streetwear"}
                  </p>
                  <p className="font-sans text-sm text-[#241B14]/70 line-clamp-2 leading-relaxed font-light">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Price & Add to Cart Action */}
              <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-[#241B14]/5">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-[#B5232B] text-lg tracking-wide">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  {product.original_price && (
                    <span className="font-sans text-[#241B14]/40 text-xs line-through tracking-wide">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleAddProduct(product)}
                  className="flex items-center space-x-1 border border-[#241B14]/20 text-[#241B14] hover:bg-[#241B14] hover:text-[#F8F4EC] hover:border-[#241B14] px-4 py-2.5 text-[10px] tracking-widest uppercase font-bold rounded-lg transition-all duration-300 cursor-pointer"
                >
                  <Plus size={12} />
                  <span>Add to Bag</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────── SECTION 2.5: TESTIMONIALS ─────────────────── */}
      {testimonials && testimonials.length > 0 && (
        <section className="bg-[#2d231b]/5 border-t border-b border-[#241B14]/5 py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
              <h2 className="font-display text-4xl md:text-5xl font-medium tracking-wide uppercase text-[#241B14] mb-4">
                What They Say
              </h2>
              <p className="font-sans text-sm md:text-base text-[#241B14]/70 leading-relaxed font-light">
                Reviews from our community and clients across Morocco.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <div key={t._id || idx} className="bg-white border border-[#241B14]/5 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex gap-1 mb-4 text-[#C9A24B]">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <span key={i} className="text-lg">★</span>
                    ))}
                  </div>
                  <p className="font-sans text-sm text-[#241B14]/85 leading-relaxed mb-6 italic">
                    "{t.content}"
                  </p>
                  <p className="font-sans text-xs tracking-widest text-[#241B14]/50 uppercase font-bold">
                    — {t.author_name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────── SECTION 3: ORDER FORM & CONCIERGE ─────────────────── */}
      <section
        id="order"
        ref={orderSectionRef}
        className="relative bg-[#241B14] text-white overflow-hidden scroll-mt-20"
      >
        {/* Top Decorative Bar: Red → Green → Gold */}
        <div className="w-full h-[6px] flex">
          <div className="flex-1 h-full bg-[#B5232B]" />
          <div className="flex-1 h-full bg-[#0B6E4F]" />
          <div className="flex-1 h-full bg-[#C9A24B]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* LEFT COLUMN: Steps and Content */}
          <div ref={orderLeftRef} className="space-y-12">
            <div className="space-y-4">
              <h2 className="font-display text-4xl md:text-5xl font-medium tracking-wide uppercase text-[#F8F4EC]">
                Order With Confidence
              </h2>
              <p className="font-sans text-[#F8F4EC]/70 text-sm md:text-base leading-relaxed max-w-xl font-light">
                Discover a simplified, secure shopping experience designed for boutique Moroccan luxury. We facilitate high-end garments and customized adjustments, ensuring perfect fits and satisfaction before final payment.
              </p>
            </div>

            {/* Three-step Process Cards */}
            <div className="grid grid-cols-1 gap-6 max-w-xl">
              {[
                {
                  num: "01",
                  title: "Choose your products",
                  desc: "Select items from our collection above. Click 'Add to Bag' to specify the models you would like to purchase, and they will populate in the selection cart within the form."
                },
                {
                  num: "02",
                  title: "We confirm by phone",
                  desc: `Our private brand concierge calls you within 24 hours of submission at ${settings.contact_phone || '+212 600 000 000'} to verify details, recommend specific sizing, and schedule delivery.`
                },
                {
                  num: "03",
                  title: "Cash on delivery",
                  desc: "Receive your custom delivery anywhere in Morocco. Verify the quality, sizing, and details of your clothing, then complete your payment securely upon delivery."
                }
              ].map((step, idx) => (
                <div
                  key={idx}
                  ref={(el) => (orderStepsRef.current[idx] = el)}
                  className="bg-[#2d231b]/60 border border-[#F8F4EC]/10 rounded-xl p-6 flex gap-5 hover:bg-[#2d231b]/80 hover:border-[#C9A24B]/30 transition-all duration-300"
                >
                  <div className="font-display font-medium text-2xl md:text-3xl text-[#C9A24B] leading-none select-none">
                    {step.num}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display font-medium text-base md:text-lg text-[#F8F4EC] tracking-wide">
                      {step.title}
                    </h4>
                    <p className="font-sans text-xs md:text-sm text-[#F8F4EC]/65 leading-relaxed font-light">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Controlled Form or Success state */}
          <div ref={orderRightRef} className="bg-[#2d231b]/30 border border-[#F8F4EC]/10 rounded-2xl p-8 md:p-12 shadow-2xl backdrop-blur-sm">

            {!isSuccess ? (
              // Order placement form
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-[10px] font-bold tracking-widest text-[#C9A24B] uppercase mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Amina Alaoui"
                    className="w-full bg-[#2d231b] border border-[#F8F4EC]/15 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:ring-1 focus:ring-[#C9A24B] focus:border-[#C9A24B] focus:outline-none transition-all duration-300 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-[10px] font-bold tracking-widest text-[#C9A24B] uppercase mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. 0600-000000"
                      className="w-full bg-[#2d231b] border border-[#F8F4EC]/15 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:ring-1 focus:ring-[#C9A24B] focus:border-[#C9A24B] focus:outline-none transition-all duration-300 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-[10px] font-bold tracking-widest text-[#C9A24B] uppercase mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="e.g. Casablanca"
                      className="w-full bg-[#2d231b] border border-[#F8F4EC]/15 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:ring-1 focus:ring-[#C9A24B] focus:border-[#C9A24B] focus:outline-none transition-all duration-300 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-[10px] font-bold tracking-widest text-[#C9A24B] uppercase mb-2">
                    Shipping Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="e.g. 42 Boulevard d'Anfa, Appt 5"
                    className="w-full bg-[#2d231b] border border-[#F8F4EC]/15 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:ring-1 focus:ring-[#C9A24B] focus:border-[#C9A24B] focus:outline-none transition-all duration-300 text-sm"
                  />
                </div>

                {/* Dynamic Selected Items list */}
                {selectedProducts.length > 0 && (
                  <div className="border border-[#F8F4EC]/15 rounded-lg p-4 bg-[#241B14]/40 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[#F8F4EC]/10">
                      <h4 className="text-[10px] uppercase tracking-widest text-[#C9A24B] font-bold">
                        Your Selected Items ({selectedProducts.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() => setSelectedProducts([])}
                        className="text-[9px] uppercase tracking-wider text-[#B5232B] font-bold hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="divide-y divide-[#F8F4EC]/10 max-h-48 overflow-y-auto pr-1">
                      {selectedProducts.map((product) => (
                        <div key={product._id || product.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-3">
                            <img
                              src={getImageUrl(product.image_url)}
                              alt={product.name || product.title}
                              className="w-9 h-9 rounded object-cover border border-[#F8F4EC]/10"
                            />
                            <div>
                              <p className="text-white font-medium text-xs leading-tight">{product.name || product.title}</p>
                              <p className="text-[9px] text-[#F8F4EC]/40 mt-0.5 uppercase tracking-wide">{product.category_name || product.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-display font-medium text-[#C9A24B] text-xs">{formatPrice(product.price)}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedProducts(prev => prev.filter(p => (p._id || p.id) !== (product._id || product.id)))}
                              className="text-white/40 hover:text-[#B5232B] transition-colors duration-200"
                              aria-label={`Remove ${product.name || product.title}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-[10px] tracking-widest uppercase font-semibold text-[#C9A24B] pt-2 border-t border-[#F8F4EC]/10 mt-1">
                      <span>Total Price:</span>
                      <span className="font-display text-sm font-bold text-[#F8F4EC]">{calculateTotal()}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="notes" className="block text-[10px] font-bold tracking-widest text-[#C9A24B] uppercase mb-2">
                    Order Notes / Sizing Customizations
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="e.g. Specific sizing adjustment, custom color requirements, or delivery schedule preferences."
                    className="w-full bg-[#2d231b] border border-[#F8F4EC]/15 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:ring-1 focus:ring-[#C9A24B] focus:border-[#C9A24B] focus:outline-none transition-all duration-300 text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#C9A24B] text-[#241B14] hover:bg-[#F8F4EC] hover:text-[#241B14] hover:shadow-xl font-sans tracking-widest uppercase text-xs font-bold py-4.5 rounded-lg transition-all duration-300 focus:ring-2 focus:ring-[#C9A24B] focus:ring-offset-2 focus:ring-offset-[#241B14] focus:outline-none cursor-pointer flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <span className="inline-block animate-spin border-2 border-[#241B14] border-t-transparent rounded-full w-4.5 h-4.5"></span>
                  ) : (
                    <>
                      <ShoppingBag size={14} />
                      <span>Confirm Order (Cash on Delivery)</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              // Order Success Confirmation Container
              <div
                ref={successCardRef}
                className="border border-[#0B6E4F]/30 bg-[#0B6E4F]/10 rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-[#0B6E4F]/20 border border-[#0B6E4F]/40 flex items-center justify-center shadow-lg shadow-[#0B6E4F]/10">
                  <Check className="text-[#0B6E4F] w-8 h-8 stroke-[3]" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl md:text-3xl font-medium tracking-wide uppercase text-white">
                    Order Placed Successfully
                  </h3>
                  <p className="font-sans text-[#C9A24B] text-[10px] tracking-widest uppercase font-bold">
                    Merci pour votre confiance
                  </p>
                </div>

                <div className="font-sans text-[#F8F4EC]/75 text-sm leading-relaxed max-w-sm space-y-3 font-light">
                  <p>
                    Thank you, <span className="text-white font-medium">{submittedData?.name}</span>. Your request has been recorded.
                  </p>
                  <p>
                    Our private concierge will contact you shortly at <span className="text-white font-medium">{submittedData?.phone}</span> to confirm your size and organize shipment to <span className="text-white font-medium">{submittedData?.city}</span>.
                  </p>
                </div>

                {submittedData?.items && submittedData.items.length > 0 && (
                  <div className="w-full border-t border-[#F8F4EC]/10 pt-4 max-w-xs">
                    <p className="text-[9px] uppercase tracking-widest text-[#C9A24B] font-bold mb-2">Items Ordered</p>
                    <ul className="text-[11px] text-[#F8F4EC]/60 space-y-1">
                      {submittedData.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{item.title}</span>
                          <span>{item.price}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setSubmittedData(null);
                  }}
                  className="border border-[#C9A24B] text-[#C9A24B] hover:bg-[#C9A24B] hover:text-[#241B14] px-6 py-2.5 text-[10px] tracking-widest uppercase font-bold transition-all duration-300 rounded-lg cursor-pointer"
                >
                  Place Another Order
                </button>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ─────────────────── SECTION 4: FOOTER ─────────────────── */}
      <footer className="bg-[#F8F4EC] text-[#241B14]/60 border-t border-[#241B14]/5 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center justify-center space-y-6">
          <p className="font-display font-medium tracking-[0.25em] text-sm text-[#241B14] uppercase">
            Tony — Maison Marocaine
          </p>
          <div className="flex space-x-8 text-xs font-semibold tracking-wider uppercase text-[#241B14]/50">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#C9A24B] transition-colors">Home</button>
            <button onClick={() => scrollToSection('products')} className="hover:text-[#C9A24B] transition-colors">Products</button>
            <button onClick={() => scrollToSection('order')} className="hover:text-[#C9A24B] transition-colors">Order Now</button>
          </div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-[#241B14]/40 pt-4 text-center">
            {settings.footer_text || "© 2026 Tony — Maison Marocaine. All Rights Reserved."}
          </p>
        </div>
      </footer>

      {/* ─────────────────── TOAST NOTIFICATION CONTAINER ─────────────────── */}
      {toast.visible && (
        <div
          ref={toastRef}
          className="fixed bottom-8 right-8 z-50 bg-[#241B14] text-white border border-[#C9A24B]/30 rounded-xl py-4 px-6 shadow-2xl flex items-center gap-3"
          role="alert"
        >
          <div className="w-5 h-5 rounded-full bg-[#0B6E4F]/20 border border-[#0B6E4F]/40 flex items-center justify-center">
            <Check className="text-[#0B6E4F] w-3 h-3 stroke-[3]" />
          </div>
          <span className="font-sans text-xs font-medium tracking-wide text-[#F8F4EC]">{toast.message}</span>
        </div>
      )}

    </div>
  );
}
