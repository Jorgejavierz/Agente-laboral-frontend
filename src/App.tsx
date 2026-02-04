import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import Analizador from './components/Analizador'
import Historial from './components/Historial'

function App() {
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Agente Abogado Laboral</h1>

      <div className="card">
        <Analizador />
        <Historial />
      </div>

      <p className="read-the-docs">
        Proyecto con Vite + React + TypeScript, conectado al backend en Render
      </p>
    </>
  )
}

export default App