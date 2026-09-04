import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, AlertCircle } from 'lucide-react';

type Props = { onClose: () => void; onDetected: (value: string) => void };

export const QrScanner: React.FC<Props> = ({ onClose, onDetected }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const stop = () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Caméra non disponible sur ce navigateur.');
        const BarcodeDetectorCtor = (window as any).BarcodeDetector;
        if (!BarcodeDetectorCtor) throw new Error('Le scanner QR automatique n’est pas pris en charge par ce navigateur. Utilisez le numéro du contrat.');

        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        if (cancelled) { stream.getTracks().forEach((track) => track.stop()); return; }
        streamRef.current = stream;
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const detector = new BarcodeDetectorCtor({ formats: ['qr_code'] });

        const scan = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            const raw = codes?.[0]?.rawValue;
            if (raw) {
              stop();
              onDetected(String(raw));
              return;
            }
          } catch { /* image not ready yet */ }
          frameRef.current = requestAnimationFrame(scan);
        };
        scan();
      } catch (err: any) {
        setError(err?.message || 'Impossible d’ouvrir la caméra. Vérifiez les autorisations du navigateur.');
      }
    };

    start();
    return () => { cancelled = true; stop(); };
  }, [onDetected]);

  return <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl" onClick={(event) => event.stopPropagation()}>
      <div className="p-4 border-b border-slate-100 flex items-center justify-between"><div className="flex items-center gap-2"><Camera className="w-5 h-5 text-[#1e3a8a]"/><div><h2 className="font-black">Scanner le QR du contrat</h2><p className="text-xs text-slate-500">Placez le code au centre de la caméra.</p></div></div><button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><X className="w-5 h-5"/></button></div>
      <div className="relative aspect-square bg-black"><video ref={videoRef} playsInline muted className="w-full h-full object-cover"/><div className="absolute inset-[18%] border-2 border-white rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,.28)]"/></div>
      {error && <div className="m-4 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex gap-3 text-sm text-amber-800"><AlertCircle className="w-5 h-5 shrink-0"/><span>{error}</span></div>}
      <div className="p-4 text-xs text-slate-500">La caméra est utilisée uniquement pendant le scan et s’arrête automatiquement dès qu’un code est détecté.</div>
    </div>
  </div>;
};
