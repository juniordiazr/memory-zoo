const Awning = ({ footer = false }) => (
  <div className={`awning ${footer ? 'awning-footer' : ''}`} aria-hidden="true">
    <div className="awning-stripes">{Array.from({ length: 80 }, (_, i) => <span key={i} />)}</div>
    {!footer && <img className="logo" src="/zoo/logo.png" alt="" width="172" height="172" />}
  </div>
);
export const ZooHeader = () => (
  <header className="zoo-header">
    <Awning />
    <nav className="nav" aria-label="Menú principal">
      <a className="active" href="#juego" aria-current="page">Memory Zoo</a>
      <a href="https://www.instagram.com/zoogelatos/" target="_blank" rel="noopener noreferrer">Experiencia Zoo</a>
      <a className="nav-cta" href="https://wa.me/56987124317" target="_blank" rel="noopener noreferrer">Cotiza tu evento</a>
    </nav>
  </header>
);
export const ZooFooter = () => (
  <footer className="zoo-footer">
    <div className="footer-copy">
      <p className="brand">Zoo Gelato &amp; Coffee</p>
      <p>@zoogelatos · Eventos en Santiago</p>
      <div className="contact-links">
        <a href="mailto:contacto@zoogelatos.cl">contacto@zoogelatos.cl</a>
        <a href="https://wa.me/56987124317" target="_blank" rel="noopener noreferrer">WhatsApp +56 9 8712 4317</a>
      </div>
    </div>
    <Awning footer />
  </footer>
);
