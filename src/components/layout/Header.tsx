import { Link } from 'react-router-dom';
import { Logo } from '../brand/Logo';
import './Header.css';

export function Header() {
  return (
    <header className="clic-header">
      <div className="container clic-header__inner">
        <Link to="/" className="clic-header__brand" aria-label="CLIC inicio">
          <Logo variant="black" height={26} />
          <span className="clic-header__tagline">studio pilates</span>
        </Link>
        <nav className="clic-header__nav">
          <a
            href="https://clientes.clicpilates.com"
            className="clic-header__login"
          >
            ¿Ya sos alumna? Ingresar
          </a>
        </nav>
      </div>
    </header>
  );
}
