import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Pricing from './pages/Pricing';
import Scanner from './pages/Scanner';
import Blog from './pages/Blog';

export default function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/blog" element={<Blog />} />
      </Routes>
    </BrowserRouter>
  );
}