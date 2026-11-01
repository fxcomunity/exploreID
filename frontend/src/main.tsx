import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/Map';
import Environment from './pages/Environment';
import EconomicMonitor from './pages/EconomicMonitor';
import ComingSoon from './components/ComingSoon';
import 'maplibre-gl/dist/maplibre-gl.css';
import './index.css';

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: '/',              element: <Landing /> },
      { path: '/intelligence',  element: <Home /> },
      { path: '/dashboard',     element: <Dashboard /> },
      { path: '/map',           element: <MapPage /> },
      { path: '/lingkungan',    element: <Environment /> },
      { path: '/ekonomi',       element: <EconomicMonitor /> },
      { path: '/geopolitik',    element: <ComingSoon title="Geopolitical Monitor" badge="GEOPOLITIK" /> },
      { path: '/bencana',       element: <ComingSoon title="Disaster Monitor" badge="BENCANA" /> },
      { path: '/energi',        element: <ComingSoon title="Energy Monitor" badge="ENERGI" /> },
      { path: '/teknologi',     element: <ComingSoon title="Technology & Science Monitor" badge="TEKNOLOGI" /> },
      { path: '/transportasi',  element: <ComingSoon title="Transport Monitor" badge="TRANSPORTASI" /> },
      { path: '/data',          element: <ComingSoon title="Data Explorer" badge="DATABASE" /> },
      { path: '/notifikasi',    element: <ComingSoon title="Notification Center" badge="NOTIFIKASI" /> },
      { path: '/pengaturan',    element: <ComingSoon title="Pengaturan Sistem" badge="KONFIGURASI" /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RouterProvider router={router} />
);
