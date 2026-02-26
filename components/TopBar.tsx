
import React, { useState } from 'react';
import { Bell, ChevronDown, ShieldCheck, UserCircle, LogOut, Settings, Hash, UserPlus, Shield } from 'lucide-react';
import { AdminUser } from '../types';

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: AdminUser;
  onLogout?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getRoleDisplayName = (role: string, id: string) => {
    if (id === 'ADM-001') return 'ADMIN-001';
    switch (role) {
      case 'ADMIN_SSM': return 'Administrador SSM';
      case 'OPERADOR_COORD': return 'Coordenação';
      case 'GESTOR_RISCO': return 'Gestor de Risco';
      case 'MOTORISTA_AMB': return 'Unidade Móvel';
      case 'GESTOR_FROTA_AMB': return 'Gestão de Frota';
      case 'ADMIN_CLIENTE': return 'Admin Cliente';
      case 'RESPONSAVEL_EMERG_CLIENTE': return 'Resp. Emergência';
      case 'COLABORADOR_RH': return 'RH Corporativo';
      default: return role;
    }
  };

  const handleOpenProfile = () => {
    setActiveTab('profile');
    setShowUserMenu(false);
  };

  const handleOpenSettings = () => {
    setActiveTab('settings');
    setShowUserMenu(false);
  };

  const handleOpenAccountManagement = () => {
    setActiveTab('accounts');
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 px-8 flex flex-col z-40 shrink-0">
      <div className="h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <nav className="flex gap-6">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border transition-all ${
                activeTab === 'dashboard' 
                ? 'text-blue-600 bg-blue-50 border-blue-100' 
                : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              Centro de Comando
            </button>
            {['ADMIN_SSM', 'OPERADOR_COORD'].includes(currentUser.role) && (
              <button 
                onClick={() => setActiveTab('protocols')}
                className={`text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === 'protocols' 
                  ? 'text-blue-600' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                TRIAGEM SSM
              </button>
            )}
            {['ADMIN_SSM', 'OPERADOR_COORD'].includes(currentUser.role) && (
              <button 
                onClick={() => setActiveTab('map')}
                className={`text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === 'map' 
                  ? 'text-blue-600' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                EMERGÊNCIA
              </button>
            )}
            {['ADMIN_SSM', 'GESTOR_RISCO'].includes(currentUser.role) && (
              <button 
                onClick={() => setActiveTab('providers')}
                className={`text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === 'providers' 
                  ? 'text-blue-600' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                GESTÃO SSM
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-900 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
            </button>

            <div className="relative">
              <div 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-4 pl-4 border-l border-slate-100 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[11px] font-black border-2 border-slate-100 shadow-sm overflow-hidden">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col items-start min-w-[100px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 leading-none truncate max-w-[120px]">{currentUser.name}</span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 group-hover:text-slate-900 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="bg-slate-900 text-white px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                      <Hash className="w-2 h-2" />
                      <span className="text-[8px] font-black uppercase tracking-tighter whitespace-nowrap">
                        {currentUser.id}
                      </span>
                    </div>
                    <div className="bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                      <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest whitespace-nowrap">
                        {getRoleDisplayName(currentUser.role, currentUser.id)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-3xl shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-5 py-2 border-b border-slate-50 mb-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Identidade Verificada</p>
                  </div>
                  
                  <div className="px-5 py-4 flex items-center gap-4 bg-slate-50/50 mx-2 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-md">
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-none">{currentUser.name}</p>
                      <p className="text-[10px] font-bold text-blue-600 uppercase mt-1 tracking-widest">{currentUser.id}</p>
                    </div>
                  </div>

                  <div className="mt-2 pt-2">
                    <button 
                      onClick={handleOpenProfile}
                      className={`w-full flex items-center gap-4 px-6 py-2.5 transition-colors text-[10px] font-black uppercase tracking-widest ${activeTab === 'profile' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      <UserCircle className="w-4 h-4" /> O Meu Perfil
                    </button>
                    <button 
                      onClick={handleOpenSettings}
                      className={`w-full flex items-center gap-4 px-6 py-2.5 transition-colors text-[10px] font-black uppercase tracking-widest ${activeTab === 'settings' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      <Settings className="w-4 h-4" /> Definições
                    </button>
                    
                    {/* NOVA OPÇÃO: EXCLUSIVA PARA ADMINISTRADORES */}
                    {currentUser.role === 'ADMIN_SSM' && (
                      <button 
                        onClick={handleOpenAccountManagement}
                        className={`w-full flex items-center gap-4 px-6 py-3 transition-colors text-[10px] font-black uppercase tracking-widest border-t border-slate-100 mt-1 ${activeTab === 'accounts' ? 'text-blue-600 bg-blue-50' : 'text-blue-700 hover:bg-blue-50'}`}
                      >
                        <UserPlus className="w-4 h-4" /> CONTA SSM
                      </button>
                    )}

                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center gap-4 px-6 py-3 text-red-500 hover:bg-red-50 transition-colors text-[10px] font-black uppercase tracking-widest border-t border-slate-50"
                    >
                      <LogOut className="w-4 h-4" /> Terminar Sessão
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
