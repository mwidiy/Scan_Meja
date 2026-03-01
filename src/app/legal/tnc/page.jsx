'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function TermAndCondition() {
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
                <div className="title">Syarat & Ketentuan</div>
            </div>

            <div className="content">
                <p>Terakhir diperbarui: 1 Maret 2026</p>

                <h2>1. Layanan Platform</h2>
                <p>Platform ini memfasilitasi pengguna untuk melakukan pemesanan dan pembayaran makanan/minuman secara swalayan (Mandiri) di toko atau restoran terdaftar melalui pemindaian kode QR Meja. Segala produk yang dijual merupakan tanggung jawab penuh pihak restoran terafiliasi.</p>

                <h2>2. Metode Pembayaran & Transaksi</h2>
                <p>Kami memfasilitasi pembayaran tunai dan non-tunai (QRIS) melalui penyedia jasa pembayaran resmi (Payment Gateway) yang diawasi oleh Bank Indonesia. Dengan melanjutkan pembayaran, pengguna tunduk pada aturan layanan pihak Payment Gateway tersebut. Nominal transaksi sudah final berdasarkan layar konfirmasi.</p>

                <h2>3. Kebijakan Pembatalan & Pengembalian Dana (Refund)</h2>
                <p><strong>3.1. Pembatalan oleh Pengguna:</strong> Pesanan yang sudah berstatus "Dibayar" tidak dapat dibatalkan melalui antarmuka aplikasi ini. Pembatalan murni bergantung pada ketersediaan dan kehendak pihak Kasir/Restoran.<br /><br />
                    <strong>3.2. Penolakan Pesanan oleh KASIR:</strong> Jika pesanan QRIS Anda ditolak atau dibatalkan oleh Kasir secara sepihak (misalnya kehabisan bahan), proses pengembalian dana (Refund) harus dilakukan secara manual di meja kasir restoran terkait, dengan menunjukkan bukti penolakan digital dari halaman "Status Pesanan" aplikasi ini.</p>

                <h2>4. Ketersediaan Layanan</h2>
                <p>Kami tidak menjamin bahwa sistem akan selalu terbebas dari kesalahan (bug) atau pemadaman sementara (downtime). Segala kerugian waktu yang diakibatkan oleh kendala server bukan merupakan tanggung jawab platform di luar nilai transaksi terdaftar.</p>

                <h2>5. Bantuan & Kontak</h2>
                <p>Jika Anda mengalami kendala pembayaran berganda atau kegagalan sinkronisasi pesanan pasca pembayaran QRIS yang berhasil, silakan tunjukkan mutasi M-Banking Anda ke Kasir atau hubungi tim bantuan restoran melalui tombol WhatsApp di Halaman Utama kami.</p>
            </div>
        </motion.div>
    );
}
