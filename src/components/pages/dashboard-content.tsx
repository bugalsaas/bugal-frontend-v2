'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  DollarSign,
  User,
  Plus,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DashboardContent() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Stats Cards - Matching old design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Shifts */}
        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/shifts')}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Today's shifts</h3>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Next shift: 08:00 AM
          </div>
        </Card>

        {/* Shifts to Complete */}
        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/shifts')}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-50">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Shifts to complete</h3>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Complete then attach to an Invoice
          </div>
        </Card>

        {/* Unbilled Shifts */}
        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/shifts')}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-50">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Unbilled shifts</h3>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Ready to invoice
          </div>
        </Card>

        {/* Overdue Invoices */}
        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/invoices')}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-red-50">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Overdue invoices</h3>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Requires attention
          </div>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Shift completed</p>
                  <p className="text-sm text-gray-600">2 hours ago</p>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">8:00 AM - 4:00 PM</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Invoice #1234 sent</p>
                  <p className="text-sm text-gray-600">4 hours ago</p>
                </div>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">$450.00</span>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="flex flex-col items-start p-4 h-auto text-left"
              onClick={() => router.push('/shifts')}
            >
              <Calendar className="h-6 w-6 text-blue-600 mb-2" />
              <p className="font-semibold text-gray-900">Add New Shift</p>
              <p className="text-sm text-gray-600 mt-1">Create a new shift entry</p>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-start p-4 h-auto text-left"
              onClick={() => router.push('/invoices')}
            >
              <FileText className="h-6 w-6 text-blue-600 mb-2" />
              <p className="font-semibold text-gray-900">Create Invoice</p>
              <p className="text-sm text-gray-600 mt-1">Generate a new invoice</p>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-start p-4 h-auto text-left"
              onClick={() => router.push('/contacts')}
            >
              <Users className="h-6 w-6 text-blue-600 mb-2" />
              <p className="font-semibold text-gray-900">Add Contact</p>
              <p className="text-sm text-gray-600 mt-1">Add a new contact</p>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-start p-4 h-auto text-left"
              onClick={() => router.push('/reports')}
            >
              <TrendingUp className="h-6 w-6 text-blue-600 mb-2" />
              <p className="font-semibold text-gray-900">View Reports</p>
              <p className="text-sm text-gray-600 mt-1">Check your analytics</p>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
