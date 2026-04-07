import { useState, useEffect, useRef, useCallback } from "react";

import industriesData from '../data/industries.json';
import aiData from '../data/ai.json';

import Modal from '../components/modal';



// ── useFadeUp ─────────────────────────────────────────────────────────────────
function useFadeUp(d = "") {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.classList.add("fu"); if (d) el.classList.add(d);
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("on"); obs.disconnect(); } },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [d]);
  return ref;
}

function go(id) { document.getElementById(id)?.scrollIntoView({ behavior:"smooth" }); }

// ── Logo: exact copy of approved brand ───────────────────────────────────────
// The Q-mark uses: qd (diamond border) + qi (solid circle) + qtg (gap cut, bg colour) + qt (tail)
// bg prop must match the background the logo sits on
function QMark({ size = "q-nav", bg = "#ffffff" }) {
  return (
    <div className={`qmark ${size}`}>
      <div className="qd" />
      <div className="qi" />
      <div className="qtg" style={{ background: bg }} />
      <div className="qt" />
    </div>
  );
}

function NavLogo({ onClick }) {
  return (
    <button className="nav-logo" onClick={onClick}>
      <QMark size="q-nav" bg="rgba(255,255,255,.96)" />
      <div className="logo-gap" />
      <div className="wm wm-nav">FLOOR<br />LOG<span className="iq">IQ</span></div>
    </button>
  );
}

// ── DATA ──────────────────────────────────────────────────────────────────────
const COMPANIES = [
  {a:"WT",n:"Warehouse Tech"},{a:"TC",n:"TechCorp Industries"},
  {a:"GM",n:"Global Mfg"},{a:"AS",n:"AutoSystems Inc"},
  {a:"SC",n:"Supply Chain Pro"},{a:"ID",n:"Industrial Dynamics"},
  {a:"SF",n:"SmartFactory Co"},{a:"LP",n:"Logistics Plus"},
  {a:"NX",n:"NextGen MES"},{a:"RE",n:"RealEdge Systems"},
];
const TECH = ["Fuuz Platform","NetSuite ERP","ISA-95","JSONata","GraphQL","ISO 22400","Plex MES","EDI · REST"];

// picsum.photos IDs: reliably load in browser, industrial-looking photos
const SOLUTIONS = [
  { icon:"🏭", title:"Warehouse Management", badge:null,
    img:"https://picsum.photos/id/1072/800/400",
    desc:"Complete WMS on the Fuuz platform — real-time inventory control, licence plate tracking, wave management, and scan-to-pack workflows with live NetSuite sync.",
    feats:["Licence plate tracking","Wave management","Scan & pack flows","NetSuite sync"] },
  { icon:"⚙️", title:"Manufacturing Execution", badge:"MES",
    img:"https://picsum.photos/id/1035/800/400",
    desc:"ISA-95 aligned MES on Fuuz — work order execution, OEE dashboards, downtime capture, quality inspection, and operator screens for real production environments.",
    feats:["Work order execution","OEE & throughput","Downtime capture","Quality inspection"] },
  { icon:"🔗", title:"ERP Integration", badge:null,
    img:"https://picsum.photos/id/0/800/400",
    desc:"Bidirectional Fuuz–NetSuite integration via JSONata transforms — items, work orders, and inventory transactions synced in real time with full error handling.",
    feats:["Bidirectional sync","JSONata transforms","Real-time events","Error handling"] },
  { icon:"🧪", title:"QA Engineering", badge:null,
    img:"https://picsum.photos/id/3/800/400",
    desc:"Platform-native QA by engineers who build on Fuuz daily — data flow validation, expression testing, screen binding checks, and AI-assisted regression before every go-live.",
    feats:["Flow regression","Expression testing","Screen binding QA","Go-live sign-off"] },
];

