import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, FileText, AlertTriangle, Users, Download, Search, Save } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  getAllReportes,
  updateReporte,
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
  const [editingReporte, setEditingReporte] = useState(null);
  const [editFormData, setEditFormData] = useState({
    dni: '', nombres: '', fechaExamen: '', horaExamen: '', examenRealizado: '',
    errores: [], descripcionCambio: '', tecnicoResponsable: '', quienReporta: ''
  });

  useEffect(() => { if (isAuthenticated) loadData(); }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [repData, errData, tecData] = await Promise.all([
        getAllReportes(), getCatalogoErrores(), getTecnicos()
      ]);
      setReportes(repData);
      setErrores(errData.length > 0 ? errData : getDefaultErrores());
      setTecnicos(tecData.length > 0 ? tecData : getDefaultTecnicos());
    } catch (error) {
      setErrores(getDefaultErrores());
      setTecnicos(getDefaultTecnicos());
    } finally { setLoading(false); }
  };

  const handleAuth = () => {
    if (password === ADMIN_KEY) setIsAuthenticated(true);
    else alert('❌ Clave incorrecta');
  };

  const handleAddError = async () => {
    if (!nuevoError.trim()) return;
    try { await addErrorCatalogo(nuevoError.trim()); setNuevoError(''); await loadData(); }
    catch (error) { alert('Error: ' + error.message); }
  };

  const handleDeleteError = async (id) => {
    if (!window.confirm('¿Eliminar este tipo de error?')) return;
    try { await deleteErrorCatalogo(id); await loadData(); }
    catch (error) { alert('Error: ' + error.message); }
  };

  const handleAddTecnico = async () => {
    if (!nuevoTecnico.trim()) return;
    try { await addTecnico(nuevoTecnico.trim()); setNuevoTecnico(''); await loadData(); }
    catch (error) { alert('Error: ' + error.message); }
  };

  const handleDeleteTecnico = async (id) => {
    if (!window.confirm('¿Eliminar este tecnólogo médico?')) return;
    try { await deleteTecnico(id); await loadData(); }
    catch (error) { alert('Error: ' + error.message); }
  };

  const handleDeleteReporte = async (id) => {
    if (!window.confirm('¿Eliminar este reporte?')) return;
    try { await deleteReporte(id); await loadData(); }
    catch (error) { alert('Error: ' + error.message); }
  };

  const startEditReporte = (reporte) => {
    setEditingReporte(reporte.id);
    setEditFormData({
      dni: reporte.dni || '', nombres: reporte.nombres || '',
      fechaExamen: reporte.fechaExamen || '', horaExamen: reporte.horaExamen || '',
      examenRealizado: reporte.examenRealizado || '', errores: reporte.errores || [],
      descripcionCambio: reporte.descripcionCambio || '',
      tecnicoResponsable: reporte.tecnicoResponsable || '',
      quienReporta: reporte.quienReporta || ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditErrorCheck = (errorId) => {
    setEditFormData(prev => ({
      ...prev,
      errores: prev.errores.includes(errorId)
        ? prev.errores.filter(e => e !== errorId)
        : [...prev.errores, errorId]
    }));
  };

  const saveEditReporte = async () => {
    try {
      await updateReporte(editingReporte, editFormData);
      setEditingReporte(null);
      await loadData();
      alert('✅ Reporte actualizado');
    } catch (error) { alert('❌ Error: ' + error.message); }
  };

  const getReportesFiltrados = () => {
    let filtrados = reportes;
    if (busqueda) filtrados = filtrados.filter(r => 
      r.nombres?.toLowerCase().includes(busqueda.toLowerCase()) || r.dni?.includes(busqueda));
    if (fechaInicio) filtrados = filtrados.filter(r => r.fechaExamen >= fechaInicio);
    if (fechaFin) filtrados = filtrados.filter(r => r.fechaExamen <= fechaFin);
    return filtrados;
  };

  const exportarTXT = () => {
    const filtrados = getReportesFiltrados();
    if (filtrados.length === 0) { alert('No hay reportes'); return; }
    let content = 'REPORTES DE ERRORES DE RX - HNASS\nHospital Nacional Alberto Sabogal Sologuren\nServicio de Radiodiagnóstico y Ecografía\n';
    if (fechaInicio || fechaFin) content += `Periodo: ${fechaInicio || 'Inicio'} al ${fechaFin || 'Hoy'}\n`;
    content += '='.repeat(50) + '\n\n';
    filtrados.forEach((r, i) => {
      content += `Reporte #${i+1}\nDNI: ${r.dni}\nPaciente: ${r.nombres}\nFecha: ${r.fechaExamen} ${r.horaExamen}\nExamen: ${r.examenRealizado}\nErrores: ${r.errores?.map(errId => { const err = errores.find(e => e.id === errId); return err ? err.nombre : errId; }).join(', ') || 'N/A'}\nDescripción: ${r.descripcionCambio || 'N/A'}\nResponsable: ${r.tecnicoResponsable}\nReporta: ${r.quienReporta}\n---\n\n`;
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `reportes-${fechaInicio || 'inicio'}_${fechaFin || 'hoy'}.txt`; a.click();
  };

  const exportarPDF = () => {
    const filtrados = getReportesFiltrados();
    if (filtrados.length === 0) { alert('No hay reportes'); return; }
    const doc = new jsPDF('landscape');
    doc.setFontSize(16); doc.setTextColor(79, 70, 229);
    doc.text('REPORTES DE ERRORES DE RX', 105, 20, { align: 'center' });
    doc.setFontSize(10); doc.setTextColor(100, 100, 100);
    doc.text('Hospital Nacional Alberto Sabogal Sologuren', 105, 28, { align: 'center' });
    doc.text('Servicio de Radiodiagnóstico y Ecografía', 105, 33, { align: 'center' });
    if (fechaInicio || fechaFin) doc.text(`Periodo: ${fechaInicio || 'Inicio'} al ${fechaFin || 'Hoy'}`, 105, 40, { align: 'center' });
    
    const tableData = filtrados.map((r, i) => [
      i+1, r.dni, r.nombres, `${r.fechaExamen} ${r.horaExamen}`, r.examenRealizado,
      r.errores?.map(errId => { const err = errores.find(e => e.id === errId); return err ? err.nombre : errId; }).join(', ') || 'N/A',
      r.tecnicoResponsable, r.quienReporta
    ]);

    doc.autoTable({
      startY: 48, head: [['#', 'DNI', 'Paciente', 'Fecha/Hora', 'Examen', 'Errores', 'Responsable', 'Reporta']],
      body: tableData, theme: 'striped',
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 20 }, 2: { cellWidth: 30 }, 3: { cellWidth: 25 }, 4: { cellWidth: 35 }, 5: { cellWidth: 35 }, 6: { cellWidth: 25 }, 7: { cellWidth: 25 } },
      styles: { overflow: 'linebreak', cellPadding: 2 }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150, 150, 150);
      doc.text('Todos los derechos reservados - Desarrollado por Flurolab Academy', 105, 290, { align: 'center' });
      doc.text(`Página ${i} de ${pageCount}`, 105, 295, { align: 'center' });
    }
    doc.save(`reportes-${fechaInicio || 'inicio'}_${fechaFin || 'hoy'}.pdf`);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">🔧 Panel Admin</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
          </div>
          <p className="text-slate-500 text-sm mb-4">Ingresa la clave de administrador</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAuth()} placeholder="Clave admin" className="w-full px-4 py-3 border border-slate-200 rounded-xl mb-4 focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
          <button onClick={handleAuth} className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold">Ingresar</button>
        </div>
      </div>
    );
  }

  const reportesFiltrados = getReportesFiltrados();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">🔧 Panel de Administración</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>
        <div className="flex border-b border-slate-100">
          <button onClick={() => setActiveTab('reportes')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${activeTab === 'reportes' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-700'}`}><FileText size={16} /> Reportes ({reportes.length})</button>
          <button onClick={() => setActiveTab('errores')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${activeTab === 'errores' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-700'}`}><AlertTriangle size={16} /> Tipos de Error ({errores.length})</button>
          <button onClick={() => setActiveTab('tecnicos')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${activeTab === 'tecnicos' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-700'}`}><Users size={16} /> Tecnólogos Médicos ({tecnicos.length})</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'reportes' && (
            <div>
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por DNI o nombre..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                </div>
                <div className="flex gap-2">
                  <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none text-sm" />
                  <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none text-sm" />
                </div>
                <div className="flex gap-2">
                  <button onClick={exportarTXT} className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2 text-sm"><Download size={16} /> TXT</button>
                  <button onClick={exportarPDF} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center gap-2 text-sm"><Download size={16} /> PDF</button>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-4">Mostrando {reportesFiltrados.length} de {reportes.length} reportes</p>

              {/* Modal de Edición */}
              {editingReporte && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-slate-800">✏️ Editar Reporte</h4>
                      <button onClick={() => setEditingReporte(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-600 mb-1">DNI</label><input type="text" name="dni" value={editFormData.dni} onChange={handleEditChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none" /></div>
                        <div><label className="block text-sm font-medium text-slate-600 mb-1">Nombres</label><input type="text" name="nombres" value={editFormData.nombres} onChange={handleEditChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-600 mb-1">Fecha</label><input type="date" name="fechaExamen" value={editFormData.fechaExamen} onChange={handleEditChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none" /></div>
                        <div><label className="block text-sm font-medium text-slate-600 mb-1">Hora</label><input type="time" name="horaExamen" value={editFormData.horaExamen} onChange={handleEditChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none" /></div>
                      </div>
                      <div><label className="block text-sm font-medium text-slate-600 mb-1">Examen</label><input type="text" name="examenRealizado" value={editFormData.examenRealizado} onChange={handleEditChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none" /></div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">Errores</label>
                        <div className="grid grid-cols-2 gap-2">
                          {errores.map(error => (
                            <label key={error.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${editFormData.errores.includes(error.id) ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200'}`}>
                              <input type="checkbox" checked={editFormData.errores.includes(error.id)} onChange={() => handleEditErrorCheck(error.id)} className="w-4 h-4 rounded" />
                              <span className="text-sm">{error.nombre}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div><label className="block text-sm font-medium text-slate-600 mb-1">Descripción</label><textarea name="descripcionCambio" value={editFormData.descripcionCambio} onChange={handleEditChange} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none" /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-600 mb-1">Responsable</label><select name="tecnicoResponsable" value={editFormData.tecnicoResponsable} onChange={handleEditChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white"><option value="">Selecciona...</option>{tecnicos.map(tec => (<option key={tec.id} value={tec.nombre}>{tec.nombre}</option>))}</select></div>
                        <div><label className="block text-sm font-medium text-slate-600 mb-1">Reporta</label><select name="quienReporta" value={editFormData.quienReporta} onChange={handleEditChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white"><option value="">Selecciona...</option>{tecnicos.map(tec => (<option key={tec.id} value={tec.nombre}>{tec.nombre}</option>))}</select></div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => setEditingReporte(null)} className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition">Cancelar</button>
                      <button onClick={saveEditReporte} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"><Save size={16} /> Guardar Cambios</button>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (<p className="text-center text-slate-400 py-8">Cargando...</p>) : reportesFiltrados.length === 0 ? (<p className="text-center text-slate-400 py-8">No hay reportes</p>) : (
                <div className="space-y-3">
                  {reportesFiltrados.map(reporte => (
                    <div key={reporte.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-slate-800">{reporte.nombres}</p>
                          <p className="text-sm text-slate-500">DNI: {reporte.dni} | {reporte.fechaExamen} {reporte.horaExamen}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => startEditReporte(reporte)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteReporte(reporte.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-1"><strong>Examen:</strong> {reporte.examenRealizado}</p>
                      <p className="text-sm text-slate-600 mb-1"><strong>Errores:</strong> {reporte.errores?.map(errId => { const err = errores.find(e => e.id === errId); return err ? err.nombre : errId; }).join(', ')}</p>
                      {reporte.descripcionCambio && (<p className="text-sm text-slate-600 mb-1"><strong>Cambio:</strong> {reporte.descripcionCambio}</p>)}
                      <p className="text-sm text-slate-500"><strong>Responsable:</strong> {reporte.tecnicoResponsable} | <strong>Reporta:</strong> {reporte.quienReporta}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'errores' && (
            <div>
              <div className="flex gap-2 mb-4">
                <input type="text" value={nuevoError} onChange={(e) => setNuevoError(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddError()} placeholder="Nuevo tipo de error..." className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                <button onClick={handleAddError} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-2"><Plus size={16} /> Agregar</button>
              </div>
              <div className="space-y-2">
                {errores.map(error => (
                  <div key={error.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-700">{error.nombre}</span>
                    <button onClick={() => handleDeleteError(error.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tecnicos' && (
            <div>
              <div className="flex gap-2 mb-4">
                <input type="text" value={nuevoTecnico} onChange={(e) => setNuevoTecnico(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddTecnico()} placeholder="Nombre del tecnólogo médico..." className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                <button onClick={handleAddTecnico} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-2"><Plus size={16} /> Agregar</button>
              </div>
              <div className="space-y-2">
                {tecnicos.map(tec => (
                  <div key={tec.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-700">{tec.nombre}</span>
                    <button onClick={() => handleDeleteTecnico(tec.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
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

