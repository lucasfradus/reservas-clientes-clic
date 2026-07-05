import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { initAnalytics, trackPageView } from '../../lib/analytics';
import { trackMetaPageView } from '../../lib/meta';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

function AnalyticsTracker() {
  const { pathname, search } = useLocation();
  const metaFirstRender = useRef(true);

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(pathname + search);
    // Meta: el PageView inicial ya lo dispara index.html; solo trackeamos
    // las navegaciones siguientes para no duplicar la primera pantalla.
    if (metaFirstRender.current) {
      metaFirstRender.current = false;
    } else {
      trackMetaPageView();
    }
  }, [pathname, search]);

  return null;
}

export function PageShell() {
  return (
    <>
      <ScrollToTop />
      <AnalyticsTracker />
      <Header />
      <main className="page">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
