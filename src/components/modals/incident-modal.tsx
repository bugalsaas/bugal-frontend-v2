'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Incident, IncidentWitness } from '@/lib/api/incidents-service';
import { formatDate } from '@/lib/utils';
import { DateTimePickerField } from '@/components/form/date-time-picker-field';
import { 
  AlertTriangle,
  User,
  Calendar,
  MapPin,
  FileText,
  Shield,
  ExternalLink,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';

const incidentSchema = z.object({
  idShift: z.string().min(1, 'Shift is required'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(1, 'Description is required'),
  immediateActionsTaken: z.string().optional(),
  hadOtherIndividualsInvolved: z.boolean().optional(),
  otherIndividualsInvolved: z.string().optional(),
  wasParticipantInjured: z.boolean().optional(),
  participantInjuryDescription: z.string().optional(),
  requiredMedicalAttention: z.boolean().optional(),
  requiredEmergencyAttention: z.boolean().optional(),
  witnesses: z.array(z.object({
    name: z.string().optional(),
    contact: z.string().optional(),
    statement: z.string().optional(),
  })).optional(),
  wasSupervisorReported: z.boolean().optional(),
  supervisorName: z.string().optional(),
  supervisorReportDate: z.string().optional(),
  wasRiskAssessmentConducted: z.boolean().optional(),
  preventativeMeasuresOrRecommendations: z.string().optional(),
  isNDISReportable: z.boolean().optional(),
  wasNDISReported: z.boolean().optional(),
  dateNDISReport: z.string().optional(),
});

type IncidentFormValues = z.infer<typeof incidentSchema>;

interface IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'new' | 'edit' | 'view';
  incident?: Incident | null;
  shiftId?: string;
  onSave: (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'code' | 'reportedBy'>) => Promise<void>;
  onDelete?: () => Promise<void>;
  isLoading?: boolean;
}

export function IncidentModal({
  isOpen,
  onClose,
  mode,
  incident,
  shiftId,
  onSave,
  onDelete,
  isLoading = false,
}: IncidentModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      idShift: '',
      date: '',
      location: '',
      description: '',
      immediateActionsTaken: '',
      hadOtherIndividualsInvolved: false,
      otherIndividualsInvolved: '',
      wasParticipantInjured: false,
      participantInjuryDescription: '',
      requiredMedicalAttention: false,
      requiredEmergencyAttention: false,
      witnesses: [],
      wasSupervisorReported: false,
      supervisorName: '',
      supervisorReportDate: '',
      wasRiskAssessmentConducted: false,
      preventativeMeasuresOrRecommendations: '',
      isNDISReportable: false,
      wasNDISReported: false,
      dateNDISReport: '',
    },
  });

  const { handleSubmit, reset, watch, setValue, formState: { errors } } = form;
  
  // Watch form values for conditional rendering
  const watchedValues = watch();
  const [witnesses, setWitnesses] = useState<IncidentWitness[]>([]);

  useEffect(() => {
    if (incident && mode !== 'new') {
      reset({
        idShift: incident.idShift,
        date: incident.date,
        location: incident.location || '',
        description: incident.description || '',
        immediateActionsTaken: incident.immediateActionsTaken || '',
        hadOtherIndividualsInvolved: incident.hadOtherIndividualsInvolved || false,
        otherIndividualsInvolved: incident.otherIndividualsInvolved || '',
        wasParticipantInjured: incident.wasParticipantInjured || false,
        participantInjuryDescription: incident.participantInjuryDescription || '',
        requiredMedicalAttention: incident.requiredMedicalAttention || false,
        requiredEmergencyAttention: incident.requiredEmergencyAttention || false,
        witnesses: incident.witnesses || [],
        wasSupervisorReported: incident.wasSupervisorReported || false,
        supervisorName: incident.supervisorName || '',
        supervisorReportDate: incident.supervisorReportDate || '',
        wasRiskAssessmentConducted: incident.wasRiskAssessmentConducted || false,
        preventativeMeasuresOrRecommendations: incident.preventativeMeasuresOrRecommendations || '',
        isNDISReportable: incident.isNDISReportable || false,
        wasNDISReported: incident.wasNDISReported || false,
        dateNDISReport: incident.dateNDISReport || '',
      });
      setWitnesses(incident.witnesses || []);
    } else if (mode === 'new') {
      reset({
        idShift: shiftId || '',
        date: new Date().toISOString(),
        location: '',
        description: '',
        immediateActionsTaken: '',
        hadOtherIndividualsInvolved: false,
        otherIndividualsInvolved: '',
        wasParticipantInjured: false,
        participantInjuryDescription: '',
        requiredMedicalAttention: false,
        requiredEmergencyAttention: false,
        witnesses: [],
        wasSupervisorReported: false,
        supervisorName: '',
        supervisorReportDate: '',
        wasRiskAssessmentConducted: false,
        preventativeMeasuresOrRecommendations: '',
        isNDISReportable: false,
        wasNDISReported: false,
        dateNDISReport: '',
      });
      setWitnesses([]);
    }
  }, [incident, mode, reset, shiftId]);

  const onSubmit = async (values: IncidentFormValues) => {
    try {
      const incidentData = {
        ...values,
        witnesses: witnesses,
      };
      await onSave(incidentData);
      onClose();
    } catch (error) {
      console.error('Failed to save incident:', error);
    }
  };

  const addWitness = () => {
    setWitnesses([...witnesses, { name: '', contact: '', statement: '' }]);
  };

  const removeWitness = (index: number) => {
    setWitnesses(witnesses.filter((_, i) => i !== index));
  };

  const updateWitness = (index: number, field: keyof IncidentWitness, value: string) => {
    const updatedWitnesses = [...witnesses];
    updatedWitnesses[index] = { ...updatedWitnesses[index], [field]: value };
    setWitnesses(updatedWitnesses);
  };

  const shouldUseDrawer = !isDesktop;
  const modalTitle = (
    <>
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>
              {mode === 'new' && 'New Incident Report'}
              {mode === 'edit' && 'Edit Incident Report'}
              {mode === 'view' && 'View Incident Report'}
            </span>
    </>
  );

  // Render view mode content
  const renderViewMode = () => {
    if (!incident) return null;
    
    return (
          <div className="space-y-6">
            {/* General Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>General Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Incident Code</Label>
                    <p className="text-lg font-semibold text-gray-900">{incident.code}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date & Time</Label>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(new Date(incident.date))}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Location</Label>
                  <p className="text-gray-900">{incident.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Reported By</Label>
                  <p className="text-gray-900">{incident.reportedBy.fullName}</p>
                </div>
              </CardContent>
            </Card>

            {/* Incident Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Incident Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="text-gray-900">{incident.description}</p>
                </div>
                {incident.immediateActionsTaken && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Immediate Actions Taken</Label>
                    <p className="text-gray-900">{incident.immediateActionsTaken}</p>
                  </div>
                )}
                {incident.hadOtherIndividualsInvolved && incident.otherIndividualsInvolved && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Other Individuals Involved</Label>
                    <p className="text-gray-900">{incident.otherIndividualsInvolved}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Participant Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Participant Impact and Response</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {incident.wasParticipantInjured && incident.participantInjuryDescription && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Injury Description</Label>
                    <p className="text-gray-900">{incident.participantInjuryDescription}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Medical Attention Required</Label>
                    <p className="text-gray-900">{incident.requiredMedicalAttention ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Emergency Attention Required</Label>
                    <p className="text-gray-900">{incident.requiredEmergencyAttention ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                {incident.witnesses && incident.witnesses.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Witnesses</Label>
                    <div className="space-y-2">
                      {incident.witnesses.map((witness, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <p className="font-medium">{witness.name}</p>
                          <p className="text-sm text-gray-600">{witness.contact}</p>
                          <p className="text-sm mt-2">{witness.statement}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Follow-up Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Follow-up Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {incident.wasSupervisorReported && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Supervisor Report</Label>
                    <p className="text-gray-900">{incident.supervisorName} - {formatDate(new Date(incident.supervisorReportDate!))}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-500">Risk Assessment Conducted</Label>
                  <p className="text-gray-900">{incident.wasRiskAssessmentConducted ? 'Yes' : 'No'}</p>
                </div>
                {incident.preventativeMeasuresOrRecommendations && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Preventative Measures</Label>
                    <p className="text-gray-900">{incident.preventativeMeasuresOrRecommendations}</p>
                  </div>
                )}
                {incident.isNDISReportable && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">NDIS Reporting</Label>
                    <p className="text-gray-900">
                      {incident.wasNDISReported ? `Reported on ${formatDate(new Date(incident.dateNDISReport!))}` : 'Not reported'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
    );
  };

  // Render form content
  const renderFormContent = () => (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* General Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>General Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DateTimePickerField
                    label="Incident Date & Time"
                    dateId="date"
                    timeId="date-time"
                    value={form.watch('date')}
                    onChange={(value) => form.setValue('date', value)}
                    error={errors.date}
                    disabled={isLoading}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      {...form.register('location')}
                      placeholder="Where did the incident occur?"
                      disabled={isLoading}
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm">{errors.location.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Incident Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Incident Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Describe what happened..."
                    disabled={isLoading}
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="immediateActionsTaken">Immediate Actions Taken</Label>
                  <Textarea
                    id="immediateActionsTaken"
                    {...form.register('immediateActionsTaken')}
                    placeholder="What immediate actions were taken?"
                    disabled={isLoading}
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hadOtherIndividualsInvolved"
                      checked={watchedValues.hadOtherIndividualsInvolved}
                      onCheckedChange={(checked) => setValue('hadOtherIndividualsInvolved', checked)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="hadOtherIndividualsInvolved">Were there other individuals involved?</Label>
                  </div>
                  
                  {watchedValues.hadOtherIndividualsInvolved && (
                    <div className="space-y-2">
                      <Label htmlFor="otherIndividualsInvolved">Individuals&apos; Details</Label>
                      <Textarea
                        id="otherIndividualsInvolved"
                        {...form.register('otherIndividualsInvolved')}
                        placeholder="Names and contact information of other individuals involved"
                        disabled={isLoading}
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Participant Impact and Response */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Participant Impact and Response</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="wasParticipantInjured"
                      checked={watchedValues.wasParticipantInjured}
                      onCheckedChange={(checked) => setValue('wasParticipantInjured', checked)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="wasParticipantInjured">Was the participant injured?</Label>
                  </div>
                  
                  {watchedValues.wasParticipantInjured && (
                    <div className="space-y-2">
                      <Label htmlFor="participantInjuryDescription">Injury Description</Label>
                      <Textarea
                        id="participantInjuryDescription"
                        {...form.register('participantInjuryDescription')}
                        placeholder="Describe the injury and treatment provided"
                        disabled={isLoading}
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requiredMedicalAttention"
                      checked={watchedValues.requiredMedicalAttention}
                      onCheckedChange={(checked) => setValue('requiredMedicalAttention', checked)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="requiredMedicalAttention">Medical attention required?</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requiredEmergencyAttention"
                      checked={watchedValues.requiredEmergencyAttention}
                      onCheckedChange={(checked) => setValue('requiredEmergencyAttention', checked)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="requiredEmergencyAttention">Emergency assistance required?</Label>
                  </div>
                </div>

                {/* Witnesses */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Witnesses</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addWitness}
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Witness
                    </Button>
                  </div>
                  
                  {witnesses.map((witness, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Witness {index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWitness(index)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`witness-${index}-name`}>Name</Label>
                          <Input
                            id={`witness-${index}-name`}
                            value={witness.name || ''}
                            onChange={(e) => updateWitness(index, 'name', e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`witness-${index}-contact`}>Contact</Label>
                          <Input
                            id={`witness-${index}-contact`}
                            value={witness.contact || ''}
                            onChange={(e) => updateWitness(index, 'contact', e.target.value)}
                            placeholder="Phone/email"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`witness-${index}-statement`}>Statement</Label>
                        <Textarea
                          id={`witness-${index}-statement`}
                          value={witness.statement || ''}
                          onChange={(e) => updateWitness(index, 'statement', e.target.value)}
                          placeholder="Witness statement"
                          disabled={isLoading}
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Follow-up Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Follow-up Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="wasSupervisorReported"
                      checked={watchedValues.wasSupervisorReported}
                      onCheckedChange={(checked) => setValue('wasSupervisorReported', checked)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="wasSupervisorReported">Reported to supervisor/manager?</Label>
                  </div>
                  
                  {watchedValues.wasSupervisorReported && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="supervisorName">Supervisor/Manager Name</Label>
                        <Input
                          id="supervisorName"
                          {...form.register('supervisorName')}
                          disabled={isLoading}
                        />
                      </div>
                      <DateTimePickerField
                        label="Date & Time Reported"
                        dateId="supervisorReportDate"
                        timeId="supervisorReportDate-time"
                        value={form.watch('supervisorReportDate')}
                        onChange={(value) => form.setValue('supervisorReportDate', value)}
                        error={errors.supervisorReportDate}
                        disabled={isLoading}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="wasRiskAssessmentConducted"
                      checked={watchedValues.wasRiskAssessmentConducted}
                      onCheckedChange={(checked) => setValue('wasRiskAssessmentConducted', checked)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="wasRiskAssessmentConducted">Risk assessment conducted?</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="preventativeMeasuresOrRecommendations">Preventative Measures</Label>
                    <Textarea
                      id="preventativeMeasuresOrRecommendations"
                      {...form.register('preventativeMeasuresOrRecommendations')}
                      placeholder="Preventative measures or recommendations"
                      disabled={isLoading}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isNDISReportable"
                      checked={watchedValues.isNDISReportable}
                      onCheckedChange={(checked) => setValue('isNDISReportable', checked)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="isNDISReportable" className="flex items-center space-x-1">
                      <span>NDIS reportable incident?</span>
                      <ExternalLink className="h-3 w-3" />
                    </Label>
                  </div>
                  
                  {watchedValues.isNDISReportable && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="wasNDISReported"
                          checked={watchedValues.wasNDISReported}
                          onCheckedChange={(checked) => setValue('wasNDISReported', checked)}
                          disabled={isLoading}
                        />
                        <Label htmlFor="wasNDISReported">Reported to NDIS Quality & Safeguards?</Label>
                      </div>
                      
                      {watchedValues.wasNDISReported && (
                        <DateTimePickerField
                          label="Date & Time Reported to NDIS"
                          dateId="dateNDISReport"
                          timeId="dateNDISReport-time"
                          value={form.watch('dateNDISReport')}
                          onChange={(value) => form.setValue('dateNDISReport', value)}
                          error={errors.dateNDISReport}
                          disabled={isLoading}
                        />
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'new' ? 'Creating...' : 'Saving...'}
                  </>
                ) : (
                  mode === 'new' ? 'Create Incident Report' : 'Save Changes'
                )}
              </Button>
            </div>
          </form>
  );

  // Render footer buttons for view mode
  const renderViewFooterButtons = () => (
    <>
      <Button variant="outline" onClick={onClose}>
        Close
      </Button>
      {onDelete && (
        <Button 
          variant="destructive"
          onClick={onDelete}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            'Delete Incident'
          )}
        </Button>
      )}
    </>
  );

  // Render footer buttons for form mode
  const renderFormFooterButtons = () => (
    <>
      <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {mode === 'new' ? 'Creating...' : 'Saving...'}
          </>
        ) : (
          mode === 'new' ? 'Create Incident Report' : 'Save Changes'
        )}
      </Button>
    </>
  );

  // Render content
  const renderContent = () => {
    if (mode === 'view' && incident) {
      return renderViewMode();
    }
    return renderFormContent();
  };

  // Render Drawer for all modes on mobile
  if (shouldUseDrawer) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center space-x-2">
              {modalTitle}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto flex-1 min-h-0">
            {renderViewMode()}
          </div>
          <DrawerFooter className="flex-row justify-between gap-2 border-t pt-4 flex-wrap">
            {renderViewFooterButtons()}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Render Dialog for all other cases
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {modalTitle}
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
        {mode === 'view' && incident ? (
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            {renderViewFooterButtons()}
          </div>
        ) : (
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            {renderFormFooterButtons()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
