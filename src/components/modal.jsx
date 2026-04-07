import { useEffect, useRef } from "react";

/*
  FloorLogiQ Modal Component
  ──────────────────────────
  Matches the exact design system of FloorLogiQ:
    - DM Sans + DM Mono fonts
    - --red: #cc1f1f accent
    - White / #f7f8fa surfaces
    - Same border, shadow, and radius tokens

  USAGE:
  ──────
  1. Import and place <Modal /> anywhere in your JSX tree.
  2. It exposes a global helper: window.flqModal.open(config)
     You can call this from any onClick anywhere in the app.

  QUICK INTEGRATION EXAMPLE:
  ──────────────────────────
  // In any component:
  <button onClick={() => window.flqModal.open({ type: "contact" })}>
    Get in Touch
  </button>

  // Or with a custom message:
  <button onClick={() => window.flqModal.open({
    type: "custom",
    title: "Ready to deploy?",
    body: "Let's scope your project in a quick call.",
    cta: "Book a Call",
    onCta: () => console.log("CTA clicked"),
  })}>
    Open modal
  </button>

  MODAL TYPES:
  ─────────────
  "contact"   → Contact / inquiry form (default)
  "confirm"   → Confirmation dialog (title + body + confirm/cancel)
  "success"   → Success state (icon + message)
  "custom"    → Free-form: pass title, body, cta, onCta
*/

