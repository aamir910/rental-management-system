export type Lang = "en" | "ur";

type NavKeys = {
  home: string;
  why: string;
  features: string;
  how: string;
  future: string;
  explore: string;
};

type Item = { title: string; desc: string };
type Step = { num: string; title: string };
type Phase = { phase: string; title: string };

export type TranslationKeys = {
  nav: NavKeys;
  hero: {
    badge: string;
    heading: string;
    supporting: string;
    ctaPrimary: string;
    ctaSecondary: string;
    label: string;
    dashboardTitle: string;
    properties: string;
    activeTenants: string;
    monthlyRent: string;
    pendingRent: string;
    todayIncome: string;
    todayExpenses: string;
  };
  problem: { heading: string; items: Item[] };
  solution: {
    heading: string;
    before: string;
    beforeItems: string[];
    after: string;
    afterItems: string[];
  };
  features: { heading: string; items: Item[] };
  finance: {
    heading: string;
    todaySummary: string;
    income: string;
    expenses: string;
    netBalance: string;
  };
  household: {
    heading: string;
    purchaseValue: string;
    currentValue: string;
    condition: string;
  };
  tenant: {
    heading: string;
    steps: Step[];
    tenantId: string;
    property: string;
    monthlyRent: string;
    status: string;
  };
  approval: {
    heading: string;
    application: string;
    applicationStatus: string;
    approved: string;
    reject: string;
    requestChanges: string;
    approve: string;
  };
  automation: { heading: string; desc: string; steps: string[] };
  invoice: {
    heading: string;
    title: string;
    tenant: string;
    property: string;
    billingMonth: string;
    monthlyRent: string;
    utilities: string;
    total: string;
    dueDate: string;
    status: string;
    pdfBadge: string;
  };
  dashboard: {
    heading: string;
    title: string;
    properties: string;
    activeTenants: string;
    occupiedUnits: string;
    expectedRent: string;
    collected: string;
    pending: string;
    todayIncome: string;
    todayExpenses: string;
    todayBalance: string;
    incomeChart: string;
    expenseChart: string;
    rentChart: string;
    pendingList: string;
  };
  comingSoon: { heading: string; badge: string; items: Item[] };
  why: { heading: string; items: Item[] };
  roadmap: { heading: string; phases: Phase[] };
  cta: {
    heading: string;
    text: string;
    primary: string;
    secondary: string;
  };
  footer: {
    tagline1: string;
    tagline2: string;
    tagline3: string;
    fullName: string;
    copyright: string;
    home: string;
    features: string;
    how: string;
    comingSoon: string;
  };
};

