
import React, { useState, useEffect } from 'react';
// Added AlertCircle to imports
import { ShieldCheck, Lock, Fingerprint, Smartphone, Key, User, Globe, ShieldAlert, Truck, Activity, AlertCircle } from 'lucide-react';
import SSMLogo from './SSMLogo';
import { ADMINS } from '../constants';
import { AdminUser } from '../types';
import { auditLogger } from '../services/auditLogger';

interface LoginProps {
  onLoginSuccess: (user: AdminUser) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<'login' | 'signup' | 'forgot' | 'activate' | 'welcome'>('login');
  const [step, setStep] = useState<'form' | 'checking' | '2fa' | 'success'>('form');
  const [identityInput, setIdentityInput] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<{msg: string, code?: string} | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDetectedLocation('IP: 197.249.1.xxx (Canal Encriptado SSM)');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getRoleLabel = (user: AdminUser) => {
    switch (user.role) {
      case 'ADMIN_SSM': return 'Administrador SSM';
      case 'OPERADOR_COORD': return 'Operador de Coordenação';
      case 'GESTOR_RISCO': return 'Gestor de Risco';
      case 'MOTORISTA_AMB': return 'Motorista de Ambulância';
      case 'GESTOR_FROTA_AMB': return 'Gestor de Frota';
      case 'ADMIN_CLIENTE': return 'Administrador Cliente';
      case 'RESPONSAVEL_EMERG_CLIENTE': return 'Responsável Emergência';
      case 'COLABORADOR_RH': return 'Colaborador / RH';
      default: return 'Utilizador SSM';
    }
  };

  const handleLoginSubmit = (e?: React.FormEvent, quickUser?: AdminUser) => {
    if (e) e.preventDefault();
    
    const input = quickUser ? quickUser.id : identityInput.trim();
    
    if (!input) {
      setError({ msg: 'Introduza a sua Identidade de Acesso.' });
      return;
    }
    
    setError(null);
    
    const user = quickUser || (ADMINS as any[]).find(u => 
      u.id.toLowerCase() === input.toLowerCase() || 
      u.email.toLowerCase() === input.toLowerCase() ||
      u.username?.toLowerCase() === input.toLowerCase()
    );

    if (!user) {
      setError({ msg: 'Identidade de acesso não reconhecida no diretório SSM.' });
      return;
    }

    setAuthenticatedUser(user);
    setStep('checking');
    
    setTimeout(() => {
      if (user.role === 'OPERADOR_COORD' || user.role === 'ADMIN_SSM') {
        setStep('2fa');
      } else {
        showWelcome(user);
      }
    }, 2000);
  };

  const showWelcome = (user: AdminUser) => {
    setView('welcome');
    setStep('success');
    auditLogger.log(user, 'LOGIN_SUCCESS');
    setTimeout(() => onLoginSuccess(user), 2500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans selection:bg-blue-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-[3rem] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.6)] overflow-hidden">
          
          <div className="p-10 pb-8 text-center bg-slate-50/50 border-b border-slate-100 relative">
            {detectedLocation && (
              <div className="absolute top-4 left-0 right-0 flex justify-center">
                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-100 shadow-sm animate-in slide-in-from-top-2">
                  <Globe className="w-2.5 h-2.5" /> {detectedLocation}
                </div>
              </div>
            )}
            
            <div className="flex justify-center mt-4 mb-6">
              <div className="w-20 h-20 bg-slate-950 rounded-[1.8rem] flex items-center justify-center shadow-2xl border border-slate-800 transition-transform duration-500 hover:scale-105 relative">
                <SSMLogo className="w-12 h-12" />
                {step === 'checking' && (
                  <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-[1.8rem] animate-spin"></div>
                )}
              </div>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight font-corporate uppercase leading-tight">
              {view === 'login' && 'SISTEMA DE EMERGÊNCIA SSM'}
              {view === 'welcome' && 'ACESSO AUTORIZADO'}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">Comando Digital & Governação Médica</p>
          </div>

          <div className="p-10">
            {step === 'form' && view === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-[11px] font-bold flex items-center gap-2 animate-in shake">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error.msg}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identidade de Acesso</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="text"
                      value={identityInput}
                      onChange={(e) => setIdentityInput(e.target.value)}
                      placeholder="ID (ex: ADM-001, OP-002, DRV-004)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-slate-950 hover:bg-slate-800 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-950/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Fingerprint className="w-5 h-5" /> Entrar Agora
                </button>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Atalhos de Perfil (Demo PDF)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => handleLoginSubmit(undefined, ADMINS[1])} className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-100 rounded-xl flex items-center gap-2 transition-all group">
                       <Activity className="w-3.5 h-3.5 text-blue-600" />
                       <span className="text-[9px] font-black uppercase text-slate-600 group-hover:text-blue-700">Operador</span>
                    </button>
                    <button type="button" onClick={() => handleLoginSubmit(undefined, ADMINS[3])} className="p-3 bg-slate-50 hover:bg-red-50 border border-slate-100 rounded-xl flex items-center gap-2 transition-all group">
                       <Truck className="w-3.5 h-3.5 text-red-600" />
                       <span className="text-[9px] font-black uppercase text-slate-600 group-hover:text-red-700">Ambulância</span>
                    </button>
                    <button type="button" onClick={() => handleLoginSubmit(undefined, ADMINS[5])} className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-100 rounded-xl flex items-center gap-2 transition-all group">
                       <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                       <span className="text-[9px] font-black uppercase text-slate-600 group-hover:text-emerald-700">Cliente</span>
                    </button>
                    <button type="button" onClick={() => handleLoginSubmit(undefined, ADMINS[2])} className="p-3 bg-slate-50 hover:bg-orange-50 border border-slate-100 rounded-xl flex items-center gap-2 transition-all group">
                       <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
                       <span className="text-[9px] font-black uppercase text-slate-600 group-hover:text-orange-700">Risco</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {step === 'checking' && (
              <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95">
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 border-[6px] border-blue-100 rounded-full"></div>
                  <div className="absolute inset-0 border-[6px] border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                  <ShieldCheck className="absolute inset-0 m-auto w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase font-corporate tracking-tight">
                  {authenticatedUser ? getRoleLabel(authenticatedUser) : 'Utilizador'} a entrar...
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-5 animate-pulse">Sincronizando com a Rede SSM...</p>
              </div>
            )}

            {step === '2fa' && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase font-corporate tracking-tight">Verificação em 2 Passos</h3>
                  <p className="text-xs font-medium text-slate-400 mt-3 leading-relaxed px-4">
                    Código enviado para o dispositivo de {authenticatedUser?.name.split(' ')[0]}.
                  </p>
                </div>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input 
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-12 h-14 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-black text-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
                    />
                  ))}
                </div>
                <button 
                  onClick={() => authenticatedUser && showWelcome(authenticatedUser)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Confirmar <Key className="w-4 h-4" />
                </button>
              </div>
            )}

            {view === 'welcome' && (
              <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-90 duration-700">
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/40 mb-8 scale-110 relative">
                  <div className="absolute inset-0 bg-emerald-500 rounded-[2rem] animate-ping opacity-20"></div>
                  <ShieldCheck className="w-12 h-12 relative z-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase font-corporate tracking-tight">Olá, {authenticatedUser?.name.split(' ')[0]}</h3>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-2 justify-center">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> {authenticatedUser ? getRoleLabel(authenticatedUser) : 'Utilizador'}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest font-corporate">DEMO MODE ON</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest font-corporate">AES-256 Bit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
