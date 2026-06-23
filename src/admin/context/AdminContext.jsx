import { createContext, useContext, useState } from 'react';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('tony_admin_auth') === 'true';
  });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers] = useState([]);

  const login = (username, password) => {
    if (username === 'admin' && password === 'tony2026') {
      localStorage.setItem('tony_admin_auth', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('tony_admin_auth');
    setIsAuthenticated(false);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const addProduct = (product) => {
    const newProduct = { ...product, id: `PRD-00${products.length + 1}` };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id, data) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
    totalProducts: products.length,
    totalCustomers: customers.length,
    salesData: [],
  };

  return (
    <AdminContext.Provider value={{
      isAuthenticated, login, logout,
      orders, updateOrderStatus,
      products, addProduct, updateProduct, deleteProduct,
      customers, stats,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
