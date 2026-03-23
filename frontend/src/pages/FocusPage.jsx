import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Play, Pause, RotateCcw, Coffee, Zap, Moon, Sun, Volume2, Music, Camera, Shield, ShieldAlert, Eye, EyeOff } from 'lucide-react';

export default function FocusPage({ timerControls }) {
  const { 
    time, isRunning, isPaused, startTime, 
    onStart, onPause, onStop, setTime 
  } = timerControls;

  const [mode, setMode] = useState('study'); // study, shortBreak, longBreak
  const [sessions, setSessions] = useState(0);
  
  // Focus Guardian States
  const [isGuardianActive, setIsGuardianActive] = useState(false);
  const [noPersonDetected, setNoPersonDetected] = useState(false);
  const [camError, setCamError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
   const guardianIntervalRef = useRef(null);
   const lastFrameData = useRef(null);
   const alertAudioRef = useRef(new Audio('/fahhhhh.mp3'));

   useEffect(() => {
     alertAudioRef.current.load();
     alertAudioRef.current.loop = true; // Loop while absence is detected
   }, []);

  const modeDurations = {
    study: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  const currentDuration = modeDurations[mode];
  const timeLeft = Math.max(0, currentDuration - time);

  const handleModeSwitch = (newMode) => {
    onStop();
    setMode(newMode);
    
    // Play sound notification
    const notification = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    notification.play().catch(e => console.log('Notification sound blocked:', e));
  };

  useEffect(() => {
    if (time >= currentDuration && isRunning) {
      onStop();
      if (mode === 'study') {
        const nextSession = sessions + 1;
        setSessions(nextSession);
        if (nextSession % 4 === 0) {
          handleModeSwitch('longBreak');
        } else {
          handleModeSwitch('shortBreak');
        }
      } else {
        handleModeSwitch('study');
      }
    }
  }, [time, isRunning, mode, currentDuration]);

  const toggleTimer = () => {
    if (isRunning) onPause();
    else onStart();
  };
  
  const resetTimer = () => {
    onStop();
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const [activeAmbience, setActiveAmbience] = useState(null);
  const audioRef = useRef(null);

  const ambienceTracks = {
    'Lo-fi Beats': 'https://louspirit.github.io/lofi-music/track1.mp3',
    'Rainy Cafe': 'https://www.soundjay.com/nature/rain-01.mp3',
    'Forest Rain': 'https://www.soundjay.com/nature/forest-1.mp3',
    'White Noise': 'https://www.soundjay.com/mechanical/sounds/fan-1.mp3'
  };

  const handleAmbienceToggle = (track) => {
    if (activeAmbience === track) {
      audioRef.current.pause();
      setActiveAmbience(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newAudio = new Audio(ambienceTracks[track]);
      newAudio.loop = true;
      newAudio.play().catch(e => console.log('Audio play blocked:', e));
      audioRef.current = newAudio;
      setActiveAmbience(track);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopGuardian();
    };
  }, []);

  // Handle Stream Attachment when active
  useEffect(() => {
    let stream = null;
    let interval = null;

    const startCamera = async () => {
      try {
        setCamError(null);
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play();
              interval = setInterval(checkPresence, 3000);
              guardianIntervalRef.current = interval;
            };
          }
        }, 100);
      } catch (err) {
        console.error("Camera access denied:", err);
        setCamError("Camera access required for Focus Guardian.");
        setIsGuardianActive(false);
      }
    };

    if (isGuardianActive) {
      startCamera();
    } else {
      stopGuardian();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (interval) clearInterval(interval);
    };
  }, [isGuardianActive]);

  const toggleGuardian = () => {
    setIsGuardianActive(!isGuardianActive);
  };

  const stopGuardian = () => {
    if (guardianIntervalRef.current) clearInterval(guardianIntervalRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setNoPersonDetected(false);
    lastFrameData.current = null;
  };

  const checkPresence = () => {
    if (!videoRef.current || !canvasRef.current || !isGuardianActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Draw current frame to small canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = frame.data;
    
    // Advanced Neural Focal Zone: Analyze the central section of the frame (where a face is)
    const centerX = canvas.width / 4;
    const centerY = canvas.height / 4;
    const focalWidth = canvas.width / 2;
    const focalHeight = canvas.height / 2;
    
    let brightnessSum = 0;
    let skinToneWeight = 0;
    let pixelCount = 0;
    
    for (let y = Math.floor(centerY); y < centerY + focalHeight; y++) {
      for (let x = Math.floor(centerX); x < centerX + focalWidth; x++) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const brightness = (r + g + b) / 3;
        brightnessSum += brightness;
        
        // Refined Skin Tone Detection (Face Focus)
        if (r > 95 && g > 40 && b > 20 && r > g && r > b && (Math.max(r,g,b) - Math.min(r,g,b) > 15)) {
          skinToneWeight++;
        }
        pixelCount++;
      }
    }
    
    const avgBrightness = brightnessSum / pixelCount;
    const skinFactor = skinToneWeight / pixelCount;
    
    // Detection Logic: Increased sensitivity for focal zone
    const isPersonPresent = skinFactor > 0.08 && avgBrightness > 30 && avgBrightness < 235;
    
     if (!isPersonPresent) {
       setNoPersonDetected(true);
       if (isRunning) {
         alertAudioRef.current.play().catch(() => {});
       }
     } else {
       setNoPersonDetected(false);
       alertAudioRef.current.pause();
       alertAudioRef.current.currentTime = 0;
     }
    
    lastFrameData.current = frame;
  };

  const progress = Math.min(1, time / currentDuration);

  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center p-4 md:p-12 bg-gradient-to-b from-transparent to-blue-50/50 rounded-[48px] border border-blue-100/30 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-7xl w-full mx-auto flex flex-col items-center justify-center space-y-20 py-10"
      >
        {/* Mode Selector */}
        <div className="flex justify-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-white shadow-sm inline-flex mx-auto">
          {[
            { id: 'study', label: 'Study', icon: Zap, color: 'text-blue-600' },
            { id: 'shortBreak', label: 'Short Break', icon: Coffee, color: 'text-green-600' },
            { id: 'longBreak', label: 'Long Break', icon: Moon, color: 'text-purple-600' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleModeSwitch(item.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${
                mode === item.id 
                  ? 'bg-white shadow-md scale-105 ' + item.color
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/30'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Interface: Stacked Center Focus */}
        <div className="flex flex-col gap-16 items-center justify-center w-full max-w-5xl mx-auto">
           
           {/* Center Piece: Big Camera Guardian Monitor */}
           <div className={`w-full relative overflow-hidden p-8 rounded-[48px] border-4 transition-all duration-700 ${
              isGuardianActive 
                ? 'bg-slate-900 border-indigo-500 shadow-[0_40px_100px_rgba(79,70,229,0.3)]' 
                : 'bg-white/60 backdrop-blur-md border-white shadow-sm'
            }`}>
              
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isGuardianActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40' : 'bg-slate-100 text-slate-400'}`}>
                       <Shield className={`w-6 h-6 ${isGuardianActive ? 'animate-pulse' : ''}`} />
                    </div>
                    <div>
                       <h4 className={`text-xl font-black tracking-tight ${isGuardianActive ? 'text-white' : 'text-gray-900'}`}>
                         Focus Guardian
                       </h4>
                       <p className={`text-xs font-bold uppercase tracking-widest ${isGuardianActive ? 'text-indigo-400' : 'text-slate-400'}`}>
                          {isGuardianActive ? 'Active AI Monitoring' : 'Guardian Offline'}
                       </p>
                    </div>
                 </div>
                 <button 
                   onClick={toggleGuardian}
                   className={`w-14 h-7 rounded-full p-1.5 transition-all ${isGuardianActive ? 'bg-green-500' : 'bg-slate-200'}`}
                 >
                   <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isGuardianActive ? 'translate-x-7' : 'translate-x-0'}`} />
                 </button>
              </div>
              
              <div className="relative aspect-video lg:aspect-[21/9] bg-black rounded-[32px] overflow-hidden mb-8 border-2 border-slate-800 shadow-inner group min-h-[400px]">
                 {!isGuardianActive ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                         <Camera className="w-10 h-10 text-slate-600" />
                      </div>
                      <h5 className="text-slate-400 font-black text-lg mb-2">Neural Link Disconnected</h5>
                      <p className="text-slate-500 text-sm font-medium">Activate Guardian to enable AI presence monitoring.</p>
                   </div>
                 ) : (
                   <>
                     <video 
                       ref={videoRef} 
                       autoPlay 
                       muted 
                       playsInline 
                       className={`w-full h-full object-cover transition-all duration-1000 ${noPersonDetected ? 'grayscale contrast-150 blur-md scale-110' : 'brightness-110 saturate-[1.1]'}`}
                     />
                     
                     {/* Monitoring Overlay */}
                     <div className="absolute inset-x-0 top-0 p-6 flex justify-between items-start">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                           <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                           <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE STREAM</span>
                        </div>
                        <div className="px-3 py-1.5 bg-indigo-600/90 backdrop-blur-md rounded-xl text-white font-black text-[10px] uppercase tracking-widest border border-indigo-400/30">
                           {noPersonDetected ? 'Searching...' : 'Subject Detected'}
                        </div>
                     </div>

                     {/* Grid lines for "AI" feel */}
                     <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                     
                     {/* Scanning Effect */}
                     <motion.div 
                        className="absolute inset-x-0 h-[2px] bg-indigo-400/50 shadow-[0_0_15px_rgba(129,140,248,0.5)] z-10"
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                     />
                   </>
                 )}
                 <canvas ref={canvasRef} width="80" height="60" className="hidden" />
              </div>
              
              <div className={`p-6 rounded-[24px] ${isGuardianActive ? 'bg-white/5' : 'bg-slate-50'} border ${isGuardianActive ? 'border-white/10' : 'border-slate-100'}`}>
                 <p className={`text-sm font-medium leading-relaxed ${isGuardianActive ? 'text-slate-400' : 'text-slate-500'}`}>
                    Guardian Mode uses your device camera to ensure deep work. If your face is not detected in the neural focal zone, an alert will trigger to keep you accountable.
                 </p>
              </div>

              {camError && (
                <div className="mt-4 flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                   <ShieldAlert className="w-4 h-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest">{camError}</p>
                </div>
              )}
           </div>

           {/* Bottom: Timer Hub */}
           <div className="w-full space-y-12 flex flex-col items-center">
              {/* Timer Display */}
              <div className="relative flex items-center justify-center scale-125">
                <svg className="w-80 h-80 -rotate-90">
                  <circle
                    cx="160"
                    cy="160"
                    r="150"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-100"
                  />
                  <motion.circle
                    cx="160"
                    cy="160"
                    r="150"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 150}
                    animate={{ strokeDashoffset: 2 * Math.PI * 150 * (1 - progress) }}
                    className={mode === 'study' ? 'text-blue-600' : mode === 'shortBreak' ? 'text-green-500' : 'text-purple-500'}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span 
                    key={timeLeft}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-7xl font-bold font-mono text-gray-900 tracking-tighter"
                  >
                    {formatTime(timeLeft)}
                  </motion.span>
                  <p className="text-gray-500 font-medium uppercase tracking-widest text-sm mt-2">
                    {mode === 'study' ? 'Focusing' : 'Resting'}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-10">
                <button 
                  onClick={resetTimer}
                  className="p-4 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all"
                >
                  <RotateCcw className="w-8 h-8" />
                </button>

                <button
                  onClick={toggleTimer}
                  className={`w-28 h-28 flex items-center justify-center rounded-full shadow-2xl transition-all active:scale-95 ${
                    isRunning 
                      ? 'bg-gray-100 text-gray-900 border-4 border-white' 
                      : 'bg-gradient-to-br from-blue-600 to-sky-500 text-white hover:scale-105'
                  }`}
                >
                  {isRunning ? <Pause className="w-12 h-12" /> : <Play className="w-12 h-12 translate-x-1" />}
                </button>

                <button 
                  className={`p-4 rounded-full transition-all ${activeAmbience ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-white'}`}
                  onClick={() => {
                    if (activeAmbience) {
                      audioRef.current?.pause();
                      setActiveAmbience(null);
                    }
                  }}
                >
                  <Volume2 className="w-8 h-8" />
                </button>
              </div>
           </div>
        </div>

        {/* Ambience & Stats */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-[40px] border border-white shadow-sm text-left">
            <h4 className="text-xl font-black text-gray-900 flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                 <Music className="w-5 h-5 text-blue-600" />
              </div>
              Environment Ambience
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(ambienceTracks).map(s => (
                <button 
                  key={s} 
                  onClick={() => handleAmbienceToggle(s)}
                  className={`px-6 py-4 rounded-2xl text-sm font-bold transition-all border ${
                    activeAmbience === s
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 border-blue-500'
                      : 'bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-8 rounded-[40px] border border-white shadow-sm text-left">
            <h4 className="text-xl font-black text-gray-900 flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                 <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              Session Mastery
            </h4>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                   <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Total Productivity</p>
                   <p className="text-4xl font-black text-gray-900">{sessions} <span className="text-lg font-bold text-slate-400">Cycles</span></p>
                </div>
                <div className="text-right">
                   <p className="text-blue-600 font-black text-sm uppercase tracking-tighter">Current Milestone</p>
                   <p className="text-xs font-bold text-slate-500">Step {(sessions % 4) + 1} of 4</p>
                </div>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200 shadow-inner">
                <motion.div 
                   className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg"
                   animate={{ width: `${((sessions % 4) + 1) * 25}%` }}
                />
              </div>
              <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-[0.2em]">4 Cycle Progress Streak</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Focus Guardian Alert Overlay - BIG SCREEN ALERT */}
      <AnimatePresence>
        {noPersonDetected && isGuardianActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-0"
          >
            {/* Pulsing Red Aura */}
            <motion.div 
               animate={{ opacity: [0.1, 0.4, 0.1] }}
               transition={{ duration: 1.5, repeat: Infinity }}
               className="absolute inset-0 bg-red-600"
            />
            
            <motion.div 
               initial={{ scale: 0.8, y: 50, opacity: 0 }}
               animate={{ scale: 1, y: 0, opacity: 1 }}
               className="relative z-10 w-full max-w-4xl px-8 text-center"
            >
               <div className="w-40 h-40 bg-red-600 rounded-[40px] flex items-center justify-center mx-auto mb-12 shadow-[0_0_100px_rgba(220,38,38,0.8)] animate-pulse">
                  <ShieldAlert className="w-20 h-20 text-white" />
               </div>
               
               <h2 className="text-8xl md:text-9xl font-black text-white mb-8 tracking-tighter uppercase italic leading-none">
                  ABSENCE <br/> DETECTED
               </h2>
               
               <p className="text-red-400 font-black text-2xl mb-16 tracking-wide uppercase">
                  Guardian Neural Link Lost • Return to Frame Immediately
               </p>
               
               <div className="max-w-md mx-auto">
                  <button 
                    onClick={() => setNoPersonDetected(false)}
                    className="group relative w-full h-24 bg-white rounded-[32px] overflow-hidden shadow-2xl transition-all active:scale-95"
                  >
                     <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                     <span className="relative z-10 text-2xl font-black text-slate-900 group-hover:text-white transition-colors">
                        RESUME SESSION
                     </span>
                  </button>
                  <p className="mt-8 text-xs font-black text-slate-600 uppercase tracking-[0.4em]">
                     StudyPulse Deep Work Protocol Active
                  </p>
               </div>
            </motion.div>
            
            {/* Flashing Vignette */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(220,38,38,0.5)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
