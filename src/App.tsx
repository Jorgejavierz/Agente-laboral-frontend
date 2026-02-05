import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

import Analizador from './components/Analizador';
import Historial from './components/Historial';

function App() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Encabezado con logos */}
      <header style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <h1 style={{ marginLeft: 16 }}>Agente Abogado Laboral</h1>
      </header>

      {/* Sección principal */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        <section style={{ marginBottom: 32 }}>
          <Analizador />
        </section>

        <section>
          <Historial />
        </section>
      </main>

      {/* Pie de página */}
      <footer style={{ marginTop: 40, textAlign: 'center', color: '#555' }}>
        <p>
          Proyecto con Vite + React + TypeScript, conectado al backend en Render
        </p>
      </footer>
    </div>
  );
}

export default App;