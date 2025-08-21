import React, { useState } from 'react';
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
  type: 'voucher' | 'cashback' | 'gift' | 'discount';
  value: number;
  description: string;
  milesRequired: number;
  validityStart: string;
  validityEnd: string;
  conditions: string;
  tier: 'silver' | 'gold' | 'platinum' | 'diamond';
  maxUsage?: number;
  status: 'draft' | 'active';
}

const tierConfig = {
  silver: { 
    name: 'Silver', 
    color: 'bg-gray-200 text-gray-700 border-gray-300',
    bgColor: '#C0C0C0',
    textColor: '#4A4A4A' 
  },
  gold: { 
    name: 'Gold', 
    color: 'bg-yellow-200 text-yellow-700 border-yellow-300',
    bgColor: '#FFD700',
    textColor: '#B8860B' 
  },
  platinum: { 
    name: 'Platinum', 
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    bgColor: '#E5E4E2',
    textColor: '#8B8680' 
  },
  diamond: { 
    name: 'Diamond', 
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    bgColor: '#B9F2FF',
    textColor: '#0891B2' 
  }
};

const rewardTypeConfig = {
  voucher: { name: 'Voucher', icon: '🎫', color: 'bg-blue-100 text-blue-700' },
  cashback: { name: 'Cashback', icon: '💰', color: 'bg-green-100 text-green-700' },
  gift: { name: 'Gift', icon: '🎁', color: 'bg-purple-100 text-purple-700' },
  discount: { name: 'Discount', icon: '🏷️', color: 'bg-orange-100 text-orange-700' }
};

export function CreateReward({ onNavigate }: CreateRewardProps) {
  const { addReward, addHistoryLog } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<RewardFormData>({
    name: '',
    type: 'voucher',
    value: 0,
    description: '',
    milesRequired: 0,
    validityStart: new Date().toISOString().split('T')[0],
    validityEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    conditions: '',
    tier: 'silver',
    maxUsage: undefined,
    status: 'draft'
  });

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

    if (formData.milesRequired <= 0) {
      errors.milesRequired = 'Miles required must be greater than 0';
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
      await new Promise(resolve => setTimeout(resolve, 1000));

      addReward({
        ...formData,
        status: formData.status
      });
      
      addHistoryLog({
        adminName: 'Admin User',
        action: `Created new ${tierConfig[formData.tier].name} reward "${formData.name}" (${formData.status})`
      });

      toast.success('Reward created successfully');
      onNavigate('rewards');
    } catch (error) {
      toast.error('Failed to create reward');
    } finally {
      setIsLoading(false);
    }
  };

  const formatValue = (type: string, value: number) => {
    switch (type) {
      case 'cashback':
      case 'voucher':
        return `$${value}`;
      case 'discount':
        return `${value}%`;
      default:
        return value.toString();
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
                  <Label htmlFor="tier">Tier *</Label>
                  <Select
                    value={formData.tier}
                    onValueChange={(value) => handleInputChange('tier', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(tierConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: config.bgColor }}
                            ></div>
                            {config.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Reward Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
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
                  <Label htmlFor="milesRequired">Miles Required *</Label>
                  <Input
                    id="milesRequired"
                    type="number"
                    placeholder="Miles needed"
                    value={formData.milesRequired}
                    onChange={(e) => handleInputChange('milesRequired', parseInt(e.target.value) || 0)}
                    className={formErrors.milesRequired ? 'border-red-500' : ''}
                  />
                  {formErrors.milesRequired && <p className="text-sm text-red-600">{formErrors.milesRequired}</p>}
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