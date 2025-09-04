import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES_DATA = [
  { icon: '📚', title: 'جزوات کامل و فشرده', description: 'محتوای آموزشی کامل با حجم بهینه برای مطالعه سریع و موثر' },
  { icon: '🎯', title: 'تمرکز بر نکات مهم', description: 'تاکید بر مباحث کلیدی و پرتکرار در آزمون‌های مختلف' },
  { icon: '📱', title: 'دسترسی همه‌جا', description: 'مطالعه در هر زمان و مکان با پلتفرم موبایل فرندلی' },
  { icon: '🔄', title: 'به‌روزرسانی مداوم', description: 'محتوای به‌روز مطابق با آخرین تغییرات سرفصل‌های درسی' },
  { icon: '💡', title: 'روش‌های یادگیری نوین', description: 'استفاده از تکنیک‌های مدرن برای تسهیل فرآیند یادگیری' },
  { icon: '🏆', title: 'پشتیبانی تخصصی', description: 'راهنمایی توسط اساتید مجرب و متخصص فیزیوپاتولوژی' }
];

const STATS_DATA = [
  { icon: '📈', title: '98% نرخ موفقیت', description: 'دانشجویان ما نمرات بالاتری کسب می‌کنند' },
  { icon: '⏱️', title: 'صرفه‌جویی 70% زمان', description: 'مطالعه سریع‌تر با محتوای فشرده' },
  { icon: '👥', title: '+10,000 دانشجو', description: 'جامعه بزرگ دانشجویان موفق' }
];

function Navigation({ isVisible, onNavigate }) {
  return (
    <nav className="sticky top-4 z-50 mx-auto max-w-5xl rounded-full border border-white/30 bg-white/50 p-2 backdrop-blur-lg">
      <div className="mx-auto flex items-center justify-between px-6 py-3">
        <div className={`transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
          <h1 className="text-xl font-bold text-blue-700">نوتیکا 🎓</h1>
        </div>
        <button
          onClick={() => onNavigate('/login')}
          className={`transform rounded-full bg-blue-600 px-6 py-2 font-medium text-white transition-all duration-300 hover:bg-blue-700 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
        >
          ورود / ثبت‌نام
        </button>
      </div>
    </nav>
  );
}

function HeroSection({ isVisible, onNavigate }) {
  return (
    <section className="relative bg-white pb-20 pt-16 text-center">
      <div className="mx-auto max-w-4xl px-6">
        <div className={`transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
            آماده موفقیت در آزمون‌های <span className="text-blue-600">فیزیوپاتولوژی</span> هستید؟
          </h1>
        </div>
        <div className={`delay-200 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <p className="mb-10 text-xl text-gray-600">
            بهترین جزوات فیزیوپاتولوژی با کیفیت بالا و حجم بهینه
          </p>
        </div>
        <div className={`delay-400 mb-16 flex flex-col justify-center gap-4 transition-all duration-1000 sm:flex-row ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <button onClick={() => onNavigate('/login')} className="transform rounded-full bg-blue-600 px-8 py-4 font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-blue-700">
            شروع کنید (رایگان) 🚀
          </button>
          <button className="transform rounded-full border border-blue-200 bg-white px-8 py-4 font-medium text-blue-600 transition-all duration-300 hover:scale-105 hover:bg-gray-100">
            نمونه جزوات
          </button>
        </div>
        <div className="mx-auto mb-16 flex h-80 max-w-3xl items-center justify-center rounded-3xl bg-gray-50 p-2">
          <img src="/assets/1.png" alt="نمایش جزوات" className="h-full rounded-2xl object-contain" />
        </div>
        <StatsGrid isVisible={isVisible} />
      </div>
    </section>
  );
}

function StatsGrid({ isVisible }) {
  return (
    <div className={`grid grid-cols-1 gap-6 transition-all delay-600 duration-1000 md:grid-cols-3 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
      {STATS_DATA.map((stat, index) => (
        <div key={index} className="transform rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1">
          <div className="mb-3 text-3xl">{stat.icon}</div>
          <h3 className="mb-2 font-semibold text-gray-900">{stat.title}</h3>
          <p className="text-sm text-gray-600">{stat.description}</p>
        </div>
      ))}
    </div>
  );
}

function FeaturesSection({ activeFeature }) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">چرا نوتیکا؟</h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            با متدهای نوین و تکنولوژی پیشرفته، تجربه‌ای متفاوت از یادگیری خواهید داشت
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES_DATA.map((feature, index) => (
            <div
              key={index}
              className={`rounded-2xl border p-8 transition-all duration-300 ${activeFeature === index ? 'border-blue-300 shadow-lg' : 'border-gray-200/80 hover:border-blue-200'}`}
            >
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImageShowcase() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex h-80 items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-white p-4">
          <div className="text-center text-gray-500">
            <div className="mb-3 text-5xl">📱</div>
            <p>[تصویر یا گیف نمایش جزوات]</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CallToAction({ onNavigate }) {
  return (
    <section className="bg-blue-600 py-20 text-white">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="mb-6 text-4xl font-bold">وقتشه که پیشرفت کنی!</h2>
        <p className="mb-8 text-2xl opacity-90">
          با نوتیکا، موفقیت تحصیلی فقط یک قدم فاصله داره
        </p>
        <div className="space-y-4">
          <button onClick={() => onNavigate('/app')} className="transform rounded-full bg-white px-10 py-4 text-xl font-bold text-blue-600 transition-all duration-300 hover:scale-105 hover:bg-gray-100">
            همین حالا ثبت‌نام کن 🎓
          </button>
          <p className="text-lg opacity-75">رایگان شروع کن | پشتیبانی ۲۴/۷</p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-800 py-16 text-gray-300">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-10 text-lg md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-2xl font-bold text-white">نوتیکا</h3>
            <p className="mb-4">بهترین پلتفرم آموزش فیزیوپاتولوژی برای دانشجویان علوم پزشکی</p>
            <p>📧 info@notica.ir</p>
          </div>
          <div>
            <h4 className="mb-4 text-xl font-semibold text-white">لینک‌های مفید</h4>
            <ul className="space-y-3">
              <li><a href="#" className="transition-colors hover:text-white">درباره ما</a></li>
              <li><a href="#" className="transition-colors hover:text-white">تماس با ما</a></li>
              <li><a href="#" className="transition-colors hover:text-white">سوالات متداول</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xl font-semibold text-white">خدمات</h4>
            <ul className="space-y-3">
              <li><a href="#" className="transition-colors hover:text-white">جزوات فیزیوپات ۱</a></li>
              <li><a href="#" className="transition-colors hover:text-white">جزوات فیزیوپات ۲</a></li>
              <li><a href="#" className="transition-colors hover:text-white">آزمون‌های آزمایشی</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xl font-semibold text-white">ارتباط با ما</h4>
            <ul className="space-y-3">
              <li>📱 021-12345678</li>
              <li>📍 تهران، ایران</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>© 2025 نوتیکا - تمامی حقوق محفوظ است</p>
        </div>
      </div>
    </footer>
  );
}

function Site() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const handleNavigate = (path) => navigate(path);

  useEffect(() => {
    setIsVisible(true);
    
    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES_DATA.length);
    }, 3000);

    return () => {
      clearInterval(featureInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navigation isVisible={isVisible} onNavigate={handleNavigate} />
      <main>
        <HeroSection isVisible={isVisible} onNavigate={handleNavigate} />
        <FeaturesSection activeFeature={activeFeature} />
        <ImageShowcase />
        <CallToAction onNavigate={handleNavigate} />
        <Footer />
      </main>
    </div>
  );
}

export default Site;