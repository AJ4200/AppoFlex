import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "animate.css";
import "@/styles/index.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SplashGate from "@/components/splash/SplashGate";
import Splashbackground from "@/components/splash/Splashbackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "AppoFlex", template: "%s | AppoFlex" },
  description:
    "Flexible appointment management for clients and service providers, with real-time alerts and smart scheduling.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Splashbackground />
        <SplashGate>
          <div className="app-shell">
            <Navbar />
            <div className="app-content">{children}</div>
            <Footer />
          </div>
        </SplashGate>
      </body>
    </html>
  );
}
