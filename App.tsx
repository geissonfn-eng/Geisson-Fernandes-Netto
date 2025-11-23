import React, { useState, useEffect } from 'react';
import { FinancialData, Bill, CategoryType } from './types';
import { BillList } from './components/BillList';
import { SummaryCard } from './components/SummaryCard';
import { ReportModal } from './components/ReportModal';
import { CostChart } from './components/CostChart';
import { ChatWidget } from './components/ChatWidget';
import { LockScreen } from './components/LockScreen';
import { Wallet, Users, Calculator, PieChart, FileText, Lock, ShieldCheck } from 'lucide-react';

// Initial Data
const INITIAL_DATA: FinancialData = {
  personal: [
    { id: 'p1', name: 'Cartão Mercado Livre', value: 0 },
    { id: 'p2', name: 'TV', value: 0 },
    { id: 'p3', name: 'Consórcio', value: 0 },
    { id: 'p4', name: 'Empréstimo', value: 0 },
    { id: 'p5', name: 'Guarda', value: 0 },
  ],
  joint: [
    { id: 'j1', name: 'Cartão C6', value: 0 },
    { id: 'j2', name: 'Cartão Nubank', value: 0 },
    { id: 'j3', name: 'Internet', value: 0 },
    { id: 'j4', name: 'Clube', value: 0 },
    { id: 'j5', name: 'Escola', value: 0 },
    { id: 'j6', name: 'Água', value: 0 },
    { id: 'j7', name: 'Energia', value: 0 },
  ]
};

const App: React.FC = () => {
  const [data, setData] = useState<FinancialData>(INITIAL_DATA);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Security State
  const [isLocked, setIsLocked] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [savedPin, setSavedPin] = useState<string | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    // 1. Load Data
    const savedData = localStorage.getItem('financeShareData');
    let currentData = INITIAL_DATA;
    if (savedData) {
      try {
        currentData = JSON.parse(savedData);
        setData(currentData);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }

    // 2. Load Security
    const pin = localStorage.getItem('financeSharePin');
    if (pin) {
        setSavedPin(pin);
        setIsLocked(true);
    }

    // 3. Check for New Month (Recurring Payments Logic)
    const lastMonth = localStorage.getItem('financeShareMonth');
    const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM

    if (lastMonth !== currentMonth) {
        // It's a new month! Process recurring payments
        console.log(`New billing cycle detected: ${currentMonth}`);
        
        const processBills = (bills: Bill[]): Bill[] => {
            return bills.map(bill => {
                if (bill.isRecurring && bill.recurringAmount !== undefined) {
                    // Reset to the fixed recurring amount
                    return { ...bill, value: bill.recurringAmount };
                } else {
                    // Reset non-recurring bills to 0 for the new month
                    return { ...bill, value: 0 };
                }
            });
        };

        const newData = {
            personal: processBills(currentData.personal),
            joint: processBills(currentData.joint)
        };

        setData(newData);
        localStorage.setItem('financeShareMonth', currentMonth);
        localStorage.setItem('financeShareData', JSON.stringify(newData)); // Immediate save
    }

    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('financeShareData', JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const updateCategory = (category: CategoryType, updatedBills: Bill[]) => {
    setData(prev => ({
      ...prev,
      [category]: updatedBills
    }));
  };

  const handleSetPin = (newPin: string) => {
      localStorage.setItem('financeSharePin', newPin);
      setSavedPin(newPin);
      setShowPinSetup(false);
      setIsLocked(false);
  };

  const handleUnlock = () => {
      setIsLocked(false);
  };

  const togglePinMode = () => {
      if (savedPin) {
          if (confirm('Deseja remover a proteção por PIN?')) {
              localStorage.removeItem('financeSharePin');
              setSavedPin(null);
          }
      } else {
          setShowPinSetup(true);
      }
  };

  // Calculations
  const totalPersonal = data.personal.reduce((acc, curr) => acc + curr.value, 0);
  const totalJoint = data.joint.reduce((acc, curr) => acc + curr.value, 0);
  const myShareJoint = totalJoint / 2;
  const totalToPay = totalPersonal + myShareJoint;

  if (isLocked) {
      return (
        <LockScreen 
            onUnlock={handleUnlock} 
            onSetPin={() => {}} 
            existingPin={savedPin} 
        />
      );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Security Overlay for Setup */}
      {showPinSetup && (
          <LockScreen 
            isSetupMode 
            onUnlock={() => {}} 
            onSetPin={handleSetPin} 
            onCancelSetup={() => setShowPinSetup(false)}
          />
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Calculator size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">FinanceShare</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
                onClick={togglePinMode}
                className={`p-2 rounded-lg transition-colors ${savedPin ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                title={savedPin ? "Segurança Ativada" : "Ativar Segurança (PIN)"}
            >
                {savedPin ? <ShieldCheck size={20} /> : <Lock size={20} />}
            </button>
            <button 
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
            >
                <FileText size={16} />
                <span className="hidden sm:inline">Gerar Extrato</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Dashboard Overview */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard 
            title="Total Pessoal" 
            amount={totalPersonal} 
            icon={<Wallet size={20} className="text-indigo-600" />}
            colorClass="bg-indigo-600"
          />
          <SummaryCard 
            title="Total Conjunto" 
            amount={totalJoint} 
            icon={<Users size={20} className="text-teal-600" />}
            colorClass="bg-teal-600"
            subtext="Total integral das contas"
          />
          <SummaryCard 
            title="Minha Parte (50%)" 
            amount={myShareJoint} 
            icon={<PieChart size={20} className="text-orange-600" />}
            colorClass="bg-orange-600"
            subtext="Metade do valor conjunto"
          />
          <div className="lg:col-span-1 md:col-span-2">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white h-full flex flex-col justify-between transform transition-transform hover:scale-[1.01]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-sm font-medium uppercase tracking-wider">Total a Pagar</span>
                <Calculator className="text-blue-200 opacity-50" size={24} />
              </div>
              <div>
                 <span className="text-3xl font-bold tracking-tight">
                   {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalToPay)}
                 </span>
                 <p className="text-blue-200 text-sm mt-1">Pessoal + 50% Conjunto</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Input Columns */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <BillList 
              title="Minhas Contas" 
              category="personal"
              bills={data.personal}
              onUpdate={updateCategory}
              colorTheme="bg-indigo-600"
            />
            <BillList 
              title="Contas Conjuntas" 
              category="joint"
              bills={data.joint}
              onUpdate={updateCategory}
              colorTheme="bg-teal-600"
            />
          </div>

          {/* Sidebar / Chart */}
          <div className="lg:col-span-1 space-y-6">
             <CostChart personalTotal={totalPersonal} jointShare={myShareJoint} />
             
             <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <h4 className="text-blue-800 font-semibold mb-2 flex items-center">
                  <span className="bg-blue-200 p-1 rounded mr-2"><Calculator size={14} /></span>
                  Resumo Rápido
                </h4>
                <ul className="space-y-2 text-sm text-blue-900 opacity-80">
                  <li className="flex justify-between">
                    <span>Pessoal:</span>
                    <span className="font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPersonal)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Conjunto (Total):</span>
                    <span className="font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalJoint)}</span>
                  </li>
                  <li className="flex justify-between font-semibold border-t border-blue-200 pt-1 mt-1">
                    <span>Minha responsabilidade:</span>
                    <span className="font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalToPay)}</span>
                  </li>
                </ul>
             </div>
          </div>
        </div>
      </main>

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)}
        jointBills={data.joint}
        personalBills={data.personal}
      />
      
      <ChatWidget data={data} />
    </div>
  );
};

export default App;