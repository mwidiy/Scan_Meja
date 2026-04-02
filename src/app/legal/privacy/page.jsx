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

        let target = whatsappNumber.replace(/\D/g, '');
        if (target.startsWith('0')) target = '62' + target.substring(1);

        const message = "Halo Admin, saya ingin bertanya terkait kebijakan privasi.";
        window.open(`https://wa.me/${target}?text=${encodeURIComponent(message)}`, '_blank');
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

                .wa-btn {
                    width: 100%; padding: 16px; background: #25D366; color: white;
                    border: none; border-radius: 16px; font-size: 15px; font-weight: 700;
                    margin-top: 32px; display: flex; align-items: center; justify-content: center;
                    gap: 10px; cursor: pointer; transition: transform 0.1s;
                    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
                }
                .wa-btn:active { transform: scale(0.98); }

                .modal-overlay {
                    position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.7);
                    display: flex; align-items: center; justify-content: center; padding: 24px;
                    backdrop-filter: blur(4px);
                }
                .modal-content {
                    background: white; border-radius: 24px; padding: 32px 24px;
                    width: 100%; max-width: 320px; text-align: center;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                }
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

                <button className="wa-btn" onClick={handleWhatsAppClick}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    Hubungi WhatsApp Restoran
                </button>
            </div>
            <AnimatePresence>
                {showNoWaModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowNoWaModal(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱❌</div>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '12px', marginTop: 0 }}>
                                WhatsApp Tidak Tersedia
                            </h3>
                            <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', marginBottom: '24px' }}>
                                Mohon maaf, penjual belum menyediakan nomor WhatsApp untuk dihubungi.
                            </p>

                            <button
                                onClick={() => setShowNoWaModal(false)}
                                style={{
                                    width: '100%', padding: '14px', borderRadius: '16px',
                                    backgroundColor: '#1F2937', color: 'white',
                                    fontWeight: '700', fontSize: '15px', border: 'none', cursor: 'pointer'
                                }}
                            >
                                Oke, Mengerti
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