// ─── CSS ──────────────────────────────────────────────────────────────────────
const MODAL_CSS = `
.flq-overlay {
  position:fixed; inset:0; z-index:9000;
  background:rgba(10,10,10,.45);
  backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px);
  display:flex; align-items:center; justify-content:center;
  padding:1.25rem;
  opacity:0; pointer-events:none;
  transition:opacity .22s ease;
}
.flq-overlay.open {
  opacity:1; pointer-events:auto;
}

.flq-modal {
  background:#ffffff;
  border:1px solid #e4e7ee;
  border-radius:16px;
  box-shadow:0 24px 80px rgba(0,0,0,.18), 0 4px 20px rgba(0,0,0,.09);
  width:100%; max-width:520px;
  max-height:90vh; overflow-y:auto;
  transform:translateY(14px) scale(.98);
  transition:transform .26s cubic-bezier(.34,1.3,.64,1), opacity .22s ease;
  opacity:0;
  position:relative;
}
.flq-overlay.open .flq-modal {
  transform:translateY(0) scale(1);
  opacity:1;
}

/* header */
.flq-modal-header {
  display:flex; align-items:flex-start; justify-content:space-between;
  padding:1.6rem 1.75rem 0;
}
.flq-modal-eyebrow {
  display:inline-flex; align-items:center; gap:.45rem;
  font-size:10px; font-family:'DM Mono',monospace; letter-spacing:.13em;
  color:#cc1f1f; text-transform:uppercase; margin-bottom:.5rem;
}
.flq-modal-eyebrow::before { content:''; width:14px; height:1px; background:#cc1f1f; }
.flq-modal-title {
  font-family:'DM Sans',sans-serif; font-weight:900;
  font-size:1.45rem; line-height:1.15; letter-spacing:-.03em; color:#0a0a0a;
}
.flq-modal-title .ac { color:#cc1f1f; }
.flq-modal-close {
  width:34px; height:34px; border-radius:8px;
  background:none; border:1.5px solid #e4e7ee;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; flex-shrink:0; margin-left:1rem;
  color:#8a90a8; font-size:16px; font-family:'DM Sans',sans-serif;
  transition:all .15s;
}
.flq-modal-close:hover { border-color:#0a0a0a; color:#0a0a0a; background:#f7f8fa; }

/* body */
.flq-modal-body { padding:1rem 1.75rem 1.75rem; }
.flq-modal-desc { font-size:.9rem; color:#4a5168; line-height:1.75; margin-bottom:1.4rem; }

/* divider */
.flq-modal-divider { height:1px; background:#e4e7ee; margin:0 1.75rem; }

/* ── form fields ── */
.flq-form-row { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; margin-bottom:.75rem; }
@media(max-width:480px){ .flq-form-row { grid-template-columns:1fr; } }
.flq-fg { display:flex; flex-direction:column; gap:.28rem; margin-bottom:.75rem; }
.flq-fl {
  font-size:9.5px; font-family:'DM Mono',monospace;
  color:#8a90a8; letter-spacing:.09em; text-transform:uppercase; font-weight:500;
}
.flq-fi, .flq-fs, .flq-fta {
  background:#f7f8fa; border:1px solid #e4e7ee; border-radius:8px;
  padding:.62rem .85rem; color:#0a0a0a;
  font-family:'DM Sans',sans-serif; font-size:.875rem;
  transition:all .18s; outline:none; width:100%; -webkit-appearance:none;
}
.flq-fi:focus, .flq-fs:focus, .flq-fta:focus {
  border-color:#cc1f1f; box-shadow:0 0 0 3px rgba(204,31,31,.1); background:#fff;
}
.flq-fi::placeholder, .flq-fta::placeholder { color:#c4c8d8; }
.flq-fta { resize:vertical; min-height:90px; }

/* ── buttons ── */
.flq-btn-row { display:flex; gap:.6rem; margin-top:1.4rem; }
.flq-btn-primary {
  flex:1; background:#cc1f1f; color:#fff;
  padding:.72rem 1.4rem; border-radius:8px;
  font-size:14px; font-weight:700; font-family:'DM Sans',sans-serif;
  border:none; cursor:pointer; transition:background .18s, transform .15s;
  display:flex; align-items:center; justify-content:center; gap:.5rem;
}
.flq-btn-primary:hover { background:#b01818; transform:translateY(-1px); }
.flq-btn-ghost {
  background:transparent; color:#0a0a0a;
  padding:.7rem 1.3rem; border-radius:8px;
  border:1.5px solid #d0d5e2;
  font-size:14px; font-weight:600; font-family:'DM Sans',sans-serif;
  cursor:pointer; transition:all .18s; white-space:nowrap;
}
.flq-btn-ghost:hover { border-color:#0a0a0a; background:#f7f8fa; }

/* ── success state ── */
.flq-success-body {
  padding:2.5rem 1.75rem 2rem;
  display:flex; flex-direction:column; align-items:center; text-align:center;
}
.flq-success-icon {
  width:56px; height:56px; border-radius:50%;
  background:rgba(204,31,31,.08); border:1.5px solid rgba(204,31,31,.2);
  display:flex; align-items:center; justify-content:center;
  font-size:24px; margin-bottom:1.2rem;
}
.flq-success-title {
  font-family:'DM Sans',sans-serif; font-weight:900;
  font-size:1.3rem; letter-spacing:-.03em; color:#0a0a0a; margin-bottom:.5rem;
}
.flq-success-msg { font-size:.9rem; color:#4a5168; line-height:1.75; max-width:34ch; }

/* ── confirm state ── */
.flq-confirm-body { padding:1.75rem; }
.flq-confirm-title {
  font-family:'DM Sans',sans-serif; font-weight:900;
  font-size:1.2rem; letter-spacing:-.03em; color:#0a0a0a; margin-bottom:.6rem;
}
.flq-confirm-msg { font-size:.9rem; color:#4a5168; line-height:1.75; }

/* scrollbar inside modal */
.flq-modal::-webkit-scrollbar { width:4px; }
.flq-modal::-webkit-scrollbar-track { background:#f7f8fa; border-radius:4px; }
.flq-modal::-webkit-scrollbar-thumb { background:#cc1f1f; border-radius:4px; }

/* ── Mobile: bottom sheet ── */
@media(max-width:540px){
  .flq-overlay {
    padding:0;
    align-items:flex-end;
  }
  .flq-modal {
    max-width:100%;
    max-height:92vh;
    border-radius:20px 20px 0 0;
    transform:translateY(100%);
  }
  .flq-overlay.open .flq-modal {
    transform:translateY(0);
  }
  .flq-modal::before {
    content:'';
    display:block;
    width:36px; height:4px;
    background:#d0d5e2;
    border-radius:4px;
    margin:12px auto 0;
  }
  .flq-modal-header { padding:1rem 1.25rem 0; }
  .flq-modal-title { font-size:1.2rem; }
  .flq-modal-body { padding:.85rem 1.25rem 1.5rem; }
  .flq-modal-divider { margin:0 1.25rem; }
  .flq-modal-desc { font-size:.85rem; margin-bottom:1rem; }
  .flq-btn-row { flex-direction:column-reverse; gap:.5rem; }
  .flq-btn-primary, .flq-btn-ghost { width:100%; padding:.78rem 1rem; }
  .flq-success-body { padding:1.75rem 1.25rem 2rem; }
  .flq-success-icon { width:48px; height:48px; font-size:20px; }
  .flq-success-title { font-size:1.15rem; }
  .flq-fta { min-height:75px; }
}
`;

