import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SRM Recollab — AI-powered Academic Collaboration Portal',
  description: 'A dedicated intranet collaboration space for SRM Institute of Science and Technology Faculty and PhD Scholars.',
};

export default function RootLayout({
  children,
}: Readrules<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('srm-recollab-theme') || 'light';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

// Utility to handle typescript parameter typings without syntax bugs
type Readrules<T> = Readonly<T>;
