import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Check, Sparkles } from 'lucide-react';
import api from '../api';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${slug}`);
        if (res.data.success) {
          const prod = res.data.product;
          setProduct(prod);
          if (prod.images && prod.images.length > 0) {
            setActiveImage(prod.images[0]);
          } else {
            setActiveImage(prod.image_url);
          }
          const sizesList = typeof prod.sizes === 'string' ? prod.sizes.split(',') : prod.sizes || [];
          if (sizesList.length > 0) {
            setSelectedSize(sizesList[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const backendUrl = api.defaults.baseURL.replace('/api', '');
    return `${backendUrl}${url}`;
  };

  const handleAddToBag = () => {
    // Add to cart in local storage so that Home.jsx can read it, or navigate to Home checkout
    const cart = JSON.parse(localStorage.getItem('tony_cart') || '[]');
    if (!cart.some(item => item._id === product._id)) {
      cart.push({
        ...product,
        selectedSize
      });
      localStorage.setItem('tony_cart', JSON.stringify(cart));
    }
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      // Navigate to homepage checkout section
      navigate('/#order');
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#241B14] flex items-center justify-center text-white font-display uppercase tracking-widest text-lg animate-pulse">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F4EC] flex flex-col items-center justify-center text-[#241B14] space-y-4 p-6">
        <h2 className="font-display text-2xl font-bold uppercase">Product Not Found</h2>
        <button onClick={() => navigate('/')} className="flex items-center gap-2 border border-[#241B14] px-6 py-2.5 text-xs font-bold uppercase tracking-wider">
          <ArrowLeft size={14} /> Back to Store
        </button>
      </div>
    );
  }

  const sizesArray = typeof product.sizes === 'string' ? product.sizes.split(',') : product.sizes || [];
  const specifications = product.specifications ? Object.entries(product.specifications) : [];

  return (
    <div className="min-h-screen bg-[#F8F4EC] text-[#241B14] font-sans selection:bg-[#C9A24B] pb-24 pt-28">
      {/* Header Back Button */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:text-[#B5232B] transition-colors text-xs font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Catalog
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        
        {/* Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-white border border-[#241B14]/5 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center p-8">
            <img src={getImageUrl(activeImage)} alt={product.name} className="max-h-full max-w-full object-contain" />
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square rounded-xl overflow-hidden border bg-white p-2 flex items-center justify-center transition-all ${
                    activeImage === img ? 'border-[#B5232B] ring-1 ring-[#B5232B]' : 'border-[#241B14]/10 hover:border-[#241B14]/30'
                  }`}
                >
                  <img src={getImageUrl(img)} alt="thumb" className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Content */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-bold tracking-[0.2em] text-[#B5232B] uppercase inline-flex items-center gap-1.5">
                <Sparkles size={12} />
                {product.brand?.name || 'Tony Original'}
              </span>
              <span className="text-[10px] bg-[#241B14] text-white px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                {product.category?.name || 'Collection'}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-wide uppercase leading-tight mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-3">
              <span className="font-display font-black text-[#B5232B] text-2xl sm:text-3xl tracking-wide">
                {Number(product.price).toLocaleString()} DH
              </span>
              {product.original_price && (
                <span className="text-white/40 text-[#241B14]/40 line-through text-base sm:text-lg tracking-wide">
                  {Number(product.original_price).toLocaleString()} DH
                </span>
              )}
              {product.discount > 0 && (
                <span className="text-xs font-bold text-white bg-emerald-500 rounded px-2.5 py-0.5 tracking-wider uppercase">
                  -{product.discount}% OFF
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-b border-[#241B14]/10 py-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#241B14] mb-3">Description</h3>
            <p className="text-sm text-[#241B14]/75 font-light leading-relaxed whitespace-pre-wrap">
              {product.description || 'No description available for this premium garment.'}
            </p>
          </div>

          {/* Size Selection */}
          {sizesArray.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#241B14] mb-3">Select Size</h3>
              <div className="flex gap-2.5 flex-wrap">
                {sizesArray.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-12 h-10 rounded-lg border text-xs font-bold uppercase transition-all ${
                      selectedSize === s
                        ? 'bg-[#B5232B] border-[#B5232B] text-white shadow-md'
                        : 'bg-white/50 border-[#241B14]/10 hover:border-[#241B14]/40'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Bag Action */}
          <div>
            <button
              onClick={handleAddToBag}
              disabled={product.stock === 0}
              className="w-full sm:w-auto bg-[#B5232B] hover:bg-[#9a1c23] text-white font-sans tracking-widest uppercase text-xs font-bold py-4.5 px-12 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={14} />
              <span>{product.stock === 0 ? 'Out of Stock' : 'Order Now (Cash on Delivery)'}</span>
            </button>
            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-[10px] text-[#B5232B] font-bold uppercase mt-2 animate-pulse">Running low! Only {product.stock} left in stock.</p>
            )}
          </div>

          {/* Specifications */}
          {specifications.length > 0 && (
            <div className="border-t border-[#241B14]/10 pt-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#241B14] mb-3">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                {specifications.map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center text-xs py-1 border-b border-[#241B14]/5 pb-1">
                    <span className="text-[#241B14]/50 font-semibold">{key}</span>
                    <span className="text-[#241B14] font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Toast alert */}
      {toastVisible && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#241B14] text-white border border-[#C9A24B]/30 rounded-xl py-4 px-6 shadow-2xl flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-[#0B6E4F]/20 border border-[#0B6E4F]/40 flex items-center justify-center">
            <Check className="text-[#0B6E4F] w-3 h-3 stroke-[3]" />
          </div>
          <span className="font-sans text-xs font-medium tracking-wide">Added to checkout bag! Redirecting...</span>
        </div>
      )}
    </div>
  );
}
