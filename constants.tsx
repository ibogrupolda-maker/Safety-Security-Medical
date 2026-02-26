
import { Company, Employee, EmergencyPriority, Resource, AdminUser, AmbulanceState, WorkflowStep } from './types';

export const PRIORITY_COLORS: Record<EmergencyPriority, string> = {
  [EmergencyPriority.LOW]: 'bg-emerald-500 text-white',
  [EmergencyPriority.MODERATE]: 'bg-yellow-400 text-slate-900',
  [EmergencyPriority.HIGH]: 'bg-orange-500 text-white',
  [EmergencyPriority.CRITICAL]: 'bg-red-600 text-white',
};

export const ADMINS: (AdminUser & { password?: string })[] = [
  { 
    id: 'ADM-001', 
    name: 'Marina Sengo', 
    username: 'marina.sengo',
    email: 'marina.sengo@ssm.co.mz',
    password: '123',
    phone: '+258 84 000 0001',
    address: 'Av. Julius Nyerere, Maputo',
    dob: '1985-05-15',
    gender: 'F',
    idDocument: '110203456789M',
    role: 'ADMIN_SSM', 
    avatar: 'https://ui-avatars.com/api/?name=Marina+Sengo&background=1E40AF&color=fff', 
    initials: 'MS',
    isFirstAccess: false
  },
  { 
    id: 'OP-002', 
    name: 'Ricardo Tembe', 
    username: 'ricardo.tembe',
    password: '123',
    email: 'ricardo.tembe@ssm.co.mz',
    phone: '+258 82 000 0002',
    address: 'Bairro Central, Maputo',
    dob: '1990-11-20',
    gender: 'M',
    idDocument: '020304567890B',
    role: 'OPERADOR_COORD', 
    avatar: 'https://ui-avatars.com/api/?name=Ricardo+Tembe&background=0F172A&color=fff', 
    initials: 'RT'
  },
  { id: 'RISK-003', name: 'Elsa Mondlane', username: 'elsa.risk', password: '123', role: 'GESTOR_RISCO', email: 'elsa@ssm.co.mz', avatar: 'https://ui-avatars.com/api/?name=Elsa+Mondlane&background=4F46E5&color=fff', initials: 'EM', phone: '', address: '', dob: '', gender: 'F', idDocument: '' },
  { id: 'DRV-004', name: 'João Condestável', username: 'joao.amb', password: '123', role: 'MOTORISTA_AMB', companyId: 'AMB_RED_CROSS', email: 'joao@ssm.co.mz', avatar: 'https://ui-avatars.com/api/?name=Joao+Amb&background=EF4444&color=fff', initials: 'JC', phone: '', address: '', dob: '', gender: 'M', idDocument: '' },
  { id: 'FLEET-005', name: 'Paulo Matsinhe', username: 'paulo.fleet', password: '123', role: 'GESTOR_FROTA_AMB', companyId: 'AMB_RED_CROSS', email: 'paulo@ssm.co.mz', avatar: 'https://ui-avatars.com/api/?name=Paulo+Fleet&background=334155&color=fff', initials: 'PM', phone: '', address: '', dob: '', gender: 'M', idDocument: '' },
  { id: 'CLI-006', name: 'Gestor Absa', username: 'gestor.absa', password: '123', role: 'ADMIN_CLIENTE', companyId: 'ABSA', email: 'emergencia@absa.co.mz', avatar: 'https://ui-avatars.com/api/?name=Absa+Bank&background=bf0000&color=fff', initials: 'GA', phone: '', address: '', dob: '', gender: 'Outro', idDocument: '' },
  { id: 'SAFE-007', name: 'Resp. Segurança', username: 'seg.absa', password: '123', role: 'RESPONSAVEL_EMERG_CLIENTE', companyId: 'ABSA', email: 'seguranca@absa.co.mz', avatar: 'https://ui-avatars.com/api/?name=Seguranca+Absa&background=000&color=fff', initials: 'SA', phone: '', address: '', dob: '', gender: 'M', idDocument: '' },
  { id: 'EMP-008', name: 'Colaborador RH', username: 'rh.absa', password: '123', role: 'COLABORADOR_RH', companyId: 'ABSA', email: 'rh@absa.co.mz', avatar: 'https://ui-avatars.com/api/?name=RH+Absa&background=64748b&color=fff', initials: 'RH', phone: '', address: '', dob: '', gender: 'F', idDocument: '' },
];

// Fixed: Added missing status and performance properties to AMBULANCES
export const AMBULANCES: AmbulanceState[] = [
  { 
    id: 'ALPHA-1', 
    plate: 'MMM-01-22', 
    type: 'Avançada', 
    currentPos: [-25.965, 32.575], 
    phase: 'idle', 
    status: 'available',
    companyId: 'AMB_RED_CROSS',
    eta: 0, 
    distance: 0,
    performance: { totalIncidents: 145, acceptanceRate: 0.98, avgResponseTime: 8.5 }
  },
  { 
    id: 'BETA-2', 
    plate: 'MMC-44-90', 
    type: 'Básica', 
    currentPos: [-25.970, 32.565], 
    phase: 'idle', 
    status: 'available',
    companyId: 'AMB_RED_CROSS',
    eta: 0, 
    distance: 0,
    performance: { totalIncidents: 92, acceptanceRate: 0.94, avgResponseTime: 12.2 }
  },
  { 
    id: 'GAMMA-3', 
    plate: 'MMX-12-33', 
    type: 'Resgate', 
    currentPos: [-25.958, 32.585], 
    phase: 'idle', 
    status: 'available',
    companyId: 'AMB_SOS',
    eta: 0, 
    distance: 0,
    performance: { totalIncidents: 38, acceptanceRate: 0.99, avgResponseTime: 15.0 }
  },
];

