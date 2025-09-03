import { useState, useEffect, useRef } from 'react';

function Site() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentTestimony, setCurrentTestimony] = useState(0);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  const handleNavigate = (path) => {
    console.log(`Navigating to: ${path}`);
    alert(`در حالت واقعی به صفحه ${path} هدایت می‌شوید`);
  };

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 3000);

    const testimonialInterval = setInterval(() => {
      setCurrentTestimony((prev) => (prev + 1) % 3);
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(featureInterval);
      clearInterval(testimonialInterval);
    };
  }, []);


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navigation */}
      <nav className="border-b border-gray-200 sticky top-3 z-50 backdrop-blur-sm bg-black/5 m-10 rounded-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className={`flex items-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              <h1 className="text-xl font-bold text-blue-700">نوتیکا</h1>
            </div>
            <button
              onClick={() => handleNavigate('/login')}
              className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
            >
              ورود / ثبت‌نام
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
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
                onClick={() => handleNavigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
              >
                شروع کنید (رایگان) 🚀
              </button>
              <button className="bg-white hover:bg-gray-100 text-blue-600 font-medium py-3 px-6 rounded-lg border border-blue-200 transition-all duration-300">
                نمونه جزوات
              </button>
            </div>

            {/* Placeholder for Image/GIF 1 */}
            <div className="mb-12 mx-auto max-w-2xl h-64 bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center text-gray-500">
              <img src="/assets/1.png" alt="" />
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl mb-2">📈</div>
                <h3 className="font-semibold text-gray-900 mb-1">98% نرخ موفقیت</h3>
                <p className="text-gray-600 text-xs">دانشجویان ما نمرات بالاتری کسب می‌کنند</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl mb-2">⏱️</div>
                <h3 className="font-semibold text-gray-900 mb-1">صرفه‌جویی 70% زمان</h3>
                <p className="text-gray-600 text-xs">مطالعه سریع‌تر با محتوای فشرده</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl mb-2">👥</div>
                <h3 className="font-semibold text-gray-900 mb-1">+10,000 دانشجو</h3>
                <p className="text-gray-600 text-xs">جامعه بزرگ دانشجویان موفق</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quiz Section */}
        <section className="py-12 bg-white">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">چقدر با فیزیوپاتولوژی آشنا هستید؟</h2>
            <p className="text-gray-600 mb-6">یک آزمون کوتاه برای سنجش دانش خود امتحان کنید</p>
            <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-300">
              شروع آزمون
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">چرا نوتیکا؟</h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                با متدهای نوین و تکنولوژی پیشرفته، تجربه‌ای متفاوت از یادگیری خواهید داشت
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`bg-white p-6 rounded-lg border transition-all duration-300 ${
                    activeFeature === index
                      ? 'border-blue-300 shadow-md'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <div className="text-3xl mb-3">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
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
                  {testimonials.map((story, index) => (
                    <div key={index} className="w-full flex-shrink-0 px-2">
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center h-full">
                        <div className="flex justify-center mb-3">
                          {[...Array(story.rating)].map((_, i) => (
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
                  ))}
                </div>
              </div>
              <div className="flex justify-center mt-4 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimony(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      currentTestimony === index
                        ? 'bg-blue-600'
                        : 'bg-gray-300'
                    }`}
                    aria-label={`مشاهده نظر ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Placeholder for Image/GIF 2 */}
        <div className="py-8 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="h-64 bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center text-gray-500">
              [تصویر یا گیف نمایش جزوات]
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-4">
              وقتشه که پیشرفت کنی!
            </h2>
            <p className="text-lg mb-6 opacity-90">
              با نوتیکا، موفقیت تحصیلی فقط یک قدم فاصله داره
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleNavigate('/login')}
                className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:bg-gray-100"
              >
                همین حالا ثبت‌نام کن 🎓
              </button>
              <p className="text-sm opacity-75">
                رایگان شروع کن | پشتیبانی 24/7
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
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
                  <li><a href="#" className="hover:text-white transition-colors">درباره ما</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">تماس با ما</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">سوالات متداول</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">خدمات</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white transition-colors">جزوات فیزیوپات 1</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">جزوات فیزیوپات 2</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">آزمون‌های آزمایشی</a></li>
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
      </main>
    </div>
  );
}

export default Site;