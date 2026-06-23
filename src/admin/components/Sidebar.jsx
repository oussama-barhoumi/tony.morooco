import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';

// Sidebar nav items
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
  )},
  { id: 'orders', label: 'Orders', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
  )},
  { id: 'products', label: 'Products', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
  )},
  { id: 'customers', label: 'Customers', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  )},
];

export default function Sidebar({ active, onNav, mobileOpen, onClose }) {
  const { logout } = useAdmin();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0d0d0d] border-r border-white/6 flex flex-col z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Brand */}
        <div className="p-6 border-b border-white/6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#B5232B] rounded-xl flex items-center justify-center shadow-lg shadow-[#B5232B]/30 flex-shrink-0">
              <span className="text-white font-black text-sm">T</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Tony Original</p>
              <p className="text-white/35 text-[10px] font-semibold tracking-wider uppercase">Morocco</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-white/25 text-[9px] font-bold tracking-[0.2em] uppercase px-3 mb-3">Menu</p>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onNav(item.id); onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${
                active === item.id
                  ? 'bg-[#B5232B] text-white shadow-lg shadow-[#B5232B]/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom: user + logout */}
        <div className="p-4 border-t border-white/6">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#B5232B]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[#B5232B] text-xs font-bold">A</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">Admin</p>
              <p className="text-white/30 text-[10px]">tony2026</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 text-sm font-medium transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