const WHY = [
  { icon:"🔩", title:"Fuuz-native, not Fuuz-trained",
    desc:"We build production flows every day — JSONata, GraphQL, data flow nodes, screen design, package management. Other firms learn Fuuz on your project." },
  { icon:"🤖", title:"AI accelerates every phase",
    desc:"Expression generation, QA coverage, architecture review, deployment analysis. AI makes our output faster and more thorough — not a marketing claim, a daily practice." },
  { icon:"✅", title:"QA baked in from day one",
    desc:"Our QA engineers test Fuuz flows natively. Every expression, screen binding, and integration edge case is validated before your team touches it." },
  { icon:"🌏", title:"India operations, global delivery",
    desc:"Trichy engineering centre, Canadian corporate entity. Enterprise-grade processes, full delivery ownership — not staff augmentation or body-shopping." },
];

const PROCESS = [
  { n:"01", title:"Discover & Map",
    desc:"We map your current state — systems, workflows, data models, pain points. Floor-level questions that surface real gaps, not just stated ones.", wk:"Wk 1–2" },
  { n:"02", title:"Architect",
    desc:"Complete data model, flow architecture, screen structures, and integration patterns designed before a single expression is written. Blueprint-first.", wk:"Wk 2–3" },
  { n:"03", title:"Build & Validate",
    desc:"Parallel dev and QA from day one, AI-assisted throughout. Every flow, screen, and integration validated against real production scenarios.", wk:"Wk 3–8" },
  { n:"04", title:"Deploy & Hand Off",
    desc:"Go-live support, full knowledge transfer, and documentation so your team genuinely owns the system — not a dependency on us.", wk:"Wk 9–10" },
];

const CASES = [
  {n:"01",cat:"WMS Implementation",     title:"Henry Schein Distribution Center — Full WMS"},
  {n:"02",cat:"MES Integration",        title:"Weatherby — Manufacturing Execution System"},
  {n:"03",cat:"ERP Synchronisation",    title:"Fuuz–NetSuite Bidirectional Integration"},
  {n:"04",cat:"Load Management",        title:"Load-Based Packing Workflow Migration"},
  {n:"05",cat:"QA Engineering",         title:"AI-Driven Regression Pipeline"},
  {n:"06",cat:"Carrier Routing",        title:"SCAC-Based Carrier Routing Logic"},
];

// ── NAV ───────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [drop, setDrop] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive:true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const h = (e) => {
      if (!e.target.closest("#nav") && !e.target.closest(".mobile-menu")) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, [mobileOpen]);
  const mobileGo = (id) => { go(id); setMobileOpen(false); };
