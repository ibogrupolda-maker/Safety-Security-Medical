
import React, { useState } from 'react';
import { Truck, Activity, Settings, Battery, Signal, Clock, ShieldAlert, CheckCircle2, AlertTriangle, Plus, X, Save, Smartphone, Gauge } from 'lucide-react';
import { AMBULANCES as INITIAL_AMBULANCES } from '../constants';
import { AmbulanceState } from '../types';

interface FleetManagementProps {
  ambulances: AmbulanceState[];
  onAddAmbulance: (amb: AmbulanceState) => void;
}

const FleetManagement: React.FC<FleetManagementProps> = ({ ambulances, onAddAmbulance }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAmbulance, setNewAmbulance] = useState({
    id: '',
    plate: '',
    type: 'Básica' as any,
    imei: '',
    capacity: 'Padrão'
  });

  const handleAddAmbulance = (e: React.FormEvent) => {
    e.preventDefault();
    const ambulance: AmbulanceState = {
      id: newAmbulance.id,
      plate: newAmbulance.plate,
      type: newAmbulance.type,
      currentPos: [-25.9692, 32.5732], // Default Maputo
      phase: 'idle',
      status: 'available',
      eta: 0,
      distance: 0,
      performance: {
        totalIncidents: 0,
        acceptanceRate: 100,
        avgResponseTime: 0
      }
    };
    
    onAddAmbulance(ambulance);
    setShowAddModal(false);
    setNewAmbulance({ id: '', plate: '', type: 'Básica', imei: '', capacity: 'Padrão' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Frota Ativa</p>
           <div className="flex items-end gap-3">
              <h4 className="text-4xl font-black text-slate-900 tracking-tight">{ambulances.length}</h4>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg mb-1">100% OPERACIONAL</span>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Manutenção Pendente</p>
           <h4 className="text-4xl font-black text-slate-900 tracking-tight">0</h4>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Consumo de Recursos</p>
           <h4 className="text-4xl font-black text-slate-900 tracking-tight">24%</h4>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
           <h3 className="text-lg font-black text-slate-900 font-corporate uppercase tracking-tight">Inventário de Unidades Móveis</h3>
           <button 
            onClick={() => setShowAddModal(true)}
            className="bg-slate-950 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all"
           >
            <Plus className="w-4 h-4" /> Registar Nova Viatura
           </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidade / Placa</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Local</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipamento</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ambulances.map(amb => (
                <tr key={amb.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center"><Truck className="w-5 h-5" /></div>
                      <div>
                        <p className="text-sm font-black text-slate-900 leading-none">{amb.id}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1.5">{amb.plate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">{amb.type}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                       <span className="text-[10px] font-black text-emerald-600 uppercase">Disponível</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex gap-1.5">
                       <Battery className="w-3.5 h-3.5 text-emerald-500" />
                       <Signal className="w-3.5 h-3.5 text-blue-500" />
                       <ShieldAlert className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-slate-300 hover:text-blue-600"><Settings className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Registo */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Registar Viatura</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Vínculo IMEI e Capacidade</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddAmbulance} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID da Unidade</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ex: ALPHA-4"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-600 transition-all"
                    value={newAmbulance.id}
                    onChange={e => setNewAmbulance({...newAmbulance, id: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Placa / Matrícula</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ex: ABC-123-MP"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-600 transition-all"
                    value={newAmbulance.plate}
                    onChange={e => setNewAmbulance({...newAmbulance, plate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Unidade</label>
                <select 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none appearance-none cursor-pointer"
                  value={newAmbulance.type}
                  onChange={e => setNewAmbulance({...newAmbulance, type: e.target.value as any})}
                >
                  <option value="Básica">Suporte Básico de Vida (SBV)</option>
                  <option value="Avançada">Suporte Avançado de Vida (SAV)</option>
                  <option value="Resgate">Unidade de Resgate</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Smartphone className="w-3 h-3" /> IMEI do Dispositivo (Vínculo de Login)
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="Introduza o IMEI de 15 dígitos"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-600 transition-all"
                  value={newAmbulance.imei}
                  onChange={e => setNewAmbulance({...newAmbulance, imei: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Gauge className="w-3 h-3" /> Capacidade de Resposta
                </label>
                <select 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none appearance-none cursor-pointer"
                  value={newAmbulance.capacity}
                  onChange={e => setNewAmbulance({...newAmbulance, capacity: e.target.value})}
                >
                  <option value="Padrão">Capacidade Padrão (1 Paciente)</option>
                  <option value="Dupla">Capacidade Dupla (2 Pacientes)</option>
                  <option value="Múltipla">Múltiplas Vítimas (Triagem em Massa)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Confirmar Registo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetManagement;
