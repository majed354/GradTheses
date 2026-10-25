import type { Metadata } from "next";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "./globals.css";
import { Header, Footer } from "@/components/site";
export const metadata: Metadata = {
  title: {
    default: "مداد كلية الشريعة والأنظمة | بحوث ورسائل الدراسات العليا",
    template: "%s | مداد كلية الشريعة والأنظمة",
  },
  applicationName: "مداد كلية الشريعة والأنظمة",
  description:
    "فهرس بحوث ورسائل الدراسات العليا بكلية الشريعة والأنظمة بجامعة الطائف. استعراض البيانات للجميع وقراءة النصوص للمصرح لهم بالحساب الجامعي.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <a href="#main" className="skip-link">
          انتقل إلى المحتوى
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