const IND_CSS = `.ind-overlay {
  position:fixed; inset:0; z-index:8000;
  background:rgba(10,10,10,.45);
  backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px);
  display:flex; align-items:center; justify-content:center;
  padding:1.25rem;
  opacity:0; pointer-events:none;
  transition:opacity .22s ease;
}
.ind-overlay.open { opacity:1; pointer-events:auto; }
.ind-modal {
  background:var(--white); border:1px solid var(--bdr);
  border-radius:16px;
  box-shadow:0 24px 80px rgba(0,0,0,.16), 0 4px 20px rgba(0,0,0,.09);
  width:100%; max-width:560px;
  max-height:88vh; overflow-y:auto;
  transform:translateY(16px) scale(.98);
  opacity:0;
  transition:transform .28s cubic-bezier(.34,1.3,.64,1), opacity .22s ease;
  position:relative;
}
.ind-overlay.open .ind-modal { transform:translateY(0) scale(1); opacity:1; }
.ind-modal-top {
  padding:1.6rem 1.75rem 1.2rem;
  border-bottom:1px solid var(--bdr);
  display:flex; align-items:flex-start; justify-content:space-between; gap:1rem;
}
.ind-modal-ico-wrap {
  width:48px; height:48px; border-radius:12px; flex-shrink:0;
  background:var(--redbg); border:1px solid var(--redbr);
  display:flex; align-items:center; justify-content:center; font-size:22px;
}
.ind-modal-meta { flex:1; }
.ind-modal-eyebrow {
  font-size:10px; font-family:var(--mono); letter-spacing:.13em;
  color:var(--red); text-transform:uppercase; margin-bottom:.4rem;
  display:flex; align-items:center; gap:.4rem;
}
.ind-modal-eyebrow::before { content:''; width:12px; height:1px; background:var(--red); }
.ind-modal-title {
  font-weight:900; font-size:1.35rem; letter-spacing:-.03em;
  color:var(--ink); line-height:1.15;
}
.ind-modal-close {
  width:34px; height:34px; border-radius:8px; flex-shrink:0;
  background:none; border:1.5px solid var(--bdr);
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; color:var(--muted); font-size:15px;
  transition:all .15s;
}
.ind-modal-close:hover { border-color:var(--ink); color:var(--ink); background:var(--off); }
.ind-modal-body { padding:1.4rem 1.75rem 1.75rem; }
.ind-modal-tagline {
  font-size:1.05rem; font-weight:700; color:var(--ink);
  letter-spacing:-.02em; margin-bottom:.75rem; line-height:1.3;
}
.ind-modal-tagline .ac { color:var(--red); }
.ind-modal-desc {
  font-size:.9rem; color:var(--mid); line-height:1.8; margin-bottom:1.5rem;
}
.ind-modal-metrics {
  display:grid; grid-template-columns:repeat(3,1fr);
  gap:.6rem; margin-bottom:1.5rem;
}
.ind-metric {
  background:var(--off); border:1px solid var(--bdr); border-radius:10px;
  padding:.85rem .75rem; text-align:center;
}
.ind-metric-v {
  font-size:1.4rem; font-weight:900; color:var(--red);
  letter-spacing:-.04em; line-height:1;
}
.ind-metric-l {
  font-size:10px; font-family:var(--mono); color:var(--muted);
  letter-spacing:.06em; text-transform:uppercase; margin-top:.25rem;
}
.ind-modal-benefits { display:flex; flex-direction:column; gap:.5rem; margin-bottom:1.6rem; }
.ind-benefit {
  display:flex; align-items:center; gap:.65rem;
  font-size:.875rem; color:var(--mid);
}
.ind-benefit::before {
  content:''; width:18px; height:18px; border-radius:50%; flex-shrink:0;
  background:var(--redbg); border:1px solid var(--redbr);
  display:flex; align-items:center; justify-content:center;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M2 5l2.5 2.5L8 3' stroke='%23cc1f1f' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat:no-repeat; background-position:center;
}
.ind-modal-cta {
  display:flex; gap:.6rem;
}
.ind-modal-btn-primary {
  flex:1; background:var(--red); color:#fff;
  padding:.72rem 1.2rem; border-radius:8px;
  font-size:13.5px; font-weight:700; font-family:var(--font);
  border:none; cursor:pointer; transition:background .18s,transform .15s;
  display:flex; align-items:center; justify-content:center; gap:.4rem;
}
.ind-modal-btn-primary:hover { background:var(--red2); transform:translateY(-1px); }
.ind-modal-btn-ghost {
  background:transparent; color:var(--ink);
  padding:.7rem 1.1rem; border-radius:8px;
  border:1.5px solid var(--bdr2);
  font-size:13.5px; font-weight:600; font-family:var(--font);
  cursor:pointer; transition:all .18s; white-space:nowrap;
}
.ind-modal-btn-ghost:hover { border-color:var(--ink); background:var(--off); }
.ind-modal::-webkit-scrollbar { width:4px; }
.ind-modal::-webkit-scrollbar-track { background:var(--off); }
.ind-modal::-webkit-scrollbar-thumb { background:var(--red); border-radius:4px; }
@media(max-width:540px){
  .ind-overlay { padding:0; align-items:flex-end; }
  .ind-modal {
    max-width:100%; max-height:92vh;
    border-radius:20px 20px 0 0;
    transform:translateY(100%);
  }
  .ind-overlay.open .ind-modal { transform:translateY(0); }
  .ind-modal::before {
    content:''; display:block; width:36px; height:4px;
    background:var(--bdr2); border-radius:4px; margin:12px auto 0;
  }
  .ind-modal-top { padding:1rem 1.25rem 1rem; }
  .ind-modal-body { padding:1.1rem 1.25rem 1.5rem; }
  .ind-modal-metrics { grid-template-columns:repeat(3,1fr); gap:.4rem; }
  .ind-metric-v { font-size:1.2rem; }
  .ind-modal-cta { flex-direction:column-reverse; }
  .ind-modal-btn-primary, .ind-modal-btn-ghost { width:100%; }
}`;

