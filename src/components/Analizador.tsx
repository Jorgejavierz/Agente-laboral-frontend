import { useState } from "react";
import jsPDF from "jspdf";

// 🔗 Apunta al backend en Render
const API_BASE = "https://agente-abogado.onrender.com";

export default function Analizador() {
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<{ texto_formateado?: string } | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackEnviado, setFeedbackEnviado] = useState(false);

  const analizar = async () => {
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
    } catch (e) {
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
        Pegá el contrato o describí el conflicto. Recibirás normativa,
        jurisprudencia y una conclusión en formato narrativo.
      </p>

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
        }}
      />

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button onClick={analizar} disabled={cargando}>
          {cargando ? "Analizando…" : "Analizar"}
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

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={descargarPDF}>📄 Descargar PDF</button>
          </div>

          {!feedbackEnviado ? (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => enviarFeedback(true)}>👍 Útil</button>
              <button onClick={() => enviarFeedback(false)}>👎 No útil</button>
            </div>
          ) : (
            <p style={{ marginTop: 12, color: "green" }}>
              ¡Gracias por tu feedback!
            </p>
          )}
        </div>
      )}
    </div>
  );
}