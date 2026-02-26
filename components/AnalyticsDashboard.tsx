
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Download, FileSpreadsheet, AlertCircle, AlertTriangle, Info, 
  ArrowUpRight, ArrowDownRight, Filter, RotateCcw, 
  CheckCircle, FileText, Clock, Activity, Shield, History, Eye, Lock,
  ChevronUp, ChevronDown, ArrowUpDown
} from 'lucide-react';
import NewsSection from './NewsSection';
import { auditLogger } from '../services/auditLogger';
import { AdminUser, Company } from '../types';

interface AnalyticsDashboardProps {
  currentUser: AdminUser;
  companies?: Company[];
}

type SortKey = 'timestamp' | 'severity';
type SortDirection = 'asc' | 'desc';

const monthlyData = [
  { name: 'Jan', value: 145 },
  { name: 'Fev', value: 130 },
  { name: 'Mar', value: 165 },
  { name: 'Abr', value: 155 },
  { name: 'Mai', value: 190 },
  { name: 'Jun', value: 180 },
  { name: 'Jul', value: 195 },
  { name: 'Ago', value: 205 },
  { name: 'Set', value: 188 },
  { name: 'Out', value: 212 },
  { name: 'Nov', value: 198 },
  { name: 'Dez', value: 208 }
];

const organizationMetrics = [
  { name: 'Tech Corp Industries', cases: 342, response: '5.8 min', success: '96.2%', score: 94, color: 'bg-emerald-500' },
  { name: 'Global Manufacturing Ltd', cases: 289, response: '6.4 min', success: '94.8%', score: 91, color: 'bg-emerald-500' },
  { name: 'Healthcare Services Inc', cases: 456, response: '5.2 min', success: '97.1%', score: 96, color: 'bg-emerald-500' },
  { name: 'Logistics Solutions Co', cases: 198, response: '7.1 min', success: '92.4%', score: 87, color: 'bg-orange-500' },
  { name: 'Financial Services Group', cases: 267, response: '6.8 min', success: '93.6%', score: 89, color: 'bg-orange-500' }
];

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ currentUser, companies = [] }) => {
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const severityPriority: Record<string, number> = {
    'CRITICAL': 3,
    'WARNING': 2,
    'INFO': 1
  };

  const myLogs = useMemo(() => {
    const isCorporate = ['ADMIN_CLIENTE', 'RESPONSAVEL_EMERG_CLIENTE', 'COLABORADOR_RH'].includes(currentUser.role);
    const rawLogs = isCorporate && currentUser.companyId 
      ? auditLogger.getLogsByCompany(currentUser.companyId)
      : auditLogger.getLogsByUser(currentUser.id);
    
    return [...rawLogs].sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'timestamp') {
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortKey === 'severity') {
        comparison = severityPriority[a.severity] - severityPriority[b.severity];
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [currentUser, sortKey, sortDirection]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const formatTimestamp = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const SortIcon = ({ currentKey }: { currentKey: SortKey }) => {
    if (sortKey !== currentKey) return <ArrowUpDown className="w-3 h-3 text-slate-300" />;
    return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-600" /> : <ChevronDown className="w-3 h-3 text-blue-600" />;
  };

  const filteredOrgMetrics = useMemo(() => {
    const isCorporate = ['ADMIN_CLIENTE', 'RESPONSAVEL_EMERG_CLIENTE', 'COLABORADOR_RH'].includes(currentUser.role);
    if (!isCorporate) return organizationMetrics;
    
    const userCompany = companies.find(c => c.id === currentUser.companyId);
    // Tentar encontrar nos dados mockados ou mostrar apenas a empresa do usuário
    const match = organizationMetrics.find(m => m.name.includes(userCompany?.name || ''));
    if (match) return [match];
    
    // Se não houver match nos dados mockados, criar um item para a empresa do usuário
    return [{
      name: userCompany?.name || 'A Sua Organização',
      cases: 0,
      response: 'N/A',
      success: '100%',
      score: 100,
      color: 'bg-blue-500'
    }];
  }, [currentUser]);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight font-corporate">Dashboard de Analítica</h2>
          <p className="text-slate-500 font-medium">Métricas abrangentes de relatórios e desempenho sob a sua jurisdição.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition-all shadow-md">
            <FileSpreadsheet className="w-4 h-4" /> Exportar Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight font-corporate uppercase">O Seu Registo de Auditoria</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Clique nos cabeçalhos para ordenar por data ou gravidade</p>
            </div>
          </div>
          <div className="bg-emerald-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-emerald-100">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Sessão Segura: {currentUser.name}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th 
                  onClick={() => toggleSort('timestamp')}
                  className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    Hora <SortIcon currentKey="timestamp" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('severity')}
                  className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    Nível / Ação <SortIcon currentKey="severity" />
                  </div>
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalhes Operacionais</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Integridade (Hash)</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myLogs.length > 0 ? myLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors animate-in fade-in duration-300">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-300" />
                      <span className="font-mono text-[11px] font-bold text-slate-500">{formatTimestamp(log.timestamp)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide border ${
                      log.severity === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-100' : 
                      log.severity === 'WARNING' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <p className="text-xs font-bold text-slate-500 max-w-xs truncate">{log.details}</p>
                  </td>
                  <td className="px-8 py-4">
                    <code className="bg-slate-100 px-2 py-1 rounded text-[10px] font-black text-slate-400 border border-slate-200">{log.integrityHash}</code>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button className="p-2 text-slate-300 hover:text-blue-600 transition-all"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Sem logs de atividade registados nesta sessão.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-tight">Tempo Médio de<br/>Resposta</p>
              <Clock className="w-5 h-5 text-blue-500 opacity-30" />
            </div>
            <div className="flex items-end gap-2">
              <h4 className="text-4xl font-black text-slate-900 leading-none tracking-tight">6.2</h4>
              <span className="text-xl font-bold text-slate-500 pb-0.5">min</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-tight">Taxa de Resolução<br/>de Casos</p>
              <CheckCircle className="w-5 h-5 text-blue-500 opacity-30" />
            </div>
            <h4 className="text-4xl font-black text-slate-900 leading-none tracking-tight">94.8%</h4>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-tight">Utilização de<br/>Recursos</p>
              <Activity className="w-5 h-5 text-blue-500 opacity-30" />
            </div>
            <h4 className="text-4xl font-black text-slate-900 leading-none tracking-tight">87.3%</h4>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-tight">Pontuação de<br/>Conformidade</p>
              <Shield className="w-5 h-5 text-blue-500 opacity-30" />
            </div>
            <h4 className="text-4xl font-black text-slate-900 leading-none tracking-tight">98.5%</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" /> Filtros
          </h5>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Intervalo de Datas</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer">
                <option>Últimos 30 Dias</option>
                <option>Últimos 90 Dias</option>
                <option>Este Ano</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
            <button className="bg-blue-700 text-white py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-md active:scale-95">Aplicar</button>
            <button className="bg-white border border-slate-200 text-slate-600 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Tendências de Volume de Emergência</h3>
            <p className="text-xs text-slate-400 mt-1 font-bold">Total de casos de emergência geridos por mês durante o último ano</p>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
              />
              <Bar dataKey="value" fill="#1E40AF" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="text-lg font-black text-slate-900 tracking-tight font-corporate uppercase">Métricas de Desempenho por Organização</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Organização</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Casos</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tempo Médio</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Taxa de Sucesso</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Pontuação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrgMetrics.map((org, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4 font-bold text-slate-700 text-sm">{org.name}</td>
                  <td className="px-8 py-4 font-bold text-slate-600 text-sm">{org.cases}</td>
                  <td className="px-8 py-4 font-bold text-slate-600 text-sm">{org.response}</td>
                  <td className="px-8 py-4 font-bold text-slate-600 text-sm">{org.success}</td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-sm font-black text-slate-900">{org.score}</span>
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${org.color}`} style={{ width: `${org.score}%` }}></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100">
        <NewsSection />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
