/* eslint-disable react-hooks/immutability, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- media-device lifecycle intentionally follows modal visibility and acquires/releases browser streams. */
import React, { useRef, useState, useEffect } from 'react';
import { X, Video, Square, Camera, Mic, RefreshCw, MonitorUp } from 'lucide-react';

interface CameraRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordFinish: (file: File, durationSecs: number) => void;
}

export default function CameraRecorderModal({ isOpen, onClose, onRecordFinish }: CameraRecorderModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const microphoneTestTimerRef = useRef<number | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [captureMode, setCaptureMode] = useState<'camera' | 'screen'>('camera');
  const [error, setError] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isTestingMicrophone, setIsTestingMicrophone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const chunksRef = useRef<BlobPart[]>([]);
  const startTimeRef = useRef<number>(0);

  /* Camera acquisition and cleanup intentionally follow modal visibility. */
  useEffect(() => {
    if (isOpen) {
      // Opening the recorder begins in camera mode. Screen capture itself must
      // be started from the Screen button's user click (Chrome requirement).
      setCaptureMode('camera');
      startCapture(selectedAudioDevice, 'camera');
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  useEffect(() => {
    if (!isRecording) {
      setElapsed(0);
      return;
    }
    const timer = window.setInterval(() => setElapsed((Date.now() - startTimeRef.current) / 1000), 200);
    return () => window.clearInterval(timer);
  }, [isRecording]);

  const loadDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    setVideoDevices(devices.filter((device) => device.kind === 'videoinput'));
    setAudioDevices(devices.filter((device) => device.kind === 'audioinput'));
  };

  const monitorAudio = (stream: MediaStream) => {
    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      const samples = new Uint8Array(analyser.frequencyBinCount);
      const update = () => {
        analyser.getByteFrequencyData(samples);
        const average = samples.reduce((sum, value) => sum + value, 0) / samples.length;
        setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(update);
      };
      audioContextRef.current = audioContext;
      update();
    } catch {
      // The recorder works even if a browser does not expose Web Audio.
    }
  };

  const startCapture = async (audioDeviceId = selectedAudioDevice, mode: 'camera' | 'screen' = captureMode, startImmediately = false) => {
    setError(null);
    try {
      // The recorder already opens the microphone in Camera mode. Reuse that
      // approved track for a screen recording rather than asking Chrome for a
      // second microphone permission immediately after the share picker.
      const reusableAudioTracks = mode === 'screen'
        ? (streamRef.current?.getAudioTracks().filter(track => track.readyState === 'live') ?? [])
        : [];
      stopCamera(reusableAudioTracks.length > 0);
      let stream: MediaStream;
      if (mode === 'screen') {
        // Browsers deliberately show their own picker here so the creator always
        // decides exactly which tab, window, or screen is shared.
        let displayStream: MediaStream;
        try {
          displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: { frameRate: { ideal: 30, max: 30 } },
            audio: false,
          });
        } catch {
          throw new Error('Screen sharing was cancelled or blocked. Click Screen, choose a tab, window, or display, then click Share.');
        }
        let audioTracks = reusableAudioTracks;
        if (!audioTracks.length) {
          try {
            const microphoneStream = await navigator.mediaDevices.getUserMedia({
              audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
            });
            audioTracks = microphoneStream.getAudioTracks();
          } catch {
            displayStream.getTracks().forEach(track => track.stop());
            throw new Error('Your screen was selected, but the microphone was blocked. Allow Microphone for nexuscut.io in Chrome, then try Screen again.');
          }
        }
        stream = new MediaStream([...displayStream.getVideoTracks(), ...audioTracks]);
        displayStream.getVideoTracks()[0]?.addEventListener('ended', () => {
          if (mediaRecorderRef.current?.state === 'recording') stopRecording();
        }, { once: true });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: selectedVideoDevice
            ? { deviceId: { exact: selectedVideoDevice }, width: { ideal: 1920 }, height: { ideal: 1080 } }
            : { width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
        });
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      await loadDevices();
      monitorAudio(stream);
      setIsCameraReady(true);
      // Screen sharing already requires an explicit browser Share action. Start
      // immediately afterward so Chrome's "Stop sharing" strip never blocks a
      // second in-app Start Recording button.
      if (startImmediately && mode === 'screen') startRecording();
    } catch (err: unknown) {
      console.error("Error accessing recorder:", err);
      const captureError = err instanceof Error ? err : new Error('Could not access the selected recording devices.');
      setError(captureError.message || (captureError.name === 'NotAllowedError'
        ? `${mode === 'screen' ? 'Screen sharing or microphone access was blocked.' : 'Camera or microphone access was blocked.'} Allow it in your browser, then try again.`
        : "Could not access the selected recording devices."));
      setIsCameraReady(false);
    }
  };

  const stopCamera = (preserveAudioTracks = false) => {
    if (microphoneTestTimerRef.current) window.clearTimeout(microphoneTestTimerRef.current);
    microphoneTestTimerRef.current = null;
    setIsTestingMicrophone(false);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
    audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
    setAudioLevel(0);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        if (!preserveAudioTracks || track.kind !== 'audio') track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
    setIsCameraReady(false);
  };

  const changeDevice = async (kind: 'video' | 'audio', deviceId: string) => {
    if (isRecording) return;
    if (kind === 'video') setSelectedVideoDevice(deviceId);
    else setSelectedAudioDevice(deviceId);
    if (captureMode === 'screen') {
      if (kind === 'audio') await startCapture(deviceId, 'screen');
      return;
    }
    // State has not updated yet, so open the selected device directly.
    setError(null);
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: kind === 'video'
          ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : (selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice }, width: { ideal: 1920 }, height: { ideal: 1080 } } : true),
        audio: kind === 'audio'
          ? { deviceId: { exact: deviceId } }
          : (selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true),
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      monitorAudio(stream);
      setIsCameraReady(true);
    } catch (err: unknown) {
      setError(err instanceof DOMException && err.name === 'NotAllowedError' ? 'Camera or microphone access was blocked. Allow it in your browser, then try again.' : 'Could not switch device. Please check that it is connected.');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    chunksRef.current = [];
    
    let options: MediaRecorderOptions = {};
    if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9,opus')) {
      options = { mimeType: 'video/webm; codecs=vp9,opus' };
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      options = { mimeType: 'video/webm' };
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      options = { mimeType: 'video/mp4' };
    }
        
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const actualMimeType = mediaRecorder.mimeType || options.mimeType || 'video/mp4';
        const ext = actualMimeType.includes('webm') ? 'webm' : 'mp4';
        const blob = new Blob(chunksRef.current, { type: actualMimeType });
        const file = new File([blob], `recording_${Date.now()}.${ext}`, { type: actualMimeType });
        
        const durationSecs = (Date.now() - startTimeRef.current) / 1000;
        onRecordFinish(file, durationSecs);
        onClose(); // Automatically close on finish
      };
      
      mediaRecorder.start(500); // 500ms chunks to be safer on Safari
      mediaRecorderRef.current = mediaRecorder;
      startTimeRef.current = Date.now();
      setIsRecording(true);
    } catch (err: unknown) {
      console.error("Failed to start MediaRecorder:", err);
      setError("Failed to start recording: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const testMicrophone = () => {
    if (microphoneTestTimerRef.current) window.clearTimeout(microphoneTestTimerRef.current);
    setIsTestingMicrophone(true);
    // The audio meter is connected to the selected microphone. If the stream
    // was interrupted, reopen it from this explicit user action first.
    if (!streamRef.current) startCapture(selectedAudioDevice, captureMode);
    microphoneTestTimerRef.current = window.setTimeout(() => {
      setIsTestingMicrophone(false);
      microphoneTestTimerRef.current = null;
    }, 5000);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainder}`;
  };

  if (!isOpen) return null;

  // A screen tutorial is only useful if the recorder does not cover the page or
  // application being demonstrated. Keep only a compact status badge so creators
  // can confirm the recording and stop it without hunting for Chrome's control.
  if (isRecording && captureMode === 'screen') return (
    <div className="fixed bottom-5 right-5 z-[100] flex items-center gap-3 rounded-full border border-red-500/40 bg-black/85 px-3 py-2 shadow-2xl backdrop-blur" role="status" aria-live="polite">
      <span className="flex items-center gap-2 text-xs font-bold tracking-wide text-white"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" /> REC {formatTime(elapsed)}</span>
      <button type="button" onClick={stopRecording} className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-red-500">Stop</button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-2xl sm:p-6">
        
        <button 
          onClick={() => isRecording ? stopRecording() : onClose()}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white sm:mb-4 sm:text-xl">
          {captureMode === 'screen' ? <MonitorUp className="w-6 h-6 text-indigo-400" /> : <Camera className="w-6 h-6 text-indigo-400" />}
          {captureMode === 'screen' ? 'Record screen' : 'Record video'}
        </h2>
        <p className="-mt-1 mb-3 text-sm text-neutral-400 sm:-mt-2 sm:mb-4">{captureMode === 'screen' ? 'Choose a tab, window, or screen in the browser picker. Your microphone narration is included.' : 'Record with your camera and microphone.'} When you stop, the clip is added to this project.</p>

        <div className="mb-4 grid grid-cols-2 rounded-xl border border-neutral-800 bg-neutral-950 p-1">
          <button type="button" disabled={isRecording} onClick={() => { setCaptureMode('camera'); startCapture(selectedAudioDevice, 'camera'); }} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors disabled:opacity-50 ${captureMode === 'camera' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'}`}><Camera className="h-4 w-4" /> Camera</button>
          <button type="button" disabled={isRecording} onClick={() => { setCaptureMode('screen'); startCapture(selectedAudioDevice, 'screen', true); }} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors disabled:opacity-50 ${captureMode === 'screen' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'}`}><MonitorUp className="h-4 w-4" /> Screen</button>
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-4 text-center">
            <p>{error}</p>
            <button type="button" onClick={() => startCapture()} className="mt-3 rounded-lg border border-red-400/40 px-3 py-1.5 text-xs font-bold text-red-200 hover:bg-red-500/15">Try again</button>
          </div>
        ) : (
          <div className="relative mx-auto mb-4 h-[32dvh] max-h-72 w-auto max-w-full aspect-[9/16] overflow-hidden rounded-lg border border-neutral-800 bg-black sm:mb-6 sm:h-auto sm:max-h-none sm:w-full sm:max-w-none sm:aspect-video">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline
              className={`h-full w-full ${captureMode === 'screen' ? 'object-contain' : 'object-contain transform -scale-x-100 sm:object-cover'}`}
            />
            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white text-xs font-bold tracking-wider">REC {formatTime(elapsed)}</span>
              </div>
            )}
          </div>
        )}

        {!error && (
          <div className="grid grid-cols-1 gap-3 mb-5 sm:grid-cols-2">
            {captureMode === 'camera' && <label className="text-xs font-bold text-neutral-400">Camera
              <select value={selectedVideoDevice} onChange={(event) => changeDevice('video', event.target.value)} disabled={isRecording} className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white disabled:opacity-50">
                <option value="">Default camera</option>
                {videoDevices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${index + 1}`}</option>)}
              </select>
            </label>}
            <label className="text-xs font-bold text-neutral-400">Microphone
              <select value={selectedAudioDevice} onChange={(event) => changeDevice('audio', event.target.value)} disabled={isRecording} className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white disabled:opacity-50">
                <option value="">Default microphone</option>
                {audioDevices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Microphone ${index + 1}`}</option>)}
              </select>
            </label>
            <div className={`${captureMode === 'screen' ? 'sm:col-span-1' : 'sm:col-span-2'} flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 sm:gap-3`}>
              <Mic className="h-4 w-4 text-indigo-400" />
              <span className="flex-1 text-xs font-bold text-neutral-300">{isTestingMicrophone ? 'Testing — speak now' : 'Microphone level'}</span>
              <span className="w-9 text-right text-xs font-mono text-neutral-300">{audioLevel}%</span>
              <button type="button" onClick={testMicrophone} disabled={isRecording} className={`rounded-md px-2 py-1 text-xs font-bold transition-colors disabled:opacity-50 ${isTestingMicrophone ? 'bg-emerald-500/20 text-emerald-200' : 'text-indigo-300 hover:bg-indigo-500/15 hover:text-white'}`}>{isTestingMicrophone ? 'Listening' : 'Test mic'}</button>
              <button type="button" onClick={() => startCapture()} disabled={isRecording} className="text-neutral-400 hover:text-white disabled:opacity-50" title="Refresh recording devices"><RefreshCw className="h-4 w-4" /></button>
              <div className="h-2 basis-full overflow-hidden rounded-full bg-neutral-800 sm:basis-auto sm:flex-1"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-500 transition-[width] duration-100" style={{ width: `${audioLevel}%` }} /></div>
            </div>
          </div>
        )}

        <div className="sticky bottom-0 -mx-4 flex justify-center bg-neutral-900/95 px-4 pt-3 pb-1 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:p-0">
          {!isRecording ? (
            <button 
              onClick={startRecording}
              disabled={!!error || !isCameraReady}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/25"
            >
              <Video className="w-5 h-5" />
              Start Recording
            </button>
          ) : (
            <button 
              onClick={stopRecording}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-red-500/25"
            >
              <Square className="w-5 h-5 fill-current" />
              Stop Recording
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
