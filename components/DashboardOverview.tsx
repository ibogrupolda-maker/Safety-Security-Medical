
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, Clock, AlertCircle, CheckCircle2, 
  MapPin, Activity, Phone, Share2, 
  ChevronRight, MoreHorizontal, MessageSquare, 
  ArrowUpRight, Truck, Hospital, Users2, Plane,
  RotateCcw, Search, Filter, Plus, FileText,
  ChevronDown, ChevronUp, Shield, Heart, Info,
  AlertTriangle, Navigation, CheckCircle, Send, ExternalLink, Calendar, Loader2,
  Globe, Flag, X, Maximize2, Minimize2, ClipboardCheck, TrendingDown, TrendingUp, User, Key, Building2,
  UserPlus, ShieldAlert, Volume2, BellRing, Stethoscope
} from 'lucide-react';
import { EmergencyCase, EmergencyPriority, Employee, Company, OperationReport, AdminUser, AmbulanceState, CommunicationLog } from '../types';
import { COMPANIES, EMPLOYEES, PRIORITY_COLORS, AMBULANCES } from '../constants';
import EmergencyCommunication from './EmergencyCommunication';
import NetworkMap from './NetworkMap';
import L from 'leaflet';
import { auditLogger } from '../services/auditLogger';

interface DashboardOverviewProps {
  incidents: EmergencyCase[];
  onDispatch?: (incidentId: string, ambId: string) => void;
  currentUser?: AdminUser;
  onUpdateIncident?: (incidentId: string, updates: Partial<EmergencyCase>) => void;
  communicationLogs: CommunicationLog[];
  onAddCommunicationLog: (log: Omit<CommunicationLog, 'id' | 'timestamp'>) => void;
  ambulances?: AmbulanceState[];
  companies?: Company[];
}

