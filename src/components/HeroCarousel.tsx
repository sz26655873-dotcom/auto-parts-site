/**
 * HeroCarousel — 5-slide content-rich hero carousel.
 *
 * Converted from a Vue 3 SFC to React + TypeScript.
 *
 * Slides:
 *   1. Product showcase (BMW X5 image + stats)
 *   2. Team / Warehouse (warehouse image + stats)
 *   3. Car brand compatibility (12 logo grid)
 *   4. Parts brand suppliers (12 text-card grid)
 *   5. Global reach (animated SVG world map with shipping routes)
 *
 * Features:
 *   - Autoplay with configurable interval
 *   - Pause on hover
 *   - Prev/next navigation arrows
 *   - Clickable indicators with accent colors
 *   - SVG SMIL animations for route drawing, particle motion, and pulse effects
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import './HeroCarousel.css';

/* ----------------------------------------------------------------
 * Types
 * ---------------------------------------------------------------- */

interface HeroCarouselProps {
  /** Enable automatic slide rotation. Default: true */
  autoplay?: boolean;
  /** Interval between auto-rotations in milliseconds. Default: 6000 */
  interval?: number;
}

interface CarBrand {
  name: string;
  img: string;
}

interface PartsBrand {
  name: string;
  category: string;
  color: string;
}

interface ArcData {
  d: string;
  len: string;
  dur: number;
  delay: number;
  color: string;
  innerColor: string;
  particleDur: number;
  particleBegin: number;
}

interface DestinationData {
  x: number;
  y: number;
  color: string;
  popDelay: number;
  pulseDelay: number;
}

/** Allows CSS custom properties (--var) in React inline styles. */
type CSSWithVars = React.CSSProperties & Record<`--${string}`, string | number>;

/* ----------------------------------------------------------------
 * Static Data
 * ---------------------------------------------------------------- */

const TOTAL_SLIDES = 5;

const PRODUCT_IMG = '/images/hero/bmw-x5.jpg';
const WAREHOUSE_IMG = '/images/hero/warehouse.jpg';
const WORLD_MAP_IMG = '/images/hero/world-map.png';

const carBrands: CarBrand[] = [
  { name: 'BMW',           img: '/images/hero/logos/bmw.png' },
  { name: 'Mercedes-Benz', img: '/images/hero/logos/mercedes-benz.png' },
  { name: 'Audi',          img: '/images/hero/logos/audi.png' },
  { name: 'Porsche',       img: '/images/hero/logos/porsche.png' },
  { name: 'Ferrari',       img: '/images/hero/logos/ferrari.png' },
  { name: 'Lamborghini',   img: '/images/hero/logos/lamborghini.png' },
  { name: 'Rolls-Royce',   img: '/images/hero/logos/rolls-royce.png' },
  { name: 'Bentley',       img: '/images/hero/logos/bentley.png' },
  { name: 'Lexus',         img: '/images/hero/logos/lexus.png' },
  { name: 'Land Rover',    img: '/images/hero/logos/landrover.svg' },
  { name: 'Volkswagen',    img: '/images/hero/logos/volkswagen.png' },
  { name: 'Volvo',         img: '/images/hero/logos/volvo.png' },
  { name: 'Lincoln',       img: '/images/hero/logos/lincoln.png' },
  { name: 'Xiaomi',        img: '/images/hero/logos/xiaomi-logo.jpeg' },
];

