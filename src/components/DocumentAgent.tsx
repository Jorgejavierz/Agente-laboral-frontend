import React, { useState } from "react";

interface Informe {
  consulta: string;
  explicacion_doctrinal: string;
  normativa_aplicable: string[];
  jurisprudencia_relevante: string;
  fallos_relacionados: any[];
  clasificacion: string;
  riesgos_legales: string;
  recomendaciones: string;
  conclusion: string;
  fuente: string;
}

function DocumentAgent() {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<Informe | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Selecciona un PDF primero");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const resp = await fetch("http://localhost:8000/upload_document", {
      method: "POST",
      body: formData,
    });

    const data = await resp.json();
    alert("Documento cargado: " + data.mensaje);
  };

  const handleAsk = async () => {
    if (!question) {
      alert("Escribe una pregunta");
      return;
    }

    const resp = await fetch(
      `http://localhost:8000/consultar_documento?pregunta=${encodeURIComponent(
        question
      )}&k=3`
    );

    const data = await resp.json();
    setAnswer(data.informe); // 👈 ahora guardamos el informe narrativo
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Agente Laboral</h1>

      {/* Subir PDF */}
      <div style={{ marginBottom: "20px" }}>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button onClick={handleUpload} style={{ marginLeft: "10px" }}>
          Subir documento
        </button>
      </div>

      {/* Consultar */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Escribe tu pregunta..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ width: "300px", marginRight: "10px" }}
        />
        <button onClick={handleAsk}>Consultar</button>
      </div>

      {/* Mostrar informe narrativo */}
      {answer && (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}>
          <h2>Informe generado</h2>
          <p><strong>Consulta:</strong> {answer.consulta}</p>
          <p><strong>Clasificación:</strong> {answer.clasificacion}</p>
          <p><strong>Explicación doctrinal:</strong> {answer.explicacion_doctrinal}</p>
          <p><strong>Normativa aplicable:</strong> {answer.normativa_aplicable.join(", ")}</p>
          <p><strong>Jurisprudencia relevante:</strong> {answer.jurisprudencia_relevante}</p>
          <p><strong>Riesgos legales:</strong> {answer.riesgos_legales}</p>
          <p><strong>Recomendaciones:</strong> {answer.recomendaciones}</p>
          <p><strong>Conclusión:</strong> {answer.conclusion}</p>
          <p><strong>Fuente:</strong> {answer.fuente}</p>
        </div>
      )}
    </div>
  );
}

export default DocumentAgent;