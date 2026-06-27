import { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import api from '../../api';

const SIZES = ['S', 'M', 'L', 'XL', 'One Size'];

const EMPTY_FORM = {
  name: '',
  category: '',
  brand: '',
  price: '',
  originalPrice: '',
  discount: '0',
  stock: '',
  sizes: ['M'],
  status: 'active',
  description: '',
  is_featured: false,
  is_bestseller: false,
  is_new_arrival: false,
  is_active: true,
  images: [], // File objects
  existingImages: [], // Image URLs
};

function ProductForm({ initial, onSave, onCancel }) {
  const { categories, brands } = useAdmin();
  
  const [form, setForm] = useState(EMPTY_FORM);
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize form when editing
  useEffect(() => {
    if (initial) {
      // Parse specifications
      const initialSpecs = [];
      if (initial.specifications) {
        // Specifications is a Map/Object
        Object.entries(initial.specifications).forEach(([key, value]) => {
          initialSpecs.push({ key, value });
        });
      }
      if (initialSpecs.length === 0) {
        initialSpecs.push({ key: '', value: '' });
      }
      setSpecs(initialSpecs);

      setForm({
        name: initial.name || '',
        category: initial.category ? (initial.category._id || initial.category) : '',
        brand: initial.brand ? (initial.brand._id || initial.brand) : '',
        price: initial.price || '',
        originalPrice: initial.original_price || '',
        discount: initial.discount || '0',
        stock: initial.stock !== undefined ? initial.stock : '',
        sizes: typeof initial.sizes === 'string' ? initial.sizes.split(',') : initial.sizes || [],
        status: initial.status || 'active',
        description: initial.description || '',
        is_featured: !!initial.is_featured,
        is_bestseller: !!initial.is_bestseller,
        is_new_arrival: !!initial.is_new_arrival,
        is_active: initial.is_active !== undefined ? !!initial.is_active : true,
        images: [],
        existingImages: initial.images || (initial.image_url ? [initial.image_url] : []),
      });
    } else {
      // Pick first category/brand as default if available
      setForm({
        ...EMPTY_FORM,
        category: categories[0]?._id || '',
        brand: brands[0]?._id || '',
      });
      setSpecs([{ key: '', value: '' }]);
    }
  }, [initial, categories, brands]);

  const handleTextChange = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
  };

  const handleToggleField = (field) => {
    setForm(f => ({ ...f, [field]: !f[field] }));
  };

  const handleSizeToggle = (size) => {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter(s => s !== size) : [...f.sizes, size]
    }));
  };

  // Specifications Handlers
  const handleSpecChange = (index, field, val) => {
    const updated = [...specs];
    updated[index][field] = val;
    setSpecs(updated);
  };

  const addSpecRow = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpecRow = (index) => setSpecs(specs.filter((_, i) => i !== index));

  // File Upload Handlers
  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setForm(f => ({ ...f, images: [...f.images, ...filesArray] }));
    }
  };

  const removeNewImage = (index) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const removeExistingImage = (url) => {
    setForm(f => ({ ...f, existingImages: f.existingImages.filter(x => x !== url) }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('category', form.category);
    formData.append('brand', form.brand);
    formData.append('price', form.price);
    formData.append('original_price', form.originalPrice);
    formData.append('discount', form.discount);
    formData.append('stock', form.stock);
    formData.append('status', form.status);
    formData.append('sizes', form.sizes.join(','));
    formData.append('is_featured', form.is_featured);
    formData.append('is_bestseller', form.is_bestseller);
    formData.append('is_new_arrival', form.is_new_arrival);
    formData.append('is_active', form.is_active);

    // Format specifications Map
    const specMap = {};
    specs.forEach(row => {
      if (row.key.trim() && row.value.trim()) {
        specMap[row.key.trim()] = row.value.trim();
      }
    });
    formData.append('specifications', JSON.stringify(specMap));

    // Existing images (merging updates)
    formData.append('existing_images', form.existingImages.join(','));

    // Append new files
    form.images.forEach(file => {
      formData.append('images', file);
    });

    try {
      if (initial) {
        await api.put(`/products/${initial.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      onSave();
    } catch (err) {
      console.error('Save failed', err);
      alert(err.response?.data?.message || 'Error occurred while saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onCancel}>
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-2xl my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-black text-lg">{initial ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onCancel} className="text-white/30 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-5">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Product Name</label>
              <input value={form.name} onChange={e => handleTextChange('name', e.target.value)} placeholder="Tony Signature Tee" className="w-full bg-white/5 border border-white/8 text-white placeholder-white/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Category</label>
                <select value={form.category} onChange={e => handleTextChange('category', e.target.value)} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all">
                  <option value="" className="bg-[#111]">Select Category</option>
                  {categories.map(c => <option key={c._id} value={c._id} className="bg-[#111]">{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Brand</label>
                <select value={form.brand} onChange={e => handleTextChange('brand', e.target.value)} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all">
                  <option value="" className="bg-[#111]">Select Brand</option>
                  {brands.map(b => <option key={b._id} value={b._id} className="bg-[#111]">{b.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => handleTextChange('description', e.target.value)} placeholder="Product description..." rows={3} className="w-full bg-white/5 border border-white/8 text-white placeholder-white/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all resize-none" />
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Sale Price (DH)</label>
              <input type="number" value={form.price} onChange={e => handleTextChange('price', e.target.value)} placeholder="550" className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-3 py-2.5 text-sm outline-none" />
            </div>
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Original (DH)</label>
              <input type="number" value={form.originalPrice} onChange={e => handleTextChange('originalPrice', e.target.value)} placeholder="800" className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-3 py-2.5 text-sm outline-none" />
            </div>
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Discount (%)</label>
              <input type="number" value={form.discount} onChange={e => handleTextChange('discount', e.target.value)} placeholder="30" className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-3 py-2.5 text-sm outline-none" />
            </div>
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Stock Qty</label>
              <input type="number" value={form.stock} onChange={e => handleTextChange('stock', e.target.value)} placeholder="24" className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-3 py-2.5 text-sm outline-none" />
            </div>
          </div>

          {/* Size & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-2">Sizes</label>
              <div className="flex gap-2 flex-wrap">
                {SIZES.map(s => (
                  <button key={s} type="button" onClick={() => handleSizeToggle(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${form.sizes.includes(s) ? 'bg-[#B5232B] text-white' : 'bg-white/5 text-white/40 border border-white/8 hover:text-white'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Status</label>
              <select value={form.status} onChange={e => handleTextChange('status', e.target.value)} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all">
                <option value="active" className="bg-[#111]">Active (Visible)</option>
                <option value="out_of_stock" className="bg-[#111]">Out of Stock</option>
                <option value="draft" className="bg-[#111]">Draft (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-2">Badges & Status Toggles</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Featured', key: 'is_featured' },
                { label: 'Best Seller', key: 'is_bestseller' },
                { label: 'New Arrival', key: 'is_new_arrival' },
                { label: 'Active Toggle', key: 'is_active' },
              ].map(toggle => (
                <button
                  key={toggle.key}
                  type="button"
                  onClick={() => handleToggleField(toggle.key)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                    form[toggle.key] 
                      ? 'bg-[#B5232B]/10 border-[#B5232B] text-[#B5232B]' 
                      : 'bg-white/3 border-white/6 text-white/40'
                  }`}
                >
                  <span>{toggle.label}</span>
                  <span className={`w-2 h-2 rounded-full ${form[toggle.key] ? 'bg-[#B5232B]' : 'bg-white/10'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Specifications Map */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Specifications</label>
              <button type="button" onClick={addSpecRow} className="text-xs text-[#B5232B] hover:underline flex items-center gap-1 font-bold">
                + Add Spec
              </button>
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {specs.map((spec, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={spec.key} onChange={e => handleSpecChange(i, 'key', e.target.value)} placeholder="e.g. Material" className="flex-1 bg-white/5 border border-white/8 text-white rounded-lg px-3 py-1.5 text-xs outline-none" />
                  <input value={spec.value} onChange={e => handleSpecChange(i, 'value', e.target.value)} placeholder="e.g. 100% French Terry" className="flex-1 bg-white/5 border border-white/8 text-white rounded-lg px-3 py-1.5 text-xs outline-none" />
                  {specs.length > 1 && (
                    <button type="button" onClick={() => removeSpecRow(i)} className="text-red-400 hover:text-red-500 p-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Multiple Images Upload & Management */}
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-2">Product Images (Multiple)</label>
            <input 
              type="file" 
              multiple 
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange} 
              className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2 text-xs outline-none focus:border-[#B5232B]/50 transition-all mb-3" 
            />

            {/* Images grid preview */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {/* Existing Images */}
              {form.existingImages.map((url, i) => (
                <div key={`exist-${i}`} className="relative aspect-square rounded-lg border border-white/10 overflow-hidden group bg-black/40">
                  <img src={url.startsWith('http') ? url : `${api.defaults.baseURL.replace('/api', '')}${url}`} alt="exist" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeExistingImage(url)} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              {/* New Selected Files */}
              {form.images.map((file, i) => {
                const previewUrl = URL.createObjectURL(file);
                return (
                  <div key={`new-${i}`} className="relative aspect-square rounded-lg border border-yellow-500/20 overflow-hidden group bg-black/40">
                    <img src={previewUrl} alt="new" className="w-full h-full object-cover border border-dashed border-[#B5232B]" />
                    <button type="button" onClick={() => removeNewImage(i)} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-bold transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 rounded-xl bg-[#B5232B] hover:bg-[#9a1c23] text-white text-sm font-bold transition-all shadow-lg disabled:opacity-50">
            {loading ? 'Saving...' : initial ? 'Save Changes' : 'Add Product'}
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
  const { products, refreshData } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleSave = () => {
    setShowForm(false);
    setEditing(null);
    refreshData();
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setDeleteConfirm(null);
      refreshData();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const backendUrl = api.defaults.baseURL.replace('/api', '');
    return `${backendUrl}${url}`;
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
          <div key={product.id} className="bg-[#111] border border-white/6 rounded-2xl overflow-hidden hover:border-white/10 transition-all group flex flex-col justify-between">
            {/* Image */}
            <div className="aspect-[4/3] bg-[#0d0d0d] relative overflow-hidden flex items-center justify-center">
              {product.image_url ? (
                <img src={getImageUrl(product.image_url)} alt={product.name} className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="text-white/10">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              
              {/* Badges block */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {product.is_featured && (
                  <span className="text-[8px] bg-yellow-500/90 text-black font-extrabold tracking-wider uppercase px-2 py-0.5 rounded">Featured</span>
                )}
                {product.is_bestseller && (
                  <span className="text-[8px] bg-red-600 text-white font-extrabold tracking-wider uppercase px-2 py-0.5 rounded">Best Seller</span>
                )}
                {product.is_new_arrival && (
                  <span className="text-[8px] bg-blue-500 text-white font-extrabold tracking-wider uppercase px-2 py-0.5 rounded">New Arrival</span>
                )}
              </div>

              <span className={`absolute top-3 right-3 text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${STATUS_STYLES[product.status] || STATUS_STYLES.draft}`}>
                {product.status ? product.status.replace('_', ' ') : 'N/A'}
              </span>
            </div>
            
            {/* Info */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-white/30 text-[10px] font-bold tracking-widest uppercase">{product.category_name}</p>
                  <p className="text-[#B5232B] text-[10px] font-bold uppercase">{product.brand_name || ''}</p>
                </div>
                <h3 className="text-white font-bold text-base mb-2">{product.name}</h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-white font-black text-lg">{Number(product.price).toLocaleString()} DH</span>
                  {product.original_price && <span className="text-white/25 text-sm line-through">{Number(product.original_price).toLocaleString()} DH</span>}
                  {product.discount > 0 && <span className="text-emerald-400 text-xs font-bold">-{product.discount}%</span>}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 border-t border-white/5 pt-3">
                  <span className="text-white/40 text-xs">{product.stock} in stock</span>
                  <div className="flex gap-1">
                    {typeof product.sizes === 'string' ? (
                      product.sizes.split(',').map(s => (
                        <span key={s} className="text-white/30 text-[9px] border border-white/8 rounded px-1.5 py-0.5 font-semibold">{s}</span>
                      ))
                    ) : (
                      Array.isArray(product.sizes) && product.sizes.map(s => (
                        <span key={s} className="text-white/30 text-[9px] border border-white/8 rounded px-1.5 py-0.5 font-semibold">{s}</span>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing({
                    ...product,
                    originalPrice: product.original_price,
                    category: product.category ? (product.category._id || product.category) : '',
                    brand: product.brand ? (product.brand._id || product.brand) : ''
                  })} className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold transition-all">Edit</button>
                  <button onClick={() => setDeleteConfirm(product)} className="flex-1 py-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-400/60 hover:text-red-400 text-xs font-bold transition-all">Delete</button>
                </div>
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
              <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
