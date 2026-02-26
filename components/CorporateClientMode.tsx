
import React, { useState, useEffect, useRef } from 'react';
import { 
  Siren, Phone, MapPin, ShieldCheck, Activity, X, 
  Heart, Bell, AlertCircle, CheckCircle2, Info, Clock, 
  ChevronRight, Shield, Navigation, Truck, User, PhoneCall, 
  MessageSquare, AlertTriangle
} from 'lucide-react';
import { COMPANIES, AMBULANCES } from '../constants';
import { auditLogger } from '../services/auditLogger';
import L from 'leaflet';

interface CorporateClientModeProps {
  onTriggerEmergency: () => void;
  onLogout: () => void;
  adminName: string;
  companyId?: string;
}

const CorporateClientMode: React.FC<CorporateClientModeProps> = ({ 
  onTriggerEmergency, 
  onLogout, 
  adminName, 
  companyId 
}) => {
  // Estados: idle -> confirming -> activating -> active (call) -> waiting_dispatch -> tracking
  const [panicStep, setPanicStep] = useState<'idle' | 'confirming' | 'activating' | 'active' | 'waiting_dispatch' | 'tracking'>('idle');
  const [isCallActive, setIsCallActive] = useState(false);
  const [eta, setEta] = useState(8);
  const [ambulancePos, setAmbulancePos] = useState<[number, number]>([-25.965, 32.575]);
  
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const ambulanceMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const company = COMPANIES.find(c => c.id === companyId);
  const companyName = company?.name || 'EDM Moçambique';
  const clientLocation: [number, number] = [-25.9680, 32.5710]; // Torre Absa

  // Simulação de movimento da ambulância
  useEffect(() => {
    let interval: number;
    if (panicStep === 'tracking') {
      interval = window.setInterval(() => {
        setAmbulancePos(prev => {
          const nextLat = prev[0] + (clientLocation[0] - prev[0]) * 0.08;
          const nextLng = prev[1] + (clientLocation[1] - prev[1]) * 0.08;
          
          if (ambulanceMarkerRef.current) {
            ambulanceMarkerRef.current.setLatLng([nextLat, nextLng]);
          }

          setEta(prevEta => Math.max(1, prevEta - (Math.random() > 0.85 ? 1 : 0)));
          return [nextLat, nextLng];
        });
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [panicStep]);

  // Inicialização do mapa de rastreio
  useEffect(() => {
    if (panicStep === 'tracking' && mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(clientLocation, 15);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(mapRef.current);

      const clientIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="bg-blue-600 p-2 rounded-full border-4 border-white shadow-xl text-white"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      L.marker(clientLocation, { icon: clientIcon }).addTo(mapRef.current);

      const ambIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="bg-red-600 p-2 rounded-xl border-2 border-white shadow-2xl text-white animate-pulse"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-5h-7v5a1 1 0 0 0 1 1h2"/><circle cx="7.5" cy="18.5" r="2.5"/><circle cx="17.5" cy="18.5" r="2.5"/></svg></div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });
      ambulanceMarkerRef.current = L.marker(ambulancePos, { icon: ambIcon }).addTo(mapRef.current);

      routePolylineRef.current = L.polyline([ambulancePos, clientLocation], {
        color: '#3b82f6',
        weight: 4,
        dashArray: '10, 10',
        opacity: 0.6
      }).addTo(mapRef.current);
    }
  }, [panicStep]);

  const handlePanicClick = () => {
    if (panicStep === 'idle') {
      setPanicStep('confirming');
      setTimeout(() => {
        setPanicStep(prev => prev === 'confirming' ? 'idle' : prev);
      }, 4000);
    } else if (panicStep === 'confirming') {
      triggerEmergencyProcess();
    }
  };

  const triggerEmergencyProcess = () => {
    setPanicStep('activating');
    setTimeout(() => {
      onTriggerEmergency();
      setPanicStep('active');
      setIsCallActive(true);
      auditLogger.log(
        { id: 'EMP-SOS', name: adminName, role: 'COLABORADOR_RH', companyId: companyId }, 
        'CORPORATE_SOS_TRIGGERED', 
        companyId
      );
    }, 1500);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setPanicStep('waiting_dispatch');
    setTimeout(() => {
      setPanicStep('tracking');
    }, 3500);
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] p-8 custom-scrollbar overflow-y-auto h-full relative text-slate-900">
      <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
        
        {panicStep === 'tracking' ? (
          /* VISTA DE RASTREIO ATIVO */
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight font-corporate uppercase flex items-center gap-3">
                  Apoio em Caminho <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></div>
                </h2>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Unidade ALPHA-1 Despachada • Monitorização GPS Activa</p>
              </div>
              <button onClick={() => setPanicStep('idle')} className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">
                Finalizar Emergência
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px]">
              <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
                <div ref={mapContainerRef} className="absolute inset-0 z-0" />
                <div className="absolute top-6 left-6 z-10 bg-white/95 backdrop-blur-sm p-5 rounded-2xl border border-slate-100 shadow-xl pointer-events-none">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Truck className="w-6 h-6" /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Unidade Assignada</p>
                      <p className="text-sm font-black text-slate-900 leading-none">ALPHA-1 (SAV)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6 flex flex-col">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex-1">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">EQUIPA EM RESPOSTA</h4>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-xl">JC</div>
                    <div>
                      <h5 className="text-lg font-black text-slate-900">João Condestável</h5>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Paramédico Sénior</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full bg-[#E0F2FE] text-slate-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-slate-100 border border-blue-100">
                      <MessageSquare className="w-4 h-4" /> Chat com a Coordenação
                    </button>
                    <div className="bg-[#EBFDF5] text-[#065F46] px-4 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3 border border-[#D1FAE5]">
                      <ShieldCheck className="w-4 h-4" /> Rede Primária de Resposta Validada
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-600 text-white p-8 rounded-[2rem] shadow-xl shadow-blue-600/20">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Chegada Prevista</p>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-6xl font-black tracking-tighter">{eta}</h4>
                    <span className="text-lg font-bold uppercase tracking-widest">Minutos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* DASHBOARD PADRÃO - HERO CARD ALINHADO COM A FOTO */
          <>
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
              <div className="flex-1 space-y-10 relative z-10 text-left">
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-corporate">
                    Bem-vindo, <span className="text-blue-600">{companyName}</span>
                  </h1>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl">
                    Seu ambiente está protegido pelo <span className="font-bold text-slate-900">SSM Digital</span>. Em caso de qualquer intercorrência médica, acione o botão de emergência abaixo para atendimento imediato.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="bg-[#E0F2FE] px-8 py-6 rounded-[1.5rem] border border-blue-100 flex-1 min-w-[280px]">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">LOCALIZAÇÃO PRINCIPAL</p>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-black text-slate-800">Av. Eduardo Mondlane, 288</p>
                    </div>
                  </div>

                  <div className="bg-[#E0F2FE] px-8 py-6 rounded-[1.5rem] border border-blue-100 flex-1 min-w-[280px]">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">COLABORADORES COBERTOS</p>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-emerald-600" />
                      <p className="text-sm font-black text-slate-800">{company?.totalEmployees.toLocaleString() || '1.240'} Ativos</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="shrink-0 relative">
                <div className={`absolute inset-0 rounded-full blur-[70px] opacity-30 transition-all duration-700 bg-red-600 ${panicStep === 'confirming' ? 'scale-125' : 'scale-100'}`}></div>
                <button
                  onClick={handlePanicClick}
                  disabled={panicStep === 'activating' || panicStep === 'active' || panicStep === 'waiting_dispatch'}
                  className={`relative w-72 h-72 md:w-80 md:h-80 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl active:scale-95 group ${
                    panicStep === 'confirming' ? 'bg-orange-600 scale-105' :
                    panicStep === 'active' ? 'bg-emerald-600' : 
                    panicStep === 'activating' ? 'bg-slate-900' :
                    panicStep === 'waiting_dispatch' ? 'bg-blue-600' :
                    'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  <div className="w-20 h-20 bg-white/15 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-12 h-12 text-white" />
                  </div>
                  <span className="text-3xl font-black text-white uppercase tracking-[0.1em] font-corporate">
                    {panicStep === 'confirming' ? 'CONFIRMAR' : 'EMERGÊNCIA'}
                  </span>
                  <span className="text-[11px] font-bold text-white uppercase tracking-widest mt-2 opacity-80">
                    CLIQUE PARA ATIVAR
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-red-500" />
                  <h3 className="text-2xl font-black text-slate-900 uppercase font-corporate tracking-tight">Atendimentos em Curso</h3>
                </div>
                <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-24 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 border border-slate-100"><Info className="w-6 h-6" /></div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Nenhuma emergência ativa.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-slate-400" />
                  <h3 className="text-2xl font-black text-slate-900 uppercase font-corporate tracking-tight">Últimos Registos</h3>
                </div>
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-[#F8FAFC] px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">DATA</span>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">TIPO</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {[
                      { id: '#98321', date: '30/12/2025', name: 'Richard Sulemane', type: 'URGENTE' },
                      { id: '#98322', date: '30/12/2025', name: 'Richard Sulemane', type: 'URGENTE' },
                      { id: '#98323', date: '30/12/2025', name: 'Richard Sulemane', type: 'URGENTE' },
                    ].map((record, i) => (
                      <div key={i} className="p-8 hover:bg-slate-50 transition-colors group cursor-pointer flex items-center justify-between">
                        <div>
                          <p className="text-base font-black text-slate-900 mb-1">{record.date}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{record.id} - {record.name}</p>
                        </div>
                        <span className="bg-[#FFFBEB] text-[#D97706] px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-[#FEF3C7]">
                          {record.type}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="p-8 text-center border-t border-slate-50">
                    <button className="text-blue-600 text-[11px] font-black uppercase tracking-[0.2em] hover:underline">VER RELATÓRIO COMPLETO</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de Chamada Ativa */}
      {isCallActive && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
          <div className="w-full max-w-sm bg-white rounded-[3.5rem] p-12 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-red-600 animate-pulse"></div>
            <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-10 relative">
              <div className="absolute inset-0 bg-red-600/20 rounded-full animate-ping"></div>
              <Phone className="w-10 h-10 relative z-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase font-corporate tracking-tight">Linha Prioritária</h3>
            <p className="text-[11px] font-black text-red-600 uppercase tracking-widest mt-3 animate-pulse">Operador em Linha...</p>
            <div className="my-10">
              <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">Mantenha a calma. O despachante está a recolher os dados para o envio imediato da unidade.</p>
            </div>
            <button onClick={handleEndCall} className="w-full bg-slate-950 hover:bg-slate-800 text-white py-6 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl active:scale-95 transition-all">Encerrar Chamada</button>
          </div>
        </div>
      )}

      <style>{`
        .custom-marker { background: transparent !important; border: none !important; }
        .leaflet-container { background: #f8fafc; border-radius: 2.5rem; }
      `}</style>
    </div>
  );
};

export default CorporateClientMode;
