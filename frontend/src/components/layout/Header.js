import React from 'react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="w-full border-b border-black/5 bg-white/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          {/* Opcional: si quieres mantener el icono de rayo, descoméntalo */}
          {/* <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
            ⚡
          </div> */}
          <img
            src="/logo.png"
            alt="Logo"
            style={{ width: 162, height: 48 }}
            onError={(e) => {
              e.target.style.display = 'none';
              const span = document.createElement('span');
              span.textContent = '📄';
              span.style.fontSize = '28px';
              e.target.parentNode.appendChild(span);
              e.target.remove();
            }}
          />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-black/70">
          <Link to="/" className="hover:text-black transition">Producto</Link>
          <Link to="/scanner" className="hover:text-black transition">ATS Scanner</Link>
          <Link to="/pricing" className="hover:text-black transition">Pricing</Link>
          <Link to="/blog" className="hover:text-black transition">Blog</Link>
        </nav>
        <button className="px-5 py-3 rounded-2xl bg-black text-white font-semibold hover:scale-105 transition">
          Probar gratis
        </button>
      </div>
    </header>
  );
}