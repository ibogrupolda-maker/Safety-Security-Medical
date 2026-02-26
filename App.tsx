
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ShieldCheck, User } from 'lucide-react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardOverview from './components/DashboardOverview';
import ProtocolAssistant from './components/ProtocolAssistant';
import ResourceManagement from './components/ResourceManagement';
import FleetManagement from './components/FleetManagement';
import PatientManagement from './components/PatientManagement';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AmbulanceMode from './components/AmbulanceMode';
import CorporateClientMode from './components/CorporateClientMode';
import EmployeeRegistration from './components/EmployeeRegistration';
import UserProfileSettings from './components/UserProfileSettings';
import AccountManagement from './components/AccountManagement';
import Login from './components/Login';
import { EmergencyCase, EmergencyPriority, AdminUser, AmbulanceState, OperationReport, Employee, CommunicationLog, Company, Resource } from './types';
import { COMPANIES as INITIAL_COMPANIES, ADMINS, AMBULANCES as INITIAL_AMBULANCES, EMPLOYEES as INITIAL_EMPLOYEES, RESOURCES as INITIAL_RESOURCES } from './constants';
import { auditLogger } from './services/auditLogger';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [ambulances, setAmbulances] = useState<AmbulanceState[]>(INITIAL_AMBULANCES);
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>([]);
  const [incidents, setIncidents] = useState<EmergencyCase[]>([
    { id: 'SSM-MZ-001', timestamp: '12:00', type: 'Crise Hipertensiva', locationName: 'Torre Absa', status: 'active', priority: EmergencyPriority.HIGH, coords: [-25.9680, 32.5710], companyId: 'ABSA' },
  ]);

  const handleLogin = (user: AdminUser) => {
    setCurrentUser(user);
    const corporateRoles = ['ADMIN_CLIENTE', 'RESPONSAVEL_EMERG_CLIENTE', 'COLABORADOR_RH'];
    
    if (user.role === 'GESTOR_FROTA_AMB') setActiveTab('fleet');
    else if (corporateRoles.includes(user.role)) setActiveTab('corporate_sos');
    else if (user.role === 'ADMIN_CLIENTE') setActiveTab('patients');
    else setActiveTab('dashboard');
    
    auditLogger.log(user, 'LOGIN_SUCCESS');
  };

  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees(prev => [newEmployee, ...prev]);
    // Navegar automaticamente para a Base Médica para ver o resultado
    setTimeout(() => setActiveTab('patients'), 1500);
  };

  const handleUpdateUser = (updates: Partial<AdminUser>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  };

  const handleDispatch = (incidentId: string, ambId: string) => {
    const selectedAmb = ambulances.find(a => a.id === ambId)!;
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return { 
          ...inc, 
          ambulanceId: ambId,
          ambulanceState: { ...selectedAmb, phase: 'pending_accept', timestamps: { dispatched: new Date().toLocaleTimeString() } } 
        };
      }
      return inc;
    }));
    if (currentUser) auditLogger.log(currentUser, 'DISPATCH_AMBULANCE', incidentId, `Viatura: ${ambId}`);
  };

  const updateAmbulanceState = (id: string, updates: Partial<AmbulanceState> | null, finalReport?: OperationReport) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        if (!updates) return { ...inc, ambulanceState: undefined };
        return { 
          ...inc, 
          ambulanceState: { ...inc.ambulanceState!, ...updates },
          report: finalReport ? finalReport : inc.report
        };
      }
      return inc;
    }));
  };

  const updateIncidentStatus = (id: string, status: 'active' | 'triage' | 'transit' | 'closed') => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status } : inc));
  };

  const handleAddCommunicationLog = (log: Omit<CommunicationLog, 'id' | 'timestamp'>) => {
    const newLog: CommunicationLog = {
      ...log,
      id: `COMM-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setCommunicationLogs(prev => [newLog, ...prev]);
    
    if (log.isCritical && currentUser) {
      auditLogger.log(currentUser, 'COMMUNICATION_LOGGED', undefined, `Comunicação Crítica Registada: ${log.message}`);
    }
  };

  // Filtragem de dados para isolamento multi-empresa
  const filteredIncidents = useMemo(() => {
    if (!currentUser) return [];
    const isCorporate = ['COLABORADOR_RH', 'ADMIN_CLIENTE', 'RESPONSAVEL_EMERG_CLIENTE'].includes(currentUser.role);
    const isAmbulance = ['GESTOR_FROTA_AMB', 'MOTORISTA_AMB'].includes(currentUser.role);
    
    if (isCorporate && currentUser.companyId) {
      return incidents.filter(inc => inc.companyId === currentUser.companyId);
    }
    
    if (isAmbulance && currentUser.companyId) {
      // Empresas de ambulância só vêem incidentes atribuídos à sua frota
      return incidents.filter(inc => inc.ambulanceState?.companyId === currentUser.companyId);
    }
    
    return incidents;
  }, [incidents, currentUser]);

  const filteredAmbulances = useMemo(() => {
    if (!currentUser) return [];
    const isAmbulance = ['GESTOR_FROTA_AMB', 'MOTORISTA_AMB'].includes(currentUser.role);
    if (isAmbulance && currentUser.companyId) {
      return ambulances.filter(amb => amb.companyId === currentUser.companyId);
    }
    // Administradores e Operadores vêem todas
    return ambulances;
  }, [ambulances, currentUser]);

  const filteredCompanies = useMemo(() => {
    if (!currentUser) return [];
    const isCorporate = ['COLABORADOR_RH', 'ADMIN_CLIENTE', 'RESPONSAVEL_EMERG_CLIENTE'].includes(currentUser.role);
    const isAmbulance = ['GESTOR_FROTA_AMB', 'MOTORISTA_AMB'].includes(currentUser.role);
    
    if (isCorporate && currentUser.companyId) {
      // Clientes só vêem a si mesmos
      return companies.filter(c => c.id === currentUser.companyId);
    }
    
    if (isAmbulance && currentUser.companyId) {
      // Empresas de ambulância só vêem a si mesmas (não sabem que outras existem)
      return companies.filter(c => c.id === currentUser.companyId);
    }
    
    return companies;
  }, [companies, currentUser]);

  const filteredResources = useMemo(() => {
    if (!currentUser) return [];
    const isAmbulance = ['GESTOR_FROTA_AMB', 'MOTORISTA_AMB'].includes(currentUser.role);
    if (isAmbulance && currentUser.companyId) {
      // Empresas de ambulância só vêem os seus recursos ou recursos públicos (hospitais)
      return resources.filter(res => !res.companyId || res.companyId === currentUser.companyId);
    }
    return resources;
  }, [resources, currentUser]);

  const filteredEmployees = useMemo(() => {
    if (!currentUser) return [];
    const isCorporate = ['COLABORADOR_RH', 'ADMIN_CLIENTE', 'RESPONSAVEL_EMERG_CLIENTE'].includes(currentUser.role);
    if (isCorporate && currentUser.companyId) {
      return employees.filter(emp => emp.companyId === currentUser.companyId);
    }
    return employees;
  }, [employees, currentUser]);

  if (!currentUser) return <Login onLoginSuccess={handleLogin} />;

  // MODO MOTORISTA
  if (currentUser.role === 'MOTORISTA_AMB') {
    const myIncident = incidents.find(i => i.ambulanceState?.id === 'ALPHA-1' && i.status !== 'closed');
    return <AmbulanceMode adminName={currentUser.name} onLogout={() => setCurrentUser(null)} incident={myIncident || null} onUpdateAmbulance={updateAmbulanceState} onUpdateStatus={updateIncidentStatus} />;
  }

  // MODO CORPORATIVO
  const isCorporate = ['COLABORADOR_RH', 'ADMIN_CLIENTE', 'RESPONSAVEL_EMERG_CLIENTE'].includes(currentUser.role);
  
  if (isCorporate) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FB] text-slate-900 font-sans">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={currentUser.role} onLogout={() => setCurrentUser(null)} />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <TopBar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
          <div className="flex-1 overflow-hidden h-full">
            {activeTab === 'corporate_sos' && (
              <CorporateClientMode 
                adminName={currentUser.name} 
                onLogout={() => setCurrentUser(null)} 
                onTriggerEmergency={() => {
                  const newInc: EmergencyCase = {
                    id: `SOS-${Math.floor(Math.random() * 9000) + 1000}`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    type: 'Pânico Corporativo Ativado',
                    locationName: 'Sede da Empresa (GPS)',
                    status: 'active',
                    priority: EmergencyPriority.CRITICAL,
                    coords: [-25.9680, 32.5710],
                    companyId: currentUser.companyId
                  };
                  setIncidents(prev => [newInc, ...prev]);
                }} 
                companyId={currentUser.companyId} 
              />
            )}
            {activeTab === 'employee_registration' && (
              <div className="p-8 custom-scrollbar overflow-y-auto h-full">
                <EmployeeRegistration companyId={currentUser.companyId} onAddEmployee={handleAddEmployee} />
              </div>
            )}
            {activeTab === 'patients' && (
              <div className="p-8 custom-scrollbar overflow-y-auto h-full">
                <PatientManagement employees={filteredEmployees} currentUser={currentUser} />
              </div>
            )}
            {activeTab === 'profile' && (
              <div className="p-8 custom-scrollbar overflow-y-auto h-full">
                <UserProfileSettings 
                  user={currentUser} 
                  initialTab="perfil" 
                  onClose={() => setActiveTab('corporate_sos')} 
                  onUpdateUser={handleUpdateUser}
                />
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="p-8 custom-scrollbar overflow-y-auto h-full">
                <UserProfileSettings 
                  user={currentUser} 
                  initialTab="definicoes" 
                  onClose={() => setActiveTab('corporate_sos')} 
                  onUpdateUser={handleUpdateUser}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] text-slate-900 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={currentUser.role} onLogout={() => setCurrentUser(null)} />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'dashboard' && (
            <DashboardOverview 
              incidents={filteredIncidents} 
              currentUser={currentUser} 
              onDispatch={handleDispatch} 
              communicationLogs={communicationLogs}
              onAddCommunicationLog={handleAddCommunicationLog}
              ambulances={filteredAmbulances}
              companies={filteredCompanies}
            />
          )}
          {activeTab === 'fleet' && (
            <FleetManagement 
              ambulances={filteredAmbulances} 
              onAddAmbulance={(newAmb) => setAmbulances(prev => [newAmb, ...prev])} 
            />
          )}
          {activeTab === 'patients' && <PatientManagement employees={filteredEmployees} currentUser={currentUser} />}
          {activeTab === 'map' && (
            <ResourceManagement 
              incidents={filteredIncidents} 
              resources={filteredResources} 
              companies={filteredCompanies}
              employees={filteredEmployees}
            />
          )}
          {activeTab === 'protocols' && <ProtocolAssistant currentUser={currentUser} onAddIncident={(inc) => setIncidents([inc, ...incidents])} />}
          {activeTab === 'providers' && <AnalyticsDashboard currentUser={currentUser} companies={filteredCompanies} />}
          
          {activeTab === 'profile' && (
            <UserProfileSettings 
              user={currentUser} 
              initialTab="perfil" 
              onClose={() => setActiveTab('dashboard')} 
              onUpdateUser={handleUpdateUser}
            />
          )}
          {activeTab === 'settings' && (
            <UserProfileSettings 
              user={currentUser} 
              initialTab="definicoes" 
              onClose={() => setActiveTab('dashboard')} 
              onUpdateUser={handleUpdateUser}
            />
          )}
          {activeTab === 'accounts' && currentUser.role === 'ADMIN_SSM' && (
            <AccountManagement onClose={() => setActiveTab('dashboard')} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
