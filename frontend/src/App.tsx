import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';

// Tidak ada Header global — tiap halaman punya header sendiri
// Layout: sidebar kiri + konten kanan full-height tanpa padding
export default function App() {
  return (
    <div className="flex h-screen bg-[#0A0F24] text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
