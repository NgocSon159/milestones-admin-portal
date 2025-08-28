import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Switch } from './ui/switch';
import { useAppContext } from '../contexts/AppContext';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Crown, 
} from 'lucide-react';
import { toast } from "sonner";
import { TierConfig as AppTierConfig } from '../contexts/AppContext';

const getTailwindColorClass = (hexColor: string | undefined): string => {
  if (!hexColor) return 'bg-gray-100 text-gray-800'; // Default color

  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Basic logic to determine a suitable Tailwind class
  // This is a simplified approach, a more robust solution might use a color library
  if (r > 200 && g > 200) return 'bg-yellow-100 text-yellow-800';
  if (r > 200 && b > 200) return 'bg-purple-100 text-purple-800';
  if (g > 200 && b > 200) return 'bg-emerald-100 text-emerald-800';
  if (r > 200) return 'bg-red-100 text-red-800';
  if (g > 200) return 'bg-green-100 text-green-800';
  if (b > 200) return 'bg-blue-100 text-blue-800';
  
  return 'bg-gray-100 text-gray-800'; // Default fallback
};

interface TierFormData {
  name: string;
  displayName: string;
  color: string; // This will now be the hex color
  milesRequired: number;
  description: string;
  benefits: string[];
}

export function TierConfig() {
  const { tiers, addTier, updateTier, deleteTier, addHistoryLog } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [newBenefit, setNewBenefit] = useState('');

  const [formData, setFormData] = useState<TierFormData>({
    name: '',
    displayName: '',
    color: '#CD7F32', // Default to a hex color
    milesRequired: 0,
    description: '',
    benefits: []
  });

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      color: '#CD7F32', // Default to a hex color
      milesRequired: 0,
      description: '',
      benefits: []
    });
    setEditingTier(null);
    setNewBenefit('');
  };

  const handleInputChange = (field: keyof TierFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, newBenefit.trim()]
    }));
    setNewBenefit('');
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.displayName || formData.milesRequired < 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingTier) {
        updateTier(editingTier, {
          ...formData,
          name: formData.name.toLowerCase(),
          hexColor: formData.color, // Pass the hex color
          status: 'active',
          autoRewards: []
        });
        addHistoryLog({
          adminName: 'Admin User',
          action: `Updated tier "${formData.displayName}" (${formData.milesRequired.toLocaleString()} miles required)`
        });
        toast.success('Tier updated successfully');
      } else {
        addTier({
          ...formData,
          name: formData.name.toLowerCase(),
          hexColor: formData.color, // Pass the hex color
          status: 'active',
          autoRewards: []
        });
        addHistoryLog({
          adminName: 'Admin User',
          action: `Created new tier "${formData.displayName}" (${formData.milesRequired.toLocaleString()} miles required)`
        });
        toast.success('Tier created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save tier');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (tier: any) => {
    setFormData({
      name: tier.name,
      displayName: tier.displayName,
      color: tier.hexColor || '#CD7F32', // Use hexColor from API, default if not present
      milesRequired: tier.milesRequired,
      description: tier.description,
      benefits: tier.benefits || []
    });
    setEditingTier(tier.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (tierId: string, tierName: string) => {
    if (!confirm(`Are you sure you want to delete "${tierName}" tier?`)) return;

    try {
      deleteTier(tierId);
      addHistoryLog({
        adminName: 'Admin User',
        action: `Deleted tier "${tierName}"`
      });
      toast.success('Tier deleted successfully');
    } catch (error) {
      toast.error('Failed to delete tier');
    }
  };

  const toggleTierStatus = (tierId: string, currentStatus: string, tierName: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateTier(tierId, { status: newStatus });
    addHistoryLog({
      adminName: 'Admin User',
      action: `${newStatus === 'active' ? 'Activated' : 'Deactivated'} tier "${tierName}"`
    });
    toast.success(`Tier ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
  };

  const filteredTiers = tiers.filter(tier => {
    if (activeFilter === 'all') return true;
    return tier.status === activeFilter;
  }).sort((a, b) => a.milesRequired - b.milesRequired);

  const getColorPreview = (tier: AppTierConfig) => {
    return getTailwindColorClass(tier.hexColor);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Tier Configuration</h1>
              <p className="text-gray-600">Define membership tiers and their requirements</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTier ? 'Edit Tier' : 'Create New Tier'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tier Name *</Label>
                    <Input
                      placeholder="e.g., gold"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value.toLowerCase())}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Display Name *</Label>
                    <Input
                      placeholder="e.g., Gold"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tier Color</Label>
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Miles Required *</Label>
                    <Input
                      type="number"
                      placeholder="25000"
                      value={formData.milesRequired}
                      onChange={(e) => handleInputChange('milesRequired', parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Brief description of this tier..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Benefits</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a benefit..."
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    />
                    <Button type="button" variant="outline" onClick={addBenefit}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.benefits.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {formData.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                          <span className="text-sm">{benefit}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBenefit(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Saving...' : (editingTier ? 'Update Tier' : 'Create Tier')}
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

      {/* Tiers List */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Membership Tiers</CardTitle>
            <div className="flex space-x-2">
              {['all', 'active', 'inactive'].map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter as any)}
                  className={
                    activeFilter === filter 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "text-gray-600 hover:text-gray-900"
                  }
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTiers.map((tier) => (
              <div key={tier.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-8 rounded ${getColorPreview(tier)}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{tier.displayName}</h3>
                      {tier.hexColor && (
                        <Badge style={{ backgroundColor: tier.hexColor, color: 'white' }}>
                          {tier.hexColor}
                        </Badge>
                      )}
                      <Badge className={getColorPreview(tier)}>
                        {tier.milesRequired.toLocaleString()} miles
                      </Badge>
                      <Badge className={tier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {tier.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>{tier.description}</div>
                      <div className="flex items-center space-x-4">
                        <span>Members: <strong>{tier.memberCount}</strong></span>
                        <span>Benefits: <strong>{tier.benefits.length}</strong></span>
                      </div>
                    </div>
                    {tier.benefits.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {tier.benefits.slice(0, 3).map((benefit, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {benefit}
                          </span>
                        ))}
                        {tier.benefits.length > 3 && (
                          <span className="text-xs text-gray-500">+{tier.benefits.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={tier.status === 'active'}
                    onCheckedChange={() => toggleTierStatus(tier.id, tier.status, tier.displayName)}
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(tier)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(tier.id, tier.displayName)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredTiers.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-gray-500">No tiers found</p>
                <p className="text-gray-400 text-sm mt-1">Create your first tier to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}