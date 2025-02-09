import Footer from "@/components/Footer/Footer";
import "./globals.css";
import FooterTree from "@/components/FooterTree/FooterTree";
import Header from "@/components/Header/Header";
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata = {
  title: "Домик на дереве",
  description: "Представления для детей",
  keywords: "мастер-классы, билеты, дети, Иркутск, развлечения, обучение, творчество, театр"
};
export const viewport = "width=device-width, initial-scale=1";

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <Header />
        <main>{children}</main>
        <FooterTree />
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  );
}

