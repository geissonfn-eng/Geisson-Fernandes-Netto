import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ArrowRight, X, ShieldCheck } from 'lucide-react';

interface LockScreenProps {
  isSetupMode?: boolean;
  onUnlock: () => void;
  onSetPin: (pin: string) => void;
  onCancelSetup?: () => void;
  existingPin?: string | null;
}

export const LockScreen: React.FC<LockScreenProps> = ({ 
  isSetupMode = false, 
  onUnlock, 
  onSetPin, 
  onCancelSetup,
  existingPin 
}) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'create' | 'confirm'>(isSetupMode ? 'create' : 'enter');
  const [error, setError] = useState('');

  useEffect(() => {
    if (step === 'enter' && pin.length === 4) {
        if (pin === existingPin) {
            onUnlock();
        } else {
            setError('PIN incorreto');
            setPin('');
        }
    }
  }, [pin, step, existingPin, onUnlock]);

  const handleNumClick = (num: string) => {
    setError('');
    if (step === 'enter') {
        if (pin.length < 4) setPin(prev => prev + num);
    } else if (step === 'create') {
        if (pin.length < 4) setPin(prev => prev + num);
    } else if (step === 'confirm') {
        if (confirmPin.length < 4) setConfirmPin(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setError('');
    if (step === 'confirm') setConfirmPin(prev => prev.slice(0, -1));
    else setPin(prev => prev.slice(0, -1));
  };

  const handleNextStep = () => {
      if (step === 'create' && pin.length === 4) {
          setStep('confirm');
      } else if (step === 'confirm' && confirmPin.length === 4) {
          if (pin === confirmPin) {
              onSetPin(pin);
          } else {
              setError('Os PINs não coincidem');
              setConfirmPin('');
              setStep('create');
              setPin('');
          }
      }
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

  return (
    <div className="fixed inset-0 z-[60] bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 flex flex-col items-center">
          <div className="bg-blue-100 p-4 rounded-full mb-6 text-blue-600">
             {isSetupMode ? <ShieldCheck size={32} /> : <Lock size={32} />}
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {step === 'enter' && 'Desbloquear App'}
            {step === 'create' && 'Criar PIN de Segurança'}
            {step === 'confirm' && 'Confirmar PIN'}
          </h2>
          
          <p className="text-sm text-gray-500 mb-6 text-center">
            {step === 'enter' && 'Digite seu PIN de 4 dígitos para acessar.'}
            {step === 'create' && 'Escolha um código para proteger seus dados.'}
            {step === 'confirm' && 'Digite o código novamente.'}
          </p>

          <div className="flex space-x-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  (step === 'confirm' ? confirmPin.length : pin.length) > i 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300'
                } ${error ? 'border-red-500 bg-red-100' : ''}`}
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-sm mb-4 animate-pulse">{error}</p>}

          <div className="grid grid-cols-3 gap-4 w-full mb-6">
            {numbers.map((num, idx) => (
              <button
                key={idx}
                onClick={() => num === 'back' ? handleBackspace() : num && handleNumClick(num)}
                disabled={!num && idx !== 9} // Empty slot
                className={`h-14 rounded-full flex items-center justify-center text-xl font-semibold transition-colors
                  ${num === 'back' 
                    ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
                    : !num 
                        ? 'invisible' 
                        : 'text-gray-700 bg-gray-50 hover:bg-gray-100 active:bg-gray-200'
                  }`}
              >
                {num === 'back' ? <X size={24} /> : num}
              </button>
            ))}
          </div>

          <div className="w-full flex justify-between items-center">
             {isSetupMode && onCancelSetup && (
                 <button onClick={onCancelSetup} className="text-gray-400 hover:text-gray-600 text-sm font-medium">
                     Cancelar
                 </button>
             )}
             
             {(step === 'create' || step === 'confirm') && (
                 <button 
                    onClick={handleNextStep}
                    disabled={(step === 'create' && pin.length !== 4) || (step === 'confirm' && confirmPin.length !== 4)}
                    className="ml-auto bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                 >
                     <ArrowRight size={20} />
                 </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};