const HOSPITALS_DB = [
  { name: 'Lenmed Maputo Private', coords: [-25.952, 32.598] as [number, number], type: 'Privado' },
  { name: 'ICOR - Coração', coords: [-25.960, 32.590] as [number, number], type: 'Especializado' },
  { name: 'Hospital Central Maputo', coords: [-25.975, 32.585] as [number, number], type: 'Público' }
];

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  incidents, 
  onDispatch, 
  currentUser, 
  onUpdateIncident,
  communicationLogs,
  onAddCommunicationLog,
  ambulances = [],
  companies = COMPANIES
}) => {
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
  const [trackingIncidentId, setTrackingIncidentId] = useState<string | null>(null);
  const [dispatchModalId, setDispatchModalId] = useState<string | null>(null);
  const [commIncidentId, setCommIncidentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const getNearbyAmbulances = (incidentCoords: [number, number]) => {
    return ambulances.map(amb => {
      const dist = Math.sqrt(Math.pow(amb.currentPos[0] - incidentCoords[0], 2) + Math.pow(amb.currentPos[1] - incidentCoords[1], 2)) * 111;
      return { ...amb, distance: dist, eta: Math.round(dist * 2.5) };
    }).sort((a, b) => a.distance - b.distance);
  };

  const getNearbyHospitals = (incidentCoords: [number, number]) => {
    return HOSPITALS_DB.map(h => {
       const dist = Math.sqrt(Math.pow(h.coords[0] - incidentCoords[0], 2) + Math.pow(h.coords[1] - incidentCoords[1], 2)) * 111;
       return { ...h, distance: dist };
    }).sort((a, b) => a.distance - b.distance);
  };

  const handleDispatch = (ambId: string) => {
    if (dispatchModalId && onDispatch) {
      onDispatch(dispatchModalId, ambId);
      setDispatchModalId(null);
    }
  };

  const renderStatusBox = (incident: EmergencyCase) => {
    const isDespatched = incident.ambulanceState !== undefined;
    const isPendingAccept = incident.ambulanceState?.phase === 'pending_accept';
    const isLive = incident.ambulanceState?.phase === 'en_route_to_patient' || incident.ambulanceState?.phase === 'evacuating';
    const isClosed = incident.status === 'closed';

    return (
      <div 
        onClick={(e) => { 
          e.stopPropagation(); 
          if (isLive) setTrackingIncidentId(incident.id); 
        }}
        className={`rounded-2xl p-4 flex items-center justify-between border transition-all cursor-pointer group/status ${
          isLive ? 'bg-blue-50 border-blue-200 shadow-md ring-2 ring-blue-500/20' : 
          isPendingAccept ? 'bg-orange-50 border-orange-200 animate-pulse' :
          isClosed ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-[#F8FAFC] border-slate-100'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
            isLive ? 'bg-blue-600 text-white animate-pulse' :
            isPendingAccept ? 'bg-orange-500 text-white' :
            isClosed ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400 border border-slate-100'
          }`}>
            {isPendingAccept ? <Clock className="w-5 h-5" /> : (isClosed ? <ClipboardCheck className="w-5 h-5" /> : <Truck className="w-5 h-5" />)}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 leading-none">
              {isPendingAccept ? 'Aguardando Unidade' : 
               isLive ? 'Rastreio Activo' : 
               isClosed ? 'Operação Concluída' : 'Aguardando Despacho'}
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-widest">
              {isPendingAccept ? 'Timeout 30s Ligado' : (isLive ? 'GPS 5s Sincronizado' : 'Protocolo Iniciado')}
            </p>
          </div>
        </div>
        {isLive && <ChevronRight className="w-4 h-4 text-blue-600 group-hover/status:translate-x-1 transition-transform" />}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative">
      
      {dispatchModalId && (
        <div className="fixed inset-0 z-[150] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col md:flex-row">
            
            {/* Esquerda: Seleção de Ambulância */}
            <div className="flex-1 p-8 border-r border-slate-100">
               <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-black font-corporate uppercase tracking-tight">Despacho Inteligente</h3>
                    <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-widest">Módulo 8: Geointeligência SSM</p>
                  </div>
               </div>

               <div className="space-y-3 mb-8">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ambulâncias Mais Próximas</h4>
                  {getNearbyAmbulances(incidents.find(i => i.id === dispatchModalId)!.coords).map((amb) => (
                    <div key={amb.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:border-blue-500 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600"><Truck className="w-5 h-5" /></div>
                          <div>
                            <p className="text-xs font-black text-slate-900 leading-none mb-1">{amb.id}</p>
                            <span className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1">ETA {amb.eta} min</span>
                          </div>
                       </div>
                       <button onClick={() => handleDispatch(amb.id)} className="px-5 py-2.5 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">Despachar</button>
                    </div>
                  ))}
               </div>

               <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3">Rede Hospitalar Próxima</h4>
                  <div className="grid grid-cols-1 gap-2">
                     {getNearbyHospitals(incidents.find(i => i.id === dispatchModalId)!.coords).map(h => (
                        <div key={h.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                           <div className="flex items-center gap-3">
                              <Hospital className="w-4 h-4 text-emerald-600" />
                              <span className="text-xs font-bold text-slate-700">{h.name}</span>
                           </div>
                           <span className="text-[9px] font-black text-slate-400 uppercase">{h.distance.toFixed(1)} km</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Direita: Checkbox Operacional */}
            <div className="w-full md:w-80 bg-slate-50 p-8">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Coordenação de Passo 2</h4>
               <div className="space-y-4">
                  {[
                    'Localização GPS Validada',
                    'Empresa Cliente Notificada',
                    'Seguradora Comunicada',
                    'Triagem Inicial Concluída',
                    'Hospital de Destino Pré-avisado'
                  ].map(step => (
                    <label key={step} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer">
                       <input type="checkbox" className="rounded text-blue-600" />
                       <span className="text-[11px] font-bold text-slate-600">{step}</span>
                    </label>
                  ))}
               </div>
               <button onClick={() => setDispatchModalId(null)} className="w-full mt-10 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">Fechar Janela</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {commIncidentId && (
          <EmergencyCommunication 
            isOpen={true} 
            onClose={() => setCommIncidentId(null)} 
            incident={incidents.find(i => i.id === commIncidentId)!}
            communicationLogs={communicationLogs.filter(l => l.incidentId === commIncidentId)}
            onAddCommunicationLog={onAddCommunicationLog}
            currentUser={currentUser}
          />
        )}
        <div className="lg:col-span-12 space-y-6">
          <h3 className="text-lg font-black text-slate-900 font-corporate uppercase tracking-tight flex items-center gap-3">Gestão Operacional Live <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div></h3>
          <div className="space-y-4">
            {incidents.map((incident) => {
              const company = companies.find(c => c.id === incident.companyId);
              const isExpanded = expandedCaseId === incident.id;

              return (
                <div key={incident.id} className={`bg-white rounded-[2rem] border border-slate-200 shadow-sm transition-all duration-500 overflow-hidden ${isExpanded ? 'ring-4 ring-blue-600/5 border-blue-100' : 'hover:border-blue-300'}`}>
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpandedCaseId(isExpanded ? null : incident.id)}>
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden">
                          {company ? <img src={company.logo} alt="Company Logo" className="w-full h-full object-cover" /> : <Activity className="w-7 h-7" />}
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-slate-900 leading-none">{incident.patientName || 'Triagem Telefónica Pendente'}</h4>
                          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">#{incident.id} • {company?.name}</p>
                        </div>
                      </div>
                      <div className="text-right text-xs font-black text-slate-300 flex items-center gap-2"><Clock className="w-4 h-4" /> {incident.timestamp}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                       <div className="space-y-4">
                          <div className="flex gap-4">
                             <MapPin className="w-5 h-5 text-slate-300 shrink-0" />
                             <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Cenário Capturado por GPS</p><p className="text-sm font-bold text-slate-700">{incident.locationName}</p></div>
                          </div>
                          <div className="flex gap-4">
                             <Stethoscope className="w-5 h-5 text-slate-300 shrink-0" />
                             <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Descrição</p><p className="text-sm font-bold text-slate-700">{incident.type}</p></div>
                          </div>
                       </div>
                       <div>
                          {renderStatusBox(incident)}
                       </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                       <button onClick={() => setDispatchModalId(incident.id)} disabled={incident.ambulanceState !== undefined || incident.status === 'closed'} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg ${incident.ambulanceState || incident.status === 'closed' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}><Send className="w-4 h-4" /> {incident.status === 'closed' ? 'Histórico de Missão' : (incident.ambulanceState ? 'Unidade em Missão' : 'Despachar Unidade SSM')}</button>
                       <button 
                         onClick={() => setCommIncidentId(incident.id)}
                         className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                       >
                         <MessageSquare className="w-4 h-4" /> Canais OC
                       </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
