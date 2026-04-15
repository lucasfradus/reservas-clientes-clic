import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

export function PageShell() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="page">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
