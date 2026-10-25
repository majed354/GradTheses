import { ArrowUpLeft } from "lucide-react";
import { Breadcrumb } from "@/components/site";
export const metadata = {
  title: "إدارة الفهرس والقراءة",
  robots: { index: false, follow: false },
};
export default function Setup() {
  return (
    <main id="main">
      <Breadcrumb items={[{ label: "إدارة الفهرس والقراءة" }]} />
      <article className="container prose-page setup-page">
        <div className="section-kicker">دليل مسؤول المنصة</div>
        <h1>إضافة الأعمال وإتاحة قراءتها</h1>
        <p className="lead">
          تُحفظ الملفات في موقع الكلية على SharePoint، ويستخدم القارئ الدخول
          الجامعي القائم. يُنشر الفهرس العام في خطوة مستقلة بعد مراجعة بياناته.
        </p>
        <ol className="setup-steps">
          <li>
            <span>01</span>
            <div>
              <h2>مراجعة بيانات الفهرس</h2>
              <p>
                لكل عمل معرّف ثابت. تُحفظ السنة الهجرية كما وردت في المصدر،
                ويُفصل إنجاز العمل عن توفر ملفه. يُترك نوع العمل أو المشرف غير
                المتوفر للمراجعة.
              </p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h2>استلام الملفات تدريجيًا</h2>
              <p>
                تُحفظ الملفات الواردة للمراجعة، ثم تُطابق بالباحث والعنوان. يمكن
                جلب ملفات القناة الموسومة بـ #بحوث_الطلاب، ويُضاف معرّف السجل
                إلى وصف الملف عند توفره.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h2>اعتماد نسخة القراءة</h2>
              <p>
                تُنشأ نسخة PDF معتمدة، ويُضبط رابط عرض يتطلب الحساب الجامعي مع
                منع التنزيل. يُختبر بحساب قارئ عادي لا يملك صلاحيات تحرير أو
                وصولًا أوسع.
              </p>
            </div>
          </li>
          <li>
            <span>04</span>
            <div>
              <h2>نشر التحديث</h2>
              <p>
                بعد التحقق من البيانات والرابط، تُنشر نسخة محدثة من الفهرس. تظل
                السجلات التي لم تُرفق ملفاتها على عرض بيانات الموضوع فقط.
              </p>
            </div>
          </li>
        </ol>
        <a
          className="button button-primary"
          href="https://github.com/majed354/GradTheses/blob/main/docs/NATIVE-SHAREPOINT.ar.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          دليل التشغيل والتحديث <ArrowUpLeft size={17} />
        </a>
      </article>
    </main>
  );
}
