import { getToken } from '@/contexts/auth-context';
import { ReceiptType, PaymentMethod } from './invoices-service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Receipt {
  id: string;
  code: string;
  receiptType: ReceiptType;
  date: string;
  amountExclGst: number;
  amountInclGst: number;
  amountGst: number;
  paymentMethod?: PaymentMethod;
  otherPaymentMethod?: string;
  notes?: string;
}

export interface ReceiptCreateDto {
  receiptType: ReceiptType;
  idInvoice: string;
  date: string;
  amountInclGst: number;
  paymentMethod?: PaymentMethod;
  otherPaymentMethod?: string;
  notes?: string;
}

export const receiptsApi = {
  async createReceipt(data: ReceiptCreateDto): Promise<Receipt> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/receipts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Receipt create error:', response.status, errorText);
      throw new Error(`Failed to create receipt: ${errorText || response.statusText}`);
    }

    return response.json();
  },

  async deleteReceipt(id: string): Promise<void> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/receipts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Receipt delete error:', response.status, errorText);
      throw new Error(`Failed to delete receipt: ${errorText || response.statusText}`);
    }
  },
};

