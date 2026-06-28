# Reportes de Errores de Rx - HNASS

Sistema de reporte de errores de radiología para el Hospital Nacional Alberto Sabogal Sologuren.

## Stack Tecnológico

- **React 18**
- **Firebase Firestore**
- **Tailwind CSS** (via CDN)
- **GitHub Pages**
- **Lucide React**

## Características

- 📝 Formulario de reporte de errores de Rx
- ✅ Multi-check para tipos de error (admin puede agregar/quitar)
- 👥 Listas desplegables de técnicos (admin puede agregar/quitar)
- 🔧 Panel admin con tabs: Reportes, Tipos de Error, Técnicos
- 💾 Persistencia en Firebase Firestore
- 📤 Exportar reportes a TXT

## Campos del Formulario

| # | Campo | Tipo |
|---|-------|------|
| 1 | DNI Correcto | Texto |
| 2 | Apellidos y Nombres Correctos | Texto |
| 3 | Fecha de Examen | Date |
| 4 | Hora de Examen | Time |
| 5 | Examen Realizado | Texto libre |
| 6 | Error | Multi-check (editable por admin) |
| 7 | Describe el Cambio/Eliminación | Textarea |
| 8 | Tecnólogo Responsable | Lista desplegable (editable por admin) |
| 9 | Quien Reporta | Lista desplegable (editable por admin) |

## Configuración Inicial

### 1. Clonar e instalar

```bash
git clone https://github.com/CoordiTM/reportes-errores-rx.git
cd reportes-errores-rx
npm install
```

### 2. Ejecutar en local

```bash
npm start
```

### 3. Despliegue (GitHub Actions automático)

```bash
git add .
git commit -m "Update"
git push origin main
```

## Panel Admin

1. Click en el icono ⚙️ (esquina superior derecha)
2. Clave: `Essalud2025*`
3. Tabs disponibles:
   - **Reportes**: Ver todos, buscar, exportar TXT, eliminar
   - **Tipos de Error**: Agregar/quitar tipos de error del multi-check
   - **Técnicos**: Agregar/quitar nombres de las listas desplegables

## Base de Datos Firebase

Colecciones:
- `reportes_errores_rx` — Reportes enviados
- `catalogo_errores` — Tipos de error disponibles
- `tecnicos_lista` — Lista de técnicos

## Estructura

```
.
├── .github/workflows/deploy.yml
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── firebase.js
│   ├── index.css
│   ├── index.js
│   ├── components/
│   │   ├── FormularioReporte.js
│   │   └── AdminPanel.js
│   └── services/
│       └── dbService.js
├── package.json
└── README.md
```
