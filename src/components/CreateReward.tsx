import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAppContext } from '../contexts/AppContext';
import { ArrowLeft, Gift, Save } from 'lucide-react';
import { toast } from "sonner";

interface CreateRewardProps {
  onNavigate: (page: string, subPage?: string, id?: string) => void;
}

interface RewardFormData {
  name: string;
  rewardType: 'voucher' | 'cashback' | 'gift' | 'discount';
  value: number;
  description: string;
  milesCost?: number;
  validityStart: string;
  validityEnd: string;
  conditions: string;
  membershipId: string;
  maxUsage?: number;
  status: 'draft' | 'active';
}

const rewardTypeConfig = {
  voucher: { name: 'Voucher', icon: '🎫', color: 'bg-blue-100 text-blue-700' },
  cashback: { name: 'Cashback', icon: '💰', color: 'bg-green-100 text-green-700' },
  gift: { name: 'Gift', icon: '🎁', color: 'bg-purple-100 text-purple-700' },
  discount: { name: 'Discount', icon: '🏷️', color: 'bg-orange-100 text-orange-700' }
};

export function CreateReward({ onNavigate }: CreateRewardProps) {
  const { addReward, addHistoryLog, fetchMemberships, tiers } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<RewardFormData>({
    name: '',
    rewardType: 'voucher',
    value: 0,
    description: '',
    milesCost: 0,
    validityStart: new Date().toISOString().split('T')[0],
    validityEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    conditions: '',
    membershipId: '',
    maxUsage: undefined,
    status: 'draft'
  });

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  useEffect(() => {
    if (tiers.length > 0 && !formData.membershipId) {
      setFormData(prev => ({ ...prev, membershipId: tiers[0].id }));
    }
  }, [tiers, formData.membershipId]);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof RewardFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Reward name is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (formData.value <= 0) {
      errors.value = 'Value must be greater than 0';
    }

    if (formData.milesCost !== undefined && formData.milesCost < 0) {
      errors.milesCost = 'Miles required must be greater than or equal to 0';
    }

    if (!formData.validityStart) {
      errors.validityStart = 'Start date is required';
    }

    if (!formData.validityEnd) {
      errors.validityEnd = 'End date is required';
    }

    if (formData.validityStart && formData.validityEnd && new Date(formData.validityStart) >= new Date(formData.validityEnd)) {
      errors.validityEnd = 'End date must be after start date';
    }

    if (!formData.membershipId) {
      errors.membershipId = 'Membership tier is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found.');
        onNavigate('login');
        return;
      }

      const payload = {
        rewardName: formData.name,
        description: formData.description,
        membershipId: formData.membershipId,
        rewardType: formData.rewardType,
        value: formData.value,
        milesRequired: formData.milesCost,
        validFrom: formData.validityStart,
        validUntil: formData.validityEnd,
        termsAndConditions: formData.conditions,
        maxUsage: formData.maxUsage,
        status: formData.status === 'active' ? 'public' : 'draft',
      };

      const response = await fetch('https://mileswise-be.onrender.com/api/admin/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newReward = await response.json();
      const membershipName = tiers.find(tier => tier.id === newReward.membershipId)?.displayName || 'Unknown';

      addReward({
        id: newReward.id,
        name: newReward.name,
        rewardType: newReward.rewardType,
        value: parseFloat(newReward.value),
        description: newReward.description,
        milesCost: newReward.milesCost,
        validityStart: newReward.validFrom.split('T')[0],
        validityEnd: newReward.validUntil.split('T')[0],
        conditions: newReward.termsAndConditions,
        status: newReward.status === 'public' ? 'active' : 'draft', 
        createdDate: new Date(newReward.createdAt).toISOString().split('T')[0],
        usageCount: 0, 
        maxUsage: newReward.maxUsage,
        membershipId: newReward.membershipId,
        membershipName: membershipName,
      });
      
      addHistoryLog({
        adminName: 'Admin User',
        action: `Created new ${membershipName} reward "${formData.name}" (${formData.status})`
      });

      toast.success('Reward created successfully');
      onNavigate('rewards');
    } catch (error: any) {
      toast.error(`Failed to create reward: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => onNavigate('rewards')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Rewards</span>
          </Button>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Gift className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Create New Reward</h1>
              <p className="text-gray-600">Add a new reward to your loyalty program</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle>Reward Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Reward Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter reward name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && <p className="text-sm text-red-600">{formErrors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe this reward..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className={formErrors.description ? 'border-red-500' : ''}
                />
                {formErrors.description && <p className="text-sm text-red-600">{formErrors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="membershipId">Membership Tier *</Label>
                  <Select
                    value={formData.membershipId}
                    onValueChange={(value) => handleInputChange('membershipId', value)}
                  >
                    <SelectTrigger className={formErrors.membershipId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiers.filter(tier => tier.status === 'active').map((tier) => (
                        <SelectItem key={tier.id} value={tier.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: tier.bgColor || '#cccccc' }}
                            ></div>
                            {tier.displayName}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.membershipId && <p className="text-sm text-red-600">{formErrors.membershipId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rewardType">Reward Type *</Label>
                  <Select
                    value={formData.rewardType}
                    onValueChange={(value) => handleInputChange('rewardType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(rewardTypeConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{config.icon}</span>
                            {config.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Value *</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="Reward value"
                    value={formData.value}
                    onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                    className={formErrors.value ? 'border-red-500' : ''}
                  />
                  {formErrors.value && <p className="text-sm text-red-600">{formErrors.value}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="milesCost">Miles Required</Label>
                  <Input
                    id="milesCost"
                    type="number"
                    placeholder="Miles needed"
                    value={formData.milesCost === undefined ? '' : formData.milesCost}
                    onChange={(e) => handleInputChange('milesCost', e.target.value ? parseInt(e.target.value) : undefined)}
                    className={formErrors.milesCost ? 'border-red-500' : ''}
                  />
                  {formErrors.milesCost && <p className="text-sm text-red-600">{formErrors.milesCost}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validityStart">Valid From *</Label>
                  <Input
                    id="validityStart"
                    type="date"
                    value={formData.validityStart}
                    onChange={(e) => handleInputChange('validityStart', e.target.value)}
                    className={formErrors.validityStart ? 'border-red-500' : ''}
                  />
                  {formErrors.validityStart && <p className="text-sm text-red-600">{formErrors.validityStart}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validityEnd">Valid Until *</Label>
                  <Input
                    id="validityEnd"
                    type="date"
                    value={formData.validityEnd}
                    onChange={(e) => handleInputChange('validityEnd', e.target.value)}
                    className={formErrors.validityEnd ? 'border-red-500' : ''}
                  />
                  {formErrors.validityEnd && <p className="text-sm text-red-600">{formErrors.validityEnd}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conditions">Terms & Conditions</Label>
                <Textarea
                  id="conditions"
                  placeholder="Enter terms and conditions..."
                  value={formData.conditions}
                  onChange={(e) => handleInputChange('conditions', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUsage">Max Usage (Optional)</Label>
                <Input
                  id="maxUsage"
                  type="number"
                  placeholder="Unlimited"
                  value={formData.maxUsage || ''}
                  onChange={(e) => handleInputChange('maxUsage', parseInt(e.target.value) || undefined)}
                />
                <p className="text-xs text-gray-500">Leave empty for unlimited usage</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Publish</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Draft rewards are not visible to members. Published rewards are active immediately.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Creating...' : 'Create Reward'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate('rewards')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}