// Fixed: Added missing type, plan, contractEnd, and totalEmployees properties to COMPANIES
export const COMPANIES: Company[] = [
  { 
    id: 'ABSA', 
    name: 'Absa Bank Moçambique', 
    logo: 'https://ui-avatars.com/api/?name=Absa+Bank&background=bf0000&color=fff', 
    color: '#bf0000',
    type: 'Banco',
    plan: 'Enterprise',
    contractEnd: '2026-12-31',
    totalEmployees: 1200
  },
  { 
    id: 'LETSHEGO', 
    name: 'Banco Letshego', 
    logo: 'https://ui-avatars.com/api/?name=Letshego&background=ffcc00&color=000', 
    color: '#ffcc00',
    type: 'Banco',
    plan: 'Premium',
    contractEnd: '2025-08-15',
    totalEmployees: 450
  },
  { 
    id: 'NEDBANK', 
    name: 'Nedbank Moçambique', 
    logo: 'https://ui-avatars.com/api/?name=Nedbank&background=006633&color=fff', 
    color: '#006633',
    type: 'Banco',
    plan: 'Enterprise',
    contractEnd: '2027-01-20',
    totalEmployees: 800
  },
  { 
    id: 'AISM', 
    name: 'AISM Maputo', 
    logo: 'https://ui-avatars.com/api/?name=AISM&background=003366&color=fff', 
    color: '#003366',
    type: 'Escola',
    plan: 'Premium',
    contractEnd: '2026-06-30',
    totalEmployees: 280
  },
  { 
    id: 'ISCTEM', 
    name: 'ISCTEM', 
    logo: 'https://ui-avatars.com/api/?name=ISCTEM&background=e21d24&color=fff', 
    color: '#e21d24',
    type: 'Escola',
    plan: 'Basic',
    contractEnd: '2025-11-12',
    totalEmployees: 150
  },
  {
    id: 'AMB_RED_CROSS',
    name: 'Cruz Vermelha de Moçambique',
    logo: 'https://ui-avatars.com/api/?name=Cruz+Vermelha&background=ff0000&color=fff',
    color: '#ff0000',
    type: 'Empresa',
    plan: 'Enterprise',
    contractEnd: '2030-12-31',
    totalEmployees: 50
  },
  {
    id: 'AMB_SOS',
    name: 'SOS Emergências',
    logo: 'https://ui-avatars.com/api/?name=SOS&background=000&color=fff',
    color: '#000000',
    type: 'Empresa',
    plan: 'Premium',
    contractEnd: '2026-01-01',
    totalEmployees: 30
  }
];

export const EMPLOYEES: Employee[] = [
  {
    id: 'EMP-001',
    companyId: 'ABSA',
    name: 'António Mucavele',
    bi: '110203456789M',
    age: 34,
    sex: 'M',
    bloodType: 'A+',
    insurer: 'Hollard Moçambique',
    policyNumber: 'H-ABSA-9821',
    policyValidity: '31/12/2025',
    emergencyContact: { name: 'Maria Mucavele', relation: 'Esposa', phone: '+258 84 123 4567' },
    allergies: ['Penicilina']
  }
];

export const RESOURCES: Resource[] = [
  { id: 'RES-001', name: 'Ambulância ALPHA-1', type: 'SAV', category: 'ambulance', status: 'available', location: 'Maputo Central', companyId: 'AMB_RED_CROSS', capacity: '2 pacientes', equipment: ['Equipamento ALS'] },
  { id: 'RES-002', name: 'Hospital Polana Caniço', type: 'Público', category: 'hospital', status: 'available', location: 'Polana', capacity: '12 camas ER' },
];

// Added WORKFLOW_STEPS for WorkflowSection component
export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 1,
    title: 'Receção do Alerta',
    description: 'Entrada da ocorrência via botão de pânico corporativo ou chamada direta para a Central de Operações.',
    icon: 'Bell',
    details: ['Validação de Localização', 'Identificação do Solicitante', 'Abertura de Protocolo']
  },
  {
    id: 2,
    title: 'Triagem e Protocolo',
    description: 'Execução do fluxograma de triagem médica para classificação de prioridade e risco clínico.',
    icon: 'ClipboardList',
    details: ['Classificação de Risco (A-D)', 'Seleção de Protocolo Clínico', 'Determinação de Recursos']
  },
  {
    id: 3,
    title: 'Despacho de Unidade',
    description: 'Acionamento da unidade móvel (SAV/SBV) mais próxima através do algoritmo de proximidade.',
    icon: 'Truck',
    details: ['Monitorização de Trânsito', 'Envio de Coordenadas GPS', 'Acompanhamento do ETA']
  },
  {
    id: 4,
    title: 'Intervenção e Transporte',
    description: 'Estabilização do paciente no local e transporte assistido para a unidade hospitalar de referência.',
    icon: 'Activity',
    details: ['Cuidados Pré-hospitalares', 'Comunicação com Hospital', 'Gestão de Sinais Vitais']
  },
  {
    id: 5,
    title: 'Encerramento e Auditoria',
    description: 'Finalização da missão com relatório clínico detalhado e registo em log de auditoria imutável.',
    icon: 'CheckCircle2',
    details: ['Relatório de Ocorrência', 'Feedback do Cliente', 'Arquivo de Auditoria']
  }
];
