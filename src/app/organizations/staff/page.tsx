'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Mail, 
  User, 
  Eye, 
  Edit, 
  UserCheck, 
  UserX, 
  Loader2,
  AlertCircle,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { 
  OrganizationUser, 
  OrganizationUserStatus, 
  OrganizationInviteDto, 
  StaffUpdateDto,
  Role 
} from '@/lib/api/organizations-service';
import { useOrganizationUsers, useOrganizationUserActions, useRoles } from '@/hooks/use-organizations';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

const staffSchema = z.object({
  email: z.string().email('Valid email is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  initials: z.string().min(1, 'Initials are required').max(3, 'Initials must be 3 characters or less'),
  color: z.string().min(1, 'Color is required'),
  idRole: z.string().min(1, 'Role is required'),
});

type StaffFormValues = z.infer<typeof staffSchema>;

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'new' | 'edit' | 'view';
  user?: OrganizationUser;
  onSave: (data: OrganizationInviteDto | StaffUpdateDto) => Promise<void>;
}

function StaffModal({ isOpen, onClose, mode, user, onSave }: StaffModalProps) {
  const { user: authUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  
  const organizationId = authUser?.organization?.id || '';
  const { roles, isLoading: rolesLoading } = useRoles(organizationId);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      initials: '',
      color: '#3B82F6',
      idRole: '',
    },
  });

  const { handleSubmit, reset, watch, setValue, formState: { errors } } = form;
  const watchedFirstName = watch('firstName');
  const watchedLastName = watch('lastName');

  // Auto-generate initials when name changes
  React.useEffect(() => {
    if (watchedFirstName && watchedLastName) {
      const initials = `${watchedFirstName.charAt(0)}${watchedLastName.charAt(0)}`.toUpperCase();
      setValue('initials', initials);
    }
  }, [watchedFirstName, watchedLastName, setValue]);

  React.useEffect(() => {
    if (user && mode !== 'new') {
      const values = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        initials: user.initials,
        color: user.color,
        idRole: user.idRole,
      };
      reset(values);
      setSelectedColor(user.color);
    } else if (mode === 'new') {
      reset();
      setSelectedColor('#3B82F6');
    }
  }, [user, mode, reset]);

  React.useEffect(() => {
    setValue('color', selectedColor);
  }, [selectedColor, setValue]);

  const onSubmit = async (values: StaffFormValues) => {
    try {
      setIsSubmitting(true);
      await onSave(values);
      onClose();
    } catch (error) {
      console.error('Failed to save staff:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: OrganizationUserStatus) => {
    switch (status) {
      case OrganizationUserStatus.Active:
        return 'bg-green-100 text-green-800';
      case OrganizationUserStatus.Invited:
        return 'bg-yellow-100 text-yellow-800';
      case OrganizationUserStatus.Disabled:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  if (mode === 'view' && user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <User className="h-6 w-6" />
              <span>View Staff Member</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* User Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16" style={{ backgroundColor: user.color }}>
                    <AvatarFallback className="text-white font-semibold">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{user.fullName}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                      {user.role && (
                        <Badge variant="outline">
                          {user.role.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="role">Role & Permissions</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Mail className="h-5 w-5" />
                      <span>Contact Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                        <p className="text-sm text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                        <p className="text-sm text-gray-900">{user.fullName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Initials</Label>
                        <p className="text-sm text-gray-900">{user.initials}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Avatar Color</Label>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: user.color }}
                          />
                          <span className="text-sm text-gray-900">{user.color}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Created</Label>
                        <p className="text-sm text-gray-900">{formatDate(new Date(user.createdAt))}</p>
                      </div>
                      {user.disabledAt && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Disabled At</Label>
                          <p className="text-sm text-gray-900">{formatDate(new Date(user.disabledAt))}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="role" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Role & Permissions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {user.role ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Role Name</Label>
                          <p className="text-sm text-gray-900">{user.role.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Description</Label>
                          <p className="text-sm text-gray-900">{user.role.description}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Permissions</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {user.role.permissions.map((permission, index) => (
                              <Badge key={index} variant="outline">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No role assigned</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <User className="h-6 w-6" />
            <span>
              {mode === 'new' ? 'Invite Staff Member' : 'Edit Staff Member'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="idRole">Role *</Label>
              <Select
                value={form.watch('idRole')}
                onValueChange={(value) => form.setValue('idRole', value)}
                disabled={rolesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.idRole && (
                <p className="text-red-500 text-sm mt-1">{errors.idRole.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...form.register('firstName')}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...form.register('lastName')}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="initials">Initials *</Label>
              <Input
                id="initials"
                {...form.register('initials')}
                placeholder="Enter initials"
                maxLength={3}
              />
              {errors.initials && (
                <p className="text-red-500 text-sm mt-1">{errors.initials.message}</p>
              )}
            </div>

            <div>
              <Label>Avatar Color *</Label>
              <div className="flex items-center space-x-2 mt-2">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
                  style={{ backgroundColor: selectedColor }}
                />
                <Select
                  value={selectedColor}
                  onValueChange={setSelectedColor}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color} value={color}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span>{color}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                mode === 'new' ? 'Invite Staff' : 'Update Staff'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function StaffPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'edit' | 'view'>('new');
  const [selectedUser, setSelectedUser] = useState<OrganizationUser | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const organizationId = user?.organization?.id || '';
  
  const { 
    users, 
    isLoading, 
    error, 
    filters, 
    setFilters, 
    pagination, 
    setPagination, 
    filterCounter,
    reloadList 
  } = useOrganizationUsers(organizationId);

  const { 
    isLoading: actionsLoading, 
    inviteUser, 
    updateUser, 
    disableUser, 
    enableUser 
  } = useOrganizationUserActions();

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddStaff = () => {
    setSelectedUser(undefined);
    setModalMode('new');
    setIsModalOpen(true);
  };

  const handleEditStaff = (user: OrganizationUser) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewStaff = (user: OrganizationUser) => {
    setSelectedUser(user);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDisableStaff = async (user: OrganizationUser) => {
    if (window.confirm(`Are you sure you want to disable "${user.fullName}"? They will only be able to be re-enabled after 30 days if you have enough room available depending on your subscription.`)) {
      try {
        await disableUser(organizationId, user.id);
        toast.success(`${user.fullName} has been disabled`);
        reloadList();
      } catch (error) {
        console.error('Failed to disable staff:', error);
        toast.error('Failed to disable staff. Please try again.');
      }
    }
  };

  const handleEnableStaff = async (user: OrganizationUser) => {
    if (window.confirm(`Are you sure you want to enable "${user.fullName}"?`)) {
      try {
        await enableUser(organizationId, user.id);
        toast.success(`${user.fullName} has been enabled`);
        reloadList();
      } catch (error) {
        console.error('Failed to enable staff:', error);
        toast.error('Failed to enable staff. Please try again.');
      }
    }
  };

  const handleSaveStaff = async (data: OrganizationInviteDto | StaffUpdateDto) => {
    try {
      if (modalMode === 'new') {
        await inviteUser(organizationId, data as OrganizationInviteDto);
        toast.success('Staff invitation sent successfully');
      } else if (modalMode === 'edit' && selectedUser) {
        await updateUser(organizationId, selectedUser.id, data as StaffUpdateDto);
        toast.success('Staff member updated successfully');
      }
      reloadList();
    } catch (error) {
      console.error('Failed to save staff:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save staff');
      throw error;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(undefined);
  };

  const getStatusColor = (status: OrganizationUserStatus) => {
    switch (status) {
      case OrganizationUserStatus.Active:
        return 'bg-green-100 text-green-800';
      case OrganizationUserStatus.Invited:
        return 'bg-yellow-100 text-yellow-800';
      case OrganizationUserStatus.Disabled:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const headerConfig = {
    title: 'Staff Management',
    subtitle: 'Staff Management overview',
    icon: Users,
    showAddButton: true,
    addButtonText: 'Invite Staff',
    onAddClick: handleAddStaff,
  };

  // Check if user has organization access
  if (!organizationId) {
    return (
      <MainLayout headerConfig={headerConfig}>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Organization Found</h3>
          <p className="text-gray-600 mb-4">You need to be part of an organization to manage staff.</p>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout headerConfig={headerConfig}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading staff...</span>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout headerConfig={headerConfig}>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Staff</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={reloadList} variant="outline">
            Try Again
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout headerConfig={headerConfig}>
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Search & Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value={OrganizationUserStatus.Active}>Active</SelectItem>
                    <SelectItem value={OrganizationUserStatus.Invited}>Invited</SelectItem>
                    <SelectItem value={OrganizationUserStatus.Disabled}>Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Staff Members ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Staff Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No staff members match your current filters.'
                  : 'Get started by inviting your first staff member.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={handleAddStaff}>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Staff
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10" style={{ backgroundColor: user.color }}>
                          <AvatarFallback className="text-white font-semibold">
                            {user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">
                            {user.fullName}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                            {user.role && (
                              <Badge variant="outline">
                                {user.role.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          onClick={() => handleViewStaff(user)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleEditStaff(user)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.status === OrganizationUserStatus.Disabled ? (
                          <Button
                            onClick={() => handleEnableStaff(user)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                            disabled={actionsLoading}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleDisableStaff(user)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            disabled={actionsLoading}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        {user.role?.name || 'No role assigned'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="text-xs text-gray-500">
                          Created: {formatDate(new Date(user.createdAt))}
                        </span>
                      </div>
                      {user.disabledAt && (
                        <div className="flex items-center text-sm text-red-600">
                          <span className="text-xs">
                            Disabled: {formatDate(new Date(user.disabledAt))}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <StaffModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          mode={modalMode}
          user={selectedUser}
          onSave={handleSaveStaff}
        />
      </div>
    </MainLayout>
  );
}
