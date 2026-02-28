
import React, { useState, useMemo } from 'react';
import { 
  UserPlus, Shield, Building2, Truck, Users, Mail, Phone, 
  ChevronRight, CheckCircle2, ShieldAlert, Info, ArrowLeft, 
  Search, UserCheck, Activity, Edit3, Trash2, Ban, 
  MoreHorizontal, Filter, X, Save, AlertTriangle, Hash,
  Settings2, UserMinus
} from 'lucide-react';
import { UserRole, AdminUser } from '../types';
import { COMPANIES, ADMINS } from '../constants';
import { auditLogger } from '../services/auditLogger';

import { supabase } from '../services/supabase';

const AccountManagement: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [accounts, setAccounts] = useState<AdminUser[]>(ADMINS);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('todos');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState(''); // Adicionado para Supabase

  // Form State para Criação/Edição
  const [formData, setFormData] = useState<Partial<AdminUser>>({
    name: '',
    email: '',
    phone: '',
    role: 'OPERADOR_COORD',
    companyId: '',
    idDocument: '',
    username: ''
  });

  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const matchesSearch = acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           acc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           acc.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === 'todos' || acc.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [accounts, searchQuery, filterRole]);

  const handleOpenCreate = () => {
    setFormData({
      name: '', email: '', phone: '', role: 'OPERADOR_COORD', 
      companyId: '', idDocument: '', username: '', initials: ''
    });
    setPassword('');
    setView('create');
  };

  const handleOpenEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setFormData({ ...user });
    setView('edit');
  };

  const handleDelete = (userId: string) => {
    if (window.confirm(`Tem a certeza que deseja ELIMINAR permanentemente a conta ${userId}? Esta ação é irreversível.`)) {
      setAccounts(prev => prev.filter(a => a.id !== userId));
      // Log audit - ADM actions are tracked
      auditLogger.log({id: 'ADM-001', name: 'Marina Sengo', role: 'ADMIN_SSM'}, 'DATA_EXPORT_PDF', 'ADMIN', `Eliminação de conta: ${userId}`);
    }
  };

  const handleToggleStatus = (user: AdminUser) => {
    const action = user.isFirstAccess ? 'Ativar' : 'Suspender';
    if (window.confirm(`Deseja ${action} o acesso de ${user.name}?`)) {
      setAccounts(prev => prev.map(a => 
        a.id === user.id ? { ...a, isFirstAccess: !a.isFirstAccess } : a
      ));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (view === 'create') {
        // Se houver password, tentar criar no Supabase
        if (password && formData.email) {
          const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: password,
            options: {
              data: {
                full_name: formData.name,
                role: formData.role,
                company_id: formData.companyId
              }
            }
          });
          if (error) throw error;
          console.log('User created in Supabase:', data.user);
        }

        const newId = `SSM-${Math.floor(Math.random() * 9000) + 1000}`;
        const newUser: AdminUser = {
          ...(formData as AdminUser),
          id: newId,
          initials: formData.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'SSM',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || '')}&background=random&color=fff`,
          isFirstAccess: true
        };
        setAccounts([newUser, ...accounts]);
      } else {
        setAccounts(prev => prev.map(a => a.id === selectedUser?.id ? { ...a, ...formData } : a));
      }
      
      setView('list');
    } catch (err: any) {
      alert(`Erro ao processar conta: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'ADMIN_SSM': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'OPERADOR_COORD': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'MOTORISTA_AMB': return 'bg-red-100 text-red-700 border-red-200';
      case 'ADMIN_CLIENTE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[700px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Fixo */}
      <div className="bg-slate-900 p-8 text-white shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl border border-white/10">
              <Settings2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-corporate tracking-tight uppercase">Gestão de Identidades SSM</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Controlo Central de Acessos e Governação</p>
            </div>
          </div>
          <div className="flex gap-3">
             {view !== 'list' && (
               <button onClick={() => setView('list')} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                 <ArrowLeft className="w-4 h-4" /> Voltar à Lista
               </button>
             )}
             <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
               <X className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {view === 'list' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Barra de Ferramentas */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Pesquisar por Nome, ID ou E-mail..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-black outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
                <select 
                  value={filterRole}
                  onChange={e => setFilterRole(e.target.value)}
                  className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none"
                >
                  <option value="todos">Todos os Perfis</option>
                  <option value="ADMIN_SSM">Administradores</option>
                  <option value="OPERADOR_COORD">Coordenação</option>
                  <option value="MOTORISTA_AMB">Ambulâncias</option>
                  <option value="ADMIN_CLIENTE">Empresas</option>
                </select>
              </div>
              <button 
                onClick={handleOpenCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
              >
                <UserPlus className="w-4 h-4" /> Criar Nova Identidade
              </button>
            </div>

            {/* Listagem de Contas */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAccounts.map((acc) => (
                  <div key={acc.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-xl hover:border-blue-300 transition-all group relative overflow-hidden">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm">
                          <img src={acc.avatar} alt={acc.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-tight truncate max-w-[150px]">{acc.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">ID: {acc.id}</p>
                        </div>
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${getRoleBadge(acc.role)}`}>
                        {acc.role.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                       <div className="flex items-center gap-3 text-slate-500">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold truncate">{acc.email}</span>
                       </div>
                       <div className="flex items-center gap-3 text-slate-500">
                          <Phone className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold">{acc.phone}</span>
                       </div>
                       {acc.companyId && (
                         <div className="flex items-center gap-3 text-blue-600">
                            <Building2 className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-black uppercase tracking-tighter">{acc.companyId}</span>
                         </div>
                       )}
                    </div>

                    <div className="flex items-center gap-2 border-t border-slate-100 pt-5">
                       <button onClick={() => handleOpenEdit(acc)} className="flex-1 py-2.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                          <Edit3 className="w-3.5 h-3.5" /> Gerir
                       </button>
                       <button onClick={() => handleToggleStatus(acc)} className={`p-2.5 rounded-xl border transition-all ${acc.isFirstAccess ? 'bg-red-50 border-red-100 text-red-500' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-red-50 hover:border-red-100 hover:text-red-500'}`}>
                          {acc.isFirstAccess ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                       </button>
                       <button onClick={() => handleDelete(acc.id)} className="p-2.5 bg-slate-50 hover:bg-red-600 text-slate-400 hover:text-white rounded-xl transition-all">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* VISTA DE FORMULÁRIO (CRIAR/EDITAR) (Baseado na Foto 8) */
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/30">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm animate-in slide-in-from-right-8">
                <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    {view === 'create' ? <UserPlus className="w-6 h-6" /> : <Edit3 className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase font-corporate tracking-tight">
                      {view === 'create' ? 'Configurar Nova Identidade' : 'Modificar Perfil Autorizado'}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                      {view === 'create' ? 'Os parâmetros seguem os protocolos de governação SSM' : `A editar credenciais de ${selectedUser?.id}`}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:border-blue-600 outline-none transition-all"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Acesso (Role)</label>
                      <select 
                        required
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:border-blue-600 outline-none appearance-none cursor-pointer"
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value as any})}
                      >
                        <option value="OPERADOR_COORD">Operador de Coordenação</option>
                        <option value="GESTOR_RISCO">Gestor de Risco</option>
                        <option value="GESTOR_FROTA_AMB">Gestor de Ambulância (Frota)</option>
                        <option value="MOTORISTA_AMB">Unidade de Ambulância (Motorista)</option>
                        <option value="ADMIN_CLIENTE">Gestor de Cliente (Empresa)</option>
                        <option value="ADMIN_SSM">Administrador Global</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                      <input 
                        required
                        type="email" 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:border-blue-600 outline-none transition-all"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contacto Móvel</label>
                      <input 
                        required
                        type="tel" 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:border-blue-600 outline-none transition-all"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    {view === 'create' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Palavra-passe (Supabase Auth)</label>
                        <input 
                          type="password" 
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:border-blue-600 outline-none transition-all"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                        />
                      </div>
                    )}
                  </div>

                  {formData.role === 'ADMIN_CLIENTE' && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vínculo Corporativo</label>
                      <select 
                        required
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:border-blue-600 outline-none appearance-none cursor-pointer"
                        value={formData.companyId}
                        onChange={e => setFormData({...formData, companyId: e.target.value})}
                      >
                        <option value="">Selecione a Organização...</option>
                        {COMPANIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex items-start gap-4">
                    <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                       <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest leading-relaxed">Conformidade e Segurança</p>
                       <p className="text-[9px] font-medium text-blue-700/70 mt-1 leading-relaxed">
                         {view === 'create' 
                           ? 'Um convite de ativação será enviado. O utilizador terá 24h para definir a senha e validar o dispositivo.' 
                           : 'Alterações em roles e e-mails exigem re-autenticação do utilizador na próxima sessão.'}
                       </p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setView('list')}
                      className="flex-1 py-5 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <> <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> PROCESSANDO... </>
                      ) : (
                        <> <Save className="w-5 h-5" /> {view === 'create' ? 'CRIAR IDENTIDADE' : 'GUARDAR MODIFICAÇÕES'} </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AccountManagement;
