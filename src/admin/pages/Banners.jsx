import { useState, useEffect, useRef } from 'react';
import api from '../../api';

const EMPTY_FORM = { title: '', subtitle: '', cta_text: '', cta_link: '', image: null, is_active: 1 };

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await api.get('/content/banners');
      if (res.data.success) {
        setBanners(res.data.banners);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('subtitle', form.subtitle || '');
    formData.append('cta_text', form.cta_text || '');
    formData.append('cta_link', form.cta_link || '');
    formData.append('is_active', form.is_active);
    if (form.image instanceof File) {
      formData.append('image', form.image);
    }

    try {
      if (editing) {
        await api.put(`/content/banners/${editing.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/content/banners', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowForm(false);
      setEditing(null);
      fetchBanners();
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await api.delete(`/content/banners/${id}`);
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      title: b.title,
      subtitle: b.subtitle || '',
      cta_text: b.cta_text || '',
      cta_link: b.cta_link || '',
      is_active: b.is_active,
      image: null
    });
    setShowForm(true);
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const backendUrl = api.defaults.baseURL.replace('/api', '');
    return `${backendUrl}${url}`;
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-black tracking-tight">Banners</h1>
          <p className="text-white/40 text-sm mt-0.5">Manage homepage carousel banners</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }} className="flex items-center gap-2 bg-[#B5232B] hover:bg-[#9a1c23] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#B5232B]/20">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map(b => (
          <div key={b.id} className="bg-[#111] border border-white/6 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
            <div className="aspect-[21/9] bg-[#0d0d0d] relative">
              {b.image_url && <img src={getImageUrl(b.image_url)} alt={b.title} className="w-full h-full object-cover opacity-80" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                <h3 className="text-white font-bold text-lg leading-tight">{b.title}</h3>
                <p className="text-white/70 text-xs truncate mt-1">{b.subtitle}</p>
              </div>
            </div>
            <div className="p-4 flex gap-2">
              <button onClick={() => openEdit(b)} className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold transition-all">Edit</button>
              <button onClick={() => handleDelete(b.id)} className="flex-1 py-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-400/60 hover:text-red-400 text-xs font-bold transition-all">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-xl my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-black text-lg mb-6">{editing ? 'Edit Banner' : 'Add Banner'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Title</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
              </div>
              <div>
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Subtitle</label>
                <input value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">CTA Text</label>
                  <input value={form.cta_text} onChange={e => setForm({...form, cta_text: e.target.value})} placeholder="e.g. Shop Now" className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
                </div>
                <div>
                  <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">CTA Link</label>
                  <input value={form.cta_link} onChange={e => setForm({...form, cta_link: e.target.value})} placeholder="e.g. /products" className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Image</label>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setForm({...form, image: e.target.files[0]})} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
                {editing && !form.image && <p className="text-white/40 text-xs mt-2">Current: {editing.image_url}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked ? 1 : 0})} className="w-4 h-4 accent-[#B5232B]" />
                  <span className="text-white/60 text-sm font-semibold">Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-bold transition-all">Cancel</button>
              <button onClick={handleSubmit} disabled={saving} className="flex-1 py-3 rounded-xl bg-[#B5232B] hover:bg-[#9a1c23] text-white text-sm font-bold transition-all shadow-lg shadow-[#B5232B]/20 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
