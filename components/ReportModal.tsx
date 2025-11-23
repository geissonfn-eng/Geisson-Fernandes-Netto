import React, { useState } from 'react';
import { Bill } from '../types';
import { formatCurrency, getCurrentDateString } from '../utils';
import { X, Copy, Check, Share2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  jointBills: Bill[];
  personalBills: Bill[];
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, jointBills, personalBills }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalJoint = jointBills.reduce((sum, b) => sum + b.value, 0);
  const share = totalJoint / 2;

  // Generate the text message
  const generateMessage = () => {
    const lines = [
      `*Fechamento das contas conjuntas (${getCurrentDateString()})*`,
      ``,
      `--- Detalhes ---`,
      ...jointBills.map(b => `- ${b.name}: ${formatCurrency(b.value)}`),
      `-----------------`,
      `*Total Conjunto: ${formatCurrency(totalJoint)}*`,
      `-----------------`,
      `*Sua parte (50%): ${formatCurrency(share)}*`,
      ``,
      `Por favor, conferir.`
    ];
    return lines.join('\n');
  };

  const message = generateMessage();

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
             <div className="bg-green-100 p-2 rounded-lg text-green-600">
                <Share2 size={20} />
             </div>
             <h3 className="text-xl font-bold text-gray-900">Extrato para Envio</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 bg-gray-50 flex-1 overflow-y-auto">
          <p className="text-sm text-gray-500 mb-2 font-medium">Pré-visualização da mensagem:</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap shadow-sm">
            {message}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white">
          <button
            onClick={handleCopy}
            className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
              copied 
                ? 'bg-green-500 text-white shadow-lg shadow-green-200 scale-[1.02]' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
            }`}
          >
            {copied ? (
              <>
                <Check size={20} />
                <span>Copiado com Sucesso!</span>
              </>
            ) : (
              <>
                <Copy size={20} />
                <span>Copiar Mensagem</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};