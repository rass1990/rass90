import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Common
      app_name: 'ServiceHub',
      tagline: 'Find trusted local service providers',
      loading: 'Loading...',
      error: 'An error occurred',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      all: 'All',
      submit: 'Submit',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      
      // Auth
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      forgot_password: 'Forgot Password?',
      
      // Navigation
      home: 'Home',
      services: 'Services',
      bookings: 'Bookings',
      profile: 'Profile',
      dashboard: 'Dashboard',
      settings: 'Settings',
      admin: 'Admin',
      
      // Categories
      plumbing: 'Plumbing',
      electrical: 'Electrical',
      cleaning: 'Cleaning',
      handyman: 'Handyman',
      drivers: 'Drivers',
      ac_services: 'AC Services',
      moving: 'Moving',
      
      // Services
      browse_services: 'Browse Services',
      service_details: 'Service Details',
      book_now: 'Book Now',
      price: 'Price',
      duration: 'Duration',
      per_hour: 'per hour',
      fixed: 'fixed',
      
      // Bookings
      my_bookings: 'My Bookings',
      new_booking: 'New Booking',
      booking_details: 'Booking Details',
      scheduled: 'Scheduled',
      pending: 'Pending',
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
      in_progress: 'In Progress',
      select_date: 'Select Date',
      select_time: 'Select Time',
      your_address: 'Your Address',
      add_notes: 'Add Notes (optional)',
      
      // Reviews
      reviews: 'Reviews',
      write_review: 'Write a Review',
      rating: 'Rating',
      your_review: 'Your Review',
      
      // Provider
      provider_dashboard: 'Provider Dashboard',
      my_services: 'My Services',
      add_service: 'Add Service',
      availability: 'Availability',
      earnings: 'Earnings',
      total_earnings: 'Total Earnings',
      this_month: 'This Month',
      
      // Admin
      admin_panel: 'Admin Panel',
      users: 'Users',
      providers: 'Providers',
      categories: 'Categories',
      analytics: 'Analytics',
      support: 'Support',
      
      // Status
      verified: 'Verified',
      unverified: 'Unverified',
      active: 'Active',
      inactive: 'Inactive',
      
      // Messages
      no_services: 'No services found',
      no_bookings: 'No bookings yet',
      no_reviews: 'No reviews yet',
      booking_success: 'Booking created successfully!',
      review_success: 'Review submitted successfully!',
      
      // Profile
      full_name: 'Full Name',
      phone: 'Phone',
      language: 'Language',
      account_type: 'Account Type',
      customer: 'Customer',
      provider: 'Provider',
      become_provider: 'Become a Provider',
      
      // Payment
      payment: 'Payment',
      payment_method: 'Payment Method',
      select_payment_method: 'Select Payment Method',
      paypal: 'PayPal',
      cash_on_delivery: 'Cash on Delivery',
      pay_with_paypal: 'Pay with PayPal',
      pay_on_delivery: 'Pay on Delivery',
      payment_processing: 'Processing Payment...',
      payment_success: 'Payment Successful!',
      payment_failed: 'Payment Failed',
      payment_pending: 'Payment Pending',
      total_amount: 'Total Amount',
      service_fee: 'Service Fee',
      commission: 'Commission',
      subtotal: 'Subtotal',
      secure_payment: 'Secure payment powered by PayPal',
      cod_instructions: 'You will pay the provider in cash after service completion.',
      cod_notice: 'Please have exact cash amount ready.',
      payment_confirmation: 'Payment Confirmation',
      transaction_id: 'Transaction ID',
      payment_date: 'Payment Date',
      payment_status: 'Payment Status',
      refund: 'Refund',
      refund_requested: 'Refund Requested',
      cod_completed: 'Cash Payment Collected',
      cod_pending: 'Awaiting Cash Payment',
      provider_earnings: 'Provider Earnings',
      marketplace_commission: 'Marketplace Commission',
    }
  },
  ar: {
    translation: {
      // Common
      app_name: 'سيرفس هب',
      tagline: 'اعثر على مزودي خدمات موثوقين',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      view: 'عرض',
      search: 'بحث',
      filter: 'تصفية',
      all: 'الكل',
      submit: 'إرسال',
      confirm: 'تأكيد',
      back: 'رجوع',
      next: 'التالي',
      
      // Auth
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      logout: 'تسجيل الخروج',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      forgot_password: 'نسيت كلمة المرور؟',
      
      // Navigation
      home: 'الرئيسية',
      services: 'الخدمات',
      bookings: 'الحجوزات',
      profile: 'الملف الشخصي',
      dashboard: 'لوحة التحكم',
      settings: 'الإعدادات',
      admin: 'الإدارة',
      
      // Categories
      plumbing: 'سباكة',
      electrical: 'كهرباء',
      cleaning: 'تنظيف',
      handyman: 'صيانة عامة',
      drivers: 'سائقين',
      ac_services: 'تكييف',
      moving: 'نقل',
      
      // Services
      browse_services: 'تصفح الخدمات',
      service_details: 'تفاصيل الخدمة',
      book_now: 'احجز الآن',
      price: 'السعر',
      duration: 'المدة',
      per_hour: 'للساعة',
      fixed: 'ثابت',
      
      // Bookings
      my_bookings: 'حجوزاتي',
      new_booking: 'حجز جديد',
      booking_details: 'تفاصيل الحجز',
      scheduled: 'مجدول',
      pending: 'قيد الانتظار',
      confirmed: 'مؤكد',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      in_progress: 'قيد التنفيذ',
      select_date: 'اختر التاريخ',
      select_time: 'اختر الوقت',
      your_address: 'عنوانك',
      add_notes: 'أضف ملاحظات (اختياري)',
      
      // Reviews
      reviews: 'التقييمات',
      write_review: 'اكتب تقييم',
      rating: 'التقييم',
      your_review: 'تقييمك',
      
      // Provider
      provider_dashboard: 'لوحة تحكم مزود الخدمة',
      my_services: 'خدماتي',
      add_service: 'إضافة خدمة',
      availability: 'التوفر',
      earnings: 'الأرباح',
      total_earnings: 'إجمالي الأرباح',
      this_month: 'هذا الشهر',
      
      // Admin
      admin_panel: 'لوحة الإدارة',
      users: 'المستخدمين',
      providers: 'مزودي الخدمات',
      categories: 'الفئات',
      analytics: 'التحليلات',
      support: 'الدعم',
      
      // Status
      verified: 'موثق',
      unverified: 'غير موثق',
      active: 'نشط',
      inactive: 'غير نشط',
      
      // Messages
      no_services: 'لا توجد خدمات',
      no_bookings: 'لا توجد حجوزات',
      no_reviews: 'لا توجد تقييمات',
      booking_success: 'تم إنشاء الحجز بنجاح!',
      review_success: 'تم إرسال التقييم بنجاح!',
      
      // Profile
      full_name: 'الاسم الكامل',
      phone: 'الهاتف',
      language: 'اللغة',
      account_type: 'نوع الحساب',
      customer: 'عميل',
      provider: 'مزود خدمة',
      become_provider: 'كن مزود خدمة',
      
      // Payment
      payment: 'الدفع',
      payment_method: 'طريقة الدفع',
      select_payment_method: 'اختر طريقة الدفع',
      paypal: 'باي بال',
      cash_on_delivery: 'الدفع عند الاستلام',
      pay_with_paypal: 'الدفع عبر باي بال',
      pay_on_delivery: 'الدفع عند الاستلام',
      payment_processing: 'جاري معالجة الدفع...',
      payment_success: 'تم الدفع بنجاح!',
      payment_failed: 'فشل الدفع',
      payment_pending: 'الدفع قيد الانتظار',
      total_amount: 'المبلغ الإجمالي',
      service_fee: 'رسوم الخدمة',
      commission: 'العمولة',
      subtotal: 'المجموع الفرعي',
      secure_payment: 'دفع آمن مدعوم من باي بال',
      cod_instructions: 'ستدفع لمزود الخدمة نقداً بعد إتمام الخدمة.',
      cod_notice: 'يرجى تحضير المبلغ الدقيق نقداً.',
      payment_confirmation: 'تأكيد الدفع',
      transaction_id: 'رقم المعاملة',
      payment_date: 'تاريخ الدفع',
      payment_status: 'حالة الدفع',
      refund: 'استرداد',
      refund_requested: 'تم طلب الاسترداد',
      cod_completed: 'تم تحصيل الدفع النقدي',
      cod_pending: 'في انتظار الدفع النقدي',
      provider_earnings: 'أرباح مزود الخدمة',
      marketplace_commission: 'عمولة المنصة',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
