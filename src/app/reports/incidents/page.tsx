'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout/wrapped-main-layout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangeInput } from '@/components/reports/date-range-input';
import { ReportSummary, ReportSummaryItem } from '@/components/reports/report-summary';
import { ReportBreakdown } from '@/components/reports/report-breakdown';
import { DescriptionItem } from '@/components/reports/description-item';
import { useReportIncident } from '@/hooks/use-reports';
import { useContacts } from '@/hooks/use-contacts';
import { useIncidentActions } from '@/hooks/use-incidents';
import { useAuth } from '@/contexts/auth-context';
import { formatDate, formatDateTimeAt } from '@/lib/utils';
import { format as formatDateFns } from 'date-fns';
import { 
  FileText, 
  AlertTriangle, 
  User,
  Calendar,
  MapPin,
  AlertCircle,
  Loader2,
  Info,
  Trash2,
} from 'lucide-react';

const incidentReportSchema = z.object({
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  idContact: z.string().min(1, 'Contact is required'),
});

type IncidentReportFormValues = z.infer<typeof incidentReportSchema>;

export default function IncidentsReportPage() {
  const { loading, obj, generate } = useReportIncident();
  const { data: contacts } = useContacts();
  const { user } = useAuth();
  const { deleteIncident, isDeleting } = useIncidentActions();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Check permission for delete
  const hasPermissionDelete = user?.scopes?.includes('incidents:delete') ?? false;

  const form = useForm<IncidentReportFormValues>({
    resolver: zodResolver(incidentReportSchema),
    defaultValues: {
      idContact: '-1',
    },
  });

  const { handleSubmit, setValue, watch, formState: { errors } } = form;

  const handleGenerate = async (values: IncidentReportFormValues) => {
    try {
      await generate({
        startDate: formatDateFns(values.startDate, 'yyyy-MM-dd'),
        endDate: formatDateFns(values.endDate, 'yyyy-MM-dd'),
        idContact: values.idContact,
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleDeleteClick = async (event: React.MouseEvent<HTMLElement, MouseEvent>, item: { id: string }) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this incident?')) {
      try {
        await deleteIncident(item.id);
        // Refresh the report after deletion
        const formValues = form.getValues();
        await handleGenerate(formValues);
      } catch (error) {
        console.error('Failed to delete incident:', error);
      }
    }
  };

  const headerConfig = {
    title: 'Incident Report',
    subtitle: 'Incident Report overview',
    icon: FileText,
    showAddButton: false,
  };

  return (
    <MainLayout activeNavItem="reports" headerConfig={headerConfig}>
      <div className="space-y-6">
        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Create incident reports via the shift</h3>
              <p className="text-sm text-blue-700 mt-1">
                Incidents are created and managed through the shift management system.
              </p>
            </div>
          </div>
        </div>

        {/* Report Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit(handleGenerate)} className="space-y-6">
            <DateRangeInput
              disabled={loading}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={(date) => {
                setStartDate(date);
                setValue('startDate', date || new Date(), { shouldValidate: true });
              }}
              onEndDateChange={(date) => {
                setEndDate(date);
                setValue('endDate', date || new Date(), { shouldValidate: true });
              }}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact
              </label>
              <Select
                value={watch('idContact')}
                onValueChange={(value) => setValue('idContact', value, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-1">All Contacts</SelectItem>
                  {(contacts ?? []).map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.idContact && (
                <p className="text-red-500 text-sm mt-1">{errors.idContact.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </form>
        </div>

        {/* Report Summary */}
        {!loading && obj?.summary && (
          <ReportSummary>
            <ReportSummaryItem
              left="Count"
              right={obj.summary.count.toString()}
            />
          </ReportSummary>
        )}

        {/* Report Breakdown */}
        {!loading && obj?.data && obj.data.length > 0 && (
          <ReportBreakdown
            title={`${obj.summary.count} Incident${obj.summary.count > 1 ? 's' : ''}`}
            data={obj.data}
            renderLeft={(item) => item.code}
            renderRight={(item) => (
              <div className="flex items-center space-x-2">
                <span>{formatDate(new Date(item.date))}</span>
                {hasPermissionDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => handleDeleteClick(e, item)}
                    disabled={isDeleting}
                    title="Delete incident"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </div>
            )}
            renderItem={(item) => (
              <>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">General Information</h4>
                    <DescriptionItem title="Contact" content={item.contact.fullName} />
                    <DescriptionItem title="Incident date and time" content={formatDateTimeAt(new Date(item.date))} />
                    <DescriptionItem title="Location" content={item.location} />
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Incident Details</h4>
                    <DescriptionItem title="Description" content={item.description} />
                    <DescriptionItem title="Immediate actions taken" content={item.immediateActionsTaken} />
                    <DescriptionItem 
                      title="Were there other individuals involved?" 
                      content={item.hadOtherIndividualsInvolved ? 'Yes' : 'No'} 
                    />
                    {item.otherIndividualsInvolved && (
                      <DescriptionItem title="Individuals' details" content={item.otherIndividualsInvolved} />
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Participant Impact and Response</h4>
                    <DescriptionItem 
                      title="Was the participant injured?" 
                      content={item.wasParticipantInjured ? 'Yes' : 'No'} 
                    />
                    {item.participantInjuryDescription && (
                      <DescriptionItem 
                        title="Describe the injury and treatment provided" 
                        content={item.participantInjuryDescription} 
                      />
                    )}
                    <DescriptionItem 
                      title="Did the participant require medical attention?" 
                      content={item.requiredMedicalAttention ? 'Yes' : 'No'} 
                    />
                    <DescriptionItem 
                      title="Was emergency medical assistance required?" 
                      content={item.requiredEmergencyAttention ? 'Yes' : 'No'} 
                    />
                  </div>

                  {item.witnesses && item.witnesses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Witnesses</h4>
                      {item.witnesses.map((witness, index) => (
                        <div key={index} className="ml-4 space-y-2">
                          <DescriptionItem title="Name" content={witness.name} />
                          <DescriptionItem title="Contact" content={witness.contact} />
                          {witness.statement && (
                            <DescriptionItem title="Statement" content={witness.statement} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Follow Up Actions</h4>
                    <DescriptionItem 
                      title="Was the incident reported to a supervisor/manager?" 
                      content={item.wasSupervisorReported ? 'Yes' : 'No'} 
                    />
                    {item.supervisorName && (
                      <DescriptionItem title="Supervisor/Manager Name" content={item.supervisorName} />
                    )}
                    {item.supervisorReportDate && (
                      <DescriptionItem 
                        title="Date and time reported" 
                        content={formatDateTimeAt(new Date(item.supervisorReportDate))} 
                      />
                    )}
                    <DescriptionItem 
                      title="Was a risk assessment conducted?" 
                      content={item.wasRiskAssessmentConducted ? 'Yes' : 'No'} 
                    />
                    {item.preventativeMeasuresOrRecommendations && (
                      <DescriptionItem 
                        title="Preventative measures or recommendations" 
                        content={item.preventativeMeasuresOrRecommendations} 
                      />
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Reporting and Compliance</h4>
                    <DescriptionItem 
                      title="Is this a reportable incident under NDIS guidelines?" 
                      content={item.isNDISReportable ? 'Yes' : 'No'} 
                    />
                    <DescriptionItem 
                      title="Has it been reported to NDIS Quality & Safeguards?" 
                      content={item.wasNDISReported ? 'Yes' : 'No'} 
                    />
                    {item.dateNDISReport && (
                      <DescriptionItem 
                        title="Date and time reported" 
                        content={formatDateTimeAt(new Date(item.dateNDISReport))} 
                      />
                    )}
                    <DescriptionItem title="Reported by" content={item.reportedBy.fullName} />
                  </div>
                </div>
              </>
            )}
          />
        )}

        {/* Empty State */}
        {!loading && (!obj || obj.data.length === 0) && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Incidents Found</h3>
            <p className="text-gray-600">
              Generate a report to see incident data for the selected criteria.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
