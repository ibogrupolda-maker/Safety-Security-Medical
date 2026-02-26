
export enum EmergencyPriority {
  CRITICAL = 'A',
  HIGH = 'B',
  MODERATE = 'C',
  LOW = 'D'
}

export type UserRole = 
  | 'ADMIN_SSM' 
  | 'OPERADOR_COORD' 
  | 'GESTOR_RISCO' 
  | 'MOTORISTA_AMB' 
  | 'GESTOR_FROTA_AMB' 
  | 'ADMIN_CLIENTE' 
  | 'RESPONSAVEL_EMERG_CLIENTE' 
  | 'COLABORADOR_RH';

export interface AdminUser {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  initials: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  gender: 'M' | 'F' | 'Outro';
  idDocument: string;
  companyId?: string;
  isFirstAccess?: boolean;
  preferences?: {
    language: string;
    timezone: string;
    theme: 'claro' | 'escuro';
    notifications: {
      email: boolean;
      sms: boolean;
      whatsapp: boolean;
      push: boolean;
      frequency: 'imediata' | 'resumo_diario' | 'semanal';
    }
  }
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  color: string;
  type: 'Banco' | 'Escola' | 'Empresa' | 'Outro';
  plan: 'Basic' | 'Premium' | 'Enterprise';
  contractEnd: string;
  totalEmployees: number;
}

export interface Employee {
  id: string;
  companyId: string;
  name: string;
  bi: string;
  age: number;
  sex: 'M' | 'F';
  bloodType: string;
  insurer: string;
  policyNumber: string;
  policyValidity: string; 
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  allergies?: string[];
  medications?: string[];
  medicalHistory?: string;
}

export interface OperationReport {
  incidentId: string;
  hospitalName: string;
  paramedicName: string;
  consciousnessState: 'Consciente' | 'Inconsciente';
  vitalSigns: {
    bp: string; // Blood Pressure
    hr: string; // Heart Rate
    spo2: string; // Saturation
  };
  procedures: string[];
  observations: string;
  timestamps: {
    dispatched: string;
    arrivedAtPatient: string;
    leftForHospital: string;
    arrivedAtHospital: string;
  };
}

export interface AmbulanceState {
  id: string;
  plate: string;
  type: 'Básica' | 'Avançada' | 'Resgate';
  currentPos: [number, number];
  phase: 'idle' | 'pending_accept' | 'en_route_to_patient' | 'at_patient' | 'evacuating' | 'at_hospital';
  status: 'available' | 'maintenance' | 'break';
  companyId?: string; // Adicionado para isolamento de empresas de ambulância
  eta: number;
  distance: number;
  performance: {
    totalIncidents: number;
    acceptanceRate: number;
    avgResponseTime: number;
  };
}

export interface CommunicationLog {
  id: string;
  incidentId: string;
  timestamp: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipient: string; // e.g., 'Equipa de Resposta', 'Stakeholders', 'Hospital Central'
  message: string;
  type: 'RADIO' | 'PHONE' | 'WHATSAPP' | 'SYSTEM' | 'EXTERNAL';
  isCritical: boolean;
}

export interface EmergencyCase {
  id: string;
  priority: EmergencyPriority;
  locationName: string;
  status: 'active' | 'triage' | 'transit' | 'closed';
  timestamp: string;
  type: string;
  coords: [number, number];
  patientName?: string;
  employeeId?: string; 
  companyId?: string;  
  ambulanceId?: string;
  ambulanceState?: AmbulanceState;
  report?: OperationReport;
}

// Fixed: Exported ResourceStatus to resolve import error in components/ResourceGrid.tsx
export type ResourceStatus = 'available' | 'assigned' | 'offline' | 'maintenance';

export interface Resource {
  id: string;
  name: string;
  type: string;
  category: 'ambulance' | 'hospital' | 'team';
  status: ResourceStatus;
  location: string;
  companyId?: string; // Adicionado para isolamento
  capacity?: string;
  equipment?: string[];
  eta?: string;
}

export interface ProtocolSuggestion {
  classification: EmergencyPriority;
  actionRequired: string;
  reasoning: string;
  suggestedResources: string[];
}

export interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  details: string[];
}
