import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import api from '../../api';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'admin', is_active: true };

function UserForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? {
    name: initial.name || '',
    email: initial.email || '',
    password: '', // blank by default when editing
    role: initial.role || 'admin',
    is_active: initial.is_active !== undefined ? !!initial.is_active : true
  } : EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || (!initial && !form.password)) {
      alert('Please fill out all required fields');
      return;
    }
    setLoading(true);
    try {
      if (initial) {
        // Only pass password if it was entered
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/users/${initial._id}`, payload);
      } else {
        await api.post('/users', form);
      }
      onSave();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error occurred saving user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onCancel}>
      <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-md my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-black text-lg mb-6">{initial ? 'Edit User' : 'Add User'}</h3>
        <div className="space-y-4">
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Full Name *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Amina Alaoui" className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
          </div>
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Email Address *</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="e.g. amina@tonyoriginal.ma" className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
          </div>
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">{initial ? 'New Password (Leave blank to keep current)' : 'Password *'}</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Password" className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Role</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-3 py-2.5 text-sm outline-none">
                <option value="super_admin" className="bg-[#111]">Super Admin</option>
                <option value="admin" className="bg-[#111]">Admin</option>
                <option value="editor" className="bg-[#111]">Editor</option>
              </select>
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="w-4 h-4 accent-[#B5232B]" />
                <span className="text-white/60 text-sm font-semibold">Active Account</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-bold transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 rounded-xl bg-[#B5232B] hover:bg-[#9a1c23] text-white text-sm font-bold transition-all disabled:opacity-50">
            {loading ? 'Saving...' : 'Save User'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Users() {
  const { users, refreshData } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      refreshData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-black tracking-tight">Users & Roles</h1>
          <p className="text-white/40 text-sm mt-0.5">{users.length} system administrators/editors</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-[#B5232B] hover:bg-[#9a1c23] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full bg-[#111] border border-white/8 text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all"
        />
      </div>

      {/* Users list */}
      <div className="bg-[#111] border border-white/6 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-white/30">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/4 text-white/30 text-[10px] font-bold tracking-widest uppercase">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Role</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4 text-white text-sm font-semibold">{u.name}</td>
                    <td className="px-5 py-4 text-white/50 text-xs">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        u.role === 'super_admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                        u.role === 'admin' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                        'bg-white/5 text-white/50 border border-white/10'
                      }`}>
                        {u.role ? u.role.replace('_', ' ') : 'Editor'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[9px] font-bold uppercase ${u.is_active ? 'text-emerald-400' : 'text-white/30'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 flex gap-2">
                      <button onClick={() => { setEditing(u); setShowForm(true); }} className="text-white/40 hover:text-white text-xs font-bold transition-all">Edit</button>
                      <button onClick={() => handleDelete(u._id)} className="text-red-400/50 hover:text-red-400 text-xs font-bold transition-all">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <UserForm
          initial={editing}
          onSave={() => { setShowForm(false); setEditing(null); refreshData(); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
