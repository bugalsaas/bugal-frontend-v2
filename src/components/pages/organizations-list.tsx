import React from 'react';
import { useOrganizations } from '@/hooks/use-organizations';
import { Organization, OrganizationType, SubscriptionStatus } from '@/lib/api/organizations-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface OrganizationsListProps {
  onViewOrganization?: (organization: Organization) => void;
  onEditOrganization?: (organization: Organization) => void;
  onDeleteOrganization?: (organization: Organization) => void;
  onExportOrganizations?: () => void;
}

export function OrganizationsList({
  onViewOrganization,
  onEditOrganization,
  onDeleteOrganization,
  onExportOrganizations,
}: OrganizationsListProps) {
  const { 
    organizations, 
    isLoading, 
    error, 
    filters, 
    setFilters, 
    pagination, 
    setPagination, 
    filterCounter,
    reloadList 
  } = useOrganizations();

  const getOrganizationTypeColor = (type: OrganizationType) => {
    switch (type) {
      case OrganizationType.SoleTrader:
        return 'bg-blue-100 text-blue-800';
      case OrganizationType.Partnership:
        return 'bg-green-100 text-green-800';
      case OrganizationType.Company:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionStatusColor = (status?: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.Active:
        return 'bg-green-100 text-green-800';
      case SubscriptionStatus.Trial:
        return 'bg-yellow-100 text-yellow-800';
      case SubscriptionStatus.Cancelled:
        return 'bg-red-100 text-red-800';
      case SubscriptionStatus.Expired:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrganizationInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading organizations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Organizations</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={reloadList} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Organizations Found</h3>
        <p className="text-gray-600">
          {filterCounter > 0 
            ? 'No organizations match your current filters. Try adjusting your search criteria.'
            : 'Get started by creating your first organization.'
          }
        </p>
        {filterCounter > 0 && (
          <Button 
            onClick={() => setFilters({})} 
            variant="outline" 
            className="mt-4"
          >
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Organizations ({organizations.length})
          </h2>
          {filterCounter > 0 && (
            <Badge variant="secondary">
              {filterCounter} filter{filterCounter !== 1 ? 's' : ''} applied
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={onExportOrganizations}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((organization) => (
          <Card key={organization.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-800">
                      {getOrganizationInitials(organization.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {organization.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getOrganizationTypeColor(organization.organizationType)}>
                        {organization.organizationType}
                      </Badge>
                      {organization.subscriptionStatus && (
                        <Badge className={getSubscriptionStatusColor(organization.subscriptionStatus)}>
                          {organization.subscriptionStatus}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    onClick={() => onViewOrganization?.(organization)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => onEditOrganization?.(organization)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => onDeleteOrganization?.(organization)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {organization.email}
                  </div>
                  {organization.phoneNumber && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {organization.phoneNumber}
                    </div>
                  )}
                  {organization.addressLine1 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {organization.addressLine1}
                      {organization.addressLine2 && `, ${organization.addressLine2}`}
                    </div>
                  )}
                </div>

                {/* Business Details */}
                <div className="space-y-2">
                  {organization.abn && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="h-4 w-4 mr-2" />
                      ABN: {organization.abn}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Payment Terms: {organization.paymentTerms} days
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Created: {formatDate(new Date(organization.createdAt))}
                  </div>
                </div>

                {/* GST Registration */}
                {organization.isGstRegistered && (
                  <div className="mt-3">
                    <Badge variant="outline" className="text-green-700 border-green-200">
                      GST Registered
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.page > 1 || organizations.length === pagination.pageSize ? (
        <div className="flex justify-center items-center space-x-4 pt-6">
          <Button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.page}
          </span>
          <Button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={organizations.length < pagination.pageSize}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
