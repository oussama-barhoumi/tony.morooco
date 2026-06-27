import { useState } from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Banners from './pages/Banners';
import Settings from './pages/Settings';
import Categories from './pages/Categories';
import Collections from './pages/Collections';
import Brands from './pages/Brands';
import FAQs from './pages/FAQs';
import Features from './pages/Features';
import Testimonials from './pages/Testimonials';
import Users from './pages/Users';
import HomepageCMS from './pages/HomepageCMS';

const PAGES = {
  dashboard: Dashboard,
  orders: Orders,
  products: Products,
  categories: Categories,
  collections: Collections,
  brands: Brands,
  customers: Customers,
  users: Users,
  homepagecms: HomepageCMS,
  banners: Banners,
  testimonials: Testimonials,
  faqs: FAQs,
  features: Features,
  settings: Settings
};

function AdminShell() {
  const { isAuthenticated } = useAdmin();
  const [activePage, setActivePage] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) return <Login />;

  const PageComponent = PAGES[activePage] || Dashboard;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar
        active={activePage}
        onNav={setActivePage}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/6 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-white/40 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <h2 className="text-white font-bold capitalize text-sm">{activePage}</h2>
              <p className="text-white/25 text-[10px] hidden sm:block">Tony Original Morocco — Admin</p>
            </div>
          </div>
          {/* Live store link */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/8 border border-white/8 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            <span className="hidden sm:inline">View Store</span>
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          <PageComponent />
        </main>
      </div>
    </div>
  );
}

export default function AdminApp() {
  return (
    <AdminProvider>
      <AdminShell />
    </AdminProvider>
  );
}
