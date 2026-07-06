'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Tetap log error ke console untuk debugging maupun pelaporan
    console.warn("Global App Error Caught by Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-[#0F172A] flex flex-col items-center justify-center p-6 text-white text-center font-sans">
      <div className="bg-[#1E293B] border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center text-3xl mb-4">
          ⚠️
        </div>
        <h2 className="text-xl font-bold mb-2">Terjadi Kendala Teknis</h2>
        <p className="text-sm text-gray-300 mb-6 leading-relaxed">
          Sistem mendeteksi kendala saat memuat tampilan halaman ini. Jangan khawatir, pesanan dan data Anda tetap aman.
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 py-3 px-4 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold text-sm transition-all"
          >
            Ke Beranda
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
