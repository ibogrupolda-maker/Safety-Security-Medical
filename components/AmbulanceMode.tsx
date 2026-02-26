
import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, CheckCircle, MapPin, Activity, LogOut,
  Bell, MessageSquare, Phone, Send, X, PhoneOff,
  Navigation, FileText, CheckCircle2, Hospital, Flag
} from 'lucide-react';
import { EmergencyCase, AmbulanceState, OperationReport } from '../types';
import L from 'leaflet';
import { auditLogger } from '../services/auditLogger';

interface AmbulanceModeProps {
  onLogout: () => void;
  adminName: string;
  incident: EmergencyCase | null;
  onUpdateAmbulance: (id: string, updates: Partial<AmbulanceState> | null, finalReport?: OperationReport) => void;
  onUpdateStatus: (id: string, status: 'active' | 'triage' | 'transit' | 'closed') => void;
}

const AmbulanceMode: React.FC<AmbulanceModeProps> = ({ 
  onLogout, 
  adminName, 
  incident,
  onUpdateAmbulance,
  onUpdateStatus
}) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [showConclusionModal, setShowConclusionModal] = useState(false);
  const [clinicalReport, setClinicalReport] = useState<Partial<OperationReport>>({
    consciousnessState: 'Consciente',
    procedures: [],
    vitalSigns: { bp: '', hr: '', spo2: '' },
    observations: ''
  });
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    let timer: number;
    if (incident?.ambulanceState?.phase === 'pending_accept' && timeLeft > 0) {
      timer = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && incident?.ambulanceState?.phase === 'pending_accept') {
      onUpdateAmbulance(incident.id, null);
      alert("Timeout de Aceitação: O despacho foi removido e reatribuído.");
    }
    return () => clearInterval(timer);
  }, [incident, timeLeft]);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([-25.9692, 32.5732], 15);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(mapRef.current);
    }
  }, []);

  const handleAccept = () => {
    if (incident) {
      onUpdateAmbulance(incident.id, { phase: 'en_route_to_patient' });
      auditLogger.log({id: 'DRV-001', name: adminName, role: 'MOTORISTA_AMB'}, 'MISSION_ACCEPTED_FIELD', incident.id);
    }
  };

  const handleArrivalAtPatient = () => {
    onUpdateAmbulance(incident!.id, { phase: 'at_patient' });
    onUpdateStatus(incident!.id, 'triage');
  };

  const handleStartEvacuation = () => {
    onUpdateAmbulance(incident!.id, { phase: 'evacuating' });
    onUpdateStatus(incident!.id, 'transit');
  };

  const handleHospitalArrival = () => {
    onUpdateAmbulance(incident!.id, { phase: 'at_hospital' });
    setShowConclusionModal(true);
  };

  const finalizeMission = () => {
    const fullReport: OperationReport = {
      ...(clinicalReport as OperationReport),
      incidentId: incident!.id,
      paramedicName: adminName,
      timestamps: {
        dispatched: incident!.ambulanceState?.timestamps?.dispatched || '',
        arrivedAtPatient: new Date().toLocaleTimeString(),
        leftForHospital: new Date().toLocaleTimeString(),
        arrivedAtHospital: new Date().toLocaleTimeString()
      }
    };

    onUpdateAmbulance(incident!.id, { phase: 'idle' }, fullReport);
    onUpdateStatus(incident!.id, 'closed');
    setShowConclusionModal(false);
    auditLogger.log({id: 'DRV-001', name: adminName, role: 'MOTORISTA_AMB'}, 'MISSION_FINALIZED_WITH_REPORT', incident!.id);
    alert("Operação Concluída. Relatório enviado para o Centro de Comando.");
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 overflow-hidden font-sans text-white">
      <header className="h-16 bg-slate-950 border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg text-white shadow-lg"><Truck className="w-5 h-5" /></div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest font-corporate leading-none flex items-center gap-2">Terminal Operativo SSM</h1>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{adminName} • UNIDADE MÓVEL</p>
          </div>
        </div>
        <button onClick={onLogout} className="p-2 text-slate-500 hover:text-white"><LogOut className="w-5 h-5" /></button>
      </header>

      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0 z-0 grayscale" />
        
        {incident?.ambulanceState?.phase === 'pending_accept' && (
          <div className="absolute inset-0 flex items-center justify-center p-6 z-40 bg-slate-900/80 backdrop-blur-xl">
            <div className="w-full max-w-sm bg-white rounded-[3rem] p-10 shadow-2xl flex flex-col items-center text-center text-slate-900 border-t-[12px] border-red-600">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 relative">
                 <Bell className="w-10 h-10 animate-swing" />
                 <div className="absolute -top-2 -right-2 bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-black">{timeLeft}s</div>
              </div>
              <h2 className="text-2xl font-black font-corporate uppercase tracking-tight">Solicitação de Despacho</h2>
              <div className="bg-slate-50 w-full p-6 rounded-2xl border border-slate-100 my-8 text-left">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Destino do Alerta</p>
                <p className="text-base font-black text-slate-900">{incident.locationName}</p>
              </div>
              <button onClick={handleAccept} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl text-base font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Aceitar Missão (Módulo 2)</button>
            </div>
          </div>
        )}

        {incident?.ambulanceState && incident.ambulanceState.phase !== 'idle' && incident.ambulanceState.phase !== 'pending_accept' && (
           <div className="absolute bottom-6 left-6 right-6 z-10 animate-in slide-in-from-bottom-4">
              <div className="bg-slate-950/95 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 shadow-2xl flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Navigation className="w-6 h-6" /></div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {incident.ambulanceState.phase === 'en_route_to_patient' ? 'A Caminho do Paciente' :
                             incident.ambulanceState.phase === 'at_patient' ? 'Intervenção no Local' :
                             'Evacuação para Unidade Hospitalar'}
                          </p>
                          <p className="text-lg font-black">{incident.locationName}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white"><MessageSquare className="w-6 h-6" /></button>
                       <button className="p-3 bg-blue-600 hover:bg-blue-700 rounded-2xl text-white"><Phone className="w-6 h-6" /></button>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {incident.ambulanceState.phase === 'en_route_to_patient' && (
                       <button onClick={handleArrivalAtPatient} className="w-full bg-white text-slate-900 py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Chegada ao Local
                       </button>
                    )}
                    {incident.ambulanceState.phase === 'at_patient' && (
                       <button onClick={handleStartEvacuation} className="w-full bg-blue-600 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                          <Hospital className="w-4 h-4" /> Iniciar Transporte
                       </button>
                    )}
                    {incident.ambulanceState.phase === 'evacuating' && (
                       <button onClick={handleHospitalArrival} className="w-full bg-emerald-600 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                          <Flag className="w-4 h-4" /> Entrega Hospitalar
                       </button>
                    )}
                 </div>
              </div>
           </div>
        )}
      </div>

      {showConclusionModal && (
        <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col p-6 animate-in slide-in-from-bottom-8 overflow-y-auto">
           <div className="max-w-2xl mx-auto w-full space-y-10 py-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center"><FileText className="w-6 h-6" /></div>
                    <div>
                       <h3 className="text-xl font-black uppercase font-corporate">Relatório de Conclusão Clínica</h3>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Obrigatório para Finalização (Módulo 3)</p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Sinais Vitais na Entrega</h4>
                    <div className="space-y-4">
                       <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1.5">Estado de Consciência</label>
                          <select 
                            value={clinicalReport.consciousnessState}
                            onChange={e => setClinicalReport({...clinicalReport, consciousnessState: e.target.value as any})}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
                          >
                             <option value="Consciente">Consciente (GCS 15)</option>
                             <option value="Confuso">Confuso / Desorientado</option>
                             <option value="Inconsciente">Inconsciente / Responsivo a Dor</option>
                             <option value="Comatoso">Comatoso (GCS &lt; 8)</option>
                          </select>
                       </div>
                       <div className="grid grid-cols-3 gap-3">
                          <div>
                             <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1.5">T.A (mmHg)</label>
                             <input type="text" placeholder="120/80" className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" />
                          </div>
                          <div>
                             <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1.5">F.C (bpm)</label>
                             <input type="text" placeholder="72" className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" />
                          </div>
                          <div>
                             <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1.5">SpO2 (%)</label>
                             <input type="text" placeholder="98" className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Procedimentos de Campo</h4>
                    <div className="grid grid-cols-1 gap-2">
                       {['Oxigenoterapia', 'Acesso Venoso', 'Imobilização', 'Medicação IV', 'Monitorização ECG'].map(proc => (
                         <label key={proc} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10">
                            <input type="checkbox" className="rounded bg-slate-700" />
                            <span className="text-xs font-bold">{proc}</span>
                         </label>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[9px] font-bold text-slate-500 uppercase">Observações e Histórico de Intervenção</label>
                 <textarea className="w-full h-32 bg-slate-800 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 resize-none" placeholder="Descreva o estado do paciente na entrega..."></textarea>
              </div>

              <div className="flex gap-4 pt-6 border-t border-white/10">
                 <button onClick={() => setShowConclusionModal(false)} className="flex-1 py-5 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest">Voltar</button>
                 <button onClick={finalizeMission} className="flex-[2] py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-5 h-5" /> Submeter Relatório e Finalizar
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AmbulanceMode;
