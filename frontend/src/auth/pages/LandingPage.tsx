import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./landing.css";

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────
// REACT BITS: Aurora Animated Background
// ─────────────────────────────────────────────
function AuroraBackground() {
  return (
    <div className="aurora-root" aria-hidden>
      <div className="aurora-blob aurora-blob--1" />
      <div className="aurora-blob aurora-blob--2" />
      <div className="aurora-blob aurora-blob--3" />
      <div className="aurora-blob aurora-blob--4" />
      <div className="aurora-grid" />
      <div className="aurora-noise" />
    </div>
  );
}

// ─────────────────────────────────────────────
// REACT BITS: Particle Canvas
// ─────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: 72 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      r: Math.random() * 1.7 + 0.4,
      hue: Math.random() * 60 + 175,
    }));
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x = (p.x + p.vx + canvas.width) % canvas.width;
        p.y = (p.y + p.vy + canvas.height) % canvas.height;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},80%,70%,0.5)`;
        ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 115) {
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${pts[i].hue},70%,65%,${(1 - d / 115) * 0.11})`;
            ctx.lineWidth = 0.55;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={ref} className="particle-canvas" />;
}

// ─────────────────────────────────────────────
// REACT BITS: Typewriter
// ─────────────────────────────────────────────
function Typewriter({ words }: { words: string[] }) {
  const [idx, setIdx] = useState(0);
  const [txt, setTxt] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const word = words[idx];
    let t: ReturnType<typeof setTimeout>;
    if (!del && txt.length < word.length) {
      t = setTimeout(() => setTxt(word.slice(0, txt.length + 1)), 78);
    } else if (!del && txt.length === word.length) {
      t = setTimeout(() => setDel(true), 1700);
    } else if (del && txt.length > 0) {
      t = setTimeout(() => setTxt(txt.slice(0, -1)), 44);
    } else {
      setDel(false);
      setIdx((idx + 1) % words.length);
    }
    return () => clearTimeout(t);
  }, [txt, del, idx, words]);
  return (
    <span className="typewriter">
      {txt}
      <span className="typewriter__cursor">|</span>
    </span>
  );
}

// ─────────────────────────────────────────────
// Stars
// ─────────────────────────────────────────────
function Stars({ n }: { n: number }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= n ? "star on" : "star off"}>★</span>
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const COURSES = [
  { id: 1, emoji: "⚛️", tag: "Frontend", title: "React 19 + TypeScript Complete Guide", rating: 4.9, reviews: 5120, students: "14.2k", price: "₹499", badge: "Bestseller", accent: "#38bdf8" },
  { id: 2, emoji: "🐍", tag: "Backend", title: "Python for Data Science & Machine Learning", rating: 4.8, reviews: 3800, students: "10.5k", price: "₹599", badge: null, accent: "#34d399" },
  { id: 3, emoji: "🎨", tag: "Design", title: "UI/UX Design System Mastery in Figma", rating: 4.7, reviews: 2240, students: "7.1k", price: "₹399", badge: "New", accent: "#f472b6" },
  { id: 4, emoji: "☁️", tag: "DevOps", title: "AWS Cloud Architect Bootcamp 2024", rating: 4.9, reviews: 1980, students: "5.8k", price: "₹699", badge: null, accent: "#fb923c" },
  { id: 5, emoji: "🤖", tag: "AI / ML", title: "Generative AI & LLM Engineering", rating: 5.0, reviews: 2760, students: "9.3k", price: "₹799", badge: "🔥 Hot", accent: "#a78bfa" },
  { id: 6, emoji: "📱", tag: "Mobile", title: "Flutter Full-Stack App from Scratch", rating: 4.6, reviews: 1540, students: "4.9k", price: "₹549", badge: null, accent: "#facc15" },
];

const REVIEWS = [
  { name: "Priya Sharma", role: "SDE @ Swiggy", av: "PS", rating: 5, text: "LearnVerse transformed my career in 3 months. The React course has hands-on projects that companies actually care about. Landed my dream job right after finishing!" },
  { name: "Arjun Mehta", role: "ML Eng @ Razorpay", av: "AM", rating: 5, text: "The AI/ML curriculum is second to none. Live sessions, mentorship, and a community that genuinely pushes you forward. Worth every rupee — 10×." },
  { name: "Sneha Patel", role: "UX Lead @ Zomato", av: "SP", rating: 5, text: "Got hired 2 weeks after completing the Design course. The portfolio projects are exactly what hiring managers want to see. Absolutely elite content." },
  { name: "Rahul Gupta", role: "DevOps @ PhonePe", av: "RG", rating: 5, text: "The AWS Bootcamp is brutally practical. Real infra projects, not slides. Passed cert on my first attempt and salary jumped 40%." },
];