const partsBrands: PartsBrand[] = [
  { name: 'BOSCH',       category: 'Engine • Electrical • Brakes',    color: '#ff3344' },
  { name: 'DENSO',       category: 'Electrical • HVAC • Sensors',     color: '#3b9eff' },
  { name: 'CONTINENTAL', category: 'Tires • Electronics • ADAS',      color: '#ffa726' },
  { name: 'ZF',          category: 'Transmission • Chassis',          color: '#42a5f5' },
  { name: 'MAHLE',       category: 'Engine • Filtration • Thermal',   color: '#ff9800' },
  { name: 'VALEO',       category: 'Clutch • Wipers • Lighting',      color: '#5c9eff' },
  { name: 'NGK',         category: 'Spark Plugs • O2 Sensors',        color: '#ff5252' },
  { name: 'BREMBO',      category: 'Brake Systems',                   color: '#ff4444' },
  { name: 'AISIN',       category: 'Transmission • Body • Engine',    color: '#ff3344' },
  { name: 'MANN',        category: 'Oil • Air • Fuel Filters',        color: '#4caf50' },
  { name: 'SCHAEFFLER',  category: 'Bearings • Engine Components',    color: '#66bb6a' },
  { name: 'DELPHI',      category: 'Fuel • Electrical • Electronics', color: '#4a90d9' },
];

const arcs: ArcData[] = [
  { d: 'M 72 42 Q 72.5 34.9 66 32', len: '15.2', dur: 3.0, delay: 0.0, color: '#f97316', innerColor: '#fdba74', particleDur: 2.5, particleBegin: 2.8 },
  { d: 'M 72 42 Q 65.6 40.5 62 46', len: '14.0', dur: 3.2, delay: 0.2, color: '#f97316', innerColor: '#fdba74', particleDur: 2.6, particleBegin: 3.0 },
  { d: 'M 72 42 Q 62.9 40.1 58 48', len: '19.8', dur: 3.5, delay: 0.5, color: '#f97316', innerColor: '#fdba74', particleDur: 2.6, particleBegin: 3.3 },
  { d: 'M 72 42 Q 65.3 38.8 60 44', len: '15.8', dur: 3.8, delay: 0.8, color: '#fb923c', innerColor: '#fb923c', particleDur: 2.7, particleBegin: 3.5 },
  { d: 'M 72 42 Q 63.4 33.0 52 38', len: '26.5', dur: 4.0, delay: 1.0, color: '#f97316', innerColor: '#fdba74', particleDur: 2.8, particleBegin: 3.8 },
  { d: 'M 72 42 Q 64.2 27.6 48 30', len: '34.9', dur: 4.2, delay: 1.2, color: '#fb923c', innerColor: '#fb923c', particleDur: 2.9, particleBegin: 4.0 },
  { d: 'M 72 42 Q 63.0 26.1 45 29', len: '39.0', dur: 4.5, delay: 1.5, color: '#fb923c', innerColor: '#fb923c', particleDur: 3.0, particleBegin: 4.3 },
  { d: 'M 72 42 Q 60.2 39.7 54 50', len: '25.6', dur: 4.8, delay: 1.8, color: '#fb923c', innerColor: '#fb923c', particleDur: 3.0, particleBegin: 4.5 },
  { d: 'M 72 42 Q 57.9 44.0 55 58', len: '30.3', dur: 5.0, delay: 2.0, color: '#fb923c', innerColor: '#fb923c', particleDur: 3.1, particleBegin: 4.8 },
  { d: 'M 72 42 Q 55.6 41.0 49 56', len: '35.0', dur: 5.2, delay: 2.2, color: '#fb923c', innerColor: '#fb923c', particleDur: 3.2, particleBegin: 5.0 },
  { d: 'M 72 42 Q 52.7 49.4 53 70', len: '44.0', dur: 5.5, delay: 2.5, color: '#fb923c', innerColor: '#fb923c', particleDur: 3.2, particleBegin: 5.3 },
  { d: 'M 72 42 Q 47.5 19.6 18 35', len: '70.8', dur: 5.8, delay: 2.8, color: '#fb923c', innerColor: '#fb923c', particleDur: 3.3, particleBegin: 5.5 },
  { d: 'M 72 42 Q 45.2 27.0 22 47', len: '65.3', dur: 6.0, delay: 3.0, color: '#fb923c', innerColor: '#fb923c', particleDur: 3.4, particleBegin: 5.8 },
  { d: 'M 72 42 Q 43.6 37.8 30 63', len: '61.0', dur: 6.2, delay: 3.2, color: '#fb923c', innerColor: '#fb923c', particleDur: 3.5, particleBegin: 6.0 },
  { d: 'M 72 42 Q 70.0 46.4 77 55', len: '18.1', dur: 6.5, delay: 3.5, color: '#fb923c', innerColor: '#fb923c', particleDur: 3.5, particleBegin: 6.3 },
  { d: 'M 72 42 Q 76.3 30.2 68 24', len: '24.0', dur: 6.8, delay: 3.8, color: '#fb923c', innerColor: '#fb923c', particleDur: 3.6, particleBegin: 6.5 },
  { d: 'M 72 42 Q 65.7 43.5 65 50', len: '13.8', dur: 7.0, delay: 4.0, color: '#fb923c', innerColor: '#fb923c', particleDur: 3.7, particleBegin: 6.8 },
  { d: 'M 72 42 Q 76 35 80 36',     len: '10.5', dur: 7.2, delay: 4.2, color: '#fb923c', innerColor: '#fb923c', particleDur: 2.5, particleBegin: 7.0 },
];

