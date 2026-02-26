
import React, { useState } from 'react';
import { 
  Activity, CheckCircle2, Clock, Info, Search, 
  RotateCcw, Map as MapIcon, Grid, List, 
  Package, LayoutGrid, Filter
} from 'lucide-react';
import NetworkMap from './NetworkMap';
import ResourceGrid from './ResourceGrid';
import { EmergencyCase, Resource, Company, Employee } from '../types';

interface ResourceManagementProps {
  incidents: EmergencyCase[];
  resources: Resource[];
  companies?: Company[];
  employees?: Employee[];
}

const ResourceManagement: React.FC<ResourceManagementProps> = ({ incidents, resources, companies = [], employees = [] }) => {
  const [view, setView] = useState<'map' | 'grid' | 'list'>('map');

  const activeIncidents = incidents.filter(i => i.status !== 'closed').length;
  const assignedAmbulances = incidents.filter(i => i.ambulanceId && i.status !== 'closed').length;

  const stats = [
    { label: 'Incidentes Ativos', value: activeIncidents.toString(), icon: Activity, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Ambulâncias Alocadas', value: assignedAmbulances.toString(), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Recursos Totais', value: resources.length.toString(), icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Disponíveis', value: (resources.length - assignedAmbulances).toString(), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-10">
      {/* 1. Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">{stat.value}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Barra de Filtros */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar recursos por nome, ID ou localização..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <select className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none hover:border-blue-400 transition-colors cursor-pointer">
            <option>Todos os Tipos</option>
            <option>Ambulância</option>
            <option>Hospital</option>
            <option>Equipa</option>
          </select>
          <select className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none hover:border-blue-400 transition-colors cursor-pointer">
            <option>Todos os Estados</option>
            <option>Disponível</option>
            <option>Atribuído</option>
            <option>Offline</option>
          </select>
          <select className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none hover:border-blue-400 transition-colors cursor-pointer">
            <option>Todas as Localizações</option>
            <option>Maputo</option>
            <option>Beira</option>
            <option>Nampula</option>
          </select>
        </div>

        <button className="p-3 text-slate-400 hover:text-red-500 transition-all hover:bg-red-50 rounded-xl">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Mapa de Recursos */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 font-corporate uppercase tracking-tight">Mapa de Recursos</h2>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => setView('map')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${view === 'map' ? 'bg-medical-blue text-white shadow-lg' : 'text-slate-500'}`}
            >
              <MapIcon className="w-4 h-4" /> Mapa
            </button>
            <button 
              onClick={() => setView('grid')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${view === 'grid' ? 'bg-medical-blue text-white shadow-lg' : 'text-slate-500'}`}
            >
              <LayoutGrid className="w-4 h-4" /> Grelha
            </button>
            <button 
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${view === 'list' ? 'bg-medical-blue text-white shadow-lg' : 'text-slate-500'}`}
            >
              <List className="w-4 h-4" /> Lista
            </button>
          </div>
        </div>

        <div className="h-[600px] shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden border border-slate-200 relative">
          <NetworkMap 
            incidents={incidents} 
            resources={resources} 
            companies={companies} 
            employees={employees} 
          />
          
          <div className="absolute top-24 right-8 z-[500] bg-white/95 backdrop-blur-sm p-5 rounded-[2rem] border border-slate-100 shadow-2xl pointer-events-none">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-4 border-b border-slate-100 pb-2">Legenda</h5>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div>
                <span className="text-[10px] font-bold uppercase text-slate-600">Disponível (4)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-50"></div>
                <span className="text-[10px] font-bold uppercase text-slate-600">Atribuído (2)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-red-50"></div>
                <span className="text-[10px] font-bold uppercase text-slate-600">Offline (2)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-3xl border border-slate-200 text-slate-500 shadow-sm animate-pulse">
        <Info className="w-5 h-5 text-blue-500" />
        <p className="text-xs font-bold uppercase tracking-widest leading-none">Clique nos marcadores do mapa para ver detalhes e atribuir a emergências.</p>
      </div>

      {/* 4. Grelha de Recursos (Solicitado pelo utilizador) */}
      <ResourceGrid resources={resources} />
    </div>
  );
};

export default ResourceManagement;
