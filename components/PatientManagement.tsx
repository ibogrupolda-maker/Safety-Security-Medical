
import React, { useState, useMemo } from 'react';
import { User, Shield, Search, Lock, FileText, CheckCircle2, AlertTriangle, Users, Building2, Phone, Heart, ClipboardList } from 'lucide-react';
import { COMPANIES } from '../constants';
import { Employee, AdminUser } from '../types';

interface PatientManagementProps {
  employees: Employee[];
  currentUser: AdminUser;
}

const PatientManagement: React.FC<PatientManagementProps> = ({ employees, currentUser }) => {
  const [search, setSearch] = useState('');
  
  // Filtro inteligente: Se for ADMIN_CLIENTE, vê apenas os da sua empresa. Se for ADMIN_SSM, vê todos.
  const filteredEmployees = useMemo(() => {
    let list = employees;
    
    if (currentUser.role === 'ADMIN_CLIENTE' || currentUser.role === 'RESPONSAVEL_EMERG_CLIENTE' || currentUser.role === 'COLABORADOR_RH') {
      list = employees.filter(e => e.companyId === currentUser.companyId);
    }

    return list.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.bi.toLowerCase().includes(search.toLowerCase())
    );
  }, [employees, search, currentUser]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight font-corporate uppercase">Base de Dados Médica</h2>
           <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-1 flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> {filteredEmployees.length} Registos Encontrados • AES-256 Bit</p>
        </div>
        <div className="relative w-full md:w-96">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
           <input 
            type="text" 
            placeholder="Pesquisar por BI, Nome ou Empresa..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
           />
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[3rem] p-20 flex flex-col items-center text-center">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6 border border-slate-100">
              <Users className="w-10 h-10" />
           </div>
           <h3 className="text-lg font-black text-slate-900 uppercase">Nenhum registo disponível</h3>
           <p className="text-slate-400 text-sm max-w-xs mt-2">Inicie um novo cadastro para que os seus colaboradores apareçam nesta lista.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredEmployees.map(p => {
            const company = COMPANIES.find(c => c.id === p.companyId);
            return (
              <div key={p.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 hover:shadow-xl transition-all group overflow-hidden relative animate-in slide-in-from-left-4">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12"><Heart className="w-32 h-32" /></div>
                
                <div className="flex flex-col lg:flex-row gap-10">
                   {/* Lado Esquerdo: Info Básica */}
                   <div className="flex items-start gap-6 lg:w-1/3">
                      <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-2xl shrink-0">
                         {p.name[0]}
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">{p.name}</h3>
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BI: {p.bi}</p>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{company?.name || 'SSM PROTECTED'}</p>
                         </div>
                      </div>
                   </div>

                   {/* Centro: Dados Médicos Críticos */}
                   <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 shadow-inner">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Cobertura Seguradora</p>
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><Shield className="w-5 h-5" /></div>
                            <div><p className="text-xs font-black text-slate-900">{p.insurer}</p><p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Apólice: {p.policyNumber}</p></div>
                         </div>
                      </div>

                      <div className="bg-red-50 p-5 rounded-3xl border border-red-100">
                         <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-3">Informação Crítica</p>
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-sm"><Heart className="w-5 h-5" /></div>
                            <div><p className="text-xs font-black text-red-900">Grupo: {p.bloodType}</p><p className="text-[9px] font-bold text-red-600/60 uppercase mt-0.5">{p.allergies?.join(', ') || 'Sem alergias'}</p></div>
                         </div>
                      </div>

                      <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100">
                         <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-3">Contacto Emergência</p>
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><Phone className="w-5 h-5" /></div>
                            <div><p className="text-xs font-black text-blue-900">{p.emergencyContact.name}</p><p className="text-[9px] font-bold text-blue-600/60 uppercase mt-0.5">{p.emergencyContact.phone}</p></div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
                   <div className="flex gap-4">
                      <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Ver Histórico Clínico</button>
                      <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Editar Ficha</button>
                   </div>
                   <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Última Validação: {new Date().toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' })}
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientManagement;
