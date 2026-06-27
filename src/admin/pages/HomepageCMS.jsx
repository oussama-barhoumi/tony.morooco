import { useState, useEffect } from 'react';
import api from '../../api';

const INITIAL_HERO = {
  title: 'Born in Morocco. Built for the Streets.',
  subtitle: 'Heavyweight premium cotton. Structured silhouette.',
  button_text: 'Shop Collection',
  button_link: '#products',
  bg_image_url: '',
  video_url: '',
  animation_option: 'fade-in'
};

const INITIAL_FOOTER = {
  social_facebook: '',
  social_instagram: '',
  social_twitter: '',
  contact_email: '',
  contact_phone: '',
  contact_address: '',
  copyright: '© 2026 Tony Original Morocco. All rights reserved.'
};

export default function HomepageCMS() {
  const [hero, setHero] = useState(INITIAL_HERO);
  const [footer, setFooter] = useState(INITIAL_FOOTER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.success) {
        const s = res.data.settings;
        if (s.hero_section) setHero({ ...INITIAL_HERO, ...s.hero_section });
        if (s.footer_section) setFooter({ ...INITIAL_FOOTER, ...s.footer_section });
      }
    } catch (err) {
      console.error('Error fetching homepage CMS details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroChange = (field, val) => {
    setHero(prev => ({ ...prev, [field]: val }));
  };

  const handleFooterChange = (field, val) => {
    setFooter(prev => ({ ...prev, [field]: val }));
  };

  const handleImageUpload = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', e.target.files[0]);

    try {
      const res = await api.post('/content/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        handleHeroChange('bg_image_url', res.data.url);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload image. Make sure server is running and support upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', {
        hero_section: hero,
        footer_section: footer
      });
      alert('Homepage CMS updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save homepage CMS updates');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white">Loading CMS configuration...</div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-black tracking-tight">Homepage Content Manager</h1>
          <p className="text-white/40 text-sm mt-0.5">Control Hero and Footer sections dynamically</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#B5232B] hover:bg-[#9a1c23] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hero Section settings */}
        <div className="bg-[#111] border border-white/6 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-bold text-lg border-b border-white/5 pb-2">Hero Section Settings</h2>
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Hero Headline Title</label>
            <input value={hero.title} onChange={e => handleHeroChange('title', e.target.value)} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all" />
          </div>
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Hero Subtitle</label>
            <textarea value={hero.subtitle} onChange={e => handleHeroChange('subtitle', e.target.value)} rows={3} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B5232B]/50 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Button Text</label>
              <input value={hero.button_text} onChange={e => handleHeroChange('button_text', e.target.value)} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none" />
            </div>
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Button Link</label>
              <input value={hero.button_link} onChange={e => handleHeroChange('button_link', e.target.value)} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none" />
            </div>
          </div>
          <div className="pt-2 border-t border-white/5 space-y-4">
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Background Image Media</label>
              <div className="flex gap-3">
                <input value={hero.bg_image_url} onChange={e => handleHeroChange('bg_image_url', e.target.value)} placeholder="Image URL..." className="flex-1 bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2 text-sm outline-none" />
                <label className="bg-white/5 border border-white/8 text-white px-4 py-2 text-xs font-bold rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/8">
                  {uploading ? '...' : 'Upload'}
                  <input type="file" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Background Video Link (Optional)</label>
              <input value={hero.video_url} onChange={e => handleHeroChange('video_url', e.target.value)} placeholder="Video URL (e.g. YouTube or MP4 file)..." className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none" />
            </div>
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Entrance Animation</label>
              <select value={hero.animation_option} onChange={e => handleHeroChange('animation_option', e.target.value)} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-3 py-2.5 text-sm outline-none">
                <option value="fade-in" className="bg-[#111]">Fade In (Default)</option>
                <option value="slide-up" className="bg-[#111]">Slide Up</option>
                <option value="scale-up" className="bg-[#111]">Scale In Zoom</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Settings */}
        <div className="bg-[#111] border border-white/6 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-bold text-lg border-b border-white/5 pb-2">Footer & Contact Settings</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Contact Phone</label>
              <input value={footer.contact_phone} onChange={e => handleFooterChange('contact_phone', e.target.value)} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none" />
            </div>
            <div>
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Contact Email</label>
              <input value={footer.contact_email} onChange={e => handleFooterChange('contact_email', e.target.value)} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Physical Address</label>
            <input value={footer.contact_address} onChange={e => handleFooterChange('contact_address', e.target.value)} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none" />
          </div>
          <div className="pt-2 border-t border-white/5 space-y-4">
            <h3 className="text-white/60 text-xs font-bold uppercase">Social Media URLs</h3>
            <div className="space-y-3">
              <div>
                <label className="text-white/40 text-[9px] font-bold block mb-1">Instagram Link</label>
                <input value={footer.social_instagram} onChange={e => handleFooterChange('social_instagram', e.target.value)} placeholder="https://instagram.com/..." className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2 text-xs outline-none" />
              </div>
              <div>
                <label className="text-white/40 text-[9px] font-bold block mb-1">Facebook Link</label>
                <input value={footer.social_facebook} onChange={e => handleFooterChange('social_facebook', e.target.value)} placeholder="https://facebook.com/..." className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2 text-xs outline-none" />
              </div>
              <div>
                <label className="text-white/40 text-[9px] font-bold block mb-1">Twitter/X Link</label>
                <input value={footer.social_twitter} onChange={e => handleFooterChange('social_twitter', e.target.value)} placeholder="https://twitter.com/..." className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2 text-xs outline-none" />
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-white/5">
            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Copyright Information</label>
            <input value={footer.copyright} onChange={e => handleFooterChange('copyright', e.target.value)} className="w-full bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