const destinations: DestinationData[] = [
  { x: 66, y: 32, color: '#fbbf24', popDelay: 2.5, pulseDelay: 3.0 },
  { x: 62, y: 46, color: '#fbbf24', popDelay: 2.8, pulseDelay: 3.2 },
  { x: 58, y: 48, color: '#fbbf24', popDelay: 3.0, pulseDelay: 3.5 },
  { x: 60, y: 44, color: '#fb923c', popDelay: 3.2, pulseDelay: 3.8 },
  { x: 52, y: 38, color: '#fbbf24', popDelay: 3.5, pulseDelay: 4.0 },
  { x: 48, y: 30, color: '#fb923c', popDelay: 3.8, pulseDelay: 4.2 },
  { x: 45, y: 29, color: '#fb923c', popDelay: 4.0, pulseDelay: 4.5 },
  { x: 54, y: 50, color: '#fb923c', popDelay: 4.2, pulseDelay: 4.8 },
  { x: 55, y: 58, color: '#fb923c', popDelay: 4.5, pulseDelay: 5.0 },
  { x: 49, y: 56, color: '#fb923c', popDelay: 4.8, pulseDelay: 5.2 },
  { x: 53, y: 70, color: '#fb923c', popDelay: 5.0, pulseDelay: 5.5 },
  { x: 18, y: 35, color: '#fb923c', popDelay: 5.2, pulseDelay: 5.8 },
  { x: 22, y: 47, color: '#fb923c', popDelay: 5.5, pulseDelay: 6.0 },
  { x: 30, y: 63, color: '#fb923c', popDelay: 5.8, pulseDelay: 6.2 },
  { x: 77, y: 55, color: '#fb923c', popDelay: 6.0, pulseDelay: 6.5 },
  { x: 68, y: 24, color: '#fb923c', popDelay: 6.2, pulseDelay: 6.8 },
  { x: 65, y: 50, color: '#fb923c', popDelay: 6.5, pulseDelay: 7.0 },
  { x: 80, y: 36, color: '#fb923c', popDelay: 6.8, pulseDelay: 7.2 },
];

const slideAccentColors: string[] = ['#f97316', '#10b981', '#f97316', '#38bdf8', '#10b981'];

/* ----------------------------------------------------------------
 * Small presentational helpers
 * ---------------------------------------------------------------- */

/** Right-pointing arrow icon used inside CTA buttons. */
function CtaArrowIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ----------------------------------------------------------------
 * Main Component
 * ---------------------------------------------------------------- */

/**
 * Renders a 5-slide hero carousel with autoplay, hover-pause,
 * navigation arrows, and clickable indicators.
 */
