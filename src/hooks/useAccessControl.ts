import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

interface AccessControl {
  canAccessFeature: (feature: string) => boolean;
  canCreateRecords: () => boolean;
  canEditRecords: () => boolean;
  canDeleteRecords: () => boolean;
  canExportData: () => boolean;
  canAccessAdvancedFeatures: () => boolean;
  maxRecords: number;
  currentRecords: number;
  isTrialExpired: boolean;
  daysLeftInTrial: number;
}

export const useAccessControl = (): AccessControl => {
  const { license, role } = useAuth();
  const [currentRecords, setCurrentRecords] = useState(0);

  // Verificar se é super admin (acesso total)
  const isSuperAdmin = role === 'superadmin';

  // Verificar se a licença está ativa
  const isLicenseActive = license?.status === 'active';

  // Verificar se é trial
  const isTrial = license?.trialStart && license?.trialDays;

  // Calcular dias restantes do trial
  const daysLeftInTrial = isTrial 
    ? Math.max(0, license.trialDays - Math.floor((Date.now() - license.trialStart.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Verificar se trial expirou
  const isTrialExpired = isTrial && daysLeftInTrial <= 0;

  // Limitações baseadas no plano
  const getPlanLimitations = () => {
    if (isSuperAdmin) {
      return {
        maxRecords: -1, // Ilimitado
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canExport: true,
        canAdvanced: true
      };
    }

    if (!isLicenseActive || isTrialExpired) {
      return {
        maxRecords: 5, // Muito limitado para usuários sem licença
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canExport: false,
        canAdvanced: false
      };
    }

    // Limitações para usuários com licença ativa
    return {
      maxRecords: 50, // Limite padrão
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canExport: true,
      canAdvanced: false
    };
  };

  const limitations = getPlanLimitations();

  // Carregar número atual de registros
  useEffect(() => {
    const loadCurrentRecords = () => {
      try {
        // Contar registros em diferentes módulos
        const cashFlowEntries = JSON.parse(localStorage.getItem('cash_flow_entries') || '[]');
        const notas = JSON.parse(localStorage.getItem('ploutos_notas') || '[]');
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        
        const totalRecords = cashFlowEntries.length + notas.length + customers.length;
        setCurrentRecords(totalRecords);
      } catch (error) {
        console.error('Erro ao carregar registros:', error);
        setCurrentRecords(0);
      }
    };

    loadCurrentRecords();
  }, []);

  const canAccessFeature = (feature: string): boolean => {
    if (isSuperAdmin) return true;
    if (!isLicenseActive || isTrialExpired) return false;

    // Verificar limitações específicas por feature
    switch (feature) {
      case 'cashflow':
      case 'notas':
      case 'customers':
        return limitations.canCreate;
      case 'reports':
      case 'analytics':
        return limitations.canAdvanced;
      case 'export':
        return limitations.canExport;
      default:
        return true;
    }
  };

  const canCreateRecords = (): boolean => {
    if (isSuperAdmin) return true;
    if (!isLicenseActive || isTrialExpired) return false;
    if (limitations.maxRecords !== -1 && currentRecords >= limitations.maxRecords) return false;
    return limitations.canCreate;
  };

  const canEditRecords = (): boolean => {
    if (isSuperAdmin) return true;
    if (!isLicenseActive || isTrialExpired) return false;
    return limitations.canEdit;
  };

  const canDeleteRecords = (): boolean => {
    if (isSuperAdmin) return true;
    if (!isLicenseActive || isTrialExpired) return false;
    return limitations.canDelete;
  };

  const canExportData = (): boolean => {
    if (isSuperAdmin) return true;
    if (!isLicenseActive || isTrialExpired) return false;
    return limitations.canExport;
  };

  const canAccessAdvancedFeatures = (): boolean => {
    if (isSuperAdmin) return true;
    if (!isLicenseActive || isTrialExpired) return false;
    return limitations.canAdvanced;
  };

  return {
    canAccessFeature,
    canCreateRecords,
    canEditRecords,
    canDeleteRecords,
    canExportData,
    canAccessAdvancedFeatures,
    maxRecords: limitations.maxRecords,
    currentRecords,
    isTrialExpired,
    daysLeftInTrial
  };
};

export default useAccessControl;