//   useEffect(() => {
//   window.addEventListener('click', ()=>setDrop(false))
//   return () => window.removeEventListener('click', ()=>setDrop(false))
//   }, [])
  return (
    <>
      <nav id="nav" className={scrolled ? "scrolled" : ""}>
        <div className="nav-l">
          <NavLogo onClick={() => go("hero")} />
          <div className="nav-links">
            <div className="ndrop" onMouseEnter={() => setDrop(true)} onMouseLeave={() => setDrop(false)}>
              <button className="ndrop-btn">
                Services <span className={drop ? "chev o" : "chev"}>▾</span>
              </button>
              <div className="ndrop-menu" style={drop ? {top:`calc(100%)`, pointerEvents:'auto'}: null}></div>
              <div className={drop ? "ndrop-menu o" : "ndrop-menu"}>
                {["Warehouse Management","Manufacturing Execution","ERP Integration","QA Engineering"].map(s => (
                  <button key={s} onClick={() => { go("solutions"); setDrop(false); }}>{s}</button>
                ))}
              </div>
            </div>
            <button className="nav-link" onClick={() => go("contact")}>About</button>
            <button className="nav-link" onClick={() => go("process")}>Process</button>
            <button className="nav-link" onClick={() => go("contact")}>Contact</button>
          </div>
        </div>
        <div className="nav-r">
          <div className="nav-email">sasi@floorlogiq.com</div>
          <button className="nav-cta" onClick={() => go("contact")}>Get in Touch</button>
          <button
            className={mobileOpen ? "nav-hamburger open" : "nav-hamburger"}
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>
      {/* Mobile slide-down menu */}
      <div className={mobileOpen ? "mobile-menu open" : "mobile-menu"}>
        <div className="mobile-menu-section-label">Services</div>
        <div className="mobile-menu-sub">
          {["Warehouse Management","Manufacturing Execution","ERP Integration","QA Engineering"].map(s => (
            <button key={s} className="mobile-menu-link" onClick={() => mobileGo("solutions")}>{s}</button>
          ))}
        </div>
        <div className="mobile-menu-divider" />
        <button className="mobile-menu-link" onClick={() => mobileGo("contact")}>About</button>
        <button className="mobile-menu-link" onClick={() => mobileGo("process")}>Process</button>
        <button className="mobile-menu-link" onClick={() => mobileGo("cases")}>Case Studies</button>
        <button className="mobile-menu-link" onClick={() => mobileGo("contact")}>Contact</button>
        <div className="mobile-menu-divider" />
        <div className="mobile-menu-cta">
          <button className="nav-cta" style={{width:"100%"}} onClick={() => mobileGo("contact")}>Get in Touch</button>
        </div>
      </div>
      <div className="nav-tagline-bar">
        <span className="nav-tagline-dot" />
        <span className="nav-tagline-text">Where Factory Intelligence <span>Begins</span></span>
        <span className="nav-tagline-dot" />
      </div>
    </>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section id="hero">
      <div className="hero-l">
        <div className="hero-badge">
          <span className="hbdot" />
          Fuuz-Native · India-based · Global Delivery
        </div>

        <h1 className="hero-h1">
          Deploy Fast.
          <span className="red">Operate Smart.</span>
        </h1>

        <p className="hero-sub">
          WMS, MES, and ERP integration on the Fuuz platform —
          one team, full delivery ownership, from architecture through QA.
        </p>

        <div className="hero-btns">
          <button className="br" onClick={() => go("contact")}>Start a Project</button>
          <button className="bg" onClick={() => go("solutions")}>View Services →</button>
        </div>

        <div className="hero-stats">
          {[["5+",["Years WMS &","MES"]],["10+",["Fuuz","go-lives"]],["3",["Platform","specialisations"]],["100%",["Floor-level","focus"]]].map(([n,l]) => (
            <div key={n} className="hstat">
              <div className="hstat-n">{n.replace("%","")}<span className="a">{n.includes("%") ? "%" : ""}</span></div>
              <div className="hstat-l">{l[0]}<br />{l[1]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── TECH STRIP ────────────────────────────────────────────────────────────────
function TechStrip() {
  return (
    <div className="tech-strip">
      <span className="tech-lbl">Platforms &amp; Standards</span>
      <div className="tech-items">
        {TECH.map(t => <span key={t} className="tech-item">{t}</span>)}
      </div>
    </div>
  );
}

// ── STATS BAR ─────────────────────────────────────────────────────────────────
function StatsBar() {
  const r = useFadeUp();
  return (
    <div ref={r} className="stats-bar">
      {[["5+","Years in WMS & MES"],["10+","Fuuz implementations"],["3","Core specialisations"],["100%","Floor-level focus"]].map(([n,l]) => (
        <div key={l} className="st-item">
          <div className="st-n">{n.replace("%","")}<span className="a">{n.includes("%") ? "%" : ""}</span></div>
          <div className="st-l">{l}</div>
        </div>
      ))}
    </div>
  );
}

// ── TRUSTED ───────────────────────────────────────────────────────────────────
function Trusted() {
  const d = [...COMPANIES,...COMPANIES];
  return (
    <section id="trusted">
      <div className="wrap">
        <p className="tr-lbl">Trusted by industrial operations teams worldwide</p>
        <div className="tr-scroll">
          <div className="tr-track">
            {d.map((c,i) => (
              <div key={i} className="tr-card">
                <div className="tr-av">{c.a}</div>
                <div className="tr-name">{c.n}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── ABOUT ─────────────────────────────────────────────────────────────────────
function About() {
  const r1 = useFadeUp(), r2 = useFadeUp("d2");
  return (
    <section id="about" className="sec">
      <div className="wrap">
        <div className="ab-grid">
          <div ref={r1}>
            <div className="stag">Who We Are</div>
            <h2 className="sh">A team that builds and <span className="ac">ships</span> industrial software.</h2>
            <p className="ss">
              FloorLogiQ is a solutions engineering firm specialising in the Fuuz Industrial Operations Platform.
              We design, build, and validate WMS, MES, and ERP integrations — end to end, with full delivery ownership.
            </p>
            <blockquote className="ab-quote">
              Canadian-registered, India-operated. Our Trichy engineering centre gives enterprise-grade capability
              at competitive cost — without the trade-offs of a generic offshore model.
            </blockquote>
            <div style={{marginTop:"1.6rem"}}>
              <button className="br" onClick={() => go("contact")}>Talk to the team →</button>
            </div>
          </div>
          <div ref={r2} className="ab-img-wrap">
            <div className="ab-img">
              {/* picsum industrial/office photo — reliably loads in browser */}
              <img src="https://picsum.photos/id/1076/800/600" alt="FloorLogiQ engineering team" loading="lazy" />
            </div>
            <div className="ab-badge"><span className="ab-dot" /> Active projects</div>
            <div className="ab-stats">
              {[["5+","YEARS ON FUUZ"],["10+","GO-LIVES"],["3","PLATFORMS"]].map(([n,l]) => (
                <div key={l} className="ab-stat">
                  <div className="sn">{n}</div><div className="sl">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── AI SECTION ────────────────────────────────────────────────────────────────
function AISection() {
  const r1 = useFadeUp(), r2 = useFadeUp("d2");
  const [active, setActive] = useState(null);
  return (
    <>
      <section id="ai" className="sec sec-alt">
        <div className="wrap">
          <div className="ai-grid">
            <div ref={r1}>
              <div className="stag">AI-Augmented Delivery</div>
              <h2 className="sh">We use AI at <span className="ac">every stage</span> of delivery.</h2>
              <p className="ss">
                Not as a claim — as a daily practice. We use AI across expression development,
                QA coverage, architecture review, and documentation. Here is exactly how.
              </p>
              <div className="ai-cards">
                {aiData.map(({icon,title,desc}) => (
                  <div key={title} className="ai-card" onClick={() => setActive({icon,title,desc})} style={{cursor:"pointer"}}>
                    <div className="ai-icon">{icon}</div>
                    <div>
                      <div className="ai-ct">{title}</div>
                      <div className="ai-cd">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div ref={r2} className="ai-panel">
              <div className="ai-pl">AI impact</div>
              <div className="ai-big">3×</div>
              <div className="ai-pd">
                Faster delivery cycles compared to traditional build-and-test approaches —
                with higher coverage and fewer post-go-live defects.
              </div>
              <div className="ai-tags">
                {["Claude AI","JSONata generation","Test automation","Auto-documentation","Diff analysis","Risk flagging"].map(t => (
                  <span key={t} className="ai-tag">{t}</span>
                ))}
              </div>
              <div className="ai-pts">
                {[
                  "JSONata expressions generated and validated — not hand-written",
                  "QA test suites auto-generated from flow specifications",
                  "Architecture reviews run against best practices before build starts",
                  "Every deployment diff-analysed for regressions and breaking changes",
                  "Full handoff documentation generated automatically on delivery",
                ].map(t => <div key={t} className="ai-pt">{t}</div>)}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Modal ai={active} onClose={() => setActive(null)} />
    </>
  );
}

// ── WHY ───────────────────────────────────────────────────────────────────────
function Why() {
  const rh = useFadeUp(), rl = useFadeUp("d1"), rr = useFadeUp("d2");
  return (
    <section id="why" className="sec">
      <div className="wrap">
        <div ref={rh}>
          <div className="stag">Why FloorLogiQ</div>
          <h2 className="sh">Platform-native. <span className="ac">Not platform-trained.</span></h2>
          <p className="ss">
            Generic system integrators learn Fuuz on your project and charge you for the education.
            We have built production flows, debugged JSONata, and shipped go-lives on Fuuz across
            multiple clients. That depth — accelerated by AI — is what you are hiring.
          </p>
        </div>
        <div className="why-cols">
          <div>
            <div ref={rl} className="why-stats">
              {[["5+","YEARS ON FUUZ"],["10+","GO-LIVES"],["3","PLATFORMS"]].map(([n,l]) => (
                <div key={l} className="why-stat"><div className="wsn">{n}</div><div className="wsl">{l}</div></div>
              ))}
            </div>
            <div className="why-img-card">
              <div className="wi-img">
                <img src="https://picsum.photos/id/1070/800/400" alt="Engineering" loading="lazy" />
                <div className="wi-badge"><span className="wi-dot" /> Engineering-first delivery</div>
              </div>
              <div className="wi-body">
                <h4>How we work</h4>
                <p>Blueprint before build. QA from day one. Full knowledge transfer on delivery.
                   We hand off a system your team understands and can extend — not a black box dependency on us.</p>
              </div>
            </div>
          </div>
          <div ref={rr} className="why-feats">
            {WHY.map(({icon,title,desc}) => (
              <div key={title} className="wf">
                <div className="wf-h">
                  <div className="wf-i">{icon}</div>
                  <div className="wf-t">{title}</div>
                </div>
                <div className="wf-d">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── SOLUTIONS ─────────────────────────────────────────────────────────────────
function Solutions() {
  const r1 = useFadeUp(), r2 = useFadeUp("d1");
  return (
    <section id="solutions" className="sec sec-alt">
      <div className="wrap">
        <div ref={r1} className="sol-hdr">
          <div>
            <div className="stag">Our Services</div>
            <h2 className="sh">Built for the <span className="ac">factory floor.</span></h2>
          </div>
          <p className="ss" style={{alignSelf:"end"}}>
            Every engagement is engineered, not templated. We build what you need, validated before you touch it.
          </p>
        </div>
        <div ref={r2} className="sol-grid">
          {SOLUTIONS.map(({icon,title,badge,img,desc,feats}) => (
            <div key={title} className="sol-card">
              <div className="sol-img">
                <img src={img} alt={title} loading="lazy" />
                <div className="sol-ovl" />
                {badge && <span className="sol-bdg">{badge}</span>}
              </div>
              <div className="sol-body">
                <div className="sol-icon">{icon}</div>
                <div className="sol-t">{title}</div>
                <div className="sol-d">{desc}</div>
                <div className="sol-fs">{feats.map(f => <div key={f} className="sol-f">{f}</div>)}</div>
                <button className="sol-more" onClick={() => go("contact")}>Learn more →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── PROCESS ───────────────────────────────────────────────────────────────────
function Process() {
  const r1 = useFadeUp(), r2 = useFadeUp("d1");
  return (
    <section id="process" className="sec">
      <div className="wrap">
        <div ref={r1} className="proc-ctr">
          <div className="stag" style={{justifyContent:"center"}}>How It Works</div>
          <h2 className="sh">From discovery to <span className="ac">go-live.</span></h2>
          <p className="ss" style={{margin:"0 auto"}}>
            A four-step process built around real production deployments — not consulting frameworks.
          </p>
        </div>
        <div ref={r2} className="proc-grid">
          {PROCESS.map(({n,title,desc,wk}) => (
            <div key={n} className="proc-step">
              <div className="ps-n">STEP {n}</div>
              <div className="ps-t">{title}</div>
              <div className="ps-d">{desc}</div>
              <span className="ps-w">{wk}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── INDUSTRIES ────────────────────────────────────────────────────────────────

function Industries() {
  
  const INDS = [...industriesData];

  const [active, setActive] = useState(null);
  const r1 = useFadeUp(), r2 = useFadeUp("d1");
  return (
    <>
      <section id="industries" className="sec sec-alt">
        <div className="wrap">
          <div ref={r1} className="ind-hdr">
            <div className="stag" style={{justifyContent:"center"}}>Global Reach</div>
            <h2 className="sh" style={{textAlign:"center"}}>Industries We <span className="ac">Serve.</span></h2>
            <p className="ss" style={{textAlign:"center",margin:".75rem auto 0"}}>
              Click any industry to see how we deliver measurable results.
            </p>
          </div>
          <div ref={r2} className="ind-grid">
            {INDS.map((ind) => (
              <div
                key={ind.n}
                className="ind-card"
                onClick={() => setActive(ind)}
              >
                <div className="ind-gn">{ind.n}</div>
                <div className="ind-ico">{ind.icon}</div>
                <div className="ind-t">{ind.title}</div>
                <div className="ind-d">{ind.desc}</div>
                <div style={{
                  marginTop:".75rem", fontSize:"11px", fontFamily:"var(--mono)",
                  color:"var(--red)", letterSpacing:".07em", display:"flex",
                  alignItems:"center", gap:".3rem"
                }}>
                  View details <span style={{fontSize:"10px"}}>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Modal ind={active} onClose={() => setActive(null)} />
    </>
  );
}

// ── CASES ─────────────────────────────────────────────────────────────────────
function Cases() {
  const r = useFadeUp();
  return (
    <section id="cases" className="sec">
      <div className="wrap">
        <div ref={r} className="cas-cols">
          <div>
            <div className="stag">Case Studies</div>
            <h2 className="sh">Real deployments. <span className="ac">Real results.</span></h2>
            <p className="ss">
              Production-validated WMS, MES, and ERP integrations delivered on Fuuz —
              tested end-to-end and running in live environments.
            </p>
            <div style={{marginTop:"1.6rem"}}>
              <button className="br" onClick={() => go("contact")}>Discuss your project →</button>
            </div>
          </div>
          <div className="cas-grid">
            {CASES.map(({n,cat,title}) => (
              <div key={n} className="cas-card">
                <div className="cc-top"><span className="cc-n">{n}</span><span className="cc-a">↗</span></div>
                <div><div className="cc-c">{cat}</div><div className="cc-t">{title}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="cas-cta">
          <p>Ready to talk? We scope engagements quickly and give straight answers — no sales theatre.</p>
          <button className="br" style={{flexShrink:0}} onClick={() => go("contact")}>Get started →</button>
        </div>
      </div>
    </section>
  );
}

// ── CONTACT ───────────────────────────────────────────────────────────────────
function Contact() {
  const r1 = useFadeUp(), r2 = useFadeUp("d2");
  const [form, setForm] = useState({name:"",company:"",email:"",phone:"",service:"",message:""});
  const set = useCallback(k => e => setForm(f => ({...f,[k]:e.target.value})), []);
  function submit(e) {
    e.preventDefault();
    alert("Thank you — we will be in touch within one business day.");
    setForm({name:"",company:"",email:"",phone:"",service:"",message:""});
  }
  return (
    <section id="contact" className="sec sec-alt">
      <div className="wrap">
        <div className="con-cols">
          <div ref={r1} className="con-left">
            <div className="stag">Contact Us</div>
            <h2>Let's build something <span className="ac">that works.</span></h2>
            <p className="con-desc">
              Tell us what you are building or where you are stuck. We scope quickly and give straight answers.
            </p>
            <div className="con-items">
              {[
                {icon:"📍",lbl:"Canada HQ",        val:"Canadian Registered Entity"},
                {icon:"📍",lbl:"India Dev Centre", val:"Trichy, Tamil Nadu, India"},
                {icon:"✉️",lbl:"Email",             val:"info@floorlogiq.com"},
                {icon:"📞",lbl:"Phone",             val:"+91 XXXXX XXXXX"},
              ].map(({icon,lbl,val}) => (
                <div key={lbl} className="con-item">
                  <div className="ci-ico">{icon}</div>
                  <div><div className="ci-lbl">{lbl}</div><div className="ci-val">{val}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div ref={r2} className="con-form">
            <h3>Send an Inquiry</h3>
            <form onSubmit={submit}>
              <div className="fr">
                <div className="fg">
                  <label className="fl">Name</label>
                  <input className="fi" type="text" placeholder="Your name" value={form.name} onChange={set("name")} required />
                </div>
                <div className="fg">
                  <label className="fl">Company</label>
                  <input className="fi" type="text" placeholder="Organisation" value={form.company} onChange={set("company")} />
                </div>
              </div>
              <div className="fr">
                <div className="fg">
                  <label className="fl">Email</label>
                  <input className="fi" type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} required />
                </div>
                <div className="fg">
                  <label className="fl">Phone</label>
                  <input className="fi" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={set("phone")} />
                </div>
              </div>
              <div className="fg">
                <label className="fl">What do you need?</label>
                <select className="fs" value={form.service} onChange={set("service")}>
                  <option value="" disabled>Select a service…</option>
                  {["WMS Implementation","MES Implementation","ERP Integration (NetSuite)","QA Engineering","Solutions Architecture","AI-Augmented Delivery","Something else"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="fg" style={{marginBottom:"1.2rem"}}>
                <label className="fl">Tell us about your project</label>
                <textarea className="fta" placeholder="Current system, pain points, timeline, what you need to solve…" value={form.message} onChange={set("message")} />
              </div>
              <button type="submit" className="fsub">Send Message →</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="ft-grid">
          <div className="ft-brand">
            <div className="ft-logo">
              <QMark size="q-ft" bg="var(--off)" />
              <div>
                <div className="ft-wm">FLOOR<br/>LOG<span className="iq">IQ</span></div>
                <div className="ft-rule" />
                <div className="ft-tl">Where Factory Intelligence Begins</div>
              </div>
            </div>
            <p>Fuuz-native WMS, MES, and ERP solutions — AI-augmented, India-based, globally delivered.</p>
            <div className="ft-soc">
              {["in","𝕏","gh"].map(s => <button key={s} className="soc-btn">{s}</button>)}
            </div>
          </div>
          <div className="ft-col">
            <h4>Services</h4>
            <ul>
              {["Warehouse Management","Manufacturing Execution","ERP Integration","QA Engineering","AI-Augmented Delivery"].map(s => (
                <li key={s}><a href="#" onClick={e=>{e.preventDefault();go("solutions")}}>{s}</a></li>
              ))}
            </ul>
          </div>
          <div className="ft-col">
            <h4>Company</h4>
            <ul>
              {[["about","About Us"],["cases","Case Studies"],["industries","Industries"],["process","How We Work"],["contact","Contact"]].map(([id,l]) => (
                <li key={id}><a href="#" onClick={e=>{e.preventDefault();go(id)}}>{l}</a></li>
              ))}
            </ul>
          </div>
          <div className="ft-col">
            <h4>Contact</h4>
            <div className="ft-cr"><span>✉️</span><span>info@floorlogiq.com</span></div>
            <div className="ft-cr"><span>📞</span><span>+91 XXXXX XXXXX</span></div>
            <div className="ft-cr"><span>📍</span><span>Canada HQ · Trichy, India</span></div>
            <h4 style={{marginTop:"1rem"}}>Technology</h4>
            <ul>
              <li><a href="https://fuuz.com" target="_blank" rel="noopener noreferrer">Fuuz Platform</a></li>
              {["NetSuite ERP","ISA-95 / ISO 22400","JSONata · GraphQL"].map(t => (
                <li key={t}><a href="#" onClick={e=>e.preventDefault()}>{t}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="ft-bot">
          <p className="ft-copy">© 2026 FloorLogiQ Inc. All rights reserved. · Where Factory Intelligence Begins</p>
          <div className="ft-links">
            {["Privacy","Terms","Cookies"].map(l => <a key={l} href="#">{l}</a>)}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage(){
    return (
    <>
      <Nav />
      <main>
        <Hero />
        <TechStrip />
        <StatsBar />
        <Trusted />
        <About />
        <AISection />
        <Why />
        <Solutions />
        <Process />
        <Industries />
        <Cases />
        <Contact />
      </main>
      <Footer />
    </>
  );
}