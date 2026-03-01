'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
    const router = useRouter();

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
            </div>
        </motion.div>
    );
}
