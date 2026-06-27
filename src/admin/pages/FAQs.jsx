import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import api from '../../api';

const EMPTY_FORM = { question: '', answer: '', sort_order: '0', is_active: true };

function FAQForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? {
    question: initial.question || '',
    answer: initial.answer || '',
    sort_order: initial.sort_order !== undefined ? String(initial.sort_order) : '0',
    is_active: initial.is_active !== undefined ? !!initial.is_active : true
  } : EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (initial) {
        await api.put(`/faqs/${initial._id}`, form);
      } else {
        await api.post('/faqs', form);
      }
      onSave();
    } catch (err) {
      console.error(err);
      alert('Failed to save FAQ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onCancel}>
      <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-lg my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-black text-lg mb-6">{initial ? 'Edit FAQ' : 'Add FAQ'}</h3>
        <div className="space-y-4">
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Question</label>
            <input value={form.question} onChange={e => setForm({...form, question: e.target.value})} placeholder="e.g. How long does shipping take?" className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
          </div>
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Answer</label>
            <textarea value={form.answer} onChange={e => setForm({...form, answer: e.target.value})} placeholder="Write detailed answer..." rows={4} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: e.target.value})} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none" />
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="w-4 h-4 accent-[#B5232B]" />
                <span className="text-white/60 text-sm font-semibold">Active</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-bold transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 rounded-xl bg-[#B5232B] hover:bg-[#9a1c23] text-white text-sm font-bold transition-all disabled:opacity-50">
            {loading ? 'Saving...' : 'Save FAQ'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FAQs() {
  const { faqs, refreshData } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await api.delete(`/faqs/${id}`);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-black tracking-tight">FAQs</h1>
          <p className="text-white/40 text-sm mt-0.5">{faqs.length} FAQ questions configured</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-[#B5232B] hover:bg-[#9a1c23] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add FAQ
        </button>
      </div>

      <div className="space-y-3">
        {faqs.map(faq => (
          <div key={faq._id} className="bg-[#111] border border-white/6 rounded-2xl p-6 hover:border-white/10 transition-all flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold bg-[#B5232B]/10 text-[#B5232B] px-2 py-0.5 rounded uppercase font-mono">Order: {faq.sort_order}</span>
                <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                  faq.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/40'
                }`}>
                  {faq.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 className="text-white font-bold text-base">{faq.question}</h3>
              <p className="text-white/60 text-sm font-light whitespace-pre-wrap">{faq.answer}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => { setEditing(faq); setShowForm(true); }} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              <button onClick={() => handleDelete(faq._id)} className="p-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <FAQForm
          initial={editing}
          onSave={() => { setShowForm(false); setEditing(null); refreshData(); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
