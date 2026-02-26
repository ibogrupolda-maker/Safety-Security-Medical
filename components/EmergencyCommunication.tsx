
import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Phone, Video, Send, User, PhoneOff, VideoOff, Timer, History, Play, Clock, Truck, Building2, ShieldCheck, Globe, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { EmergencyCase, Employee, CommunicationLog, AdminUser } from '../types';
import { COMPANIES } from '../constants';

interface EmergencyCommunicationProps {
  isOpen: boolean;
  onClose: () => void;
  incident: EmergencyCase;
  employee?: Employee;
  communicationLogs: CommunicationLog[];
  onAddCommunicationLog: (log: Omit<CommunicationLog, 'id' | 'timestamp'>) => void;
  currentUser?: AdminUser;
}

const EmergencyCommunication: React.FC<EmergencyCommunicationProps> = ({ 
  isOpen, 
  onClose, 
  incident, 
  employee,
  communicationLogs,
  onAddCommunicationLog,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'voz' | 'video' | 'historico'>('chat');
  const [activeChannel, setActiveChannel] = useState<'CLIENTE' | 'AMBULANCIA' | 'EXTERNAL' | 'STAKEHOLDER'>('CLIENTE');
  const [inputValue, setInputValue] = useState('');
  const [isCritical, setIsCritical] = useState(false);
  
  // Call state
  const [isCallActive, setIsCallActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isCallActive) {
      setElapsedSeconds(0);
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCallActive]);

  const formatDuration = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const handleSendMessage = () => {
    if (!inputValue.trim() || !currentUser) return;
    
    onAddCommunicationLog({
      incidentId: incident.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      recipient: activeChannel,
      message: inputValue,
      type: activeTab === 'chat' ? 'SYSTEM' : 'EXTERNAL',
      isCritical: isCritical
    });
    
    setInputValue('');
    setIsCritical(false);
  };

  const startCall = (type: 'voz' | 'video') => {
    setIsCallActive(true);
    if (!currentUser) return;
    
    onAddCommunicationLog({
      incidentId: incident.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      recipient: activeChannel,
      message: `Iniciada chamada de ${type === 'voz' ? 'Voz' : 'Vídeo'} com ${activeChannel}`,
      type: type === 'voz' ? 'PHONE' : 'EXTERNAL',
      isCritical: true
    });
  };

  const endCall = () => {
    const duration = formatDuration(elapsedSeconds);
    setIsCallActive(false);
    if (!currentUser) return;

    onAddCommunicationLog({
      incidentId: incident.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      recipient: activeChannel,
      message: `Chamada terminada. Duração: ${duration}`,
      type: 'SYSTEM',
      isCritical: false
    });
  };

  const company = COMPANIES.find(c => c.id === incident.companyId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
        
        {/* Header - Gestão de Canais */}
        <div className="bg-slate-900 p-6 flex flex-col gap-6 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white font-corporate uppercase tracking-tight leading-none">Canal de Governação Central</h2>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-1.5">Administração ↔ Rede SSM</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"><X className="w-6 h-6" /></button>
          </div>

          <div className="grid grid-cols-4 gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
            <button 
              onClick={() => { setActiveChannel('CLIENTE'); setIsCallActive(false); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeChannel === 'CLIENTE' ? 'bg-[#E0F2FE] text-slate-900 shadow-xl' : 'text-white/40 hover:text-white'}`}
            >
              <Building2 className="w-3 h-3" /> Cliente
            </button>
            <button 
              onClick={() => { setActiveChannel('AMBULANCIA'); setIsCallActive(false); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeChannel === 'AMBULANCIA' ? 'bg-[#E0F2FE] text-slate-900 shadow-xl' : 'text-white/40 hover:text-white'}`}
            >
              <Truck className="w-3 h-3" /> Viatura
            </button>
            <button 
              onClick={() => { setActiveChannel('EXTERNAL'); setIsCallActive(false); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeChannel === 'EXTERNAL' ? 'bg-[#E0F2FE] text-slate-900 shadow-xl' : 'text-white/40 hover:text-white'}`}
            >
              <Globe className="w-3 h-3" /> Externo
            </button>
            <button 
              onClick={() => { setActiveChannel('STAKEHOLDER'); setIsCallActive(false); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeChannel === 'STAKEHOLDER' ? 'bg-[#E0F2FE] text-slate-900 shadow-xl' : 'text-white/40 hover:text-white'}`}
            >
              <Users className="w-3 h-3" /> Stakeholders
            </button>
          </div>
        </div>

        {/* Info Banner do Canal Selecionado */}
        <div className="bg-[#E0F2FE]/50 px-6 py-3 border-b border-blue-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-blue-100">
                {activeChannel === 'CLIENTE' ? <img src={company?.logo} className="w-6 h-6 rounded-full" /> : <Truck className="w-4 h-4 text-blue-600" />}
             </div>
             <div>
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none mb-0.5">Destinatário</p>
                <p className="text-xs font-black text-blue-900 uppercase">
                  {activeChannel === 'CLIENTE' ? company?.name : 
                   activeChannel === 'AMBULANCIA' ? 'Unidade Alpha-1 (João C.)' :
                   activeChannel === 'EXTERNAL' ? 'Agências Externas (Polícia/Bombeiros)' : 'Stakeholders / Administração'}
                </p>
             </div>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Canal Seguro
          </div>
        </div>

        {/* Tabs de Tipo de Mídia */}
        <div className="flex border-b border-slate-100 bg-white">
          {[
            { id: 'chat', label: 'Chat', icon: MessageSquare },
            { id: 'voz', label: 'Voz', icon: Phone },
            { id: 'video', label: 'Vídeo', icon: Video },
            { id: 'historico', label: 'Log', icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 font-black uppercase text-[9px] tracking-widest transition-all border-b-4 ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600 bg-[#E0F2FE]' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo Dinâmico */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[350px] max-h-[450px] bg-[#FAFBFE] custom-scrollbar relative">
          {activeTab === 'chat' ? (
            communicationLogs.filter(l => l.recipient === activeChannel).map(log => (
              <div key={log.id} className={`flex gap-3 ${log.senderId === currentUser?.id ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2`}>
                <div className={`flex flex-col max-w-[80%] ${log.senderId === currentUser?.id ? 'items-end' : 'items-start'}`}>
                  {log.senderId !== currentUser?.id && <span className="text-[10px] font-black text-slate-900 mb-1 ml-1">{log.senderName}</span>}
                  <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm leading-relaxed relative ${log.senderId === currentUser?.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                    {log.isCritical && (
                      <div className="absolute -top-2 -left-2 bg-red-600 text-white p-1 rounded-full shadow-lg">
                        <AlertTriangle className="w-3 h-3" />
                      </div>
                    )}
                    {log.message}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 mt-1 px-1 uppercase">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))
          ) : activeTab === 'historico' ? (
            <div className="space-y-4">
              {communicationLogs.map(log => (
                <div key={log.id} className={`flex items-center justify-between p-4 bg-white border rounded-2xl shadow-sm ${log.isCritical ? 'border-red-200 bg-red-50/30' : 'border-slate-100'}`}>
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        log.recipient === 'CLIENTE' ? 'bg-orange-50 text-orange-600' : 
                        log.recipient === 'AMBULANCIA' ? 'bg-blue-50 text-blue-600' :
                        log.recipient === 'EXTERNAL' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                         {log.recipient === 'CLIENTE' ? <Building2 className="w-4 h-4" /> : 
                          log.recipient === 'AMBULANCIA' ? <Truck className="w-4 h-4" /> :
                          log.recipient === 'EXTERNAL' ? <Globe className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-black text-slate-900 uppercase">Para {log.recipient}</p>
                          {log.isCritical && <span className="text-[8px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded uppercase">Crítico</span>}
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 mt-0.5">{log.message.substring(0, 50)}{log.message.length > 50 ? '...' : ''}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{new Date(log.timestamp).toLocaleString()} • {log.senderName}</p>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-500">
               {isCallActive ? (
                 <div className="flex flex-col items-center gap-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
                      <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-2xl relative z-10 border-4 border-[#E0F2FE]">
                        {activeTab === 'voz' ? <Phone className="w-12 h-12" /> : <Video className="w-12 h-12" />}
                      </div>
                    </div>
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-4">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                        <p className="text-5xl font-black text-slate-900 font-mono tracking-tighter">
                          {formatDuration(elapsedSeconds)}
                        </p>
                      </div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Chamada em Curso</p>
                    </div>
                    <button onClick={endCall} className="bg-red-600 hover:bg-red-700 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-xl shadow-red-600/20 transition-all active:scale-95">
                      <PhoneOff className="w-5 h-5" /> Terminar Chamada
                    </button>
                 </div>
               ) : (
                 <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-[#E0F2FE] rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto border-2 border-white shadow-sm">
                      {activeTab === 'voz' ? <Phone className="w-10 h-10" /> : <Video className="w-10 h-10" />}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 uppercase font-corporate">Estabelecer Conexão</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 max-w-[250px] mx-auto leading-relaxed">
                        A iniciar canal encriptado com {activeChannel === 'CLIENTE' ? 'o Ponto Focal Cliente' : 'a Viatura Alpha-1'}.
                      </p>
                    </div>
                    <button onClick={() => startCall(activeTab as 'voz' | 'video')} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-xl transition-all active:scale-95">
                      <Play className="w-4 h-4 fill-current" /> Iniciar Agora
                    </button>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Input - Apenas para Chat */}
        {activeTab === 'chat' && (
          <div className="p-6 bg-white border-t border-slate-100 flex flex-col gap-4 shrink-0">
            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isCritical ? 'bg-red-600 border-red-600' : 'border-slate-300 group-hover:border-red-400'}`}>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={isCritical}
                    onChange={(e) => setIsCritical(e.target.checked)}
                  />
                  {isCritical && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isCritical ? 'text-red-600' : 'text-slate-400'}`}>Comunicação Crítica</span>
              </label>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Canal: {activeChannel}</div>
            </div>
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder={`Escrever para ${activeChannel}...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className={`flex-1 bg-slate-50 border rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 transition-all ${isCritical ? 'border-red-200 focus:ring-red-500/10' : 'border-slate-200 focus:ring-blue-500/10'}`}
              />
              <button 
                onClick={handleSendMessage} 
                disabled={!inputValue.trim()} 
                className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-lg transition-all disabled:opacity-30 ${isCritical ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
              >
                <Send className="w-4 h-4" /> Enviar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyCommunication;