// ─── Modal Component ──────────────────────────────────────────────────────────
export default function Modal({ ind, ai, onClose }) {
  const overlayRef = useRef(null);
  const data = ind || ai;
  const isAI = !!ai;

  // Escape key
  useEffect(() => {
    if (!data) return;
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [data, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = data ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [data]);

  // Inject CSS once
  useEffect(() => {
    const id = "flq-modal-css";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = IND_CSS;
    document.head.appendChild(el);
    return () => document.getElementById(id)?.remove();
  }, []);

  return (
    <div
      ref={overlayRef}
      className={data ? "ind-overlay open" : "ind-overlay"}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {data && (
        <div className="ind-modal" role="dialog" aria-modal="true">
          <div className="ind-modal-top">
            <div className="ind-modal-ico-wrap">{data.icon}</div>
            <div className="ind-modal-meta" style={{ marginLeft: "1rem" }}>
              <div className="ind-modal-eyebrow">{isAI ? "AI-Augmented" : "Industries We Serve"}</div>
              <div className="ind-modal-title">{data.title}</div>
            </div>
            <button
              className="ind-modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="ind-modal-body">
            {isAI ? (
              <>
                <p className="ind-modal-desc">{data.desc}</p>
                <div className="ind-modal-cta">
                  <button className="ind-modal-btn-ghost" onClick={onClose}>
                    Close
                  </button>
                  <button
                    className="ind-modal-btn-primary"
                    onClick={() => {
                      document.getElementById("contact")?.scrollIntoView({ behavior:"smooth" });
                      onClose();
                    }}
                  >
                    Learn more →
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="ind-modal-tagline">
                  {data.tagline.replace(/\.$/, "")}.<span className="ac"> </span>
                </div>
                <p className="ind-modal-desc">{data.detail}</p>
                <div className="ind-modal-metrics">
                  {data.metrics.map(({ v, l }) => (
                    <div key={l} className="ind-metric">
                      <div className="ind-metric-v">{v}</div>
                      <div className="ind-metric-l">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="ind-modal-benefits">
                  {data.benefits.map((b) => (
                    <div key={b} className="ind-benefit">
                      {b}
                    </div>
                  ))}
                </div>
                <div className="ind-modal-cta">
                  <button className="ind-modal-btn-ghost" onClick={onClose}>
                    Close
                  </button>
                  <button
                    className="ind-modal-btn-primary"
                    onClick={() => {
                      document.getElementById("contact")?.scrollIntoView({ behavior:"smooth" });
                      onClose();
                    }}
                  >
                    Talk to us about {data.title} →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
