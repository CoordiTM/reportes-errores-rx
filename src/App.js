import React, { useState } from 'react';
import { Settings, AlertTriangle } from 'lucide-react';
import FormularioReporte from './components/FormularioReporte';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">

      {/* Admin Button */}
      <button
        onClick={() => setShowAdmin(true)}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full glass-dark text-white/70 hover:text-white flex items-center justify-center transition-all hover:scale-110"
        title="Panel Admin"
      >
        <Settings size={18} />
      </button>

      {/* Admin Panel Modal */}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-500/10"></div>
        <div className="relative max-w-4xl mx-auto px-6 py-10 text-center">
          <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full glass text-red-700 text-sm font-medium">
            <AlertTriangle size={14} />
            Reporte de Errores
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
            Reportes de Errores de Rx
          </h1>
          <p className="text-slate-500 text-base">
            Hospital Nacional Alberto Sabogal Sologuren
          </p>
          <p className="text-slate-400 text-sm">
            Servicio de Radiodiagnóstico y Ecografía
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-6 pb-20">
        <FormularioReporte />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center">
          <p className="text-slate-400 text-sm">Todos los derechos reservados — Desarrollado por Flurolab Academy</p>
        </div>
      </footer>

    </div>
  );
}
