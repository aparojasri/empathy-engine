import { useState } from 'react'
import axios from 'axios'
import {
  Cpu,
  Activity,
  Volume2,
  Download,
  AlertCircle,
  Zap,
  Gauge,
} from 'lucide-react'
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'

function App() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [audioUrl, setAudioUrl] = useState(null)
  // eslint-disable-next-line no-unused-vars
  const [isPlaying, setIsPlaying] = useState(false)

  // Emotion to color mapping for dynamic border glow
  const emotionMap = {
    joy: { color: '#f59e0b', icon: '✨', label: 'JOY', glowClass: 'border-glow-joy' },
    sadness: { color: '#6366f1', icon: '💙', label: 'SADNESS', glowClass: 'border-glow-sadness' },
    anger: { color: '#ef4444', icon: '🔥', label: 'ANGER', glowClass: 'border-glow-anger' },
    neutral: { color: '#94a3b8', icon: '◆', label: 'NEUTRAL', glowClass: 'border-glow-neutral' },
    fear: { color: '#a78bfa', icon: '⚡', label: 'FEAR', glowClass: 'border-glow-fear' },
    disgust: { color: '#10b981', icon: '🌿', label: 'DISGUST', glowClass: 'border-glow-disgust' },
    surprise: { color: '#ec4899', icon: '✦', label: 'SURPRISE', glowClass: 'border-glow-surprise' },
  }

  const currentEmotion = result ? emotionMap[result.emotion] : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) {
      setError('Please enter narrative text for analysis')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setAudioUrl(null)

    try {
      const response = await axios.post('http://localhost:5000/process', {
        text: text,
      })
      setResult(response.data)
      setAudioUrl(`http://localhost:5000${response.data.audio_url}`)
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Backend connection failed. Verify service is running at http://localhost:5000'
      )
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResult(null)
    setAudioUrl(null)
    setText('')
    setError('')
  }

  return (
    <div className="full-screen bg-diagnostic-dark">
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-panel p-12 max-w-sm text-center border border-cyan-500/30"
            >
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-8 flex justify-center"
              >
                <Cpu className="w-16 h-16 text-cyan-400" style={{ filter: 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.6))' }} />
              </motion.div>
              <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="text-lg font-mono text-cyan-300 mb-3"
              >
                Analyzing Input for Emotional Classification… 🔍
              </motion.p>
              <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.2 }}
                className="text-xs font-mono text-slate-400"
              >
                Performing frequency analysis
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diagnostic Grid Layout */}
      <div className="h-screen w-screen overflow-hidden grid grid-cols-12 gap-4 p-6">
        {/* Top Header - Spans Full Width */}
        <div className="col-span-12 flex items-center justify-between mb-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-white font-sans">🧠 The Empathy Engine</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">🎵 Emotional Prosody Synthesis Service</p>
          </motion.div>
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-2 h-2 bg-green-500 rounded-full"
            style={{ boxShadow: '0 0 8px rgba(34, 197, 94, 0.8)' }}
          />
        </div>

        {/* LEFT PANEL: Control Room (5 columns) */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="col-span-5 glass-panel border border-slate-700/50 rounded-2xl flex flex-col overflow-hidden focus-within:ring-2 focus-within:ring-cyan-500/50 focus-within:border-cyan-500/30 transition-all"
        >
          {/* Control Room Header */}
          <div className="p-6 border-b border-slate-700/30 bg-gradient-to-r from-slate-900/40 to-transparent">
            <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-1">
              <Activity className="w-5 h-5 text-cyan-400" style={{ filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.4))' }} />
              📝 Source Text Input
            </h2>
            <p className="text-xs text-slate-400 font-mono">Dynamically modulating vocal characteristics based on detected emotional resonance</p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 gap-5 overflow-y-auto">
            {/* Text Area */}
            <div className="space-y-3 flex-1 flex flex-col">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-widest">$ 📖 Source narrative text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter emotional narrative…"
                className="flex-1 p-4 bg-slate-950/80 border border-slate-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/40 text-slate-100 placeholder-slate-600 font-mono text-sm leading-relaxed"
              />
            </div>

            {/* Primary Action */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 border border-cyan-400/60"
              style={{
                boxShadow: loading
                  ? 'none'
                  : '0 0 24px rgba(34, 211, 238, 0.4), 0 0 48px rgba(34, 211, 238, 0.1)',
              }}
            >
              <motion.div
                animate={{
                  rotate: loading ? 360 : [0, 8, -8, 0],
                  scale: loading ? 1.1 : 1,
                }}
                transition={{
                  duration: loading ? 2 : 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Zap className="w-4 h-4" />
              </motion.div>
              {loading ? 'Analyzing… ⏳' : '✨ Synthesize Empathic Voice'}
            </motion.button>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-900/30 border border-red-500/60 rounded-lg p-4 flex gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono text-xs text-red-300 font-bold">ERROR_DIAGNOSTIC</p>
                    <p className="text-red-200/80 text-xs mt-1">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* RIGHT PANEL: Analysis Engine (7 columns) */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="col-span-7 glass-panel border border-slate-700/50 rounded-2xl flex flex-col overflow-hidden"
        >
          {/* Analysis Header */}
          <div className="p-6 border-b border-slate-700/30 bg-gradient-to-r from-slate-900/40 to-transparent flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block" style={{ boxShadow: '0 0 8px rgba(52, 211, 153, 0.6)' }} />
              </motion.div>
              🎵 Expressive Audio Output
            </h2>
            {result && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={clearResults}
                className="text-xs text-slate-400 hover:text-cyan-400 font-mono uppercase tracking-widest"
              >
                [RESET]
              </motion.button>
            )}
          </div>

          {/* Results Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Emotion Display Card */}
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`border-2 rounded-xl p-8 glass-panel ${currentEmotion.glowClass} transition-all`}
                  >
                    <div className="text-center">
                      <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3">😊 Detected Emotion Category</p>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-7xl mb-5"
                      >
                        {currentEmotion.icon}
                      </motion.div>
                      <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-4xl font-black uppercase tracking-wider mb-6"
                        style={{ color: currentEmotion.color, textShadow: `0 0 20px ${currentEmotion.color}40` }}
                      >
                        {currentEmotion.label}
                      </motion.h3>
                      <div className="inline-block px-8 py-3 rounded-full font-mono font-bold text-3xl border-2" style={{ color: currentEmotion.color, borderColor: currentEmotion.color, boxShadow: `0 0 20px ${currentEmotion.color}40` }}>
                        {(result.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  </motion.div>

                  {/* Confidence Gauge */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-cyan-400" />
                      <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">📊 Neural Classification Confidence</p>
                    </div>
                    <div className="relative h-3 bg-slate-800/60 rounded-full border border-slate-700 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence * 100}%` }}
                        transition={{ duration: 1.4, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                        style={{ boxShadow: `0 0 16px rgba(34, 211, 238, 0.8)` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-mono text-slate-500">
                      <span>0%</span>
                      <span className="text-cyan-400">{(result.confidence * 100).toFixed(0)}%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Vocal Parameter Modulation */}
                  <div className="glass-panel border border-slate-700 rounded-lg p-4">
                    <p className="text-xs font-mono text-slate-400 mb-3 uppercase tracking-widest">🎚️ Vocal Parameter Modulation</p>
                    <div className="space-y-2 mb-3">
                      <p className="text-slate-300 text-sm"><span className="text-cyan-400 font-bold">⏱️ Rate:</span> Dynamically adjusted</p>
                      <p className="text-slate-300 text-sm"><span className="text-cyan-400 font-bold">🎼 Pitch:</span> Emotionally modulated</p>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed italic font-light">"{ result.text }"</p>
                  </div>

                  {/* Audio Player */}
                  {audioUrl && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-cyan-400" />
                        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">🔊 Expressive Audio Output</p>
                      </div>
                      <div className="glass-panel border border-slate-700 rounded-lg p-4">
                        <audio
                          controls
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                          onEnded={() => setIsPlaying(false)}
                          className="w-full audio-player"
                          src={audioUrl}
                          style={{ accentColor: '#06b6d4' }}
                        >
                          Your browser does not support audio playback.
                        </audio>
                      </div>

                      {/* Download Button */}
                      <motion.a
                        href={audioUrl}
                        download={`emotion_${result.emotion}_${new Date().toISOString().slice(0, 19)}.mp3`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-600/60 to-teal-600/60 hover:from-emerald-500/80 hover:to-teal-500/80 border border-emerald-400/70 text-emerald-100 font-mono font-bold py-3 rounded-lg transition-all uppercase text-xs tracking-widest"
                        style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)' }}
                      >
                        <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
                          <Download className="w-4 h-4" />
                        </motion.div>
                        Export Audio
                      </motion.a>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full"
                >
                  <motion.div
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-16 h-16 rounded-full border-2 border-slate-700 border-t-cyan-400 mb-8"
                  />
                  <h3 className="text-xl font-bold text-slate-300 mb-2 font-mono">⏳ Awaiting Input</h3>
                  <p className="text-slate-500 text-xs font-mono text-center max-w-xs">
                    Awaiting source text for prosody modulation… 🎤
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default App
