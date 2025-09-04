import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES_DATA = [
  {
    icon: '📚',
    title: 'جزوات کامل و فشرده',
    description: 'محتوای آموزشی کامل با حجم بهینه برای مطالعه سریع و موثر'
  },
  {
    icon: '🎯',
    title: 'تمرکز بر نکات مهم',
    description: 'تاکید بر مباحث کلیدی و پرتکرار در آزمون‌های مختلف'
  },
  {
    icon: '📱',
    title: 'دسترسی همه‌جا',
    description: 'مطالعه در هر زمان و مکان با پلتفرم موبایل فرندلی'
  },
  {
    icon: '🔄',
    title: 'به‌روزرسانی مداوم',
    description: 'محتوای به‌روز مطابق با آخرین تغییرات سرفصل‌های درسی'
  },
  {
    icon: '💡',
    title: 'روش‌های یادگیری نوین',
    description: 'استفاده از تکنیک‌های مدرن برای تسهیل فرآیند یادگیری'
  },
  {
    icon: '🏆',
    title: 'پشتیبانی تخصصی',
    description: 'راهنمایی توسط اساتید مجرب و متخصص فیزیوپاتولوژی'
  }
];

const TESTIMONIALS_DATA = [
  {
    name: 'سارا احمدی',
    role: 'دانشجوی پزشکی - ترم 6',
    story: 'با جزوات نوتیکا تونستم نمره‌ام رو از 12 به 18 برسونم. واقعاً فوق‌العاده بود!',
    rating: 5
  },
  {
    name: 'علی رضایی',
    role: 'دانشجوی دندانپزشکی - ترم 4',
    story: 'زمان مطالعه‌ام نصف شد ولی یادگیری‌ام دو برابر! ممنون از تیم نوتیکا',
    rating: 5
  },
  {
    name: 'مریم کریمی',
    role: 'دانشجوی پیراپزشکی - ترم 3',
    story: 'جزوات خیلی مفصل و در عین حال ساده توضیح داده شده. عالی!',
    rating: 5
  }
];

const STATS_DATA = [
  {
    icon: '📈',
    title: '98% نرخ موفقیت',
    description: 'دانشجویان ما نمرات بالاتری کسب می‌کنند'
  },
  {
    icon: '⏱️',
    title: 'صرفه‌جویی 70% زمان',
    description: 'مطالعه سریع‌تر با محتوای فشرده'
  },
  {
    icon: '👥',
    title: '+10,000 دانشجو',
    description: 'جامعه بزرگ دانشجویان موفق'
  }
];

const FOOTER_LINKS = {
  useful: [
    { label: 'درباره ما', href: '#' },
    { label: 'تماس با ما', href: '#' },
    { label: 'سوالات متداول', href: '#' }
  ],
  services: [
    { label: 'جزوات فیزیوپات 1', href: '#' },
    { label: 'جزوات فیزیوپات 2', href: '#' },
    { label: 'آزمون‌های آزمایشی', href: '#' }
  ]
};

