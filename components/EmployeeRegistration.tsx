
import React, { useState } from 'react';
import { UserPlus, User, Shield, Phone, Heart, FileText, Save, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Employee } from '../types';

interface EmployeeRegistrationProps {
  companyId?: string;
  onAddEmployee: (employee: Employee) => void;
}

const EmployeeRegistration: React.FC<EmployeeRegistrationProps> = ({ companyId, onAddEmployee }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    bi: '',
    age: '',
    sex: 'M' as 'M' | 'F',
    bloodType: 'O+',
    allergies: '',
    medicalHistory: '',
    insurer: '',
    policyNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulação de processamento e criação de ID
    setTimeout(() => {
      const newEmployee: Employee = {
        id: `EMP-${Math.floor(Math.random() * 10000)}`,
        companyId: companyId || 'INTERNAL',
        name: formData.name,
        bi: formData.bi,
        age: parseInt(formData.age),
        sex: formData.sex,
        bloodType: formData.bloodType,
        insurer: formData.insurer || 'N/A',
        policyNumber: formData.policyNumber || 'P-PENDENTE',
        policyValidity: '31/12/2026',
        emergencyContact: {
          name: formData.emergencyContactName,
          relation: 'Emergência',
          phone: formData.emergencyContactPhone
        },
        allergies: formData.allergies ? formData.allergies.split(',') : [],
        medicalHistory: formData.medicalHistory
      };

      onAddEmployee(newEmployee);
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Limpar formulário
      setFormData({
        name: '', bi: '', age: '', sex: 'M', bloodType: 'O+',
        allergies: '', medicalHistory: '', insurer: '',
        policyNumber: '', emergencyContactName: '', emergencyContactPhone: ''
      });

      setTimeout(() => setShowSuccess(false), 3000);
    }, 1200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight font-corporate uppercase">Cadastro de Colaboradores</h2>
          <p className="text-slate-500 font-medium mt-1">Registe novos membros na rede de proteção SSM Digital.</p>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-emerald-900 font-black uppercase text-sm">Cadastro Concluído</p>
            <p className="text-emerald-700 text-xs font-medium">O colaborador foi adicionado à base médica e aparecerá imediatamente na listagem.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden mb-10">
        <div className="p-8 lg:p-12 space-y-12">
          
          {/* Seção 1: Informação Pessoal */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Informação Pessoal</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" placeholder="Ex: João Manuel" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">BI / Passaporte</label>
                <input required name="bi" value={formData.bi} onChange={handleInputChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" placeholder="123456789012A" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Idade</label>
                  <input required name="age" value={formData.age} onChange={handleInputChange} type="number" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sexo</label>
                  <select name="sex" value={formData.sex} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none appearance-none">
                    <option value="M">Masc</option>
                    <option value="F">Fem</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 2: Dados Médicos */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Heart className="w-5 h-5 text-red-600" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Protocolo Clínico</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo Sanguíneo</label>
                <select name="bloodType" value={formData.bloodType} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none appearance-none">
                  <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                  <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                </select>
              </div>
              <div className="space-y-1.5 lg:col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Alergias (Separadas por vírgula)</label>
                <input name="allergies" value={formData.allergies} onChange={handleInputChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" placeholder="Ex: Penicilina, Amendoim..." />
              </div>
              <div className="space-y-1.5 lg:col-span-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Histórico Médico Relevante</label>
                <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none h-24 resize-none" placeholder="Doenças crónicas, cirurgias recentes, medicação contínua..."></textarea>
              </div>
            </div>
          </section>

          {/* Seção 3: Seguro e Emergência */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Shield className="w-5 h-5 text-emerald-600" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Cobertura e Segurança</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Seguradora</label>
                <input name="insurer" value={formData.insurer} onChange={handleInputChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" placeholder="Hollard, Sanlam..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nº Apólice</label>
                <input name="policyNumber" value={formData.policyNumber} onChange={handleInputChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contacto Emergência</label>
                <input required name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" placeholder="Nome do Contacto" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Telefone Emergência</label>
                <input required name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleInputChange} type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" placeholder="+258..." />
              </div>
            </div>
          </section>

          <div className="pt-8 flex flex-col md:flex-row gap-4">
            <button type="submit" disabled={isSubmitting} className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
              {isSubmitting ? 'PROCESSANDO...' : 'GUARDAR NO SISTEMA'}
            </button>
            <button type="button" onClick={() => setFormData({ name: '', bi: '', age: '', sex: 'M', bloodType: 'O+', allergies: '', medicalHistory: '', insurer: '', policyNumber: '', emergencyContactName: '', emergencyContactPhone: '' })} className="flex-1 bg-white border border-slate-200 text-slate-500 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <X className="w-4 h-4" /> CANCELAR
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmployeeRegistration;
