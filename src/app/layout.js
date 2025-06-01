import Footer from "@/components/Footer/Footer";
import "./globals.css";
import FooterTree from "@/components/FooterTree/FooterTree";
import Header from "@/components/Header/Header";
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next';
import Script from "next/script";

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
        {/* <SpeedInsights /> */}
        <Analytics />
        {/* Яндекс.Метрика */}
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {
                if (document.scripts[j].src === r) { return; }
              }
              k=e.createElement(t),a=e.getElementsByTagName(t)[0];
              k.async=1;k.src=r;a.parentNode.insertBefore(k,a);
            })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

            ym(100456556, "init", {
              clickmap:true,
              trackLinks:true,
              accurateTrackBounce:true,
              webvisor:true
            });`,
          }}
        />

        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/100456556"
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
      </body>
    </html>
  );
}

