'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { 
  reportsApi, 
  ShiftReportData, 
  IncidentReportData, 
  KmsReportData, 
  TaxReportData, 
  InvoiceReportData,
  ReportWithDatesAssigneeAndContactDto,
  ReportIncidentCreateDto,
  ReportTaxCreateDto,
  ReportInvoiceCreateDto,
} from '@/lib/api/reports-service';

export function useReportShift() {
  const [loading, setIsLoading] = useState(false);
  const [obj, setObj] = useState<ShiftReportData | undefined>();

  const generate = async (payload: ReportWithDatesAssigneeAndContactDto) => {
    setIsLoading(true);
    try {
      const data = await reportsApi.getShiftsReport(payload);
      setObj(data);
    } catch (error) {
      console.error('Failed to generate shifts report:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { loading, obj, generate };
}

export function useReportIncident() {
  const [loading, setIsLoading] = useState(false);
  const [obj, setObj] = useState<IncidentReportData | undefined>();

  const generate = async (payload: ReportIncidentCreateDto) => {
    setIsLoading(true);
    try {
      const data = await reportsApi.getIncidentReport(payload);
      setObj(data);
    } catch (error) {
      console.error('Failed to generate incident report:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { loading, obj, generate };
}

export function useReportKm() {
  const [loading, setIsLoading] = useState(false);
  const [obj, setObj] = useState<KmsReportData | undefined>();

  const generate = async (payload: ReportWithDatesAssigneeAndContactDto) => {
    setIsLoading(true);
    try {
      const data = await reportsApi.getKmsReport(payload);
      setObj(data);
    } catch (error) {
      console.error('Failed to generate kms report:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { loading, obj, generate };
}

export function useReportTax() {
  const [loading, setIsLoading] = useState(false);
  const [obj, setObj] = useState<TaxReportData | undefined>();

  const generate = async (payload: ReportTaxCreateDto) => {
    setIsLoading(true);
    try {
      const data = await reportsApi.getTaxReport(payload);
      setObj(data);
    } catch (error) {
      console.error('Failed to generate tax report:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { loading, obj, generate };
}

export function useReportInvoice() {
  const [loading, setIsLoading] = useState(false);
  const [obj, setObj] = useState<InvoiceReportData | undefined>();

  const generate = async (payload: ReportInvoiceCreateDto) => {
    setIsLoading(true);
    try {
      const data = await reportsApi.getInvoiceReport(payload);
      setObj(data);
    } catch (error) {
      console.error('Failed to generate invoice report:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { loading, obj, generate };
}
