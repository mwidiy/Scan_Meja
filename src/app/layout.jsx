// src/app/layout.jsx

// Gunakan "../styles/globals.css" karena file ada di folder styles
import "../styles/globals.css";

import { Inter } from 'next/font/google';
import Script from 'next/script';
import TableGuard from '../components/TableGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "Meja Pesan App",
  description: "Aplikasi Pemesanan Makanan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      {/* suppressHydrationWarning ditambahkan untuk mencegah error ekstensi browser */}
      <body className={inter.className} suppressHydrationWarning={true}>
        {/* Registrasi dini web component model-viewer agar aman dari hydration & late-loading crash */}
        <Script
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"
          type="module"
          strategy="afterInteractive"
        />
        <TableGuard>
          {children}
        </TableGuard>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('${process.env.NODE_ENV}' === 'production') {
                console.log = function() {};
                console.warn = function() {};
                console.error = function() {};
              }
            `,
          }}
        />
      </body>
    </html>
  );
}