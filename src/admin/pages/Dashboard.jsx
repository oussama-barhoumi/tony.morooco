import { useAdmin } from '../context/AdminContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
const STATUS_STYLES = {
  delivered: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  shipped:   'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  confirmed: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  pending:   'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div className="bg-[#111] border border-white/6 rounded-2xl p-6 hover:border-white/10 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
          {icon}
        </div>
      </div>
      <p className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-1">{label}</p>
      <p className="text-white text-3xl font-black tracking-tight">{value}</p>
      {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-white/50 text-xs font-semibold mb-1">{label}</p>
        <p className="text-white font-bold">{payload[0].value.toLocaleString()} DH</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { stats, orders } = useAdmin();
  const salesData = stats.salesData || [];
  const recent = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-black tracking-tight">Dashboard</h1>
        <p className="text-white/40 text-sm mt-0.5">Welcome back, Tony Original Morocco</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders" value={stats.totalOrders} sub="All time"
          accent="bg-[#B5232B]/15"
          icon={<svg className="w-5 h-5 text-[#B5232B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
        />
        <StatCard
          label="Revenue" value={`${stats.totalRevenue.toLocaleString()} DH`} sub="Excl. cancelled"
          accent="bg-emerald-500/15"
          icon={<svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Products" value={stats.totalProducts} sub={`${stats.totalProducts} in catalog`}
          accent="bg-purple-500/15"
          icon={<svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
        />
        <StatCard
          label="Customers" value={stats.totalCustomers} sub="Unique buyers"
          accent="bg-blue-500/15"
          icon={<svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-[#111] border border-white/6 rounded-2xl p-6">
          <p className="text-white font-bold mb-1">Revenue Overview</p>
          <p className="text-white/30 text-xs mb-6">Monthly revenue in DH</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B5232B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#B5232B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#B5232B" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-[#111] border border-white/6 rounded-2xl p-6">
          <p className="text-white font-bold mb-1">Orders per Month</p>
          <p className="text-white/30 text-xs mb-6">Volume by month</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#B5232B" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-[#111] border border-white/6 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/6 flex items-center justify-between">
          <div>
            <p className="text-white font-bold">Recent Orders</p>
            <p className="text-white/30 text-xs">Latest 5 orders</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/4">
                {['Order ID', 'Customer', 'City', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-white/30 text-[10px] font-bold tracking-widest uppercase px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((order, i) => (
                <tr key={order.id} className={`border-b border-white/3 hover:bg-white/2 transition-colors ${i === recent.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-6 py-4 text-white/60 text-xs font-mono">{order.id}</td>
                  <td className="px-6 py-4 text-white text-sm font-medium">{order.customer}</td>
                  <td className="px-6 py-4 text-white/50 text-sm">{order.city}</td>
                  <td className="px-6 py-4 text-white text-sm font-bold">{order.total.toLocaleString()} DH</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/40 text-xs">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
