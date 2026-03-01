'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function DedicatedHelpPage() {
    const router = useRouter();
    const [whatsappNumber, setWhatsappNumber] = useState(null);

    // Ambil Nomor WhatsApp dari Local Storage (Data Toko)
    useEffect(() => {
        try {
            const stored = localStorage.getItem('customer_table');
            if (stored) {
                const parsed = JSON.parse(stored);
                // Kita asumsi info nomor telepon restoran tersimpan di session ini setelah load pertama
                // Namun sebagai _fallback_ kita sarankan ngambil API getStore jika kosong
                if (parsed.location && parsed.location.storeId) {
                    import('../../services/api').then(mod => {
                        mod.getStore(parsed.location.storeId).then(res => {
                            if (res.success && res.data.phone) {
                                setWhatsappNumber(res.data.phone);
                            }
                        }).catch(e => console.error(e));
                    });
                }
            }
        } catch (e) {
            console.error("Gagal memuat WA Number di Help Page:", e);
        }
    }, []);

    const handleWhatsAppClick = () => {
        if (whatsappNumber) {
            const message = encodeURIComponent("Halo Admin, saya mau bertanya terkait pesanan saya dari aplikasi Meja.");
            // Pastikan format kode negara 62
            const formattedA = whatsappNumber.startsWith('0') ? '62' + whatsappNumber.substring(1) : whatsappNumber;
            window.open(`https://wa.me/${formattedA}?text=${message}`, '_blank');
        } else {
            alert("Nomor WhatsApp restoran belum tersedia. Anda bisa bertanya langsung ke meja kasir.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bantuan-container"
        >
            <style jsx global>{`
                :root {
                    --bg-bantuan: #F3F4F6;
                    --text-dark: #1F2937;
                    --text-gray: #6B7280;
                    --card-bg: #FFFFFF;
                }
                * { box-sizing: border-box; font-family: 'Poppins', sans-serif; }
                body { margin: 0; background: var(--bg-bantuan); color: var(--text-dark); }
                
                .bantuan-container {
                    max-width: 414px; margin: 0 auto; min-height: 100vh;
                    background: var(--bg-bantuan); position: relative;
                }

                .header-area {
                    background: var(--card-bg);
                    padding: 24px 20px 24px 20px;
                    border-bottom-left-radius: 32px;
                    border-bottom-right-radius: 32px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    text-align: center;
                    position: relative;
                }

                .back-btn {
                    position: absolute; left: 20px; top: 24px;
                    width: 44px; height: 44px;
                    border-radius: 14px; border: 1px solid #E5E7EB; background: var(--card-bg);
                    display: flex; align-items: center; justify-content: center; cursor: pointer;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                }

                .help-icon-wrapper {
                    width: 72px; height: 72px; border-radius: 20px;
                    background: linear-gradient(135deg, #111827 0%, #374151 100%);
                    color: white; display: flex; justify-content: center; align-items: center;
                    margin: 0 auto 16px;
                    box-shadow: 0 10px 25px rgba(17,24,39,0.2);
                }

                .title { font-size: 24px; font-weight: 700; color: var(--text-dark); margin-bottom: 6px; }
                .subtitle { font-size: 14px; color: var(--text-gray); max-width: 80%; margin: 0 auto; line-height: 1.5; }

                .content-area { padding: 32px 20px 60px 20px; display: flex; flex-direction: column; gap: 16px; }

                .action-card {
                    background: var(--card-bg); border-radius: 20px; padding: 20px;
                    display: flex; align-items: center; justify-content: space-between;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.03);
                    cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;
                    border: 1px solid transparent;
                }
                .action-card:active { transform: scale(0.97); }

                .action-card.wa-card {
                    border: 1px solid #DCFCE7;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%);
                }

                .card-left { display: flex; align-items: center; gap: 16px; }
                .card-icon { 
                    width: 48px; height: 48px; border-radius: 14px; 
                    display: flex; justify-content: center; align-items: center; 
                }
                .card-text { display: flex; flex-direction: column; }
                .card-title { font-weight: 700; font-size: 15px; color: var(--text-dark); }
                .card-desc { font-size: 12px; color: var(--text-gray); margin-top: 2px; }

            `}</style>

            <div className="header-area">
                <button className="back-btn" onClick={() => router.back()}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <div className="mt-4">
                    <div className="help-icon-wrapper">
                        <svg width="36" height="36" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                    </div>
                </div>
                <div className="title">Pusat Bantuan</div>
                <div className="subtitle">Ada pertanyaan seputar pesanan, menu, atau transaksi QRIS Anda?</div>
            </div>

            <div className="content-area">

                {/* WHATSAPP CARD */}
                <div className="action-card wa-card" onClick={handleWhatsAppClick}>
                    <div className="card-left">
                        <div className="card-icon bg-green-100 text-green-600">
                            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-5.824 4.74-10.563 10.573-10.564 5.824.001 10.566 4.746 10.566 10.564-.001 5.827-4.739 10.566-10.563 10.566z"></path></svg>
                        </div>
                        <div className="card-text">
                            <div className="card-title">Hubungi Staf Kasir</div>
                            <div className="card-desc">Sampaikan keluhan via WhatsApp</div>
                        </div>
                    </div>
                    <div className="text-gray-400">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                </div>

                <div className="mt-8 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">Informasi Legal</div>

                {/* TNC CARD */}
                <div className="action-card" onClick={() => router.push('/legal/tnc')}>
                    <div className="card-left">
                        <div className="card-icon bg-blue-50 text-blue-500">
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <div className="card-text">
                            <div className="card-title">Syarat & Ketentuan</div>
                            <div className="card-desc">Aturan refund & layanan transaksi</div>
                        </div>
                    </div>
                    <div className="text-gray-400">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                </div>

                {/* PRIVACY CARD */}
                <div className="action-card" onClick={() => router.push('/legal/privacy')}>
                    <div className="card-left">
                        <div className="card-icon bg-purple-50 text-purple-500">
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <div className="card-text">
                            <div className="card-title">Kebijakan Privasi</div>
                            <div className="card-desc">Transparansi penggunaan data publik</div>
                        </div>
                    </div>
                    <div className="text-gray-400">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
