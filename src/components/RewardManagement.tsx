import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAppContext } from '../contexts/AppContext';
import { 
  Gift, 
  Plus, 
  Edit, 
  Trash2, 
  Search,  
  CheckCircle,
  Clock,
  XCircle,
  Crown
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface RewardManagementProps {
  onNavigate: (page: string, subPage?: string, id?: string) => void;
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

export function RewardManagement({ onNavigate }: RewardManagementProps) {
  const { rewards, deleteReward, updateReward, addHistoryLog } = useAppContext();
  const [activeTier, setActiveTier] = useState<'all' | 'silver' | 'gold' | 'platinum' | 'diamond'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'draft'>('all');

  const handleEdit = (rewardId: string) => {
    onNavigate('rewards', 'edit', rewardId);
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
          
          <Button 
            onClick={() => onNavigate('rewards', 'create')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Reward
          </Button>
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
                <Gift className="w-5 h-5 text-purple-600" />
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
                <TabsTrigger value="all" className="text-sm">
                  All Tiers ({filteredRewards.length})
                </TabsTrigger>
                {Object.entries(tierConfig).map(([key, config]) => (
                  <TabsTrigger key={key} value={key} className="text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: config.bgColor }}
                      ></div>
                      {config.name} ({rewardsByTier[key as keyof typeof rewardsByTier].length})
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="all" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRewards.map((reward) => (
                  <Card key={reward.id} className="hover:shadow-md transition-shadow border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge className={tierConfig[reward.tier].color}>
                            {tierConfig[reward.tier].name}
                          </Badge>
                          {getStatusIcon(reward.status)}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(reward.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(reward.id, reward.name)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-medium text-gray-900">{reward.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{reward.description}</p>
                        
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-blue-600 font-medium">
                            {formatValue(reward.type, reward.value)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {(reward.milesRequired || reward.pointsRequired || 0).toLocaleString()} miles
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Used: {reward.usageCount || 0} times</span>
                          {reward.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => publishReward(reward.id, reward.name)}
                              className="h-6 text-xs bg-blue-600 hover:bg-blue-700"
                            >
                              Publish
                            </Button>
                          )}
                          {reward.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleRewardStatus(reward.id, reward.status, reward.name)}
                              className="h-6 text-xs"
                            >
                              Unpublish
                            </Button>
                          )}
                          {reward.status === 'inactive' && (
                            <Button
                              size="sm"
                              onClick={() => toggleRewardStatus(reward.id, reward.status, reward.name)}
                              className="h-6 text-xs bg-green-600 hover:bg-green-700"
                            >
                              Publish
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredRewards.length === 0 && (
                <div className="text-center py-12">
                  <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No rewards found matching your criteria.</p>
                </div>
              )}
            </TabsContent>

            {Object.entries(tierConfig).map(([tierKey, config]) => (
              <TabsContent key={tierKey} value={tierKey} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewardsByTier[tierKey as keyof typeof rewardsByTier].map((reward) => (
                    <Card key={reward.id} className="hover:shadow-md transition-shadow border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Badge className={config.color}>
                              {config.name}
                            </Badge>
                            {getStatusIcon(reward.status)}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(reward.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(reward.id, reward.name)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-medium text-gray-900">{reward.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{reward.description}</p>
                          
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-blue-600 font-medium">
                              {formatValue(reward.type, reward.value)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {(reward.milesRequired || reward.pointsRequired || 0).toLocaleString()} miles
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Used: {reward.usageCount || 0} times</span>
                            {reward.status === 'draft' && (
                              <Button
                                size="sm"
                                onClick={() => publishReward(reward.id, reward.name)}
                                className="h-6 text-xs bg-blue-600 hover:bg-blue-700"
                              >
                                Publish
                              </Button>
                            )}
                            {reward.status === 'active' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleRewardStatus(reward.id, reward.status, reward.name)}
                                className="h-6 text-xs"
                              >
                                Unpublish
                              </Button>
                            )}
                            {reward.status === 'inactive' && (
                              <Button
                                size="sm"
                                onClick={() => toggleRewardStatus(reward.id, reward.status, reward.name)}
                                className="h-6 text-xs bg-green-600 hover:bg-green-700"
                              >
                                Publish
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {rewardsByTier[tierKey as keyof typeof rewardsByTier].length === 0 && (
                  <div className="text-center py-12">
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: config.bgColor + '40' }}
                    >
                      <Crown className="w-8 h-8" style={{ color: config.textColor }} />
                    </div>
                    <p className="text-gray-500">No {config.name} tier rewards found.</p>
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