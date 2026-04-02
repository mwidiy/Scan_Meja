'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function PrivacyPolicy() {
    const router = useRouter();

    const [whatsappNumber, setWhatsappNumber] = useState(null);
    const [showNoWaModal, setShowNoWaModal] = useState(false);

    useEffect(() => {
        const savedWa = localStorage.getItem('store_wa');
        if (savedWa) setWhatsappNumber(savedWa);
    }, []);

    const handleWhatsAppClick = () => {
        if (!whatsappNumber) {
            setShowNoWaModal(true);
            return;
        }

        let cleanNumber = whatsappNumber.replace(/\D/g, '');
        if (cleanNumber.startsWith('0')) cleanNumber = '62' + cleanNumber.substring(1);

        const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent("Halo Admin, saya ingin bertanya terkait kebijakan privasi.")}`;
        window.open(url, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="legal-container"
        >
            <style jsx global>{`
                :root {
                    --bg-page: #F3F4F6;
                    --card-bg: #FFFFFF;
                    --text-main: #1F2937;
                    --text-sec: #6B7280;
                    --primary: #FACC15;
                    --border: #E5E7EB;
                }
                * { box-sizing: border-box; font-family: 'Poppins', sans-serif; }
                body { margin: 0; background: var(--bg-page); color: var(--text-main); }
                .legal-container {
                    max-width: 480px; margin: 0 auto; min-height: 100vh;
                    background: var(--card-bg); position: relative;
                }
                .header {
                    padding: 20px; display: flex; align-items: center; justify-content: center;
                    position: sticky; top: 0; background: var(--card-bg); z-index: 10;
                    border-bottom: 1px solid var(--border);
                }
                .back-btn {
                    position: absolute; left: 20px; width: 40px; height: 40px;
                    border-radius: 12px; border: 1px solid var(--border); background: var(--card-bg);
                    display: flex; align-items: center; justify-content: center; cursor: pointer;
                }
                .title { font-size: 16px; font-weight: 600; }
                .content { padding: 24px 20px; font-size: 14px; line-height: 1.6; color: var(--text-sec); }
                h2 { font-size: 16px; color: var(--text-main); margin-top: 24px; margin-bottom: 8px; }
                p { margin-top: 0; margin-bottom: 16px; }
            `}</style>

            <div className="header">
                <button className="back-btn" onClick={() => router.back()}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <div className="title">Kebijakan Privasi</div>
            </div>

            <div className="content">
                <p>Terakhir diperbarui: 1 Maret 2026</p>
                <p>Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda sewaktu menggunakan layanan PWA Menu Restoran ini.</p>

                <h2>1. Informasi yang Kami Kumpulkan</h2>
                <p>Saat Anda berinteraksi dengan layanan pemesanan kode QR meja kami, kami mengumpulkan: <br />
                    - Nama Anda (sebagaimana Anda mengetiknya pada formulir pemesanan)<br />
                    - Data pesanan makanan/minuman dan lokasi meja Anda<br />
                    - Catatan riwayat transaksi gawai (*Local Browser Data*)</p>

                <h2>2. Penggunaan Informasi</h2>
                <p>Data pribadi Anda seperti Nama hanya digunakan murni untuk keperluan <strong>identifikasi pesanan di dalam operasional Dapur/Kasir Restoran</strong> agar hidangan tidak salah saji. Layanan ini tidak mewajibkan Login/Pendaftaran Akun ataupun meminta informasi vital seperti KTP, Email, dan Foto Profil.</p>

                <h2>3. Pembagian Data ke Pihak Ketiga</h2>
                <p>Kami <strong>TIDAK AKAN PERNAH</strong> menjual, menyewakan, atau memperdagangkan data pemesanan Anda kepada pihak ketiga untuk kepentingan Pemasaran atau Iklan. Data transaksi pembayaran QRIS dikelola penuh secara rahasia dan aman (Terenkripsi Standard Perbankan) oleh pihak Payment Gateway Berlisensi.</p>

                <h2>4. Penyimpanan Memori Lokal (Cookies/Storage)</h2>
                <p>Layanan ini secara efisien menggunakan <em>sessionStorage</em> dan <em>localStorage</em> langsung di gawai Browser pintar Anda untuk mengingat riwayat keranjang dan nama yang terakhir kali Anda masukkan. Hal ini memudahkan transaksi berikutnya tanpa harus mengingat identitas. Anda berhak menghapus <em>Local Data Cache</em> ini kapan saja melalui pengaturan peramban internet Anda.</p>

                <h2>5. Hak Pengguna</h2>
                <p>Pesanan yang telah diselesaikan maupun dibatalkan pada aplikasi kasir secara otomatis akan dihapus atau di-arsipkan dalam database harian server. Kami menjamin privasi Anda tetap steril paska transaksi Anda selesai di restoran tersebut.</p>

                <h2>6. Persetujuan</h2>
                <p>Dengan menekan tombol "Bayar" atau "Pesan", Anda menyatakan secara sadar telah menyetujui praktik pemrosesan data operasional harian yang dijabarkan dalam kebijakan ini.</p>

                <button
                    onClick={handleWhatsAppClick}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '16px',
                        backgroundColor: '#25D366',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '15px',
                        border: 'none',
                        cursor: 'pointer',
                        marginTop: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.031 6.172c-2.315 0-4.191 1.876-4.191 4.191 0 .743.2 1.47.578 2.092l-.611 2.229 2.279-.598c.601.328 1.28.502 1.967.502 2.315 0 4.191-1.876 4.191-4.191 0-2.315-1.876-4.191-4.191-4.191zm2.345 5.922c-.1.25-.565.461-.774.482-.209.021-.413.018-.621-.04-.15-.043-.341-.103-.497-.168a4.015 4.015 0 0 1-1.636-1.12c-.173-.205-.333-.429-.444-.66-.111-.231-.192-.47-.238-.716-.046-.246-.051-.497-.014-.741.037-.244.131-.482.268-.691.103-.158.219-.307.346-.445.127-.138.267-.264.417-.377.124-.094.267-.16.42-.193.153-.033.312-.038.468-.014.156.024.305.077.444.157.139.08.262.185.367.311.121.144.209.311.261.488.052.177.073.361.062.545-.011.184-.055.364-.131.533-.076.169-.181.323-.309.458a1.69 1.69 0 0 1-.226.202c.07.13.155.25.255.358.1.108.212.203.333.284.241.162.507.284.786.363.279.079.569.117.86.111z" />
                    </svg>
                    Hubungi WhatsApp Restoran
                </button>
            </div>

            <AnimatePresence>
                {showNoWaModal && (
                    <div
                        className="modal-overlay"
                        onClick={() => setShowNoWaModal(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '24px',
                            backdropFilter: 'blur(5px)'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '24px',
                                padding: '32px 24px',
                                maxWidth: '340px',
                                width: '100%',
                                textAlign: 'center',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                            }}
                        >
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱❌</div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>
                                WhatsApp Tidak Tersedia
                            </h3>
                            <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', marginBottom: '24px' }}>
                                Mohon maaf, nomor WhatsApp restoran belum tersedia saat ini.
                            </p>
                            <button
                                onClick={() => setShowNoWaModal(false)}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '16px',
                                    backgroundColor: '#1F2937',
                                    color: 'white',
                                    fontWeight: '700',
                                    fontSize: '15px',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Oke, Mengerti
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
