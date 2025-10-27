'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  FileText, 
  AlertTriangle, 
  Car, 
  Receipt,
  DollarSign,
} from 'lucide-react';

export default function ReportsPage() {
  const headerConfig = {
    title: 'Reports',
    subtitle: 'Generate detailed reports for your business data',
    icon: TrendingUp,
    showAddButton: false,
  };

  const reports = [
    {
      title: 'Shift Report',
      description: 'Detailed reports for shifts and expenses with breakdowns',
      icon: TrendingUp,
      href: '/reports/shifts',
      color: 'bg-blue-500',
      badge: null,
    },
    {
      title: 'Invoice Report',
      description: 'Invoice status reports with paid, unpaid, overdue, and written-off breakdowns',
      icon: FileText,
      href: '/reports/invoices',
      color: 'bg-green-500',
      badge: null,
    },
    {
      title: 'Kilometres Report',
      description: 'Kilometre expense reports with distance and rate calculations',
      icon: Car,
      href: '/reports/kms',
      color: 'bg-purple-500',
      badge: null,
    },
    {
      title: 'Tax Report',
      description: 'Tax reports for receipts and expenses with GST breakdowns',
      icon: Receipt,
      href: '/reports/tax',
      color: 'bg-orange-500',
      badge: null,
    },
    {
      title: 'Incident Report',
      description: 'Comprehensive incident reports with detailed documentation',
      icon: AlertTriangle,
      href: '/reports/incidents',
      color: 'bg-red-500',
      badge: 'NEW',
    },
  ];

  return (
    <MainLayout headerConfig={headerConfig}>
      <div className="space-y-6">
        {/* Introduction */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Report Generation</h3>
          <p className="text-blue-800">
            Generate detailed reports for your business data. Each report allows you to filter by date range, 
            contacts, and other criteria to get the insights you need.
          </p>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.title} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${report.color} text-white relative`}>
                  <report.icon className="h-6 w-6" />
                  {report.badge && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                      {report.badge}
                    </Badge>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {report.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {report.description}
                  </p>
                  <Button asChild className="w-full">
                    <a href={report.href}>
                      Generate Report
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Financial Summaries</h4>
                <p className="text-sm text-gray-600">Get comprehensive financial breakdowns with GST calculations</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Detailed Breakdowns</h4>
                <p className="text-sm text-gray-600">Expandable sections with detailed information for each item</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Flexible Filtering</h4>
                <p className="text-sm text-gray-600">Filter by date range, contacts, assignees, and more</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Compliance Ready</h4>
                <p className="text-sm text-gray-600">Reports formatted for tax and compliance requirements</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}