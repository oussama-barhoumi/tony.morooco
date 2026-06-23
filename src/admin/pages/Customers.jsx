import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';

export default function Customers() {
  const { customers, orders } = useAdmin();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  const getCustomerOrders = (name) => orders.filter(o => o.customer === name);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-black tracking-tight">Customers</h1>
        <p className="text-white/40 text-sm mt-0.5">{customers.length} registered customers</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone, city..."
          className="w-full bg-[#111] border border-white/8 text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-white/6 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 rounded-2xl bg-white/4 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <p className="text-white/40 font-semibold">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/4">
                  {['ID', 'Name', 'Phone', 'City', 'Orders', 'Total Spent', 'Last Order', 'Actions'].map(h => (
                    <th key={h} className="text-left text-white/30 text-[10px] font-bold tracking-widest uppercase px-5 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer, i) => (
                  <tr key={customer.id} className={`border-b border-white/3 hover:bg-white/2 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                    <td className="px-5 py-4 text-white/40 text-xs font-mono">{customer.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#B5232B]/15 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#B5232B] text-xs font-black">{customer.name[0]}</span>
                        </div>
                        <span className="text-white text-sm font-semibold whitespace-nowrap">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/50 text-xs whitespace-nowrap">{customer.phone}</td>
                    <td className="px-5 py-4 text-white/50 text-sm whitespace-nowrap">{customer.city}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="bg-white/8 text-white/70 text-xs font-bold rounded-full px-2.5 py-1">{customer.orders}</span>
                    </td>
                    <td className="px-5 py-4 text-white font-bold text-sm whitespace-nowrap">{customer.totalSpent.toLocaleString()} DH</td>
                    <td className="px-5 py-4 text-white/30 text-xs whitespace-nowrap">{customer.lastOrder}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelected(customer)}
                        className="text-[#B5232B] hover:text-white text-xs font-bold tracking-wide transition-colors whitespace-nowrap"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#B5232B]/15 flex items-center justify-center">
                  <span className="text-[#B5232B] text-lg font-black">{selected.name[0]}</span>
                </div>
                <div>
                  <h3 className="text-white font-black text-lg">{selected.name}</h3>
                  <p className="text-white/30 text-xs">{selected.id}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Phone', value: selected.phone },
                { label: 'City', value: selected.city },
                { label: 'Total Orders', value: selected.orders },
                { label: 'Total Spent', value: `${selected.totalSpent.toLocaleString()} DH` },
              ].map(row => (
                <div key={row.label} className="bg-white/3 rounded-xl p-4">
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">{row.label}</p>
                  <p className="text-white font-bold text-sm">{row.value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Order History</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getCustomerOrders(selected.name).length === 0 ? (
                  <p className="text-white/25 text-sm">No orders found</p>
                ) : getCustomerOrders(selected.name).map(o => (
                  <div key={o.id} className="bg-white/3 rounded-xl px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-semibold">{o.id}</p>
                      <p className="text-white/30 text-xs">{o.date} · {o.products.join(', ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">{o.total.toLocaleString()} DH</p>
                      <span className="text-[10px] text-white/40 capitalize">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
