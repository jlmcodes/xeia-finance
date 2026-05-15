import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, Trash2, Calculator, DollarSign, Building2, LineChart, FileText, 
  PieChart, Receipt, FileSpreadsheet, ToggleLeft, ToggleRight, CheckSquare, 
  Square, Users, Moon, Sun, Lock, Save, Upload, Package, TrendingUp, 
  Archive, BookOpen, PanelRightClose, ArrowRightCircle, MessageSquare, 
  Send, Edit2, CalendarDays, ArrowUp, ArrowDown 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, LineChart as RechartsLineChart, Line, 
  PieChart as RechartsPieChart, Pie, Cell 
} from 'recharts';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, deleteDoc } from 'firebase/firestore';

// --- FIREBASE INITIALIZATION ---
let app, auth, db, appId;
try {
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: "AIzaSyDsRJfZ_dROleDsVW_w0K9EVzJSbDugemE",
    authDomain: "xeia-finance.firebaseapp.com",
    projectId: "xeia-finance",
    storageBucket: "xeia-finance.firebasestorage.app",
    messagingSenderId: "295169710338",
    appId: "1:295169710338:web:714517ba995280e9890a1b",
    measurementId: "G-V4M98SKG49"
  };
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  appId = typeof __app_id !== 'undefined' ? __app_id : "xeia-finance-app"; 
} catch (e) {
  console.error("Firebase init error", e);
}

// --- CONSTANTS & CONFIG ---
const CURRENCIES = [
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
];

const AUTHORIZED_USERS = ['KSD Bellen', 'EJ Lacson', 'JL Monleon', 'ML Burgos', 'L Calvo'];

const LEGAL_DISCLAIMER = "LEGAL DISCLAIMER: Any unauthorized distribution, reproduction, or dissemination of this link or its contents without the explicit notice and consent of the owner is considered illegal and strictly prohibited. Violators will be subject to appropriate legal action under the Intellectual Property Code of the Philippines (Republic Act No. 8293, Sec. 177).";

// --- THEME COLORS ---
const COLORS = {
  blueJeans: '#214573',
  goldenYellow: '#EDA340',
  blueVelvet: '#091D38',
  goldStars: '#AF7A2B',
  tangerine: '#F47729',
  emerald: '#10B981',
  indigo: '#6366F1'
};

const CHART_COLORS = [
  COLORS.blueJeans, 
  COLORS.goldenYellow, 
  COLORS.emerald, 
  COLORS.tangerine, 
  COLORS.indigo, 
  COLORS.blueVelvet
];

// --- COMPREHENSIVE PH LABOR MULTIPLIERS ---
const PREMIUM_RATES = [
  { value: 1.00, label: '1.00x (Basic Hourly)' },
  { value: 1.10, label: '1.10x (Night Diff Only - ND)' },
  { value: 1.25, label: '1.25x (Ordinary Day OT)' },
  { value: 1.375, label: '1.375x (Ordinary Day OT + ND)' },
  { value: 1.30, label: '1.30x (Rest Day / Spl Hol)' },
  { value: 1.43, label: '1.43x (Rest/Spl Hol + ND)' },
  { value: 1.69, label: '1.69x (Rest/Spl Hol + OT)' },
  { value: 1.859, label: '1.859x (Rest/Spl Hol + OT + ND)' },
  { value: 1.50, label: '1.50x (Spl Hol on Rest Day)' },
  { value: 1.65, label: '1.65x (Spl Hol on Rest Day + ND)' },
  { value: 1.95, label: '1.95x (Spl Hol on Rest Day + OT)' },
  { value: 2.145, label: '2.145x (Spl Hol on Rest Day + OT + ND)' },
  { value: 2.00, label: '2.00x (Regular Holiday)' },
  { value: 2.20, label: '2.20x (Reg Hol + ND)' },
  { value: 2.60, label: '2.60x (Reg Hol + OT)' },
  { value: 2.86, label: '2.86x (Reg Hol + OT + ND)' },
  { value: 2.60, label: '2.60x (Reg Hol on Rest Day)' },
  { value: 2.86, label: '2.86x (Reg Hol on Rest Day + ND)' },
  { value: 3.38, label: '3.38x (Reg Hol on Rest Day + OT)' },
  { value: 3.718, label: '3.718x (Reg Hol on Rest Day + OT + ND)' },
];

// --- HELPER COMPONENTS (Moved outside to prevent re-mount focus issues) ---
const handleAmountChange = (setState, category, id, period, val) => {
  setState(prev => ({
    ...prev,
    [category]: prev[category].map(item => {
      if (item.id === id) {
        return { 
          ...item, 
          amounts: { ...(item.amounts || {}), [period]: val } 
        };
      }
      return item;
    })
  }));
};

const handleNameChange = (setState, category, id, value) => {
  setState(prev => ({
    ...prev,
    [category]: prev[category].map(item => item.id === id ? { ...item, name: value } : item)
  }));
};

const addItem = (setState, category) => {
  setState(prev => ({ 
    ...prev, 
    [category]: [
      ...prev[category], 
      { id: Date.now(), name: 'New Item', amounts: {} }
    ] 
  }));
};

const removeItem = (setState, category, id) => {
  setState(prev => ({ 
    ...prev, 
    [category]: prev[category].filter(item => item.id !== id) 
  }));
};

const SectionHeader = ({ title, isDarkMode }) => (
  <div className={`font-bold border-b-[1.5px] pb-1 mt-6 mb-2 text-sm uppercase tracking-wider ${isDarkMode ? `border-goldenYellow text-goldenYellow` : `border-blueVelvet text-blueVelvet`}`}>
    {title}
  </div>
);

const DynamicList = ({ items, category, setState, isDeductible = false, currencySymbolStr, activePeriod, comparePeriod, isComparisonMode }) => {
  return (
    <div className="space-y-1 mb-4">
      {items.map((item, index) => {
         const val1 = item.amounts?.[activePeriod] || 0;
         const val2 = item.amounts?.[comparePeriod] || 0;
         
         return (
          <div key={item.id} className="flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/50 py-1 -mx-2 px-2 rounded">
            <input
              type="text"
              value={item.name ?? ''}
              onChange={(e) => handleNameChange(setState, category, item.id, e.target.value)}
              className={`flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blueJeans focus:outline-none transition-colors text-sm dark:text-slate-200`}
              placeholder="Line Item Name"
            />
            <div className="flex items-center gap-4">
              <CurrencyInput 
                value={val1} 
                onChange={(val) => handleAmountChange(setState, category, item.id, activePeriod, val)} 
                currencySymbol={currencySymbolStr} 
                showSymbol={index === 0} 
                isDeductible={isDeductible} 
              />
              {isComparisonMode && (
                <CurrencyInput 
                  value={val2} 
                  onChange={(val) => handleAmountChange(setState, category, item.id, comparePeriod, val)} 
                  currencySymbol={currencySymbolStr} 
                  showSymbol={index === 0} 
                  isDeductible={isDeductible} 
                />
              )}
              <button onClick={() => removeItem(setState, category, item.id)} className="w-5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
         );
      })}
      <button onClick={() => addItem(setState, category)} className={`text-xs hover:opacity-80 flex items-center gap-1 font-medium mt-1 text-tangerine`}>
        <Plus size={14} /> Add Line Item
      </button>
    </div>
  );
};

const TotalRow = ({ label, amount1, amount2, isFinal = false, isDarkMode, currencySymbolStr, isComparisonMode }) => {
  return (
    <div className={`flex justify-between items-end py-1 mt-2 text-sm ${isFinal ? 'font-bold' : 'font-semibold'} dark:text-slate-200`}>
      <span>{label}</span>
      <div className="flex items-center gap-4">
        <div className="relative min-w-[120px] flex justify-end pb-1 pt-1">
           <div className={`absolute top-0 left-0 right-0 h-[1px] ${isFinal ? (isDarkMode ? 'bg-slate-200' : 'bg-slate-900') : 'bg-slate-300'}`}></div>
           <CurrencyInput value={amount1 ?? 0} onChange={()=>{}} currencySymbol={currencySymbolStr} showSymbol={true} readOnly={true} />
           {isFinal && (
             <>
               <div className={`absolute bottom-[2px] left-0 right-0 h-[1px] ${isDarkMode ? 'bg-slate-200' : 'bg-slate-900'}`}></div>
               <div className={`absolute bottom-0 left-0 right-0 h-[1px] ${isDarkMode ? 'bg-slate-200' : 'bg-slate-900'}`}></div>
             </>
           )}
        </div>
        {isComparisonMode && (
          <div className="relative min-w-[120px] flex justify-end pb-1 pt-1">
             <div className={`absolute top-0 left-0 right-0 h-[1px] ${isFinal ? (isDarkMode ? 'bg-slate-200' : 'bg-slate-900') : 'bg-slate-300'}`}></div>
             <CurrencyInput value={amount2 ?? 0} onChange={()=>{}} currencySymbol={currencySymbolStr} showSymbol={true} readOnly={true} />
             {isFinal && (
               <>
                 <div className={`absolute bottom-[2px] left-0 right-0 h-[1px] ${isDarkMode ? 'bg-slate-200' : 'bg-slate-900'}`}></div>
                 <div className={`absolute bottom-0 left-0 right-0 h-[1px] ${isDarkMode ? 'bg-slate-200' : 'bg-slate-900'}`}></div>
               </>
             )}
          </div>
        )}
        <div className="w-5" />
      </div>
    </div>
  );
};

const LinkedRow = ({ label, amount1, amount2, isDarkMode, currencySymbolStr, isComparisonMode }) => {
  return (
    <div className={`flex justify-between items-center py-1 text-sm border-y border-transparent ${isDarkMode ? `bg-blueVelvet/30 text-slate-200` : `bg-blueJeans/10`}`}>
      <span className="flex items-center gap-2 italic">
        {label} <span className={`text-[10px] px-1.5 py-0.5 rounded-full not-italic ${isDarkMode ? `bg-blueVelvet text-goldenYellow` : `bg-blueJeans/20 text-blueVelvet`}`}>Auto</span>
      </span>
      <div className="flex items-center gap-4">
        <CurrencyInput value={amount1 ?? 0} onChange={()=>{}} currencySymbol={currencySymbolStr} showSymbol={false} readOnly={true} />
        {isComparisonMode && (
          <CurrencyInput value={amount2 ?? 0} onChange={()=>{}} currencySymbol={currencySymbolStr} showSymbol={false} readOnly={true} />
        )}
        <div className="w-5" />
      </div>
    </div>
  );
};

