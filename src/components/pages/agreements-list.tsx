'use client';

import React from 'react';
import { Agreement, AgreementStatus } from '@/lib/api/agreements-service';
import { formatDate } from '@/lib/utils';
import { 
  FileText, 
  Edit, 
  Trash2, 
  CheckCircle,
  Undo,
  Send,
  Copy,
  Loader2,
  AlertCircle,
  Calendar,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface AgreementsListProps {
  agreements: Agreement[];
  loading: boolean;
  error: string | null;
  total: number;
  onViewAgreement?: (agreement: Agreement) => void;
  onEditAgreement?: (agreement: Agreement) => void;
  onDeleteAgreement?: (agreement: Agreement) => void;
  onCompleteAgreement?: (agreement: Agreement) => void;
  onDraftAgreement?: (agreement: Agreement) => void;
  onNotifyAgreement?: (agreement: Agreement) => void;
  onDuplicateAgreement?: (agreement: Agreement) => void;
}

export function AgreementsList({ 
  agreements,
  loading,
  error,
  total,
  onViewAgreement, 
  onEditAgreement, 
  onDeleteAgreement,
  onCompleteAgreement,
  onDraftAgreement,
  onNotifyAgreement,
  onDuplicateAgreement,
}: AgreementsListProps) {

  const handleViewAgreement = (agreement: Agreement) => {
    if (onViewAgreement) {
      onViewAgreement(agreement);
    }
  };

  const handleEditAgreement = (agreement: Agreement) => {
    if (onEditAgreement) {
      onEditAgreement(agreement);
    }
  };

  const handleDeleteAgreement = (agreement: Agreement) => {
    if (onDeleteAgreement) {
      onDeleteAgreement(agreement);
    }
  };

  const handleCompleteAgreement = (agreement: Agreement) => {
    if (onCompleteAgreement) {
      onCompleteAgreement(agreement);
    }
  };

  const handleDraftAgreement = (agreement: Agreement) => {
    if (onDraftAgreement) {
      onDraftAgreement(agreement);
    }
  };

  const handleNotifyAgreement = (agreement: Agreement) => {
    if (onNotifyAgreement) {
      onNotifyAgreement(agreement);
    }
  };

  const handleDuplicateAgreement = (agreement: Agreement) => {
    if (onDuplicateAgreement) {
      onDuplicateAgreement(agreement);
    }
  };

  const getStatusColor = (status: AgreementStatus) => {
    switch (status) {
      case AgreementStatus.Completed:
        return 'bg-green-100 text-green-800';
      case AgreementStatus.Draft:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: AgreementStatus) => {
    switch (status) {
      case AgreementStatus.Completed:
        return <CheckCircle className="h-4 w-4" />;
      case AgreementStatus.Draft:
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading agreements...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Agreements</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!agreements || agreements.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Agreements Found</h3>
        <p className="text-gray-600">
          Get started by creating your first agreement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Summary */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span>Showing {agreements.length} of {total} agreements</span>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {agreements.map((agreement) => (
          <Card
            key={agreement.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewAgreement(agreement)}
          >
            <div className="space-y-3">
              {/* Code with Status Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(agreement.agreementStatus)}
                  <span className="text-sm font-medium text-gray-900">{agreement.code}</span>
                </div>
                <Badge className={getStatusColor(agreement.agreementStatus)}>
                  {agreement.agreementStatus}
                </Badge>
              </div>

              {/* Client */}
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{agreement.contact.fullName}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Agreements Table (Desktop) */}
      <div className="hidden md:block overflow-x-auto bg-white border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agreements.map((agreement) => (
              <tr
                key={agreement.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleViewAgreement(agreement)}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(agreement.agreementStatus)}
                    <span className="text-sm font-medium text-gray-900">{agreement.code}</span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge className={getStatusColor(agreement.agreementStatus)}>
                    {agreement.agreementStatus}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{agreement.contact.fullName}</span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(new Date(agreement.startDate))}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(new Date(agreement.endDate))}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                    {agreement.agreementStatus === AgreementStatus.Draft && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAgreement(agreement)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompleteAgreement(agreement)}
                          title="Complete"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNotifyAgreement(agreement)}
                          title="Notify"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAgreement(agreement)}
                          title="Delete"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {agreement.agreementStatus === AgreementStatus.Completed && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDraftAgreement(agreement)}
                          title="Revert to Draft"
                        >
                          <Undo className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNotifyAgreement(agreement)}
                          title="Notify"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicateAgreement(agreement)}
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Info */}
      {total > agreements.length && (
        <div className="text-center text-sm text-gray-600">
          Showing {agreements.length} of {total} agreements
        </div>
      )}
    </div>
  );
}
