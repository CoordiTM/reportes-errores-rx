import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Send, Calendar, Clock, User, FileText, AlertTriangle, Users, X, Edit3 } from 'lucide-react';
import { addReporte, getCatalogoErrores, getTecnicos, getDefaultErrores, getDefaultTecnicos } from '../services/dbService';

export default function FormularioReporte({ onReporteEnviado }) {
  const [formData, setFormData] = useState({
    dni: '',
    nombres: '',
    fechaExamen: new Date().toISOString().split('T')[0],
    horaExamen: new Date().toTimeString().slice(0, 5),
    examenRealizado: '',
    errores: [],
    descripcionCambio: '',
    tecnicoResponsable: '',
    quienReporta: ''
  });

  const [erroresCatalogo, setErroresCatalogo] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadCatalogos();
  }, []);

  const loadCatalogos = async () => {
    try {
      const [errData, tecData] = await Promise.all([
        getCatalogoErrores(),
        getTecnicos()
      ]);
      setErroresCatalogo(errData.length > 0 ? errData : getDefaultErrores());
      setTecnicos(tecData.length > 0 ? tecData : getDefaultTecnicos());
    } catch (error) {
      console.error('Error cargando catálogos:', error);
      setErroresCatalogo(getDefaultErrores());
      setTecnicos(getDefaultTecnicos());
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleErrorCheck = (errorId) => {
    setFormData(prev => {
      const errores = prev.errores.includes(errorId)
        ? prev.errores.filter(e => e !== errorId)
        : [...prev.errores, errorId];
      return { ...prev, errores };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.dni || !formData.nombres || !formData.examenRealizado || 
        formData.errores.length === 0 || !formData.tecnicoResponsable || !formData.quienReporta) {
      setMensaje({ tipo: 'error', texto: 'Completa todos los campos obligatorios' });
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await addReporte(formData);
      setMensaje({ tipo: 'exito', texto: '✅ Reporte enviado correctamente' });
      setFormData({
        dni: '',
        nombres: '',
        fechaExamen: new Date().toISOString().split('T')[0],
        horaExamen: new Date().toTimeString().slice(0, 5),
        examenRealizado: '',
        errores: [],
        descripcionCambio: '',
        tecnicoResponsable: '',
        quienReporta: ''
      });
      if (onReporteEnviado) onReporteEnviado();
    } catch (error) {
      setMensaje({ tipo: 'error', texto: '❌ Error al enviar: ' + error.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMensaje(null), 5000);
    }
  };

  const getErroresNombres = () => {
    return formData.errores.map(id => {
      const err = erroresCatalogo.find(e => e.id === id);
      return err ? err.nombre : id;
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Reportar Error de Rx</h2>
            <p className="text-sm text-slate-500">Completa todos los campos obligatorios</p>
          </div>
        </div>

        {mensaje && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {mensaje.tipo === 'exito' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-medium">{mensaje.texto}</span>
          </div>
        )}

        {/* Modal de Confirmación */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">📋 Confirmar Reporte</h3>
                <button onClick={() => setShowConfirm(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-4">Verifica que los datos sean correctos:</p>

              <div className="space-y-2 mb-6 bg-slate-50 p-4 rounded-xl">
                <p className="text-sm"><strong>DNI:</strong> {formData.dni}</p>
                <p className="text-sm"><strong>Paciente:</strong> {formData.nombres}</p>
                <p className="text-sm"><strong>Fecha:</strong> {formData.fechaExamen} | <strong>Hora:</strong> {formData.horaExamen}</p>
                <p className="text-sm"><strong>Examen:</strong> {formData.examenRealizado}</p>
                <p className="text-sm"><strong>Errores:</strong> {getErroresNombres().join(', ')}</p>
                {formData.descripcionCambio && (
                  <p className="text-sm"><strong>Cambio:</strong> {formData.descripcionCambio}</p>
                )}
                <p className="text-sm"><strong>Responsable:</strong> {formData.tecnicoResponsable}</p>
                <p className="text-sm"><strong>Reporta:</strong> {formData.quienReporta}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition font-medium flex items-center justify-center gap-2"
                >
                  <Edit3 size={16} />
                  Editar
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl hover:from-red-600 hover:to-orange-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Confirmar y Enviar
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Fila 1: DNI y Nombres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <span className="text-red-500">*</span> DNI Correcto
              </label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                placeholder="12345678"
                maxLength="8"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <span className="text-red-500">*</span> Apellidos y Nombres Correctos
              </label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                placeholder="Apellidos, Nombres"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Fila 2: Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Calendar size={14} className="inline mr-1" />
                Fecha de Examen
              </label>
              <input
                type="date"
                name="fechaExamen"
                value={formData.fechaExamen}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Clock size={14} className="inline mr-1" />
                Hora de Examen
              </label>
              <input
                type="time"
                name="horaExamen"
                value={formData.horaExamen}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Fila 3: Examen Realizado */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <FileText size={14} className="inline mr-1" />
              <span className="text-red-500">*</span> Examen Realizado
            </label>
            <input
              type="text"
              name="examenRealizado"
              value={formData.examenRealizado}
              onChange={handleChange}
              placeholder="Ej: Radiografía de tórax PA"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
            />
          </div>

          {/* Fila 4: Error (Multi-check) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              <AlertCircle size={14} className="inline mr-1" />
              <span className="text-red-500">*</span> Error (selecciona uno o más)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {erroresCatalogo.map(error => (
                <label
                  key={error.id}
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                    formData.errores.includes(error.id)
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.errores.includes(error.id)}
                    onChange={() => handleErrorCheck(error.id)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm">{error.nombre}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fila 5: Descripción del Cambio */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Describe el Cambio / Eliminación
            </label>
            <textarea
              name="descripcionCambio"
              value={formData.descripcionCambio}
              onChange={handleChange}
              placeholder="Describe detalladamente qué se debe corregir o eliminar..."
              rows="3"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition resize-none"
            />
          </div>

          {/* Fila 6: Tecnólogos Médicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <User size={14} className="inline mr-1" />
                <span className="text-red-500">*</span> Tecnólogo Médico Responsable
              </label>
              <select
                name="tecnicoResponsable"
                value={formData.tecnicoResponsable}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition bg-white"
              >
                <option value="">Selecciona...</option>
                {tecnicos.map(tec => (
                  <option key={tec.id} value={tec.nombre}>{tec.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Users size={14} className="inline mr-1" />
                <span className="text-red-500">*</span> Tecnólogo Médico que Reporta
              </label>
              <select
                name="quienReporta"
                value={formData.quienReporta}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition bg-white"
              >
                <option value="">Selecciona...</option>
                {tecnicos.map(tec => (
                  <option key={tec.id} value={tec.nombre}>{tec.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Botón Enviar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-700 transition shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Revisar y Enviar Reporte
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
