import { useState, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import api from '../../api';

const EMPTY_FORM = { name: '', description: '', image: null, is_active: true };

function BrandForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? {
    name: initial.name || '',
    description: initial.description || '',
    is_active: initial.is_active !== undefined ? !!initial.is_active : true,
    image: null
  } : EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('is_active', form.is_active);
    if (form.image instanceof File) {
      formData.append('image', form.image);
    }

    try {
      if (initial) {
        await api.put(`/brands/${initial._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/brands', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      onSave();
    } catch (err) {
      console.error('Save failed', err);
      alert(err.response?.data?.message || 'Error saving brand');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onCancel}>
      <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-md my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-black text-lg mb-6">{initial ? 'Edit Brand' : 'Add Brand'}</h3>
        <div className="space-y-4">
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Brand Name</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Tony Original" className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
          </div>
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Short description..." rows={3} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all resize-none" />
          </div>
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Brand Logo</label>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setForm({...form, image: e.target.files[0]})} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2 text-sm outline-none" />
            {initial && initial.logo_url && !form.image && (
              <p className="text-white/45 text-xs mt-1.5 truncate">Current logo: {initial.logo_url}</p>
            )}
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
            {loading ? 'Saving...' : 'Save Brand'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Brands() {
  const { brands, refreshData } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const backendUrl = api.defaults.baseURL.replace('/api', '');
    return `${backendUrl}${url}`;
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      await api.delete(`/brands/${id}`);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-black tracking-tight">Brands</h1>
          <p className="text-white/40 text-sm mt-0.5">{brands.length} brands configured</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-[#B5232B] hover:bg-[#9a1c23] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Brand
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map(b => (
          <div key={b._id} className="bg-[#111] border border-white/6 rounded-2xl overflow-hidden hover:border-white/10 transition-all flex flex-col justify-between">
            <div className="aspect-[16/9] bg-[#0d0d0d] relative overflow-hidden flex items-center justify-center p-6">
              {b.logo_url ? (
                <img src={getImageUrl(b.logo_url)} alt={b.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-white/10">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              <span className={`absolute top-3 right-3 text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${
                b.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/40 border border-white/10'
              }`}>
                {b.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-white font-bold text-lg mb-1">{b.name}</h3>
                <p className="text-[#B5232B] text-xs font-mono mb-3">/{b.slug}</p>
                <p className="text-white/50 text-xs line-clamp-2 mb-4 font-light">{b.description || 'No description provided.'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(b); setShowForm(true); }} className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold transition-all">Edit</button>
                <button onClick={() => handleDelete(b._id)} className="flex-1 py-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-400/60 hover:text-red-400 text-xs font-bold transition-all">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <BrandForm
          initial={editing}
          onSave={() => { setShowForm(false); setEditing(null); refreshData(); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
