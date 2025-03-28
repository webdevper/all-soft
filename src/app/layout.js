import { Poppins } from "next/font/google"; 
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
   display: 'swap',
  weight: ["300", "400", "500", "600", "700"], 
});

export const metadata = {
  title: " Document Management",
  description: "a Document Management System ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