export const translations: Record<Lang, TranslationKeys> = {
  en: {
    nav: {
      home: "Home",
      why: "Why Yasin RMS",
      features: "Features",
      how: "How It Works",
      future: "Future",
      explore: "Explore",
    },
    hero: {
      badge: "Introducing Yasin Rental Management System",
      heading: "Everything You Manage. One Powerful System.",
      supporting:
        "Yasin RMS is designed to bring rental management, tenant information, rent tracking, daily income, expenses and household assets together in one simple platform.",
      ctaPrimary: "Explore the Vision",
      ctaSecondary: "See How It Works",
      label: "A Smarter Way to Manage Rentals",
      dashboardTitle: "Yasin RMS Dashboard",
      properties: "Properties",
      activeTenants: "Active Tenants",
      monthlyRent: "Monthly Rent",
      pendingRent: "Pending Rent",
      todayIncome: "Today's Income",
      todayExpenses: "Today's Expenses",
    },
    problem: {
      heading: "Rental Management Shouldn't Be This Complicated.",
      items: [
        {
          title: "Scattered Information",
          desc: "Tenant details, CNICs, documents and property information are stored in different places.",
        },
        {
          title: "Manual Rent Tracking",
          desc: "Monthly rent calculations and records require repeated manual work.",
        },
        {
          title: "Pending Payments",
          desc: "It can be difficult to quickly see who has paid and who still has outstanding rent.",
        },
        {
          title: "Daily Expenses",
          desc: "Small daily expenses can easily be forgotten or become difficult to track.",
        },
        {
          title: "No Central Dashboard",
          desc: "There is no single place to understand the complete financial and rental situation.",
        },
        {
          title: "Too Much Paperwork",
          desc: "Documents, agreements and records can become difficult to organize.",
        },
      ],
    },
    solution: {
      heading: "One Place. Everything Organized.",
      before: "Before",
      beforeItems: [
        "Paper",
        "WhatsApp",
        "Excel",
        "Notes",
        "Manual Calculations",
        "Scattered Documents",
      ],
      after: "After",
      afterItems: [
        "Tenants",
        "Properties",
        "Rent",
        "Payments",
        "Income",
        "Expenses",
        "Documents",
        "Reports",
      ],
    },
    features: {
      heading: "Designed Around Real Rental Management",
      items: [
        {
          title: "Property Management",
          desc: "Manage properties, buildings, floors and rental units.",
        },
        {
          title: "Tenant Management",
          desc: "Keep tenant profiles, contact details, CNIC information and rental history organized.",
        },
        {
          title: "Tenant Documents",
          desc: "Keep important tenant documents and rental records organized in one place.",
        },
        {
          title: "Rent Management",
          desc: "Track monthly rent, due dates, payments and pending amounts.",
        },
        {
          title: "Monthly Bills",
          desc: "Generate professional monthly rent bills and invoices.",
        },
        {
          title: "Payment Tracking",
          desc: "Know who has paid, who has partially paid and who is still pending.",
        },
        {
          title: "Reports",
          desc: "Understand rental income, expenses and financial performance.",
        },
        {
          title: "Daily Income & Expenses",
          desc: "Track everyday income and expenses to understand where money is going.",
        },
        {
          title: "Household Items",
          desc: "Keep track of household items, their value, condition and history.",
        },
      ],
    },
    finance: {
      heading: "Know Where Your Money Goes.",
      todaySummary: "Today's Summary",
      income: "Income",
      expenses: "Expenses",
      netBalance: "Net Balance",
    },
    household: {
      heading: "Keep Track of What You Own.",
      purchaseValue: "Purchase Value",
      currentValue: "Current Value",
      condition: "Condition",
    },
    tenant: {
      heading: "Simple for Tenants. Powerful for Owners.",
      steps: [
        { num: "01", title: "Tenant Submits Information" },
        { num: "02", title: "Admin Reviews & Approves" },
        { num: "03", title: "Tenant Becomes Active" },
      ],
      tenantId: "Tenant ID",
      property: "Property",
      monthlyRent: "Monthly Rent",
      status: "Status",
    },
    approval: {
      heading: "Review with Confidence",
      application: "Tenant Application",
      applicationStatus: "Application Status",
      approved: "APPROVED",
      reject: "Reject",
      requestChanges: "Request Changes",
      approve: "Approve",
    },
    automation: {
      heading: "Every Month. Automatically.",
      desc: "Instead of repeating the same work every month, Yasin RMS is designed to automate the rental workflow.",
      steps: [
        "1st of Month",
        "Active Tenants",
        "Monthly Rent",
        "Invoice Created",
        "Payment Tracking",
        "Monthly Summary",
      ],
    },
    invoice: {
      heading: "Professional Monthly Bills",
      title: "RENT PAYMENT INVOICE",
      tenant: "Tenant",
      property: "Property",
      billingMonth: "Billing Month",
      monthlyRent: "Monthly Rent",
      utilities: "Utilities",
      total: "Total",
      dueDate: "Due Date",
      status: "Status",
      pdfBadge: "PDF Invoice",
    },
    dashboard: {
      heading: "Your Complete Rental Command Center",
      title: "Yasin RMS Dashboard",
      properties: "Properties",
      activeTenants: "Active Tenants",
      occupiedUnits: "Occupied Units",
      expectedRent: "Expected Rent",
      collected: "Collected",
      pending: "Pending",
      todayIncome: "Today's Income",
      todayExpenses: "Today's Expenses",
      todayBalance: "Today's Balance",
      incomeChart: "Income",
      expenseChart: "Expenses",
      rentChart: "Rent Collection",
      pendingList: "Pending Payments",
    },
    comingSoon: {
      heading: "Coming Soon",
      badge: "COMING SOON",
      items: [
        {
          title: "Mobile App",
          desc: "Manage your rental system from anywhere.",
        },
        {
          title: "WhatsApp Automation",
          desc: "Send rent bills and payment reminders through WhatsApp.",
        },
        {
          title: "Online Payments",
          desc: "Allow tenants to pay rent digitally.",
        },
        {
          title: "Automatic PDF Bills",
          desc: "Automatically generate monthly rent invoices.",
        },
        {
          title: "Smart Notifications",
          desc: "Get alerts about payments, pending rent and important events.",
        },
        {
          title: "Advanced Analytics",
          desc: "Understand rental performance and financial trends.",
        },
        {
          title: "Smart Financial Insights",
          desc: "Get useful insights about income and expenses.",
        },
        {
          title: "Bank Integration",
          desc: "Connect financial activity with bank transactions in the future.",
        },
      ],
    },
    why: {
      heading: "Why Build Yasin RMS?",
      items: [
        {
          title: "Everything in One Place",
          desc: "No scattered information.",
        },
        {
          title: "Less Manual Work",
          desc: "Reduce repetitive monthly work.",
        },
        {
          title: "Better Visibility",
          desc: "Know your financial and rental position instantly.",
        },
        {
          title: "Organized Records",
          desc: "Keep tenants, properties and documents structured.",
        },
        {
          title: "Easy to Understand",
          desc: "Designed for everyday users, not complicated accounting software.",
        },
        {
          title: "Built to Grow",
          desc: "Start simple and add advanced features over time.",
        },
      ],
    },
    roadmap: {
      heading: "Product Roadmap",
      phases: [
        { phase: "Phase 1", title: "Product & Tenant Management" },
        { phase: "Phase 2", title: "Rent & Payment Management" },
        { phase: "Phase 3", title: "Daily Income & Expense Tracking" },
        { phase: "Phase 4", title: "Household Asset Management" },
        { phase: "Phase 5", title: "Automatic PDF Bills" },
        { phase: "Phase 6", title: "WhatsApp Automation" },
        { phase: "Phase 7", title: "Online Payments" },
        { phase: "Phase 8", title: "Mobile Application" },
      ],
    },
    cta: {
      heading: "From Rent to Daily Expenses — Everything in One Place.",
      text: "Yasin RMS is designed to make rental management simpler, clearer and more organized.",
      primary: "Explore the Vision",
      secondary: "Coming Soon",
    },
    footer: {
      tagline1: "Manage Your Property.",
      tagline2: "Track Your Money.",
      tagline3: "Simplify Your Life.",
      fullName: "Yasin Rental Management System",
      copyright: "© 2027 Yasin RMS",
      home: "Home",
      features: "Features",
      how: "How It Works",
      comingSoon: "Coming Soon",
    },
  },
  ur: {
    nav: {
      home: "ہوم",
      why: "کیوں یاسین آر ایم ایس",
      features: "خصوصیات",
      how: "کیسے کام کرتا ہے",
      future: "آئندہ",
      explore: "دریافت کریں",
    },
    hero: {
      badge: "یاسین رینٹل مینجمنٹ سسٹم کا تعارف",
      heading: "آپ کے تمام کام، ایک طاقتور نظام میں۔",
      supporting:
        "یاسین رینٹل مینجمنٹ سسٹم کرایہ داری، کرایہ داروں کی معلومات، آمدنی، اخراجات اور گھریلو اثاثوں کو ایک ہی آسان پلیٹ فارم پر منظم کرنے کے لیے بنایا گیا ہے۔",
      ctaPrimary: "تصور دریافت کریں",
      ctaSecondary: "کیسے کام کرتا ہے دیکھیں",
      label: "کرایہ داری کے انتظام کا بہتر طریقہ",
      dashboardTitle: "یاسین آر ایم ایس ڈیش بورڈ",
      properties: "پراپرٹیز",
      activeTenants: "فعال کرایہ دار",
      monthlyRent: "ماہانہ کرایہ",
      pendingRent: "باقی کرایہ",
      todayIncome: "آج کی آمدنی",
      todayExpenses: "آج کے اخراجات",
    },
    problem: {
      heading: "کرایہ داری کا انتظام اتنا پیچیدہ نہیں ہونا چاہیے۔",
      items: [
        {
          title: "بکھری ہوئی معلومات",
          desc: "کرایہ دار کی تفصیلات، شناختی کارڈ، دستاویزات اور پراپرٹی کی معلومات مختلف جگہوں پر رکھی جاتی ہیں۔",
        },
        {
          title: "دستی کرایہ ٹریکنگ",
          desc: "ماہانہ کرایہ کے حساب اور ریکارڈ کے لیے بار بار دستی کام کرنا پڑتا ہے۔",
        },
        {
          title: "باقی ادائیگیاں",
          desc: "جلدی سے یہ دیکھنا مشکل ہوتا ہے کہ کس نے ادا کیا اور کس کا کرایہ باقی ہے۔",
        },
        {
          title: "روزانہ کے اخراجات",
          desc: "چھوٹے روزانہ اخراجات آسانی سے بھول جاتے ہیں یا ٹریک کرنا مشکل ہو جاتا ہے۔",
        },
        {
          title: "کوئی مرکزی ڈیش بورڈ نہیں",
          desc: "مکمل مالی اور کرایہ داری کی صورتحال سمجھنے کے لیے کوئی ایک جگہ نہیں۔",
        },
        {
          title: "زیادہ کاغذی کام",
          desc: "دستاویزات، معاہدے اور ریکارڈ منظم کرنا مشکل ہو جاتا ہے۔",
        },
      ],
    },
    solution: {
      heading: "ایک جگہ۔ سب کچھ منظم۔",
      before: "پہلے",
      beforeItems: [
        "کاغذ",
        "واٹس ایپ",
        "ایکسل",
        "نوٹس",
        "دستی حساب",
        "بکھری دستاویزات",
      ],
      after: "بعد میں",
      afterItems: [
        "کرایہ دار",
        "پراپرٹیز",
        "کرایہ",
        "ادائیگیاں",
        "آمدنی",
        "اخراجات",
        "دستاویزات",
        "رپورٹس",
      ],
    },
    features: {
      heading: "حقیقی کرایہ داری کے انتظام کے لیے بنایا گیا",
      items: [
        {
          title: "پراپرٹی مینجمنٹ",
          desc: "پراپرٹیز، عمارات، منزلیں اور کرایہ یونٹس کا انتظام کریں۔",
        },
        {
          title: "کرایہ دار مینجمنٹ",
          desc: "کرایہ دار پروفائلز، رابطہ تفصیلات، شناختی کارڈ اور کرایہ کی تاریخ منظم رکھیں۔",
        },
        {
          title: "کرایہ دار دستاویزات",
          desc: "اہم دستاویزات اور کرایہ ریکارڈ ایک ہی جگہ منظم رکھیں۔",
        },
        {
          title: "کرایہ مینجمنٹ",
          desc: "ماہانہ کرایہ، واجب تاریخیں، ادائیگیاں اور باقی رقم ٹریک کریں۔",
        },
        {
          title: "ماہانہ بل",
          desc: "پیشہ ورانہ ماہانہ کرایہ بل اور انوائس بنائیں۔",
        },
        {
          title: "ادائیگی ٹریکنگ",
          desc: "جانیں کس نے ادا کیا، کس نے جزوی ادا کیا اور کس کا باقی ہے۔",
        },
        {
          title: "رپورٹس",
          desc: "کرایہ آمدنی، اخراجات اور مالی کارکردگی سمجھیں۔",
        },
        {
          title: "روزانہ آمدنی و اخراجات",
          desc: "روزانہ آمدنی اور اخراجات ٹریک کریں تاکہ پتہ چلے پیسہ کہاں جا رہا ہے۔",
        },
        {
          title: "گھریلو سامان",
          desc: "گھریلو اشیاء، ان کی قیمت، حالت اور تاریخ کا ریکارڈ رکھیں۔",
        },
      ],
    },
    finance: {
      heading: "جانیں آپ کا پیسہ کہاں جا رہا ہے۔",
      todaySummary: "آج کا خلاصہ",
      income: "آمدنی",
      expenses: "اخراجات",
      netBalance: "خالص بیلنس",
    },
    household: {
      heading: "اپنی چیزوں کا ریکارڈ رکھیں۔",
      purchaseValue: "خریداری قیمت",
      currentValue: "موجودہ قیمت",
      condition: "حالت",
    },
    tenant: {
      heading: "کرایہ دار کے لیے آسان۔ مالک کے لیے طاقتور۔",
      steps: [
        { num: "01", title: "کرایہ دار معلومات جمع کراتا ہے" },
        { num: "02", title: "ایڈمن جائزہ لیتا اور منظور کرتا ہے" },
        { num: "03", title: "کرایہ دار فعال ہو جاتا ہے" },
      ],
      tenantId: "کرایہ دار آئی ڈی",
      property: "پراپرٹی",
      monthlyRent: "ماہانہ کرایہ",
      status: "حیثیت",
    },
    approval: {
      heading: "اعتماد کے ساتھ جائزہ لیں",
      application: "کرایہ دار کی درخواست",
      applicationStatus: "درخواست کی حیثیت",
      approved: "منظور شدہ",
      reject: "مسترد",
      requestChanges: "تبدیلی مانگیں",
      approve: "منظور کریں",
    },
    automation: {
      heading: "ہر مہینہ۔ خود بخود۔",
      desc: "ہر مہینہ وہی کام دہرانے کے بجائے، یاسین آر ایم ایس کرایہ داری کے ورک فلو کو خودکار بنانے کے لیے ڈیزائن کیا گیا ہے۔",
      steps: [
        "مہینے کی پہلی تاریخ",
        "فعال کرایہ دار",
        "ماہانہ کرایہ",
        "انوائس بنتی ہے",
        "ادائیگی ٹریکنگ",
        "ماہانہ خلاصہ",
      ],
    },
    invoice: {
      heading: "پیشہ ورانہ ماہانہ بل",
      title: "کرایہ ادائیگی انوائس",
      tenant: "کرایہ دار",
      property: "پراپرٹی",
      billingMonth: "بلنگ مہینہ",
      monthlyRent: "ماہانہ کرایہ",
      utilities: "یوٹیلٹیز",
      total: "کل",
      dueDate: "آخری تاریخ",
      status: "حیثیت",
      pdfBadge: "پی ڈی ایف انوائس",
    },
    dashboard: {
      heading: "آپ کا مکمل کرایہ داری کنٹرول سینٹر",
      title: "یاسین آر ایم ایس ڈیش بورڈ",
      properties: "پراپرٹیز",
      activeTenants: "فعال کرایہ دار",
      occupiedUnits: "مشغول یونٹس",
      expectedRent: "متوقع کرایہ",
      collected: "وصول شدہ",
      pending: "باقی",
      todayIncome: "آج کی آمدنی",
      todayExpenses: "آج کے اخراجات",
      todayBalance: "آج کا بیلنس",
      incomeChart: "آمدنی",
      expenseChart: "اخراجات",
      rentChart: "کرایہ وصولی",
      pendingList: "باقی ادائیگیاں",
    },
    comingSoon: {
      heading: "جلد آرہا ہے",
      badge: "جلد آرہا ہے",
      items: [
        {
          title: "موبائل ایپ",
          desc: "کہیں سے بھی اپنے کرایہ داری سسٹم کا انتظام کریں۔",
        },
        {
          title: "واٹس ایپ آٹومیشن",
          desc: "واٹس ایپ کے ذریعے کرایہ بل اور ادائیگی یاددہانی بھیجیں۔",
        },
        {
          title: "آن لائن ادائیگیاں",
          desc: "کرایہ داروں کو ڈیجیٹل طریقے سے کرایہ ادا کرنے دیں۔",
        },
        {
          title: "خودکار پی ڈی ایف بل",
          desc: "خود بخود ماہانہ کرایہ انوائس بنائیں۔",
        },
        {
          title: "اسمارٹ نوٹیفیکیشنز",
          desc: "ادائیگیاں، باقی کرایہ اور اہم واقعات کی اطلاع حاصل کریں۔",
        },
        {
          title: "ایڈوانسڈ اینالیٹکس",
          desc: "کرایہ داری کی کارکردگی اور مالی رجحانات سمجھیں۔",
        },
        {
          title: "اسمارٹ مالی بصیرت",
          desc: "آمدنی اور اخراجات کے بارے میں مفید معلومات حاصل کریں۔",
        },
        {
          title: "بینک انٹیگریشن",
          desc: "مستقبل میں مالی سرگرمیوں کو بینک ٹرانزیکشنز سے جوڑیں۔",
        },
      ],
    },
    why: {
      heading: "یاسین آر ایم ایس کیوں بنائیں؟",
      items: [
        {
          title: "سب کچھ ایک جگہ",
          desc: "کوئی بکھری ہوئی معلومات نہیں۔",
        },
        {
          title: "کم دستی کام",
          desc: "ماہانہ دہرائی جانے والی محنت کم کریں۔",
        },
        {
          title: "بہتر وضاحت",
          desc: "اپنی مالی اور کرایہ داری کی پوزیشن فوراً جانیں۔",
        },
        {
          title: "منظم ریکارڈ",
          desc: "کرایہ دار، پراپرٹیز اور دستاویزات ساختہ رکھیں۔",
        },
        {
          title: "سمجھنے میں آسان",
          desc: "روزانہ صارفین کے لیے، پیچیدہ اکاؤنٹنگ سافٹ ویئر نہیں۔",
        },
        {
          title: "بڑھنے کے لیے تیار",
          desc: "آسان سے شروع کریں اور وقت کے ساتھ جدید خصوصیات شامل کریں۔",
        },
      ],
    },
    roadmap: {
      heading: "پروڈکٹ روڈ میپ",
      phases: [
        { phase: "مرحلہ 1", title: "پروڈکٹ اور کرایہ دار مینجمنٹ" },
        { phase: "مرحلہ 2", title: "کرایہ اور ادائیگی مینجمنٹ" },
        { phase: "مرحلہ 3", title: "روزانہ آمدنی و اخراجات ٹریکنگ" },
        { phase: "مرحلہ 4", title: "گھریلو اثاثہ مینجمنٹ" },
        { phase: "مرحلہ 5", title: "خودکار پی ڈی ایف بل" },
        { phase: "مرحلہ 6", title: "واٹس ایپ آٹومیشن" },
        { phase: "مرحلہ 7", title: "آن لائن ادائیگیاں" },
        { phase: "مرحلہ 8", title: "موبائل ایپلیکیشن" },
      ],
    },
    cta: {
      heading: "کرایہ سے لے کر روزانہ کے اخراجات تک — سب کچھ ایک ہی جگہ۔",
      text: "یاسین آر ایم ایس کرایہ داری کے انتظام کو آسان، واضح اور زیادہ منظم بنانے کے لیے ڈیزائن کیا گیا ہے۔",
      primary: "تصور دریافت کریں",
      secondary: "جلد آرہا ہے",
    },
    footer: {
      tagline1: "اپنی پراپرٹی کا انتظام کریں۔",
      tagline2: "اپنے پیسے کا ٹریک رکھیں۔",
      tagline3: "اپنی زندگی آسان بنائیں۔",
      fullName: "یاسین رینٹل مینجمنٹ سسٹم",
      copyright: "© 2027 Yasin RMS",
      home: "ہوم",
      features: "خصوصیات",
      how: "کیسے کام کرتا ہے",
      comingSoon: "جلد آرہا ہے",
    },
  },
};
