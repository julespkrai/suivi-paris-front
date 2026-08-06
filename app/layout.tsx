import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import LenisProvider from '@/components/LenisProvider';

export const metadata: Metadata = {
  title: 'Suivi Paris — Tableau de bord',
  description: 'Suivi de paris sportifs multi-canal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <LenisProvider>
            {children}
          </LenisProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
