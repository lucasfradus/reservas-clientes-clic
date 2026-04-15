import { Routes, Route } from 'react-router-dom';
import { PageShell } from './components/layout/PageShell';
import Landing from './pages/Landing';
import Sede from './pages/Sede';
import Reservar from './pages/Reservar';
import Gracias from './pages/Gracias';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<PageShell />}>
        <Route path="/" element={<Landing />} />
        <Route path="/sede/:slug" element={<Sede />} />
        <Route path="/reservar/:claseId" element={<Reservar />} />
        <Route path="/gracias" element={<Gracias />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
