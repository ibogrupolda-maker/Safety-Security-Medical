
import React from 'react';
import { Activity, MapPin, Clock, ExternalLink } from 'lucide-react';
import { EmergencyCase } from '../types';
import { COMPANIES } from '../constants';

interface LiveMonitoringProps {
  incidents: EmergencyCase[];
}

const LiveMonitoring: React.FC<LiveMonitoringProps> = ({ incidents }) => {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
          <h3 className="font-bold text-sm uppercase tracking-widest">Feed Operacional Moçambique</h3>
        </div>
        <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-mono tracking-tighter">DATA_MZ_LIVE</span>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-slate-700">
        {incidents.map((inc) => {
          const company = COMPANIES.find(c => c.id === inc.companyId);
          return (
            <div key={inc.id} className="group relative flex items-start gap-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800 transition-all cursor-default animate-in slide-in-from-top-2">
              <div className="w-10 h-10 rounded-lg bg-slate-700 flex-shrink-0 overflow-hidden border border-slate-600">
                <img src={company?.logo} alt="Logo" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-slate-500">{inc.id}</span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {inc.timestamp}
                  </span>
                </div>
                <p className="text-sm font-bold truncate group-hover:text-blue-400 transition-colors">{inc.type}</p>
                <div className="flex items-center justify-between mt-1">
                   <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate pr-4">
                    <MapPin className="w-3 h-3" /> {company?.name || inc.locationName}
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
        <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
          <span>Tempo Médio Decisão</span>
          <span className="text-emerald-400">42 segundos</span>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoring;
