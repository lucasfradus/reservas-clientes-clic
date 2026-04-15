import { Iso } from '../brand/Iso';
import './Footer.css';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="clic-footer">
      <div className="container clic-footer__inner">
        <div className="clic-footer__brand">
          <Iso variant="taupe" size={28} />
          <span className="clic-footer__name">CLIC studio pilates</span>
        </div>
        <p className="clic-footer__copy">© {year} CLIC. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
