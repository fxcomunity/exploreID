import { NavLink } from 'react-router-dom';
import {
  Globe,
  Map,
  BarChart2,
  CloudLightning,
  Leaf,
  Zap,
  Cpu,
  Truck,
  Flag,
  Database,
  Bell,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/',            label: 'Country Intel',    icon: Flag,           section: 'MONITOR' },
  { path: '/dashboard',  label: 'Global Dashboard', icon: Globe,          section: 'MONITOR' },
  { path: '/map',        label: 'Live World Map',   icon: Map,            section: 'MONITOR' },
  { path: '/geopolitik', label: 'Geopolitik',       icon: ShieldAlert,    section: 'MONITOR' },
  { path: '/ekonomi',    label: 'Ekonomi',          icon: BarChart2,      section: 'ANALITIK' },
  { path: '/bencana',    label: 'Bencana',          icon: CloudLightning, section: 'ANALITIK' },
  { path: '/lingkungan', label: 'Lingkungan',       icon: Leaf,           section: 'ANALITIK' },
  { path: '/energi',     label: 'Energi',           icon: Zap,            section: 'ANALITIK' },
  { path: '/teknologi',  label: 'Teknologi & Sains',icon: Cpu,            section: 'ANALITIK' },
  { path: '/transportasi',label: 'Transportasi',    icon: Truck,          section: 'ANALITIK' },
  { path: '/data',       label: 'Data Explorer',    icon: Database,       section: 'SISTEM' },
  { path: '/notifikasi', label: 'Notifikasi',       icon: Bell,           section: 'SISTEM' },
  { path: '/pengaturan', label: 'Pengaturan',       icon: Settings,       section: 'SISTEM' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const sections = ['MONITOR', 'ANALITIK', 'SISTEM'] as const;

  return (
    <aside
      className={`flex flex-col bg-[#060D1F] border-r border-cyan-900/50 transition-all duration-300 ${
        collapsed ? 'w-14' : 'w-56'
      } min-h-screen`}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-cyan-900/50 py-4 ${collapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}>
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center flex-shrink-0">
          <Globe className="w-4 h-4 text-cyan-400" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white text-sm font-bold leading-tight">WORLD</div>
            <div className="text-cyan-400 text-xs font-bold tracking-widest leading-tight">MONITOR</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-none">
        {sections.map(section => {
          const items = navItems.filter(n => n.section === section);
          return (
            <div key={section} className="mb-2">
              {!collapsed && (
                <div className="px-4 pt-3 pb-1 text-gray-600 text-xs font-bold tracking-widest">
                  {section}
                </div>
              )}
              {collapsed && <div className="border-t border-cyan-900/30 mx-2 my-2" />}
              {items.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 mx-2 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-150 group ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                          : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                      } ${collapsed ? 'justify-center' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                        {!collapsed && isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-cyan-900/50 p-2">
        <button
          onClick={() => setCollapsed(c => !c)}
          className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5 transition text-xs ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Ciutkan</span></>}
        </button>
        {!collapsed && (
          <div className="px-2 pb-1 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs">Sistem Online</span>
            </div>
            <div className="text-gray-700 text-xs mt-0.5">v1.0.0 · API: OK</div>
          </div>
        )}
      </div>
    </aside>
  );
}
