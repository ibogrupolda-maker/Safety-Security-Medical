
import React, { useState } from 'react';
import { 
  User, Shield, Bell, Globe, Lock, LogOut, 
  Camera, CheckCircle, AlertCircle, AlertTriangle, Smartphone, 
  Eye, Save, X, Trash2, Download, History, 
  Smartphone as PhoneIcon, Mail, Building, 
  Calendar, MapPin, Hash, UserCircle, Settings,
  MessageSquare, Languages, Clock, Sun, Moon, ChevronRight
} from 'lucide-react';
import { AdminUser, UserRole } from '../types';
import { COMPANIES } from '../constants';

interface UserProfileSettingsProps {
  user: AdminUser;
  initialTab?: 'perfil' | 'definicoes';
  onUpdateUser: (updates: Partial<AdminUser>) => void;
  onClose: () => void;
}

const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({ 
  user, 
  initialTab = 'perfil',
  onUpdateUser,
  onClose 
}) => {
  const [activeView, setActiveView] = useState<'perfil' | 'definicoes'>(initialTab);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'seguranca' | 'notificacoes' | 'preferencias' | 'privacidade' | 'conta'>('seguranca');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning', message: string } | null>(null);
  const [showCriticalModal, setShowCriticalModal] = useState<{ field: string, value: any } | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<AdminUser>(user);
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = () => {
    // Check if email changed - simulation of a critical action requirement
    if (formData.email !== user.email) {
      setShowCriticalModal({ field: 'E-mail', value: formData.email });
      return;
    }

    executeSave();
  };

  const executeSave = () => {
    setIsSaving(true);
    // Simulação de delay de rede
    setTimeout(() => {
      onUpdateUser(formData);
      setIsSaving(false);
      showToast('success', 'Alterações guardadas com sucesso.');
      if (showCriticalModal) setShowCriticalModal(null);
    }, 800);
  };

  const requestAccountAction = (action: string) => {
    showToast('warning', `Solicitação de ${action} enviada para a administração. Aguarde contacto via e-mail.`);
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'ADMIN_SSM': return 'Administrador Global';
      case 'OPERADOR_COORD': return 'Operador de Coordenação';
      case 'GESTOR_RISCO': return 'Analista de Risco';
      case 'MOTORISTA_AMB': return 'Unidade de Ambulância';
      case 'ADMIN_CLIENTE': return 'Empresa Cliente';
      default: return role;
    }
  };

  const associatedCompany = COMPANIES.find(c => c.id === user.companyId);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Feedback Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[120] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 border ${
          toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 
          toast.type === 'error' ? 'bg-red-600 border-red-500 text-white' : 'bg-orange-500 border-orange-400 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      {/* Critical Change Modal */}
      {showCriticalModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-red-100">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase font-corporate tracking-tight mb-2">Alteração Crítica</h3>
            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
              Está prestes a alterar o seu <strong>{showCriticalModal.field}</strong>. Por motivos de segurança, esta ação será registada no log de auditoria e poderá exigir re-autenticação. Deseja continuar?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowCriticalModal(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200">Cancelar</button>
              <button onClick={executeSave} className="flex-1 py-4 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-600/20">Confirmar Alteração</button>
            </div>
          </div>
        </div>
      )}

      {/* Header Fixo */}
      <div className="bg-slate-900 p-8 text-white relative shrink-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl relative">
                <img src={formData.avatar} alt={formData.name} className="w-full h-full object-cover" />
                <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </button>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center border-2 border-slate-900 shadow-lg">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black font-corporate tracking-tight">{formData.name}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 px-3 py-1 rounded-full border border-white/10">
                  {getRoleDisplayName(formData.role)}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#{formData.id}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X className="w-6 h-6" /></button>
        </div>

        {/* Abas Principais (Foto 1) */}
        <div className="flex gap-8 mt-8 border-t border-white/10 pt-6">
          <button 
            onClick={() => setActiveView('perfil')}
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all pb-2 border-b-2 ${activeView === 'perfil' ? 'text-white border-blue-500' : 'text-slate-400 border-transparent hover:text-white'}`}
          >
            <UserCircle className="w-4 h-4" /> O Meu Perfil
          </button>
          <button 
            onClick={() => setActiveView('definicoes')}
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all pb-2 border-b-2 ${activeView === 'definicoes' ? 'text-white border-blue-500' : 'text-slate-400 border-transparent hover:text-white'}`}
          >
            <Settings className="w-4 h-4" /> Definições de Conta
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {activeView === 'perfil' ? (
          /* VISTA DE PERFIL (FOTO 1 e 2) */
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/50">
            <div className="max-w-4xl space-y-10">
              
              <section className="space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Informação Pessoal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="text" 
                        value={formData.username}
                        onChange={e => setFormData({...formData, username: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Telefone</label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" 
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Identificação e Morada</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Documento de Identificação (BI/Passaporte)</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="text" 
                        value={formData.idDocument}
                        onChange={e => setFormData({...formData, idDocument: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data de Nascimento</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="date" 
                        value={formData.dob}
                        onChange={e => setFormData({...formData, dob: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Género</label>
                    <select 
                      value={formData.gender}
                      onChange={e => setFormData({...formData, gender: e.target.value as any})}
                      className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none"
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="Outro">Outro / Prefiro não dizer</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Morada</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="text" 
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" 
                      />
                    </div>
                  </div>
                </div>
              </section>

              {(user.role === 'ADMIN_CLIENTE' || user.role === 'MOTORISTA_AMB') && (
                <section className="space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Vínculo Institucional</h3>
                  <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-2xl p-2 border border-blue-100 shadow-sm">
                      <img src={associatedCompany?.logo} alt={associatedCompany?.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Empresa Associada</p>
                      <p className="text-xl font-black text-blue-900">{associatedCompany?.name}</p>
                      <p className="text-xs font-bold text-blue-600/60 mt-1 uppercase tracking-widest">ID Contrato: {associatedCompany?.id}-SSM-2026</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Ações (Foto 2) */}
              <div className="pt-10 flex justify-end gap-4 border-t border-slate-200">
                <button onClick={onClose} className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Descartar</button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10"
                >
                  {isSaving ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar Alterações
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* VISTA DE DEFINIÇÕES (FOTO 3 a 8) */
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar de Definições */}
            <nav className="w-64 border-r border-slate-100 bg-slate-50/30 shrink-0 p-6 space-y-2">
              {[
                { id: 'seguranca', label: 'Segurança', icon: Lock },
                { id: 'notificacoes', label: 'Notificações', icon: Bell },
                { id: 'preferencias', label: 'Preferências', icon: Globe },
                { id: 'privacidade', label: 'Privacidade', icon: Eye },
                { id: 'conta', label: 'Conta', icon: AlertCircle },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveSettingsTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSettingsTab === tab.id ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Conteúdo Definições */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <div className="max-w-2xl space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                
                {activeSettingsTab === 'seguranca' && (
                  <>
                    <section className="space-y-6">
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-xl font-black font-corporate tracking-tight text-slate-900 uppercase">Segurança de Acesso</h4>
                        <div className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[9px] font-black uppercase">Nível: Elevado</div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 space-y-8">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Smartphone className="w-6 h-6" /></div>
                            <div>
                              <p className="text-sm font-black text-slate-900">Autenticação de Dois Fatores (2FA)</p>
                              <p className="text-xs font-bold text-slate-400">Proteja a sua conta com um código extra via SMS ou App.</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Ativar</button>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl"><Lock className="w-6 h-6" /></div>
                            <div>
                              <p className="text-sm font-black text-slate-900">Palavra-passe</p>
                              <p className="text-xs font-bold text-slate-400">Última alteração: Há 3 meses.</p>
                            </div>
                          </div>
                          <button onClick={() => showToast('warning', 'Funcionalidade de troca de senha aberta.')} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50">Alterar</button>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1"><History className="w-3.5 h-3.5" /> Sessões Ativas</h4>
                      <div className="space-y-3">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Smartphone className="w-5 h-5" /></div>
                            <div>
                              <p className="text-xs font-black text-slate-900">iPhone 15 Pro • Maputo, MZ</p>
                              <p className="text-[9px] font-bold text-emerald-500 uppercase">Sessão Atual</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between opacity-60">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center"><Globe className="w-5 h-5" /></div>
                            <div>
                              <p className="text-xs font-black text-slate-900">Chrome no macOS • Matola, MZ</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Há 2 dias</p>
                            </div>
                          </div>
                          <button onClick={() => showToast('success', 'Sessão encerrada.')} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Encerrar</button>
                        </div>
                      </div>
                      <button onClick={() => showToast('success', 'Todas as outras sessões foram encerradas.')} className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">Encerrar todas as outras sessões</button>
                    </section>
                  </>
                )}

                {activeSettingsTab === 'notificacoes' && (
                  <section className="space-y-8">
                    <h4 className="text-xl font-black font-corporate tracking-tight text-slate-900 uppercase">Canais de Notificação</h4>
                    <div className="space-y-4">
                      {[
                        { id: 'email', label: 'E-mail Corporativo', desc: 'Receba resumos de incidentes e relatórios técnicos.', icon: Mail },
                        { id: 'sms', label: 'Mensagens SMS', desc: 'Alertas críticos quando offline.', icon: MessageSquare },
                        { id: 'whatsapp', label: 'WhatsApp Business', desc: 'Comunicação direta com a coordenação.', icon: PhoneIcon },
                        { id: 'push', label: 'Notificações Push', desc: 'Alertas em tempo real no dashboard.', icon: Smartphone },
                      ].map(chan => (
                        <div key={chan.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center justify-between group hover:border-blue-200 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 rounded-2xl transition-all"><chan.icon className="w-6 h-6" /></div>
                            <div>
                              <p className="text-sm font-black text-slate-900">{chan.label}</p>
                              <p className="text-xs font-bold text-slate-400">{chan.desc}</p>
                            </div>
                          </div>
                          <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Frequência das Notificações</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['imediata', 'resumo_diario', 'semanal'].map(freq => (
                          <button key={freq} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${freq === 'imediata' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-100 text-slate-400'}`}>
                            {freq.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {activeSettingsTab === 'preferencias' && (
                  <section className="space-y-8">
                    <h4 className="text-xl font-black font-corporate tracking-tight text-slate-900 uppercase">Regional e Estética</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Idioma do Sistema</label>
                        <div className="relative">
                          <Languages className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <select className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none">
                            <option>Português (PT)</option>
                            <option>English (UK)</option>
                            <option>Português (BR)</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fuso Horário</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <select className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none">
                            <option>Maputo (GMT+2)</option>
                            <option>Lisboa (GMT+0)</option>
                            <option>Joanesburgo (GMT+2)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Tema da Interface</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-3 p-6 bg-blue-50 border-2 border-blue-500 rounded-[2rem] text-blue-600 transition-all">
                          <Sun className="w-6 h-6" />
                          <span className="text-xs font-black uppercase tracking-widest">Modo Claro</span>
                        </button>
                        <button className="flex items-center justify-center gap-3 p-6 bg-slate-900 border-2 border-slate-800 rounded-[2rem] text-slate-400 opacity-60 hover:opacity-100 transition-all">
                          <Moon className="w-6 h-6" />
                          <span className="text-xs font-black uppercase tracking-widest">Modo Escuro</span>
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {activeSettingsTab === 'privacidade' && (
                  <section className="space-y-8">
                    <h4 className="text-xl font-black font-corporate tracking-tight text-slate-900 uppercase">Transparência e Dados</h4>
                    
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-start gap-4">
                      <Shield className="w-6 h-6 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-sm font-black text-emerald-900 leading-tight">Os seus dados estão protegidos.</p>
                        <p className="text-xs font-medium text-emerald-700 mt-1 leading-relaxed">
                          Cumprimos as normas nacionais de proteção de dados e diretivas ISO 27001 para governação médica corporativa.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quem pode ver o meu perfil?</h5>
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                        <div className="p-4 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Administração de Rede</span>
                          <span className="text-[10px] font-black text-emerald-600 uppercase">Sempre</span>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Outros Utilizadores SSM</span>
                          <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => showToast('success', 'Log de acessos gerado e enviado para o seu e-mail.')} className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline pt-4">
                      <History className="w-4 h-4" /> Ver Logs de Acesso aos meus Dados
                    </button>
                  </section>
                )}

                {activeSettingsTab === 'conta' && (
                  <section className="space-y-8">
                    <h4 className="text-xl font-black font-corporate tracking-tight text-slate-900 uppercase">Gestão da Conta</h4>
                    
                    <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 space-y-6">
                      <div className="flex items-center gap-3 text-red-600">
                        <AlertCircle className="w-6 h-6" />
                        <h5 className="text-sm font-black uppercase tracking-widest">Ações Críticas</h5>
                      </div>
                      <p className="text-xs font-medium text-red-800 leading-relaxed">
                        As ações abaixo requerem aprovação formal da **Administração Central de Operações SSM**. Ao solicitar, um e-mail de autorização será enviado para a gerência.
                      </p>
                      
                      <div className="grid grid-cols-1 gap-3 pt-4">
                        <button onClick={() => requestAccountAction('Desativação de Conta')} className="w-full flex items-center justify-between p-4 bg-white border border-red-200 rounded-2xl hover:bg-red-50 transition-all group">
                          <div className="flex items-center gap-3">
                            <LogOut className="w-5 h-5 text-red-500" />
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Desativar Temporariamente</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-red-50" />
                        </button>
                        <button onClick={() => requestAccountAction('Eliminação de Conta')} className="w-full flex items-center justify-between p-4 bg-white border border-red-200 rounded-2xl hover:bg-red-50 transition-all group">
                          <div className="flex items-center gap-3">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-red-600">Eliminar Permanentemente</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-red-50" />
                        </button>
                        <button onClick={() => requestAccountAction('Exportação de Dados')} className="w-full flex items-center justify-between p-4 bg-white border border-blue-200 rounded-2xl hover:bg-blue-50 transition-all group">
                          <div className="flex items-center gap-3">
                            <Download className="w-5 h-5 text-blue-500" />
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Exportar Todos os Dados (GDPR)</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-50" />
                        </button>
                      </div>
                    </div>
                  </section>
                )}

              </div>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default UserProfileSettings;
