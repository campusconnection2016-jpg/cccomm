import React, { useState, useEffect, useRef } from "react";
import { translateTextApi, translateVoiceApi } from "../../api/endpoints";

console.log("📦 LanguagesTranslate loaded");

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
];

const MODES = [
  { value: "text-text", label: "Text → Text" },
  { value: "voice-text", label: "Voice → Text" },
  { value: "voice-voice", label: "Voice → Voice" },
];

const LanguagesTranslate = () => {
  const [mode, setMode] = useState("text-text");
  const [from, setFrom] = useState("en");
  const [to, setTo] = useState("hi");

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  // ===============================
  // 🎤 INIT SPEECH RECOGNITION
  // ===============================
  useEffect(() => {
    console.log("🎧 Init SpeechRecognition | lang:", from);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = from;
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
      console.log("🎙 Mic started");
      setListening(true);
    };

    recognition.onresult = (event) => {
      const text =
        event.results[event.results.length - 1][0].transcript;
      console.log("🎤 Heard:", text);
      setInput((prev) => (prev + " " + text).trim());
    };

    recognition.onerror = (e) => {
      console.error("❌ Mic error:", e);
      setError("Microphone error");
      setListening(false);
    };

    recognition.onend = () => {
      console.log("🛑 Mic stopped");
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, [from]);

  // ===============================
  // 🎤 START / STOP MIC
  // ===============================
  const startListening = () => {
    console.log("▶ Start speaking");
    setInput("");
    setOutput("");
    setError("");
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    console.log("⏹ Stop speaking");
    recognitionRef.current?.stop();
  };

  // ===============================
  // ✅ SUBMIT HANDLER (SMART)
  // ===============================
  const handleSubmit = async () => {
    console.log("✅ Submit | Mode:", mode);

    if (!input.trim()) {
      setError("No input provided");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1️⃣ Translate always
      console.log("📤 Translating text...");
      const textRes = await translateTextApi({
        text: input,
        source: from,
        target: to,
      });

      const translatedText = textRes.data.translatedText || "";
      console.log("📥 Translated:", translatedText);

      setOutput(translatedText);

      // 2️⃣ If Voice → Voice, auto speak
      if (mode === "voice-voice") {
        console.log("🔊 Generating voice output");

        const voiceRes = await translateVoiceApi({
          text: translatedText,
          source: to,
          target: to,
        });

        const audioUrl = URL.createObjectURL(voiceRes.data);
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Translation failed");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 🔄 SWAP LANG
  // ===============================
  const swapLanguages = () => {
    setFrom(to);
    setTo(from);
    setInput(output);
    setOutput(input);
  };

  return (
    <div className="form-ques">
      <h3>🌍 Language Translator</h3>

      {/* MODE SELECT */}
      <select value={mode} onChange={(e) => setMode(e.target.value)}>
        {MODES.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      <br /><br />

      {/* LANGUAGE SELECT */}
      <select value={from} onChange={(e) => setFrom(e.target.value)}>
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>

      <button onClick={swapLanguages}>↔</button>

      <select value={to} onChange={(e) => setTo(e.target.value)}>
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>

      <br /><br />

      {/* TEXT AREAS */}
      <div style={{ display: "flex", gap: "20px" }}>
        <textarea
          value={input}
          placeholder={
            mode === "text-text"
              ? "Type here"
              : "Use microphone to speak"
          }
          readOnly={mode !== "text-text"}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: "50%", height: "180px" }}
        />

        <textarea
          value={loading ? "Processing..." : output}
          readOnly
          style={{ width: "50%", height: "180px", background: "#f5f5f5" }}
        />
      </div>

      <br />

      {/* MIC CONTROLS */}
      {(mode === "voice-text" || mode === "voice-voice") && (
        <>
          <button onClick={startListening} disabled={listening}>
            🎤 Start Speaking
          </button>
          <button onClick={stopListening} disabled={!listening}>
            🛑 Stop
          </button>
        </>
      )}

      {listening && <p style={{ color: "green" }}>🎙 Listening...</p>}

      <br />

      {/* SUBMIT */}
      <button onClick={handleSubmit}>
        {mode === "voice-voice"
          ? "🔊 Translate & Speak"
          : "✅ Translate"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <audio ref={audioRef} hidden />
    </div>
  );
};

export default LanguagesTranslate;
