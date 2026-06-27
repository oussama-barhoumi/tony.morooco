import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import api from '../../api';

const EMPTY_FORM = { author_name: '', content: '', rating: '5', is_active: true };

function TestimonialForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? {
    author_name: initial.author_name || '',
    content: initial.content || '',
    rating: initial.rating !== undefined ? String(initial.rating) : '5',
    is_active: initial.is_active !== undefined ? !!initial.is_active : true
  } : EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (initial) {
        await api.put(`/content/testimonials/${initial._id}`, form);
      } else {
        await api.post('/content/testimonials', form);
      }
      onSave();
    } catch (err) {
      console.error(err);
      alert('Failed to save testimonial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onCancel}>
      <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-lg my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-black text-lg mb-6">{initial ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
        <div className="space-y-4">
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Author Name</label>
            <input value={form.author_name} onChange={e => setForm({...form, author_name: e.target.value})} placeholder="e.g. Youssef Benjelloun" className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
          </div>
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Rating (1-5 Stars)</label>
            <select value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-3 py-2.5 text-sm outline-none">
              {['1', '2', '3', '4', '5'].map(num => <option key={num} value={num} className="bg-[#111]">{num} Stars</option>)}
            </select>
          </div>
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Content/Review</label>
            <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Review text..." rows={4} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all resize-none" />
          </div>
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="w-4 h-4 accent-[#B5232B]" />
              <span className="text-white/60 text-sm font-semibold">Active (Display on Home page)</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-bold transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 rounded-xl bg-[#B5232B] hover:bg-[#9a1c23] text-white text-sm font-bold transition-all disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Testimonial'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const { testimonials, refreshData } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await api.delete(`/content/testimonials/${id}`);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-black tracking-tight">Testimonials</h1>
          <p className="text-white/40 text-sm mt-0.5">{testimonials.length} reviews configured</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-[#B5232B] hover:bg-[#9a1c23] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {testimonials.map(t => (
          <div key={t._id} className="bg-[#111] border border-white/6 rounded-2xl p-6 hover:border-white/10 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5 text-[#C9A24B]">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <span key={i} className="text-sm">★</span>
                  ))}
                </div>
                <span className={`text-[8px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                  t.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/40 border border-white/10'
                }`}>
                  {t.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-white text-sm font-light italic leading-relaxed">"{t.content}"</p>
            </div>
            <div className="mt-6">
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider mb-4">— {t.author_name}</p>
              <div className="flex gap-2 pt-4 border-t border-white/5">
                <button onClick={() => { setEditing(t); setShowForm(true); }} className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold transition-all">Edit</button>
                <button onClick={() => handleDelete(t._id)} className="flex-1 py-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-400/60 hover:text-red-400 text-xs font-bold transition-all">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <TestimonialForm
          initial={editing}
          onSave={() => { setShowForm(false); setEditing(null); refreshData(); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
