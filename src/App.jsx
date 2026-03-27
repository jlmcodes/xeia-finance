import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Calculator, DollarSign, Building2, LineChart, FileText, PieChart, Receipt, FileSpreadsheet, ToggleLeft, ToggleRight, CheckSquare, Square, Users, Moon, Sun, Lock, Save, Upload } from 'lucide-react';

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
  tangerine: '#F47729'
};

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

  const handleChange = (e) => setLocalStr(e.target.value);

  const handleFocus = () => {
    setIsFocused(true);
    setLocalStr(value === 0 || value === null || value === undefined ? '' : Number(value).toString());
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
        type={isFocused ? "number" : "text"}
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

export default function XeiaFinance() {
  // --- AUTHENTICATION & THEME STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- STATE MANAGEMENT ---
  const [companyName, setCompanyName] = useState('XEIA CORPORATION');
  const [dbaName, setDbaName] = useState('Doing business under the name and style of Xeia');
  const [isConsolidated, setIsConsolidated] = useState(true);
  const [currency, setCurrency] = useState('PHP');
  
  const currencySymbolStr = CURRENCIES.find(c => c.code === currency)?.symbol || currency;

  const [activeTab, setActiveTab] = useState('spl');
  const [isTwoYear, setIsTwoYear] = useState(true);
  const [year1, setYear1] = useState('2024');
  const [year2, setYear2] = useState('2023');

  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const fileInputRef = useRef(null);

  // Core Financial Data States
  const [splData, setSplData] = useState({
    revenues: [
      { id: 1, name: 'Sales Revenue', amount1: 1500000, amount2: 1350000 },
      { id: 2, name: 'Service Revenue', amount1: 250000, amount2: 200000 }
    ],
    cogs: [{ id: 1, name: 'Cost of Goods Sold', amount1: 600000, amount2: 550000 }],
    expenses: [
      { id: 1, name: 'Salaries Expense', amount1: 300000, amount2: 280000 },
      { id: 2, name: 'Rent Expense', amount1: 120000, amount2: 120000 },
    ],
    oci: [
      { id: 1, name: 'Other comprehensive income adjustments', amount1: 100000, amount2: 80000 }
    ],
  });

  const [sceData, setSceData] = useState({
    beginningCapital1: 600000, beginningCapital2: 450000,
    investments: [{ id: 1, name: 'Issuance of Ordinary Shares', amount1: 100000, amount2: 50000 }],
    dividends: [{ id: 1, name: 'Dividends Paid', amount1: 50000, amount2: 40000 }],
  });

  const [bsData, setBsData] = useState({
    currentAssets: [
      { id: 1, name: 'Short-term investments', amount1: 85455, amount2: 624800 },
      { id: 2, name: 'Receivables and contract assets', amount1: 10802515, amount2: 8567416 },
      { id: 3, name: 'Inventories', amount1: 13872706, amount2: 12340206 }
    ],
    nonCurrentAssets: [
      { id: 1, name: 'Property, plant and equipment', amount1: 43893416, amount2: 39825319 },
      { id: 2, name: 'Right-of-use assets', amount1: 44529498, amount2: 44966055 }
    ],
    currentLiabilities: [
      { id: 1, name: 'Trade payables and contract liabilities', amount1: 48364343, amount2: 46835455 },
      { id: 2, name: 'Short-term debt', amount1: 6472199, amount2: 5751730 }
    ],
    nonCurrentLiabilities: [
      { id: 1, name: 'Senior debt securities', amount1: 34582581, amount2: 33077780 },
      { id: 2, name: 'Lease liabilities', amount1: 44115015, amount2: 43288544 }
    ],
  });

  const [cfData, setCfData] = useState({
    beginningCash1: 29326649, beginningCash2: 33232488,
    operating: [{ id: 1, name: 'Depreciation Add-back', amount1: 50000, amount2: 45000 }],
    investing: [{ id: 1, name: 'Purchase of Equipment', amount1: -150000, amount2: -100000 }],
    financing: [{ id: 1, name: 'Proceeds from Bank Loan', amount1: 0, amount2: 100000 }],
  });

  const [ratioData, setRatioData] = useState({ initialInvestment1: 500000, initialInvestment2: 500000 });

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
    income: [{ id: 'cit_reg', name: 'Corporate Income Tax - Regular', rate: 25 }, { id: 'cit_msme', name: 'Corporate Income Tax - MSME', rate: 20 }],
    vat: [{ id: 'vat_12', name: 'Value-Added Tax (Standard)', rate: 12 }, { id: 'vat_0', name: 'Value-Added Tax (Zero-Rated)', rate: 0 }],
    percentage: [{ id: 'pt_3', name: 'Percentage Tax (Non-VAT)', rate: 3 }],
    withholding: [
      { id: 'ewt_1', name: 'Expanded Withholding (Goods)', rate: 1 }, { id: 'ewt_2', name: 'Expanded Withholding (Services)', rate: 2 },
      { id: 'ewt_5', name: 'Expanded Withholding (Rent/Prof)', rate: 5 }, { id: 'ewt_10', name: 'Expanded Withholding (Professionals)', rate: 10 },
      { id: 'fwt_20', name: 'Final Withholding (Bank Interest)', rate: 20 },
    ],
    excise: [{ id: 'exc_gen', name: 'Excise Tax (General Ad Valorem)', rate: 20 }],
    dst: [{ id: 'dst_loan', name: 'Doc. Stamp Tax (Loans/Instruments)', rate: 0.75 }, { id: 'dst_sale', name: 'Doc. Stamp Tax (Deed of Sale)', rate: 1.5 }],
    cgt: [{ id: 'cgt_real', name: 'Capital Gains (Real Property)', rate: 6 }, { id: 'cgt_stock', name: 'Capital Gains (Unlisted Shares)', rate: 15 }],
    donor: [{ id: 'donors', name: "Donor's Tax (Over 250k exempt)", rate: 6 }],
    estate: [{ id: 'estate', name: 'Estate Tax', rate: 6 }]
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

  // OT & ND Calculator State
  const [calcState, setCalcState] = useState({
    empId: '', dailyRate: 0, otHours: 0, otType: 1.25, ndHours: 0
  });

  // --- LOGIN LOGIC ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (AUTHORIZED_USERS.some(u => u.toLowerCase() === loginName.trim().toLowerCase())) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Unauthorized access. Please enter a valid authorized name.');
    }
  };

  // --- SAVE & LOAD SESSION (BACKUP) LOGIC ---
  const handleSaveSession = () => {
    const sessionData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      companyName, dbaName, isConsolidated, isTwoYear, currency, year1, year2,
      splData, sceData, bsData, cfData, ratioData, 
      taxLedger, incomeTaxTable, flatTaxRates,
      payrollConfig, payrollCols, employees
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
        
        if(data.companyName !== undefined) setCompanyName(data.companyName);
        if(data.dbaName !== undefined) setDbaName(data.dbaName);
        if(data.isConsolidated !== undefined) setIsConsolidated(data.isConsolidated);
        if(data.isTwoYear !== undefined) setIsTwoYear(data.isTwoYear);
        if(data.currency !== undefined) setCurrency(data.currency);
        if(data.year1 !== undefined) setYear1(data.year1);
        if(data.year2 !== undefined) setYear2(data.year2);
        
        if(data.splData) setSplData(data.splData);
        if(data.sceData) setSceData(data.sceData);
        if(data.bsData) setBsData(data.bsData);
        if(data.cfData) setCfData(data.cfData);
        if(data.ratioData) setRatioData(data.ratioData);
        
        if(data.taxLedger) setTaxLedger(data.taxLedger);
        if(data.incomeTaxTable) setIncomeTaxTable(data.incomeTaxTable);
        if(data.flatTaxRates) setFlatTaxRates(data.flatTaxRates);
        
        if(data.payrollConfig) setPayrollConfig(data.payrollConfig);
        if(data.payrollCols) setPayrollCols(data.payrollCols);
        if(data.employees) setEmployees(data.employees);

        alert("Session Backup loaded successfully! All figures have been restored.");
      } catch(err) {
        alert("Error loading file. Make sure it is a valid .xeia backup file.");
      }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  // --- DERIVED CALCULATIONS ---
  const sum = (arr, field) => arr.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
  const subtitleText = isConsolidated ? 'AND SUBSIDIARIES' : '';
  const titlePrefix = isConsolidated ? 'CONSOLIDATED ' : '';

  // SPL & Comprehensive Income Calcs
  const rev1 = sum(splData.revenues, 'amount1'); const rev2 = sum(splData.revenues, 'amount2');
  const cogs1 = sum(splData.cogs, 'amount1'); const cogs2 = sum(splData.cogs, 'amount2');
  const gp1 = rev1 - cogs1; const gp2 = rev2 - cogs2;
  const exp1 = sum(splData.expenses, 'amount1'); const exp2 = sum(splData.expenses, 'amount2');
  const ni1 = gp1 - exp1; const ni2 = gp2 - exp2;
  const oci1 = sum(splData.oci, 'amount1'); const oci2 = sum(splData.oci, 'amount2');
  const compInc1 = ni1 + oci1; const compInc2 = ni2 + oci2;

  // SCE Calcs 
  const inv1 = sum(sceData.investments, 'amount1'); const inv2 = sum(sceData.investments, 'amount2');
  const div1 = sum(sceData.dividends, 'amount1'); const div2 = sum(sceData.dividends, 'amount2');
  const endEq1 = Number(sceData.beginningCapital1) + ni1 + oci1 + inv1 - div1;
  const endEq2 = Number(sceData.beginningCapital2) + ni2 + oci2 + inv2 - div2;

  // CF Calcs
  const opCF1 = ni1 + sum(cfData.operating, 'amount1'); const opCF2 = ni2 + sum(cfData.operating, 'amount2');
  const invCF1 = sum(cfData.investing, 'amount1'); const invCF2 = sum(cfData.investing, 'amount2');
  const finCF1 = sum(cfData.financing, 'amount1') - div1; const finCF2 = sum(cfData.financing, 'amount2') - div2;
  const netCash1 = opCF1 + invCF1 + finCF1; const netCash2 = opCF2 + invCF2 + finCF2;
  const endCash1 = Number(cfData.beginningCash1) + netCash1; const endCash2 = Number(cfData.beginningCash2) + netCash2;

  // BS Calcs
  const ca1 = endCash1 + sum(bsData.currentAssets, 'amount1'); const ca2 = endCash2 + sum(bsData.currentAssets, 'amount2');
  const nca1 = sum(bsData.nonCurrentAssets, 'amount1'); const nca2 = sum(bsData.nonCurrentAssets, 'amount2');
  const ta1 = ca1 + nca1; const ta2 = ca2 + nca2;
  const cl1 = sum(bsData.currentLiabilities, 'amount1'); const cl2 = sum(bsData.currentLiabilities, 'amount2');
  const ncl1 = sum(bsData.nonCurrentLiabilities, 'amount1'); const ncl2 = sum(bsData.nonCurrentLiabilities, 'amount2');
  const tl1 = cl1 + ncl1; const tl2 = cl2 + ncl2;
  const tle1 = tl1 + endEq1; const tle2 = tl2 + endEq2;

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
    } else { // Hourly
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
        return { ...emp, otPay: computedOtPay, ndPay: computedNdPay, otHours: calcState.otHours, otType: calcState.otType, ndHours: calcState.ndHours };
      }
      return emp;
    }));
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
      setTaxLedger([...taxLedger, { id: Date.now(), name: taxName, rateStr: rateStr, basis: Number(taxBasisInput) || 0, computed: computedTax }]);
      setTaxBasisInput(0);
    }
  };

  // --- EXCEL EXPORT LOGIC (Fully Styled Tables) ---
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
          sheet.getCell(`B${currentRow}`).value = Number(item.amount1) || 0;
          sheet.getCell(`B${currentRow}`).numFmt = '#,##0.00;[Red](#,##0.00)';
          if (isTwoYear) {
            sheet.getCell(`C${currentRow}`).value = Number(item.amount2) || 0;
            sheet.getCell(`C${currentRow}`).numFmt = '#,##0.00;[Red](#,##0.00)';
          }
          currentRow++;
        });
        
        const endRow = currentRow - 1;
        return {
          nextRow: currentRow,
          formula1: startRow + 1 <= endRow ? `SUM(B${startRow + 1}:B${endRow})` : '0',
          formula2: startRow + 1 <= endRow && isTwoYear ? `SUM(C${startRow + 1}:C${endRow})` : '0'
        };
      };

      const writeStyledTotal = (sheet, row, label, formula1, formula2, isFinal = false) => {
          sheet.getCell(`A${row}`).value = label;
          sheet.getCell(`A${row}`).font = { bold: true };
          
          sheet.getCell(`B${row}`).value = { formula: formula1 };
          sheet.getCell(`B${row}`).font = { bold: true };
          sheet.getCell(`B${row}`).numFmt = '#,##0.00;[Red](#,##0.00)';
          
          const borderStyle = isFinal ? { top: { style: 'thin' }, bottom: { style: 'double' } } : { top: { style: 'thin' } };
          sheet.getCell(`B${row}`).border = borderStyle;
          
          if (isTwoYear) {
              sheet.getCell(`C${row}`).value = { formula: formula2 };
              sheet.getCell(`C${row}`).font = { bold: true };
              sheet.getCell(`C${row}`).numFmt = '#,##0.00;[Red](#,##0.00)';
              sheet.getCell(`C${row}`).border = borderStyle;
          }
      };

      const setupSheet = (name, title) => {
        const sheet = wb.addWorksheet(name);
        sheet.columns = isTwoYear ? [{ width: 45 }, { width: 22 }, { width: 22 }] : [{ width: 50 }, { width: 25 }];
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
        headerRow.getCell(2).value = year1;
        if (isTwoYear) headerRow.getCell(3).value = year2;
        
        [1, 2, 3].forEach(col => {
            if (col === 3 && !isTwoYear) return;
            const cell = headerRow.getCell(col);
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF214573' } };
            cell.alignment = { horizontal: col === 1 ? 'left' : 'right', vertical: 'middle' };
            cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        });
        
        return sheet;
      };

      // SPL Sheet (Comprehensive Income)
      const splSheet = setupSheet('Comprehensive Income', 'STATEMENT OF COMPREHENSIVE INCOME');
      let r = writeSection(splSheet, 'REVENUES', splData.revenues, 8);
      writeStyledTotal(splSheet, r.nextRow, 'Total Revenues', r.formula1, r.formula2);
      
      let cogs = writeSection(splSheet, 'COST OF SALES', splData.cogs, r.nextRow + 2);
      writeStyledTotal(splSheet, cogs.nextRow, 'Total Cost of Sales', cogs.formula1, cogs.formula2);

      const gpRow = cogs.nextRow + 2;
      writeStyledTotal(splSheet, gpRow, 'Gross Profit', `B${r.nextRow}-B${cogs.nextRow}`, `C${r.nextRow}-C${cogs.nextRow}`);

      let exp = writeSection(splSheet, 'OPERATING EXPENSES', splData.expenses, gpRow + 2);
      writeStyledTotal(splSheet, exp.nextRow, 'Total Expenses', exp.formula1, exp.formula2);

      const niRow = exp.nextRow + 2;
      writeStyledTotal(splSheet, niRow, 'Net Income / (Loss)', `B${gpRow}-B${exp.nextRow}`, `C${gpRow}-C${exp.nextRow}`);
      
      const spl_ni1 = `'Comprehensive Income'!B${niRow}`;
      const spl_ni2 = `'Comprehensive Income'!C${niRow}`;

      let oci = writeSection(splSheet, 'OTHER COMPREHENSIVE INCOME', splData.oci, niRow + 2);
      writeStyledTotal(splSheet, oci.nextRow, 'Total Other Comprehensive Income', oci.formula1, oci.formula2);

      const compIncRow = oci.nextRow + 2;
      writeStyledTotal(splSheet, compIncRow, 'COMPREHENSIVE INCOME', `B${niRow}+B${oci.nextRow}`, `C${niRow}+C${oci.nextRow}`, true);

      // SCE Sheet
      const sceSheet = setupSheet('Changes in Equity', 'STATEMENT OF CHANGES IN EQUITY');
      sceSheet.getCell('A8').value = 'Beginning Capital Balance';
      sceSheet.getCell('B8').value = Number(sceData.beginningCapital1) || 0;
      if (isTwoYear) sceSheet.getCell('C8').value = Number(sceData.beginningCapital2) || 0;
      
      sceSheet.getCell('A9').value = 'Add: Net Income';
      sceSheet.getCell('B9').value = { formula: spl_ni1 };
      if (isTwoYear) sceSheet.getCell('C9').value = { formula: spl_ni2 };

      sceSheet.getCell('A10').value = 'Add: Other Comprehensive Income';
      sceSheet.getCell('B10').value = { formula: `'Comprehensive Income'!B${oci.nextRow}` };
      if (isTwoYear) sceSheet.getCell('C10').value = { formula: `'Comprehensive Income'!C${oci.nextRow}` };

      let inv = writeSection(sceSheet, 'ADDITIONS', sceData.investments, 12);
      let div = writeSection(sceSheet, 'DEDUCTIONS (DIVIDENDS)', sceData.dividends, inv.nextRow + 2);

      const eqRow = div.nextRow + 2;
      writeStyledTotal(sceSheet, eqRow, 'ENDING CAPITAL (EQUITY)', `B8+B9+B10+${inv.formula1}-${div.formula1}`, `C8+C9+C10+${inv.formula2}-${div.formula2}`, true);
      const sce_eq1 = `'Changes in Equity'!B${eqRow}`;
      const sce_eq2 = `'Changes in Equity'!C${eqRow}`;

      // CF Sheet
      const cfSheet = setupSheet('Cash Flows', 'STATEMENT OF CASH FLOWS');
      cfSheet.getCell('A8').value = 'Beginning Cash Balance';
      cfSheet.getCell('B8').value = Number(cfData.beginningCash1) || 0;
      if (isTwoYear) cfSheet.getCell('C8').value = Number(cfData.beginningCash2) || 0;

      cfSheet.getCell('A10').value = 'CASH FLOWS FROM OPERATING ACTIVITIES';
      cfSheet.getCell('A10').font = { bold: true, color: { argb: 'FF091D38' } }; 
      cfSheet.getCell('A10').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      cfSheet.getCell('A11').value = 'Net Income';
      cfSheet.getCell('B11').value = { formula: spl_ni1 };
      if (isTwoYear) cfSheet.getCell('C11').value = { formula: spl_ni2 };

      let op = writeSection(cfSheet, 'ADJUSTMENTS', cfData.operating, 12);
      writeStyledTotal(cfSheet, op.nextRow, 'Net Cash from Operating Activities', `B11+${op.formula1}`, `C11+${op.formula2}`);

      let invCF = writeSection(cfSheet, 'CASH FLOWS FROM INVESTING', cfData.investing, op.nextRow + 2);
      writeStyledTotal(cfSheet, invCF.nextRow, 'Net Cash from Investing Activities', invCF.formula1, invCF.formula2);

      let finCF = writeSection(cfSheet, 'CASH FLOWS FROM FINANCING', cfData.financing, invCF.nextRow + 2);
      const divRow = finCF.nextRow;
      cfSheet.getCell(`A${divRow}`).value = 'Less: Dividends Paid';
      cfSheet.getCell(`B${divRow}`).value = { formula: `-'Changes in Equity'!B${div.nextRow}` };
      if (isTwoYear) cfSheet.getCell(`C${divRow}`).value = { formula: `-'Changes in Equity'!C${div.nextRow}` };

      const finSumRow = divRow + 1;
      writeStyledTotal(cfSheet, finSumRow, 'Net Cash from Financing Activities', `${finCF.formula1}+B${divRow}`, `${finCF.formula2}+C${divRow}`);

      const netCashRow = finSumRow + 2;
      writeStyledTotal(cfSheet, netCashRow, 'Net Increase (Decrease) in Cash', `B${op.nextRow}+B${invCF.nextRow}+B${finSumRow}`, `C${op.nextRow}+C${invCF.nextRow}+C${finSumRow}`);

      const endCashRow = netCashRow + 2;
      writeStyledTotal(cfSheet, endCashRow, 'ENDING CASH BALANCE', `B8+B${netCashRow}`, `C8+C${netCashRow}`, true);
      
      const cf_endCash1 = `'Cash Flows'!B${endCashRow}`;
      const cf_endCash2 = `'Cash Flows'!C${endCashRow}`;

      // BS Sheet
      const bsSheet = setupSheet('Financial Position', 'STATEMENT OF FINANCIAL POSITION');
      
      bsSheet.getCell('A8').value = 'ASSETS';
      bsSheet.getCell('A8').font = { bold: true, size: 12, color: { argb: 'FFEDA340' } };
      
      bsSheet.getCell('A9').value = 'Cash & Equivalents';
      bsSheet.getCell('B9').value = { formula: cf_endCash1 };
      if (isTwoYear) bsSheet.getCell('C9').value = { formula: cf_endCash2 };

      let ca = writeSection(bsSheet, 'CURRENT ASSETS', bsData.currentAssets, 10);
      writeStyledTotal(bsSheet, ca.nextRow, 'Total Current Assets', `B9+${ca.formula1}`, `C9+${ca.formula2}`);

      let nca = writeSection(bsSheet, 'NONCURRENT ASSETS', bsData.nonCurrentAssets, ca.nextRow + 2);
      writeStyledTotal(bsSheet, nca.nextRow, 'Total Noncurrent Assets', nca.formula1, nca.formula2);

      const totAssetsRow = nca.nextRow + 2;
      writeStyledTotal(bsSheet, totAssetsRow, 'TOTAL ASSETS', `B${ca.nextRow}+B${nca.nextRow}`, `C${ca.nextRow}+C${nca.nextRow}`, true);

      const liabRow = totAssetsRow + 2;
      bsSheet.getCell(`A${liabRow}`).value = 'LIABILITIES AND EQUITY';
      bsSheet.getCell(`A${liabRow}`).font = { bold: true, size: 12, color: { argb: 'FFEDA340' } };
      
      let cl = writeSection(bsSheet, 'CURRENT LIABILITIES', bsData.currentLiabilities, liabRow + 1);
      writeStyledTotal(bsSheet, cl.nextRow, 'Total Current Liabilities', cl.formula1, cl.formula2);

      let ncl = writeSection(bsSheet, 'NONCURRENT LIABILITIES', bsData.nonCurrentLiabilities, cl.nextRow + 2);
      writeStyledTotal(bsSheet, ncl.nextRow, 'Total Noncurrent Liabilities', ncl.formula1, ncl.formula2);

      const totLiabRow = ncl.nextRow + 2;
      writeStyledTotal(bsSheet, totLiabRow, 'TOTAL LIABILITIES', `B${cl.nextRow}+B${ncl.nextRow}`, `C${cl.nextRow}+C${ncl.nextRow}`);

      const eqBsRow = totLiabRow + 2;
      bsSheet.getCell(`A${eqBsRow}`).value = 'Total Capital / Retained Earnings';
      bsSheet.getCell(`B${eqBsRow}`).value = { formula: sce_eq1 };
      if (isTwoYear) bsSheet.getCell(`C${eqBsRow}`).value = { formula: sce_eq2 };

      const tleRow = eqBsRow + 2;
      writeStyledTotal(bsSheet, tleRow, 'TOTAL LIABILITIES & EQUITY', `B${totLiabRow}+B${eqBsRow}`, `C${totLiabRow}+C${eqBsRow}`, true);

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

  // --- HELPER COMPONENTS ---
  const handleItemChange = (setState, category, id, field, value) => {
    setState(prev => ({
      ...prev,
      [category]: prev[category].map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addItem = (setState, category) => {
    setState(prev => ({ ...prev, [category]: [...prev[category], { id: Date.now(), name: 'New Item', amount1: 0, amount2: 0 }] }));
  };
  const removeItem = (setState, category, id) => {
    setState(prev => ({ ...prev, [category]: prev[category].filter(item => item.id !== id) }));
  };

  const SectionHeader = ({ title }) => (
    <div className={`font-bold border-b-[1.5px] pb-1 mt-6 mb-2 text-sm uppercase tracking-wider ${isDarkMode ? `border-goldenYellow text-goldenYellow` : `border-blueVelvet text-blueVelvet`}`}>
      {title}
    </div>
  );

  const DynamicList = ({ items, category, setState, isDeductible = false }) => {
    return (
      <div className="space-y-1 mb-4">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/50 py-1 -mx-2 px-2 rounded">
            <input
              type="text"
              value={item.name ?? ''}
              onChange={(e) => handleItemChange(setState, category, item.id, 'name', e.target.value)}
              className={`flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blueJeans focus:outline-none transition-colors text-sm dark:text-slate-200`}
              placeholder="Line Item Name"
            />
            <div className="flex items-center gap-4">
              <CurrencyInput value={item.amount1 ?? 0} onChange={(val) => handleItemChange(setState, category, item.id, 'amount1', val)} currencySymbol={currencySymbolStr} showSymbol={index === 0} isDeductible={isDeductible} />
              {isTwoYear && (
                <CurrencyInput value={item.amount2 ?? 0} onChange={(val) => handleItemChange(setState, category, item.id, 'amount2', val)} currencySymbol={currencySymbolStr} showSymbol={index === 0} isDeductible={isDeductible} />
              )}
              <button onClick={() => removeItem(setState, category, item.id)} className="w-5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        <button onClick={() => addItem(setState, category)} className={`text-xs hover:opacity-80 flex items-center gap-1 font-medium mt-1 text-tangerine`}>
          <Plus size={14} /> Add Line Item
        </button>
      </div>
    );
  };

  const TotalRow = ({ label, amount1, amount2, isFinal = false }) => {
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
          {isTwoYear && (
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

  const LinkedRow = ({ label, amount1, amount2 }) => {
    return (
      <div className={`flex justify-between items-center py-1 text-sm border-y border-transparent ${isDarkMode ? `bg-blueVelvet/30 text-slate-200` : `bg-blueJeans/10`}`}>
        <span className="flex items-center gap-2 italic">
          {label} <span className={`text-[10px] px-1.5 py-0.5 rounded-full not-italic ${isDarkMode ? `bg-blueVelvet text-goldenYellow` : `bg-blueJeans/20 text-blueVelvet`}`}>Auto</span>
        </span>
        <div className="flex items-center gap-4">
          <CurrencyInput value={amount1 ?? 0} onChange={()=>{}} currencySymbol={currencySymbolStr} showSymbol={false} readOnly={true} />
          {isTwoYear && <CurrencyInput value={amount2 ?? 0} onChange={()=>{}} currencySymbol={currencySymbolStr} showSymbol={false} readOnly={true} />}
          <div className="w-5" />
        </div>
      </div>
    );
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center bg-blueVelvet text-slate-100 p-4`}>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-2xl max-w-md w-full text-slate-800 dark:text-slate-100">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-1">
                <img src="/logo-1.png" alt="Xeia Finance Logo" className="h-14 w-auto object-contain" />
                <h1 className="text-2xl font-bold text-blueVelvet dark:text-goldenYellow">Xeia Finance</h1>
              </div>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Powered and Owned by Jaynard L. Monleon</p>
            </div>
            <h2 className="text-center font-semibold mb-6">Authorized Access Only</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400"><Lock size={18}/></span>
                <input 
                  type="text" 
                  value={loginName ?? ''} 
                  onChange={(e) => setLoginName(e.target.value)} 
                  className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blueJeans`}
                  placeholder="Enter authorized name..."
                  autoComplete="off"
                />
              </div>
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button type="submit" className={`w-full bg-tangerine hover:opacity-90 text-white font-bold py-2.5 rounded-md transition-opacity`}>
              Access System
            </button>
          </form>
        </div>
        <p className="mt-8 text-xs text-center max-w-2xl opacity-70 leading-relaxed px-4">
          {LEGAL_DISCLAIMER}
        </p>
      </div>
    );
  }

  // --- RENDER MAIN APP ---
  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className={`min-h-screen font-sans pb-20 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200`}>
        
        {/* Top Header */}
        <header className={`bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between overflow-x-auto">
            <div className="flex items-center gap-2 mr-4">
              <div className={`bg-blueJeans text-white p-2 rounded-lg shrink-0`}><Building2 size={20} /></div>
              <h1 className={`text-xl font-bold text-blueVelvet dark:text-goldenYellow whitespace-nowrap`}>Xeia Finance</h1>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Toggle Dark Mode">
                {isDarkMode ? <Sun size={18} className={`text-goldenYellow`} /> : <Moon size={18} className={`text-blueVelvet`} />}
              </button>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>

              <button onClick={() => setIsConsolidated(!isConsolidated)} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
                {isConsolidated ? <CheckSquare className={`text-tangerine`} size={16}/> : <Square className="text-slate-400" size={16}/>}
                Consolidated
              </button>
              <button onClick={() => setIsTwoYear(!isTwoYear)} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
                {isTwoYear ? <ToggleRight className={`text-tangerine`} size={18}/> : <ToggleLeft className="text-slate-400" size={18}/>}
                {isTwoYear ? '2-Year' : '1-Year'}
              </button>
              <select value={currency ?? ''} onChange={(e) => setCurrency(e.target.value)} className="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm rounded-md px-2 py-1.5 focus:outline-none cursor-pointer">
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>

              {/* SAVE / LOAD SESSION CONTROLS */}
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
              
              <div className="flex gap-2 relative">
                 <button onClick={handleSaveSession} className={`flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 text-blueVelvet dark:text-slate-200 hover:bg-slate-200 px-3 py-1.5 rounded-md border border-slate-300 font-medium text-sm transition-all`}>
                    <Save size={16} /> Save Backup 
                 </button>

                 <label className={`flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 text-blueVelvet dark:text-slate-200 hover:bg-slate-200 px-3 py-1.5 rounded-md border border-slate-300 font-medium text-sm transition-all cursor-pointer`}>
                    <Upload size={16} /> Load Backup
                    <input type="file" ref={fileInputRef} onChange={handleLoadSession} accept=".xeia,.json" className="hidden" />
                 </label>
              </div>
              
              <button onClick={exportToExcel} disabled={isExportingExcel} className={`flex items-center gap-1.5 bg-goldStars/10 text-goldStars hover:bg-goldStars/20 px-4 py-1.5 rounded-md border border-goldStars/30 font-bold text-sm transition-all ml-2`}>
                <FileSpreadsheet size={16} /> Export to Excel 
              </button>
            </div>
          </div>
        </header>

        <main className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8`}>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-1 mb-6 border-b border-slate-200 dark:border-slate-700 pb-px">
            {[
              { id: 'balance', icon: Building2, label: 'Financial Position' },
              { id: 'spl', icon: FileText, label: 'Comp. Income' },
              { id: 'sce', icon: PieChart, label: 'Changes in Equity' },
              { id: 'cashflow', icon: DollarSign, label: 'Cash Flows' },
              { id: 'ratios', icon: LineChart, label: 'Analysis & Ratios' },
              { id: 'tax', icon: Receipt, label: 'BIR Taxes' },
              { id: 'payroll', icon: Users, label: 'Payroll' },
            ].map((tab) => (
              <button
                key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium transition-colors text-sm ${
                  activeTab === tab.id 
                    ? `bg-white dark:bg-slate-800 text-tangerine border-t-[3px] border-t-tangerine border-l border-r border-slate-200 dark:border-slate-700 shadow-[0_4px_0_0_white] dark:shadow-[0_4px_0_0_#1e293b] -mb-[1px]` 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          {/* --- MAIN CONTENT AREA --- */}
          <div className={`bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-8 rounded-b-lg rounded-tr-lg min-h-[800px]`}>
            
            {/* General Document Header */}
            {(activeTab !== 'tax' && activeTab !== 'payroll') && (
              <div className="mb-6">
                <input type="text" value={companyName ?? ''} onChange={(e) => setCompanyName(e.target.value)} className={`text-2xl font-bold uppercase tracking-wide bg-transparent border-none focus:outline-none w-full ${isDarkMode ? `text-goldenYellow` : `text-blueVelvet`}`} placeholder="COMPANY NAME" />
                <input type="text" value={dbaName ?? ''} onChange={(e) => setDbaName(e.target.value)} className="text-sm tracking-wide bg-transparent border-none focus:outline-none w-full text-slate-600 dark:text-slate-400" placeholder="Doing business under..." />
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

            {/* 1. STATEMENT OF FINANCIAL POSITION (2-Column) */}
            {activeTab === 'balance' && (
              <div className="mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
                  <div>
                    <div className="flex justify-end border-b-[1.5px] border-slate-800 dark:border-slate-300 pb-1 gap-4">
                      <input type="text" value={year1 ?? ''} onChange={e => setYear1(e.target.value)} className="w-28 text-right font-bold bg-transparent border-none focus:outline-none text-sm" />
                      {isTwoYear && <input type="text" value={year2 ?? ''} onChange={e => setYear2(e.target.value)} className="w-28 text-right font-bold bg-transparent border-none focus:outline-none text-sm" />}
                      <div className="w-5" />
                    </div>

                    <SectionHeader title="ASSETS" />
                    <div className="font-semibold text-xs text-slate-700 dark:text-slate-400 mb-1 mt-2">Current Assets</div>
                    <LinkedRow label="Cash & Equivalents" amount1={endCash1} amount2={endCash2} />
                    <DynamicList items={bsData.currentAssets} category="currentAssets" setState={setBsData} />
                    <TotalRow label="Total Current Assets" amount1={ca1} amount2={ca2} />

                    <div className="font-semibold text-xs text-slate-700 dark:text-slate-400 mb-1 mt-6">Noncurrent Assets</div>
                    <DynamicList items={bsData.nonCurrentAssets} category="nonCurrentAssets" setState={setBsData} />
                    <TotalRow label="Total Noncurrent Assets" amount1={nca1} amount2={nca2} />
                    
                    <div className="mt-8"><TotalRow label="TOTAL ASSETS" amount1={ta1} amount2={ta2} isFinal /></div>
                  </div>

                  <div>
                    <div className="flex justify-end border-b-[1.5px] border-slate-800 dark:border-slate-300 pb-1 gap-4">
                      <input type="text" value={year1 ?? ''} onChange={e => setYear1(e.target.value)} className="w-28 text-right font-bold bg-transparent border-none focus:outline-none text-sm" />
                      {isTwoYear && <input type="text" value={year2 ?? ''} onChange={e => setYear2(e.target.value)} className="w-28 text-right font-bold bg-transparent border-none focus:outline-none text-sm" />}
                      <div className="w-5" />
                    </div>

                    <SectionHeader title="LIABILITIES AND EQUITY" />
                    <div className="font-semibold text-xs text-slate-700 dark:text-slate-400 mb-1 mt-2">Current Liabilities</div>
                    <DynamicList items={bsData.currentLiabilities} category="currentLiabilities" setState={setBsData} />
                    <TotalRow label="Total Current Liabilities" amount1={cl1} amount2={cl2} />

                    <div className="font-semibold text-xs text-slate-700 dark:text-slate-400 mb-1 mt-6">Noncurrent Liabilities</div>
                    <DynamicList items={bsData.nonCurrentLiabilities} category="nonCurrentLiabilities" setState={setBsData} />
                    <TotalRow label="Total Noncurrent Liabilities" amount1={ncl1} amount2={ncl2} />
                    <TotalRow label="Total Liabilities" amount1={tl1} amount2={tl2} />

                    <div className="font-semibold text-xs text-slate-700 dark:text-slate-400 mb-1 mt-6">Equity</div>
                    <LinkedRow label="Total Capital (Retained Earnings)" amount1={endEq1} amount2={endEq2} />
                    
                    <div className="mt-8"><TotalRow label="TOTAL LIABILITIES & EQUITY" amount1={tle1} amount2={tle2} isFinal /></div>
                  </div>
                </div>
              </div>
            )}

            {/* Single Column Shared Header */}
            {(activeTab !== 'balance' && activeTab !== 'tax' && activeTab !== 'payroll' && activeTab !== 'ratios') && (
              <div className={`flex justify-end border-b-[1.5px] border-slate-800 dark:border-slate-300 pb-1 gap-4 mb-4`}>
                 <input type="text" value={year1 ?? ''} onChange={e => setYear1(e.target.value)} className="w-28 text-right font-bold bg-transparent border-none focus:outline-none text-sm" />
                 {isTwoYear && <input type="text" value={year2 ?? ''} onChange={e => setYear2(e.target.value)} className="w-28 text-right font-bold bg-transparent border-none focus:outline-none text-sm" />}
                 <div className="w-5" />
              </div>
            )}

            {/* 2. STATEMENT OF COMPREHENSIVE INCOME */}
            {activeTab === 'spl' && (
              <div className="mb-16">
                <SectionHeader title="Revenues" />
                <DynamicList items={splData.revenues} category="revenues" setState={setSplData} />
                <TotalRow label="Total Revenues" amount1={rev1} amount2={rev2} />

                <SectionHeader title="Cost of Sales" />
                <DynamicList items={splData.cogs} category="cogs" setState={setSplData} isDeductible />
                <TotalRow label="Gross Profit" amount1={gp1} amount2={gp2} />

                <SectionHeader title="Operating Expenses" />
                <DynamicList items={splData.expenses} category="expenses" setState={setSplData} isDeductible />
                
                <TotalRow label="Net Income / (Loss)" amount1={ni1} amount2={ni2} />

                <SectionHeader title="Other Comprehensive Income" />
                <DynamicList items={splData.oci} category="oci" setState={setSplData} />
                <TotalRow label="Total Other Comprehensive Income" amount1={oci1} amount2={oci2} />

                <div className="mt-8">
                  <TotalRow label="Comprehensive Income" amount1={compInc1} amount2={compInc2} isFinal />
                </div>
              </div>
            )}

            {/* 3. SCE */}
            {activeTab === 'sce' && (
              <div className="mb-16">
                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700 mb-4">
                  <span className="font-bold text-sm">Beginning Capital Balance</span>
                  <div className="flex gap-4">
                    <CurrencyInput value={sceData.beginningCapital1 ?? 0} onChange={val => setSceData({...sceData, beginningCapital1: val})} currencySymbol={currencySymbolStr} />
                    {isTwoYear && <CurrencyInput value={sceData.beginningCapital2 ?? 0} onChange={val => setSceData({...sceData, beginningCapital2: val})} currencySymbol={currencySymbolStr} />}
                    <div className="w-5"/>
                  </div>
                </div>
                <SectionHeader title="Additions" />
                <LinkedRow label="Net Income" amount1={ni1} amount2={ni2} />
                <LinkedRow label="Other Comprehensive Income" amount1={oci1} amount2={oci2} />
                <DynamicList items={sceData.investments} category="investments" setState={setSceData} />
                <SectionHeader title="Deductions" />
                <DynamicList items={sceData.dividends} category="dividends" setState={setSceData} isDeductible />
                <TotalRow label="Ending Capital (Equity)" amount1={endEq1} amount2={endEq2} isFinal />
              </div>
            )}

            {/* 4. CF */}
            {activeTab === 'cashflow' && (
              <div className="mb-16">
                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700 mb-4">
                  <span className="font-bold text-sm">Beginning Cash Balance</span>
                  <div className="flex gap-4">
                    <CurrencyInput value={cfData.beginningCash1 ?? 0} onChange={val => setCfData({...cfData, beginningCash1: val})} currencySymbol={currencySymbolStr} />
                    {isTwoYear && <CurrencyInput value={cfData.beginningCash2 ?? 0} onChange={val => setCfData({...cfData, beginningCash2: val})} currencySymbol={currencySymbolStr} />}
                    <div className="w-5"/>
                  </div>
                </div>
                <SectionHeader title="Cash Flows from Operating Activities" />
                <LinkedRow label="Net Income" amount1={ni1} amount2={ni2} />
                <DynamicList items={cfData.operating} category="operating" setState={setCfData} />
                <TotalRow label="Net Cash from Operating Activities" amount1={opCF1} amount2={opCF2} />
                <SectionHeader title="Cash Flows from Investing Activities" />
                <DynamicList items={cfData.investing} category="investing" setState={setCfData} />
                <TotalRow label="Net Cash from Investing Activities" amount1={invCF1} amount2={invCF2} />
                <SectionHeader title="Cash Flows from Financing Activities" />
                <DynamicList items={cfData.financing} category="financing" setState={setCfData} />
                <LinkedRow label="Less: Dividends Paid" amount1={-div1} amount2={-div2} />
                <TotalRow label="Net Cash from Financing Activities" amount1={finCF1} amount2={finCF2} />
                <div className="mt-6">
                  <TotalRow label="Net Increase (Decrease) in Cash" amount1={netCash1} amount2={netCash2} />
                  <TotalRow label="Ending Cash Balance" amount1={endCash1} amount2={endCash2} isFinal />
                </div>
              </div>
            )}

            {/* 5. RATIOS & ANALYSIS */}
            {activeTab === 'ratios' && (
              <div className="mb-16">
                <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg mb-8 flex gap-8 items-center border border-slate-200 dark:border-slate-600">
                  <span className="font-bold text-sm flex items-center gap-2"><Calculator size={16} className={`text-tangerine`}/> Project Initial Investment <br/><span className="font-normal text-xs text-slate-500">(For ROI & Payback)</span></span>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500">{year1}</label>
                    <CurrencyInput value={ratioData.initialInvestment1 ?? 0} onChange={v => setRatioData({...ratioData, initialInvestment1: v})} currencySymbol={currencySymbolStr} />
                  </div>
                  {isTwoYear && (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500">{year2}</label>
                      <CurrencyInput value={ratioData.initialInvestment2 ?? 0} onChange={v => setRatioData({...ratioData, initialInvestment2: v})} currencySymbol={currencySymbolStr} />
                    </div>
                  )}
                </div>
                
                <SectionHeader title="Key Financial Performance Indicators" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                  {[
                    { label: 'Current Ratio', f1: ca1/cl1, f2: ca2/cl2, suffix: 'x' },
                    { label: 'Debt to Equity', f1: tl1/endEq1, f2: tl2/endEq2, suffix: 'x' },
                    { label: 'Net Profit Margin', f1: (ni1/rev1)*100, f2: (ni2/rev2)*100, suffix: '%' },
                    { label: 'Return on Assets', f1: (ni1/ta1)*100, f2: (ni2/ta2)*100, suffix: '%' },
                    { label: 'Return on Investment', f1: (ni1/ratioData.initialInvestment1)*100, f2: (ni2/ratioData.initialInvestment2)*100, suffix: '%' },
                    { label: 'Payback Period', f1: ratioData.initialInvestment1/opCF1, f2: ratioData.initialInvestment2/opCF2, suffix: ' yrs' },
                  ].map((r, i) => (
                    <div key={i} className={`border border-slate-200 dark:border-slate-600 rounded p-3 bg-slate-50 dark:bg-slate-700/30 border-l-4 border-l-goldenYellow`}>
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{r.label}</div>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className={`font-black text-lg text-blueVelvet dark:text-white`}>{isFinite(r.f1) ? r.f1.toFixed(2) : 'N/A'}{isFinite(r.f1) ? r.suffix : ''}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{year1}</div>
                        </div>
                        {isTwoYear && (
                          <div className="text-right">
                            <div className="font-bold text-sm text-slate-600 dark:text-slate-300">{isFinite(r.f2) ? r.f2.toFixed(2) : 'N/A'}{isFinite(r.f2) ? r.suffix : ''}</div>
                            <div className="text-[10px] text-slate-400 font-bold">{year2}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`mt-8 grid grid-cols-1 ${isTwoYear ? 'md:grid-cols-2' : ''} gap-8`}>
                  {isTwoYear && (
                    <div>
                      <SectionHeader title="Horizontal Analysis (YoY Change)" />
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
                            { n: 'Total Revenues', v1: rev1, v2: rev2 },
                            { n: 'Gross Profit', v1: gp1, v2: gp2 },
                            { n: 'Net Income', v1: ni1, v2: ni2 },
                            { n: 'Comprehensive Inc.', v1: compInc1, v2: compInc2 },
                            { n: 'Total Assets', v1: ta1, v2: ta2 },
                            { n: 'Total Liabilities', v1: tl1, v2: tl2 },
                            { n: 'Total Equity', v1: endEq1, v2: endEq2 },
                          ].map((row, i) => {
                            const amtChange = row.v1 - row.v2;
                            const pctChange = row.v2 !== 0 ? (amtChange / row.v2) * 100 : 0;
                            return (
                              <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                                <td className="py-2">{row.n}</td>
                                <td className={`py-2 text-right ${amtChange < 0 ? 'text-red-600' : ''}`}>{Number(amtChange).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                <td className={`py-2 text-right font-bold ${pctChange < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{pctChange > 0 ? '+' : ''}{pctChange.toFixed(1)}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div>
                    <SectionHeader title={`Vertical Analysis (${year1})`} />
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
                          { n: 'Cost of Sales', v: cogs1, base: rev1, baseN: 'Revenue' },
                          { n: 'Gross Profit', v: gp1, base: rev1, baseN: 'Revenue' },
                          { n: 'Operating Exp.', v: exp1, base: rev1, baseN: 'Revenue' },
                          { n: 'Net Income', v: ni1, base: rev1, baseN: 'Revenue' },
                          { n: 'Comprehensive Inc.', v: compInc1, base: rev1, baseN: 'Revenue' },
                          { n: 'Current Assets', v: ca1, base: ta1, baseN: 'Total Assets' },
                          { n: 'Total Liabilities', v: tl1, base: ta1, baseN: 'Total Assets' },
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                            <td className="py-2">{row.n}</td>
                            <td className="py-2 text-right font-bold text-slate-700 dark:text-slate-300">{row.base !== 0 ? ((row.v / row.base) * 100).toFixed(1) : '0.0'}%</td>
                            <td className="py-2 text-right text-xs text-slate-400">{row.baseN}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 6. BIR TAX ENGINE */}
            {activeTab === 'tax' && (
              <div className="animate-in fade-in">
                <h2 className={`text-2xl font-bold text-blueVelvet dark:text-goldenYellow mb-2 text-center`}>Bureau of Internal Revenue (BIR) Tax Engine</h2>
                <p className="text-center text-slate-500 mb-8">Compute standard Philippine taxes using dynamic tables and rates.</p>

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
                        className={`w-full text-left px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTaxSubTab === t.id ? `bg-blueJeans/10 text-blueJeans dark:text-goldenYellow border border-blueJeans/20` : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="col-span-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
                      <h3 className={`font-bold text-lg mb-4 text-blueVelvet dark:text-white capitalize`}>{activeTaxSubTab.replace('_', ' ')} Settings</h3>

                      {activeTaxSubTab === 'income' ? (
                        <div>
                          <p className="text-xs text-slate-500 mb-4">Edit the graduated tax table brackets or use a flat corporate rate below.</p>
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
                                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400 font-mono">₱{Number(row.min ?? 0).toLocaleString()}</td>
                                    <td className="px-3 py-1">
                                      {row.max === Infinity ? <span className="text-slate-500 italic px-2">Infinity</span> : 
                                        <input type="number" value={row.max ?? ''} onChange={(e) => {
                                          const newTable = [...incomeTaxTable];
                                          newTable[idx].max = Number(e.target.value);
                                          if (newTable[idx+1]) newTable[idx+1].min = Number(e.target.value);
                                          setIncomeTaxTable(newTable);
                                        }} className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 focus:outline-blue-500 font-mono"/>
                                      }
                                    </td>
                                    <td className="px-3 py-1">
                                      <input type="number" value={row.baseTax ?? 0} onChange={(e) => {
                                          const newTable = [...incomeTaxTable];
                                          newTable[idx].baseTax = Number(e.target.value);
                                          setIncomeTaxTable(newTable);
                                      }} className="w-full text-right bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 focus:outline-blue-500 font-mono"/>
                                    </td>
                                    <td className="px-3 py-1">
                                      <input type="number" value={row.excessRate ?? 0} onChange={(e) => {
                                          const newTable = [...incomeTaxTable];
                                          newTable[idx].excessRate = Number(e.target.value);
                                          setIncomeTaxTable(newTable);
                                      }} className="w-full text-right bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 focus:outline-blue-500 font-mono"/>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Or select a Flat Corporate Rate:</label>
                            <select value={selectedFlatTax ?? ''} onChange={(e) => setSelectedFlatTax(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-blue-500">
                              <option value="">-- Use Graduated Table Above (Individual) --</option>
                              {flatTaxRates.income.map(rate => (
                                <option key={rate.id} value={rate.id}>{rate.name} ({rate.rate}%)</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Specific Tax Category:</label>
                          <div className="space-y-2">
                            {flatTaxRates[activeTaxSubTab]?.map(rate => (
                              <div key={rate.id} className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 rounded-md">
                                <input 
                                  type="radio" id={rate.id} name="taxCategory" value={rate.id} 
                                  checked={selectedFlatTax === rate.id} onChange={(e) => setSelectedFlatTax(e.target.value)}
                                  className={`accent-blueJeans`}
                                />
                                <label htmlFor={rate.id} className="flex-1 font-medium text-slate-700 dark:text-slate-300 cursor-pointer">{rate.name}</label>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number" value={rate.rate ?? 0} 
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
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Enter Tax Basis Amount (₱):</label>
                        <div className="flex gap-4 items-center">
                          <CurrencyInput value={taxBasisInput ?? 0} onChange={setTaxBasisInput} currencySymbol="₱" />
                          <button onClick={calculateTax} className={`bg-tangerine hover:opacity-90 text-white px-6 py-2 rounded-md font-medium transition-colors`}>
                            Calculate & Add to Ledger
                          </button>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200"><Receipt size={18}/> Global Tax Ledger</h3>
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
                                <td className="px-4 py-3 text-right font-mono">₱{t.basis.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                <td className={`px-4 py-3 text-right font-bold text-tangerine font-mono`}>₱{t.computed.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                <td className="px-4 py-3 text-center">
                                  <button onClick={() => setTaxLedger(taxLedger.filter(x => x.id !== t.id))} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-slate-50 dark:bg-slate-800 border-t-2 border-slate-800 dark:border-slate-400 font-bold">
                            <tr>
                              <td colSpan="3" className="px-4 py-3 text-right">Total Tax Liability:</td>
                              <td className="px-4 py-3 text-right text-lg text-red-600 dark:text-red-400 font-mono">₱{sum(taxLedger, 'computed').toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
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
                <h2 className={`text-2xl font-bold text-blueVelvet dark:text-goldenYellow mb-2 text-center`}>Employee Payroll & Government Contributions</h2>
                <p className="text-center text-slate-500 mb-8">Compute gross pay, overtime, night differential, SSS, PhilHealth, and Pag-IBIG.</p>

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
                  <label className="text-sm flex items-center gap-2">Work Days/Month: <input type="number" value={payrollConfig.workDaysPerMonth ?? 0} onChange={e => setPayrollConfig({...payrollConfig, workDaysPerMonth: Number(e.target.value)})} className="w-16 bg-transparent border border-slate-300 dark:border-slate-600 rounded px-2 py-1" /></label>
                  <label className="text-sm flex items-center gap-2">Hours/Day: <input type="number" value={payrollConfig.hoursPerDay ?? 0} onChange={e => setPayrollConfig({...payrollConfig, hoursPerDay: Number(e.target.value)})} className="w-16 bg-transparent border border-slate-300 dark:border-slate-600 rounded px-2 py-1" /></label>
                  <label className="text-sm flex items-center gap-2">Night Diff (+%): <input type="number" step="0.01" value={payrollConfig.ndMultiplier ?? 0} onChange={e => setPayrollConfig({...payrollConfig, ndMultiplier: Number(e.target.value)})} className="w-20 bg-transparent border border-slate-300 dark:border-slate-600 rounded px-2 py-1" /></label>
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
                        
                        {/* Dynamic Earnings Headers */}
                        {payrollCols.earnings.map(col => (
                          <th key={col.id} className={`px-3 py-3 font-semibold text-right bg-blueJeans border-l border-white/20 p-0`}>
                            <div className="flex items-center justify-end">
                              <input 
                                type="text" value={col.name ?? ''} 
                                onChange={e => {
                                  const newCols = [...payrollCols.earnings];
                                  newCols.find(c => c.id === col.id).name = e.target.value;
                                  setPayrollCols({...payrollCols, earnings: newCols});
                                }}
                                className="w-full text-right bg-transparent font-semibold focus:outline-none px-2 py-2"
                              />
                              <button onClick={() => {
                                setPayrollCols({...payrollCols, earnings: payrollCols.earnings.filter(c => c.id !== col.id)});
                                setEmployees(employees.map(e => { const newE = {...e, earnings: {...e.earnings}}; delete newE.earnings[col.id]; return newE; }));
                              }} className="px-1 text-white/50 hover:text-red-400"><Trash2 size={12}/></button>
                            </div>
                          </th>
                        ))}
                        
                        <th className={`px-3 py-3 font-semibold text-right font-bold border-x border-white/20 bg-goldStars text-white`}>Gross Pay</th>
                        
                        <th className="px-3 py-3 font-semibold text-right">SSS</th>
                        <th className="px-3 py-3 font-semibold text-right">PhilHealth</th>
                        <th className="px-3 py-3 font-semibold text-right">Pag-IBIG</th>
                        <th className="px-3 py-3 font-semibold text-right border-r border-white/20">Tax (WHT)</th>

                        {/* Dynamic Deductions Headers */}
                        {payrollCols.deductions.map(col => (
                          <th key={col.id} className="px-3 py-3 font-semibold text-right bg-red-900 border-l border-white/20 p-0">
                            <div className="flex items-center justify-end">
                              <input 
                                type="text" value={col.name ?? ''} 
                                onChange={e => {
                                  const newCols = [...payrollCols.deductions];
                                  newCols.find(c => c.id === col.id).name = e.target.value;
                                  setPayrollCols({...payrollCols, deductions: newCols});
                                }}
                                className="w-full text-right bg-transparent font-semibold focus:outline-none px-2 py-2"
                              />
                              <button onClick={() => {
                                setPayrollCols({...payrollCols, deductions: payrollCols.deductions.filter(c => c.id !== col.id)});
                                setEmployees(employees.map(e => { const newE = {...e, deductions: {...e.deductions}}; delete newE.deductions[col.id]; return newE; }));
                              }} className="px-1 text-white/50 hover:text-red-400"><Trash2 size={12}/></button>
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
                            <td className="px-3 py-3"><input type="text" value={emp.name ?? ''} onChange={e => updateEmp('name', e.target.value)} className={`w-full bg-transparent border-b border-transparent focus:border-blueJeans focus:outline-none font-medium`}/></td>
                            <td className="px-3 py-3"><CurrencyInput value={emp.basePay ?? 0} onChange={v => updateEmp('basePay', v)} currencySymbol="" showSymbol={false} /></td>
                            <td className="px-3 py-3 text-right text-slate-500 dark:text-slate-400 font-mono">₱{daily.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                            
                            <td className="px-3 py-3 bg-blue-50/30 dark:bg-blue-900/10 border-l border-slate-100 dark:border-slate-700">
                              <CurrencyInput value={emp.otPay ?? 0} onChange={v => updateEmp('otPay', v)} currencySymbol="₱" showSymbol={false} />
                            </td>
                            <td className="px-3 py-3 bg-indigo-50/30 dark:bg-indigo-900/10 border-l border-slate-100 dark:border-slate-700">
                              <CurrencyInput value={emp.ndPay ?? 0} onChange={v => updateEmp('ndPay', v)} currencySymbol="₱" showSymbol={false} />
                            </td>

                            {/* Dynamic Earnings Inputs */}
                            {payrollCols.earnings.map(col => (
                              <td key={`earn_${col.id}`} className="px-3 py-3 border-l border-slate-100 dark:border-slate-700">
                                <CurrencyInput value={(emp.earnings || {})[col.id] || 0} onChange={v => updateCustomEarning(col.id, v)} currencySymbol="₱" showSymbol={false} />
                              </td>
                            ))}

                            <td className="px-3 py-3 text-right font-bold text-slate-800 dark:text-slate-200 border-x border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80 font-mono">₱{grossPay.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                            
                            <td className="px-3 py-3 bg-red-50/30 dark:bg-red-900/10"><CurrencyInput value={emp.sss ?? 0} onChange={v => updateEmp('sss', v)} currencySymbol="₱" showSymbol={false} /></td>
                            <td className="px-3 py-3 bg-red-50/30 dark:bg-red-900/10"><CurrencyInput value={emp.philhealth ?? 0} onChange={v => updateEmp('philhealth', v)} currencySymbol="₱" showSymbol={false} /></td>
                            <td className="px-3 py-3 bg-red-50/30 dark:bg-red-900/10"><CurrencyInput value={emp.pagibig ?? 0} onChange={v => updateEmp('pagibig', v)} currencySymbol="₱" showSymbol={false} /></td>
                            <td className="px-3 py-3 bg-red-50/30 dark:bg-red-900/10 border-r border-slate-100 dark:border-slate-700"><CurrencyInput value={emp.withholding ?? 0} onChange={v => updateEmp('withholding', v)} currencySymbol="₱" showSymbol={false} /></td>

                            {/* Dynamic Deductions Inputs */}
                            {payrollCols.deductions.map(col => (
                              <td key={`ded_${col.id}`} className="px-3 py-3 border-l border-slate-100 dark:border-slate-700 bg-red-50/50 dark:bg-red-900/20">
                                <CurrencyInput value={(emp.deductions || {})[col.id] || 0} onChange={v => updateCustomDeduction(col.id, v)} currencySymbol="₱" showSymbol={false} isDeductible />
                              </td>
                            ))}

                            <td className={`px-3 py-3 text-right font-bold text-blueVelvet dark:text-white bg-goldenYellow/20 font-mono`}>₱{netPay.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                            <td className="px-3 py-3 text-center"><button onClick={() => setEmployees(employees.filter(x => x.id !== emp.id))} className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <button onClick={() => {
                  const newEmp = { id: Date.now(), name: 'New Employee', basePay: 0, otPay: 0, ndPay: 0, earnings: {}, deductions: {}, sss: 0, philhealth: 0, pagibig: 0, withholding: 0 };
                  payrollCols.earnings.forEach(c => newEmp.earnings[c.id] = 0);
                  payrollCols.deductions.forEach(c => newEmp.deductions[c.id] = 0);
                  setEmployees([...employees, newEmp]);
                }} className={`mt-4 text-sm text-blueJeans dark:text-goldenYellow hover:opacity-80 flex items-center gap-1 font-medium`}>
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
                          type="number" placeholder="Hrs" title="OT Hours"
                          value={calcState.otHours ?? 0} onChange={e => setCalcState({...calcState, otHours: Number(e.target.value)})}
                          className="w-1/3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-2 text-sm focus:outline-blue-500"
                        />
                        <select 
                          value={calcState.otType ?? 1.25} onChange={e => setCalcState({...calcState, otType: Number(e.target.value)})}
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
                        type="number" placeholder="Hrs"
                        value={calcState.ndHours ?? 0} onChange={e => setCalcState({...calcState, ndHours: Number(e.target.value)})}
                        className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-2 text-sm focus:outline-blue-500"
                      />
                    </div>

                    <div className="lg:col-span-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded px-3 py-1 flex items-center justify-between h-[38px]">
                      <div>
                        <div className="text-[10px] text-blue-600 dark:text-blue-300 font-bold leading-tight">OT: ₱{(computedOtPay || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-300 font-bold leading-tight mt-0.5">ND: ₱{(computedNdPay || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
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

                {/* Reference Tables for Payroll */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 print:mt-8">
                  <div>
                    <SectionHeader title="Statutory Overtime & ND Multipliers (Reference)" />
                    <table className="w-full text-sm mt-4 border border-slate-200 dark:border-slate-700">
                      <thead className={`bg-blueJeans text-white`}>
                        <tr className="text-left text-xs font-bold">
                          <th className="px-4 py-2">Day of Work / Overtime</th>
                          <th className="px-4 py-2 text-right">Hourly Multiplier</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800"><td className="px-4 py-2">Ordinary / Regular Day</td><td className={`px-4 py-2 text-right font-mono font-bold text-tangerine`}>1.25</td></tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800"><td className="px-4 py-2">Rest Days or Special Holidays</td><td className={`px-4 py-2 text-right font-mono font-bold text-tangerine`}>1.30</td></tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800"><td className="px-4 py-2">Special Holiday that is also a Rest Day</td><td className={`px-4 py-2 text-right font-mono font-bold text-tangerine`}>1.50</td></tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800"><td className="px-4 py-2">Regular Holiday</td><td className={`px-4 py-2 text-right font-mono font-bold text-tangerine`}>1.30</td></tr>
                        <tr className="bg-slate-50 dark:bg-slate-800/50"><td className="px-4 py-2 italic text-slate-500">Ordinary / Regular Night Shift (ND)</td><td className="px-4 py-2 text-right font-mono font-bold text-indigo-500">+ 10% (1.10)</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <SectionHeader title="Government Contribution Bases (Reference)" />
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

          </div>
          
          <footer className="mt-8 text-center text-xs opacity-60 max-w-4xl mx-auto pb-10">
            {LEGAL_DISCLAIMER}
          </footer>
        </main>
      </div>
    </div>
  );
}