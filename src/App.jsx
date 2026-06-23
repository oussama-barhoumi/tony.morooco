import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home.jsx';
import AdminApp from './admin/AdminApp.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  );
}
