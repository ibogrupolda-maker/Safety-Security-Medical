
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, Hospital, Truck, AlertCircle, MapPin, 
  Activity, User, Phone, Shield, Heart, FileText, X, 
  Navigation, Info, AlertTriangle, CheckCircle2, Globe, Map as MapIcon,
  Maximize2, Minimize2, Crosshair
} from 'lucide-react';
import { EmergencyCase, Employee, Company, Resource } from '../types';

interface NetworkMapProps {
  incidents: EmergencyCase[];
  resources?: Resource[];
  companies?: Company[];
  employees?: Employee[];
  hideSidebar?: boolean;
}

const NetworkMap: React.FC<NetworkMapProps> = ({ 
  incidents, 
  resources = [], 
  companies = [], 
  employees = [], 
  hideSidebar = false 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [activeSideTab, setActiveSideTab] = useState<'recursos' | 'ocorrencias'>('ocorrencias');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'local' | 'national'>('local');
  
  const layersRef = useRef<{
    incidents: L.LayerGroup;
    hospitals: L.LayerGroup;
    ambulances: L.LayerGroup;
  } | null>(null);

  const providers = resources.map(res => ({
    id: res.id,
    type: res.category,
    pos: (res.id === 'RES-001' ? [-25.965, 32.575] : [-25.952, 32.598]) as [number, number], // Mock positions if not in type
    label: res.name,
    address: res.location,
    phone: '+258 84 000 0000',
    status: res.status,
    province: 'Maputo'
  }));

  const setMapToNational = () => {
    if (!mapRef.current) return;
    setViewMode('national');
    mapRef.current.flyTo([-18.6657, 35.5296], 6, { duration: 1.5, easeLinearity: 0.25 });
  };

  const setMapToLocal = () => {
    if (!mapRef.current) return;
    setViewMode('local');
    mapRef.current.flyTo([-25.9692, 32.5732], 13, { duration: 1.5, easeLinearity: 0.25 });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize layers if not already done
    if (!layersRef.current) {
      layersRef.current = {
        incidents: L.layerGroup(),
        hospitals: L.layerGroup(),
        ambulances: L.layerGroup()
      };
    }

    if (!mapRef.current) {
      const initialCoords: [number, number] = [-25.9692, 32.5732]; 
      mapRef.current = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView(initialCoords, 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(mapRef.current);
      
      layersRef.current.incidents.addTo(mapRef.current);
      layersRef.current.hospitals.addTo(mapRef.current);
      layersRef.current.ambulances.addTo(mapRef.current);
      
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!layersRef.current) return;
    const group = layersRef.current.incidents;
    group.clearLayers();
    incidents.forEach(inc => {
      const company = companies.find(c => c.id === inc.companyId);
      const color = inc.status === 'active' || inc.status === 'triage' ? 'red' : 'blue';
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="marker-pulse bg-${color}-500 opacity-20"></div>
            <div class="z-10 bg-${color}-600 p-1.5 rounded-full shadow-lg border-2 border-white text-white flex items-center justify-center transition-transform hover:scale-110">
              ${company ? `<img src="${company.logo}" class="w-6 h-6 rounded-full" />` : '<Activity class="w-4 h-4" />'}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
      L.marker(inc.coords, { icon }).on('click', () => setSelectedIncidentId(inc.id)).addTo(group);
    });
  }, [incidents]);

  const HOSPITAL_SVG = `<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 21V15"/><path d="M8 21v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"/><path d="M10 9h4"/><path d="M12 7v4"/>`;
  const TRUCK_SVG = `<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-5h-7v5a1 1 0 0 0 1 1h2"/><path d="M16 8h3l3 3v2h-6V8z"/><circle cx="7.5" cy="18.5" r="2.5"/><circle cx="17.5" cy="18.5" r="2.5"/>`;

  useEffect(() => {
    if (!mapRef.current || !layersRef.current) return;
    layersRef.current.hospitals.clearLayers();
    layersRef.current.ambulances.clearLayers();
    providers.forEach(p => {
      const isHospital = p.type === 'hospital';
      const isSelected = selectedProviderId === p.id;
      const colorClass = isHospital ? 'bg-emerald-600' : 'bg-blue-600';
      const ringClass = isSelected ? 'ring-4 ring-white ring-offset-2 ring-offset-slate-900 scale-125 z-[500]' : '';
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="${colorClass} ${ringClass} p-2 rounded-full border-2 border-white text-white shadow-xl transition-all duration-300 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${isHospital ? HOSPITAL_SVG : TRUCK_SVG}</svg>
        </div>`,
        iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32],
        iconAnchor: [isSelected ? 20 : 16, isSelected ? 20 : 16],
      });

      const tooltipContent = `
        <div class="px-4 py-3 bg-white rounded-2xl shadow-2xl border border-slate-100 min-w-[200px] animate-in fade-in zoom-in-95 duration-200">
          <p class="text-[9px] font-black uppercase text-slate-400 leading-none mb-1.5 tracking-widest">${p.type === 'hospital' ? 'Unidade Hospitalar' : 'Unidade Móvel'}</p>
          <p class="text-sm font-black text-slate-900 mb-1 leading-tight">${p.label}</p>
          ${p.address ? `<p class="text-[10px] text-slate-500 font-medium mb-2 leading-tight">${p.address}</p>` : ''}
          <div class="flex items-center justify-between border-t border-slate-50 pt-2 mt-2">
            <span class="text-[9px] font-black ${p.status.includes('Ocupado') ? 'text-orange-500' : 'text-emerald-500'} uppercase tracking-tighter">${p.status}</span>
            ${p.phone ? `
              <a href="tel:${p.phone.replace(/\s/g, '')}" class="flex items-center gap-1.5 bg-blue-600 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase hover:bg-blue-700 transition-colors">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Chamada
              </a>
            ` : ''}
          </div>
        </div>
      `;

      const marker = L.marker(p.pos, { icon })
        .on('click', (e) => { 
          setSelectedProviderId(p.id); 
          L.DomEvent.stopPropagation(e); 
        })
        .bindTooltip(tooltipContent, { 
          direction: 'top', 
          offset: [0, -20], 
          className: 'custom-leaflet-tooltip', 
          permanent: false,
          interactive: true 
        })
        .addTo(isHospital ? layersRef.current.hospitals : layersRef.current.ambulances);
      
      if (isSelected) marker.openTooltip();
    });
    if (mapRef.current) {
      mapRef.current.on('click', () => setSelectedProviderId(null));
    }
    return () => { if (mapRef.current) mapRef.current.off('click'); };
  }, [selectedProviderId]);

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId);
  const selectedEmployee = selectedIncident ? employees.find(e => e.id === selectedIncident.employeeId) : null;
  const selectedCompany = selectedIncident ? companies.find(c => c.id === selectedIncident.companyId) : null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-1 shadow-sm flex flex-col h-full min-h-[600px] relative overflow-hidden">
      <div className="p-5 flex items-center justify-between bg-white/80 backdrop-blur border-b border-slate-100 z-20">
        <div className="flex items-center gap-4">
          <div className="bg-red-600 text-white p-2.5 rounded-xl shadow-lg shadow-red-600/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight font-corporate uppercase">Mapa de Emergência Live</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <Navigation className="w-3 h-3 text-red-500" /> Rede de Cuidados SSM Maputo
            </p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
           <button onClick={setMapToLocal} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'local' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            <MapIcon className="w-3.5 h-3.5" /> Maputo
          </button>
          <button onClick={setMapToNational} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'national' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            <Globe className="w-3.5 h-3.5" /> Moçambique
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row relative">
        {!hideSidebar && (
          <div className="w-full md:w-80 bg-white border-r border-slate-100 flex flex-col z-10">
            <div className="flex bg-slate-50/50 p-1 m-4 rounded-xl border border-slate-200">
              <button onClick={() => { setActiveSideTab('ocorrencias'); setSelectedIncidentId(null); }} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeSideTab === 'ocorrencias' && !selectedIncidentId ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Ocorrências</button>
              <button onClick={() => { setActiveSideTab('recursos'); setSelectedIncidentId(null); }} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeSideTab === 'recursos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Recursos</button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
              {selectedIncidentId && selectedEmployee ? (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Info className="w-3.5 h-3.5" /> Ficha Médica SSM</h4>
                    <button onClick={() => setSelectedIncidentId(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all"><X className="w-4 h-4 text-slate-400" /></button>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white overflow-hidden border border-slate-100 shadow-sm">
                        <img src={selectedCompany?.logo} alt="Logo" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-black text-slate-900 leading-none truncate">{selectedEmployee.name}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase mt-1 truncate">{selectedCompany?.name}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Tipo Sanguíneo</p>
                        <p className="text-sm font-black text-red-600">{selectedEmployee.bloodType}</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Seguradora</p>
                        <p className="text-xs font-black text-slate-900 truncate">{selectedEmployee.insurer}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contacto Emergência</p>
                      <p className="text-xs font-black text-slate-900">{selectedEmployee.emergencyContact.name}</p>
                      <p className="text-xs text-blue-600 font-bold">{selectedEmployee.emergencyContact.phone}</p>
                    </div>
                    <button className="w-full bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"><FileText className="w-3.5 h-3.5" /> Ver Historial Clínico</button>
                  </div>
                </div>
              ) : activeSideTab === 'ocorrencias' ? (
                <div className="space-y-2">
                  {incidents.map(inc => {
                    const company = companies.find(c => c.id === inc.companyId);
                    return (
                      <div key={inc.id} onClick={() => { setSelectedIncidentId(inc.id); if (mapRef.current) mapRef.current.flyTo(inc.coords, 16); }} className="bg-white p-3 rounded-xl border border-slate-100 hover:border-red-500 hover:shadow-md cursor-pointer transition-all flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex-shrink-0 overflow-hidden border border-slate-100 group-hover:border-red-100"><img src={company?.logo} alt="Logo" className="w-full h-full object-cover" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center"><span className="text-xs font-black text-slate-900 truncate">{company?.name}</span><span className="text-[8px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded">SOS</span></div>
                          <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{inc.type}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                   {Array.from(new Set(providers.map(p => p.province))).map(prov => (
                     <div key={prov} className="space-y-2">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{prov}</div>
                        {providers.filter(p => p.province === prov).map(p => {
                          const isOccupied = p.status.toLowerCase().includes('ocupado');
                          const isAvailable = p.status.toLowerCase().includes('disponível') || p.status.toLowerCase().includes('vagas') || p.status.toLowerCase().includes('operacional');
                          const isSelected = selectedProviderId === p.id;
                          return (
                            <div key={p.id} onClick={() => { setSelectedProviderId(p.id); if (mapRef.current) mapRef.current.flyTo(p.pos, 15); }} className={`bg-white p-3 rounded-xl border transition-all shadow-sm flex items-center gap-3 cursor-pointer ${isSelected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/30' : 'border-slate-100 hover:border-blue-500'}`}>
                                <div className={`p-2 rounded-lg ${p.type === 'hospital' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>{p.type === 'hospital' ? <Hospital className="w-4 h-4" /> : <Truck className="w-4 h-4" />}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-black text-slate-900 leading-none mb-1 truncate">{p.label}</div>
                                  <div className={`text-[9px] font-bold uppercase flex items-center gap-1.5 ${isOccupied ? 'text-orange-500' : isAvailable ? 'text-emerald-500' : 'text-slate-400'}`}>{isOccupied ? <AlertTriangle className="w-2.5 h-2.5" /> : isAvailable ? <CheckCircle2 className="w-2.5 h-2.5" /> : null}{p.status}</div>
                                </div>
                            </div>
                          );
                        })}
                     </div>
                   ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 relative bg-slate-50">
          <div ref={mapContainerRef} className="absolute inset-0 z-0" />
          <div className="absolute top-6 left-6 z-[400] flex flex-col gap-2 pointer-events-none">
            <div className="bg-white/90 backdrop-blur px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xl flex flex-wrap gap-6">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-600 ring-4 ring-red-100"></div><span className="text-[10px] font-black uppercase text-slate-700">Emergência Ativa</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-100"></div><span className="text-[10px] font-black uppercase text-slate-700">Rede Hospitalar</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-100"></div><span className="text-[10px] font-black uppercase text-slate-700">Rede Ambulatorial</span></div>
            </div>
            {viewMode === 'national' && <div className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl animate-in slide-in-from-top-4">Rede Nacional SSM: Activa em 4 Províncias</div>}
          </div>
          <div className="absolute bottom-6 left-6 z-[400] flex flex-col gap-2">
            <button onClick={viewMode === 'local' ? setMapToNational : setMapToLocal} className="bg-white p-3 rounded-2xl shadow-xl border border-slate-200 text-slate-700 hover:text-blue-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
              {viewMode === 'local' ? <Globe className="w-5 h-5" /> : <MapIcon className="w-5 h-5" />}
              <span className="text-[10px] font-black uppercase pr-1">{viewMode === 'local' ? 'Nacional' : 'Local'}</span>
            </button>
            <button onClick={() => { if (mapRef.current) { const center = viewMode === 'local' ? [-25.9692, 32.5732] : [-18.6657, 35.5296]; const zoom = viewMode === 'local' ? 13 : 6; mapRef.current.flyTo(center as [number, number], zoom); } }} className="bg-white p-3 rounded-2xl shadow-xl border border-slate-200 text-slate-700 hover:text-emerald-600 transition-all hover:scale-105 active:scale-95"><Crosshair className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .leaflet-container { background: #f8fafc; cursor: crosshair; }
        .leaflet-bottom.leaflet-right { margin-bottom: 20px; margin-right: 20px; }
        .leaflet-bar { border: none !important; box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; }
        .leaflet-bar a { border-radius: 12px !important; margin-bottom: 5px; border-bottom: none !important; }
        .leaflet-control-zoom-in, .leaflet-control-zoom-out { color: #1e293b !important; font-weight: bold !important; }
        .custom-leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        .custom-leaflet-tooltip:before { display: none !important; }
        .custom-leaflet-tooltip { pointer-events: auto !important; }
      `}</style>
    </div>
  );
};

export default NetworkMap;
