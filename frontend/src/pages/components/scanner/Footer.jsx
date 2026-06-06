import React from 'react';

export const Footer = () => (
  <footer className="border-t py-10" style={{ borderTopColor: 'var(--borderColor)', background: 'var(--bgPrimary)' }}>
    <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span className="font-bold text-lg" style={{ color: 'var(--textPrimary)' }}>⚡ ruptor</span>
      </div>
      <p className="text-sm" style={{ color: 'var(--textTertiary)' }}>© 2026 ruptor — Supera el filtro ATS.</p>
    </div>
  </footer>
);