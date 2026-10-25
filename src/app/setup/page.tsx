import { Check, ArrowUpLeft } from "lucide-react";
import { Breadcrumb } from "@/components/site";
export const metadata = {
  title: "تجهيز الربط الجامعي",
  robots: { index: false, follow: false },
};
export default function Setup() {
  return (
    <main id="main">
      <Breadcrumb items={[{ label: "تجهيز الربط الجامعي" }]} />
      <article className="container prose-page setup-page">
        <div className="section-kicker">دليل مسؤول المنصة</div>
        <h1>من النسخة الأولية إلى المستودع الجامعي</h1>
        <p className="lead">
          الواجهة ومسار الربط جاهزان للتجربة. يتطلب تشغيل البيانات الحقيقية
          والقراءة إعداد الخدمات التالية بواسطة مسؤول الجامعة.
        </p>
        <ol className="setup-steps">
          <li>
            <span>01</span>
            <div>
              <h2>موقع SharePoint مؤسسي</h2>
              <p>
                موقع لإدارة السجلات، وموقع مخصص لمكتبة القراءة. يُعيّن مالكان
                على الأقل، وتُمنح مجموعة القراء الجامعيين صلاحية مناسبة، مع منع
                المشاركة المجهولة.
              </p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h2>قائمة بيانات النشر</h2>
              <p>
                إنشاء قائمة PublicCatalogue بالأسماء الداخلية المحددة في دليل
                المستودع. لا يُضاف إليها إلا ما اعتمد للنشر العام. تحفظ الأصول
                والملاحظات الداخلية خارجها.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h2>تطبيق في Microsoft Entra</h2>
              <p>
                تسجيل تطبيق Web داخل مستأجر الجامعة، وإضافة عنوان العودة للدخول،
                وإنشاء دور Theses.Reader وتعيينه للمصرح لهم. تُمنح الخدمة قراءة
                قائمة الفهرس المحددة فقط.
              </p>
            </div>
          </li>
          <li>
            <span>04</span>
            <div>
              <h2>حماية مكتبة القراءة واختبارها</h2>
              <p>
                يتحقق مسؤول SharePoint من الترخيص ومنع التنزيل والطباعة
                والمزامنة ومن إعدادات المشاركة. تُختبر الملفات بحساب قارئ عادي
                قبل تفعيل القراءة في الموقع.
              </p>
            </div>
          </li>
          <li>
            <span>05</span>
            <div>
              <h2>إضافة إعدادات الربط في نتلفاي</h2>
              <p>
                إدخال معرّفات المستأجر والتطبيق والموقع والقائمة واسم مضيف
                SharePoint. تُضاف الأسرار مباشرة إلى متغيرات نتلفاي المحمية، ثم
                يعاد النشر ويُختبر الربط.
              </p>
            </div>
          </li>
        </ol>
        <div className="setup-callout">
          <Check size={22} />
          <p>
            للبدء نحتاج رابط موقع SharePoint، وتعاون مسؤول Entra/SharePoint،
            وعينة صغيرة من السجلات والرسائل المعتمدة. لا ترسل كلمات المرور أو
            الأسرار في المحادثة.
          </p>
        </div>
        <a
          className="button button-primary"
          href="https://github.com/majed354/GradTheses/blob/main/docs/SHAREPOINT-SETUP.ar.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          دليل الإعداد التقني الكامل <ArrowUpLeft size={17} />
        </a>
      </article>
    </main>
  );
}
