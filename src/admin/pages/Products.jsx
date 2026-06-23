import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';

const CATEGORIES = ['T-Shirts', 'Hoodies', 'Pants', 'Accessories'];
const SIZES = ['S', 'M', 'L', 'XL', 'One Size'];

const EMPTY_FORM = { name: '', category: 'T-Shirts', price: '', originalPrice: '', stock: '', sizes: ['M'], status: 'active', description: '', image: '' };

function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const toggle = (field, val) => setForm(f => ({
    ...f,
    [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val]
  }));

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onCancel}>
      <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-xl my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-black text-lg">{initial ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onCancel} className="text-white/30 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Product Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Tony Signature Tee" className="w-full bg-white/5 border border-white/8 text-white placeholder-white/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
          </div>
          {/* Description */}
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description..." rows={3} className="w-full bg-white/5 border border-white/8 text-white placeholder-white/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all resize-none" />
          </div>
          {/* Category + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all">
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all">
                <option value="active" className="bg-[#111]">Active</option>
                <option value="out_of_stock" className="bg-[#111]">Out of Stock</option>
                <option value="draft" className="bg-[#111]">Draft</option>
              </select>
            </div>
          </div>
          {/* Price + Original Price + Stock */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Sale Price (DH)', key: 'price', ph: '550' },
              { label: 'Original (DH)', key: 'originalPrice', ph: '800' },
              { label: 'Stock Qty', key: 'stock', ph: '24' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">{f.label}</label>
                <input type="number" value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.ph} className="w-full bg-white/5 border border-white/8 text-white placeholder-white/20 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
              </div>
            ))}
          </div>
          {/* Sizes */}
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-2">Sizes</label>
            <div className="flex gap-2 flex-wrap">
              {SIZES.map(s => (
                <button key={s} type="button" onClick={() => toggle('sizes', s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${form.sizes.includes(s) ? 'bg-[#B5232B] text-white' : 'bg-white/5 text-white/40 border border-white/8 hover:text-white'}`}>{s}</button>
              ))}
            </div>
          </div>
          {/* Image URL */}
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Image URL</label>
            <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="/CAROUSEL%20IMG/your-image.png" className="w-full bg-white/5 border border-white/8 text-white placeholder-white/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-bold transition-all">Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 py-3 rounded-xl bg-[#B5232B] hover:bg-[#9a1c23] text-white text-sm font-bold transition-all shadow-lg shadow-[#B5232B]/20">
            {initial ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

const STATUS_STYLES = {
  active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  out_of_stock: 'bg-red-500/10 text-red-400 border border-red-500/20',
  draft: 'bg-white/5 text-white/40 border border-white/10',
};

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleSave = (form) => {
    if (editing) { updateProduct(editing.id, form); setEditing(null); }
    else { addProduct(form); setShowForm(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-black tracking-tight">Products</h1>
          <p className="text-white/40 text-sm mt-0.5">{products.length} items in catalog</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#B5232B] hover:bg-[#9a1c23] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#B5232B]/20">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Product
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-[#111] border border-white/6 rounded-2xl overflow-hidden hover:border-white/10 transition-all group">
            {/* Image */}
            <div className="aspect-[4/3] bg-[#0d0d0d] relative overflow-hidden flex items-center justify-center">
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="text-white/10">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              <span className={`absolute top-3 right-3 text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${STATUS_STYLES[product.status]}`}>
                {product.status.replace('_', ' ')}
              </span>
            </div>
            {/* Info */}
            <div className="p-5">
              <p className="text-white/30 text-[10px] font-bold tracking-widest uppercase mb-1">{product.category}</p>
              <h3 className="text-white font-bold text-base mb-2">{product.name}</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-white font-black text-lg">{Number(product.price).toLocaleString()} DH</span>
                {product.originalPrice && <span className="text-white/25 text-sm line-through">{Number(product.originalPrice).toLocaleString()} DH</span>}
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/40 text-xs">{product.stock} in stock</span>
                <div className="flex gap-1">
                  {product.sizes?.map(s => (
                    <span key={s} className="text-white/30 text-[9px] border border-white/8 rounded px-1.5 py-0.5 font-semibold">{s}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(product)} className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold transition-all">Edit</button>
                <button onClick={() => setDeleteConfirm(product)} className="flex-1 py-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-400/60 hover:text-red-400 text-xs font-bold transition-all">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Forms + Modals */}
      {(showForm || editing) && (
        <ProductForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-white font-black text-lg mb-1">Delete Product?</h3>
            <p className="text-white/40 text-sm mb-6">"{deleteConfirm.name}" will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-bold transition-all">Cancel</button>
              <button onClick={() => { deleteProduct(deleteConfirm.id); setDeleteConfirm(null); }} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
