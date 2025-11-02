import { getToken } from '@/contexts/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Attachment {
  id: string;
  name: string;
  url?: string;
  size: number;
  extension?: string;
  contentType?: string;
}

export interface AttachmentUrlResponse {
  url: string;
}

export const attachmentsApi = {
  async upload(file: File, agreementId?: string): Promise<Attachment> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const formData = new FormData();
    formData.append('file', file);
    if (agreementId) {
      formData.append('agreementId', agreementId);
    }

    const response = await fetch(`${API_BASE_URL}/attachments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Attachment upload error:', response.status, errorText);
      throw new Error(`Failed to upload attachment: ${response.status} ${errorText || response.statusText}`);
    }

    return response.json();
  },

  async getUrl(id: string): Promise<string> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/attachments/${id}/url`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get attachment URL');
    }

    const data: AttachmentUrlResponse = await response.json();
    return data.url;
  },

  async delete(id: string): Promise<void> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/attachments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete attachment');
    }
  },
};

