'use client';
import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDynamicUrl, createOrder } from '../../services/api';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';

function QrisContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    // State
    const [amount, setAmount] = useState(0);
    const [remaining, setRemaining] = useState(300); // 5 minutes
    const [orderState, setOrderState] = useState(null);
    const [orderId, setOrderId] = useState(null);

    // QR State
    const [qrValue, setQrValue] = useState('');
    const [qrImageUrl, setQrImageUrl] = useState(''); // Base64 data URL for <img>
    const [paymentUrl, setPaymentUrl] = useState(""); // Track Duitku URL
    const [loadingQr, setLoadingQr] = useState(false);
    const [error, setError] = useState(null);
    const [isPaid, setIsPaid] = useState(false);
    const [isExpired, setIsExpired] = useState(false); // NEW STATE
    const successLockRef = useRef(false); // Security: Lock for handleSuccess
    const [serverExpiry, setServerExpiry] = useState(() => Date.now() + 300000); // 5 min default, overridden below

    // --- REFS FOR CALLBACKS (Prevents useEffect loops) ---
    const handleSuccessRef = useRef();
    const verifyAndHandleSuccessRef = useRef();
    const numericIdRef = useRef(null); // Store numeric ID for redirect

    // --- SUCCESS HANDLER (with lock to prevent double-fire) ---
    const handleSuccess = useCallback((id) => {
        if (successLockRef.current) return; // Prevent double execution
        successLockRef.current = true;
        setIsPaid(true);

        // Clear backup
        localStorage.removeItem('qris_backup');

        // Store order state for /order page to consume
        try {
            const stateToPass = {
                ...(orderState || {}),
                id: numericIdRef.current || id, // Prefer numeric ID
                method: 'QRIS',
                transactionCode: orderState?.transactionCode || id,
            };
            sessionStorage.setItem('order_state', JSON.stringify(stateToPass));
        } catch (e) { /* ignore */ }

        // Redirect to order/receipt page with Numeric ID - INSTANTLY
        const targetId = numericIdRef.current || id;
        if (process.env.NODE_ENV !== 'production') console.log("Redirecting to order:", targetId);
        router.push(`/order?orderId=${targetId}`);
    }, [orderState, router]);

    // --- VERIFY BEFORE SUCCESS (Security: don't trust socket blindly) ---
    const verifyAndHandleSuccess = useCallback(async (id) => {
        try {
            const API_URL = getDynamicUrl();
            if (process.env.NODE_ENV !== 'production') console.log(`Verifying ID: ${id} with Amount: ${amount}`);

            const res = await fetch(`${API_URL}/api/payment/check-status/${id}?amount=${amount}`);
            const json = await res.json();

            if (process.env.NODE_ENV !== 'production') console.log("Verify Result:", json);

            if (json.status === 'Paid') {
                handleSuccessRef.current(id);
            }
        } catch (e) {
            if (process.env.NODE_ENV !== 'production') console.error("Verify error", e);
        }
    }, [amount]);

    // Update refs on every render
    useEffect(() => {
        handleSuccessRef.current = handleSuccess;
        verifyAndHandleSuccessRef.current = verifyAndHandleSuccess;
    }, [handleSuccess, verifyAndHandleSuccess]);


    // 1. Initial Load & Socket Setup
    useEffect(() => {
        // --- SECURITY: ROUTE GUARD ---
        const guardQris = () => {
            const p_id = searchParams.get('orderId') || searchParams.get('id');
            const s_raw = sessionStorage.getItem('post_payment_state');
            const p_raw = sessionStorage.getItem('pending_order_payload'); // TAHAP 37: Allow pending payload
            let s_id = null;
            if (s_raw) {
                try { s_id = JSON.parse(s_raw).transactionCode; } catch (e) { }
            }

            // Must have one of these to stay on the page
            if (!p_id && !s_id && !p_raw) {
                // Check backup before redirecting (for refresh support)
                const backup = localStorage.getItem('qris_backup');
                if (!backup) {
                    router.replace('/home');
                    return false;
                }
            }
            return true;
        };
        if (!guardQris()) return;

        // Parse Params
        let idParam, amtParam, numId; // numId for redirect
        try {
            // Security: Read from sessionStorage
            const pendingPayloadRaw = sessionStorage.getItem('pending_order_payload');

            if (pendingPayloadRaw) {
                // TAHAP 36: OPTIMISTIC CHECKOUT - Background API Execution
                const parsedPayload = JSON.parse(pendingPayloadRaw);
                setLoadingQr(true); // Keep spinner active while creating order

                const executeOrder = async () => {
                    try {
                        const response = await createOrder(parsedPayload);
                        sessionStorage.removeItem('pending_order_payload'); // Clear to prevent loops

                        // Fake the old post_payment_state so the rest of the useEffect flows normally
                        const finalState = {
                            items: parsedPayload.items,
                            subtotal: parsedPayload.totalAmount,
                            orderType: parsedPayload.orderType,
                            method: parsedPayload.paymentMethod,
                            transactionCode: response.data.transactionCode,
                            orderId: response.data.id
                        };
                        sessionStorage.setItem('post_payment_state', JSON.stringify(finalState));

                        setOrderState(finalState);
                        setOrderId(response.data.transactionCode); // FIX 40: Map to Transaction Code, not integer ID
                        setAmount(parsedPayload.totalAmount);
                        numericIdRef.current = response.data.id;
                        idParam = response.data.transactionCode;

                        // Backup
                        const newExpiry = Date.now() + 300000;
                        setServerExpiry(newExpiry);
                        localStorage.setItem('qris_backup', JSON.stringify({
                            id: response.data.transactionCode,
                            numericId: response.data.id,
                            amount: parsedPayload.totalAmount,
                            expiryTime: newExpiry
                        }));
                    } catch (err) {
                        if (process.env.NODE_ENV !== 'production') console.error("Background Order Failed:", err);
                        alert("Pembuatan pesanan gagal. Silakan kembali dan coba lagi (Error: " + (err.message || 'Server sibuk') + ").");
                        sessionStorage.removeItem('pending_order_payload'); // Clear to prevent loops
                        router.replace('/payment'); // Rollback to payment selection
                    }
                };
                executeOrder();
                return; // Let the async function handle the state updates and trigger the next useEffect
            }

            const raw = sessionStorage.getItem('post_payment_state');
            if (raw) {
                const parsed = JSON.parse(raw);
                setOrderState(parsed);

                // Security: Sanitize Inputs
                // RELAXED SANITIZATION: Allow basic punctuation often used in IDs (., @, :, +)
                const sanitize = (val) => String(val || '').substring(0, 100).replace(/[^a-zA-Z0-9\-_@.:+]/g, '') || null;

                // idParam = transactionCode (for socket/polling)
                idParam = sanitize(parsed.transactionCode || parsed.id);
                // numId = numeric ID (for redirect)
                numId = sanitize(parsed.orderId);

                // Security: Validate Amount (Max 99jt, Positive)
                const rawAmt = Number(parsed.subtotal || parsed.totalAmount);
                amtParam = Math.max(0, Math.min(rawAmt || 0, 99999999));

                // NEW: Backup for refresh resilience (Store both IDs and persist Timer)
                const existingBackupStr = localStorage.getItem('qris_backup');
                let existingExpiry = Date.now() + 300000;
                if (existingBackupStr) {
                    try {
                        const parsedBkp = JSON.parse(existingBackupStr);
                        // Make sure we carry over the old timer if the ID matches
                        if (parsedBkp.expiryTime && parsedBkp.id === idParam) {
                            existingExpiry = parsedBkp.expiryTime; 
                        }
                    } catch(e) {}
                }
                setServerExpiry(existingExpiry);

                localStorage.setItem('qris_backup', JSON.stringify({
                    id: idParam,
                    numericId: numId,
                    amount: amtParam,
                    expiryTime: existingExpiry
                }));
            }

            // Fallback: Read from localStorage if sessionStorage is empty (Refresh scenario)
            if (!idParam || !amtParam) {
                const backup = localStorage.getItem('qris_backup');
                if (backup) {
                    const b = JSON.parse(backup);
                    if (!idParam) idParam = b.id;
                    if (!amtParam) amtParam = b.amount;
                    if (!numId) numId = b.numericId;
                    if (b.expiryTime) setServerExpiry(b.expiryTime);
                }
            }

            // Fallback params from URL (for deep linking)
            // Security: Sanitize URL params too
            if (!idParam) {
                const urlId = searchParams.get('orderId');
                // RELAXED SANITIZATION for URL param too
                idParam = urlId ? String(urlId).substring(0, 100).replace(/[^a-zA-Z0-9\-_@.:+]/g, '') : null;
            }

            // Also check URL for explicit numeric ID if available (though unlikely in this flow)
            if (!numId) {
                const urlNumId = searchParams.get('numericId'); // Optional param
                if (urlNumId) numId = String(urlNumId).replace(/[^0-9]/g, '');
            }

            if (idParam) setOrderId(idParam);
            if (amtParam) setAmount(amtParam);
            if (numId) numericIdRef.current = numId;

        } catch (e) {
            if (process.env.NODE_ENV !== 'production') console.error("Parse Error", e);
        }
    }, [searchParams]); // REMOVE CALLBACKS FROM DEPS to prevent loops

    // FIX 41: Independent Timer & Socket (Separated from Optimistic Checkout's early return)
    useEffect(() => {
        if (!orderId) return; // Wait until order is established

        // Sync remaining instantly with real expiry difference
        const currentDiff = Math.floor((serverExpiry - Date.now()) / 1000);
        setRemaining(Math.max(0, currentDiff));

        // True Server Timestamp Timer
        const interval = setInterval(() => {
            const diff = Math.floor((serverExpiry - Date.now()) / 1000);
            if (diff <= 1) {
                setRemaining(0);
                clearInterval(interval);
                return;
            }
            setRemaining(diff);
        }, 1000);

        // Socket.IO Listener for Webhook Updates
        const socket = io(getDynamicUrl(), {
            transports: ['websocket', 'polling'],
            reconnection: true,
            // TAHAP 53: Anti-DDoS Server
            reconnectionAttempts: 10, // Don't try infinity
            reconnectionDelay: 5000,  // Wait 5 seconds between tries (give Koyeb time to breathe)
            timeout: 20000,
            forceNew: true,
        });

        socket.on('connect', () => {
            if (process.env.NODE_ENV !== 'production') console.log("Socket connected:", socket.id);
            socket.emit('join_room', orderId); // Emit ID explicitly
        });

        socket.on('order_update', (data) => {
            if (process.env.NODE_ENV !== 'production') console.log("Socket Update Received:", data);

            const isMyOrder = String(data.transactionCode) === String(orderId);
            // Check broadly for success status
            const status = (data.status || '').toLowerCase();
            const isPaidStatus = status === 'paid' || status === 'completed' || status === 'settlement' || status === 'success';

            if (isMyOrder && isPaidStatus) {
                if (process.env.NODE_ENV !== 'production') console.log("PAYMENT SUCCESS DETECTED via Socket! Redirecting immediately...");

                // TRUST THE SOCKET - INSTANT REDIRECT
                setIsPaid(true); // Trigger UI Success

                // Clear backup immediately
                localStorage.removeItem('qris_backup');

                const targetId = numericIdRef.current || orderId;

                // Delay slightly just to show check mark (UX) then GO
                setTimeout(() => {
                    router.push(`/order?orderId=${targetId}`);
                }, 1500);
            }
        });

        return () => {
            clearInterval(interval);
            socket.disconnect();
        };
    }, [orderId, router]); // Reacts when orderId is fully generated

    // TIMER EXPIRY LOGIC
    useEffect(() => {
        // TAHAP 37: Fix Expiry Loop Bug - Don't expire while we are in initial background loading
        if (loadingQr || !orderId) return;

        // Security: Check both visual timer and server timestamp
        const isTimerExpired = remaining <= 0 || Date.now() > serverExpiry;
        if (isTimerExpired && !isPaid && !isExpired && orderId) {
            setIsExpired(true);

            // Call backend to expire
            // Safe to fire-and-forget or handle error
            const API_URL = getDynamicUrl();
            fetch(`${API_URL}/api/payment/expire-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId })
            }).catch(err => {
                if (process.env.NODE_ENV !== 'production') console.error("Expire Error", err);
            });

            // Auto redirect
            setTimeout(() => {
                // Security: Use sessionStorage
                try { sessionStorage.setItem('payment_state', JSON.stringify(orderState || {})); } catch (e) { }
                router.push('/payment');
            }, 3500);
        }
    }, [remaining, isPaid, isExpired, orderId, orderState, router, serverExpiry, loadingQr]);

    // 2. Fetch QR Code Trigger
    useEffect(() => {
        if (!orderId || !amount) return;
        if (qrValue) return; // Already loaded

        const fetchQr = async () => {
            try {
                setLoadingQr(true); // Ensure loading state is set
                const API_URL = getDynamicUrl();
                const res = await fetch(`${API_URL}/api/payment/create-transaction`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: orderId,
                        amount: amount
                    })
                });

                const json = await res.json();

                // 1. Check if already Paid (Backend handles "Transaction already completed" check)
                if (json.success && json.status === 'Paid') {
                    if (process.env.NODE_ENV !== 'production') console.log("Transaction already paid!");
                    handleSuccessRef.current(orderId);
                    return;
                }

                // 2. Normal QR Flow
                if (json.success && json.data) {
                    if (json.data.qrString) {
                        setQrValue(json.data.qrString);
                        // Update amount if backend says so (e.g. fees)
                        if (json.data.amount) setAmount(json.data.amount);
                    } else if (json.data.paymentUrl) {
                        // Security: Open Redirect Protection
                        const url = json.data.paymentUrl;
                        // Whitelist domains (Midtrans, Duitku, Xendit, dll)
                        const IS_SAFE_DOMAIN = /^https:\/\/(app\.pakasir\.com|.*\.midtrans\.com|.*\.duitku\.com|.*\.xendit\.co|.*\.doku\.com)\//i.test(url);

                        if (url && IS_SAFE_DOMAIN) {
                            if (process.env.NODE_ENV !== 'production') console.log("Menunggu aksi pengguna untuk Midtrans URL:", url);
                            setPaymentUrl(url); // Simpan URL, jangan auto redirect
                        } else {
                            setError("Link pembayaran tidak valid / tidak aman.");
                            if (process.env.NODE_ENV !== 'production') console.error("Blocked unsafe redirect:", url);
                        }
                    }
                } else {
                    throw new Error(json.message || "Gagal memuat pembayaran");
                }
            } catch (err) {
                if (process.env.NODE_ENV !== 'production') console.error("QR Fetch Error:", err);

                // Tampilkan pesan error spesifik dari Backend kalau ada (contoh: "Metode Pembayaran belum diaktifkan")
                setError(err.message || "Terjadi kesalahan sistem. Silakan coba lagi.");
            } finally {
                setLoadingQr(false);
            }
        };

        fetchQr();
    }, [orderId, amount, qrValue]); // REMOVE handleSuccess

    // 3. Polling Backup (Just in case Webhook/Socket is delayed)
    useEffect(() => {
        if (!orderId || isPaid || !amount || isExpired) return;

        const checkStatus = async () => {
            // TAHAP 53: Throttling Polling in Background Tab
            if (document.hidden) return; // Do not poll if user is looking at WhatsApp/TikTok

            try {
                const API_URL = getDynamicUrl();
                const res = await fetch(`${API_URL}/api/payment/check-status/${orderId}?amount=${amount}`);
                const json = await res.json();

                if (json.status === 'Paid') {
                    handleSuccessRef.current(orderId);
                }
            } catch (e) {
                // Ignore polling errors
            }
        };

        let poll = setInterval(checkStatus, 5000);
        return () => clearInterval(poll);
    }, [orderId, isPaid, amount, isExpired]); // REMOVE handleSuccess

    const formatTime = (sec) => {
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    // --- DOWNLOAD QR AS PNG ---
    const handleDownloadQr = useCallback(() => {
        if (!qrImageUrl) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const W = 360, H = 460;
        canvas.width = W;
        canvas.height = H;

        // Background
        ctx.fillStyle = '#FFFFFF';
        ctx.roundRect(0, 0, W, H, 20);
        ctx.fill();

        // Header label
        ctx.fillStyle = '#2C3E50';
        ctx.font = 'bold 18px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Pembayaran QRIS', W / 2, 40);

        // Amount
        ctx.fillStyle = '#1F2937';
        ctx.font = 'bold 28px Poppins, sans-serif';
        ctx.fillText(`Rp ${(amount || 0).toLocaleString('id-ID')}`, W / 2, 78);

        // Draw QR image
        const img = new Image();
        img.onload = () => {
            const qrSize = 260;
            const qrX = (W - qrSize) / 2;
            const qrY = 100;

            // QR border
            ctx.strokeStyle = '#E2E8F0';
            ctx.lineWidth = 3;
            ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 16);
            ctx.stroke();

            ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

            // Footer text
            ctx.fillStyle = '#94A3B8';
            ctx.font = '13px Poppins, sans-serif';
            ctx.fillText('Scan dengan GoPay, OVO, Dana, ShopeePay', W / 2, qrY + qrSize + 35);
            ctx.fillText('atau Mobile Banking Anda', W / 2, qrY + qrSize + 55);

            // Trigger download
            const link = document.createElement('a');
            link.download = `qris-payment-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        img.src = qrImageUrl;
    }, [qrImageUrl, amount]);

    // --- CLIENT-SIDE QR CODE RENDERER ---
    useEffect(() => {
        if (!qrValue) return;
        QRCode.toDataURL(qrValue, {
            width: 280,
            margin: 2,
            errorCorrectionLevel: 'M',
            color: { dark: '#000000', light: '#FFFFFF' }
        })
        .then(url => setQrImageUrl(url))
        .catch(err => {
            if (process.env.NODE_ENV !== 'production') console.error('QR Render Error:', err);
            setError('Gagal merender QR Code.');
        });
    }, [qrValue]);

    return (
        <div className="app">
            <style jsx global>{`
                
                :root {
                    --bg-main: #2C3E50;
                    --card-bg: #FFFFFF;
                    --text-main: #1F2937;
                    --text-sub: #64748B;
                    --accent-red: #DC2626;
                    --accent-red-soft: #FEF2F2;
                    --border-soft: #E2E8F0;
                }
                * { margin:0; padding:0; box-sizing:border-box; font-family:'Poppins',sans-serif; }
                body { background:#111827; }
                .app { width:100%; max-width:480px; margin:0 auto; min-height:100vh; background:var(--bg-main); padding-top:80px; padding-bottom:24px; position:relative; }
                
                .header { position:absolute; top:20px; left:0; right:0; text-align:center; color:#FFF; font-size:1.1rem; font-weight:700; display:flex; align-items:center; justify-content:center; }
                .btn-back { position:absolute; left:20px; background:rgba(255,255,255,0.1); border:none; cursor:pointer; display:flex; padding:8px; border-radius:12px; backdrop-filter:blur(4px); }
                
                .card { width:90%; margin:0 auto; background:var(--card-bg); border-radius:24px; padding:32px 24px; box-shadow:0 10px 40px rgba(0,0,0,0.2); text-align:center; position:relative; }
                
                .timer-pill { display:inline-block; background:var(--accent-red-soft); color:var(--accent-red); padding:8px 16px; border-radius:20px; font-weight:700; font-size:0.85rem; margin-bottom:24px; }
                
                .amount-val { font-size:32px; font-weight:800; color:var(--bg-main); line-height:1; }
                .amount-lbl { font-size:0.9rem; color:var(--text-sub); margin-top:8px; margin-bottom:24px; font-weight:500; }
                
                .qr-box { 
                    width:240px; height:240px; margin:0 auto 24px; 
                    background:#FFF; border:4px solid #F1F5F9; border-radius:24px;
                    display:flex; align-items:center; justify-content:center; overflow:hidden;
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.02);
                }
                
                .decor-circle { width:30px; height:30px; background:var(--bg-main); border-radius:50%; position:absolute; top:32%; }
                .decor-left { left:-15px; }
                .decor-right { right:-15px; }

                .spinner { width:40px; height:40px; border:4px solid #E2E8F0; border-top-color:#3B82F6; border-radius:50%; animation:spin 1s linear infinite; }
                @keyframes spin { to { transform:rotate(360deg); } }

                .wallets { display:flex; justify-content:center; gap:12px; margin-top:24px; opacity:0.8; }
                .wallet-icon { width:42px; height:42px; background:#FFF; border-radius:10px; border:1px solid #E2E8F0; display:flex; align-items:center; justify-content:center; padding: 6px; }
                .wallet-icon img { width: 100%; height: 100%; object-fit: contain; }

                .btn-download-qr {
                    display:inline-flex; align-items:center; gap:8px;
                    background:linear-gradient(135deg, #3B82F6, #2563EB);
                    color:#FFF; border:none; border-radius:14px;
                    padding:12px 24px; font-size:0.9rem; font-weight:600;
                    cursor:pointer; margin-bottom:20px;
                    box-shadow:0 4px 14px rgba(59,130,246,0.35);
                    transition:all 0.2s ease;
                    font-family:'Poppins',sans-serif;
                }
                .btn-download-qr:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(59,130,246,0.45); }
                .btn-download-qr:active { transform:translateY(0); }
            `}</style>

            <div className="header">
                <button className="btn-back" onClick={() => router.push('/payment')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>
                Pembayaran QRIS
            </div>

            <div className="card">
                <div className="decor-circle decor-left"></div>
                <div className="decor-circle decor-right"></div>

                <div className="timer-pill">
                    {remaining > 0 ? `Selesaikan dalam ${formatTime(remaining)}` : 'Waktu Habis'}
                </div>

                <div className="amount-val">Rp {(amount || 0).toLocaleString('id-ID')}</div>
                <div className="amount-lbl">Total Pembayaran</div>

                <div className="qr-box">
                    {loadingQr ? (
                        <div className="spinner"></div>
                    ) : error ? (
                        <div style={{ color: 'red', fontSize: '13px', padding: '10px' }}>{error}</div>
                    ) : qrImageUrl ? (
                        <div style={{ padding: '12px', background: 'white', borderRadius: '16px', display: 'flex', justifyContent: 'center' }}>
                            <img 
                                src={qrImageUrl} 
                                alt="QRIS Code" 
                                style={{ height: "auto", maxWidth: "100%", width: "220px", display: 'block' }}
                            />
                        </div>
                    ) : null}
                </div>

                {qrImageUrl && !loadingQr && !error && (
                    <button className="btn-download-qr" onClick={handleDownloadQr} id="btn-download-qr">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Simpan QR
                    </button>
                )}

                <img src="/assets/Qris_Logo.svg" alt="QRIS" style={{ height: '28px', marginBottom: '20px', opacity: 0.8 }} />

                <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: '1.6' }}>
                    Scan QR ini dengan GoPay, OVO, Dana, ShopeePay atau Mobile Banking Anda.
                </p>

                <div className="wallets">
                    <div className="wallet-icon"><img src="/assets/gopay.png" alt="GoPay" /></div>
                    <div className="wallet-icon"><img src="/assets/ovo.png" alt="OVO" /></div>
                    <div className="wallet-icon"><img src="/assets/dana.png" alt="Dana" /></div>
                    <div className="wallet-icon"><img src="/assets/shoppe.png" alt="ShopeePay" /></div>
                </div>
            </div>

            <AnimatePresence>
                {isPaid && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="success-overlay"
                        style={{
                            position: 'fixed', inset: 0, background: '#FFFFFF', zIndex: 100,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 15 }}
                            style={{
                                width: 80, height: 80, borderRadius: '50%', background: '#10B981',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20
                            }}
                        >
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937' }}
                        >
                            Pembayaran Berhasil!
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                            style={{ color: '#6B7280', marginTop: 8 }}
                        >
                            Terima kasih, pesananmu sedang kami siapkan!
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAILURE POPUP */}
            <AnimatePresence>
                {isExpired && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="failure-overlay"
                        style={{
                            position: 'fixed', inset: 0, background: '#FFFFFF', zIndex: 100,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 15 }}
                            style={{
                                width: 80, height: 80, borderRadius: '50%', background: '#EF4444',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20
                            }}
                        >
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937' }}
                        >
                            Pembayaran Gagal
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                            style={{ color: '#6B7280', marginTop: 8 }}
                        >
                            Waktu habis. Silakan coba lagi.
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function QrisPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#2C3E50', color: '#fff' }}>Loading...</div>}>
            <QrisContent />
        </Suspense>
    );
}