function HeroCarousel({ autoplay = true, interval = 6000 }: HeroCarouselProps): JSX.Element {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slidesWrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  /* ---- Dynamic Height ---- */

  /** Measures the active slide's content and adjusts wrapper height so
   *  content is never clipped — especially critical on mobile where
   *  stacked layouts need more vertical space than a fixed 70vh. */
  useEffect(() => {
    const adjust = () => {
      const wrapper = slidesWrapperRef.current;
      if (!wrapper) return;
      const active = wrapper.querySelector('.hc-slide--active') as HTMLElement | null;
      if (!active) return;

      // Temporarily remove height/position constraints to measure real content
      const sPos = active.style.position;
      const sH   = active.style.height;
      const sOv  = active.style.overflowY;
      active.style.position   = 'relative';
      active.style.height     = 'auto';
      active.style.overflowY  = 'visible';

      const measured = active.offsetHeight;

      // Restore original styles
      active.style.position  = sPos;
      active.style.height    = sH;
      active.style.overflowY = sOv;

      // Compute minimum: measured content vs viewport-based fallback
      const vh = window.innerHeight;
      const minH = window.innerWidth <= 768
        ? Math.max(measured + 16, vh * 0.85)
        : Math.max(measured + 16, vh * 0.70);

      wrapper.style.minHeight = `${minH}px`;
    };

    // Delay slightly so the browser has finished layout after slide switch
    const id = setTimeout(() => requestAnimationFrame(adjust), 80);
    return () => clearTimeout(id);
  }, [current]);

  /* ---- Autoplay ---- */

  /**
   * Sets up an interval that advances the slide every `interval` ms.
   * The effect re-runs whenever `current` changes so each slide gets
   * a full interval duration (including after manual navigation).
   * Cleans up on unmount or when deps change.
   */
  useEffect(() => {
    if (!autoplay || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TOTAL_SLIDES);
    }, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoplay, isPaused, interval, current]);

  /* ---- Navigation ---- */

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % TOTAL_SLIDES);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + TOTAL_SLIDES) % TOTAL_SLIDES);
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  /* ---- Pause / Resume ---- */

  const pauseAuto = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeAuto = useCallback(() => {
    setIsPaused(false);
  }, []);

  /* ---- Indicator style ---- */

  /**
   * Returns inline style for an indicator dot.
   * Active indicators use the current slide's accent color.
   */
  const activeIndicatorStyle = (index: number): React.CSSProperties => {
    if (current === index) {
      return { backgroundColor: slideAccentColors[index] };
    }
    return {};
  };

  /* ---- Render ---- */

  return (
    <div className="hc-carousel">
      <div
        ref={slidesWrapperRef}
        className="hc-slides-wrapper"
        onMouseEnter={pauseAuto}
        onMouseLeave={resumeAuto}
      >
        {/* ================================================================
            SLIDE 1 — Product Showcase
            ================================================================ */}
        <div
          className={`hc-slide hc-slide-1 ${current === 0 ? 'hc-slide--active' : ''}`}
        >
          <div className="hc-hero-inner">
            <div className="hc-hero-text">
              <div className="hc-tag">
                <span className="hc-tag-dot" />
                <span className="hc-tag-text">{t('hero.slide1.tag')}</span>
              </div>
              <h2 className="hc-hero-title" dangerouslySetInnerHTML={{ __html: t('hero.slide1.title') }} />
              <p className="hc-hero-desc">
                {t('hero.slide1.desc')}
              </p>
              <button
                className="hc-cta-btn"
                onClick={() => navigate('/products')}
              >
                {t('hero.slide1.cta')}
                <CtaArrowIcon />
              </button>
              <div className="hc-stats-row">
                <div>
                  <div className="hc-stat-num">500K+</div>
                  <div className="hc-stat-label">{t('hero.slide1.stat1')}</div>
                </div>
                <div>
                  <div className="hc-stat-num">60+</div>
                  <div className="hc-stat-label">{t('hero.slide1.stat2')}</div>
                </div>
                <div>
                  <div className="hc-stat-num">15 yrs</div>
                  <div className="hc-stat-label">{t('hero.slide1.stat3')}</div>
                </div>
              </div>
            </div>
            <div className="hc-hero-img-wrap">
              <div className="hc-hero-img-container">
                <img className="hc-hero-img" src={PRODUCT_IMG} alt="BMW X5 Auto Parts" />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================
            SLIDE 2 — Team / Warehouse
            ================================================================ */}
        <div
          className={`hc-slide hc-slide-2 ${current === 1 ? 'hc-slide--active' : ''}`}
        >
          <div className="hc-hero-inner">
            <div className="hc-hero-text">
              <div className="hc-tag">
                <span className="hc-tag-dot" />
                <span className="hc-tag-text">{t('hero.slide2.tag')}</span>
              </div>
              <h2 className="hc-hero-title" dangerouslySetInnerHTML={{ __html: t('hero.slide2.title') }} />
              <p className="hc-hero-desc">
                {t('hero.slide2.desc')}
              </p>
              <button
                className="hc-cta-btn"
                onClick={() => navigate('/contact')}
              >
                {t('hero.slide2.cta')}
                <CtaArrowIcon />
              </button>
              <div className="hc-stats-row">
                <div>
                  <div className="hc-stat-num">25+</div>
                  <div className="hc-stat-label">{t('hero.slide2.stat1')}</div>
                </div>
                <div>
                  <div className="hc-stat-num">24h</div>
                  <div className="hc-stat-label">{t('hero.slide2.stat2')}</div>
                </div>
                <div>
                  <div className="hc-stat-num">100%</div>
                  <div className="hc-stat-label">{t('hero.slide2.stat3')}</div>
                </div>
              </div>
            </div>
            <div className="hc-hero-img-wrap">
              <div className="hc-hero-img-container">
                <img className="hc-hero-img" src={WAREHOUSE_IMG} alt="Altai Parts Warehouse" />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================
            SLIDE 3 — Car Brand Compatibility
            ================================================================ */}
        <div
          className={`hc-slide hc-slide-3 ${current === 2 ? 'hc-slide--active' : ''}`}
        >
          <div className="hc-hero-inner">
            <div className="hc-tag">
              <span className="hc-tag-dot" />
              <span className="hc-tag-text">{t('hero.slide3.tag')}</span>
            </div>
            <h2 className="hc-hero-title">{t('hero.slide3.title')}</h2>
            <p className="hc-hero-desc">
              {t('hero.slide3.desc')}
            </p>
            <div className="hc-logo-grid">
              {carBrands.map((brand) => (
                <div className="hc-logo-card" key={brand.name}>
                  <img className="hc-logo-img" src={brand.img} alt={brand.name} />
                  <div className="hc-brand-name">{brand.name}</div>
                </div>
              ))}
            </div>
            <div className="hc-brand-stats">
              <div>
                <div className="hc-stat-num">20+</div>
                <div className="hc-stat-label">{t('hero.slide3.stat1')}</div>
              </div>
              <div>
                <div className="hc-stat-num">10K+</div>
                <div className="hc-stat-label">{t('hero.slide3.stat2')}</div>
              </div>
              <div>
                <div className="hc-stat-num">OEM</div>
                <div className="hc-stat-label">{t('hero.slide3.stat3')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================
            SLIDE 4 — Parts Brand Suppliers
            ================================================================ */}
        <div
          className={`hc-slide hc-slide-4 ${current === 3 ? 'hc-slide--active' : ''}`}
        >
          <div className="hc-hero-inner">
            <div className="hc-tag">
              <span className="hc-tag-dot" />
              <span className="hc-tag-text">{t('hero.slide4.tag')}</span>
            </div>
            <h2 className="hc-hero-title">
              {t('hero.slide4.titleLine1')}<br />
              <span style={{ color: '#38bdf8' }}>{t('hero.slide4.titleLine2')}</span>
            </h2>
            <p className="hc-hero-desc">
              {t('hero.slide4.desc')}
            </p>
            <div className="hc-parts-grid">
              {partsBrands.map((brand) => (
                <div
                  className="hc-parts-card"
                  key={brand.name}
                  style={{ '--bc': brand.color } as CSSWithVars}
                >
                  <div className="hc-parts-logo">{brand.name}</div>
                  <div className="hc-parts-cat">{brand.category}</div>
                </div>
              ))}
            </div>
            <div className="hc-brand-stats">
              <div>
                <div className="hc-stat-num">100%</div>
                <div className="hc-stat-label">{t('hero.slide4.stat1')}</div>
              </div>
              <div>
                <div className="hc-stat-num">50+</div>
                <div className="hc-stat-label">{t('hero.slide4.stat2')}</div>
              </div>
              <div>
                <div className="hc-stat-num">2Yr</div>
                <div className="hc-stat-label">{t('hero.slide4.stat3')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================
            SLIDE 5 — Global Reach (Animated World Map)
            ================================================================ */}
        <div
          className={`hc-slide hc-slide-5 ${current === 4 ? 'hc-slide--active' : ''}`}
        >
          <div className="hc-hero-inner">
            <div className="hc-text-col">
              <div className="hc-tag">
                <span className="hc-tag-dot" />
                <span className="hc-tag-text">{t('hero.slide5.tag')}</span>
              </div>
              <h2 className="hc-hero-title" style={{ textAlign: 'left' }}>
                {t('hero.slide5.titleLine1')}<br />
                <span style={{ color: '#10b981' }}>{t('hero.slide5.titleLine2')}</span>
              </h2>
              <p
                className="hc-hero-desc"
                style={{ textAlign: 'left', marginBottom: '20px' }}
              >
                {t('hero.slide5.desc')}
              </p>
              <button
                className="hc-cta-btn hc-cta-btn--green"
                onClick={() => navigate('/contact')}
              >
                {t('hero.slide5.cta')}
              </button>
              <div className="hc-stats-row" style={{ marginTop: '20px' }}>
                <div>
                  <div className="hc-stat-num">60+</div>
                  <div className="hc-stat-label">{t('hero.slide5.stat1')}</div>
                </div>
                <div>
                  <div className="hc-stat-num">2,000+</div>
                  <div className="hc-stat-label">{t('hero.slide5.stat2')}</div>
                </div>
                <div>
                  <div className="hc-stat-num">15 yrs</div>
                  <div className="hc-stat-label">{t('hero.slide5.stat3')}</div>
                </div>
              </div>
            </div>
            <div className="hc-map-col">
              <div className="hc-world-map-wrap">
                <img
                  src={WORLD_MAP_IMG}
                  alt="Global Shipping Network"
                  className="hc-world-map-img"
                />
                <svg
                  className="hc-route-overlay"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <filter id="arcGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="1.2" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="arcGlowStrong" x="-80%" y="-80%" width="260%" height="260%">
                      <feGaussianBlur stdDeviation="2.5" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <radialGradient id="hqGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
                      <stop offset="40%" stopColor="#f97316" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Hidden motion paths (referenced by <mpath>) */}
                  {arcs.map((arc, i) => (
                    <path
                      key={`p${i}`}
                      id={`p_arc${i}`}
                      d={arc.d}
                      fill="none"
                      stroke="none"
                    />
                  ))}

                  {/* Glow stroke paths with drawArc animation */}
                  {arcs.map((arc, i) => (
                    <path
                      key={`glow${i}`}
                      d={arc.d}
                      fill="none"
                      stroke={arc.color}
                      strokeWidth="2.5"
                      opacity="0.25"
                      filter="url(#arcGlow)"
                      strokeLinecap="round"
                      strokeDasharray={arc.len}
                      strokeDashoffset={arc.len}
                      style={{
                        '--dash-len': arc.len,
                        animation: `drawArc ${arc.dur}s ease-out ${arc.delay}s forwards`,
                      } as CSSWithVars}
                    />
                  ))}

                  {/* Inner bright stroke paths with drawArc animation */}
                  {arcs.map((arc, i) => (
                    <path
                      key={`inner${i}`}
                      d={arc.d}
                      fill="none"
                      stroke={arc.innerColor}
                      strokeWidth="0.6"
                      opacity="0.9"
                      filter="url(#arcGlow)"
                      strokeLinecap="round"
                      strokeDasharray={arc.len}
                      strokeDashoffset={arc.len}
                      style={{
                        '--dash-len': arc.len,
                        animation: `drawArc ${arc.dur}s ease-out ${arc.delay}s forwards`,
                      } as CSSWithVars}
                    />
                  ))}

                  {/* Destination dots — pop into view */}
                  {destinations.map((dest, i) => (
                    <circle
                      key={`dot${i}`}
                      cx={dest.x}
                      cy={dest.y}
                      r="0"
                      fill={dest.color}
                      filter="url(#arcGlow)"
                      style={{
                        animation: `popDot 0.4s ease-out ${dest.popDelay}s forwards`,
                      }}
                    />
                  ))}

                  {/* Destination pulse rings — expanding fade-out */}
                  {destinations.map((dest, i) => (
                    <circle
                      key={`pulse${i}`}
                      cx={dest.x}
                      cy={dest.y}
                      r="0.8"
                      fill="none"
                      stroke={dest.color}
                      strokeWidth="0.3"
                      opacity="0"
                      style={{
                        animation: `destPulse 2.5s ease-out ${dest.pulseDelay}s infinite`,
                      }}
                    />
                  ))}

                  {/* Moving particles along each arc path */}
                  {arcs.map((arc, i) => (
                    <circle
                      key={`particle${i}`}
                      r="0.7"
                      fill="#fffbeb"
                      filter="url(#arcGlowStrong)"
                      opacity="0"
                    >
                      <animateMotion
                        dur={`${arc.particleDur}s`}
                        repeatCount="indefinite"
                        begin={`${arc.particleBegin}s`}
                        keyPoints="0;1"
                        keyTimes="0;1"
                        calcMode="linear"
                      >
                        <mpath href={`#p_arc${i}`} />
                      </animateMotion>
                      <animate
                        attributeName="opacity"
                        values="0;1;1;0"
                        keyTimes="0;0.1;0.85;1"
                        dur={`${arc.particleDur}s`}
                        repeatCount="indefinite"
                        begin={`${arc.particleBegin}s`}
                      />
                    </circle>
                  ))}

                  {/* China HQ — glowing radial gradient with breathing animation */}
                  <circle cx="72" cy="42" r="4" fill="url(#hqGlow)" opacity="0.6">
                    <animate
                      attributeName="r"
                      values="3;5;3"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.4;0.7;0.4"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* China HQ — bright core dot */}
                  <circle cx="72" cy="42" r="1.5" fill="#fffbeb" filter="url(#arcGlowStrong)">
                    <animate
                      attributeName="r"
                      values="1.2;1.8;1.2"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* China HQ label */}
                  <text
                    x="74.5"
                    y="41"
                    fill="#fbbf24"
                    fontSize="2.2"
                    fontWeight="700"
                    fontFamily="system-ui"
                    opacity="0.9"
                  >
                    {t('hero.slide5.hq')}
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          Navigation Arrows
          ================================================================ */}
      <button
        className="hc-nav-arrow hc-nav-prev"
        onClick={prev}
        aria-label={t('hero.nav.prev')}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M12 4L6 10l6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        className="hc-nav-arrow hc-nav-next"
        onClick={next}
        aria-label={t('hero.nav.next')}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M8 4l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* ================================================================
          Indicators
          ================================================================ */}
      <div className="hc-indicators">
        {Array.from({ length: TOTAL_SLIDES }, (_, i) => (
          <div
            key={i}
            className={`hc-indicator ${current === i ? 'active' : ''}`}
            style={activeIndicatorStyle(i)}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroCarousel;