const STATS = [
  { v: "2.4M+", l: "Learners Worldwide" },
  { v: "850+", l: "Expert Courses" },
  { v: "4.9 ★", l: "Average Rating" },
  { v: "97%", l: "Placement Rate" },
];

const NAV = ["Courses", "Paths", "Instructors", "Pricing"];

// ─────────────────────────────────────────────
// Course Card
// ─────────────────────────────────────────────
function CourseCard({ c }: { c: typeof COURSES[0] }) {
  const [hov, setHov] = useState(false);
  return (
    <article
      className={`cc ${hov ? "cc--hov" : ""}`}
      style={{ "--ca": c.accent } as React.CSSProperties}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {c.badge && <span className="cc__badge">{c.badge}</span>}
      <div className="cc__emoji">{c.emoji}</div>
      <div className="cc__tag">{c.tag}</div>
      <h3 className="cc__title">{c.title}</h3>
      <div className="cc__meta">
        <Stars n={Math.round(c.rating)} />
        <span className="cc__rv">{c.rating}</span>
        <span className="cc__rc">({c.reviews.toLocaleString()})</span>
      </div>
      <div className="cc__foot">
        <span className="cc__students">👥 {c.students}</span>
        <span className="cc__price">{c.price}</span>
      </div>
      <button className="btn btn--accent btn--sm">Enroll Now →</button>
    </article>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function LandingPage() {
  const navRef = useRef<HTMLElement>(null);
  const hTagRef = useRef<HTMLDivElement>(null);
  const hH1Ref = useRef<HTMLHeadingElement>(null);
  const hSubRef = useRef<HTMLParagraphElement>(null);
  const hCtaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const coursesRef = useRef<HTMLElement>(null);
  const reviewsRef = useRef<HTMLElement>(null);
  const ctaBRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(navRef.current,
        { y: -70, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, ease: "power3.out", delay: 0.1 }
      );
      gsap.fromTo(
        [hTagRef.current, hH1Ref.current, hSubRef.current, hCtaRef.current],
        { y: 55, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.17, delay: 0.5 }
      );
      gsap.fromTo(
        statsRef.current?.querySelectorAll(".stat-card") ?? [],
        { y: 45, opacity: 0, scale: 0.88 },
        {
          y: 0, opacity: 1, scale: 1, stagger: 0.11, duration: 0.65, ease: "back.out(1.5)",
          scrollTrigger: { trigger: statsRef.current, start: "top 84%" }
        }
      );
      gsap.fromTo(
        coursesRef.current?.querySelectorAll(".cc") ?? [],
        { y: 65, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: coursesRef.current, start: "top 80%" }
        }
      );
      gsap.fromTo(
        reviewsRef.current?.querySelectorAll(".review-card") ?? [],
        { x: -45, opacity: 0 },
        {
          x: 0, opacity: 1, stagger: 0.13, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: reviewsRef.current, start: "top 80%" }
        }
      );
      gsap.fromTo(ctaBRef.current,
        { scale: 0.9, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.3)",
          scrollTrigger: { trigger: ctaBRef.current, start: "top 84%" }
        }
      );
    });
    return () => ctx.revert();
  }, []);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 36);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="lp">
      <AuroraBackground />
      <ParticleCanvas />

      {/* ── NAV ─────────────────────────────── */}
      <nav ref={navRef} className={`lp-nav ${scrolled ? "lp-nav--s" : ""}`} style={{ opacity: 0 }}>
        <a href="#" className="logo">
          <span className="logo__icon">🎓</span>
          Vault<span className="logo__ac">Learn</span>
        </a>
        <ul className="nav-links">
          {NAV.map(l => <li key={l}><a href="#" className="nav-link">{l}</a></li>)}
        </ul>
        <div className="nav-auth">
          <Link to="/login" className="btn btn--ghost">Log In</Link>
          <Link to="/register" className="btn btn--primary">Sign Up</Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────── */}
      <section className="hero">
        {/* floating decorative chips */}
        <div className="chip chip--1" aria-hidden>⚛️ React 19 just shipped</div>
        <div className="chip chip--2" aria-hidden><Stars n={5} /> 4.9 rating</div>
        <div className="chip chip--3" aria-hidden>🎓 850+ courses</div>

        <div ref={hTagRef} className="hero-pill" style={{ opacity: 0 }}>
          <span className="hero-pill__dot" /> India's #1 Tech Learning Platform
        </div>

        <h1 ref={hH1Ref} className="hero-h1" style={{ opacity: 0 }}>
          Skills That&nbsp;
          <Typewriter words={["Get You Hired.", "Build Products.", "Change Careers.", "Define the Future."]} />
        </h1>

        <p ref={hSubRef} className="hero-sub" style={{ opacity: 0 }}>
          Join <strong>2.4 million learners</strong> mastering React, Python, AI, Design&nbsp;&amp;&nbsp;more —
          through project-based courses built by industry practitioners.
        </p>

        <div ref={hCtaRef} className="hero-cta" style={{ opacity: 0 }}>
          <Link to="/register" className="btn btn--primary btn--lg">🚀 Get Started Free</Link>
          <button className="btn btn--ghost btn--lg">▶ Watch Demo</button>
        </div>

        <div className="hero-trust">
          {["No credit card", "Cancel anytime", "7-day free trial"].map(t => (
            <span className="trust-item" key={t}><span className="tick">✓</span>{t}</span>
          ))}
        </div>

        <div className="scroll-hint" aria-hidden>
          <div className="scroll-hint__dot" />
        </div>
      </section>

      {/* ── STATS ─────────────────────────────── */}
      <section className="stats-section">
        <div ref={statsRef} className="stats-grid">
          {STATS.map(s => (
            <div className="stat-card" key={s.l}>
              <span className="stat-v">{s.v}</span>
              <span className="stat-l">{s.l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── COURSES ─────────────────────────────── */}
      <section className="lp-section" ref={coursesRef}>
        <div className="sec-head">
          <span className="sec-tag">Featured Courses</span>
          <h2 className="sec-h2">Learn From <em>The Best</em></h2>
          <p className="sec-sub">Curated programs taught by practitioners, not professors.</p>
        </div>
        <div className="courses-grid">
          {COURSES.map(c => <CourseCard key={c.id} c={c} />)}
        </div>
        <div className="sec-action">
          <button className="btn btn--outline btn--lg">Explore All 850+ Courses →</button>
        </div>
      </section>

      {/* ── REVIEWS ─────────────────────────────── */}
      <section className="lp-section lp-section--alt" ref={reviewsRef}>
        <div className="sec-head">
          <span className="sec-tag">Student Reviews</span>
          <h2 className="sec-h2">Real Stories, <em>Real Results</em></h2>
        </div>
        <div className="reviews-grid">
          {REVIEWS.map(r => (
            <div className="review-card" key={r.name}>
              <Stars n={r.rating} />
              <p className="review-body">"{r.text}"</p>
              <div className="review-author">
                <div className="review-av">{r.av}</div>
                <div>
                  <div className="review-name">{r.name}</div>
                  <div className="review-role">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────── */}
      <section className="cta-banner" ref={ctaBRef}>
        <div className="cta-box">
          <span className="cta-ico">🎯</span>
          <h2 className="cta-h2">Ready to <em>Level Up?</em></h2>
          <p className="cta-sub">Start your 7-day free trial. No credit card required.</p>
          <Link to="/register" className="btn btn--primary btn--lg">🚀 Start Learning Free</Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────── */}
      <footer className="lp-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <a href="#" className="logo logo--light">
              <span className="logo__icon">🎓</span>
              Vault<span className="logo__ac">Learn</span>
            </a>
            <p className="footer-desc">
              Empowering 2.4M+ learners with world-class tech education.
              Your journey to mastery starts here.
            </p>
            <div className="footer-socials">
              {["𝕏", "in", "yt", "gh"].map(s => (
                <a href="#" className="social-ico" key={s}>{s}</a>
              ))}
            </div>
          </div>
          {[
            { h: "Learn", ls: ["All Courses", "Learning Paths", "Certifications", "Live Classes", "Workshops"] },
            { h: "Company", ls: ["About Us", "Careers", "Blog", "Press", "Investors"] },
            { h: "Support", ls: ["Help Center", "Contact Us", "Privacy Policy", "Terms", "Refunds"] },
          ].map(col => (
            <div className="footer-col" key={col.h}>
              <h4 className="footer-col-h">{col.h}</h4>
              <ul>{col.ls.map(l => <li key={l}><a href="#" className="footer-link">{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="footer-bar">
          <span>© 2026 VaultLearn Technologies Pvt. Ltd. All rights reserved.</span>
          <div className="footer-legal">
            {["Privacy", "Terms", "Cookies"].map(l => <a href="#" key={l}>{l}</a>)}
          </div>
        </div>
      </footer>
    </div>
  );
}