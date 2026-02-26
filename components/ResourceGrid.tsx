
import React from 'react';
import { MapPin, Clock, Users, Package, Navigation, Info, Settings, MoreHorizontal, Truck, Hospital, UserPlus } from 'lucide-react';
import { Resource, ResourceStatus } from '../types';

interface ResourceGridProps {
  resources: Resource[];
}

const ResourceGrid: React.FC<ResourceGridProps> = ({ resources }) => {
  const getStatusBadge = (status: ResourceStatus) => {
    switch (status) {
      case 'available':
        return <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Disponível</span>;
      case 'assigned':
        return <span className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase"><Clock className="w-3 h-3" /> Atribuído</span>;
      case 'offline':
        return <span className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase"><Info className="w-3 h-3" /> Offline</span>;
      case 'maintenance':
        return <span className="flex items-center gap-1.5 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase"><Settings className="w-3 h-3" /> Manutenção</span>;
      default:
        return null;
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'ambulance': return <Truck className="w-6 h-6 text-slate-400" />;
      case 'hospital': return <Hospital className="w-6 h-6 text-slate-400" />;
      default: return <Users className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 mt-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 font-corporate uppercase tracking-tight">
          Recursos Disponíveis ({resources.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((res) => (
          <div key={res.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                  {getIcon(res.category)}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight mb-1">{res.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{res.type}</p>
                </div>
              </div>
              {getStatusBadge(res.status)}
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-xs font-semibold text-slate-600 truncate">{res.location}</span>
              </div>
              {res.eta && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-xs font-semibold text-slate-600">ETA: {res.eta}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-xs font-semibold text-slate-600">Capacidade: {res.capacity}</span>
              </div>
              {res.equipment && res.equipment.length > 0 && (
                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-xs font-semibold text-slate-600 truncate">{res.equipment[0]}</span>
                </div>
              )}
            </div>

            {res.currentAssignment && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Atribuição Atual</p>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">{res.currentAssignment}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <Info className="w-3.5 h-3.5" /> Ver Detalhes
              </button>
              {res.status === 'available' && (
                <button className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                  <Navigation className="w-3.5 h-3.5" /> Atribuir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceGrid;
