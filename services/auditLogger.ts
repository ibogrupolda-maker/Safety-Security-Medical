
export type AuditActionType = 
  | 'LOGIN_SUCCESS' 
  | 'LOGOUT_MANUAL' 
  | 'LOGOUT_SESSION_EXPIRED'
  | 'DISPATCH_AMBULANCE' 
  | 'AMBULANCE_PHASE_CHANGE' 
  | 'MISSION_FINALIZED' 
  | 'MISSION_ACCEPTED_FIELD' 
  | 'MISSION_FINALIZED_WITH_REPORT'
  | 'PROTOCOL_TRIAGE_GENERATED'
  | 'CORPORATE_SOS_TRIGGERED'
  | 'COMMUNICATION_LOGGED'
  | 'DATA_EXPORT_PDF'
  | 'DATA_EXPORT_EXCEL';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  companyId?: string; // Adicionado para isolamento multi-empresa
  action: AuditActionType;
  resourceId?: string; // ID da Ambulância ou Incidente
  details: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  ip: string;
  integrityHash: string;
}

class AuditLogger {
  private static instance: AuditLogger;
  private logs: AuditLog[] = [];
  private readonly STORAGE_KEY = 'ssm_audit_trail_v2';

  private constructor() {
    this.loadLogs();
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  private loadLogs() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.logs = JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao carregar logs de auditoria:", e);
        this.logs = [];
      }
    }
  }

  private generateIntegrityHash(data: any): string {
    const str = JSON.stringify(data);
    // Simulação de hash imutável para auditoria
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'SSM-' + Math.abs(hash).toString(16).toUpperCase();
  }

  public log(
    user: { id: string, name: string, role: string, companyId?: string }, 
    action: AuditActionType, 
    resourceId?: string,
    extraDetails?: string
  ) {
    const timestamp = new Date().toISOString();
    
    const entry: Omit<AuditLog, 'integrityHash'> = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      companyId: user.companyId,
      action,
      resourceId,
      details: extraDetails || this.getDefaultDetails(action, resourceId),
      severity: this.getSeverity(action),
      ip: '10.250.' + Math.floor(Math.random() * 254) + '.' + Math.floor(Math.random() * 254)
    };

    const logWithIntegrity: AuditLog = {
      ...entry,
      integrityHash: this.generateIntegrityHash(entry)
    };

    this.logs.unshift(logWithIntegrity);
    
    // Manter histórico robusto (últimos 500 eventos)
    if (this.logs.length > 500) {
      this.logs = this.logs.slice(0, 500);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    
    // Log técnico em consola para monitorização em desenvolvimento
    console.info(`[SSM-AUDIT] ${logWithIntegrity.action} | User: ${logWithIntegrity.userName} | Hash: ${logWithIntegrity.integrityHash}`);
  }

  // Updated to include new mission types
  private getDefaultDetails(action: AuditActionType, resourceId?: string): string {
    switch (action) {
      case 'DISPATCH_AMBULANCE': return `Despacho de unidade móvel para o incidente ${resourceId}`;
      case 'AMBULANCE_PHASE_CHANGE': return `Alteração de estado da unidade para o incidente ${resourceId}`;
      case 'MISSION_FINALIZED': return `Missão concluída com sucesso. Relatório arquivado para ${resourceId}`;
      case 'MISSION_ACCEPTED_FIELD': return `Missão aceite via terminal de campo para o incidente ${resourceId}`;
      case 'MISSION_FINALIZED_WITH_REPORT': return `Missão finalizada com submissão de relatório clínico para o incidente ${resourceId}`;
      case 'CORPORATE_SOS_TRIGGERED': return `Botão de pânico acionado por entidade cliente. Incidente ${resourceId}`;
      default: return `Ação do utilizador registada no sistema.`;
    }
  }

  private getSeverity(action: AuditActionType): 'INFO' | 'WARNING' | 'CRITICAL' {
    if (['CORPORATE_SOS_TRIGGERED', 'DISPATCH_AMBULANCE'].includes(action)) return 'CRITICAL';
    if (['MISSION_FINALIZED', 'MISSION_FINALIZED_WITH_REPORT', 'AMBULANCE_PHASE_CHANGE'].includes(action)) return 'WARNING';
    return 'INFO';
  }

  public getLogs(): AuditLog[] {
    return [...this.logs];
  }

  public getLogsByUser(userId: string): AuditLog[] {
    return this.logs.filter(log => log.userId === userId);
  }

  public getLogsByCompany(companyId: string): AuditLog[] {
    return this.logs.filter(log => log.companyId === companyId);
  }
}

export const auditLogger = AuditLogger.getInstance();
