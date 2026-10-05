export const heroStats = {
  properties: 18,
  activeTenants: 42,
  monthlyRent: "Rs. 1.85M",
  pendingRent: "Rs. 240K",
  todayIncome: "Rs. 50K",
  todayExpenses: "Rs. 13K",
};

export const dashboardStats = {
  properties: 18,
  activeTenants: 42,
  occupiedUnits: 42,
  expectedRent: "Rs. 1.85M",
  collected: "Rs. 1.61M",
  pending: "Rs. 240K",
  todayIncome: "Rs. 50K",
  todayExpenses: "Rs. 13K",
  todayBalance: "Rs. 37K",
};

export const financeSummary = {
  income: [
    { label: "Rent Received", labelUr: "موصول کرایہ", amount: "Rs. 45,000" },
    { label: "Other Income", labelUr: "دیگر آمدنی", amount: "Rs. 5,000" },
  ],
  expenses: [
    { label: "Maintenance", labelUr: "مرمت", amount: "Rs. 3,000" },
    { label: "Electricity", labelUr: "بجلی", amount: "Rs. 8,000" },
    { label: "Transport", labelUr: "ٹرانسپورٹ", amount: "Rs. 2,000" },
  ],
  netBalance: "Rs. 37,000",
};

export const chartBars = [
  { label: "Mon", income: 42, expense: 18 },
  { label: "Tue", income: 55, expense: 22 },
  { label: "Wed", income: 38, expense: 28 },
  { label: "Thu", income: 65, expense: 15 },
  { label: "Fri", income: 48, expense: 30 },
  { label: "Sat", income: 70, expense: 20 },
  { label: "Sun", income: 50, expense: 12 },
];

export const rentCollectionBars = [
  { month: "Sep", value: 78 },
  { month: "Oct", value: 85 },
  { month: "Nov", value: 72 },
  { month: "Dec", value: 90 },
  { month: "Jan", value: 88 },
  { month: "Feb", value: 82 },
];

export const pendingPayments = [
  { name: "Ali Hassan", property: "Flat 4B", amount: "Rs. 55,000", status: "pending" as const },
  { name: "Sara Khan", property: "House 8", amount: "Rs. 70,000", status: "partial" as const },
  { name: "Bilal Ahmed", property: "Shop 2", amount: "Rs. 35,000", status: "pending" as const },
  { name: "Fatima Noor", property: "Portion C", amount: "Rs. 40,000", status: "pending" as const },
];

export const householdItems = [
  {
    name: "Samsung TV",
    nameUr: "سام سنگ ٹی وی",
    purchase: "Rs. 250,000",
    current: "Rs. 180,000",
    condition: "Good",
    conditionUr: "اچھی",
    icon: "tv" as const,
  },
  {
    name: "Refrigerator",
    nameUr: "فریج",
    purchase: "Rs. 180,000",
    current: "Rs. 140,000",
    condition: "Excellent",
    conditionUr: "بہترین",
    icon: "fridge" as const,
  },
  {
    name: "Sofa",
    nameUr: "صوفہ",
    purchase: "Rs. 120,000",
    current: "Rs. 85,000",
    condition: "Good",
    conditionUr: "اچھی",
    icon: "sofa" as const,
  },
  {
    name: "AC",
    nameUr: "اے سی",
    purchase: "Rs. 95,000",
    current: "Rs. 70,000",
    condition: "Good",
    conditionUr: "اچھی",
    icon: "ac" as const,
  },
  {
    name: "Washing Machine",
    nameUr: "واشنگ مشین",
    purchase: "Rs. 75,000",
    current: "Rs. 55,000",
    condition: "Fair",
    conditionUr: "درمیانی",
    icon: "washer" as const,
  },
  {
    name: "Bed",
    nameUr: "بستر",
    purchase: "Rs. 60,000",
    current: "Rs. 45,000",
    condition: "Good",
    conditionUr: "اچھی",
    icon: "bed" as const,
  },
  {
    name: "Laptop",
    nameUr: "لیپ ٹاپ",
    purchase: "Rs. 200,000",
    current: "Rs. 130,000",
    condition: "Excellent",
    conditionUr: "بہترین",
    icon: "laptop" as const,
  },
];

export const tenantProfile = {
  name: "Muhammad Ahmed",
  tenantId: "TEN-0042",
  property: "House 12 - Portion A",
  monthlyRent: "Rs. 45,000",
  status: "ACTIVE",
};

export const invoiceData = {
  tenant: "Muhammad Ahmed",
  property: "House 12 - Portion A",
  billingMonth: "February 2027",
  monthlyRent: "Rs. 45,000",
  utilities: "Rs. 3,000",
  total: "Rs. 48,000",
  dueDate: "05 February 2027",
  status: "PENDING",
};

export const approvalChecks = [
  { key: "identity", en: "Identity", ur: "شناخت" },
  { key: "cnic", en: "CNIC", ur: "شناختی کارڈ" },
  { key: "contact", en: "Contact", ur: "رابطہ" },
  { key: "documents", en: "Documents", ur: "دستاویزات" },
  { key: "reference", en: "Reference", ur: "حوالہ" },
  { key: "propertyMatch", en: "Property Match", ur: "پراپرٹی میچ" },
];