// --- CUSTOM INPUT COMPONENT ---
const CurrencyInput = ({ value, onChange, currencySymbol, showSymbol = true, isDeductible = false, readOnly = false }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localStr, setLocalStr] = useState('');

  useEffect(() => {
    if (!isFocused) {
      const num = Number(value) || 0;
      const absNum = Math.abs(num);
      const formatted = absNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const isNeg = num < 0;
      setLocalStr((isNeg || (isDeductible && num > 0)) ? `(${formatted})` : formatted);
    }
  }, [value, isFocused, isDeductible]);

  const handleChange = (e) => {
    let val = e.target.value;
    let isNegative = val.startsWith('-') || val.includes('(');
    
    // Clean non-numeric characters (except period)
    let clean = val.replace(/[^0-9.]/g, '');
    
    // Handle multiple periods
    let parts = clean.split('.');
    if (parts.length > 2) {
      parts = [parts[0], parts.slice(1).join('')];
    }
    
    // Apply commas to the whole number part
    if (parts[0]) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    let finalStr = parts.join('.');
    if (isNegative && finalStr) finalStr = '-' + finalStr;
    
    setLocalStr(finalStr);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value === 0 || value === null || value === undefined) {
       setLocalStr('');
       return;
    }
    let clean = Number(value).toString();
    let isNeg = clean.startsWith('-');
    clean = clean.replace('-', '');
    let parts = clean.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    setLocalStr((isNeg ? '-' : '') + parts.join('.'));
  };

  const handleBlur = () => {
    setIsFocused(false);
    let clean = localStr.replace(/[^0-9.-]/g, '');
    let num = parseFloat(clean);
    if (isNaN(num)) num = 0;
    if (localStr.includes('(') && num > 0) num = -num;
    onChange(num);
  };

  if (readOnly) {
    return (
      <div className="flex items-center gap-2 w-28 justify-end">
        <span className={`text-[11px] font-sans ${showSymbol ? 'text-slate-600 dark:text-slate-400' : 'text-transparent'}`}>{currencySymbol}</span>
        <span className={`text-right font-medium text-[11px] font-sans ${localStr.includes('(') ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
          {localStr || '0.00'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className={`text-sm select-none ${showSymbol ? 'text-slate-500 dark:text-slate-400' : 'text-transparent'}`}>{currencySymbol}</span>
      <input
        type="text"
        value={localStr ?? ''}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`w-28 text-right bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blueJeans focus:outline-none transition-colors text-sm dark:text-slate-200 ${
          (!isFocused && localStr.includes('(')) ? 'text-red-600 dark:text-red-400' : ''
        }`}
      />
    </div>
  );
};

export default function App() {
  // --- AUTHENTICATION & THEME STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- COLLABORATION & FIREBASE STATES ---
  const [user, setUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isApplyingRemote = useRef(false);
  const deviceId = useRef(Math.random().toString(36).substr(2, 9)); 
  const [activeField, setActiveField] = useState(null); 

  const [displayName, setDisplayName] = useState('');
  const [isPresenceOpen, setIsPresenceOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newNameInput, setNewNameInput] = useState('');
  const presenceDropdownRef = useRef(null);

  // --- STATE MANAGEMENT ---
  const [companyName, setCompanyName] = useState('XEIA CORPORATION');
  const [dbaName, setDbaName] = useState('Doing business under the name and style of Xeia');
  const [isConsolidated, setIsConsolidated] = useState(true);
  const [currency, setCurrency] = useState('PHP');
  const currencySymbolStr = CURRENCIES.find(c => c.code === currency)?.symbol || currency;
  const [activeTab, setActiveTab] = useState('spl');

  // --- NEW MULTI-PERIOD STATE ---
  const [periods, setPeriods] = useState(['2023', '2024']);
  const [activePeriod, setActivePeriod] = useState('2024');
  const [comparePeriod, setComparePeriod] = useState('2023');
  const [isComparisonMode, setIsComparisonMode] = useState(true);
  const [isPeriodManagerOpen, setIsPeriodManagerOpen] = useState(false);
  const [newPeriodInput, setNewPeriodInput] = useState('');

  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const fileInputRef = useRef(null);

  // Core Financial Data States
  const [splData, setSplData] = useState({
    revenues: [
      { id: 1, name: 'Sales Revenue', amounts: { '2023': 1350000, '2024': 1500000 } },
      { id: 2, name: 'Service Revenue', amounts: { '2023': 200000, '2024': 250000 } }
    ],
    cogs: [{ id: 1, name: 'Cost of Goods Sold', amounts: { '2023': 550000, '2024': 600000 } }],
    expenses: [
      { id: 1, name: 'Salaries Expense', amounts: { '2023': 280000, '2024': 300000 } },
      { id: 2, name: 'Rent Expense', amounts: { '2023': 120000, '2024': 120000 } },
    ],
    oci: [
      { id: 1, name: 'Other comprehensive income adjustments', amounts: { '2023': 80000, '2024': 100000 } }
    ],
  });

  const [sceData, setSceData] = useState({
    beginningCapital: { '2023': 450000, '2024': 600000 },
    investments: [{ id: 1, name: 'Issuance of Ordinary Shares', amounts: { '2023': 50000, '2024': 100000 } }],
    dividends: [{ id: 1, name: 'Dividends Paid', amounts: { '2023': 40000, '2024': 50000 } }],
  });

  const [bsData, setBsData] = useState({
    currentAssets: [
      { id: 1, name: 'Short-term investments', amounts: { '2023': 624800, '2024': 85455 } },
      { id: 2, name: 'Receivables and contract assets', amounts: { '2023': 8567416, '2024': 10802515 } },
      { id: 3, name: 'Inventories', amounts: { '2023': 12340206, '2024': 13872706 } }
    ],
    nonCurrentAssets: [
      { id: 1, name: 'Property, plant and equipment', amounts: { '2023': 39825319, '2024': 43893416 } },
      { id: 2, name: 'Right-of-use assets', amounts: { '2023': 44966055, '2024': 44529498 } }
    ],
    currentLiabilities: [
      { id: 1, name: 'Trade payables and contract liabilities', amounts: { '2023': 46835455, '2024': 48364343 } },
      { id: 2, name: 'Short-term debt', amounts: { '2023': 5751730, '2024': 6472199 } }
    ],
    nonCurrentLiabilities: [
      { id: 1, name: 'Senior debt securities', amounts: { '2023': 33077780, '2024': 34582581 } },
      { id: 2, name: 'Lease liabilities', amounts: { '2023': 43288544, '2024': 44115015 } }
    ],
  });

  const [cfData, setCfData] = useState({
    beginningCash: { '2023': 33232488, '2024': 29326649 },
    operating: [{ id: 1, name: 'Depreciation Add-back', amounts: { '2023': 45000, '2024': 50000 } }],
    investing: [{ id: 1, name: 'Purchase of Equipment', amounts: { '2023': -100000, '2024': -150000 } }],
    financing: [{ id: 1, name: 'Proceeds from Bank Loan', amounts: { '2023': 100000, '2024': 0 } }],
  });

  const [ratioData, setRatioData] = useState({ 
    initialInvestment: { '2023': 500000, '2024': 500000 } 
  });

  // TAX TAB STATES 
  const [activeTaxSubTab, setActiveTaxSubTab] = useState('income');
  const [taxLedger, setTaxLedger] = useState([]);
  const [taxBasisInput, setTaxBasisInput] = useState(0);

  const [incomeTaxTable, setIncomeTaxTable] = useState([
    { id: 1, min: 0, max: 250000, baseTax: 0, excessRate: 0 },
    { id: 2, min: 250000, max: 400000, baseTax: 0, excessRate: 15 },
    { id: 3, min: 400000, max: 800000, baseTax: 22500, excessRate: 20 },
    { id: 4, min: 800000, max: 2000000, baseTax: 102500, excessRate: 25 },
    { id: 5, min: 2000000, max: 8000000, baseTax: 402500, excessRate: 30 },
    { id: 6, min: 8000000, max: Infinity, baseTax: 2202500, excessRate: 35 },
  ]);

  const [flatTaxRates, setFlatTaxRates] = useState({
    income: [
      { id: 'cit_reg', name: 'Corporate Income Tax - Regular', rate: 25 }, 
      { id: 'cit_msme', name: 'Corporate Income Tax - MSME', rate: 20 }
    ],
    vat: [
      { id: 'vat_12', name: 'Value-Added Tax (Standard)', rate: 12 }, 
      { id: 'vat_0', name: 'Value-Added Tax (Zero-Rated)', rate: 0 }
    ],
    percentage: [
      { id: 'pt_3', name: 'Percentage Tax (Non-VAT)', rate: 3 }
    ],
    withholding: [
      { id: 'ewt_1', name: 'Expanded Withholding (Goods)', rate: 1 }, 
      { id: 'ewt_2', name: 'Expanded Withholding (Services)', rate: 2 },
      { id: 'ewt_5', name: 'Expanded Withholding (Rent/Prof)', rate: 5 }, 
      { id: 'ewt_10', name: 'Expanded Withholding (Professionals)', rate: 10 },
      { id: 'fwt_20', name: 'Final Withholding (Bank Interest)', rate: 20 },
    ],
    excise: [
      { id: 'exc_gen', name: 'Excise Tax (General Ad Valorem)', rate: 20 }
    ],
    dst: [
      { id: 'dst_loan', name: 'Doc. Stamp Tax (Loans/Instruments)', rate: 0.75 }, 
      { id: 'dst_sale', name: 'Doc. Stamp Tax (Deed of Sale)', rate: 1.5 }
    ],
    cgt: [
      { id: 'cgt_real', name: 'Capital Gains (Real Property)', rate: 6 }, 
      { id: 'cgt_stock', name: 'Capital Gains (Unlisted Shares)', rate: 15 }
    ],
    donor: [
      { id: 'donors', name: "Donor's Tax (Over 250k exempt)", rate: 6 }
    ],
    estate: [
      { id: 'estate', name: 'Estate Tax', rate: 6 }
    ]
  });

  const [selectedFlatTax, setSelectedFlatTax] = useState('');

  // PAYROLL TAB STATES
  const [payrollConfig, setPayrollConfig] = useState({ 
    workDaysPerMonth: 22, 
    hoursPerDay: 8, 
    payBasis: 'Monthly', 
    ndMultiplier: 0.10 
  });
  
  const [payrollCols, setPayrollCols] = useState({
    earnings: [{ id: 'earn_1', name: 'Fringe Benefit' }],
    deductions: []
  });

  const [employees, setEmployees] = useState([
    { id: 1, name: 'Juan Dela Cruz', basePay: 25000, otPay: 0, otHours: 5, otType: 1.25, ndPay: 0, ndHours: 0, earnings: { earn_1: 0 }, deductions: {}, sss: 1125, philhealth: 625, pagibig: 200, withholding: 0 },
    { id: 2, name: 'Maria Clara', basePay: 35000, otPay: 0, otHours: 10, otType: 1.30, ndPay: 0, ndHours: 8, earnings: { earn_1: 1500 }, deductions: {}, sss: 1575, philhealth: 875, pagibig: 200, withholding: 1500 },
  ]);

  const [calcState, setCalcState] = useState({ 
    empId: '', dailyRate: 0, otHours: 0, otType: 1.25, ndHours: 0 
  });

  // NOTES STATE
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notesText, setNotesText] = useState('');

  // PRODUCT COSTING STATE
  const [costingData, setCostingData] = useState({
    productId: '10015', 
    productName: 'Widget Y', 
    productDescription: 'A high-quality widget for various applications',
    materials: [
      { id: 1, desc: 'Steel', unit: 'Piece', qty: 100, unitCost: 5.00 },
      { id: 2, desc: 'Plastic', unit: 'Piece', qty: 50, unitCost: 2.00 },
      { id: 3, desc: 'Circuit Board', unit: 'Piece', qty: 25, unitCost: 10.00 }
    ],
    labor: [
      { id: 1, desc: 'Assembly', hours: 10, hourlyRate: 20.00 },
      { id: 2, desc: 'Testing', hours: 5, hourlyRate: 25.00 }
    ],
    overhead: [
      { id: 1, desc: 'Factory Overhead', amount: 2000.00 }
    ]
  });
  const [costingTargetPeriod, setCostingTargetPeriod] = useState('2024');

  // SALES FORECAST STATE
  const [forecastPeriods, setForecastPeriods] = useState(['Jul-16', 'Aug-16', 'Sep-16']);
  const [forecastItems, setForecastItems] = useState([
    { id: 1, name: 'ITEM 1', periods: { 'Jul-16': { price: 100, qty: 500 }, 'Aug-16': { price: 100, qty: 400 }, 'Sep-16': { price: 100, qty: 500 } } },
    { id: 2, name: 'ITEM 2', periods: { 'Jul-16': { price: 50, qty: 1000 }, 'Aug-16': { price: 50, qty: 800 }, 'Sep-16': { price: 50, qty: 1000 } } }
  ]);
  const [forecastTargetPeriod, setForecastTargetPeriod] = useState('2024');

  // DEPRECIATION STATE
  const [deprState, setDeprState] = useState({ 
    assetName: 'Machinery', cost: 50000, salvage: 5000, life: 5, method: 'Straight Line' 
  });
  const [deprSchedule, setDeprSchedule] = useState([]);

  // --- FOCUS TRACKER & DROPDOWN DISMISS ---
  useEffect(() => {
    const handleFocusIn = (e) => {
      const el = e.target;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
         let name = el.placeholder || el.name || el.id;
         if (!name) {
            const prev = el.previousSibling;
            if (prev && prev.nodeType === 3 && prev.textContent.trim()) {
               name = prev.textContent.trim();
            } else if (el.closest('.group') && el.closest('.group').querySelector('input[type="text"]')) {
               const rowNameInput = el.closest('.group').querySelector('input[type="text"]');
               if (rowNameInput && rowNameInput !== el && rowNameInput.value) {
                  name = rowNameInput.value;
               }
            }
         }
         setActiveField(name ? (name.length > 30 ? name.substring(0,30)+'...' : name) : 'a field');
      }
    };
    const handleFocusOut = () => setActiveField(null);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    return () => {
       document.removeEventListener('focusin', handleFocusIn);
       document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (presenceDropdownRef.current && !presenceDropdownRef.current.contains(event.target)) {
        setIsPresenceOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- FIREBASE SYNC & COLLABORATION EFFECTS ---
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          try {
            await signInWithCustomToken(auth, __initial_auth_token);
          } catch (tokenErr) {
            console.error("Custom token error, falling back to anonymous", tokenErr);
            await signInAnonymously(auth);
          }
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !isAuthenticated || !db) return;
    
    const workspaceId = loginName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const myPresenceId = `${user.uid}_${deviceId.current}`;
    const presenceRef = doc(db, 'artifacts', appId, 'public', 'data', `presence_${workspaceId}`, myPresenceId);
    
    const updatePresence = () => {
      setDoc(presenceRef, { 
        name: displayName || loginName, 
        tab: activeTab, 
        field: activeField, 
        timestamp: Date.now() 
      }).catch(console.error);
    };

    updatePresence();
    const presenceInterval = setInterval(updatePresence, 15000); 

    const handleUnload = () => deleteDoc(presenceRef);
    window.addEventListener('beforeunload', handleUnload);

    const presenceCol = collection(db, 'artifacts', appId, 'public', 'data', `presence_${workspaceId}`);
    const unsubPresence = onSnapshot(presenceCol, (snapshot) => {
      const users = [];
      const now = Date.now();
      snapshot.forEach(docSnap => {
        if (docSnap.id !== myPresenceId) { 
          const data = docSnap.data();
          if (now - data.timestamp < 45000) {
             users.push({ id: docSnap.id, ...data });
          } else {
             deleteDoc(docSnap.ref).catch(() => {}); 
          }
        }
      });
      setOnlineUsers(users);
    }, console.error);

    const cleanupInterval = setInterval(() => {
       setOnlineUsers(prev => prev.filter(u => Date.now() - u.timestamp < 45000));
    }, 15000);

    const chatCol = collection(db, 'artifacts', appId, 'public', 'data', `chat_${workspaceId}`);
    const unsubChat = onSnapshot(chatCol, (snapshot) => {
      const msgs = [];
      snapshot.forEach(d => msgs.push({ id: d.id, ...d.data() }));
      msgs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)); 
      setChatMessages(msgs);
    }, console.error);

    return () => {
      clearInterval(presenceInterval);
      clearInterval(cleanupInterval);
      unsubPresence();
      unsubChat();
      deleteDoc(presenceRef).catch(() => {});
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [user, isAuthenticated, activeTab, activeField, loginName, displayName]);

  useEffect(() => {
    if (!user || !isAuthenticated || !db) return;
    
    const workspaceId = loginName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const stateRef = doc(db, 'artifacts', appId, 'public', 'data', 'appStates', workspaceId);
    
    const unsubState = onSnapshot(stateRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.lastEditor === `${user.uid}_${deviceId.current}`) return;

        isApplyingRemote.current = true;
        const s = data.state;
        
        // --- Migration handler for old backups (amount1/amount2 to amounts object) ---
        const mapAmounts = (arr) => {
           if (!arr) return [];
           return arr.map(item => {
              if (item.amounts) return item;
              return { 
                 ...item, 
                 amounts: { 
                    [s.year1 || '2024']: item.amount1 || 0, 
                    [s.year2 || '2023']: item.amount2 || 0 
                 } 
              };
           });
        };
        
        if (s.periods) setPeriods(s.periods);
        else if (s.year1 && s.year2) setPeriods([s.year2, s.year1]); 

        if (s.activePeriod) setActivePeriod(s.activePeriod); else if (s.year1) setActivePeriod(s.year1);
        if (s.comparePeriod) setComparePeriod(s.comparePeriod); else if (s.year2) setComparePeriod(s.year2);
        if (s.isComparisonMode !== undefined) setIsComparisonMode(s.isComparisonMode); else if (s.isTwoYear !== undefined) setIsComparisonMode(s.isTwoYear);
        
        if (s.companyName !== undefined) setCompanyName(s.companyName);
        if (s.dbaName !== undefined) setDbaName(s.dbaName);
        if (s.isConsolidated !== undefined) setIsConsolidated(s.isConsolidated);
        if (s.currency !== undefined) setCurrency(s.currency);
        
        if (s.splData) setSplData({ 
           revenues: mapAmounts(s.splData.revenues), 
           cogs: mapAmounts(s.splData.cogs), 
           expenses: mapAmounts(s.splData.expenses), 
           oci: mapAmounts(s.splData.oci) 
        });
        
        if (s.sceData) setSceData({ 
           beginningCapital: s.sceData.beginningCapital || { [s.year1||'2024']: s.sceData.beginningCapital1, [s.year2||'2023']: s.sceData.beginningCapital2 }, 
           investments: mapAmounts(s.sceData.investments), 
           dividends: mapAmounts(s.sceData.dividends) 
        });
        
        if (s.bsData) setBsData({ 
           currentAssets: mapAmounts(s.bsData.currentAssets), 
           nonCurrentAssets: mapAmounts(s.bsData.nonCurrentAssets), 
           currentLiabilities: mapAmounts(s.bsData.currentLiabilities), 
           nonCurrentLiabilities: mapAmounts(s.bsData.nonCurrentLiabilities) 
        });
        
        if (s.cfData) setCfData({ 
           beginningCash: s.cfData.beginningCash || { [s.year1||'2024']: s.cfData.beginningCash1, [s.year2||'2023']: s.cfData.beginningCash2 }, 
           operating: mapAmounts(s.cfData.operating), 
           investing: mapAmounts(s.cfData.investing), 
           financing: mapAmounts(s.cfData.financing) 
        });
        
        if (s.ratioData) setRatioData({ 
           initialInvestment: s.ratioData.initialInvestment || { [s.year1||'2024']: s.ratioData.initialInvestment1, [s.year2||'2023']: s.ratioData.initialInvestment2 } 
        });
        
        if (s.taxLedger) setTaxLedger(s.taxLedger);
        if (s.incomeTaxTable) setIncomeTaxTable(s.incomeTaxTable);
        if (s.flatTaxRates) setFlatTaxRates(s.flatTaxRates);
        if (s.payrollConfig) setPayrollConfig(s.payrollConfig);
        if (s.payrollCols) setPayrollCols(s.payrollCols);
        if (s.employees) setEmployees(s.employees);
        if (s.costingData) setCostingData(s.costingData);
        if (s.forecastPeriods) setForecastPeriods(s.forecastPeriods);
        if (s.forecastItems) setForecastItems(s.forecastItems);
        if (s.deprState) setDeprState(s.deprState);
        if (s.deprSchedule) setDeprSchedule(s.deprSchedule);
        if (s.notesText !== undefined) setNotesText(s.notesText);

        setTimeout(() => { isApplyingRemote.current = false; }, 500); 
      }
    }, console.error);

    return () => unsubState();
  }, [user, isAuthenticated, loginName]);

  useEffect(() => {
    if (!user || !isAuthenticated || !db || isApplyingRemote.current) return;
    
    const timer = setTimeout(() => {
      if (isApplyingRemote.current) return; 
      const workspaceId = loginName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const stateRef = doc(db, 'artifacts', appId, 'public', 'data', 'appStates', workspaceId);
      
      setDoc(stateRef, {
        state: {
          companyName, dbaName, isConsolidated, isComparisonMode, currency, periods, activePeriod, comparePeriod,
          splData, sceData, bsData, cfData, ratioData, taxLedger, incomeTaxTable, flatTaxRates,
          payrollConfig, payrollCols, employees, costingData, forecastPeriods, forecastItems, deprState, deprSchedule, notesText
        },
        lastEditor: `${user.uid}_${deviceId.current}`,
        editorName: loginName,
        timestamp: Date.now()
      }).catch(console.error);
    }, 1500); 

    return () => clearTimeout(timer);
  }, [
    companyName, dbaName, isConsolidated, isComparisonMode, currency, periods, activePeriod, comparePeriod,
    splData, sceData, bsData, cfData, ratioData, taxLedger, incomeTaxTable, flatTaxRates,
    payrollConfig, payrollCols, employees, costingData, forecastPeriods, forecastItems, deprState, deprSchedule, notesText,
    user, isAuthenticated, loginName
  ]);

  // --- CHAT LOGIC ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !user || !db) return;
    try {
      const workspaceId = loginName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const chatCol = collection(db, 'artifacts', appId, 'public', 'data', `chat_${workspaceId}`);
      await addDoc(chatCol, { 
         text: chatInput, 
         sender: displayName || loginName, 
         senderId: `${user.uid}_${deviceId.current}`, 
         timestamp: Date.now() 
      });
      setChatInput('');
    } catch (err) { 
      console.error("Chat error", err); 
    }
  };

  // --- LOGIN LOGIC ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (AUTHORIZED_USERS.some(u => u.toLowerCase() === loginName.trim().toLowerCase())) {
      setDisplayName(loginName.trim());
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Unauthorized access. Please enter a valid authorized name.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const name = result.user.displayName || result.user.email;
      setLoginName(name);
      setDisplayName(name);
      setIsAuthenticated(true);
      setLoginError('');
    } catch (error) {
      console.error("Google Sign-In Error", error);
      setLoginError("Google Sign-In failed or was cancelled. Please try again or use manual entry.");
    }
  };

  // --- SAVE & LOAD SESSION (BACKUP) LOGIC ---
  const handleSaveSession = () => {
    const sessionData = {
      version: '2.0', 
      timestamp: new Date().toISOString(),
      companyName, dbaName, isConsolidated, isComparisonMode, currency, periods, activePeriod, comparePeriod,
      splData, sceData, bsData, cfData, ratioData, taxLedger, incomeTaxTable, flatTaxRates,
      payrollConfig, payrollCols, employees, costingData, forecastPeriods, forecastItems, deprState, deprSchedule, notesText
    };
    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Xeia_Backup_${new Date().toISOString().split('T')[0]}.xeia`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadSession = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const s = data;
        const mapAmounts = (arr) => {
           if (!arr) return [];
           return arr.map(item => {
              if (item.amounts) return item;
              return { 
                 ...item, 
                 amounts: { 
                    [s.year1 || '2024']: item.amount1 || 0, 
                    [s.year2 || '2023']: item.amount2 || 0 
                 } 
              };
           });
        };
        
        if (s.periods) setPeriods(s.periods); 
        else if (s.year1 && s.year2) setPeriods([s.year2, s.year1]);
        
        if (s.activePeriod) setActivePeriod(s.activePeriod); else if (s.year1) setActivePeriod(s.year1);
        if (s.comparePeriod) setComparePeriod(s.comparePeriod); else if (s.year2) setComparePeriod(s.year2);
        if (s.isComparisonMode !== undefined) setIsComparisonMode(s.isComparisonMode); else if (s.isTwoYear !== undefined) setIsComparisonMode(s.isTwoYear);
        
        if(s.companyName !== undefined) setCompanyName(s.companyName);
        if(s.dbaName !== undefined) setDbaName(s.dbaName);
        if(s.isConsolidated !== undefined) setIsConsolidated(s.isConsolidated);
        if(s.currency !== undefined) setCurrency(s.currency);
        
        if (s.splData) setSplData({ 
           revenues: mapAmounts(s.splData.revenues), 
           cogs: mapAmounts(s.splData.cogs), 
           expenses: mapAmounts(s.splData.expenses), 
           oci: mapAmounts(s.splData.oci) 
        });
        
        if (s.sceData) setSceData({ 
           beginningCapital: s.sceData.beginningCapital || { [s.year1||'2024']: s.sceData.beginningCapital1, [s.year2||'2023']: s.sceData.beginningCapital2 }, 
           investments: mapAmounts(s.sceData.investments), 
           dividends: mapAmounts(s.sceData.dividends) 
        });
        
        if (s.bsData) setBsData({ 
           currentAssets: mapAmounts(s.bsData.currentAssets), 
           nonCurrentAssets: mapAmounts(s.bsData.nonCurrentAssets), 
           currentLiabilities: mapAmounts(s.bsData.currentLiabilities), 
           nonCurrentLiabilities: mapAmounts(s.bsData.nonCurrentLiabilities) 
        });
        
        if (s.cfData) setCfData({ 
           beginningCash: s.cfData.beginningCash || { [s.year1||'2024']: s.cfData.beginningCash1, [s.year2||'2023']: s.cfData.beginningCash2 }, 
           operating: mapAmounts(s.cfData.operating), 
           investing: mapAmounts(s.cfData.investing), 
           financing: mapAmounts(s.cfData.financing) 
        });
        
        if (s.ratioData) setRatioData({ 
           initialInvestment: s.ratioData.initialInvestment || { [s.year1||'2024']: s.ratioData.initialInvestment1, [s.year2||'2023']: s.ratioData.initialInvestment2 } 
        });
        
        if(s.taxLedger) setTaxLedger(s.taxLedger);
        if(s.incomeTaxTable) setIncomeTaxTable(s.incomeTaxTable);
        if(s.flatTaxRates) setFlatTaxRates(s.flatTaxRates);
        if(s.payrollConfig) setPayrollConfig(s.payrollConfig);
        if(s.payrollCols) setPayrollCols(s.payrollCols);
        if(s.employees) setEmployees(s.employees);
        if(s.costingData) setCostingData(s.costingData);
        if(s.forecastPeriods) setForecastPeriods(s.forecastPeriods);
        if(s.forecastItems) setForecastItems(s.forecastItems);
        if(s.deprState) setDeprState(s.deprState);
        if(s.deprSchedule) setDeprSchedule(s.deprSchedule);
        if(s.notesText) setNotesText(s.notesText);
        
        alert("Session Backup loaded successfully! All figures have been restored.");
      } catch(err) { 
        alert("Error loading file. Make sure it is a valid .xeia backup file."); 
      }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  // --- PERIOD MANAGEMENT LOGIC ---
  const handleAddPeriod = () => {
    if (!newPeriodInput.trim() || periods.includes(newPeriodInput.trim())) {
      return;
    }
    setPeriods([...periods, newPeriodInput.trim()]);
    setNewPeriodInput('');
  };
  
  const handleDeletePeriod = (p) => {
    if (periods.length <= 1) {
      return alert("Cannot delete the last period.");
    }
    if (confirm(`Are you sure you want to delete period ${p}? This removes all specific figures for this year.`)) {
       const newP = periods.filter(per => per !== p);
       setPeriods(newP);
       if (activePeriod === p) setActivePeriod(newP[newP.length - 1]);
       if (comparePeriod === p) setComparePeriod(newP[0]);
    }
  };
  
  const movePeriod = (index, direction) => {
    const newP = [...periods];
    if (direction === 'up' && index > 0) {
      [newP[index - 1], newP[index]] = [newP[index], newP[index - 1]];
    } else if (direction === 'down' && index < newP.length - 1) {
      [newP[index + 1], newP[index]] = [newP[index], newP[index + 1]];
    }
    setPeriods(newP);
  };

  // --- UNIVERSAL FINANCIAL ENGINE (Calculates all years sequentially) ---
  const sumAmounts = (arr, period) => {
    return arr.reduce((acc, item) => {
      return acc + (Number(item.amounts?.[period]) || 0);
    }, 0);
  };
  
  const financials = useMemo(() => {
    const result = {};
    let prevCapital = 0;
    let prevCash = 0;

    periods.forEach((p, idx) => {
      // SPL
      const rev = sumAmounts(splData.revenues, p);
      const cogs = sumAmounts(splData.cogs, p);
      const gp = rev - cogs;
      const exp = sumAmounts(splData.expenses, p);
      const ni = gp - exp;
      const oci = sumAmounts(splData.oci, p);
      const compInc = ni + oci;

      // SCE & CF (Cascading Logic)
      const isFirst = idx === 0;
      const begCap = isFirst ? (Number(sceData.beginningCapital?.[p]) || 0) : prevCapital;
      const inv = sumAmounts(sceData.investments, p);
      const div = sumAmounts(sceData.dividends, p);
      const endEq = begCap + ni + oci + inv - div;
      prevCapital = endEq;

      const begCash = isFirst ? (Number(cfData.beginningCash?.[p]) || 0) : prevCash;
      const opCF = ni + sumAmounts(cfData.operating, p);
      const invCF = sumAmounts(cfData.investing, p);
      const finCF = sumAmounts(cfData.financing, p) - div;
      const netCash = opCF + invCF + finCF;
      const endCash = begCash + netCash;
      prevCash = endCash;

      // BS
      const ca = endCash + sumAmounts(bsData.currentAssets, p);
      const nca = sumAmounts(bsData.nonCurrentAssets, p);
      const ta = ca + nca;
      const cl = sumAmounts(bsData.currentLiabilities, p);
      const ncl = sumAmounts(bsData.nonCurrentLiabilities, p);
      const tl = cl + ncl;
      const tle = tl + endEq;

      result[p] = { 
        rev, cogs, gp, exp, ni, oci, compInc, 
        begCap, inv, div, endEq, 
        begCash, opCF, invCF, finCF, netCash, endCash, 
        ca, nca, ta, cl, ncl, tl, tle 
      };
    });
    return result;
  }, [periods, splData, sceData, cfData, bsData]);

  // Derived Accessors for Active Views
  const finActive = financials[activePeriod] || {};
  const finCompare = financials[comparePeriod] || {};

  const subtitleText = isConsolidated ? 'AND SUBSIDIARIES' : '';
  const titlePrefix = isConsolidated ? 'CONSOLIDATED ' : '';

  // Payroll Derived Values
  const getEmpRates = (basePay) => {
    let daily = 0; let hourly = 0; let monthly = 0;
    if (payrollConfig.payBasis === 'Monthly') { 
      monthly = basePay; 
      daily = basePay / (payrollConfig.workDaysPerMonth || 22); 
      hourly = daily / (payrollConfig.hoursPerDay || 8); 
    } else if (payrollConfig.payBasis === 'Daily') { 
      daily = basePay; 
      hourly = basePay / (payrollConfig.hoursPerDay || 8); 
      monthly = daily * (payrollConfig.workDaysPerMonth || 22); 
    } else { 
      hourly = basePay; 
      daily = basePay * (payrollConfig.hoursPerDay || 8); 
      monthly = daily * (payrollConfig.workDaysPerMonth || 22); 
    }
    return { daily, hourly, monthly };
  };

  const calcHourlyRate = (calcState.dailyRate || 0) / (payrollConfig.hoursPerDay || 8);
  const computedOtPay = calcHourlyRate * (calcState.otType || 1.25) * (calcState.otHours || 0);
  const computedNdPay = calcHourlyRate * (payrollConfig.ndMultiplier || 0.10) * (calcState.ndHours || 0);

  const handleSelectCalcEmp = (empId) => {
    const emp = employees.find(e => e.id === Number(empId));
    if (emp) {
      const rates = getEmpRates(emp.basePay);
      setCalcState({ 
        empId: emp.id, 
        dailyRate: rates.daily, 
        otHours: emp.otHours || 0, 
        otType: emp.otType || 1.25, 
        ndHours: emp.ndHours || 0 
      });
    } else { 
      setCalcState({ ...calcState, empId: '' }); 
    }
  };

  const postToPayroll = () => {
    if (!calcState.empId) return;
    setEmployees(employees.map(emp => {
      if (emp.id === calcState.empId) {
        return { 
          ...emp, 
          otPay: computedOtPay, 
          ndPay: computedNdPay, 
          otHours: calcState.otHours, 
          otType: calcState.otType, 
          ndHours: calcState.ndHours 
        };
      }
      return emp;
    }));
  };

  // --- NEW FEATURE CALCULATIONS ---

  // Costing Calcs
  const totalCostMaterials = costingData.materials.reduce((acc, m) => acc + (m.qty * m.unitCost), 0);
  const totalCostLabor = costingData.labor.reduce((acc, l) => acc + (l.hours * l.hourlyRate), 0);
  const totalCostOverhead = costingData.overhead.reduce((acc, o) => acc + Number(o.amount), 0);
  const grandTotalProductionCost = totalCostMaterials + totalCostLabor + totalCostOverhead;

  const postProductionCostToCOGS = () => {
    if (!periods.includes(costingTargetPeriod)) {
      return alert("Target period not valid.");
    }
    setSplData(prev => ({
      ...prev,
      cogs: [
        ...prev.cogs, 
        { 
          id: Date.now(), 
          name: `Production Cost (${costingData.productName})`, 
          amounts: { [costingTargetPeriod]: grandTotalProductionCost } 
        }
      ]
    }));
    alert(`Production Cost successfully posted to Cost of Sales for period: ${costingTargetPeriod}`);
  };

  // Forecast Calcs
  const addForecastPeriod = () => {
    let finalPeriod = `Period ${forecastPeriods.length + 1}`;
    let counter = 1;
    while(forecastPeriods.includes(finalPeriod)) { 
      finalPeriod = `Period ${forecastPeriods.length + 1 + counter}`; 
      counter++; 
    }
    setForecastPeriods([...forecastPeriods, finalPeriod]);
    setForecastItems(forecastItems.map(item => ({ 
      ...item, 
      periods: { ...item.periods, [finalPeriod]: { price: 0, qty: 0 } } 
    })));
  };

  const postForecastTotalToRevenue = () => {
    if (!periods.includes(forecastTargetPeriod)) {
      return alert("Target period not valid.");
    }
    let totalSales = 0;
    forecastItems.forEach(item => {
      forecastPeriods.forEach(p => { 
        totalSales += ((item.periods[p]?.price || 0) * (item.periods[p]?.qty || 0)); 
      });
    });
    setSplData(prev => ({
      ...prev,
      revenues: [
        ...prev.revenues, 
        { 
          id: Date.now(), 
          name: `Forecasted Sales Revenue`, 
          amounts: { [forecastTargetPeriod]: totalSales } 
        }
      ]
    }));
    alert(`Total Forecasted Sales successfully posted to Revenues for period: ${forecastTargetPeriod}`);
  };

  // Depreciation Calcs
  const generateDeprSchedule = () => {
    const schedule = [];
    let begBV = Number(deprState.cost);
    const slnDepr = (Number(deprState.cost) - Number(deprState.salvage)) / Number(deprState.life);

    for (let i = 1; i <= deprState.life; i++) {
        let exp = 0;
        if (deprState.method === 'Straight Line') {
          exp = slnDepr;
        } else if (deprState.method === 'Double Declining') {
            exp = begBV * (2 / deprState.life);
            if (begBV - exp < deprState.salvage) exp = begBV - deprState.salvage; 
            if (i === deprState.life && begBV - exp > deprState.salvage) exp = begBV - deprState.salvage; 
        }
        const acc = (schedule[i - 2]?.accDepr || 0) + exp;
        const endBV = begBV - exp;
        schedule.push({ 
          year: i, 
          begBV, 
          exp, 
          accDepr: acc, 
          endBV, 
          targetPeriod: periods[Math.min(i - 1, periods.length - 1)] || periods[0] 
        });
        begBV = endBV;
    }
    setDeprSchedule(schedule);
  };

  const postDeprToSPL = (index) => {
    if (!deprSchedule[index]) return;
    const row = deprSchedule[index];
    const targetPeriod = row.targetPeriod;
    
    if (!periods.includes(targetPeriod)) {
      return alert("Target period not valid.");
    }

    setSplData(prev => ({
      ...prev,
      expenses: [
        ...prev.expenses, 
        { 
          id: Date.now(), 
          name: `Depreciation Expense - ${deprState.assetName} (Yr ${row.year})`, 
          amounts: { [targetPeriod]: row.exp } 
        }
      ]
    }));
    
    setBsData(prev => ({
      ...prev,
      nonCurrentAssets: [
        ...prev.nonCurrentAssets, 
        { 
          id: Date.now(), 
          name: `Accumulated Depr. - ${deprState.assetName}`, 
          amounts: { [targetPeriod]: -row.accDepr } 
        }
      ]
    }));
    
    setCfData(prev => ({
      ...prev,
      operating: [
        ...prev.operating, 
        { 
          id: Date.now(), 
          name: `Depreciation Add-back - ${deprState.assetName}`, 
          amounts: { [targetPeriod]: row.exp } 
        }
      ]
    }));
    
    alert(`Year ${row.year} Depreciation posted to ${targetPeriod}!`);
  };

  // --- TAX CALCULATION LOGIC ---
  const calculateTax = () => {
    let computedTax = 0; 
    let taxName = ''; 
    let rateStr = '';
    
    if (activeTaxSubTab === 'income' && !selectedFlatTax) {
      taxName = 'Individual Income Tax (Table)';
      let remaining = Number(taxBasisInput) || 0;
      for (let i = 0; i < incomeTaxTable.length; i++) {
        const bracket = incomeTaxTable[i];
        if (remaining > (bracket.min || 0) && remaining <= (bracket.max || Infinity)) {
          computedTax = (bracket.baseTax || 0) + ((remaining - (bracket.min || 0)) * ((bracket.excessRate || 0) / 100));
          rateStr = `Graduated (Max ${bracket.excessRate || 0}%)`;
          break;
        }
      }
    } else {
      const flatRatesArr = flatTaxRates[activeTaxSubTab] || [];
      const selectedObj = flatRatesArr.find(t => t.id === selectedFlatTax) || flatRatesArr[0];
      if (selectedObj) { 
        taxName = selectedObj.name; 
        rateStr = `${selectedObj.rate || 0}%`; 
        computedTax = (Number(taxBasisInput) || 0) * ((selectedObj.rate || 0) / 100); 
      }
    }
    
    if (computedTax > 0 || (Number(taxBasisInput) || 0) > 0) {
      setTaxLedger([
        ...taxLedger, 
        { 
          id: Date.now(), 
          name: taxName, 
          rateStr: rateStr, 
          basis: Number(taxBasisInput) || 0, 
          computed: computedTax 
        }
      ]);
      setTaxBasisInput(0);
    }
  };

  // --- EXCEL EXPORT LOGIC (Dynamic Multi-Period) ---
  const exportToExcel = async () => {
    try {
      setIsExportingExcel(true);
      const ExcelJS = (await import('https://esm.sh/exceljs')).default;
      const wb = new ExcelJS.Workbook();
      wb.creator = companyName;

      const styleHeader = (cell, title, isMain = false) => { 
        cell.value = title; 
        cell.font = { bold: true, size: isMain ? 12 : 11 }; 
      };

      const writeSection = (sheet, title, items, startRow) => {
        const titleCell = sheet.getCell(`A${startRow}`);
        titleCell.value = title; 
        titleCell.font = { bold: true, color: { argb: 'FF091D38' } }; 
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        
        let currentRow = startRow + 1;
        items.forEach(item => {
          sheet.getCell(`A${currentRow}`).value = item.name || '';
          periods.forEach((p, idx) => {
            const colNum = idx + 2; 
            const cell = sheet.getCell(currentRow, colNum);
            cell.value = Number(item.amounts?.[p]) || 0;
            cell.numFmt = '#,##0.00;[Red](#,##0.00)';
          });
          currentRow++;
        });
        
        const endRow = currentRow - 1;
        const formulas = periods.map((p, idx) => {
            const colLetter = String.fromCharCode(66 + idx); // B, C, D, etc.
            return startRow + 1 <= endRow ? `SUM(${colLetter}${startRow + 1}:${colLetter}${endRow})` : '0';
        });
        
        return { nextRow: currentRow, formulas };
      };

      const writeStyledTotal = (sheet, row, label, formulas, isFinal = false) => {
          sheet.getCell(`A${row}`).value = label; 
          sheet.getCell(`A${row}`).font = { bold: true };
          const borderStyle = isFinal ? { top: { style: 'thin' }, bottom: { style: 'double' } } : { top: { style: 'thin' } };
          
          periods.forEach((p, idx) => {
              const colNum = idx + 2;
              const cell = sheet.getCell(row, colNum);
              cell.value = { formula: formulas[idx] };
              cell.font = { bold: true }; 
              cell.numFmt = '#,##0.00;[Red](#,##0.00)'; 
              cell.border = borderStyle;
          });
      };

      const setupSheet = (name, title) => {
        const sheet = wb.addWorksheet(name);
        const cols = [{ width: 45 }]; 
        periods.forEach(() => cols.push({ width: 22 })); 
        sheet.columns = cols;
        
        styleHeader(sheet.getCell('A1'), companyName, true);
        sheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF214573' } };
        sheet.getCell('A2').value = dbaName; 
        sheet.getCell('A2').font = { italic: true };
        sheet.getCell('A3').value = subtitleText; 
        sheet.getCell('A3').font = { bold: true };
        sheet.getCell('A5').value = `${titlePrefix}${title}`;
        sheet.getCell('A5').font = { bold: true, size: 12, color: { argb: 'FFEDA340' } };
        
        const headerRow = sheet.getRow(7);
        headerRow.getCell(1).value = 'ACCOUNT / ITEM';
        periods.forEach((p, idx) => { 
          headerRow.getCell(idx + 2).value = p; 
        });
        
        for(let col = 1; col <= periods.length + 1; col++) {
            const cell = headerRow.getCell(col);
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF214573' } };
            cell.alignment = { horizontal: col === 1 ? 'left' : 'right', vertical: 'middle' };
            cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        }
        return sheet;
      };

      // SPL Sheet
      const splSheet = setupSheet('Comprehensive Income', 'STATEMENT OF COMPREHENSIVE INCOME');
      let r = writeSection(splSheet, 'REVENUES', splData.revenues, 8);
      writeStyledTotal(splSheet, r.nextRow, 'Total Revenues', r.formulas);
      
      let cogs = writeSection(splSheet, 'COST OF SALES', splData.cogs, r.nextRow + 2);
      writeStyledTotal(splSheet, cogs.nextRow, 'Total Cost of Sales', cogs.formulas);
      
      const gpRow = cogs.nextRow + 2;
      const gpFormulas = periods.map((_, i) => `${String.fromCharCode(66+i)}${r.nextRow}-${String.fromCharCode(66+i)}${cogs.nextRow}`);
      writeStyledTotal(splSheet, gpRow, 'Gross Profit', gpFormulas);
      
      let exp = writeSection(splSheet, 'OPERATING EXPENSES', splData.expenses, gpRow + 2);
      writeStyledTotal(splSheet, exp.nextRow, 'Total Expenses', exp.formulas);
      
      const niRow = exp.nextRow + 2;
      const niFormulas = periods.map((_, i) => `${String.fromCharCode(66+i)}${gpRow}-${String.fromCharCode(66+i)}${exp.nextRow}`);
      writeStyledTotal(splSheet, niRow, 'Net Income / (Loss)', niFormulas);
      
      let oci = writeSection(splSheet, 'OTHER COMPREHENSIVE INCOME', splData.oci, niRow + 2);
      writeStyledTotal(splSheet, oci.nextRow, 'Total Other Comprehensive Income', oci.formulas);
      
      const compIncRow = oci.nextRow + 2;
      const compFormulas = periods.map((_, i) => `${String.fromCharCode(66+i)}${niRow}+${String.fromCharCode(66+i)}${oci.nextRow}`);
      writeStyledTotal(splSheet, compIncRow, 'COMPREHENSIVE INCOME', compFormulas, true);

      // SCE Sheet
      const sceSheet = setupSheet('Changes in Equity', 'STATEMENT OF CHANGES IN EQUITY');
      sceSheet.getCell('A8').value = 'Beginning Capital Balance';
      periods.forEach((p, i) => { 
        sceSheet.getCell(8, i+2).value = Number(financials[p]?.begCap) || 0; 
      });
      
      sceSheet.getCell('A9').value = 'Add: Net Income';
      periods.forEach((p, i) => { 
        sceSheet.getCell(9, i+2).value = { formula: `'Comprehensive Income'!${String.fromCharCode(66+i)}${niRow}` }; 
      });
      
      sceSheet.getCell('A10').value = 'Add: Other Comprehensive Income';
      periods.forEach((p, i) => { 
        sceSheet.getCell(10, i+2).value = { formula: `'Comprehensive Income'!${String.fromCharCode(66+i)}${oci.nextRow}` }; 
      });
      
      let inv = writeSection(sceSheet, 'ADDITIONS', sceData.investments, 12);
      let div = writeSection(sceSheet, 'DEDUCTIONS (DIVIDENDS)', sceData.dividends, inv.nextRow + 2);
      
      const eqRow = div.nextRow + 2;
      const eqFormulas = periods.map((_, i) => {
         const col = String.fromCharCode(66+i);
         return `${col}8+${col}9+${col}10+${inv.formulas[i]}-${div.formulas[i]}`;
      });
      writeStyledTotal(sceSheet, eqRow, 'ENDING CAPITAL (EQUITY)', eqFormulas, true);

      // CF Sheet
      const cfSheet = setupSheet('Cash Flows', 'STATEMENT OF CASH FLOWS');
      cfSheet.getCell('A8').value = 'Beginning Cash Balance';
      periods.forEach((p, i) => { 
        cfSheet.getCell(8, i+2).value = Number(financials[p]?.begCash) || 0; 
      });
      
      cfSheet.getCell('A10').value = 'CASH FLOWS FROM OPERATING ACTIVITIES';
      cfSheet.getCell('A10').font = { bold: true, color: { argb: 'FF091D38' } }; 
      cfSheet.getCell('A11').value = 'Net Income';
      periods.forEach((p, i) => { 
        cfSheet.getCell(11, i+2).value = { formula: `'Comprehensive Income'!${String.fromCharCode(66+i)}${niRow}` }; 
      });
      
      let op = writeSection(cfSheet, 'ADJUSTMENTS', cfData.operating, 12);
      const opSumFormulas = periods.map((_, i) => `${String.fromCharCode(66+i)}11+${op.formulas[i]}`);
      writeStyledTotal(cfSheet, op.nextRow, 'Net Cash from Operating Activities', opSumFormulas);
      
      let invCF = writeSection(cfSheet, 'CASH FLOWS FROM INVESTING', cfData.investing, op.nextRow + 2);
      writeStyledTotal(cfSheet, invCF.nextRow, 'Net Cash from Investing Activities', invCF.formulas);
      
      let finCF = writeSection(cfSheet, 'CASH FLOWS FROM FINANCING', cfData.financing, invCF.nextRow + 2);
      
      const divRow = finCF.nextRow;
      cfSheet.getCell(`A${divRow}`).value = 'Less: Dividends Paid';
      periods.forEach((p, i) => { 
        cfSheet.getCell(divRow, i+2).value = { formula: `-'Changes in Equity'!${String.fromCharCode(66+i)}${div.nextRow}` }; 
      });
      
      const finSumFormulas = periods.map((_, i) => `${finCF.formulas[i]}+${String.fromCharCode(66+i)}${divRow}`);
      const finSumRow = divRow + 1;
      writeStyledTotal(cfSheet, finSumRow, 'Net Cash from Financing Activities', finSumFormulas);
      
      const netCashRow = finSumRow + 2;
      const netCashFormulas = periods.map((_, i) => `${String.fromCharCode(66+i)}${op.nextRow}+${String.fromCharCode(66+i)}${invCF.nextRow}+${String.fromCharCode(66+i)}${finSumRow}`);
      writeStyledTotal(cfSheet, netCashRow, 'Net Increase (Decrease) in Cash', netCashFormulas);
      
      const endCashRow = netCashRow + 2;
      const endCashFormulas = periods.map((_, i) => `${String.fromCharCode(66+i)}8+${String.fromCharCode(66+i)}${netCashRow}`);
      writeStyledTotal(cfSheet, endCashRow, 'ENDING CASH BALANCE', endCashFormulas, true);

      // BS Sheet
      const bsSheet = setupSheet('Financial Position', 'STATEMENT OF FINANCIAL POSITION');
      bsSheet.getCell('A8').value = 'ASSETS'; 
      bsSheet.getCell('A8').font = { bold: true, size: 12, color: { argb: 'FFEDA340' } };
      
      bsSheet.getCell('A9').value = 'Cash & Equivalents';
      periods.forEach((p, i) => { 
        bsSheet.getCell(9, i+2).value = { formula: `'Cash Flows'!${String.fromCharCode(66+i)}${endCashRow}` }; 
      });
      
      let ca = writeSection(bsSheet, 'CURRENT ASSETS', bsData.currentAssets, 10);
      const caSumFormulas = periods.map((_, i) => `${String.fromCharCode(66+i)}9+${ca.formulas[i]}`);
      writeStyledTotal(bsSheet, ca.nextRow, 'Total Current Assets', caSumFormulas);
      
      let nca = writeSection(bsSheet, 'NONCURRENT ASSETS', bsData.nonCurrentAssets, ca.nextRow + 2);
      writeStyledTotal(bsSheet, nca.nextRow, 'Total Noncurrent Assets', nca.formulas);
      
      const totAssetsRow = nca.nextRow + 2;
      const taFormulas = periods.map((_, i) => `${String.fromCharCode(66+i)}${ca.nextRow}+${String.fromCharCode(66+i)}${nca.nextRow}`);
      writeStyledTotal(bsSheet, totAssetsRow, 'TOTAL ASSETS', taFormulas, true);
      
      const liabRow = totAssetsRow + 2;
      bsSheet.getCell(`A${liabRow}`).value = 'LIABILITIES AND EQUITY'; 
      bsSheet.getCell(`A${liabRow}`).font = { bold: true, size: 12, color: { argb: 'FFEDA340' } };
      
      let cl = writeSection(bsSheet, 'CURRENT LIABILITIES', bsData.currentLiabilities, liabRow + 1);
      writeStyledTotal(bsSheet, cl.nextRow, 'Total Current Liabilities', cl.formulas);
      
      let ncl = writeSection(bsSheet, 'NONCURRENT LIABILITIES', bsData.nonCurrentLiabilities, cl.nextRow + 2);
      writeStyledTotal(bsSheet, ncl.nextRow, 'Total Noncurrent Liabilities', ncl.formulas);
      
      const totLiabRow = ncl.nextRow + 2;
      const tlFormulas = periods.map((_, i) => `${String.fromCharCode(66+i)}${cl.nextRow}+${String.fromCharCode(66+i)}${ncl.nextRow}`);
      writeStyledTotal(bsSheet, totLiabRow, 'TOTAL LIABILITIES', tlFormulas);
      
      const eqBsRow = totLiabRow + 2;
      bsSheet.getCell(`A${eqBsRow}`).value = 'Total Capital / Retained Earnings';
      periods.forEach((p, i) => { 
        bsSheet.getCell(eqBsRow, i+2).value = { formula: `'Changes in Equity'!${String.fromCharCode(66+i)}${eqRow}` }; 
      });
      
      const tleRow = eqBsRow + 2;
      const tleFormulas = periods.map((_, i) => `${String.fromCharCode(66+i)}${totLiabRow}+${String.fromCharCode(66+i)}${eqBsRow}`);
      writeStyledTotal(bsSheet, tleRow, 'TOTAL LIABILITIES & EQUITY', tleFormulas, true);

      // (Other exports like Tax and Payroll remain functionally isolated to their specific use cases)
      
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); 
      a.href = url; 
      a.download = `${companyName.replace(/[^a-z0-9]/gi, '_')}_Financials.xlsx`; 
      a.click(); 
      URL.revokeObjectURL(url);
    } catch (error) { 
      console.error('Export failed', error); 
      alert('Failed to export to Excel.'); 
    } finally { 
      setIsExportingExcel(false); 
    }
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4 relative bg-cover bg-center" style={{ backgroundImage: "url('/background.jpg')" }}>
        <div className="absolute inset-0 bg-blueVelvet/80 z-0"></div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-2xl max-w-md w-full text-slate-800 dark:text-slate-100 relative z-10">
            <div className="flex flex-col items-center justify-center mb-6 text-center">
              <img src="/logo-1.png" alt="Xeia Finance Logo" className="h-20 w-auto object-contain mb-3" />
              <h1 className="text-3xl font-bold text-blueVelvet dark:text-goldenYellow mb-1">Xeia Finance</h1>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Powered and Owned by Jaynard L. Monleon</p>
            </div>
            <h2 className="text-center font-semibold mb-6">Authorized Access Only</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Lock size={18}/>
                </span>
                <input 
                  type="text" 
                  value={loginName ?? ''} 
                  onChange={(e) => setLoginName(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blueJeans" 
                  placeholder="Enter authorized name..." 
                  autoComplete="off" 
                />
              </div>
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button type="submit" className="w-full bg-tangerine hover:opacity-90 text-white font-bold py-2.5 rounded-md transition-opacity">
              Access System
            </button>
            <div className="mt-4 flex items-center justify-between">
              <span className="w-1/5 border-b border-slate-300 dark:border-slate-600"></span>
              <span className="text-xs text-center text-slate-500 uppercase">Or continue with</span>
              <span className="w-1/5 border-b border-slate-300 dark:border-slate-600"></span>
            </div>
            <button 
              type="button" 
              onClick={handleGoogleLogin} 
              className="mt-4 w-full bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold py-2.5 rounded-md transition-colors border border-slate-300 dark:border-slate-600 flex items-center justify-center gap-2"
            >
               <svg className="w-5 h-5" viewBox="0 0 24 24">
                 <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                 <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                 <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                 <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
               </svg>
               Sign in with Google
            </button>
          </form>
        </div>
        <p className="mt-8 text-xs text-center max-w-2xl opacity-70 leading-relaxed px-4 text-white">
          {LEGAL_DISCLAIMER}
        </p>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className={`min-h-screen font-sans pb-20 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 relative`}>

        {/* --- LIVE CHAT WIDGET --- */}
        {isAuthenticated && (
          <div className={`fixed bottom-4 left-4 z-50 flex flex-col ${isChatOpen ? 'w-80 h-96' : 'w-auto h-auto'}`}>
             {isChatOpen ? (
                <div className="flex-1 bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col overflow-hidden">
                   <div className="bg-blueVelvet text-white p-3 flex justify-between items-center cursor-pointer hover:bg-blue-900 transition-colors" onClick={() => setIsChatOpen(false)}>
                      <span className="font-bold text-sm flex items-center gap-2">
                        <MessageSquare size={16}/> Team Chat
                      </span>
                      <PanelRightClose size={16} />
                   </div>
                   <div className="flex-1 p-3 overflow-y-auto bg-slate-50 dark:bg-slate-900 flex flex-col gap-3">
                      {chatMessages.map(msg => {
                         const myPresenceId = `${user?.uid}_${deviceId.current}`;
                         const isMe = msg.senderId === myPresenceId || (!msg.senderId && msg.sender === loginName);
                         const senderOnlineUser = onlineUsers.find(ou => ou.id === msg.senderId);
                         const displayN = isMe ? displayName : (senderOnlineUser ? senderOnlineUser.name : msg.sender);
                         
                         return (
                           <div key={msg.id} className={`max-w-[85%] rounded-lg p-2 text-sm shadow-sm ${isMe ? 'bg-blueJeans text-white self-end rounded-br-none' : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 self-start rounded-bl-none'}`}>
                              <div className="text-[10px] opacity-70 mb-0.5 font-bold flex justify-between items-center">
                                <span>{displayN}</span>
                              </div>
                              <div className="leading-snug">{msg.text}</div>
                           </div>
                         );
                      })}
                      {chatMessages.length === 0 && (
                        <div className="text-center text-xs text-slate-400 mt-10">No messages yet. Start the conversation!</div>
                      )}
                   </div>
                   <form onSubmit={handleSendMessage} className="p-2 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                      <input 
                        type="text" 
                        value={chatInput} 
                        onChange={e => setChatInput(e.target.value)} 
                        className="flex-1 bg-slate-100 dark:bg-slate-700 rounded px-3 py-1.5 text-sm focus:outline-none dark:text-white" 
                        placeholder="Type a message..."
                      />
                      <button type="submit" disabled={!chatInput.trim()} className="bg-tangerine disabled:opacity-50 text-white p-1.5 rounded hover:opacity-90 transition-opacity">
                        <Send size={16}/>
                      </button>
                   </form>
                </div>
             ) : (
                <button onClick={() => setIsChatOpen(true)} className="bg-blueVelvet hover:bg-blue-900 text-white p-3 rounded-full shadow-xl flex items-center gap-2 transition-transform hover:scale-105 relative">
                   <MessageSquare size={24} />
                   {chatMessages.length > 0 && <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-tangerine rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>}
                </button>
             )}
          </div>
        )}

        {/* --- FLOATING PERIOD MANAGER & NOTES PANEL --- */}
        <div className={`fixed top-24 right-0 h-[70vh] bg-white dark:bg-slate-800 shadow-[0_0_15px_rgba(0,0,0,0.1)] border-l border-y border-slate-200 dark:border-slate-700 transition-transform duration-300 z-40 rounded-l-xl flex flex-col ${isNotesOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ width: '320px' }}>
          <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-tl-xl">
             <span className="font-bold text-sm flex items-center gap-2 text-blueVelvet dark:text-goldenYellow">
               <Archive size={16}/> Periods & Notes
             </span>
             <button onClick={() => setIsNotesOpen(false)} className="text-slate-500 hover:text-red-500 transition-colors">
               <PanelRightClose size={18}/>
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Manage Financial Periods</h3>
            <div className="space-y-2 mb-6">
              {periods.map((p, idx) => (
                <div key={p} className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 p-2 rounded">
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{p}</span>
                  <div className="flex items-center gap-1">
                     <button onClick={() => movePeriod(idx, 'up')} disabled={idx === 0} className="p-1 text-slate-400 hover:text-blueJeans disabled:opacity-30">
                       <ArrowUp size={14}/>
                     </button>
                     <button onClick={() => movePeriod(idx, 'down')} disabled={idx === periods.length - 1} className="p-1 text-slate-400 hover:text-blueJeans disabled:opacity-30">
                       <ArrowDown size={14}/>
                     </button>
                     <button onClick={() => handleDeletePeriod(p)} className="p-1 ml-2 text-slate-400 hover:text-red-500">
                       <Trash2 size={14}/>
                     </button>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="text" 
                  value={newPeriodInput} 
                  onChange={e => setNewPeriodInput(e.target.value)} 
                  placeholder="New Period (e.g. 2025)" 
                  className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm focus:outline-blueJeans" 
                />
                <button onClick={handleAddPeriod} className="bg-blueJeans text-white px-3 py-1.5 rounded font-bold text-sm hover:opacity-90 transition-opacity">
                  Add
                </button>
              </div>
              <p className="text-[10px] text-slate-400 italic mt-1 leading-tight">Order defines chronological sequence (Beginning balances pull from previous period's ending balance).</p>
            </div>

            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Adjustments & Notes</h3>
            <textarea 
              value={notesText} 
              onChange={e => setNotesText(e.target.value)} 
              className="w-full flex-1 p-3 resize-none bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 rounded focus:outline-none text-sm dark:text-slate-200" 
              placeholder="Jot down assumptions, goal changes, or target figures here. This data saves with your backup file and syncs with your team."
            ></textarea>
          </div>
        </div>

        {!isNotesOpen && (
           <button onClick={() => setIsNotesOpen(true)} className="fixed top-1/3 right-0 bg-tangerine hover:bg-orange-600 text-white p-2 rounded-l-md shadow-lg z-40 transition-colors flex items-center gap-2 pr-4">
             <CalendarDays size={20} /> 
             <span className="text-xs font-bold whitespace-nowrap">Periods/Notes</span>
           </button>
        )}
        
        {/* Top Header */}
        <header className={`bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between overflow-visible">
            <div className="flex items-center gap-3 mr-4">
              <img src="/logo-1.png" alt="Xeia Finance Logo" className="h-10 w-auto object-contain shrink-0" />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-blueVelvet dark:text-goldenYellow whitespace-nowrap leading-tight">Xeia Finance</h1>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Powered and Owned by Jaynard L. Monleon</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative cursor-pointer" ref={presenceDropdownRef}>
                 <div onClick={() => setIsPresenceOpen(!isPresenceOpen)} className="flex items-center gap-1.5 mr-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 px-3 py-1 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {onlineUsers.length + 1} Online
                 </div>
                 {isPresenceOpen && (
                 <div className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 p-3 cursor-default">
                    <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Active Collaborators</div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                       <div className="flex flex-col p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800/30 group/item">
                          {isEditingName ? (
                            <form 
                              onSubmit={(e) => { 
                                e.preventDefault(); 
                                setDisplayName(newNameInput.trim() || loginName); 
                                setIsEditingName(false); 
                              }} 
                              className="flex items-center mb-1"
                            >
                              <input 
                                autoFocus 
                                type="text" 
                                value={newNameInput} 
                                onChange={e => setNewNameInput(e.target.value)} 
                                onBlur={() => { 
                                  setDisplayName(newNameInput.trim() || loginName); 
                                  setIsEditingName(false); 
                                }} 
                                className="w-full text-xs px-1.5 py-0.5 border border-slate-300 rounded focus:outline-none dark:bg-slate-800 dark:text-white dark:border-slate-600" 
                              />
                            </form>
                          ) : (
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-blueJeans dark:text-goldenYellow">{displayName} (You)</span>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setIsEditingName(true); 
                                  setNewNameInput(displayName); 
                                }} 
                                className="text-slate-400 hover:text-blueJeans dark:hover:text-goldenYellow opacity-0 group-hover/item:opacity-100 transition-opacity"
                              >
                                <Edit2 size={12}/>
                              </button>
                            </div>
                          )}
                          <span className="text-[10px] text-slate-500 font-medium">Tab: <span className="uppercase text-slate-700 dark:text-slate-300">{activeTab}</span></span>
                          {activeField && <span className="text-[10px] text-slate-500 font-medium text-tangerine truncate">Editing: {activeField}</span>}
                       </div>
                       {onlineUsers.map(u => (
                          <div key={u.id} className="flex flex-col p-2 bg-slate-50 dark:bg-slate-700/30 rounded border border-slate-100 dark:border-slate-600/50">
                             <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{u.name}</span>
                             <span className="text-[10px] text-slate-500 font-medium">Tab: <span className="uppercase text-slate-700 dark:text-slate-300">{u.tab}</span></span>
                             {u.field && <span className="text-[10px] text-slate-500 font-medium text-tangerine truncate">Editing: {u.field}</span>}
                          </div>
                       ))}
                    </div>
                 </div>
                 )}
              </div>

              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" 
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={18} className={`text-goldenYellow`} /> : <Moon size={18} className={`text-blueVelvet`} />}
              </button>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>

              <button 
                onClick={() => setIsConsolidated(!isConsolidated)} 
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
              >
                {isConsolidated ? <CheckSquare className={`text-tangerine`} size={16}/> : <Square className="text-slate-400" size={16}/>} 
                Consolidated
              </button>
              
              <select 
                value={currency ?? ''} 
                onChange={(e) => setCurrency(e.target.value)} 
                className="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm rounded-md px-2 py-1.5 focus:outline-none cursor-pointer"
              >
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>

              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
              
              <div className="flex gap-2 relative">
                 <button 
                   onClick={handleSaveSession} 
                   className={`flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 text-blueVelvet dark:text-slate-200 hover:bg-slate-200 px-3 py-1.5 rounded-md border border-slate-300 font-medium text-sm transition-all`}
                 >
                    <Save size={16} /> Save Backup 
                 </button>
                 <label className={`flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 text-blueVelvet dark:text-slate-200 hover:bg-slate-200 px-3 py-1.5 rounded-md border border-slate-300 font-medium text-sm transition-all cursor-pointer`}>
                    <Upload size={16} /> Load Backup
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleLoadSession} 
                      accept=".xeia,.json" 
                      className="hidden" 
                    />
                 </label>
              </div>
              <button 
                onClick={exportToExcel} 
                disabled={isExportingExcel} 
                className={`flex items-center gap-1.5 bg-goldStars/10 text-goldStars hover:bg-goldStars/20 px-4 py-1.5 rounded-md border border-goldStars/30 font-bold text-sm transition-all ml-2`}
              >
                <FileSpreadsheet size={16} /> Export to Excel 
              </button>
            </div>
          </div>
        </header>

        <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8`}>
          
          <div className="flex flex-wrap gap-1 mb-6 border-b border-slate-200 dark:border-slate-700 pb-px">
            {[
              { id: 'balance', icon: Building2, label: 'Financial Position' },
              { id: 'spl', icon: FileText, label: 'Comp. Income' },
              { id: 'sce', icon: PieChart, label: 'Changes in Equity' },
              { id: 'cashflow', icon: DollarSign, label: 'Cash Flows' },
              { id: 'ratios', icon: LineChart, label: 'Analysis & Ratios' },
              { id: 'tax', icon: Receipt, label: 'BIR Taxes' },
              { id: 'payroll', icon: Users, label: 'Payroll' },
              { id: 'costing', icon: Package, label: 'Prod. Costing' },
              { id: 'forecast', icon: TrendingUp, label: 'Sales Forecast' },
              { id: 'depreciation', icon: Archive, label: 'Depreciation' },
            ].map((tab) => (
              <button
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium transition-colors text-sm whitespace-nowrap relative ${
                  activeTab === tab.id 
                    ? `bg-white dark:bg-slate-800 text-tangerine border-t-[3px] border-t-tangerine border-l border-r border-slate-200 dark:border-slate-700 shadow-[0_4px_0_0_white] dark:shadow-[0_4px_0_0_#1e293b] -mb-[1px] z-10` 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-t-[3px] border-transparent'
                }`}
              >
                <tab.icon size={16} /> {tab.label}
                <div className="flex -space-x-1 ml-1.5">
                   {onlineUsers.filter(u => u.tab === tab.id).map((u, idx) => {
                      return (
                        <div 
                          key={idx} 
                          className="h-5 w-5 rounded-full bg-tangerine text-[9px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm" 
                          title={`${u.name} is currently editing ${u.field ? `'${u.field}'` : 'this tab'}`}
                        >
                           {u.name.charAt(0).toUpperCase()}
                        </div>
                      );
                   })}
                </div>
              </button>
            ))}
          </div>

          <div className={`bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-8 rounded-b-lg rounded-tr-lg min-h-[800px] relative z-0`}>
            
            {/* View/Edit Period Controls */}
            {(activeTab !== 'tax' && activeTab !== 'payroll' && activeTab !== 'costing' && activeTab !== 'forecast' && activeTab !== 'depreciation') && (
              <div className="flex gap-6 items-center bg-blueJeans/5 dark:bg-blueJeans/20 p-3 rounded-lg mb-8 border border-blueJeans/20 dark:border-blueJeans/40">
                 <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-blueVelvet dark:text-slate-200">Data View/Edit Period:</span>
                    <select 
                      value={activePeriod} 
                      onChange={e => setActivePeriod(e.target.value)} 
                      className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-bold text-blueJeans dark:text-goldenYellow rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blueJeans cursor-pointer shadow-sm"
                    >
                      {periods.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                 </div>
                 
                 <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-2"></div>
                 
                 <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-700 dark:text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={isComparisonMode} 
                      onChange={e => setIsComparisonMode(e.target.checked)} 
                      className="rounded border-slate-300 text-blueJeans focus:ring-blueJeans accent-blueJeans w-4 h-4 cursor-pointer" 
                    />
                    Comparison Mode
                 </label>
                 
                 {isComparisonMode && (
                   <div className="flex items-center gap-3 ml-2">
                      <span className="font-bold text-sm text-slate-500 dark:text-slate-400">Compare With:</span>
                      <select 
                        value={comparePeriod} 
                        onChange={e => setComparePeriod(e.target.value)} 
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-sm"
                      >
                        {periods.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                   </div>
                 )}
              </div>
            )}

            {(activeTab !== 'tax' && activeTab !== 'payroll' && activeTab !== 'costing' && activeTab !== 'forecast' && activeTab !== 'depreciation') && (
              <div className="mb-6">
                <input 
                  type="text" 
                  value={companyName ?? ''} 
                  onChange={(e) => setCompanyName(e.target.value)} 
                  className={`text-2xl font-bold uppercase tracking-wide bg-transparent border-none focus:outline-none w-full ${isDarkMode ? `text-goldenYellow` : `text-blueVelvet`}`} 
                  placeholder="COMPANY NAME" 
                />
                <input 
                  type="text" 
                  value={dbaName ?? ''} 
                  onChange={(e) => setDbaName(e.target.value)} 
                  className="text-sm tracking-wide bg-transparent border-none focus:outline-none w-full text-slate-600 dark:text-slate-400" 
                  placeholder="Doing business under..." 
                />
                {isConsolidated && (
                  <div className={`text-sm font-bold uppercase tracking-wide border-b-[1.5px] border-slate-800 dark:border-slate-300 w-full text-slate-800 dark:text-slate-300 inline-block`}>
                    AND SUBSIDIARIES
                  </div>
                )}
                
                <h2 className="text-lg font-bold uppercase mt-4 mb-0">
                  {titlePrefix}
                  {activeTab === 'spl' && 'STATEMENTS OF COMPREHENSIVE INCOME'}
                  {activeTab === 'sce' && 'STATEMENTS OF CHANGES IN EQUITY'}
                  {activeTab === 'balance' && 'STATEMENTS OF FINANCIAL POSITION'}
                  {activeTab === 'cashflow' && 'STATEMENTS OF CASH FLOWS'}
                  {activeTab === 'ratios' && 'FINANCIAL ANALYSIS & RATIOS'}
                </h2>
                <p className="text-xs italic text-slate-500 mb-2">(Amounts in {currency})</p>
              </div>
            )}

            {/* Top Period Labels for Tables */}
            {(activeTab === 'spl' || activeTab === 'sce' || activeTab === 'cashflow') && (
              <div className={`flex justify-end border-b-[1.5px] border-slate-800 dark:border-slate-300 pb-1 gap-4 mb-4`}>
                 <div className="w-28 text-right font-bold text-sm text-blueJeans dark:text-goldenYellow">{activePeriod}</div>
                 {isComparisonMode && (
                   <div className="w-28 text-right font-bold text-sm text-slate-600 dark:text-slate-300">{comparePeriod}</div>
                 )}
                 <div className="w-5" />
              </div>
            )}

            {/* 1. FINANCIAL POSITION */}
            {activeTab === 'balance' && (
              <div className="mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
                  <div>
                    <div className="flex justify-end border-b-[1.5px] border-slate-800 dark:border-slate-300 pb-1 gap-4">
                      <div className="w-28 text-right font-bold text-sm text-blueJeans dark:text-goldenYellow">{activePeriod}</div>
                      {isComparisonMode && (
                        <div className="w-28 text-right font-bold text-sm text-slate-600 dark:text-slate-300">{comparePeriod}</div>
                      )}
                      <div className="w-5" />
                    </div>

                    <SectionHeader isDarkMode={isDarkMode} title="ASSETS" />
                    <div className="font-semibold text-xs text-slate-700 dark:text-slate-400 mb-1 mt-2">Current Assets</div>
                    <LinkedRow 
                      isDarkMode={isDarkMode} 
                      currencySymbolStr={currencySymbolStr} 
                      isComparisonMode={isComparisonMode} 
                      label="Cash & Equivalents" 
                      amount1={finActive?.endCash} 
                      amount2={finCompare?.endCash} 
                    />
                    <DynamicList 
                      activePeriod={activePeriod} 
                      comparePeriod={comparePeriod} 
                      isComparisonMode={isComparisonMode} 
                      currencySymbolStr={currencySymbolStr} 
                      items={bsData.currentAssets} 
                      category="currentAssets" 
                      setState={setBsData} 
                    />
                    <TotalRow 
                      isDarkMode={isDarkMode} 
                      currencySymbolStr={currencySymbolStr} 
                      isComparisonMode={isComparisonMode} 
                      label="Total Current Assets" 
                      amount1={finActive?.ca} 
                      amount2={finCompare?.ca} 
                    />

                    <div className="font-semibold text-xs text-slate-700 dark:text-slate-400 mb-1 mt-6">Noncurrent Assets</div>
                    <DynamicList 
                      activePeriod={activePeriod} 
                      comparePeriod={comparePeriod} 
                      isComparisonMode={isComparisonMode} 
                      currencySymbolStr={currencySymbolStr} 
                      items={bsData.nonCurrentAssets} 
                      category="nonCurrentAssets" 
                      setState={setBsData} 
                    />
                    <TotalRow 
                      isDarkMode={isDarkMode} 
                      currencySymbolStr={currencySymbolStr} 
                      isComparisonMode={isComparisonMode} 
                      label="Total Noncurrent Assets" 
                      amount1={finActive?.nca} 
                      amount2={finCompare?.nca} 
                    />
                    
                    <div className="mt-8">
                      <TotalRow 
                        isDarkMode={isDarkMode} 
                        currencySymbolStr={currencySymbolStr} 
                        isComparisonMode={isComparisonMode} 
                        label="TOTAL ASSETS" 
                        amount1={finActive?.ta} 
                        amount2={finCompare?.ta} 
                        isFinal 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-end border-b-[1.5px] border-slate-800 dark:border-slate-300 pb-1 gap-4">
                      <div className="w-28 text-right font-bold text-sm text-blueJeans dark:text-goldenYellow">{activePeriod}</div>
                      {isComparisonMode && (
                        <div className="w-28 text-right font-bold text-sm text-slate-600 dark:text-slate-300">{comparePeriod}</div>
                      )}
                      <div className="w-5" />
                    </div>

                    <SectionHeader isDarkMode={isDarkMode} title="LIABILITIES AND EQUITY" />
                    <div className="font-semibold text-xs text-slate-700 dark:text-slate-400 mb-1 mt-2">Current Liabilities</div>
                    <DynamicList 
                      activePeriod={activePeriod} 
                      comparePeriod={comparePeriod} 
                      isComparisonMode={isComparisonMode} 
                      currencySymbolStr={currencySymbolStr} 
                      items={bsData.currentLiabilities} 
                      category="currentLiabilities" 
                      setState={setBsData} 
                    />
                    <TotalRow 
                      isDarkMode={isDarkMode} 
                      currencySymbolStr={currencySymbolStr} 
                      isComparisonMode={isComparisonMode} 
                      label="Total Current Liabilities" 
                      amount1={finActive?.cl} 
                      amount2={finCompare?.cl} 
                    />

                    <div className="font-semibold text-xs text-slate-700 dark:text-slate-400 mb-1 mt-6">Noncurrent Liabilities</div>
                    <DynamicList 
                      activePeriod={activePeriod} 
                      comparePeriod={comparePeriod} 
                      isComparisonMode={isComparisonMode} 
                      currencySymbolStr={currencySymbolStr} 
                      items={bsData.nonCurrentLiabilities} 
                      category="nonCurrentLiabilities" 
                      setState={setBsData} 
                    />
                    <TotalRow 
                      isDarkMode={isDarkMode} 
                      currencySymbolStr={currencySymbolStr} 
                      isComparisonMode={isComparisonMode} 
                      label="Total Noncurrent Liabilities" 
                      amount1={finActive?.ncl} 
                      amount2={finCompare?.ncl} 
                    />
                    <TotalRow 
                      isDarkMode={isDarkMode} 
                      currencySymbolStr={currencySymbolStr} 
                      isComparisonMode={isComparisonMode} 
                      label="Total Liabilities" 
                      amount1={finActive?.tl} 
                      amount2={finCompare?.tl} 
                    />

                    <div className="font-semibold text-xs text-slate-700 dark:text-slate-400 mb-1 mt-6">Equity</div>
                    <LinkedRow 
                      isDarkMode={isDarkMode} 
                      currencySymbolStr={currencySymbolStr} 
                      isComparisonMode={isComparisonMode} 
                      label="Total Capital (Retained Earnings)" 
                      amount1={finActive?.endEq} 
                      amount2={finCompare?.endEq} 
                    />
                    
                    <div className="mt-8">
                      <TotalRow 
                        isDarkMode={isDarkMode} 
                        currencySymbolStr={currencySymbolStr} 
                        isComparisonMode={isComparisonMode} 
                        label="TOTAL LIABILITIES & EQUITY" 
                        amount1={finActive?.tle} 
                        amount2={finCompare?.tle} 
                        isFinal 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SPL */}
            {activeTab === 'spl' && (
              <div className="mb-16">
                <SectionHeader isDarkMode={isDarkMode} title="Revenues" />
                <DynamicList 
                  activePeriod={activePeriod} 
                  comparePeriod={comparePeriod} 
                  isComparisonMode={isComparisonMode} 
                  currencySymbolStr={currencySymbolStr} 
                  items={splData.revenues} 
                  category="revenues" 
                  setState={setSplData} 
                />
                <TotalRow 
                  isDarkMode={isDarkMode} 
                  currencySymbolStr={currencySymbolStr} 
                  isComparisonMode={isComparisonMode} 
                  label="Total Revenues" 
                  amount1={finActive?.rev} 
                  amount2={finCompare?.rev} 
                />

                <SectionHeader isDarkMode={isDarkMode} title="Cost of Sales" />
                <DynamicList 
                  activePeriod={activePeriod} 
                  comparePeriod={comparePeriod} 
                  isComparisonMode={isComparisonMode} 
                  currencySymbolStr={currencySymbolStr} 
                  items={splData.cogs} 
                  category="cogs" 
                  setState={setSplData} 
                  isDeductible 
                />
                <TotalRow 
                  isDarkMode={isDarkMode} 
                  currencySymbolStr={currencySymbolStr} 
                  isComparisonMode={isComparisonMode} 
                  label="Gross Profit" 
                  amount1={finActive?.gp} 
                  amount2={finCompare?.gp} 
                />

                <SectionHeader isDarkMode={isDarkMode} title="Operating Expenses" />
                <DynamicList 
                  activePeriod={activePeriod} 
                  comparePeriod={comparePeriod} 
                  isComparisonMode={isComparisonMode} 
                  currencySymbolStr={currencySymbolStr} 
                  items={splData.expenses} 
                  category="expenses" 
                  setState={setSplData} 
                  isDeductible 
                />
                
                <TotalRow 
                  isDarkMode={isDarkMode} 
                  currencySymbolStr={currencySymbolStr} 
                  isComparisonMode={isComparisonMode} 
                  label="Net Income / (Loss)" 
                  amount1={finActive?.ni} 
                  amount2={finCompare?.ni} 
                />

                <SectionHeader isDarkMode={isDarkMode} title="Other Comprehensive Income" />
                <DynamicList 
                  activePeriod={activePeriod} 
                  comparePeriod={comparePeriod} 
                  isComparisonMode={isComparisonMode} 
                  currencySymbolStr={currencySymbolStr} 
                  items={splData.oci} 
                  category="oci" 
                  setState={setSplData} 
                />
                <TotalRow 
                  isDarkMode={isDarkMode} 
                  currencySymbolStr={currencySymbolStr} 
                  isComparisonMode={isComparisonMode} 
                  label="Total Other Comprehensive Income" 
                  amount1={finActive?.oci} 
                  amount2={finCompare?.oci} 
                />

                <div className="mt-8">
                  <TotalRow 
                    isDarkMode={isDarkMode} 
                    currencySymbolStr={currencySymbolStr} 
                    isComparisonMode={isComparisonMode} 
                    label="Comprehensive Income" 
                    amount1={finActive?.compInc} 
                    amount2={finCompare?.compInc} 
                    isFinal 
                  />
                </div>
              </div>
            )}

            {/* 3. SCE */}
            {activeTab === 'sce' && (
              <div className="mb-16">
                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700 mb-4 bg-slate-50 dark:bg-slate-800/30 px-3 rounded">
                  <span className="font-bold text-sm">
                    Beginning Capital Balance 
                    <span className="text-[10px] text-slate-500 font-normal block">Auto-cascades after Period 1</span>
                  </span>
                  <div className="flex gap-4">
                    {periods.indexOf(activePeriod) === 0 ? (
                      <CurrencyInput 
                        value={sceData.beginningCapital?.[activePeriod] || 0} 
                        onChange={v => setSceData({...sceData, beginningCapital: {...sceData.beginningCapital, [activePeriod]: v}})} 
                        currencySymbol={currencySymbolStr} 
                      />
                    ) : (
                      <CurrencyInput 
                        value={finActive?.begCap || 0} 
                        readOnly 
                        currencySymbol={currencySymbolStr} 
                      />
                    )}
                    {isComparisonMode && (
                      periods.indexOf(comparePeriod) === 0 ? (
                        <CurrencyInput 
                          value={sceData.beginningCapital?.[comparePeriod] || 0} 
                          onChange={v => setSceData({...sceData, beginningCapital: {...sceData.beginningCapital, [comparePeriod]: v}})} 
                          currencySymbol={currencySymbolStr} 
                        />
                      ) : (
                        <CurrencyInput 
                          value={finCompare?.begCap || 0} 
                          readOnly 
                          currencySymbol={currencySymbolStr} 
                        />
                      )
                    )}
                    <div className="w-5"/>
                  </div>
                </div>
                <SectionHeader isDarkMode={isDarkMode} title="Additions" />
                <LinkedRow 
                  isDarkMode={isDarkMode} 
                  currencySymbolStr={currencySymbolStr} 
                  isComparisonMode={isComparisonMode} 
                  label="Net Income" 
                  amount1={finActive?.ni} 
                  amount2={finCompare?.ni} 
                />
                <LinkedRow 
                  isDarkMode={isDarkMode} 
                  currencySymbolStr={currencySymbolStr} 
                  isComparisonMode={isComparisonMode} 
                  label="Other Comprehensive Income" 
                  amount1={finActive?.oci} 
                  amount2={finCompare?.oci} 
                />
                <DynamicList 
                  activePeriod={activePeriod} 
                  comparePeriod={comparePeriod} 
                  isComparisonMode={isComparisonMode} 
                  currencySymbolStr={currencySymbolStr} 
                  items={sceData.investments} 
                  category="investments" 
                  setState={setSceData} 
                />
                <SectionHeader isDarkMode={isDarkMode} title="Deductions" />
                <DynamicList 
                  activePeriod={activePeriod} 
                  comparePeriod={comparePeriod} 
                  isComparisonMode={isComparisonMode} 
                  currencySymbolStr={currencySymbolStr} 
                  items={sceData.dividends} 
                  category="dividends" 
                  setState={setSceData} 
                  isDeductible 
                />
                <TotalRow 
                  isDarkMode={isDarkMode} 
                  currencySymbolStr={currencySymbolStr} 
                  isComparisonMode={isComparisonMode} 
                  label="Ending Capital (Equity)" 
                  amount1={finActive?.endEq} 
                  amount2={finCompare?.endEq} 
                  isFinal 
                />
              </div>
            )}

            {/* 4. CF */}
            {activeTab === 'cashflow' && (
              <div className="mb-16">
                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700 mb-4 bg-slate-50 dark:bg-slate-800/30 px-3 rounded">
                  <span className="font-bold text-sm">
                    Beginning Cash Balance 
                    <span className="text-[10px] text-slate-500 font-normal block">Auto-cascades after Period 1</span>
                  </span>
                  <div className="flex gap-4">
                    {periods.indexOf(activePeriod) === 0 ? (
                      <CurrencyInput 
                        value={cfData.beginningCash?.[activePeriod] || 0} 
                        onChange={v => setCfData({...cfData, beginningCash: {...cfData.beginningCash, [activePeriod]: v}})} 
                        currencySymbol={currencySymbolStr} 
                      />
                    ) : (
                      <CurrencyInput 
                        value={finActive?.begCash || 0} 
                        readOnly 
                        currencySymbol={currencySymbolStr} 
                      />
                    )}
                    {isComparisonMode && (
                      periods.indexOf(comparePeriod) === 0 ? (
                        <CurrencyInput 
                          value={cfData.beginningCash?.[comparePeriod] || 0} 
                          onChange={v => setCfData({...cfData, beginningCash: {...cfData.beginningCash, [comparePeriod]: v}})} 
                          currencySymbol={currencySymbolStr} 
                        />
                      ) : (
                        <CurrencyInput 
                          value={finCompare?.begCash || 0} 
                          readOnly 
                          currencySymbol={currencySymbolStr} 
                        />
                      )
                    )}
                    <div className="w-5"/>
                  </div>
                </div>
                <SectionHeader isDarkMode={isDarkMode} title="Cash Flows from Operating Activities" />
                <LinkedRow 
                  isDarkMode={isDarkMode} 
                  currencySymbolStr={currencySymbolStr} 
                  isComparisonMode={isComparisonMode} 
                  label="Net Income" 
                  amount1={finActive?.ni} 
                  amount2={finCompare?.ni} 
                />
                <DynamicList 
                  activePeriod={activePeriod} 
                  comparePeriod={comparePeriod} 
                  isComparisonMode={isComparisonMode} 
                  currencySymbolStr={currencySymbolStr} 
                  items={cfData.operating} 
                  category="operating" 
                  setState={setCfData} 
                />
                <TotalRow 
                  isDarkMode={isDarkMode} 
                  currencySymbolStr={currencySymbolStr} 
                  isComparisonMode={isComparisonMode} 
                  label="Net Cash from Operating Activities" 
                  amount1={finActive?.opCF} 
                  amount2={finCompare?.opCF} 
                />
                <SectionHeader isDarkMode={isDarkMode} title="Cash Flows from Investing Activities" />
                <DynamicList 
                  activePeriod={activePeriod} 
                  comparePeriod={comparePeriod} 
                  isComparisonMode={isComparisonMode} 
                  currencySymbolStr={currencySymbolStr} 
                  items={cfData.investing} 
                  category="investing" 
                  setState={setCfData} 
                />
                <TotalRow 
                  isDarkMode={isDarkMode} 
                  currencySymbolStr={currencySymbolStr} 
                  isComparisonMode={isComparisonMode} 
                  label="Net Cash from Investing Activities" 
                  amount1={finActive?.invCF} 
                  amount2={finCompare?.invCF} 
                />
                <SectionHeader isDarkMode={isDarkMode} title="Cash Flows from Financing Activities" />
                <DynamicList 
                  activePeriod={activePeriod} 
                  comparePeriod={comparePeriod} 
                  isComparisonMode={isComparisonMode} 
                  currencySymbolStr={currencySymbolStr} 
                  items={cfData.financing} 
                  category="financing" 
                  setState={setCfData} 
                />
                <LinkedRow 
                  isDarkMode={isDarkMode} 
                  currencySymbolStr={currencySymbolStr} 
                  isComparisonMode={isComparisonMode} 
                  label="Less: Dividends Paid" 
                  amount1={-finActive?.div} 
                  amount2={-finCompare?.div} 
                />
                <TotalRow 
                  isDarkMode={isDarkMode} 
                  currencySymbolStr={currencySymbolStr} 
                  isComparisonMode={isComparisonMode} 
                  label="Net Cash from Financing Activities" 
                  amount1={finActive?.finCF} 
                  amount2={finCompare?.finCF} 
                />
                <div className="mt-6">
                  <TotalRow 
                    isDarkMode={isDarkMode} 
                    currencySymbolStr={currencySymbolStr} 
                    isComparisonMode={isComparisonMode} 
                    label="Net Increase (Decrease) in Cash" 
                    amount1={finActive?.netCash} 
                    amount2={finCompare?.netCash} 
                  />
                  <TotalRow 
                    isDarkMode={isDarkMode} 
                    currencySymbolStr={currencySymbolStr} 
                    isComparisonMode={isComparisonMode} 
                    label="Ending Cash Balance" 
                    amount1={finActive?.endCash} 
                    amount2={finCompare?.endCash} 
                    isFinal 
                  />
                </div>
              </div>
            )}

            {/* 5. RATIOS */}
            {activeTab === 'ratios' && (
              <div className="mb-16">
                <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg mb-8 flex gap-8 items-center border border-slate-200 dark:border-slate-600">
                  <span className="font-bold text-sm flex items-center gap-2">
                    <Calculator size={16} className={`text-tangerine`}/> Project Initial Investment <br/>
                    <span className="font-normal text-xs text-slate-500">(For ROI & Payback)</span>
                  </span>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 text-blueJeans dark:text-goldenYellow">{activePeriod}</label>
                    <CurrencyInput 
                      value={ratioData.initialInvestment?.[activePeriod] || 0} 
                      onChange={v => setRatioData({...ratioData, initialInvestment: {...ratioData.initialInvestment, [activePeriod]: v}})} 
                      currencySymbol={currencySymbolStr} 
                    />
                  </div>
                  {isComparisonMode && (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500">{comparePeriod}</label>
                      <CurrencyInput 
                        value={ratioData.initialInvestment?.[comparePeriod] || 0} 
                        onChange={v => setRatioData({...ratioData, initialInvestment: {...ratioData.initialInvestment, [comparePeriod]: v}})} 
                        currencySymbol={currencySymbolStr} 
                      />
                    </div>
                  )}
                </div>
                
                <SectionHeader isDarkMode={isDarkMode} title="Key Financial Performance Indicators" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                  {[
                    { label: 'Current Ratio', f1: finActive?.ca/finActive?.cl, f2: finCompare?.ca/finCompare?.cl, suffix: 'x' },
                    { label: 'Debt to Equity', f1: finActive?.tl/finActive?.endEq, f2: finCompare?.tl/finCompare?.endEq, suffix: 'x' },
                    { label: 'Net Profit Margin', f1: (finActive?.ni/finActive?.rev)*100, f2: (finCompare?.ni/finCompare?.rev)*100, suffix: '%' },
                    { label: 'Return on Assets', f1: (finActive?.ni/finActive?.ta)*100, f2: (finCompare?.ni/finCompare?.ta)*100, suffix: '%' },
                    { label: 'Return on Investment', f1: (finActive?.ni/ratioData.initialInvestment?.[activePeriod])*100, f2: (finCompare?.ni/ratioData.initialInvestment?.[comparePeriod])*100, suffix: '%' },
                    { label: 'Payback Period', f1: ratioData.initialInvestment?.[activePeriod]/finActive?.opCF, f2: ratioData.initialInvestment?.[comparePeriod]/finCompare?.opCF, suffix: ' yrs' },
                  ].map((r, i) => (
                    <div key={i} className={`border border-slate-200 dark:border-slate-600 rounded p-3 bg-slate-50 dark:bg-slate-700/30 border-l-4 border-l-goldenYellow`}>
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{r.label}</div>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className={`font-black text-lg text-blueVelvet dark:text-white`}>
                            {isFinite(r.f1) ? r.f1.toFixed(2) : 'N/A'}{isFinite(r.f1) ? r.suffix : ''}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold">{activePeriod}</div>
                        </div>
                        {isComparisonMode && (
                          <div className="text-right">
                            <div className="font-bold text-sm text-slate-600 dark:text-slate-300">
                              {isFinite(r.f2) ? r.f2.toFixed(2) : 'N/A'}{isFinite(r.f2) ? r.suffix : ''}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold">{comparePeriod}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`mt-8 grid grid-cols-1 ${isComparisonMode ? 'md:grid-cols-2' : ''} gap-8`}>
                  {isComparisonMode && (
                    <div>
                      <SectionHeader isDarkMode={isDarkMode} title="Horizontal Analysis (YoY Change)" />
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-[1.5px] border-slate-800 dark:border-slate-400 text-left text-xs font-bold">
                            <th className="pb-2 font-bold">Metric</th>
                            <th className="pb-2 text-right font-bold">Amount Change</th>
                            <th className="pb-2 text-right font-bold">% Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { n: 'Total Revenues', v1: finActive?.rev, v2: finCompare?.rev },
                            { n: 'Gross Profit', v1: finActive?.gp, v2: finCompare?.gp },
                            { n: 'Net Income', v1: finActive?.ni, v2: finCompare?.ni },
                            { n: 'Comprehensive Inc.', v1: finActive?.compInc, v2: finCompare?.compInc },
                            { n: 'Total Assets', v1: finActive?.ta, v2: finCompare?.ta },
                            { n: 'Total Liabilities', v1: finActive?.tl, v2: finCompare?.tl },
                            { n: 'Total Equity', v1: finActive?.endEq, v2: finCompare?.endEq },
                          ].map((row, i) => {
                            const amtChange = (row.v1 || 0) - (row.v2 || 0);
                            const pctChange = (row.v2 || 0) !== 0 ? (amtChange / row.v2) * 100 : 0;
                            return (
                              <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                                <td className="py-2">{row.n}</td>
                                <td className={`py-2 text-right ${amtChange < 0 ? 'text-red-600' : ''}`}>
                                  {Number(amtChange).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                </td>
                                <td className={`py-2 text-right font-bold ${pctChange < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                  {pctChange > 0 ? '+' : ''}{pctChange.toFixed(1)}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div>
                    <SectionHeader isDarkMode={isDarkMode} title={`Vertical Analysis (${activePeriod})`} />
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-[1.5px] border-slate-800 dark:border-slate-400 text-left text-xs font-bold">
                          <th className="pb-2 font-bold">Metric</th>
                          <th className="pb-2 text-right font-bold">% of Base</th>
                          <th className="pb-2 text-right font-bold">Base Used</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { n: 'Cost of Sales', v: finActive?.cogs, base: finActive?.rev, baseN: 'Revenue' },
                          { n: 'Gross Profit', v: finActive?.gp, base: finActive?.rev, baseN: 'Revenue' },
                          { n: 'Operating Exp.', v: finActive?.exp, base: finActive?.rev, baseN: 'Revenue' },
                          { n: 'Net Income', v: finActive?.ni, base: finActive?.rev, baseN: 'Revenue' },
                          { n: 'Comprehensive Inc.', v: finActive?.compInc, base: finActive?.rev, baseN: 'Revenue' },
                          { n: 'Current Assets', v: finActive?.ca, base: finActive?.ta, baseN: 'Total Assets' },
                          { n: 'Total Liabilities', v: finActive?.tl, base: finActive?.ta, baseN: 'Total Assets' },
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                            <td className="py-2">{row.n}</td>
                            <td className="py-2 text-right font-bold text-slate-700 dark:text-slate-300">
                              {(row.base || 0) !== 0 ? (((row.v || 0) / row.base) * 100).toFixed(1) : '0.0'}%
                            </td>
                            <td className="py-2 text-right text-xs text-slate-400">{row.baseN}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* --- NEW MULTI-PERIOD OVERVIEW CHART --- */}
                <div className="mt-8">
                  <SectionHeader isDarkMode={isDarkMode} title="Financial Multi-Period Overview" />
                  <div className="h-[400px] w-full bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Revenue', ...periods.reduce((acc, p) => ({...acc, [p]: financials[p]?.rev || 0}), {}) },
                        { name: 'Gross Profit', ...periods.reduce((acc, p) => ({...acc, [p]: financials[p]?.gp || 0}), {}) },
                        { name: 'Net Income', ...periods.reduce((acc, p) => ({...acc, [p]: financials[p]?.ni || 0}), {}) },
                        { name: 'Total Assets', ...periods.reduce((acc, p) => ({...acc, [p]: financials[p]?.ta || 0}), {}) },
                        { name: 'Total Equity', ...periods.reduce((acc, p) => ({...acc, [p]: financials[p]?.endEq || 0}), {}) },
                      ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} vertical={false} />
                        <XAxis dataKey="name" stroke={isDarkMode ? '#94a3b8' : '#64748b'} axisLine={false} tickLine={false} />
                        <YAxis 
                          stroke={isDarkMode ? '#94a3b8' : '#64748b'} 
                          axisLine={false} 
                          tickLine={false} 
                          tickFormatter={(value) => `${currencySymbolStr}${value >= 1000000 ? (value/1000000).toFixed(1)+'M' : value >= 1000 ? (value/1000).toFixed(1)+'k' : value}`} 
                        />
                        <RechartsTooltip 
                          formatter={(value) => `${currencySymbolStr}${value.toLocaleString('en-US', {minimumFractionDigits: 2})}`} 
                          contentStyle={{ 
                            backgroundColor: isDarkMode ? '#1e293b' : '#fff', 
                            color: isDarkMode ? '#f8fafc' : '#0f172a', 
                            borderRadius: '8px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                          }} 
                          cursor={{fill: isDarkMode ? '#334155' : '#f1f5f9'}} 
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        {periods.map((p, idx) => (
                           <Bar 
                             key={p} 
                             dataKey={p} 
                             fill={CHART_COLORS[idx % CHART_COLORS.length]} 
                             radius={[4, 4, 0, 0]} 
                             barSize={periods.length > 3 ? 15 : 30} 
                           />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}

            {/* 6. BIR TAX ENGINE */}
            {activeTab === 'tax' && (
              <div className="animate-in fade-in">
                <h2 className={`text-2xl font-bold text-blueVelvet dark:text-goldenYellow mb-2 text-center`}>
                  Bureau of Internal Revenue (BIR) Tax Engine
                </h2>
                <p className="text-center text-slate-500 mb-8">
                  Compute standard Philippine taxes using dynamic tables and rates.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  
                  <div className="col-span-1 space-y-1 border-r border-slate-200 dark:border-slate-700 pr-4">
                    {[
                      { id: 'income', label: 'Income Tax' },
                      { id: 'vat', label: 'Value-Added Tax (VAT)' },
                      { id: 'percentage', label: 'Percentage Tax' },
                      { id: 'withholding', label: 'Withholding Taxes' },
                      { id: 'excise', label: 'Excise Tax' },
                      { id: 'dst', label: 'Doc. Stamp Tax (DST)' },
                      { id: 'cgt', label: 'Capital Gains Tax' },
                      { id: 'donor', label: "Donor's Tax" },
                      { id: 'estate', label: 'Estate Tax' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => { setActiveTaxSubTab(t.id); setSelectedFlatTax(''); }}
                        className={`w-full text-left px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTaxSubTab === t.id 
                            ? `bg-blueJeans/10 text-blueJeans dark:text-goldenYellow border border-blueJeans/20` 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="col-span-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
                      <h3 className={`font-bold text-lg mb-4 text-blueVelvet dark:text-white capitalize`}>
                        {activeTaxSubTab.replace('_', ' ')} Settings
                      </h3>

                      {activeTaxSubTab === 'income' ? (
                        <div>
                          <p className="text-xs text-slate-500 mb-4">
                            Edit the graduated tax table brackets or use a flat corporate rate below.
                          </p>
                          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-md mb-6">
                            <table className="w-full text-sm text-left">
                              <thead className={`bg-blueJeans text-white`}>
                                <tr>
                                  <th className="px-3 py-2 font-semibold">Min (Over)</th>
                                  <th className="px-3 py-2 font-semibold">Max (Not Over)</th>
                                  <th className="px-3 py-2 font-semibold text-right">Base Tax Due</th>
                                  <th className="px-3 py-2 font-semibold text-right">+ Excess Rate (%)</th>
                                </tr>
                              </thead>
                              <tbody className="dark:bg-slate-800">
                                {incomeTaxTable.map((row, idx) => (
                                  <tr key={row.id} className="border-b border-slate-200 dark:border-slate-700">
                                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400 font-mono">
                                      ₱{Number(row.min ?? 0).toLocaleString()}
                                    </td>
                                    <td className="px-3 py-1">
                                      {row.max === Infinity ? (
                                        <span className="text-slate-500 italic px-2">Infinity</span>
                                      ) : (
                                        <input 
                                          type="number" 
                                          value={row.max ?? ''} 
                                          onChange={(e) => {
                                            const newTable = [...incomeTaxTable];
                                            newTable[idx].max = Number(e.target.value);
                                            if (newTable[idx+1]) newTable[idx+1].min = Number(e.target.value);
                                            setIncomeTaxTable(newTable);
                                          }} 
                                          className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 focus:outline-blue-500 font-mono"
                                        />
                                      )}
                                    </td>
                                    <td className="px-3 py-1">
                                      <input 
                                        type="number" 
                                        value={row.baseTax ?? 0} 
                                        onChange={(e) => {
                                            const newTable = [...incomeTaxTable];
                                            newTable[idx].baseTax = Number(e.target.value);
                                            setIncomeTaxTable(newTable);
                                        }} 
                                        className="w-full text-right bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 focus:outline-blue-500 font-mono"
                                      />
                                    </td>
                                    <td className="px-3 py-1">
                                      <input 
                                        type="number" 
                                        value={row.excessRate ?? 0} 
                                        onChange={(e) => {
                                            const newTable = [...incomeTaxTable];
                                            newTable[idx].excessRate = Number(e.target.value);
                                            setIncomeTaxTable(newTable);
                                        }} 
                                        className="w-full text-right bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 focus:outline-blue-500 font-mono"
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Or select a Flat Corporate Rate:
                            </label>
                            <select 
                              value={selectedFlatTax ?? ''} 
                              onChange={(e) => setSelectedFlatTax(e.target.value)} 
                              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-blue-500"
                            >
                              <option value="">-- Use Graduated Table Above (Individual) --</option>
                              {flatTaxRates.income.map(rate => (
                                <option key={rate.id} value={rate.id}>{rate.name} ({rate.rate}%)</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Select Specific Tax Category:
                          </label>
                          <div className="space-y-2">
                            {flatTaxRates[activeTaxSubTab]?.map(rate => (
                              <div key={rate.id} className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 rounded-md">
                                <input 
                                  type="radio" 
                                  id={rate.id} 
                                  name="taxCategory" 
                                  value={rate.id} 
                                  checked={selectedFlatTax === rate.id} 
                                  onChange={(e) => setSelectedFlatTax(e.target.value)}
                                  className={`accent-blueJeans`}
                                />
                                <label htmlFor={rate.id} className="flex-1 font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                  {rate.name}
                                </label>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number" 
                                    value={rate.rate ?? 0} 
                                    onChange={(e) => {
                                      const newRates = {...flatTaxRates};
                                      const idx = newRates[activeTaxSubTab].findIndex(r => r.id === rate.id);
                                      newRates[activeTaxSubTab][idx].rate = Number(e.target.value);
                                      setFlatTaxRates(newRates);
                                    }}
                                    className="w-20 text-right bg-transparent border border-slate-300 dark:border-slate-600 rounded px-2 py-1"
                                  />
                                  <span className="text-slate-500">%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Enter Tax Basis Amount (₱):
                        </label>
                        <div className="flex gap-4 items-center">
                          <CurrencyInput value={taxBasisInput ?? 0} onChange={setTaxBasisInput} currencySymbol="₱" />
                          <button 
                            onClick={calculateTax} 
                            className={`bg-tangerine hover:opacity-90 text-white px-6 py-2 rounded-md font-medium transition-colors`}
                          >
                            Calculate & Add to Ledger
                          </button>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <Receipt size={18}/> Global Tax Ledger
                    </h3>
                    {taxLedger.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500">
                        No tax computations added yet.
                      </div>
                    ) : (
                      <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-lg">
                        <table className="w-full text-sm text-left">
                          <thead className={`bg-blueJeans text-white`}>
                            <tr>
                              <th className="px-4 py-3 font-semibold">Tax Name</th>
                              <th className="px-4 py-3 font-semibold text-right">Rate / Method</th>
                              <th className="px-4 py-3 font-semibold text-right">Tax Basis</th>
                              <th className="px-4 py-3 font-semibold text-right">Computed Tax</th>
                              <th className="px-4 py-3 text-center"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {taxLedger.map(t => (
                              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="px-4 py-3 font-medium">{t.name}</td>
                                <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 text-xs">{t.rateStr}</td>
                                <td className="px-4 py-3 text-right font-mono">
                                  ₱{t.basis.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                </td>
                                <td className={`px-4 py-3 text-right font-bold text-tangerine font-mono`}>
                                  ₱{t.computed.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button onClick={() => setTaxLedger(taxLedger.filter(x => x.id !== t.id))} className="text-slate-400 hover:text-red-500">
                                    <Trash2 size={16}/>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-slate-50 dark:bg-slate-800 border-t-2 border-slate-800 dark:border-slate-400 font-bold">
                            <tr>
                              <td colSpan="3" className="px-4 py-3 text-right">Total Tax Liability:</td>
                              <td className="px-4 py-3 text-right text-lg text-red-600 dark:text-red-400 font-mono">
                                ₱{sum(taxLedger, 'computed').toLocaleString('en-US', {minimumFractionDigits: 2})}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            )}

            {/* 7. PAYROLL TAB */}
            {activeTab === 'payroll' && (
              <div className="animate-in fade-in">
                <h2 className={`text-2xl font-bold text-blueVelvet dark:text-goldenYellow mb-2 text-center`}>
                  Employee Payroll & Government Contributions
                </h2>
                <p className="text-center text-slate-500 mb-8">
                  Compute gross pay, overtime, night differential, SSS, PhilHealth, and Pag-IBIG.
                </p>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-6 flex flex-wrap gap-6 items-center">
                  <span className="font-bold text-sm">Payroll Global Rates:</span>
                  <label className="text-sm flex items-center gap-2">Base Pay Input Type: 
                    <select 
                      value={payrollConfig.payBasis ?? 'Monthly'} 
                      onChange={e => setPayrollConfig({...payrollConfig, payBasis: e.target.value})} 
                      className="w-24 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1"
                    >
                      <option value="Monthly">Monthly</option> 
                      <option value="Daily">Daily</option> 
                      <option value="Hourly">Hourly</option>
                    </select>
                  </label>
                  <label className="text-sm flex items-center gap-2">
                    Work Days/Month: 
                    <input 
                      type="number" 
                      value={payrollConfig.workDaysPerMonth ?? 0} 
                      onChange={e => setPayrollConfig({...payrollConfig, workDaysPerMonth: Number(e.target.value)})} 
                      className="w-16 bg-transparent border border-slate-300 dark:border-slate-600 rounded px-2 py-1" 
                    />
                  </label>
                  <label className="text-sm flex items-center gap-2">
                    Hours/Day: 
                    <input 
                      type="number" 
                      value={payrollConfig.hoursPerDay ?? 0} 
                      onChange={e => setPayrollConfig({...payrollConfig, hoursPerDay: Number(e.target.value)})} 
                      className="w-16 bg-transparent border border-slate-300 dark:border-slate-600 rounded px-2 py-1" 
                    />
                  </label>
                  <label className="text-sm flex items-center gap-2">
                    Night Diff (+%): 
                    <input 
                      type="number" 
                      step="0.01" 
                      value={payrollConfig.ndMultiplier ?? 0} 
                      onChange={e => setPayrollConfig({...payrollConfig, ndMultiplier: Number(e.target.value)})} 
                      className="w-20 bg-transparent border border-slate-300 dark:border-slate-600 rounded px-2 py-1" 
                    />
                  </label>
                </div>

                {/* Dynamic Columns Controls */}
                <div className="flex gap-4 mb-2 justify-end">
                  <button 
                    onClick={() => { 
                      const id = 'earn_' + Date.now(); 
                      setPayrollCols(prev => ({...prev, earnings: [...prev.earnings, {id, name: 'New Addition'}]})); 
                      setEmployees(prev => prev.map(e => ({...e, earnings: {...e.earnings, [id]: 0}}))); 
                    }} 
                    className={`text-xs text-blueJeans dark:text-goldenYellow hover:opacity-80 flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700`}
                  >
                    <Plus size={12}/> Add Earning Column
                  </button>
                  <button 
                    onClick={() => { 
                      const id = 'ded_' + Date.now(); 
                      setPayrollCols(prev => ({...prev, deductions: [...prev.deductions, {id, name: 'New Deduction'}]})); 
                      setEmployees(prev => prev.map(e => ({...e, deductions: {...e.deductions, [id]: 0}}))); 
                    }} 
                    className={`text-xs text-red-600 dark:text-red-400 hover:opacity-80 flex items-center gap-1 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800/30`}
                  >
                    <Plus size={12}/> Add Deduction Column
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                  <table className="min-w-full text-xs text-left whitespace-nowrap">
                    <thead className={`bg-blueVelvet text-white`}>
                      <tr>
                        <th className="px-3 py-3 font-semibold w-48">Employee Name</th>
                        <th className="px-3 py-3 font-semibold text-right">Base Pay ({payrollConfig.payBasis})</th>
                        <th className="px-3 py-3 font-semibold text-right">Daily Rate</th>
                        <th className="px-3 py-3 font-semibold text-right border-l border-white/20">OT Pay</th>
                        <th className="px-3 py-3 font-semibold text-right border-l border-white/20">ND Pay</th>
                        
                        {payrollCols.earnings.map(col => (
                          <th key={col.id} className={`px-3 py-3 font-semibold text-right bg-blueJeans border-l border-white/20 p-0`}>
                            <div className="flex items-center justify-end">
                              <input 
                                type="text" 
                                value={col.name ?? ''} 
                                onChange={e => { 
                                  const newCols = [...payrollCols.earnings]; 
                                  newCols.find(c => c.id === col.id).name = e.target.value; 
                                  setPayrollCols({...payrollCols, earnings: newCols}); 
                                }} 
                                className="w-full text-right bg-transparent font-semibold focus:outline-none px-2 py-2" 
                              />
                              <button 
                                onClick={() => { 
                                  setPayrollCols({...payrollCols, earnings: payrollCols.earnings.filter(c => c.id !== col.id)}); 
                                  setEmployees(employees.map(e => { 
                                    const newE = {...e, earnings: {...e.earnings}}; 
                                    delete newE.earnings[col.id]; 
                                    return newE; 
                                  })); 
                                }} 
                                className="px-1 text-white/50 hover:text-red-400"
                              >
                                <Trash2 size={12}/>
                              </button>
                            </div>
                          </th>
                        ))}
                        
                        <th className={`px-3 py-3 font-semibold text-right font-bold border-x border-white/20 bg-goldStars text-white`}>Gross Pay</th>
                        <th className="px-3 py-3 font-semibold text-right">SSS</th>
                        <th className="px-3 py-3 font-semibold text-right">PhilHealth</th>
                        <th className="px-3 py-3 font-semibold text-right">Pag-IBIG</th>
                        <th className="px-3 py-3 font-semibold text-right border-r border-white/20">Tax (WHT)</th>

                        {payrollCols.deductions.map(col => (
                          <th key={col.id} className="px-3 py-3 font-semibold text-right bg-red-900 border-l border-white/20 p-0">
                            <div className="flex items-center justify-end">
                              <input 
                                type="text" 
                                value={col.name ?? ''} 
                                onChange={e => { 
                                  const newCols = [...payrollCols.deductions]; 
                                  newCols.find(c => c.id === col.id).name = e.target.value; 
                                  setPayrollCols({...payrollCols, deductions: newCols}); 
                                }} 
                                className="w-full text-right bg-transparent font-semibold focus:outline-none px-2 py-2" 
                              />
                              <button 
                                onClick={() => { 
                                  setPayrollCols({...payrollCols, deductions: payrollCols.deductions.filter(c => c.id !== col.id)}); 
                                  setEmployees(employees.map(e => { 
                                    const newE = {...e, deductions: {...e.deductions}}; 
                                    delete newE.deductions[col.id]; 
                                    return newE; 
                                  })); 
                                }} 
                                className="px-1 text-white/50 hover:text-red-400"
                              >
                                <Trash2 size={12}/>
                              </button>
                            </div>
                          </th>
                        ))}
                        <th className={`px-3 py-3 font-semibold text-right font-bold text-blueVelvet bg-goldenYellow`}>Net Pay</th>
                        <th className="px-3 py-3 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {employees.map((emp, i) => {
                        const { daily } = getEmpRates(emp.basePay);
                        const customEarnSum = Object.values(emp.earnings || {}).reduce((a,b)=>a+(Number(b)||0), 0);
                        const grossPay = (emp.basePay || 0) + (emp.otPay || 0) + (emp.ndPay || 0) + customEarnSum; 
                        const statutoryDeduct = (emp.sss || 0) + (emp.philhealth || 0) + (emp.pagibig || 0) + (emp.withholding || 0);
                        const customDedSum = Object.values(emp.deductions || {}).reduce((a,b)=>a+(Number(b)||0), 0);
                        const netPay = grossPay - statutoryDeduct - customDedSum;

                        const updateEmp = (field, val) => { 
                          const newE = [...employees]; 
                          newE[i][field] = val; 
                          setEmployees(newE); 
                        };
                        const updateCustomEarning = (earnId, val) => { 
                          const newE = [...employees]; 
                          newE[i].earnings = {...newE[i].earnings, [earnId]: val}; 
                          setEmployees(newE); 
                        }
                        const updateCustomDeduction = (dedId, val) => { 
                          const newE = [...employees]; 
                          newE[i].deductions = {...newE[i].deductions, [dedId]: val}; 
                          setEmployees(newE); 
                        }

                        return (
                          <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-3 py-3">
                              <input 
                                type="text" 
                                value={emp.name ?? ''} 
                                onChange={e => updateEmp('name', e.target.value)} 
                                className={`w-full bg-transparent border-b border-transparent focus:border-blueJeans focus:outline-none font-medium`}
                              />
                            </td>
                            <td className="px-3 py-3">
                              <CurrencyInput 
                                value={emp.basePay ?? 0} 
                                onChange={v => updateEmp('basePay', v)} 
                                currencySymbol="" 
                                showSymbol={false} 
                              />
                            </td>
                            <td className="px-3 py-3 text-right text-slate-500 dark:text-slate-400 font-mono">
                              ₱{daily.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}
                            </td>
                            <td className="px-3 py-3 bg-blue-50/30 dark:bg-blue-900/10 border-l border-slate-100 dark:border-slate-700">
                              <CurrencyInput value={emp.otPay ?? 0} onChange={v => updateEmp('otPay', v)} currencySymbol="₱" showSymbol={false} />
                            </td>
                            <td className="px-3 py-3 bg-indigo-50/30 dark:bg-indigo-900/10 border-l border-slate-100 dark:border-slate-700">
                              <CurrencyInput value={emp.ndPay ?? 0} onChange={v => updateEmp('ndPay', v)} currencySymbol="₱" showSymbol={false} />
                            </td>

                            {payrollCols.earnings.map(col => (
                              <td key={`earn_${col.id}`} className="px-3 py-3 border-l border-slate-100 dark:border-slate-700">
                                <CurrencyInput value={(emp.earnings || {})[col.id] || 0} onChange={v => updateCustomEarning(col.id, v)} currencySymbol="₱" showSymbol={false} />
                              </td>
                            ))}

                            <td className="px-3 py-3 text-right font-bold text-slate-800 dark:text-slate-200 border-x border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80 font-mono">
                              ₱{grossPay.toLocaleString('en-US', {minimumFractionDigits:2})}
                            </td>
                            
                            <td className="px-3 py-3 bg-red-50/30 dark:bg-red-900/10">
                              <CurrencyInput value={emp.sss ?? 0} onChange={v => updateEmp('sss', v)} currencySymbol="₱" showSymbol={false} />
                            </td>
                            <td className="px-3 py-3 bg-red-50/30 dark:bg-red-900/10">
                              <CurrencyInput value={emp.philhealth ?? 0} onChange={v => updateEmp('philhealth', v)} currencySymbol="₱" showSymbol={false} />
                            </td>
                            <td className="px-3 py-3 bg-red-50/30 dark:bg-red-900/10">
                              <CurrencyInput value={emp.pagibig ?? 0} onChange={v => updateEmp('pagibig', v)} currencySymbol="₱" showSymbol={false} />
                            </td>
                            <td className="px-3 py-3 bg-red-50/30 dark:bg-red-900/10 border-r border-slate-100 dark:border-slate-700">
                              <CurrencyInput value={emp.withholding ?? 0} onChange={v => updateEmp('withholding', v)} currencySymbol="₱" showSymbol={false} />
                            </td>

                            {payrollCols.deductions.map(col => (
                              <td key={`ded_${col.id}`} className="px-3 py-3 border-l border-slate-100 dark:border-slate-700 bg-red-50/50 dark:bg-red-900/20">
                                <CurrencyInput value={(emp.deductions || {})[col.id] || 0} onChange={v => updateCustomDeduction(col.id, v)} currencySymbol="₱" showSymbol={false} isDeductible />
                              </td>
                            ))}

                            <td className={`px-3 py-3 text-right font-bold text-blueVelvet dark:text-white bg-goldenYellow/20 font-mono`}>
                              ₱{netPay.toLocaleString('en-US', {minimumFractionDigits:2})}
                            </td>
                            <td className="px-3 py-3 text-center">
                              <button onClick={() => setEmployees(employees.filter(x => x.id !== emp.id))} className="text-slate-400 hover:text-red-500">
                                <Trash2 size={14}/>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <button 
                  onClick={() => {
                    const newEmp = { id: Date.now(), name: 'New Employee', basePay: 0, otPay: 0, ndPay: 0, earnings: {}, deductions: {}, sss: 0, philhealth: 0, pagibig: 0, withholding: 0 };
                    payrollCols.earnings.forEach(c => newEmp.earnings[c.id] = 0);
                    payrollCols.deductions.forEach(c => newEmp.deductions[c.id] = 0);
                    setEmployees([...employees, newEmp]);
                  }} 
                  className={`mt-4 text-sm text-blueJeans dark:text-goldenYellow hover:opacity-80 flex items-center gap-1 font-medium`}
                >
                  <Plus size={16} /> Add Employee Row
                </button>

                {/* OT & ND Dedicated Calculator UI */}
                <div className="mt-8 bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 text-blueJeans dark:text-goldenYellow`}>
                    <Calculator size={18} /> OT & ND Pay Calculator
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                    <div className="lg:col-span-3">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Select Employee</label>
                      <select 
                        value={calcState.empId ?? ''} 
                        onChange={(e) => handleSelectCalcEmp(e.target.value)} 
                        className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm focus:outline-blue-500"
                      >
                        <option value="">-- Choose Employee --</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                    </div>
                    <div className="lg:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Daily Rate Base</label>
                      <input 
                        type="number" 
                        value={calcState.dailyRate ?? 0} 
                        onChange={(e) => setCalcState({...calcState, dailyRate: Number(e.target.value)})} 
                        className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm focus:outline-blue-500 font-mono" 
                      />
                    </div>
                    <div className="lg:col-span-3">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">OT Hrs & Multiplier</label>
                      <div className="flex gap-1">
                        <input 
                          type="number" 
                          placeholder="Hrs" 
                          title="OT Hours" 
                          value={calcState.otHours ?? 0} 
                          onChange={e => setCalcState({...calcState, otHours: Number(e.target.value)})} 
                          className="w-1/3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-2 text-sm focus:outline-blue-500" 
                        />
                        <select 
                          value={calcState.otType ?? 1.25} 
                          onChange={e => setCalcState({...calcState, otType: Number(e.target.value)})} 
                          className="w-2/3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-1 py-2 text-xs focus:outline-blue-500 text-slate-600 dark:text-slate-300" 
                          title="OT Type Multiplier"
                        >
                          {PREMIUM_RATES.map((rate, i) => ( 
                            <option key={i} value={rate.value}>{rate.label}</option> 
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="lg:col-span-1">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">ND Hrs</label>
                      <input 
                        type="number" 
                        placeholder="Hrs" 
                        value={calcState.ndHours ?? 0} 
                        onChange={e => setCalcState({...calcState, ndHours: Number(e.target.value)})} 
                        className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-2 text-sm focus:outline-blue-500" 
                      />
                    </div>
                    <div className="lg:col-span-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded px-3 py-1 flex items-center justify-between h-[38px]">
                      <div>
                        <div className="text-[10px] text-blue-600 dark:text-blue-300 font-bold leading-tight">
                          OT: ₱{(computedOtPay || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-300 font-bold leading-tight mt-0.5">
                          ND: ₱{(computedNdPay || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </div>
                      </div>
                      <button 
                        onClick={postToPayroll} 
                        disabled={!calcState.empId} 
                        className={`bg-tangerine hover:opacity-90 disabled:bg-slate-300 disabled:text-slate-500 text-white font-medium px-3 py-1 rounded text-xs transition-colors`}
                      >
                        Post Pay
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 print:mt-8">
                  <div>
                    <SectionHeader isDarkMode={isDarkMode} title="Statutory Overtime & ND Multipliers (Reference)" />
                    <table className="w-full text-sm mt-4 border border-slate-200 dark:border-slate-700">
                      <thead className={`bg-blueJeans text-white`}>
                        <tr className="text-left text-xs font-bold">
                          <th className="px-4 py-2">Day of Work / Overtime</th>
                          <th className="px-4 py-2 text-right">Hourly Multiplier</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800">
                          <td className="px-4 py-2">Ordinary / Regular Day</td>
                          <td className={`px-4 py-2 text-right font-mono font-bold text-tangerine`}>1.25</td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800">
                          <td className="px-4 py-2">Rest Days or Special Holidays</td>
                          <td className={`px-4 py-2 text-right font-mono font-bold text-tangerine`}>1.30</td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800">
                          <td className="px-4 py-2">Special Holiday that is also a Rest Day</td>
                          <td className={`px-4 py-2 text-right font-mono font-bold text-tangerine`}>1.50</td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800">
                          <td className="px-4 py-2">Regular Holiday</td>
                          <td className={`px-4 py-2 text-right font-mono font-bold text-tangerine`}>1.30</td>
                        </tr>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                          <td className="px-4 py-2 italic text-slate-500">Ordinary / Regular Night Shift (ND)</td>
                          <td className="px-4 py-2 text-right font-mono font-bold text-indigo-500">+ 10% (1.10)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <SectionHeader isDarkMode={isDarkMode} title="Government Contribution Bases (Reference)" />
                    <table className="w-full text-sm mt-4 border border-slate-200 dark:border-slate-700">
                      <thead className={`bg-blueJeans text-white`}>
                        <tr className="text-left text-xs font-bold">
                          <th className="px-4 py-2">Agency</th>
                          <th className="px-4 py-2 text-right">EE Share %</th>
                          <th className="px-4 py-2 text-right">Max Base / Salary Cap</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800">
                          <td className="px-4 py-2 font-medium">SSS (Social Security System)</td>
                          <td className="px-4 py-2 text-right">~ 4.5%</td>
                          <td className="px-4 py-2 text-right font-mono">₱30,000</td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800">
                          <td className="px-4 py-2 font-medium">PhilHealth</td>
                          <td className="px-4 py-2 text-right">2.5%</td>
                          <td className="px-4 py-2 text-right font-mono">₱10,000 - ₱100,000</td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800">
                          <td className="px-4 py-2 font-medium">Pag-IBIG (HDMF)</td>
                          <td className="px-4 py-2 text-right">2.0%</td>
                          <td className="px-4 py-2 text-right font-mono">₱10,000</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-[10px] text-slate-500 mt-2 italic">* Contributions above depend on exact statutory brackets and company policies.</p>
                  </div>
                </div>

              </div>
            )}


            {/* --- NEW TABS (COSTING, FORECAST, DEPRECIATION) --- */}

            {/* 8. PRODUCT COSTING TAB */}
            {activeTab === 'costing' && (
              <div className="animate-in fade-in">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
                    <div>
                      <h2 className={`text-2xl font-bold text-blueVelvet dark:text-goldenYellow`}>Production Cost Template</h2>
                      <p className="text-sm text-slate-500">Efficiently manage and analyze production costs per product.</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <select 
                         value={costingTargetPeriod} 
                         onChange={e => setCostingTargetPeriod(e.target.value)} 
                         className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-2 text-sm focus:outline-blue-500"
                       >
                          {periods.map(p => <option key={p} value={p}>Post to: {p}</option>)}
                       </select>
                       <button 
                         onClick={postProductionCostToCOGS} 
                         className="bg-tangerine hover:opacity-90 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors"
                       >
                         <ArrowRightCircle size={18}/> Post to SPL (COGS)
                       </button>
                    </div>
                 </div>

                 {/* Top Summary Blocks */}
                 <div className="grid grid-cols-2 md:grid-cols-4 border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden mb-8 shadow-sm">
                    <div className="bg-emerald-100/50 dark:bg-emerald-900/20 p-4 border-b md:border-b-0 md:border-r border-slate-300 dark:border-slate-600 text-center">
                       <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 mb-1 uppercase tracking-wider">Material Cost</div>
                       <div className="text-xl font-bold font-mono text-emerald-900 dark:text-emerald-300">
                         {currencySymbolStr}{totalCostMaterials.toLocaleString('en-US', {minimumFractionDigits:2})}
                       </div>
                    </div>
                    <div className="bg-blue-100/50 dark:bg-blue-900/20 p-4 border-b md:border-b-0 md:border-r border-slate-300 dark:border-slate-600 text-center">
                       <div className="text-[11px] font-bold text-blue-800 dark:text-blue-400 mb-1 uppercase tracking-wider">Labor Cost</div>
                       <div className="text-xl font-bold font-mono text-blue-900 dark:text-blue-300">
                         {currencySymbolStr}{totalCostLabor.toLocaleString('en-US', {minimumFractionDigits:2})}
                       </div>
                    </div>
                    <div className="bg-amber-100/50 dark:bg-amber-900/20 p-4 border-r border-slate-300 dark:border-slate-600 text-center">
                       <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400 mb-1 uppercase tracking-wider">Overhead Cost</div>
                       <div className="text-xl font-bold font-mono text-amber-900 dark:text-amber-300">
                         {currencySymbolStr}{totalCostOverhead.toLocaleString('en-US', {minimumFractionDigits:2})}
                       </div>
                    </div>
                    <div className="bg-slate-200 dark:bg-slate-700 p-4 text-center">
                       <div className="text-[11px] font-bold text-slate-800 dark:text-slate-300 mb-1 uppercase tracking-wider">Total Production Cost</div>
                       <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                         {currencySymbolStr}{grandTotalProductionCost.toLocaleString('en-US', {minimumFractionDigits:2})}
                       </div>
                    </div>
                 </div>

                 <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                      <h3 className="font-bold text-sm mb-2 uppercase tracking-wide text-center text-slate-700 dark:text-slate-300">Cost Breakdown</h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie 
                              data={[
                                { name: 'Material Cost', value: totalCostMaterials }, 
                                { name: 'Labor Cost', value: totalCostLabor }, 
                                { name: 'Overhead Cost', value: totalCostOverhead }
                              ]} 
                              cx="50%" 
                              cy="50%" 
                              innerRadius={60} 
                              outerRadius={80} 
                              paddingAngle={5} 
                              dataKey="value"
                            >
                              <Cell fill="#10b981" /> 
                              <Cell fill="#3b82f6" /> 
                              <Cell fill="#f59e0b" />
                            </Pie>
                            <RechartsTooltip formatter={(value) => `${currencySymbolStr}${value.toLocaleString('en-US', {minimumFractionDigits: 2})}`} />
                            <Legend verticalAlign="bottom" height={36}/>
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 justify-center">
                       <div className="p-3 border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 rounded">
                         <span className="text-xs text-slate-500 font-bold">MATERIAL %</span>
                         <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                           {grandTotalProductionCost > 0 ? ((totalCostMaterials / grandTotalProductionCost) * 100).toFixed(1) : 0}%
                         </div>
                       </div>
                       <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/10 rounded">
                         <span className="text-xs text-slate-500 font-bold">LABOR %</span>
                         <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                           {grandTotalProductionCost > 0 ? ((totalCostLabor / grandTotalProductionCost) * 100).toFixed(1) : 0}%
                         </div>
                       </div>
                       <div className="p-3 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/10 rounded">
                         <span className="text-xs text-slate-500 font-bold">OVERHEAD %</span>
                         <div className="text-lg font-bold text-amber-700 dark:text-amber-400">
                           {grandTotalProductionCost > 0 ? ((totalCostOverhead / grandTotalProductionCost) * 100).toFixed(1) : 0}%
                         </div>
                       </div>
                    </div>
                 </div>

                 {/* Product Information */}
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 mb-8">
                    <h3 className="font-bold text-sm mb-4 border-b border-slate-200 dark:border-slate-600 pb-2 uppercase tracking-wide">Product Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <label className="flex items-center text-sm font-medium gap-4">
                         <span className="w-32">Product ID:</span> 
                         <input 
                           type="text" 
                           value={costingData.productId} 
                           onChange={e => setCostingData({...costingData, productId: e.target.value})} 
                           className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-1.5 focus:outline-blueJeans" 
                         />
                       </label>
                       <label className="flex items-center text-sm font-medium gap-4">
                         <span className="w-32">Product Name:</span> 
                         <input 
                           type="text" 
                           value={costingData.productName} 
                           onChange={e => setCostingData({...costingData, productName: e.target.value})} 
                           className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-1.5 focus:outline-blueJeans" 
                         />
                       </label>
                       <label className="flex items-start text-sm font-medium gap-4 md:col-span-2">
                         <span className="w-32 mt-1">Description:</span> 
                         <textarea 
                           value={costingData.productDescription} 
                           onChange={e => setCostingData({...costingData, productDescription: e.target.value})} 
                           className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-1.5 focus:outline-blueJeans resize-none h-16" 
                         />
                       </label>
                    </div>
                 </div>

                 <div className="mb-8">
                    <div className="flex items-center justify-between bg-emerald-700 text-white px-4 py-2 rounded-t-md">
                      <h3 className="font-bold text-sm uppercase tracking-wider">Materials</h3>
                    </div>
                    <div className="overflow-x-auto border-x border-b border-slate-300 dark:border-slate-700 rounded-b-md">
                       <table className="w-full text-sm text-left whitespace-nowrap">
                          <thead className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300 border-b border-slate-300 dark:border-slate-700">
                             <tr>
                               <th className="px-4 py-2 font-bold">Item Description</th>
                               <th className="px-4 py-2 font-bold w-32">Unit</th>
                               <th className="px-4 py-2 font-bold w-24 text-right">Quantity</th>
                               <th className="px-4 py-2 font-bold w-32 text-right">Unit Cost</th>
                               <th className="px-4 py-2 font-bold w-32 text-right">Total Cost</th>
                               <th className="w-10"></th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                             {costingData.materials.map(mat => (
                               <tr key={mat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                 <td className="px-4 py-2">
                                   <input 
                                     type="text" 
                                     value={mat.desc} 
                                     onChange={e => setCostingData({...costingData, materials: costingData.materials.map(m => m.id===mat.id ? {...m, desc: e.target.value} : m)})} 
                                     className="w-full bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none"
                                   />
                                 </td>
                                 <td className="px-4 py-2">
                                   <input 
                                     type="text" 
                                     value={mat.unit} 
                                     onChange={e => setCostingData({...costingData, materials: costingData.materials.map(m => m.id===mat.id ? {...m, unit: e.target.value} : m)})} 
                                     className="w-full bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none"
                                   />
                                 </td>
                                 <td className="px-4 py-2 text-right">
                                   <input 
                                     type="number" 
                                     value={mat.qty} 
                                     onChange={e => setCostingData({...costingData, materials: costingData.materials.map(m => m.id===mat.id ? {...m, qty: Number(e.target.value)} : m)})} 
                                     className="w-full text-right bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none font-mono"
                                   />
                                 </td>
                                 <td className="px-4 py-2 text-right">
                                   <CurrencyInput 
                                     value={mat.unitCost} 
                                     onChange={v => setCostingData({...costingData, materials: costingData.materials.map(m => m.id===mat.id ? {...m, unitCost: v} : m)})} 
                                     currencySymbol={currencySymbolStr} 
                                     showSymbol={true}
                                   />
                                 </td>
                                 <td className="px-4 py-2 text-right font-bold text-slate-800 dark:text-slate-200 font-mono">
                                   {(mat.qty * mat.unitCost).toLocaleString('en-US', {minimumFractionDigits:2})}
                                 </td>
                                 <td className="px-2 text-center">
                                   <button 
                                     onClick={() => setCostingData({...costingData, materials: costingData.materials.filter(m => m.id !== mat.id)})} 
                                     className="text-slate-400 hover:text-red-500"
                                   >
                                     <Trash2 size={14}/>
                                   </button>
                                 </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                    <button 
                      onClick={() => setCostingData({...costingData, materials: [...costingData.materials, { id: Date.now(), desc: 'New Material', unit: 'Piece', qty: 0, unitCost: 0 }]})} 
                      className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:opacity-80"
                    >
                      <Plus size={14}/> Add Material
                    </button>
                 </div>

                 {/* Labor Table */}
                 <div className="mb-8">
                    <div className="flex items-center justify-between bg-blue-700 text-white px-4 py-2 rounded-t-md">
                      <h3 className="font-bold text-sm uppercase tracking-wider">Labor</h3>
                    </div>
                    <div className="overflow-x-auto border-x border-b border-slate-300 dark:border-slate-700 rounded-b-md">
                       <table className="w-full text-sm text-left whitespace-nowrap">
                          <thead className="bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 border-b border-slate-300 dark:border-slate-700">
                             <tr>
                               <th className="px-4 py-2 font-bold">Item Description</th>
                               <th className="px-4 py-2 font-bold w-24 text-right">No. of Hours</th>
                               <th className="px-4 py-2 font-bold w-32 text-right">Hourly Rate</th>
                               <th className="px-4 py-2 font-bold w-32 text-right">Total Cost</th>
                               <th className="w-10"></th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                             {costingData.labor.map(lab => (
                               <tr key={lab.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                 <td className="px-4 py-2">
                                   <input 
                                     type="text" 
                                     value={lab.desc} 
                                     onChange={e => setCostingData({...costingData, labor: costingData.labor.map(l => l.id===lab.id ? {...l, desc: e.target.value} : l)})} 
                                     className="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none"
                                   />
                                 </td>
                                 <td className="px-4 py-2 text-right">
                                   <input 
                                     type="number" 
                                     value={lab.hours} 
                                     onChange={e => setCostingData({...costingData, labor: costingData.labor.map(l => l.id===lab.id ? {...l, hours: Number(e.target.value)} : l)})} 
                                     className="w-full text-right bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none font-mono"
                                   />
                                 </td>
                                 <td className="px-4 py-2 text-right">
                                   <CurrencyInput 
                                     value={lab.hourlyRate} 
                                     onChange={v => setCostingData({...costingData, labor: costingData.labor.map(l => l.id===lab.id ? {...l, hourlyRate: v} : l)})} 
                                     currencySymbol={currencySymbolStr} 
                                     showSymbol={true}
                                   />
                                 </td>
                                 <td className="px-4 py-2 text-right font-bold text-slate-800 dark:text-slate-200 font-mono">
                                   {(lab.hours * lab.hourlyRate).toLocaleString('en-US', {minimumFractionDigits:2})}
                                 </td>
                                 <td className="px-2 text-center">
                                   <button 
                                     onClick={() => setCostingData({...costingData, labor: costingData.labor.filter(l => l.id !== lab.id)})} 
                                     className="text-slate-400 hover:text-red-500"
                                   >
                                     <Trash2 size={14}/>
                                   </button>
                                 </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                    <button 
                      onClick={() => setCostingData({...costingData, labor: [...costingData.labor, { id: Date.now(), desc: 'New Labor', hours: 0, hourlyRate: 0 }]})} 
                      className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 hover:opacity-80"
                    >
                      <Plus size={14}/> Add Labor
                    </button>
                 </div>

                 {/* Overhead Table */}
                 <div className="mb-4">
                    <div className="flex items-center justify-between bg-amber-600 text-white px-4 py-2 rounded-t-md">
                      <h3 className="font-bold text-sm uppercase tracking-wider">Overhead</h3>
                    </div>
                    <div className="overflow-x-auto border-x border-b border-slate-300 dark:border-slate-700 rounded-b-md">
                       <table className="w-full text-sm text-left whitespace-nowrap">
                          <thead className="bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 border-b border-slate-300 dark:border-slate-700">
                             <tr>
                               <th className="px-4 py-2 font-bold">Item Description</th>
                               <th className="px-4 py-2 font-bold w-48 text-right">Total Cost</th>
                               <th className="w-10"></th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                             {costingData.overhead.map(oh => (
                               <tr key={oh.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                 <td className="px-4 py-2">
                                   <input 
                                     type="text" 
                                     value={oh.desc} 
                                     onChange={e => setCostingData({...costingData, overhead: costingData.overhead.map(o => o.id===oh.id ? {...o, desc: e.target.value} : o)})} 
                                     className="w-full bg-transparent border-b border-transparent focus:border-amber-500 focus:outline-none"
                                   />
                                 </td>
                                 <td className="px-4 py-2 text-right">
                                   <CurrencyInput 
                                     value={oh.amount} 
                                     onChange={v => setCostingData({...costingData, overhead: costingData.overhead.map(o => o.id===oh.id ? {...o, amount: v} : o)})} 
                                     currencySymbol={currencySymbolStr} 
                                     showSymbol={true}
                                   />
                                 </td>
                                 <td className="px-2 text-center">
                                   <button 
                                     onClick={() => setCostingData({...costingData, overhead: costingData.overhead.filter(o => o.id !== oh.id)})} 
                                     className="text-slate-400 hover:text-red-500"
                                   >
                                     <Trash2 size={14}/>
                                   </button>
                                 </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                    <button 
                      onClick={() => setCostingData({...costingData, overhead: [...costingData.overhead, { id: Date.now(), desc: 'New Overhead', amount: 0 }]})} 
                      className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 hover:opacity-80"
                    >
                      <Plus size={14}/> Add Overhead
                    </button>
                 </div>

              </div>
            )}


            {/* 9. SALES FORECAST TAB */}
            {activeTab === 'forecast' && (
              <div className="animate-in fade-in">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
                    <div>
                      <h2 className={`text-2xl font-bold text-blueVelvet dark:text-goldenYellow`}>Sales Forecast Template</h2>
                      <p className="text-sm text-slate-500">Project future sales across multiple periods and post directly to Revenues.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={addForecastPeriod} 
                        className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-blueVelvet dark:text-slate-200 px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors border border-slate-300 dark:border-slate-600"
                      >
                        <Plus size={16}/> Add Period
                      </button>
                      
                      <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-2"></div>
                      
                      <select 
                        value={forecastTargetPeriod} 
                        onChange={e => setForecastTargetPeriod(e.target.value)} 
                        className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-2 text-sm focus:outline-blue-500"
                      >
                          {periods.map(p => <option key={p} value={p}>Post to: {p}</option>)}
                      </select>
                      <button 
                        onClick={postForecastTotalToRevenue} 
                        className="bg-tangerine hover:opacity-90 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors"
                      >
                        <ArrowRightCircle size={18}/> Post Total to SPL Revenue
                      </button>
                    </div>
                 </div>

                 {/* --- NEW FORECAST CHART --- */}
                 <div className="mb-8">
                   <div className="h-64 w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                     <ResponsiveContainer width="100%" height="100%">
                       <RechartsLineChart 
                         data={
                          forecastPeriods.map(p => {
                            let total = 0; 
                            forecastItems.forEach(item => { 
                              total += ((item.periods[p]?.price||0) * (item.periods[p]?.qty||0)); 
                            });
                            return { name: p, Sales: total };
                          })
                         } 
                         margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                       >
                         <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                         <XAxis dataKey="name" stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
                         <YAxis 
                           stroke={isDarkMode ? '#94a3b8' : '#64748b'} 
                           tickFormatter={(value) => `${currencySymbolStr}${value >= 1000 ? (value/1000).toFixed(1)+'k' : value}`} 
                         />
                         <RechartsTooltip 
                           formatter={(value) => `${currencySymbolStr}${value.toLocaleString('en-US', {minimumFractionDigits: 2})}`} 
                           contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                         />
                         <Legend />
                         <Line type="monotone" name="Total Projected Sales" dataKey="Sales" stroke={COLORS.tangerine} strokeWidth={3} activeDot={{ r: 8 }} />
                       </RechartsLineChart>
                     </ResponsiveContainer>
                   </div>
                 </div>

                 <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm">
                    <table className="min-w-full text-sm text-left whitespace-nowrap bg-white dark:bg-slate-800">
                       <thead>
                          <tr>
                            <th className="px-4 py-3 bg-blueVelvet text-white font-bold sticky left-0 z-10 w-48 border-r border-slate-600">PRODUCT NAME</th>
                            {forecastPeriods.map((p, index) => (
                              <th key={index} className={`px-4 py-3 font-bold text-center border-r border-slate-300 dark:border-slate-700 ${index % 2 === 0 ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}`}>
                                <div className="flex items-center justify-center gap-2">
                                  <input 
                                    type="text" 
                                    value={p} 
                                    onChange={e => {
                                      const newPeriods = [...forecastPeriods]; 
                                      const oldP = newPeriods[index]; 
                                      newPeriods[index] = e.target.value;
                                      const newItems = forecastItems.map(item => { 
                                        const newItem = {...item, periods: {...item.periods}}; 
                                        newItem.periods[e.target.value] = newItem.periods[oldP]; 
                                        delete newItem.periods[oldP]; 
                                        return newItem; 
                                      });
                                      setForecastPeriods(newPeriods); 
                                      setForecastItems(newItems);
                                    }}
                                    className="bg-transparent text-center focus:outline-none w-24 font-bold"
                                  />
                                  <button 
                                    onClick={() => {
                                       setForecastPeriods(forecastPeriods.filter((_, i) => i !== index));
                                       setForecastItems(forecastItems.map(item => { 
                                         const newItem = {...item, periods: {...item.periods}}; 
                                         delete newItem.periods[p]; 
                                         return newItem; 
                                       }));
                                    }} 
                                    className="text-white/50 hover:text-red-200"
                                  >
                                    <Trash2 size={12}/>
                                  </button>
                                </div>
                              </th>
                            ))}
                            <th className="px-4 py-3 bg-slate-200 dark:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 border-l border-slate-300 text-right">TOTAL</th>
                            <th className="px-2 py-3 bg-slate-200 dark:bg-slate-700"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-400 border-t-[3px] border-slate-400">
                          {forecastItems.map(item => {
                             let itemTotal = 0; 
                             forecastPeriods.forEach(p => { 
                               itemTotal += ((item.periods[p]?.price || 0) * (item.periods[p]?.qty || 0)); 
                             });
                             
                             return (
                               <React.Fragment key={item.id}>
                                 <tr>
                                   <td rowSpan="3" className="px-4 py-2 sticky left-0 z-10 bg-white dark:bg-slate-800 border-r-[3px] border-slate-400 align-top pt-4 font-bold">
                                     <input 
                                       type="text" 
                                       value={item.name} 
                                       onChange={e => setForecastItems(forecastItems.map(i => i.id === item.id ? {...i, name: e.target.value} : i))} 
                                       className="w-full bg-transparent focus:outline-none focus:border-b focus:border-blueJeans" 
                                     />
                                   </td>
                                   {forecastPeriods.map((p, index) => (
                                     <td key={`price-${p}`} className={`px-4 py-2 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50`}>
                                       <div className="flex justify-between items-center text-xs">
                                          <span className="text-slate-500">PRICE</span>
                                          <CurrencyInput 
                                            value={item.periods[p]?.price || 0} 
                                            onChange={v => setForecastItems(forecastItems.map(i => i.id === item.id ? {...i, periods: {...i.periods, [p]: {...i.periods[p], price: v}}} : i))} 
                                            currencySymbol={currencySymbolStr} 
                                            showSymbol={true} 
                                          />
                                       </div>
                                     </td>
                                   ))}
                                   <td rowSpan="3" className="px-4 py-2 align-middle text-right bg-slate-100 dark:bg-slate-700/50 border-l-[3px] border-slate-400 font-bold text-lg font-mono">
                                     {currencySymbolStr}{itemTotal.toLocaleString('en-US', {minimumFractionDigits:2})}
                                   </td>
                                   <td rowSpan="3" className="px-2 py-2 align-middle bg-slate-100 dark:bg-slate-700/50">
                                     <button 
                                       onClick={() => setForecastItems(forecastItems.filter(i => i.id !== item.id))} 
                                       className="text-slate-400 hover:text-red-500"
                                     >
                                       <Trash2 size={16}/>
                                     </button>
                                   </td>
                                 </tr>
                                 <tr>
                                   {forecastPeriods.map((p, index) => (
                                     <td key={`qty-${p}`} className={`px-4 py-2 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-600`}>
                                       <div className="flex justify-between items-center text-xs">
                                          <span className="text-slate-500">UNITS</span>
                                          <input 
                                            type="number" 
                                            value={item.periods[p]?.qty || 0} 
                                            onChange={e => setForecastItems(forecastItems.map(i => i.id === item.id ? {...i, periods: {...i.periods, [p]: {...i.periods[p], qty: Number(e.target.value)}}} : i))} 
                                            className="w-20 text-right bg-transparent focus:outline-none border-b border-transparent focus:border-blueJeans font-mono" 
                                          />
                                       </div>
                                     </td>
                                   ))}
                                 </tr>
                                 <tr>
                                   {forecastPeriods.map((p, index) => {
                                     const pTotal = (item.periods[p]?.price || 0) * (item.periods[p]?.qty || 0);
                                     return (
                                       <td key={`total-${p}`} className={`px-4 py-2 border-r border-slate-200 dark:border-slate-700 border-t border-slate-300 dark:border-slate-600 ${index % 2 === 0 ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-emerald-50 dark:bg-emerald-900/10'}`}>
                                         <div className="flex justify-between items-center text-sm font-bold">
                                           <span className="text-slate-600 dark:text-slate-400 text-xs">TOTAL</span>
                                           <span className="font-mono text-slate-800 dark:text-slate-200">
                                             {currencySymbolStr}{pTotal.toLocaleString('en-US', {minimumFractionDigits:2})}
                                           </span>
                                         </div>
                                       </td>
                                     )
                                   })}
                                 </tr>
                               </React.Fragment>
                             )
                          })}
                          
                          <tr className="bg-slate-200 dark:bg-slate-700 border-t-[3px] border-slate-400 font-bold">
                             <td className="px-4 py-3 sticky left-0 z-10 bg-slate-300 dark:bg-slate-600 border-r-[3px] border-slate-400">GRAND TOTAL SALES</td>
                             {forecastPeriods.map((p, index) => {
                                let colTotal = 0; 
                                forecastItems.forEach(item => { 
                                  colTotal += ((item.periods[p]?.price||0) * (item.periods[p]?.qty||0)); 
                                });
                                return ( 
                                  <td key={`gt-${p}`} className="px-4 py-3 text-right font-mono text-slate-800 dark:text-slate-100 border-r border-slate-300 dark:border-slate-600">
                                    {currencySymbolStr}{colTotal.toLocaleString('en-US', {minimumFractionDigits:2})}
                                  </td> 
                                )
                             })}
                             <td className="px-4 py-3 text-right font-mono text-lg text-blueVelvet dark:text-goldenYellow border-l-[3px] border-slate-400">
                                {(() => { 
                                  let gt = 0; 
                                  forecastItems.forEach(item => { 
                                    forecastPeriods.forEach(p => gt += ((item.periods[p]?.price||0) * (item.periods[p]?.qty||0))); 
                                  }); 
                                  return `${currencySymbolStr}${gt.toLocaleString('en-US', {minimumFractionDigits:2})}`; 
                                })()}
                             </td>
                             <td></td>
                          </tr>
                       </tbody>
                    </table>
                 </div>

                 <button 
                   onClick={() => {
                     const newId = Date.now(); 
                     const newItem = { id: newId, name: `NEW ITEM`, periods: {} };
                     forecastPeriods.forEach(p => newItem.periods[p] = { price: 0, qty: 0 }); 
                     setForecastItems([...forecastItems, newItem]);
                   }} 
                   className="mt-4 bg-slate-100 dark:bg-slate-700 text-blueVelvet dark:text-slate-200 hover:bg-slate-200 px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2 border border-slate-300 transition-colors"
                 >
                   <Plus size={16}/> Add Product Row
                 </button>
              </div>
            )}


            {/* 10. DEPRECIATION CALCULATOR TAB */}
            {activeTab === 'depreciation' && (
              <div className="animate-in fade-in">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
                    <div>
                      <h2 className={`text-2xl font-bold text-blueVelvet dark:text-goldenYellow`}>Depreciation Calculator</h2>
                      <p className="text-sm text-slate-500">Calculate asset depreciation and post schedules to expenses and assets.</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Form */}
                    <div className="lg:col-span-1 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                       <h3 className="font-bold text-lg mb-2 text-blueJeans dark:text-goldenYellow border-b border-slate-200 dark:border-slate-600 pb-2">Asset Details</h3>
                       <div>
                         <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Asset Name</label>
                         <input 
                           type="text" 
                           value={deprState.assetName} 
                           onChange={e => setDeprState({...deprState, assetName: e.target.value})} 
                           className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm focus:outline-blue-500" 
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Acquisition Cost</label>
                         <div className="flex bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-2">
                           <CurrencyInput 
                             value={deprState.cost} 
                             onChange={v => setDeprState({...deprState, cost: v})} 
                             currencySymbol={currencySymbolStr} 
                           />
                         </div>
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Salvage Value (Residual)</label>
                         <div className="flex bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-2">
                           <CurrencyInput 
                             value={deprState.salvage} 
                             onChange={v => setDeprState({...deprState, salvage: v})} 
                             currencySymbol={currencySymbolStr} 
                           />
                         </div>
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Useful Life (Years)</label>
                         <input 
                           type="number" 
                           value={deprState.life} 
                           onChange={e => setDeprState({...deprState, life: Number(e.target.value)})} 
                           className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm focus:outline-blue-500 font-mono" 
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Depreciation Method</label>
                         <select 
                           value={deprState.method} 
                           onChange={e => setDeprState({...deprState, method: e.target.value})} 
                           className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm focus:outline-blue-500"
                         >
                           <option value="Straight Line">Straight Line</option>
                           <option value="Double Declining">Double Declining Balance</option>
                         </select>
                       </div>
                       <button 
                         onClick={generateDeprSchedule} 
                         className="w-full bg-blueJeans hover:opacity-90 text-white font-bold py-2.5 rounded-md mt-4 transition-colors"
                       >
                         Generate Schedule
                       </button>
                    </div>

                    {/* Schedule Table */}
                    <div className="lg:col-span-2">
                       {deprSchedule.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl py-12">
                            <Calculator size={48} className="mb-4 opacity-50" />
                            <p>Enter details and click "Generate Schedule" to view depreciation table.</p>
                         </div>
                       ) : (
                         <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                           <table className="w-full text-sm text-left whitespace-nowrap">
                              <thead className="bg-blueVelvet text-white">
                                 <tr>
                                    <th className="px-4 py-3 font-semibold text-center w-16">Year</th>
                                    <th className="px-4 py-3 font-semibold text-right">Beg. Book Value</th>
                                    <th className="px-4 py-3 font-semibold text-right">Depr. Expense</th>
                                    <th className="px-4 py-3 font-semibold text-right">Accum. Depr.</th>
                                    <th className="px-4 py-3 font-semibold text-right">End Book Value</th>
                                    <th className="px-4 py-3 text-center">Post to Period</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                 {deprSchedule.map((row, index) => (
                                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                      <td className="px-4 py-3 text-center font-bold">{row.year}</td>
                                      <td className="px-4 py-3 text-right font-mono">₱{row.begBV.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                                      <td className="px-4 py-3 text-right font-mono text-tangerine font-bold">₱{row.exp.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                                      <td className="px-4 py-3 text-right font-mono text-red-500">₱{row.accDepr.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                                      <td className="px-4 py-3 text-right font-mono font-bold text-blueJeans dark:text-blue-300">₱{row.endBV.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                                      <td className="px-4 py-3 text-center">
                                        <div className="flex items-center gap-1 justify-center">
                                           <select 
                                             value={row.targetPeriod} 
                                             onChange={(e) => setDeprSchedule(deprSchedule.map((r, i) => i === index ? {...r, targetPeriod: e.target.value} : r))} 
                                             className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-1 py-1 text-xs focus:outline-blue-500"
                                           >
                                              {periods.map(p => <option key={p} value={p}>{p}</option>)}
                                           </select>
                                           <button 
                                             onClick={() => postDeprToSPL(index)} 
                                             className="bg-goldenYellow/20 text-goldStars hover:bg-goldenYellow/40 px-2 py-1 rounded text-xs font-bold transition-colors whitespace-nowrap border border-goldenYellow/30"
                                           >
                                             Post
                                           </button>
                                        </div>
                                      </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
            )}

          </div>
          
          <footer className="mt-8 text-center text-xs opacity-60 max-w-4xl mx-auto pb-10">
            {LEGAL_DISCLAIMER}
          </footer>
        </main>
      </div>
    </div>
  );
}