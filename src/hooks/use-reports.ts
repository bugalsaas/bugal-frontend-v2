'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { 
  reportsApi, 
  ShiftReportData, 
  ShiftReportItem,
  IncidentReportData, 
  IncidentReportItem,
  KmsReportData, 
  TaxReportData,
  TaxReportReceiptItem,
  TaxReportExpenseItem,
  InvoiceReportData,
  InvoiceReportItem,
  ReportWithDatesAssigneeAndContactDto,
  ReportIncidentCreateDto,
  ReportTaxCreateDto,
  ReportInvoiceCreateDto,
} from '@/lib/api/reports-service';

/**
 * Map shift report data - dates remain as ISO strings from backend
 * Components will parse to Date objects when displaying
 */
function mapShiftReportData(data: any): ShiftReportData {
  return {
    summary: data.summary,
    data: (data.data || []).map((item: any): ShiftReportItem => ({
      ...item,
      // Dates come as ISO strings or Date objects from backend
      // Convert Date objects to ISO strings for consistency
      date: item.date ? (item.date instanceof Date ? item.date.toISOString() : item.date) : undefined,
      startDate: item.startDate ? (item.startDate instanceof Date ? item.startDate.toISOString() : item.startDate) : undefined,
      endDate: item.endDate ? (item.endDate instanceof Date ? item.endDate.toISOString() : item.endDate) : undefined,
    })),
  };
}

/**
 * Map KMs report data - dates remain as ISO strings from backend
 */
function mapKmsReportData(data: any): KmsReportData {
  return {
    summary: data.summary,
    data: (data.data || []).map((item: any) => ({
      ...item,
      date: item.date ? (item.date instanceof Date ? item.date.toISOString() : item.date) : item.date,
    })),
  };
}

/**
 * Map tax report data - dates remain as ISO strings from backend
 */
function mapTaxReportData(data: any): TaxReportData {
  return {
    summary: data.summary,
    receipts: (data.receipts || []).map((item: any): TaxReportReceiptItem => ({
      ...item,
      date: item.date ? (item.date instanceof Date ? item.date.toISOString() : item.date) : item.date,
    })),
    expenses: (data.expenses || []).map((item: any): TaxReportExpenseItem => ({
      ...item,
      date: item.date ? (item.date instanceof Date ? item.date.toISOString() : item.date) : item.date,
    })),
  };
}

/**
 * Map invoice report data - dates remain as ISO strings from backend
 */
function mapInvoiceReportData(data: any): InvoiceReportData {
  const mapInvoice = (item: any): InvoiceReportItem => ({
    ...item,
    date: item.date ? (item.date instanceof Date ? item.date.toISOString() : item.date) : item.date,
    dueDate: item.dueDate ? (item.dueDate instanceof Date ? item.dueDate.toISOString() : item.dueDate) : item.dueDate,
  });

  return {
    summary: data.summary,
    paid: (data.paid || []).map(mapInvoice),
    unpaid: (data.unpaid || []).map(mapInvoice),
    overdue: (data.overdue || []).map(mapInvoice),
    writtenOff: (data.writtenOff || []).map(mapInvoice),
  };
}

/**
 * Map incident report data - dates remain as ISO strings from backend
 */
function mapIncidentReportData(data: any): IncidentReportData {
  return {
    summary: data.summary,
    data: (data.data || []).map((item: any): IncidentReportItem => ({
      ...item,
      date: item.date ? (item.date instanceof Date ? item.date.toISOString() : item.date) : item.date,
      supervisorReportDate: item.supervisorReportDate ? (item.supervisorReportDate instanceof Date ? item.supervisorReportDate.toISOString() : item.supervisorReportDate) : item.supervisorReportDate,
      dateNDISReport: item.dateNDISReport ? (item.dateNDISReport instanceof Date ? item.dateNDISReport.toISOString() : item.dateNDISReport) : item.dateNDISReport,
    })),
  };
}

export function useReportShift() {
  const [loading, setIsLoading] = useState(false);
  const [obj, setObj] = useState<ShiftReportData | undefined>();

  const generate = async (payload: ReportWithDatesAssigneeAndContactDto) => {
    setIsLoading(true);
    try {
      const data = await reportsApi.getShiftsReport(payload);
      setObj(mapShiftReportData(data));
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
      setObj(mapIncidentReportData(data));
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
      setObj(mapKmsReportData(data));
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
      setObj(mapTaxReportData(data));
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
      setObj(mapInvoiceReportData(data));
    } catch (error) {
      console.error('Failed to generate invoice report:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { loading, obj, generate };
}
