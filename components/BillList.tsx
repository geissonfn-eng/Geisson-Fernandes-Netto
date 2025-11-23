import React, { useState } from 'react';
import { Bill, CategoryType } from '../types';
import { formatCurrency, generateId } from '../utils';
import { Trash2, Plus, DollarSign, Repeat } from 'lucide-react';

interface BillListProps {
  title: string;
  category: CategoryType;
  bills: Bill[];
  onUpdate: (category: CategoryType, bills: Bill[]) => void;
  colorTheme: string;
}

export const BillList: React.FC<BillListProps> = ({ title, category, bills, onUpdate, colorTheme }) => {
  const [newBillName, setNewBillName] = useState('');
  const [newBillValue, setNewBillValue] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const handleValueChange = (id: string, newValueStr: string) => {
    // Remove non-numeric chars except dot/comma, replace comma with dot
    const cleanValue = newValueStr.replace(/[^0-9,.]/g, '').replace(',', '.');
    const newValue = parseFloat(cleanValue);

    const updatedBills = bills.map(bill => 
      bill.id === id ? { ...bill, value: isNaN(newValue) ? 0 : newValue } : bill
    );
    onUpdate(category, updatedBills);
  };

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBillName.trim()) return;

    // Use entered value as recurring amount if recurring is checked
    const initialValue = newBillValue ? parseFloat(newBillValue.replace(/[^0-9,.]/g, '').replace(',', '.')) : 0;
    const finalValue = isNaN(initialValue) ? 0 : initialValue;

    const newBill: Bill = {
      id: generateId(),
      name: newBillName,
      value: finalValue,
      isRecurring: isRecurring,
      recurringAmount: isRecurring ? finalValue : undefined
    };

    onUpdate(category, [...bills, newBill]);
    setNewBillName('');
    setNewBillValue('');
    setIsRecurring(false);
  };

  const handleDeleteBill = (id: string) => {
    onUpdate(category, bills.filter(b => b.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className={`p-5 border-b border-gray-100 ${colorTheme} bg-opacity-5`}>
        <h2 className={`text-lg font-bold flex items-center ${colorTheme.replace('bg-', 'text-')}`}>
          {title}
          <span className="ml-2 text-xs font-normal text-gray-500 bg-white px-2 py-0.5 rounded-full border">
            {bills.length} itens
          </span>
        </h2>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
        {bills.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            Nenhuma conta adicionada.
          </div>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => (
              <div key={bill.id} className="flex items-center group bg-gray-50 p-3 rounded-lg border border-transparent focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-700 truncate">{bill.name}</p>
                    {bill.isRecurring && (
                        <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full flex items-center" title={`Recorrente: ${formatCurrency(bill.recurringAmount || 0)}/mês`}>
                            <Repeat size={10} className="mr-1" />
                            Auto
                        </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-xs">R$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={bill.value === 0 ? '' : bill.value}
                      placeholder="0.00"
                      onChange={(e) => handleValueChange(bill.id, e.target.value)}
                      className="w-24 pl-7 pr-2 py-1.5 text-right text-sm border-gray-200 border rounded-md focus:outline-none focus:border-blue-500 transition-colors bg-white font-mono text-gray-800"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteBill(bill.id)}
                    className="text-gray-300 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Remover conta"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
        <form onSubmit={handleAddBill} className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={14} className="text-gray-400" />
               </div>
              <input
                type="text"
                value={newBillName}
                onChange={(e) => setNewBillName(e.target.value)}
                placeholder="Nome da conta..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative w-28">
               <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-400 text-xs">R$</span>
               <input 
                 type="number"
                 value={newBillValue}
                 onChange={(e) => setNewBillValue(e.target.value)}
                 placeholder="0.00"
                 className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsRecurring(!isRecurring)}
                className={`text-xs flex items-center px-2 py-1.5 rounded-md transition-colors border ${
                    isRecurring 
                    ? 'bg-blue-50 text-blue-600 border-blue-200' 
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
                title="Repetir valor automaticamente todo mês"
              >
                  <Repeat size={12} className={`mr-1.5 ${isRecurring ? 'animate-pulse' : ''}`} />
                  {isRecurring ? 'Recorrente (Automático)' : 'Conta Única'}
              </button>

              <button
                type="submit"
                disabled={!newBillName.trim()}
                className="bg-gray-900 text-white p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={20} />
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};