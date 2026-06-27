import { createContext, useContext, useState, useEffect } from 'react';
import api from '../../api';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('tony_admin_token'));
  
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [brands, setBrands] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [features, setFeatures] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    salesData: [],
  });

  // Verify token on mount
  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then(() => setIsAuthenticated(true))
        .catch(() => {
          setIsAuthenticated(false);
          setToken(null);
          localStorage.removeItem('tony_admin_token');
        });
    }
  }, [token]);

  // Fetch all data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [
        resOrders, resProducts, resCustomers, resStats,
        resCats, resCollections, resBrands, resFaqs,
        resFeatures, resTestimonials, resUsers
      ] = await Promise.all([
        api.get('/orders'),
        api.get('/products'),
        api.get('/customers'),
        api.get('/dashboard/stats'),
        api.get('/categories'),
        api.get('/collections'),
        api.get('/brands'),
        api.get('/faqs'),
        api.get('/features'),
        api.get('/content/testimonials'),
        api.get('/users').catch(() => ({ data: { success: false } })) // editor/admin might fail if not super_admin, degrade gracefully
      ]);

      if (resOrders.data.success) {
        setOrders(resOrders.data.data.map(o => ({
          id: o.order_number,
          internalId: o._id || o.id,
          customer: o.customer_name,
          phone: o.customer_phone,
          city: o.shipping_city || 'N/A',
          total: Number(o.total_amount),
          status: o.status.toLowerCase(),
          date: new Date(o.createdAt).toLocaleDateString(),
          products: o.items ? o.items.map(item => item.product_name) : ['(See details)'],
          address: o.shipping_address
        })));
      }

      if (resProducts.data.success) {
        setProducts(resProducts.data.products || resProducts.data.data);
      }

      if (resCustomers.data.success) {
        setCustomers(resCustomers.data.data.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email || 'N/A',
          phone: c.phone,
          orders: c.total_orders || 0,
          spent: Number(c.total_spent) || 0,
          date: new Date(c.created_at).toLocaleDateString()
        })));
      }

      if (resCats.data.success) setCategories(resCats.data.data);
      if (resCollections.data.success) setCollections(resCollections.data.data);
      if (resBrands.data.success) setBrands(resBrands.data.data);
      if (resFaqs.data.success) setFaqs(resFaqs.data.data);
      if (resFeatures.data.success) setFeatures(resFeatures.data.data);
      if (resTestimonials.data.success) setTestimonials(resTestimonials.data.testimonials);
      if (resUsers && resUsers.data && resUsers.data.success) setUsers(resUsers.data.data);

      if (resStats.data.success) {
        const d = resStats.data.data || resStats.data.stats;
        if (d && d.total_orders !== undefined) {
          setStats({
            totalOrders: d.total_orders,
            totalRevenue: Number(d.total_revenue),
            totalProducts: d.total_products,
            totalCustomers: d.total_customers,
            salesData: d.monthly_sales ? d.monthly_sales.map(m => ({
              month: m.label,
              revenue: Number(m.revenue),
              orders: Number(m.order_count)
            })) : [],
          });
        } else {
          setStats(d);
        }
      }
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('tony_admin_token', res.data.token);
        setToken(res.data.token);
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error('Login failed', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('tony_admin_token');
    setToken(null);
    setIsAuthenticated(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    try {
      const res = await api.put(`/orders/${order.internalId}/status`, { status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) });
      if (res.data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (error) {
      console.error('Failed to update order', error);
    }
  };

  const refreshData = () => {
    fetchData();
  };

  return (
    <AdminContext.Provider value={{
      isAuthenticated, login, logout,
      orders, updateOrderStatus,
      products,
      customers,
      categories,
      collections,
      brands,
      faqs,
      features,
      testimonials,
      users,
      stats,
      refreshData
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
