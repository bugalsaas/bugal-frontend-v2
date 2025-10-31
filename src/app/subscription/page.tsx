'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/wrapped-main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Rocket,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { usePlans, useSubscriptionActions } from '@/hooks/use-subscription';
import { PlansResponse } from '@/lib/api/subscription-service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type Frequency = 'Monthly' | 'Yearly';

function PriceTag({ oldPrice, price, label }: { oldPrice: number; price: number; label: string }) {
  const hasDiscount = oldPrice !== price;
  
  return (
    <div className="min-h-[50px]">
      {hasDiscount && (
        <div className="text-sm text-red-600 line-through mb-1">
          ${oldPrice} / {label}
        </div>
      )}
      <div className="text-2xl font-semibold text-gray-900">
        ${price} / {label}
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  const { data: plans, isLoading } = usePlans();
  const { checkout, openCustomerPortal, changePlan, isSaving } = useSubscriptionActions();
  const [frequency, setFrequency] = useState<Frequency>('Yearly');
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  const handlePromoCode = async () => {
    try {
      await changePlan(promoCode);
      setPromoModalOpen(false);
      setPromoCode('');
    } catch (error) {
      console.error('Failed to apply promo code:', error);
      alert('Failed to apply promo code. Please try again.');
    }
  };

  const handleCheckout = async (planId: string) => {
    try {
      const result = await checkout(planId, frequency);
      
      // Redirect to Stripe checkout or success page
      window.location.href = '/subscription/success';
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to initiate checkout. Please try again.');
    }
  };

  const handleManageSubscription = async () => {
    try {
      const result = await openCustomerPortal();
      window.open(result.url, '_self');
    } catch (error) {
      console.error('Failed to open customer portal:', error);
    }
  };

  const headerConfig = {
    title: 'Subscription',
    subtitle: 'Choose a plan that works for you',
    showAddButton: false,
  };

  if (isLoading) {
    return (
      <MainLayout activeNavItem="subscription" headerConfig={headerConfig}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading plans...</span>
        </div>
      </MainLayout>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <MainLayout activeNavItem="subscription" headerConfig={headerConfig}>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Plans Available</h3>
          <p className="text-gray-600">Plans are not available at this time.</p>
        </div>
      </MainLayout>
    );
  }

  // Default to showing checkout - subscription status should come from API/user context when available
  // TODO: Replace with actual subscription status from user context or API
  const shouldShowCheckout = true; // Show checkout by default until subscription status is available
  const shouldShowManage = false;

  return (
    <MainLayout activeNavItem="subscription" headerConfig={headerConfig}>
      <div className="space-y-6">
        {/* Plan Checkout Section - Only show if unsubscribed/free */}
        {shouldShowCheckout && (
          <>
        {/* Promo Code Button */}
        <div className="flex justify-end mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setPromoModalOpen(true)}
          >
            I have a promo code
          </Button>
        </div>

        {/* Frequency Toggle */}
        <div className="flex justify-center mb-8">
          <RadioGroup
            value={frequency}
            onValueChange={(value) => setFrequency(value as Frequency)}
            className="flex items-center space-x-8"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Monthly" id="monthly" />
              <Label htmlFor="monthly" className="text-base font-medium cursor-pointer">
                Monthly
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Yearly" id="yearly" />
              <Label htmlFor="yearly" className="text-base font-medium cursor-pointer">
                Yearly <span className="text-green-600 text-sm ml-1">(Save 20%)</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const price = frequency === 'Monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const oldPrice = frequency === 'Monthly' ? plan.originalMonthlyPrice : plan.originalYearlyPrice;
            const label = frequency === 'Monthly' ? 'month' : 'year';
            // TODO: Replace with actual current plan from subscription status
            const isCurrentPlan = false;

            return (
              <div key={plan.id} className="relative">
                {plan.highlight && (
                  <div className="absolute -top-1 right-4 z-10 bg-red-600 text-white px-3 py-1 text-xs font-semibold">
                    {plan.highlight}
                  </div>
                )}
                <Card 
                  className={`h-full transition-all ${isCurrentPlan ? 'border-2 border-blue-500 bg-blue-50' : 'hover:shadow-md border-2 border-transparent hover:border-gray-300'}`}
                  onMouseEnter={(e) => {
                    if (!isCurrentPlan) {
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrentPlan) {
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <PriceTag oldPrice={oldPrice} price={price} label={label} />
                    </div>
                  </CardHeader>
                
                <CardContent>
                  <Separator className="my-4" />
                  <ul className="space-y-2 mb-6 pl-4">
                    {plan.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <Separator className="my-4" />
                  
                  <Button
                    type="submit"
                    className="w-full"
                    onClick={() => handleCheckout(plan.id)}
                    disabled={isCurrentPlan || isSaving}
                    size="default"
                  >
                    {isCurrentPlan ? 'Subscribed' : isSaving ? 'Processing...' : 'Subscribe'}
                  </Button>
                </CardContent>
              </Card>
              </div>
            );
          })}
        </div>
          </>
        )}

        {/* Manage Subscription Section - Only show if user has active subscription */}
        {shouldShowManage && (
          <div className="space-y-4">
            <p className="text-gray-600 text-lg">Bugal partners with Stripe for simplified billing.</p>
            <div className="space-y-2 text-gray-700">
              <p>The button below will allow you to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>View your current subscription;</li>
                <li>Update your billing details; and</li>
                <li>View your billing history</li>
              </ul>
            </div>
            <Button onClick={handleManageSubscription} disabled={isSaving} size="lg">
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Take me there'
              )}
            </Button>
          </div>
        )}

        {/* Promo Code Modal */}
        <Dialog open={promoModalOpen} onOpenChange={setPromoModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Promo Code</DialogTitle>
              <DialogDescription>
                Enter your promo code to apply a discount to your subscription.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="promo-code">Code</Label>
                <Input
                  id="promo-code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPromoModalOpen(false)}>
                Close
              </Button>
              <Button onClick={handlePromoCode} disabled={!promoCode || isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  'Apply Code'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
