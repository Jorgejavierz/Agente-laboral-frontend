import { useState } from "react";
import jsPDF from "jspdf";

const API_BASE = "https://agente-abogado.onrender.com";
const MAX_FILE_SIZE_MB = 10;

export default function Analizador() {
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackEnviado, setFeedbackEnviado] = useState(false);

  // Enviar archivo directo al backend
  const enviarArchivoAlBackend = async (file: File) => {
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
        if (data.texto) setTexto(data.texto); // mostrar texto procesado si el backend lo devuelve
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

  // Analizar texto pegado manualmente
  const analizarTextoPegado = async () => {
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
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontWeight: 700, fontSize: 24 }}>Agente Abogado Laboral</h1>
      <p style={{ color: "#555" }}>
        Pegá el contrato, subí un archivo o arrastralo aquí. El agente procesará
        el documento y devolverá normativa, jurisprudencia, OCT y una conclusión.
      </p>

      {/* Textarea */}
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Pegá aquí el contrato o conflicto..."
        rows={10}
        style={{
          width: "100%",
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
          marginBottom: 12,
        }}
      />

      {/* Input de archivo */}
      <input
        type="file"
        accept=".txt,.pdf,.docx"
        onChange={manejarArchivo}
        style={{ marginBottom: 12 }}
      />

      {/* Área drag & drop */}
      <div
        onDrop={manejarDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: "2px dashed #aaa",
          borderRadius: 8,
          padding: 24,
          textAlign: "center",
          color: "#555",
          marginBottom: 12,
        }}
      >
        Arrastrá tu archivo aquí (máx. {MAX_FILE_SIZE_MB} MB)
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button onClick={analizarTextoPegado} disabled={cargando || !texto}>
          {cargando ? "Analizando…" : "Analizar texto pegado"}
        </button>
      </div>

      {error && <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>}

      {resultado?.texto_formateado && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            border: "1px solid #eee",
            borderRadius: 8,
            background: "#fafafa",
            whiteSpace: "pre-wrap",
            fontFamily: "Georgia, serif",
            lineHeight: 1.6,
          }}
        >
          <h2 style={{ fontWeight: 700, fontSize: 18 }}>Informe narrativo</h2>
          {resultado.texto_formateado}

          {/* Bloque OCT explícito */}
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
            <p style={{ marginTop: 12, color: "green" }}>¡Gracias por tu feedback!</p>
          )}
        </div>
      )}
    </div>
  );
}