// src/screens/WeightTrackingScreen.jsx
import { useState, useEffect } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"

export default function WeightTrackingScreen({ supabase, user, onBack }) {
  const [logs, setLogs]               = useState([])
  const [weightInput, setWeightInput] = useState("")
  const [noteInput, setNoteInput]     = useState("")
  const [saving, setSaving]           = useState(false)
  const [loading, setLoading]         = useState(true)
  const [saved, setSaved]             = useState(false)

  useEffect(() => {
    loadLogs()
  }, [])

  async function loadLogs() {
    setLoading(true)
    const { data } = await supabase
      .from("weight_logs")
      .select("id, logged_at, weight_kg, note")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: true })
      .limit(90)
    setLogs(data || [])
    setLoading(false)
  }

  async function saveWeight() {
    const kg = parseFloat(weightInput)
    if (!kg || kg < 20 || kg > 300) return
    setSaving(true)
    const today = new Date().toISOString().slice(0, 10)
    await supabase.from("weight_logs").upsert(
      { user_id: user.id, logged_at: today, weight_kg: kg, note: noteInput.trim() || null },
      { onConflict: "user_id,logged_at" }
    )
    setWeightInput("")
    setNoteInput("")
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    await loadLogs()
    setSaving(false)
  }

  async function deleteLog(id) {
    await supabase.from("weight_logs").delete().eq("id", id)
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  const chartData = logs.map(l => ({
    fecha: new Date(l.logged_at + "T00:00:00").toLocaleDateString("es-AR", {
      day: "numeric", month: "short"
    }),
    kg: parseFloat(l.weight_kg),
  }))

  return (
    <>
      <header className="dash-hdr">
        <h1 className="dash-title">MI PESO</h1>
        <button className="hdr-auth-btn" onClick={onBack}>← Volver</button>
      </header>

      <section className="dash-body">
        {/* Formulario */}
        <section className="weight-form">
          <h2 className="week-lbl">Registrar hoy</h2>
          <div className="weight-inputs">
            <input
              className="auth-input"
              type="number"
              min="20"
              max="300"
              step="0.1"
              placeholder="75.5"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              aria-label="Peso en kg"
            />
            <span className="weight-unit">kg</span>
          </div>
          <input
            className="auth-input weight-note"
            type="text"
            placeholder="Nota opcional (ej: en ayunas)"
            value={noteInput}
            onChange={e => setNoteInput(e.target.value)}
            maxLength={80}
          />
          <button
            className="gbtn"
            onClick={saveWeight}
            disabled={saving || !weightInput}
          >
            {saved ? "✓ GUARDADO" : saving ? "GUARDANDO..." : "GUARDAR"}
          </button>
        </section>

        {/* Gráfica */}
        {logs.length >= 2 && (
          <section>
            <h2 className="week-lbl">Tu evolución</h2>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: "#888" }} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#888" }} />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid #444", borderRadius: 6 }}
                  labelStyle={{ color: "#fff" }}
                  itemStyle={{ color: "#ff6400" }}
                />
                <Line
                  type="monotone"
                  dataKey="kg"
                  stroke="#ff6400"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#ff6400" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Historial */}
        <section>
          <h2 className="week-lbl">Historial</h2>
          {loading ? (
            <p className="dash-empty">Cargando...</p>
          ) : logs.length === 0 ? (
            <p className="dash-empty">Todavía no registraste ningún peso.</p>
          ) : (
            <div className="hist-list">
              {[...logs].reverse().map(log => (
                <article key={log.id} className="hist-item">
                  <div className="hist-dot" style={{ background: "#ff6400" }} />
                  <div className="hist-info">
                    <div className="hist-title">
                      {parseFloat(log.weight_kg)} kg
                      {log.note && <span className="weight-log-note"> — {log.note}</span>}
                    </div>
                    <div className="hist-meta">
                      {new Date(log.logged_at + "T00:00:00").toLocaleDateString("es-AR", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </div>
                  </div>
                  <button
                    className="weight-del-btn"
                    onClick={() => deleteLog(log.id)}
                    aria-label="Eliminar registro"
                    type="button"
                  >
                    🗑
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </>
  )
}
