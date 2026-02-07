import { useState } from "react";
import jsPDF from "jspdf";
import { FaBalanceScale } from "react-icons/fa"; // Ícono profesional

const API_BASE = "https://agente-abogado.onrender.com";
const MAX_FILE_SIZE_MB = 10;

export default function Analizador() {
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackEnviado, setFeedbackEnviado] = useState(false);

  const enviarArchivoAlBackend = async (file: File) => {
    if (cargando) return;
    setCargando(true);
    setError(null);
    setResultado(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/analizar`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResultado(data);
        if (data.texto) setTexto(data.texto);
      }
    } catch {
      setError("No se pudo analizar el archivo. Intentá más tarde.");
    } finally {
      setCargando(false);
    }
  };

  const manejarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`El archivo supera el límite de ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    enviarArchivoAlBackend(file);
  };

  const manejarDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`El archivo supera el límite de ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    enviarArchivoAlBackend(file);
  };

  const analizarTextoPegado = async () => {
    if (cargando) return;
    setCargando(true);
    setError(null);
    setResultado(null);
    setFeedbackEnviado(false);

    try {
      const res = await fetch(`${API_BASE}/analizar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResultado(data);
      }
    } catch {
      setError("No se pudo analizar. Revisá el texto o intentá más tarde.");
    } finally {
      setCargando(false);
    }
  };

  const enviarFeedback = async (util: boolean) => {
    try {
      await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto,
          util,
          timestamp: new Date().toISOString(),
        }),
      });
      setFeedbackEnviado(true);
    } catch {
      // si falla, no bloquea la UX
    }
  };

  const descargarPDF = () => {
    if (!resultado?.texto_formateado) return;
    const doc = new jsPDF();
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.text(resultado.texto_formateado, 10, 10, { maxWidth: 190 });
    doc.save("informe_agente_abogado.pdf");
  };

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: 24,
        backgroundImage: "url('/fondo-legal.jpg')", // 👈 imagen en carpeta public
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        color: "#f5f5f5",
        fontFamily: "Georgia, serif",
        backdropFilter: "brightness(0.6)", // oscurece para dar seriedad
      }}
    >
      <h1
        style={{
          fontWeight: 700,
          fontSize: 24,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: "#f5f5f5",
        }}
      >
        <FaBalanceScale /> Agente Abogado Laboral
      </h1>
      <p style={{ color: "#ddd" }}>Subí o arrastrá el archivo aquí.</p>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Pegá aquí el contrato o conflicto..."
        rows={10}
        style={{
          width: "100%",
          padding: 12,
          border: "1px solid #444",
          borderRadius: 8,
          marginBottom: 12,
          backgroundColor: "rgba(28,28,28,0.8)",
          color: "#f5f5f5",
        }}
      />

      <input
        type="file"
        accept=".txt,.pdf,.docx"
        onChange={manejarArchivo}
        style={{ marginBottom: 12, color: "#f5f5f5" }}
      />

      <div
        onDrop={manejarDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: "2px dashed #666",
          borderRadius: 8,
          padding: 24,
          textAlign: "center",
          color: "#ccc",
          marginBottom: 12,
          backgroundColor: "rgba(28,28,28,0.6)",
        }}
      >
        Arrastrá tu archivo aquí (máx. {MAX_FILE_SIZE_MB} MB)
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button
          onClick={analizarTextoPegado}
          disabled={cargando || !texto}
          style={{
            backgroundColor: cargando ? "#888" : "#007BFF",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: cargando ? "not-allowed" : "pointer",
            fontWeight: 600,
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
            transition: "background-color 0.3s ease",
          }}
        >
          {cargando ? "Analizando…" : "Analizar texto pegado"}
        </button>
      </div>

      {error && <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>}

      {resultado?.texto_formateado && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            border: "1px solid #444",
            borderRadius: 8,
            background: "rgba(28,28,28,0.8)",
            whiteSpace: "pre-wrap",
            fontFamily: "Georgia, serif",
            lineHeight: 1.6,
            color: "#f5f5f5",
          }}
        >
          <h2 style={{ fontWeight: 700, fontSize: 18 }}>Informe narrativo</h2>
          {resultado.texto_formateado}

          {resultado.json?.oct && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16 }}>🔎 Resultados OCT</h3>
              <p><strong>Clasificación OCT:</strong> {resultado.json.oct.clasificacion_oct}</p>
              <p><strong>Riesgos OCT:</strong> {resultado.json.oct.riesgos_oct}</p>
              <p><strong>Recomendaciones OCT:</strong> {resultado.json.oct.recomendaciones_oct}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={descargarPDF}>📄 Descargar PDF</button>
          </div>

          {!feedbackEnviado ? (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => enviarFeedback(true)}>👍 Útil</button>
              <button onClick={() => enviarFeedback(false)}>👎 No útil</button>
            </div>
          ) : (
            <p style={{ marginTop: 12, color: "lightgreen" }}>¡Gracias por tu feedback!</p>
          )}
        </div>
      )}
    </div>
  );
}