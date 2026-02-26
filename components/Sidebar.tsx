
import React from 'react';
import { LayoutDashboard, ClipboardList, Siren, Users, Settings, LogOut, Truck, Building2, UserCircle, ShieldAlert, UserPlus } from 'lucide-react';
import SSMLogo from './SSMLogo';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'COMANDO DIGITAL', roles: ['ADMIN_SSM', 'OPERADOR_COORD', 'GESTOR_RISCO'] },
    { id: 'protocols', icon: ClipboardList, label: 'TRIAGEM SSM', roles: ['ADMIN_SSM', 'OPERADOR_COORD'] },
    // Item específico para clientes corporativos
    { id: 'corporate_sos', icon: ShieldAlert, label: 'EMERGÊNCIA', roles: ['ADMIN_CLIENTE', 'RESPONSAVEL_EMERG_CLIENTE', 'COLABORADOR_RH'] },
    { id: 'employee_registration', icon: UserPlus, label: 'CADASTRO', roles: ['ADMIN_CLIENTE', 'COLABORADOR_RH'] },
    { id: 'patients', icon: UserCircle, label: 'BASE MÉDICA', roles: ['ADMIN_SSM', 'OPERADOR_COORD', 'ADMIN_CLIENTE'] },
    { id: 'fleet', icon: Truck, label: 'GESTÃO DE FROTA', roles: ['ADMIN_SSM', 'GESTOR_FROTA_AMB'] },
    { id: 'companies', icon: Building2, label: 'CLIENTES', roles: ['ADMIN_SSM', 'GESTOR_RISCO'] },
    { id: 'map', icon: Siren, label: 'EMERGÊNCIA', roles: ['ADMIN_SSM', 'OPERADOR_COORD'] },
    { id: 'providers', icon: Users, label: 'GESTÃO SSM', roles: ['ADMIN_SSM', 'GESTOR_RISCO'] },
  ].filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-slate-950 text-slate-400 flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0">
      <div className="p-8 flex items-center gap-3">
        <SSMLogo className="w-10 h-10" />
        <span className="text-2xl font-black text-white tracking-tight">SSM</span>
      </div>
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id)} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-slate-900 hover:text-white'}`}
          >
            <item.icon className="w-5 h-5" /> {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-400 hover:bg-red-50/10 transition-all"><LogOut className="w-5 h-5" /> Sair da Rede</button>
      </div>
    </aside>
  );
};

export default Sidebar;
