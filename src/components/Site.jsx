import { useState, useEffect, memo, useCallback } from 'react';
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

const MouseGlow = memo(() => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  return (
    <div
      className={`pointer-events-none fixed z-50 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        left: position.x,
        top: position.y,
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.25) 30%, rgba(59, 130, 246, 0.1) 60%, transparent 100%)'
      }}
    />
  );
});

const Navigation = ({ isVisible, onNavigate }) => (
  <nav className="sticky top-4 z-40 mx-auto max-w-5xl rounded-full border border-white/30 bg-white/60 p-2 shadow-lg backdrop-blur">
    <div className="mx-auto flex items-center justify-between px-6 py-3">
      <div className={`transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
        <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">نوتیکا 🎓</h1>
      </div>
      <button
        onClick={onNavigate}
        className={`transform rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
      >
        ورود / ثبت‌نام
      </button>
    </div>
  </nav>
);

const StatsGrid = ({ isVisible }) => (
  <div className={`grid grid-cols-1 gap-6 transition-all delay-600 duration-1000 md:grid-cols-3 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
    {STATS_DATA.map((stat) => (
      <div key={stat.title} className="group transform rounded-2xl border border-white/30 bg-white/70 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:bg-white/90 hover:shadow-xl">
        <div className="mb-3 text-3xl group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
        <h3 className="mb-2 text-base font-semibold text-gray-900">{stat.title}</h3>
        <p className="text-sm text-gray-600">{stat.description}</p>
      </div>
    ))}
  </div>
);

const HeroSection = ({ isVisible, onNavigate }) => (
  <section className="relative bg-gradient-to-br from-blue-50 to-purple-50 pb-20 pt-16 text-center">
    <div className="mx-auto max-w-4xl px-6">
      <div className={`transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <h1 className="mb-6 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
          آماده موفقیت در آزمون‌های <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">فیزیوپاتولوژی</span> هستید؟
        </h1>
      </div>
      <div className={`delay-200 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <p className="mb-10 text-lg text-gray-600">
          بهترین جزوات فیزیوپاتولوژی با کیفیت بالا و حجم بهینه
        </p>
      </div>
      <div className={`delay-400 mb-16 flex flex-col justify-center gap-4 transition-all duration-1000 sm:flex-row ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <button onClick={onNavigate} className="group transform rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-base font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <span className="group-hover:scale-110 transition-transform duration-300">شروع کنید (رایگان) 🚀</span>
        </button>
        <button className="transform rounded-full border-2 border-blue-200 bg-white/80 px-8 py-3 text-base font-medium text-blue-600 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-blue-50 hover:border-blue-300">
          نمونه جزوات
        </button>
      </div>
      <div className="mx-auto mb-16 flex items-center justify-center rounded-3xl bg-white/60 shadow-xl backdrop-blur-sm border border-white/30">
        <img src="/assets/1.png" alt="نمایش جزوات" className="h-full rounded-2xl object-contain" />
      </div>
      <StatsGrid isVisible={isVisible} />
    </div>
  </section>
);

const FeaturesSection = memo(() => (
  <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">چرا نوتیکا؟</h2>
        <p className="mx-auto max-w-2xl text-base text-gray-600">
          با متدهای نوین و تکنولوژی پیشرفته، تجربه‌ای متفاوت از یادگیری خواهید داشت
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES_DATA.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-2xl border border-white/40 bg-white/60 p-8 transition-all duration-500 hover:-translate-y-1 hover:border-blue-200 hover:bg-white/80 hover:shadow-lg"
          >
            <div className="mb-4 text-3xl group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
));

const ImageShowcase = memo(() => (
  <div className="py-12 bg-white">
    <div className="mx-auto max-w-5xl px-6">
      <div className="group flex h-80 items-center justify-center rounded-3xl border-2 border-dashed border-blue-300/50 bg-gradient-to-br from-blue-50/50 to-purple-50/50 p-4 transition-all duration-300 hover:border-blue-400/70 hover:bg-gradient-to-br hover:from-blue-100/50 hover:to-purple-100/50">
        <div className="text-center text-gray-500">
          <div className="mb-3 text-4xl group-hover:scale-110 transition-transform duration-300">📱</div>
          <p className="text-sm font-medium">[تصویر یا گیف نمایش جزوات]</p>
        </div>
      </div>
    </div>
  </div>
));

const CallToAction = ({ onNavigate }) => (
  <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20 text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-black/10"></div>
    <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
      <h2 className="mb-6 text-3xl font-bold">وقتشه که پیشرفت کنی!</h2>
      <p className="mb-8 text-lg opacity-90">
        با نوتیکا، موفقیت تحصیلی فقط یک قدم فاصله داره
      </p>
      <div className="space-y-4">
        <button onClick={onNavigate} className="group transform rounded-full bg-white px-10 py-4 text-lg font-bold text-blue-600 shadow-xl transition-all duration-300 hover:scale-110 hover:bg-gray-50">
          <span className="group-hover:scale-105 transition-transform duration-300">همین حالا ثبت‌نام کن 🎓</span>
        </button>
        <p className="text-sm opacity-75">رایگان شروع کن | پشتیبانی ۲۴/۷</p>
      </div>
    </div>
  </section>
);

const Footer = memo(() => (
  <footer className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 text-gray-300">
    <div className="mx-auto max-w-6xl px-6">
      <div className="grid grid-cols-1 gap-10 text-sm md:grid-cols-4">
        <div>
          <h3 className="mb-4 text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">نوتیکا</h3>
          <p className="mb-4 text-xs">بهترین پلتفرم آموزش فیزیوپاتولوژی برای دانشجویان علوم پزشکی</p>
          <p className="text-xs hover:text-blue-400 transition-colors duration-300">📧 info@notica.ir</p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold text-white">لینک‌های مفید</h4>
          <ul className="space-y-3 text-xs">
            <li><a href="#" className="transition-colors duration-300 hover:text-blue-400">درباره ما</a></li>
            <li><a href="#" className="transition-colors duration-300 hover:text-blue-400">تماس با ما</a></li>
            <li><a href="#" className="transition-colors duration-300 hover:text-blue-400">سوالات متداول</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold text-white">خدمات</h4>
          <ul className="space-y-3 text-xs">
            <li><a href="#" className="transition-colors duration-300 hover:text-blue-400">جزوات فیزیوپات ۱</a></li>
            <li><a href="#" className="transition-colors duration-300 hover:text-blue-400">جزوات فیزیوپات ۲</a></li>
            <li><a href="#" className="transition-colors duration-300 hover:text-blue-400">آزمون‌های آزمایشی</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold text-white">ارتباط با ما</h4>
          <ul className="space-y-3 text-xs">
            <li className="hover:text-blue-400 transition-colors duration-300">📱 021-12345678</li>
            <li className="hover:text-blue-400 transition-colors duration-300">📍 تهران، ایران</li>
          </ul>
        </div>
      </div>
      <div className="mt-12 border-t border-gray-700 pt-8 text-center text-xs text-gray-400">
        <p>© 2025 نوتیکا - تمامی حقوق محفوظ است</p>
      </div>
    </div>
  </footer>
));

function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = useCallback(() => {
    navigate('/app');
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 relative">
      <MouseGlow />
      <Navigation isVisible={isVisible} onNavigate={handleNavigate} />
      <main>
        <HeroSection isVisible={isVisible} onNavigate={handleNavigate} />
        <FeaturesSection />
        <ImageShowcase />
        <CallToAction onNavigate={handleNavigate} />
        <Footer />
      </main>
    </div>
  );
}

export default LandingPage;