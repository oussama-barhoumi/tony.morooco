import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';

const STATUS_STYLES = {
  delivered: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  shipped:   'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  confirmed: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  pending:   'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const ALL_STATUSES = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function Orders() {
  const { orders, updateOrderStatus } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = orders.filter(o => {
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-black tracking-tight">Orders</h1>
        <p className="text-white/40 text-sm mt-0.5">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by customer, ID, city..."
            className="w-full bg-[#111] border border-white/8 text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold tracking-wide uppercase transition-all ${
                filterStatus === s ? 'bg-[#B5232B] text-white' : 'bg-[#111] border border-white/8 text-white/40 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-white/6 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/4 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <p className="text-white/40 font-semibold">No orders found</p>
            <p className="text-white/20 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/4">
                  {['Order', 'Customer', 'Phone', 'City', 'Products', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left text-white/30 text-[10px] font-bold tracking-widest uppercase px-5 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => (
                  <tr key={order.id} className={`border-b border-white/3 hover:bg-white/2 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                    <td className="px-5 py-4 text-white/50 text-xs font-mono whitespace-nowrap">{order.id}</td>
                    <td className="px-5 py-4 text-white text-sm font-semibold whitespace-nowrap">{order.customer}</td>
                    <td className="px-5 py-4 text-white/50 text-xs whitespace-nowrap">{order.phone}</td>
                    <td className="px-5 py-4 text-white/50 text-sm whitespace-nowrap">{order.city}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        {order.products.map((p, j) => (
                          <span key={j} className="text-white/50 text-xs whitespace-nowrap">{p}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white font-bold text-sm whitespace-nowrap">{order.total.toLocaleString()} DH</td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white/30 text-xs whitespace-nowrap">{order.date}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelected(order)}
                        className="text-[#B5232B] hover:text-white text-xs font-bold tracking-wide transition-colors whitespace-nowrap"
                      >
                        Manage →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-black text-lg">{selected.id}</h3>
                <p className="text-white/30 text-xs">{selected.date}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {[
                { label: 'Customer', value: selected.customer },
                { label: 'Phone', value: selected.phone },
                { label: 'Address', value: `${selected.address}, ${selected.city}` },
                { label: 'Total', value: `${selected.total.toLocaleString()} DH` },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-start border-b border-white/4 pb-3">
                  <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">{row.label}</span>
                  <span className="text-white text-sm font-medium text-right max-w-[60%]">{row.value}</span>
                </div>
              ))}
              <div className="border-b border-white/4 pb-3">
                <span className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-2">Products</span>
                {selected.products.map((p, i) => (
                  <p key={i} className="text-white text-sm">• {p}</p>
                ))}
              </div>
            </div>

            {/* Status Update */}
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Update Status</p>
              <div className="grid grid-cols-3 gap-2">
                {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                  <button
                    key={s}
                    onClick={() => { updateOrderStatus(selected.id, s); setSelected(prev => ({ ...prev, status: s })); }}
                    className={`py-2 px-3 rounded-xl text-[10px] font-bold tracking-wide uppercase transition-all ${
                      selected.status === s ? 'bg-[#B5232B] text-white' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
