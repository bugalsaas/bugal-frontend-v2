'use client';

import React from 'react';
import { useAgreements } from '@/hooks/use-agreements';
import { Agreement, AgreementStatus } from '@/lib/api/agreements-service';
import { formatDate } from '@/lib/utils';
import { 
  FileText, 
  Eye, 
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
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AgreementsListProps {
  onViewAgreement?: (agreement: Agreement) => void;
  onEditAgreement?: (agreement: Agreement) => void;
  onDeleteAgreement?: (agreement: Agreement) => void;
  onCompleteAgreement?: (agreement: Agreement) => void;
  onDraftAgreement?: (agreement: Agreement) => void;
  onNotifyAgreement?: (agreement: Agreement) => void;
  onDuplicateAgreement?: (agreement: Agreement) => void;
}

export function AgreementsList({ 
  onViewAgreement, 
  onEditAgreement, 
  onDeleteAgreement,
  onCompleteAgreement,
  onDraftAgreement,
  onNotifyAgreement,
  onDuplicateAgreement,
}: AgreementsListProps) {
  const { data: agreements, loading, error, total, filterCounter, filters, setFilters } = useAgreements();

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
          {filterCounter > 0 
            ? 'No agreements match your current filters. Try adjusting your search criteria.'
            : 'Get started by creating your first agreement.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Summary */}
      {filterCounter > 0 && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Showing {agreements.length} of {total} agreements</span>
          <Badge variant="secondary">{filterCounter} filter{filterCounter > 1 ? 's' : ''} applied</Badge>
        </div>
      )}

      {/* Agreements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agreements.map((agreement) => (
          <Card
            key={agreement.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewAgreement(agreement)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(agreement.agreementStatus)}
                  <CardTitle className="text-lg">{agreement.code}</CardTitle>
                </div>
                <Badge className={getStatusColor(agreement.agreementStatus)}>
                  {agreement.agreementStatus}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Contact:</span>
                <span className="font-medium">{agreement.contact.fullName}</span>
              </div>

              {/* Dates */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Start:</span>
                  <span className="text-sm">{formatDate(new Date(agreement.startDate))}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">End:</span>
                  <span className="text-sm">{formatDate(new Date(agreement.endDate))}</span>
                </div>
                {agreement.completedAt && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">Completed:</span>
                    <span className="text-sm">{formatDate(new Date(agreement.completedAt))}</span>
                  </div>
                )}
              </div>

              {/* Support Items Summary */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Support Items:</span>
                  <span className="text-sm font-medium">{agreement.supportItems.length}</span>
                </div>
                {agreement.supportItems.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {agreement.supportItems.slice(0, 2).map((item, index) => (
                      <div key={index} className="truncate">
                        {item.NDISName} - ${Number(item.amountExclGst || 0).toFixed(2)}
                      </div>
                    ))}
                    {agreement.supportItems.length > 2 && (
                      <div>+{agreement.supportItems.length - 2} more...</div>
                    )}
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="text-xs text-gray-500 space-y-1">
                <div>Amendment notice: {agreement.amendmentDays} days</div>
                <div>Invoice terms: {agreement.sendInvoicesAfter} days</div>
                {agreement.canChargeCancellation && (
                  <div>Can charge cancellation fees</div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewAgreement(agreement);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                {agreement.agreementStatus === AgreementStatus.Draft && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAgreement(agreement);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompleteAgreement(agreement);
                      }}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotifyAgreement(agreement);
                      }}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAgreement(agreement);
                      }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDraftAgreement(agreement);
                      }}
                    >
                      <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotifyAgreement(agreement);
                      }}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateAgreement(agreement);
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
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
