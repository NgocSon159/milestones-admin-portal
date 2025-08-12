import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAppContext } from '../contexts/AppContext';
import { 
  Gift, 
  Plus, 
  Edit, 
  Trash2, 
  Search,  
  Filter,
  Eye,
  Upload,
  Calendar,
  Award,
  Users,
  TrendingUp,
  DollarSign,
  Star,
  Settings,
  CheckCircle,
  Clock,
  XCircle,
  Plane,
  Crown,
  Gem,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Heart,
  Zap,
  Target,
  Trophy,
  Ticket,
  CreditCard,
  MapPin,
  Music
} from 'lucide-react';
import { toast } from "sonner";

interface RewardFormData {
  name: string;
  type: 'voucher' | 'cashback' | 'gift' | 'discount';
  value: number;
  description: string;
  pointsRequired: number;
  validityStart: string;
  validityEnd: string;
  conditions: string;
  tier: 'silver' | 'gold' | 'platinum' | 'diamond';
  icon: string;
  maxUsage?: number;
  maxRewardsPerMonth?: number;
  tierBonus?: number;
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

const availableIcons = [
  { name: 'Plane', component: Plane, label: 'Airplane' },
  { name: 'Crown', component: Crown, label: 'Crown' },
  { name: 'DollarSign', component: DollarSign, label: 'Dollar Sign' },
  { name: 'Gem', component: Gem, label: 'Gem' },
  { name: 'ShoppingBag', component: ShoppingBag, label: 'Shopping Bag' },
  { name: 'Coffee', component: Coffee, label: 'Coffee' },
  { name: 'Car', component: Car, label: 'Car' },
  { name: 'Home', component: Home, label: 'Home' },
  { name: 'Heart', component: Heart, label: 'Heart' },
  { name: 'Zap', component: Zap, label: 'Lightning' },
  { name: 'Target', component: Target, label: 'Target' },
  { name: 'Trophy', component: Trophy, label: 'Trophy' },
  { name: 'Ticket', component: Ticket, label: 'Ticket' },
  { name: 'CreditCard', component: CreditCard, label: 'Credit Card' },
  { name: 'MapPin', component: MapPin, label: 'Map Pin' },
  { name: 'Music', component: Music, label: 'Music' },
  { name: 'Gift', component: Gift, label: 'Gift' },
  { name: 'Star', component: Star, label: 'Star' }
];

const getIconComponent = (iconName: string) => {
  const iconData = availableIcons.find(icon => icon.name === iconName);
  return iconData ? iconData.component : Gift;
};

export function RewardManagement() {
  const { rewards, tiers, addReward, updateReward, deleteReward, addHistoryLog } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<string | null>(null);
  const [activeTier, setActiveTier] = useState<'all' | 'silver' | 'gold' | 'platinum' | 'diamond'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'draft'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState<RewardFormData>({
    name: '',
    type: 'voucher',
    value: 0,
    description: '',
    pointsRequired: 0,
    validityStart: new Date().toISOString().split('T')[0],
    validityEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    conditions: '',
    tier: 'silver',
    icon: 'Gift',
    maxUsage: undefined,
    maxRewardsPerMonth: 3,
    tierBonus: 10
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'voucher',
      value: 0,
      description: '',
      pointsRequired: 0,
      validityStart: new Date().toISOString().split('T')[0],
      validityEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      conditions: '',
      tier: 'silver',
      icon: 'Gift',
      maxUsage: undefined,
      maxRewardsPerMonth: 3,
      tierBonus: 10
    });
    setEditingReward(null);
    setPreviewMode(false);
  };

