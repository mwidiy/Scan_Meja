'use client';

import { useEffect } from 'react';

export default function ARError({ error, reset }) {
  useEffect(() => {
    console.warn("AR Route Error Caught by Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-6 text-white text-center font-sans">
      <div className="bg-[#1E293B] border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center text-3xl mb-4">
          📱❌
        </div>
        <h2 className="text-xl font-bold mb-2">Gagal Memuat AR 3D</h2>
        <p className="text-sm text-gray-300 mb-6 leading-relaxed">
          Sistem grafis atau memori pada perangkat ini mengalami kendala saat memuat model 3D. Silakan coba kembali atau tutup tampilan ini.
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={() => window.history.back()}
            className="flex-1 py-3 px-4 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold text-sm transition-all"
          >
            Kembali
          </button>
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 rounded-xl bg-[#F0C419] hover:bg-[#d9b015] text-[#111827] font-bold text-sm shadow-lg transition-all"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    </div>
  );
}
