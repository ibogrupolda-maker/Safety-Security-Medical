
import React, { useState } from 'react';
import { Sparkles, Loader2, FileText, CheckCircle2, Shield, Printer, ArrowRight, ArrowLeft, AlertCircle, Info, ClipboardList, Stethoscope, Building2, Send } from 'lucide-react';
import { getProtocolAdvice } from '../services/geminiService';
import { ProtocolSuggestion, EmergencyPriority, EmergencyCase, AdminUser } from '../types';
import { PRIORITY_COLORS, COMPANIES } from '../constants';

type TriageMode = 'AI_ANALYSIS' | 'STRUCTURED_FLOW';

interface TriageData {
  company: string;
  patientName: string;
  age: string;
  location: string;
  contact: string;
}

interface ProtocolAssistantProps {
  currentUser: AdminUser;
  onAddIncident?: (incident: EmergencyCase) => void;
}

const ProtocolAssistant: React.FC<ProtocolAssistantProps> = ({ currentUser, onAddIncident }) => {
  const [mode, setMode] = useState<TriageMode>('STRUCTURED_FLOW');
  const [scenario, setScenario] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<ProtocolSuggestion | null>(null);
  
  // Structured Flow State - "company" pré-preenchido simulando alerta de entrada
  const [currentStep, setCurrentStep] = useState(0);
  
  const userCompany = COMPANIES.find(c => c.id === currentUser.companyId);

  const [triageData, setTriageData] = useState<TriageData>({ 
    company: userCompany?.name || 'SSM Global Dispatch', 
    patientName: '', 
    age: '', 
    location: '', 
    contact: '' 
  });
  const [results, setResults] = useState<Record<string, boolean>>({});

  const handleAnalyze = async () => {
    if (!scenario.trim()) return;
    setLoading(true);
    try {
      const result = await getProtocolAdvice(scenario);
      setSuggestion(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      id: 0,
      title: 'Validação Mínima (Etapa 0)',
      description: 'Identificação da origem corporativa e dados do paciente.',
      questions: []
    },
    {
      id: 1,
      title: 'Discriminadores Críticos (Etapa 1)',
      description: 'Identificação de perigo imediato de vida.',
      priority: EmergencyPriority.CRITICAL,
      questions: [
        { id: 'q1_1', text: 'A pessoa está inconsciente ou desmaiou?' },
        { id: 'q1_2', text: 'Dispneia grave ou não consegue falar frases completas?' },
        { id: 'q1_3', text: 'Há dor no peito forte, opressiva ou irradiando?' },
        { id: 'q1_4', text: 'Há/houve convulsão ou confusão súbita?' },
        { id: 'q1_5', text: 'Existe hemorragia activa que não para com compressão?' },
        { id: 'q1_6', text: 'Sofreu trauma grave na cabeça?' },
        { id: 'q1_7', text: 'Sofreu trauma grave no tórax/abdómen?' },
        { id: 'q1_8', text: 'Queda >2 m, esmagamento, explosão ou electrocussão?' },
        { id: 'q1_9', text: 'Há suspeita de AVC? (Boca torta, fraqueza de um lado, confusão)' }
      ]
    },
    {
      id: 2,
      title: 'Discriminadores de Alto Risco (Etapa 2)',
      description: 'Sinais de gravidade elevada sem perigo imediato.',
      priority: EmergencyPriority.HIGH,
      questions: [
        { id: 'q2_1', text: 'Está consciente, mas sonolento?' },
        { id: 'q2_2', text: 'Dispneia moderada (com ou sem chiados)?' },
        { id: 'q2_3', text: 'Trauma na cabeça sem perda de consciência?' },
        { id: 'q2_4', text: 'Trauma torácico sem dispneia?' },
        { id: 'q2_5', text: 'Trauma abdominal sem perfuração?' },
        { id: 'q2_6', text: 'Dor torácica moderada (escala 4 – 7/10)?' },
        { id: 'q2_7', text: 'Fractura com exposição óssea?' },
        { id: 'q2_8', text: 'Queimadura extensa (mãos, pés, face ou genitália)?' },
        { id: 'q2_9', text: 'Confusão mental com ou sem febre alta?' }
      ]
    },
    {
      id: 3,
      title: 'Urgência Estável (Etapa 3)',
      description: 'Condições que requerem avaliação mas estão estáveis.',
      priority: EmergencyPriority.MODERATE,
      questions: [
        { id: 'q3_1', text: 'Cefaleia intensa sem perda de força ou confusão mental?' },
        { id: 'q3_2', text: 'Fractura sem exposição óssea?' },
        { id: 'q3_3', text: 'Entorse ou deslocamento ósseo?' },
        { id: 'q3_4', text: 'Cefaleia intensa?' },
        { id: 'q3_5', text: 'Mal-estar geral persistente?' },
        { id: 'q3_6', text: 'Pequenas queimaduras?' },
        { id: 'q3_7', text: 'Reacção alérgica moderada?' }
      ]
    },
    {
      id: 4,
      title: 'Baixa Prioridade (Etapa 4)',
      description: 'Queixas ligeiras sem sinais de alarme.',
      priority: EmergencyPriority.LOW,
      questions: [
        { id: 'q4_1', text: 'Ferimentos superficiais?' },
        { id: 'q4_2', text: 'Dor Lombar?' },
        { id: 'q4_3', text: 'Pequenos acidentes sem trauma significativo?' },
        { id: 'q4_4', text: 'Vómitos com ou sem diarreia?' }
      ]
    }
  ];

  const handleNextFlow = () => {
    // Check if any "Yes" in current step (except step 0)
    if (currentStep > 0) {
      const currentQuestions = steps[currentStep].questions;
      const hasYes = currentQuestions.some(q => results[q.id]);
      
      if (hasYes) {
        // Stop and show result
        const stepPriority = steps[currentStep].priority;
        setSuggestion({
          classification: stepPriority!,
          actionRequired: stepPriority === EmergencyPriority.CRITICAL ? 'EMERGÊNCIA - SAV/UCI' : stepPriority === EmergencyPriority.HIGH ? 'MUITO URGENTE - SAV/UCI' : stepPriority === EmergencyPriority.MODERATE ? 'URGENTE - Ambulância Básica' : 'POUCO URGENTE - Veículo não médico',
          reasoning: `Classificação atribuída por discriminador positivo na Etapa ${currentStep} do Protocolo de Triagem SSM.`,
          suggestedResources: stepPriority === EmergencyPriority.CRITICAL || stepPriority === EmergencyPriority.HIGH ? ['Acionamento SAV', 'Oxigénio', 'Monitorização Contínua'] : ['Ambulância Básica', 'Atendimento no Local']
        });
        setCurrentStep(5); // Result view
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // All no
      setSuggestion({
        classification: EmergencyPriority.LOW,
        actionRequired: 'NÃO URGENTE (AZUL)',
        reasoning: 'Nenhum discriminador de urgência detectado durante o fluxograma de triagem telefónica.',
        suggestedResources: ['Acompanhamento Telefónico', 'Encaminhamento para Clínica de Rede']
      });
      setCurrentStep(5);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setResults({});
    setSuggestion(null);
    setTriageData({ 
      company: userCompany?.name || 'SSM Global Dispatch', 
      patientName: '', 
      age: '', 
      location: '', 
      contact: '' 
    });
  };

  const handleSubmitToOperations = () => {
    if (!suggestion || !onAddIncident) return;

    const newCase: EmergencyCase = {
      id: `SSM-MZ-${Math.floor(Math.random() * 900) + 100}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: suggestion.actionRequired,
      locationName: triageData.location || 'Local Não Especificado',
      status: 'active',
      priority: suggestion.classification,
      coords: [-25.9692 + (Math.random() - 0.5) * 0.01, 32.5732 + (Math.random() - 0.5) * 0.01],
      patientName: triageData.patientName, // INTEGRADO: Nome vindo do formulário
      companyId: currentUser.companyId || 'SSM', 
      employeeId: 'EXTERNAL' // Identificador para caso externo
    };

    onAddIncident(newCase);
    alert('Caso submetido com sucesso para as operações em tempo-real.');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Plataforma de Triagem SSM</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight font-corporate uppercase">
              Protocolo de <br /> <span className="text-blue-600">Triagem SSM</span>
            </h2>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button 
              onClick={() => { setMode('STRUCTURED_FLOW'); handleReset(); }}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${mode === 'STRUCTURED_FLOW' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Stethoscope className="w-4 h-4" /> Questionário
            </button>
            <button 
              onClick={() => { setMode('AI_ANALYSIS'); handleReset(); }}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${mode === 'AI_ANALYSIS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Sparkles className="w-4 h-4" /> Análise IA
            </button>
          </div>
        </div>

        {mode === 'AI_ANALYSIS' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-slate-600 mb-8 leading-relaxed font-medium">
                Introduza a descrição da ocorrência para obter uma classificação de risco automática baseada em protocolos internacionais.
              </p>

              <div className="space-y-4">
                <textarea
                  className="w-full h-48 p-6 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none text-slate-700 shadow-inner bg-slate-50/50 font-medium"
                  placeholder="Ex: 'Colaborador com dor torácica súbita, irradiação para braço esquerdo, palidez e sudorese...'"
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !scenario}
                  className="w-full bg-slate-950 hover:bg-slate-900 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-slate-900/10 font-corporate uppercase tracking-widest text-xs"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processando IA Médica...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 text-blue-400" />
                      Gerar Parecer de Triagem
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="h-full">
              {suggestion ? (
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-sm animate-in zoom-in-95 duration-300">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-corporate">Resultado Governança SSM</span>
                    </div>
                    <button className="text-slate-300 hover:text-slate-900 transition-all">
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-6 mb-8">
                    <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-lg ${PRIORITY_COLORS[suggestion.classification]}`}>
                      <span className="text-[9px] font-bold uppercase opacity-80">Risco</span>
                      <span className="text-4xl font-black font-corporate">{suggestion.classification}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 mb-1 leading-tight">{suggestion.actionRequired}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nível de Resposta Técnica</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Fundamentação Clínica</h4>
                      <p className="text-sm text-slate-700 leading-relaxed bg-white p-5 rounded-2xl border border-slate-100 font-medium italic">
                        "{suggestion.reasoning}"
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Ações Recomendadas</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {suggestion.suggestedResources.map((res, i) => (
                          <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-700 bg-white px-4 py-3 rounded-xl border border-slate-100">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            {res}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 rotate-3">
                    <Sparkles className="w-8 h-8 text-blue-200" />
                  </div>
                  <h3 className="text-slate-500 font-black mb-2 uppercase tracking-widest text-xs">Modo Assistente IA</h3>
                  <p className="text-slate-400 text-sm max-w-[200px] mx-auto font-medium leading-relaxed">
                    Introduza a descrição do incidente para que o Gemini analise o cenário.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* STRUCTURED FLOW - THE QUESTIONNAIRE */
          <div className="max-w-5xl mx-auto w-full">
            {currentStep < 5 ? (
              <div className="bg-slate-50 rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-inner flex flex-col md:flex-row min-h-[500px]">
                {/* Stepper Sidebar */}
                <div className="w-full md:w-72 bg-white border-r border-slate-100 p-8 shrink-0">
                  <div className="space-y-6">
                    {steps.map((step, idx) => (
                      <div key={idx} className={`flex items-center gap-4 transition-all ${currentStep === idx ? 'opacity-100 scale-105' : 'opacity-40 grayscale'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${currentStep === idx ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {idx}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Passo</p>
                          <p className={`text-[10px] font-black uppercase tracking-tighter truncate ${currentStep === idx ? 'text-blue-600' : 'text-slate-700'}`}>
                            {step.title.split(' (')[0]}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Question Area */}
                <div className="flex-1 p-10 flex flex-col animate-in slide-in-from-right-4">
                  <div className="mb-10">
                    <h3 className="text-2xl font-black text-slate-900 font-corporate uppercase tracking-tight">{steps[currentStep].title}</h3>
                    <p className="text-sm font-medium text-slate-500 mt-2">{steps[currentStep].description}</p>
                  </div>

                  <div className="flex-1 space-y-6">
                    {currentStep === 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Building2 className="w-3 h-3 text-blue-600" /> Empresa Solicitante (Auto-preenchido)
                          </label>
                          <input 
                            type="text" 
                            className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl px-6 py-4 text-sm font-black text-blue-900 focus:border-blue-600 outline-none shadow-inner"
                            placeholder="Nome da Empresa"
                            value={triageData.company}
                            readOnly
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Doente</label>
                          <input 
                            type="text" 
                            className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-black focus:border-blue-600 outline-none"
                            placeholder="Nome Completo"
                            value={triageData.patientName}
                            onChange={e => setTriageData({...triageData, patientName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Idade</label>
                          <input 
                            type="text" 
                            className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-black focus:border-blue-600 outline-none"
                            placeholder="Ex: 34"
                            value={triageData.age}
                            onChange={e => setTriageData({...triageData, age: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Local Exacto do Evento</label>
                          <input 
                            type="text" 
                            className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-black focus:border-blue-600 outline-none"
                            placeholder="Andar, Sala, Referência..."
                            value={triageData.location}
                            onChange={e => setTriageData({...triageData, location: e.target.value})}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {steps[currentStep].questions.map(q => (
                          <div key={q.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-200 transition-all">
                            <span className="text-sm font-bold text-slate-700">{q.text}</span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setResults({...results, [q.id]: true})}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${results[q.id] === true ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                              >
                                Sim
                              </button>
                              <button 
                                onClick={() => setResults({...results, [q.id]: false})}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${results[q.id] === false ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                              >
                                Não
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-12 flex justify-between items-center pt-8 border-t border-slate-200">
                    <button 
                      onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
                      disabled={currentStep === 0}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" /> Anterior
                    </button>
                    <button 
                      onClick={handleNextFlow}
                      className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-3"
                    >
                      {currentStep === 0 ? 'Iniciar Fluxograma' : 'Continuar Triagem'} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* RESULT VIEW FOR STRUCTURED FLOW */
              <div className="max-w-3xl mx-auto bg-slate-50 border border-slate-200 rounded-[3rem] p-12 shadow-xl animate-in zoom-in-95">
                <div className="text-center mb-10">
                   <div className={`w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center shadow-2xl mb-6 ${PRIORITY_COLORS[suggestion!.classification]}`}>
                      <span className="text-5xl font-black font-corporate">{suggestion!.classification}</span>
                   </div>
                   <h3 className="text-3xl font-black text-slate-900 font-corporate uppercase tracking-tight">{suggestion!.actionRequired}</h3>
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Classificação Final de Triagem</p>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-slate-100 space-y-8 mb-10">
                   <div className="grid grid-cols-2 gap-8 pb-8 border-b border-slate-100">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Empresa</p>
                        <p className="text-sm font-black text-blue-600">{triageData.company}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paciente</p>
                        <p className="text-sm font-black text-slate-900">{triageData.patientName || 'Não Informado'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Localização</p>
                        <p className="text-sm font-black text-slate-900">{triageData.location || 'Não Informada'}</p>
                      </div>
                   </div>

                   <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Info className="w-4 h-4" /> Orientações Imediatas</h4>
                      <div className="grid grid-cols-1 gap-3">
                         {suggestion?.suggestedResources.map((res, i) => (
                           <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{res}</span>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                      <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest leading-relaxed">
                        "Nunca baixar prioridade após subida". Manter observação contínua até chegada do meio.
                      </p>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                   <button onClick={handleReset} className="flex-1 py-5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Nova Triagem</button>
                   <button 
                    onClick={handleSubmitToOperations}
                    className="flex-1 py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all"
                   >
                      <Send className="w-4 h-4" /> Submeter para Operações
                   </button>
                   <button className="flex-1 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                      <Printer className="w-4 h-4" /> Imprimir Guia
                   </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtocolAssistant;
