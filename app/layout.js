import './globals.css';
import { Manrope } from 'next/font/google';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata = {
  title: 'SchoolConnect 360 | Connected School Management Platform',
  description: 'One Platform. Every School. Connected for Success. Multi-tenant modern education management platform with 34 collaborative roles.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}
