import { useState, useEffect } from 'react';
import api from '../../api';

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.success) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleFileUpload = async (e, key, setUploading) => {
    if (!e.target.files || !e.target.files[0]) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', e.target.files[0]);

    try {
      const res = await api.post('/content/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        handleChange(key, res.data.url);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload image file');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const backendUrl = api.defaults.baseURL.replace('/api', '');
    return `${backendUrl}${url}`;
  };

  if (loading) return <div className="text-white">Loading Settings...</div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-black tracking-tight">Store Settings</h1>
          <p className="text-white/40 text-sm mt-0.5">Manage global configuration, logos, and SEO properties</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#B5232B] hover:bg-[#9a1c23] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General and Branding */}
        <div className="bg-[#111] border border-white/6 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-white font-bold text-lg mb-4 border-b border-white/5 pb-2">Branding & Identity</h3>
            <div className="space-y-4">
              <div>
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Website Name</label>
                <input value={settings.website_name || ''} onChange={e => handleChange('website_name', e.target.value)} placeholder="e.g. Tony Original Morocco" className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
              </div>
              
              {/* Logo upload */}
              <div>
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Store Logo</label>
                <div className="flex gap-3 items-center">
                  <input value={settings.logo_url || ''} onChange={e => handleChange('logo_url', e.target.value)} placeholder="Logo URL..." className="flex-1 bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2 text-sm outline-none" />
                  <label className="bg-white/5 border border-white/8 text-white px-4 py-2 text-xs font-bold rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/8 whitespace-nowrap">
                    {uploadingLogo ? '...' : 'Upload'}
                    <input type="file" onChange={e => handleFileUpload(e, 'logo_url', setUploadingLogo)} className="hidden" />
                  </label>
                </div>
                {settings.logo_url && (
                  <div className="mt-2 p-2 bg-[#0a0a0a] rounded-lg inline-block">
                    <img src={getImageUrl(settings.logo_url)} alt="Logo Preview" className="max-h-12 object-contain" />
                  </div>
                )}
              </div>

              {/* Favicon upload */}
              <div>
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Favicon Media</label>
                <div className="flex gap-3 items-center">
                  <input value={settings.favicon_url || ''} onChange={e => handleChange('favicon_url', e.target.value)} placeholder="Favicon URL..." className="flex-1 bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2 text-sm outline-none" />
                  <label className="bg-white/5 border border-white/8 text-white px-4 py-2 text-xs font-bold rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/8 whitespace-nowrap">
                    {uploadingFavicon ? '...' : 'Upload'}
                    <input type="file" onChange={e => handleFileUpload(e, 'favicon_url', setUploadingFavicon)} className="hidden" />
                  </label>
                </div>
                {settings.favicon_url && (
                  <div className="mt-2 p-2 bg-[#0a0a0a] rounded-lg inline-block">
                    <img src={getImageUrl(settings.favicon_url)} alt="Favicon Preview" className="max-h-8 object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <h3 className="text-white font-bold text-lg mb-4">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Contact Email</label>
                <input value={settings.contact_email || ''} onChange={e => handleChange('contact_email', e.target.value)} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
              </div>
              <div>
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Contact Phone</label>
                <input value={settings.contact_phone || ''} onChange={e => handleChange('contact_phone', e.target.value)} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* SEO and Metadata */}
        <div className="bg-[#111] border border-white/6 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-white font-bold text-lg mb-4 border-b border-white/5 pb-2">SEO & Metadata</h3>
            <div className="space-y-4">
              <div>
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">SEO Title Tag</label>
                <input value={settings.seo_title || ''} onChange={e => handleChange('seo_title', e.target.value)} placeholder="Tony Original Morocco | Premium Streetwear Maison" className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
              </div>
              <div>
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">SEO Meta Description</label>
                <textarea value={settings.seo_description || ''} onChange={e => handleChange('seo_description', e.target.value)} placeholder="Enter search engine snippet description..." rows={4} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all resize-none" />
              </div>
              <div>
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">SEO Keywords</label>
                <input value={settings.seo_keywords || ''} onChange={e => handleChange('seo_keywords', e.target.value)} placeholder="streetwear, fashion, luxury, cotton, morocco" className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <h3 className="text-white font-bold text-lg mb-4">Text Sections</h3>
            <div className="space-y-4">
              <div>
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">About Us Summary Text</label>
                <textarea value={settings.about_text || ''} onChange={e => handleChange('about_text', e.target.value)} rows={3} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all resize-none" />
              </div>
              <div>
                <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Footer Text / Copyright Statement</label>
                <input value={settings.footer_text || ''} onChange={e => handleChange('footer_text', e.target.value)} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
