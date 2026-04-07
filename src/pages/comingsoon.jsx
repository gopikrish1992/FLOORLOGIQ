export default function ComingSoon() {
  return (
    <section id="coming-soon" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "900px", width: "100%", textAlign: "center" }}>
        <div className="hero-badge" style={{ justifyContent: "center" }}>
          <span className="hbdot" />
          We're building something great
        </div>

        <h1 className="hero-h1" style={{ textAlign: "center" }}>
          Coming <span className="red">Soon.</span>
        </h1>

        <p className="hero-sub" style={{ textAlign: "center" }}>
          We're crafting something special. Check back soon for exciting updates.
        </p>

      </div>
    </section>
  );
}
