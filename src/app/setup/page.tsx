import { ArrowUpLeft } from "lucide-react";
import { Breadcrumb } from "@/components/site";
export const metadata = {
  title: "إدارة الفهرس والملخصات",
  robots: { index: false, follow: false },
};
export default function Setup() {
  return (
    <main id="main">
      <Breadcrumb items={[{ label: "إدارة الفهرس والملخصات" }]} />
      <article className="container prose-page setup-page">
        <div className="section-kicker">دليل مسؤول المنصة</div>
        <h1>إضافة الأعمال ومراجعة ملخصاتها</h1>
        <p className="lead">
          تُحفظ الملفات في موقع الكلية على SharePoint للمراجعة. تقتصر الإتاحة
          العامة على البيانات والملخصات المعتمدة، والنصوص الكاملة موقوفة مؤقتًا
          إلى حين التحقق من الأساس النظامي للنشر.
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
                تُحفظ الملفات الواردة للمراجعة، ثم تُطابق بالباحث والعنوان.
                يُضاف معرّف السجل إلى وصف الملف عند توفره، ولا يغيّر استلام
                الملف صلاحيات إتاحته.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h2>مراجعة التوصيف ونوع العمل</h2>
              <p>
                يُراجع الغلاف والمنهج والنتائج لصياغة توصيف مستقل، ويُثبت نوع
                العمل والدرجة بدليل واضح. يُدقق التوصيف بمراجعة ثانية، ويُشار
                إلى نقص النسخة عند وجوده.
              </p>
            </div>
          </li>
          <li>
            <span>04</span>
            <div>
              <h2>نشر التحديث</h2>
              <p>
                تُنشر البيانات والتوصيفات المعتمدة دون روابط للنص الكامل. تظل
                السجلات التي لم تُراجع ملفاتها ببياناتها المتاحة، ولا تُصاغ لها
                نتائج اعتمادًا على العنوان وحده.
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
