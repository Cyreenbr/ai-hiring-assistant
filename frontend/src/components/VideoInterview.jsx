import React, { useState, useRef } from "react";

const API_BASE = "http://localhost:8000";

export default function VideoInterview() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  const [videoUrl, setVideoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [transcript, setTranscript] = useState(null);
  const [analyses, setAnalyses] = useState([]);

  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const videoRef = useRef(null);

  /* ---------------- Utils ---------------- */

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const button = {
    padding: "10px 14px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: 500,
  };

  /* ---------------- Recording ---------------- */

  const startRecording = async () => {
    setTranscript(null);
    setSeconds(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setVideoUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      setRecording(true);
    } catch {
      alert("Accès caméra et micro requis.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    clearInterval(timerRef.current);
    setRecording(false);
  };

  /* ---------------- Backend Calls ---------------- */

  const uploadVideo = async () => {
    if (!videoUrl) return;
    setUploading(true);
    const blob = await fetch(videoUrl).then((r) => r.blob());

    const form = new FormData();
    const filename = `interview_${Date.now()}.webm`;
    form.append("file", blob, filename);

    const res = await fetch(`${API_BASE}/api/interviews/upload`, { method: "POST", body: form });
    setResponse(await res.json());
    setUploading(false);
  };

  const requestTranscription = async () => {
    setTranscript("⏳ Transcription en cours...");
    const res = await fetch(
      `${API_BASE}/api/interviews/transcribe/${encodeURIComponent(response.filename)}`,
      { method: "POST" }
    );
    const j = await res.json();
    setTranscript(j.transcript || "❌ Erreur transcription");
  };

  const generateQuestions = async () => {
    setLoadingQuestions(true);
    const res = await fetch(`${API_BASE}/api/interviews/generate_questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const j = await res.json();
    setQuestions(j.questions || []);
    setCurrentQuestion(0);
    setLoadingQuestions(false);
  };

  const analyzeAnswer = async () => {
    setAnalyzing(true);
    const res = await fetch(
      `${API_BASE}/api/interviews/analyze/${encodeURIComponent(response.filename)}`,
      { method: "POST" }
    );
    const j = await res.json();
    setTranscript(j.transcript);
    setAnalyses((a) => [...a, j.analysis]);
    setAnalyzing(false);
  };

  const generateReport = async () => {
    setGeneratingReport(true);
    const res = await fetch(
      `${API_BASE}/api/interviews/report/${encodeURIComponent(response.filename)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions, analyses }),
      }
    );
    const j = await res.json();
    window.open(`${API_BASE}${j.download_url}`, "_blank");
    setGeneratingReport(false);
  };

  /* ---------------- UI ---------------- */

  return (
    <div style={{ maxWidth: 1100, margin: "auto" }}>
      <h2>🎥 Entretien vidéo assisté par IA</h2>
      <p style={{ color: "#6b7280" }}>
        Enregistrez votre réponse, obtenez une transcription, une analyse IA et un rapport final.
      </p>

      {/* VIDEO */}
      <div style={{ position: "relative" }}>
        <video ref={videoRef} muted style={{ width: "100%", borderRadius: 8, background: "#000" }} />
        {recording && (
          <div style={{ position: "absolute", top: 10, left: 10, color: "white" }}>
            🔴 {formatTime(seconds)}
          </div>
        )}
      </div>

      {/* STEP 1 */}
      <h3>Étape 1 — Enregistrement</h3>
      {!recording ? (
        <button style={{ ...button, background: "#4f46e5", color: "white" }} onClick={startRecording}>
          🎬 Démarrer
        </button>
      ) : (
        <button style={{ ...button, background: "#ef4444", color: "white" }} onClick={stopRecording}>
          ⏹ Arrêter
        </button>
      )}

      {/* STEP 2 */}
      <h3>Étape 2 — Envoi & transcription</h3>
      <button
        style={{ ...button, background: "#111827", color: "white", marginRight: 8 }}
        onClick={uploadVideo}
        disabled={uploading}
      >
        {uploading ? "⏳ Envoi..." : "📤 Envoyer la vidéo"}
      </button>

      {response && (
        <button style={button} onClick={requestTranscription}>
          📝 Transcrire
        </button>
      )}

      {/* TRANSCRIPTION */}
      {transcript && (
        <div style={{ marginTop: 12, background: "#f9fafb", padding: 12, borderRadius: 8 }}>
          <strong>Transcription</strong>
          <p style={{ whiteSpace: "pre-wrap" }}>{transcript}</p>
        </div>
      )}

      {/* STEP 3 */}
      <h3>Étape 3 — Analyse IA</h3>
      <button style={button} onClick={generateQuestions} disabled={loadingQuestions}>
        🤖 Générer questions
      </button>

      <button style={{ ...button, marginLeft: 8 }} onClick={analyzeAnswer} disabled={analyzing}>
        {analyzing ? "⏳ Analyse..." : "📊 Analyser réponse"}
      </button>

      {/* QUESTIONS */}
      {questions.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <strong>Question actuelle</strong>
          <p>{questions[currentQuestion]}</p>
        </div>
      )}

      {/* ANALYSES */}
      {analyses.map((a, i) => (
        <div key={i} style={{ marginTop: 12, background: "#eef2ff", padding: 10 }}>
          <strong>Analyse #{i + 1}</strong>
          <pre>{JSON.stringify(a, null, 2)}</pre>
        </div>
      ))}

      {/* STEP 4 */}
      <h3>Étape 4 — Rapport final</h3>
      <button
        style={{ ...button, background: "#16a34a", color: "white" }}
        onClick={generateReport}
        disabled={generatingReport || analyses.length === 0}
      >
        {generatingReport ? "⏳ Génération..." : "📄 Générer rapport"}
      </button>
    </div>
  );
}