  const handleInputChange = (field: keyof RewardFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || formData.pointsRequired <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingReward) {
        updateReward(editingReward, {
          ...formData,
          status: 'active'
        });
        addHistoryLog({
          adminName: 'Admin User',
          action: `Updated ${tierConfig[formData.tier].name} reward "${formData.name}"`
        });
        toast.success('Reward updated successfully');
      } else {
        addReward({
          ...formData,
          status: 'active'
        });
        addHistoryLog({
          adminName: 'Admin User',
          action: `Created new ${tierConfig[formData.tier].name} reward "${formData.name}"`
        });
        toast.success('Reward created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save reward');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (reward: any) => {
    setFormData({
      name: reward.name,
      type: reward.type,
      value: reward.value,
      description: reward.description,
      pointsRequired: reward.pointsRequired,
      validityStart: reward.validityStart,
      validityEnd: reward.validityEnd,
      conditions: reward.conditions,
      tier: reward.tier,
      icon: reward.icon,
      maxUsage: reward.maxUsage,
      maxRewardsPerMonth: reward.maxRewardsPerMonth,
      tierBonus: reward.tierBonus
    });
    setEditingReward(reward.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (rewardId: string, rewardName: string) => {
    if (!confirm(`Are you sure you want to delete "${rewardName}"?`)) return;

    try {
      deleteReward(rewardId);
      addHistoryLog({
        adminName: 'Admin User',
        action: `Deleted reward "${rewardName}"`
      });
      toast.success('Reward deleted successfully');
    } catch (error) {
      toast.error('Failed to delete reward');
    }
  };

  const toggleRewardStatus = (rewardId: string, currentStatus: string, rewardName: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateReward(rewardId, { status: newStatus });
    addHistoryLog({
      adminName: 'Admin User',
      action: `${newStatus === 'active' ? 'Activated' : 'Deactivated'} reward "${rewardName}"`
    });
    toast.success(`Reward ${newStatus === 'active' ? 'published' : 'unpublished'}`);
  };

  const publishReward = (rewardId: string, rewardName: string) => {
    updateReward(rewardId, { status: 'active' });
    addHistoryLog({
      adminName: 'Admin User',
      action: `Published reward "${rewardName}"`
    });
    toast.success('Reward published successfully');
  };

  // Filter rewards
  const filteredRewards = rewards.filter(reward => {
    const matchesTier = activeTier === 'all' || reward.tier === activeTier;
    const matchesSearch = reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reward.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reward.status === statusFilter;
    
    return matchesTier && matchesSearch && matchesStatus;
  });

  // Group rewards by tier for display
  const rewardsByTier = {
    silver: filteredRewards.filter(r => r.tier === 'silver'),
    gold: filteredRewards.filter(r => r.tier === 'gold'),
    platinum: filteredRewards.filter(r => r.tier === 'platinum'),
    diamond: filteredRewards.filter(r => r.tier === 'diamond')
  };

  // Statistics
  const stats = {
    totalRewards: rewards.length,
    activeRewards: rewards.filter(r => r.status === 'active').length,
    totalUsage: rewards.reduce((sum, r) => sum + r.usageCount, 0),
    draftRewards: rewards.filter(r => r.status === 'draft').length
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Gift className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Rewards Management</h1>
              <p className="text-gray-600">Manage tier-based rewards for your loyalty program</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Reward
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {editingReward ? 'Edit Reward' : 'Create New Reward'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Reward Name *</Label>
                      <Input
                        placeholder="Enter reward name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Description *</Label>
                      <Textarea
                        placeholder="Describe this reward..."
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tier *</Label>
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
                        <Label>Reward Type *</Label>
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
                        <Label>Value *</Label>
                        <Input
                          type="number"
                          placeholder="Reward value"
                          value={formData.value}
                          onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Points Required *</Label>
                        <Input
                          type="number"
                          placeholder="Points needed"
                          value={formData.pointsRequired}
                          onChange={(e) => handleInputChange('pointsRequired', parseInt(e.target.value) || 0)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Valid From *</Label>
                        <Input
                          type="date"
                          value={formData.validityStart}
                          onChange={(e) => handleInputChange('validityStart', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Valid Until *</Label>
                        <Input
                          type="date"
                          value={formData.validityEnd}
                          onChange={(e) => handleInputChange('validityEnd', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Advanced Settings */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Reward Icon</Label>
                      <div className="grid grid-cols-6 gap-2 p-4 border rounded-lg max-h-48 overflow-y-auto">
                        {availableIcons.map((iconData) => {
                          const IconComponent = iconData.component;
                          return (
                            <button
                              key={iconData.name}
                              type="button"
                              onClick={() => handleInputChange('icon', iconData.name)}
                              className={`p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors ${
                                formData.icon === iconData.name 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200'
                              }`}
                              title={iconData.label}
                            >
                              <IconComponent className="w-5 h-5 mx-auto" />
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500">Selected: {availableIcons.find(i => i.name === formData.icon)?.label}</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Terms & Conditions</Label>
                      <Textarea
                        placeholder="Enter terms and conditions..."
                        value={formData.conditions}
                        onChange={(e) => handleInputChange('conditions', e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Max Usage (Optional)</Label>
                        <Input
                          type="number"
                          placeholder="Unlimited"
                          value={formData.maxUsage || ''}
                          onChange={(e) => handleInputChange('maxUsage', parseInt(e.target.value) || undefined)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Max Per Month</Label>
                        <Input
                          type="number"
                          placeholder="3"
                          value={formData.maxRewardsPerMonth}
                          onChange={(e) => handleInputChange('maxRewardsPerMonth', parseInt(e.target.value) || 3)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Tier Bonus (%)</Label>
                      <Input
                        type="number"
                        placeholder="10"
                        value={formData.tierBonus}
                        onChange={(e) => handleInputChange('tierBonus', parseInt(e.target.value) || 10)}
                      />
                    </div>

                    {/* Preview Toggle */}
                    <div className="pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={previewMode}
                          onCheckedChange={setPreviewMode}
                        />
                        <Label>Preview Mode</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Panel */}
                {previewMode && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-medium mb-3">Member Preview</h3>
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          {React.createElement(getIconComponent(formData.icon), { 
                            className: "w-8 h-8 text-blue-600" 
                          })}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{formData.name || 'Reward Name'}</h4>
                            <Badge className={tierConfig[formData.tier].color}>
                              {tierConfig[formData.tier].name}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {formData.description || 'Reward description'}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-600 font-medium">
                              {formatValue(formData.type, formData.value)}
                            </span>
                            <span className="text-gray-500">
                              {formData.pointsRequired.toLocaleString()} points
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Saving...' : (editingReward ? 'Update Reward' : 'Create Reward')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Gift className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Rewards</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalRewards}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Rewards</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeRewards}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Usage</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsage}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Draft Rewards</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.draftRewards}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search rewards by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Tabs */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-0">
          <Tabs value={activeTier} onValueChange={(value: any) => setActiveTier(value)}>
            <div className="border-b px-6 py-4">
              <TabsList className="bg-gray-100">
                <TabsTrigger value="all" className="data-[state=active]:bg-white">
                  All Tiers ({filteredRewards.length})
                </TabsTrigger>
                {Object.entries(tierConfig).map(([key, config]) => (
                  <TabsTrigger 
                    key={key} 
                    value={key}
                    className="data-[state=active]:bg-white"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: config.bgColor }}
                      ></div>
                      {config.name} ({rewardsByTier[key as keyof typeof rewardsByTier].length})
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* All Tiers Tab */}
            <TabsContent value="all" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRewards.map((reward) => {
                  const IconComponent = getIconComponent(reward.icon);
                  return (
                    <div key={reward.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge className={tierConfig[reward.tier].color}>
                            {tierConfig[reward.tier].name}
                          </Badge>
                          <Badge className={rewardTypeConfig[reward.type].color}>
                            {rewardTypeConfig[reward.type].icon} {rewardTypeConfig[reward.type].name}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(reward.status)}
                          <span className="text-xs text-gray-500 capitalize">{reward.status}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{reward.name}</h3>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 line-clamp-2">{reward.description}</p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-blue-600">
                            {formatValue(reward.type, reward.value)}
                          </span>
                          <span className="text-gray-500">
                            {reward.pointsRequired.toLocaleString()} pts
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Usage: {reward.usageCount}{reward.maxUsage ? `/${reward.maxUsage}` : ''}</span>
                          <span>Valid until: {new Date(reward.validityEnd).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t">
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(reward)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(reward.id, reward.name)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={reward.status === 'active'}
                            onCheckedChange={() => toggleRewardStatus(reward.id, reward.status, reward.name)}
                            size="sm"
                          />
                          {reward.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => publishReward(reward.id, reward.name)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Publish
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {filteredRewards.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Gift className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No rewards found</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </TabsContent>

            {/* Individual Tier Tabs */}
            {Object.entries(tierConfig).map(([tierKey, tierConf]) => (
              <TabsContent key={tierKey} value={tierKey} className="p-6">
                <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: `${tierConf.bgColor}20` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium" style={{ color: tierConf.textColor }}>
                        {tierConf.name} Tier Settings
                      </h3>
                      <p className="text-sm text-gray-600">
                        Manage rewards and settings for {tierConf.name} tier members
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        Max rewards per month: <strong>
                          {tiers.find(t => t.name === tierKey)?.maxRewardsPerMonth || 3}
                        </strong>
                      </div>
                      <div className="text-sm text-gray-600">
                        Tier bonus: <strong>
                          {tiers.find(t => t.name === tierKey)?.tierBonus || 10}%
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewardsByTier[tierKey as keyof typeof rewardsByTier].map((reward) => {
                    const IconComponent = getIconComponent(reward.icon);
                    return (
                      <div key={reward.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <Badge className={rewardTypeConfig[reward.type].color}>
                            {rewardTypeConfig[reward.type].icon} {rewardTypeConfig[reward.type].name}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(reward.status)}
                            <span className="text-xs text-gray-500 capitalize">{reward.status}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 mb-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <IconComponent className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{reward.name}</h3>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 line-clamp-2">{reward.description}</p>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-blue-600">
                              {formatValue(reward.type, reward.value)}
                            </span>
                            <span className="text-gray-500">
                              {reward.pointsRequired.toLocaleString()} pts
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Usage: {reward.usageCount}{reward.maxUsage ? `/${reward.maxUsage}` : ''}</span>
                            <span>Valid until: {new Date(reward.validityEnd).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t">
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(reward)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(reward.id, reward.name)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={reward.status === 'active'}
                              onCheckedChange={() => toggleRewardStatus(reward.id, reward.status, reward.name)}
                              size="sm"
                            />
                            {reward.status === 'draft' && (
                              <Button
                                size="sm"
                                onClick={() => publishReward(reward.id, reward.name)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Publish
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {rewardsByTier[tierKey as keyof typeof rewardsByTier].length === 0 && (
                  <div className="text-center py-12">
                    <div 
                      className="p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: `${tierConf.bgColor}40` }}
                    >
                      <Gift className="w-8 h-8" style={{ color: tierConf.textColor }} />
                    </div>
                    <p className="text-gray-500">No {tierConf.name} rewards found</p>
                    <p className="text-gray-400 text-sm mt-1">Create your first {tierConf.name} tier reward</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}