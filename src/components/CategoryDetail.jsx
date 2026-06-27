import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import api from '../api';

export default function CategoryDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        const catRes = await api.get(`/categories/${slug}`);
        if (catRes.data.success) {
          const cat = catRes.data.data;
          setCategory(cat);
          
          const prodRes = await api.get(`/products?status=active&category=${cat._id}`);
          if (prodRes.data.success) {
            setProducts(prodRes.data.products);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryAndProducts();
  }, [slug]);

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const backendUrl = api.defaults.baseURL.replace('/api', '');
    return `${backendUrl}${url}`;
  };

  const handleProductClick = (prod) => {
    navigate(`/product/${prod.slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#241B14] flex items-center justify-center text-white font-display uppercase tracking-widest text-lg animate-pulse">
        Loading collection...
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#F8F4EC] flex flex-col items-center justify-center text-[#241B14] space-y-4 p-6">
        <h2 className="font-display text-2xl font-bold uppercase">Collection Not Found</h2>
        <button onClick={() => navigate('/')} className="flex items-center gap-2 border border-[#241B14] px-6 py-2.5 text-xs font-bold uppercase tracking-wider">
          <ArrowLeft size={14} /> Back to Store
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EC] text-[#241B14] font-sans selection:bg-[#C9A24B] pb-24 pt-28">
      {/* Category Banner / Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:text-[#B5232B] transition-colors text-xs font-bold uppercase tracking-widest mb-6">
          <ArrowLeft size={16} /> Back to Store
        </button>
        
        {category.image_url ? (
          <div className="relative aspect-[21/9] sm:aspect-[4/1] rounded-3xl overflow-hidden mb-12 shadow-sm bg-[#241B14]">
            <img src={getImageUrl(category.image_url)} alt={category.name} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 sm:p-10 flex flex-col justify-end">
              <span className="text-[#C9A24B] uppercase tracking-[0.25em] text-[10px] font-bold mb-1.5 block">Store Collection</span>
              <h1 className="text-white font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-wide">{category.name}</h1>
              <p className="text-white/70 text-xs sm:text-sm font-light mt-1.5 max-w-xl">{category.description}</p>
            </div>
          </div>
        ) : (
          <div className="border-b border-[#241B14]/10 pb-8 mb-12">
            <span className="text-xs font-bold tracking-[0.2em] text-[#B5232B] uppercase mb-2 block">Store Collection</span>
            <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-wide uppercase leading-tight mb-3">
              {category.name}
            </h1>
            <p className="text-sm text-[#241B14]/75 font-light max-w-2xl leading-relaxed">
              {category.description || 'Premium garments handcrafted meticulously.'}
            </p>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {products.length === 0 ? (
          <div className="py-20 text-center text-[#241B14]/40 font-light border border-[#241B14]/5 rounded-2xl bg-white/40">
            No products available in this collection yet. Check back soon for the next drop.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {products.map((product) => (
              <div
                key={product._id}
                onClick={() => handleProductClick(product)}
                className="group bg-white border border-[#241B14]/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between h-full cursor-pointer"
              >
                <div>
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#241B14]/5">
                    <img
                      src={getImageUrl(product.image_url)}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {product.discount > 0 && (
                      <span className="absolute top-4 right-4 text-[9px] tracking-wider uppercase font-bold px-2 py-1 rounded bg-[#B5232B] text-white">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <p className="font-sans text-[11px] tracking-widest text-[#241B14]/40 uppercase mb-1">
                      {product.brand_name || 'Tony Original'}
                    </p>
                    <h3 className="font-display font-medium text-lg tracking-wide text-[#241B14] mb-1.5 group-hover:text-[#B5232B] transition-colors">
                      {product.name}
                    </h3>
                    <p className="font-sans text-xs text-[#241B14]/70 line-clamp-2 font-light">
                      {product.description}
                    </p>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-[#241B14]/5">
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-[#B5232B] text-base">
                      {product.price.toLocaleString()} DH
                    </span>
                    {product.original_price && (
                      <span className="text-[#241B14]/30 line-through text-[11px]">
                        {product.original_price.toLocaleString()} DH
                      </span>
                    )}
                  </div>
                  <span className="flex items-center space-x-1 border border-[#241B14]/20 text-[#241B14] group-hover:bg-[#241B14] group-hover:text-white px-3.5 py-2 text-[9px] tracking-widest uppercase font-bold rounded-lg transition-all duration-300">
                    <Plus size={10} />
                    <span>View Detail</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
