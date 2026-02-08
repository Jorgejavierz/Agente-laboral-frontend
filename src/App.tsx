import './App.css';

import Analizador from './components/Analizador';
import Historial from './components/Historial';

function App() {
  return (
    <div className="overlay">
      {/* Encabezado */}
      <header style={{ marginBottom: 24, textAlign: 'center' }}>
        <h1>Agente Abogado Laboral</h1>
      </header>

      {/* Sección principal */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        <section className="card">
          <Analizador />
        </section>

        <section className="card">
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