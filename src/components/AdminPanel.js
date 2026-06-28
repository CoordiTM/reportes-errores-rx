import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, FileText, AlertTriangle, Users, Download, Search, Calendar } from 'lucide-react';
import {
  getAllReportes,
  deleteReporte,
  getCatalogoErrores,
  addErrorCatalogo,
  deleteErrorCatalogo,
  getTecnicos,
  addTecnico,
  deleteTecnico,
  getDefaultErrores,
  getDefaultTecnicos
} from '../services/dbService';

const ADMIN_KEY = 'Essalud2025*';

export default function AdminPanel({ onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('reportes');

  const [reportes, setReportes] = useState([]);
  const [errores, setErrores] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);

  const [nuevoError, setNuevoError] = useState('');
  const [nuevoTecnico, setNuevoTecnico] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [repData, errData, tecData] = await Promise.all([
        getAllReportes(),
        getCatalogoErrores(),
        getTecnicos()
      ]);
      setReportes(repData);
      setErrores(errData.length > 0 ? errData : getDefaultErrores());
      setTecnicos(tecData.length > 0 ? tecData : getDefaultTecnicos());
    } catch (error) {
      console.error('Error cargando datos:', error);
      setErrores(getDefaultErrores());
      setTecnicos(getDefaultTecnicos());
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = () => {
    if (password === ADMIN_KEY) {
      setIsAuthenticated(true);
    } else {
      alert('❌ Clave incorrecta');
    }
  };

  const handleAddError = async () => {
    if (!nuevoError.trim()) return;
    try {
      await addErrorCatalogo(nuevoError.trim());
      setNuevoError('');
      await loadData();
    } catch (error) {
      alert('Error agregando error: ' + error.message);
    }
  };

  const handleDeleteError = async (id) => {
    if (!window.confirm('¿Eliminar este tipo de error?')) return;
    try {
      await deleteErrorCatalogo(id);
      await loadData();
    } catch (error) {
      alert('Error eliminando: ' + error.message);
    }
  };

  const handleAddTecnico = async () => {
    if (!nuevoTecnico.trim()) return;
    try {
      await addTecnico(nuevoTecnico.trim());
      setNuevoTecnico('');
      await loadData();
    } catch (error) {
      alert('Error agregando tecnólogo médico: ' + error.message);
    }
  };

  const handleDeleteTecnico = async (id) => {
    if (!window.confirm('¿Eliminar este tecnólogo médico?')) return;
    try {
      await deleteTecnico(id);
      await loadData();
    } catch (error) {
      alert('Error eliminando: ' + error.message);
    }
  };

  const handleDeleteReporte = async (id) => {
    if (!window.confirm('¿Eliminar este reporte?')) return;
    try {
      await deleteReporte(id);
      await loadData();
    } catch (error) {
      alert('Error eliminando reporte: ' + error.message);
    }
  };

  const getReportesFiltrados = () => {
    let filtrados = reportes;

    // Filtro por búsqueda (DNI o nombre)
    if (busqueda) {
      filtrados = filtrados.filter(r => 
        r.nombres?.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.dni?.includes(busqueda)
      );
    }

    // Filtro por fecha
    if (fechaInicio) {
      filtrados = filtrados.filter(r => r.fechaExamen >= fechaInicio);
    }
    if (fechaFin) {
      filtrados = filtrados.filter(r => r.fechaExamen <= fechaFin);
    }

    return filtrados;
  };

  const exportarTXT = () => {
    const filtrados = getReportesFiltrados();

    if (filtrados.length === 0) {
      alert('No hay reportes para exportar en el rango seleccionado');
      return;
    }

    let content = 'REPORTES DE ERRORES DE RX - HNASS\n';
    content += 'Hospital Nacional Alberto Sabogal Sologuren\n';
    content += 'Servicio de Radiodiagnóstico y Ecografía\n';
    if (fechaInicio || fechaFin) {
      content += `Periodo: ${fechaInicio || 'Inicio'} al ${fechaFin || 'Hoy'}\n`;
    }
    content += '=' .repeat(50) + '\n\n';

    filtrados.forEach((r, i) => {
      content += `Reporte #${i + 1}\n`;
      content += `DNI: ${r.dni}\n`;
      content += `Paciente: ${r.nombres}\n`;
      content += `Fecha: ${r.fechaExamen} | Hora: ${r.horaExamen}\n`;
      content += `Examen: ${r.examenRealizado}\n`;
      content += `Errores: ${r.errores?.join(', ') || 'N/A'}\n`;
      content += `Descripción: ${r.descripcionCambio || 'N/A'}\n`;
      content += `Responsable: ${r.tecnicoResponsable}\n`;
      content += `Reporta: ${r.quienReporta}\n`;
      content += '---\n\n';
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reportes-errores-${fechaInicio || 'inicio'}_${fechaFin || 'hoy'}.txt`;
    a.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">🔧 Panel Admin</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>
          <p className="text-slate-500 text-sm mb-4">Ingresa la clave de administrador</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
            placeholder="Clave admin"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl mb-4 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
          <button
            onClick={handleAuth}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold"
          >
            Ingresar
          </button>
        </div>
      </div>
    );
  }

  const reportesFiltrados = getReportesFiltrados();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">🔧 Panel de Administración</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('reportes')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${
              activeTab === 'reportes' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText size={16} /> Reportes ({reportes.length})
          </button>
          <button
            onClick={() => setActiveTab('errores')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${
              activeTab === 'errores' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <AlertTriangle size={16} /> Tipos de Error ({errores.length})
          </button>
          <button
            onClick={() => setActiveTab('tecnicos')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${
              activeTab === 'tecnicos' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users size={16} /> Tecnólogos Médicos ({tecnicos.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {activeTab === 'reportes' && (
            <div>
              {/* Filtros */}
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por DNI o nombre..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    placeholder="Desde"
                    className="px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none text-sm"
                  />
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    placeholder="Hasta"
                    className="px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none text-sm"
                  />
                </div>
                <button
                  onClick={exportarTXT}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2 text-sm"
                >
                  <Download size={16} /> Exportar TXT
                </button>
              </div>

              <p className="text-sm text-slate-500 mb-4">
                Mostrando {reportesFiltrados.length} de {reportes.length} reportes
              </p>

              {loading ? (
                <p className="text-center text-slate-400 py-8">Cargando...</p>
              ) : reportesFiltrados.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No hay reportes</p>
              ) : (
                <div className="space-y-3">
                  {reportesFiltrados.map(reporte => (
                    <div key={reporte.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-slate-800">{reporte.nombres}</p>
                          <p className="text-sm text-slate-500">DNI: {reporte.dni} | {reporte.fechaExamen} {reporte.horaExamen}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteReporte(reporte.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 mb-1"><strong>Examen:</strong> {reporte.examenRealizado}</p>
                      <p className="text-sm text-slate-600 mb-1">
                        <strong>Errores:</strong> {reporte.errores?.join(', ')}
                      </p>
                      {reporte.descripcionCambio && (
                        <p className="text-sm text-slate-600 mb-1"><strong>Cambio:</strong> {reporte.descripcionCambio}</p>
                      )}
                      <p className="text-sm text-slate-500">
                        <strong>Responsable:</strong> {reporte.tecnicoResponsable} | <strong>Reporta:</strong> {reporte.quienReporta}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'errores' && (
            <div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={nuevoError}
                  onChange={(e) => setNuevoError(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddError()}
                  placeholder="Nuevo tipo de error..."
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
                <button
                  onClick={handleAddError}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <Plus size={16} /> Agregar
                </button>
              </div>

              <div className="space-y-2">
                {errores.map(error => (
                  <div key={error.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-700">{error.nombre}</span>
                    <button
                      onClick={() => handleDeleteError(error.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tecnicos' && (
            <div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={nuevoTecnico}
                  onChange={(e) => setNuevoTecnico(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTecnico()}
                  placeholder="Nombre del tecnólogo médico..."
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
                <button
                  onClick={handleAddTecnico}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <Plus size={16} /> Agregar
                </button>
              </div>

              <div className="space-y-2">
                {tecnicos.map(tec => (
                  <div key={tec.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-700">{tec.nombre}</span>
                    <button
                      onClick={() => handleDeleteTecnico(tec.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
