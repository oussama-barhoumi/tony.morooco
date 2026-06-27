import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import api from '../../api';

const EMPTY_FORM = { title: '', description: '', icon: 'Sparkles', sort_order: '0', is_active: true };
const ICONS = ['Sparkles', 'Phone', 'ShoppingBag', 'Truck', 'Shield', 'RotateCcw', 'Star', 'Heart'];

function FeatureForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? {
    title: initial.title || '',
    description: initial.description || '',
    icon: initial.icon || 'Sparkles',
    sort_order: initial.sort_order !== undefined ? String(initial.sort_order) : '0',
    is_active: initial.is_active !== undefined ? !!initial.is_active : true
  } : EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (initial) {
        await api.put(`/features/${initial._id}`, form);
      } else {
        await api.post('/features', form);
      }
      onSave();
    } catch (err) {
      console.error(err);
      alert('Failed to save feature');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onCancel}>
      <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-lg my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-black text-lg mb-6">{initial ? 'Edit Feature' : 'Add Feature'}</h3>
        <div className="space-y-4">
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Feature Title</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Free Shipping" className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
          </div>
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Short description..." rows={3} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Icon</label>
              <select value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-3 py-2.5 text-sm outline-none">
                {ICONS.map(i => <option key={i} value={i} className="bg-[#111]">{i}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: e.target.value})} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none" />
            </div>
          </div>
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="w-4 h-4 accent-[#B5232B]" />
              <span className="text-white/60 text-sm font-semibold">Active</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-bold transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 rounded-xl bg-[#B5232B] hover:bg-[#9a1c23] text-white text-sm font-bold transition-all disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Feature'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Features() {
  const { features, refreshData } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;
    try {
      await api.delete(`/features/${id}`);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-black tracking-tight">Features</h1>
          <p className="text-white/40 text-sm mt-0.5">{features.length} homepage features configured</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-[#B5232B] hover:bg-[#9a1c23] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Feature
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map(f => (
          <div key={f._id} className="bg-[#111] border border-white/6 rounded-2xl p-6 hover:border-white/10 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#B5232B]/15 flex items-center justify-center">
                  <span className="text-[#B5232B] font-bold text-xs">{f.icon[0]}</span>
                </div>
                <span className={`text-[8px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                  f.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/40'
                }`}>
                  {f.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <h3 className="text-white font-bold text-base mb-1">{f.title}</h3>
                <p className="text-white/30 text-[9px] font-bold tracking-wider uppercase font-mono">Icon: {f.icon} · Order: {f.sort_order}</p>
                <p className="text-white/50 text-xs font-light mt-2">{f.description}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-6 pt-4 border-t border-white/5">
              <button onClick={() => { setEditing(f); setShowForm(true); }} className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold transition-all">Edit</button>
              <button onClick={() => handleDelete(f._id)} className="flex-1 py-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-400/60 hover:text-red-400 text-xs font-bold transition-all">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <FeatureForm
          initial={editing}
          onSave={() => { setShowForm(false); setEditing(null); refreshData(); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
