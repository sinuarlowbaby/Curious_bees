import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CuriousBees — AI-powered Academic Collaboration Portal',
  description: 'A dedicated intranet collaboration space for CuriousBees Academic Portal Faculty and PhD Scholars.',
};

export default function RootLayout({
  children,
}: Readrules<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                  localStorage.setItem('curiousbees-theme', 'light');
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="antialiased bg-darkBg text-textPrimary relative min-h-screen">
        {/* Global 3% noise texture overlay */}
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}

// Utility to handle typescript parameter typings without syntax bugs
type Readrules<T> = Readonly<T>;