function Navigation({ isVisible, onNavigate }) {
  return (
    <nav className="border-b border-gray-200 sticky top-3 z-50 backdrop-blur-sm bg-black/5 m-10 rounded-2xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className={`flex items-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <h1 className="text-xl font-bold text-blue-700">نوتیکا</h1>
          </div>
          <button
            onClick={() => onNavigate('/login')}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
          >
            ورود / ثبت‌نام
          </button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection({ isVisible, onNavigate, heroRef }) {
  return (
    <section ref={heroRef} className="relative pt-12 pb-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            آماده موفقیت در آزمون‌های
            <span className="text-blue-600"> فیزیوپاتولوژی </span>
            هستید؟
          </h1>
        </div>
        
        <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-lg text-gray-600 mb-8">
            بهترین جزوات فیزیوپاتولوژی با کیفیت بالا و حجم بهینه
          </p>
        </div>
        
        <div className={`flex flex-col sm:flex-row gap-3 justify-center mb-12 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <button
            onClick={() => onNavigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
          >
            شروع کنید (رایگان) 🚀
          </button>
          <button className="bg-white hover:bg-gray-100 text-blue-600 font-medium py-3 px-6 rounded-lg border border-blue-200 transition-all duration-300">
            نمونه جزوات
          </button>
        </div>

        <div className="mb-12 mx-auto max-w-2xl h-64 bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center text-gray-500">
          <img src="/assets/1.png" alt="" />
        </div>

        <StatsGrid isVisible={isVisible} />
      </div>
    </section>
  );
}

function StatsGrid({ isVisible }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {STATS_DATA.map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl mb-2">{stat.icon}</div>
          <h3 className="font-semibold text-gray-900 mb-1">{stat.title}</h3>
          <p className="text-gray-600 text-xs">{stat.description}</p>
        </div>
      ))}
    </div>
  );
}

function QuizSection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">چقدر با فیزیوپاتولوژی آشنا هستید؟</h2>
        <p className="text-gray-600 mb-6">یک آزمون کوتاه برای سنجش دانش خود امتحان کنید</p>
        <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-300">
          شروع آزمون
        </button>
      </div>
    </section>
  );
}

function FeaturesSection({ activeFeature, featuresRef }) {
  return (
    <section ref={featuresRef} className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">چرا نوتیکا؟</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            با متدهای نوین و تکنولوژی پیشرفته، تجربه‌ای متفاوت از یادگیری خواهید داشت
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES_DATA.map((feature, index) => (
            <div
              key={index}
              className={`bg-white p-6 rounded-lg border transition-all duration-300 ${
                activeFeature === index
                  ? 'border-blue-300 shadow-md'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ currentTestimony, onTestimonyChange }) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">داستان‌های موفقیت</h2>
          <p className="text-gray-600">تجربه‌های واقعی از دانشجویان نوتیکا</p>
        </div>
        <div className="relative bg-gray-50 rounded-xl p-1">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentTestimony * 100}%)` }}
            >
              {TESTIMONIALS_DATA.map((story, index) => (
                <TestimonialCard key={index} story={story} />
              ))}
            </div>
          </div>
          <TestimonialDots 
            total={TESTIMONIALS_DATA.length}
            current={currentTestimony}
            onChange={onTestimonyChange}
          />
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ story }) {
  return (
    <div className="w-full flex-shrink-0 px-2">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center h-full">
        <div className="flex justify-center mb-3">
          {Array.from({ length: story.rating }, (_, i) => (
            <span key={i} className="text-yellow-400">⭐</span>
          ))}
        </div>
        <p className="text-gray-600 mb-4 italic">"{story.story}"</p>
        <div>
          <div className="font-medium text-gray-900">{story.name}</div>
          <div className="text-blue-600 text-sm">{story.role}</div>
        </div>
      </div>
    </div>
  );
}

function TestimonialDots({ total, current, onChange }) {
  return (
    <div className="flex justify-center mt-4 space-x-2">
      {Array.from({ length: total }, (_, index) => (
        <button
          key={index}
          onClick={() => onChange(index)}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            current === index ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          aria-label={`مشاهده نظر ${index + 1}`}
        />
      ))}
    </div>
  );
}

function ImageShowcase() {
  return (
    <div className="py-8 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="h-64 bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center text-gray-500">
          [تصویر یا گیف نمایش جزوات]
        </div>
      </div>
    </div>
  );
}

function CallToAction({ onNavigate }) {
  return (
    <section className="py-16 bg-blue-600 text-white">
      <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-4">وقتشه که پیشرفت کنی!</h2>
        <p className="text-lg mb-6 opacity-90">
          با نوتیکا، موفقیت تحصیلی فقط یک قدم فاصله داره
        </p>
        <div className="space-y-3">
          <button
            onClick={() => onNavigate('/app')}
            className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:bg-gray-100"
          >
            همین حالا ثبت‌نام کن 🎓
          </button>
          <p className="text-sm opacity-75">رایگان شروع کن | پشتیبانی 24/7</p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h3 className="font-bold text-white mb-3">نوتیکا</h3>
            <p className="mb-3">
              بهترین پلتفرم آموزش فیزیوپاتولوژی برای دانشجویان علوم پزشکی
            </p>
            <p>📧 info@notica.ir</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">لینک‌های مفید</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.useful.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">خدمات</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.services.map((service, index) => (
                <li key={index}>
                  <a href={service.href} className="hover:text-white transition-colors">
                    {service.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">ارتباط با ما</h4>
            <ul className="space-y-2">
              <li>📱 021-12345678</li>
              <li>📍 تهران، ایران</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-xs text-gray-400">
          <p>© 2025 نوتیکا - تمامی حقوق محفوظ است</p>
        </div>
      </div>
    </footer>
  );
}

function Site() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentTestimony, setCurrentTestimony] = useState(0);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  const handleNavigate = (path) => {
    navigate(path);
  };

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES_DATA.length);
    }, 3000);

    const testimonialInterval = setInterval(() => {
      setCurrentTestimony((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(featureInterval);
      clearInterval(testimonialInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navigation isVisible={isVisible} onNavigate={handleNavigate} />
      
      <main>
        <HeroSection 
          isVisible={isVisible} 
          onNavigate={handleNavigate} 
          heroRef={heroRef} 
        />
        
        <QuizSection />
        
        <FeaturesSection 
          activeFeature={activeFeature} 
          featuresRef={featuresRef} 
        />
        
        <TestimonialsSection 
          currentTestimony={currentTestimony}
          onTestimonyChange={setCurrentTestimony}
        />
        
        <ImageShowcase />
        
        <CallToAction onNavigate={handleNavigate} />
        
        <Footer />
      </main>
    </div>
  );
}

export default Site;