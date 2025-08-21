import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { useAppContext } from '../contexts/AppContext';
import { Search, Filter, Plus, Edit, UserX, Trash2, Award, Target } from 'lucide-react';
import { toast } from "sonner";

export function MemberManagement() {
  const { members, setMembers, addHistoryLog } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    tier: 'bronze',
    totalQualifyingMiles: '',
    totalAwardMiles: '',
    status: 'active' as 'active' | 'inactive'
  });

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTier = tierFilter === 'all' || member.tier === tierFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesTier && matchesStatus;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-gray-100 text-gray-600';
      case 'gold': return 'bg-yellow-200 text-yellow-700';
      case 'silver': return 'bg-gray-200 text-gray-700';
      case 'diamond': return 'bg-cyan-100 text-cyan-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email || !newMember.totalQualifyingMiles || !newMember.totalAwardMiles) {
      toast.error('Please fill in all required fields');
      return;
    }

    const member = {
      id: `M${Date.now().toString().slice(-3)}`,
      name: newMember.name,
      email: newMember.email,
      tier: newMember.tier,
      totalQualifyingMiles: parseInt(newMember.totalQualifyingMiles),
      totalAwardMiles: parseInt(newMember.totalAwardMiles),
      status: newMember.status
    };

    setMembers([...members, member]);
    addHistoryLog({
      adminName: 'Admin User',
      action: `Added new member: ${member.name} (${member.email})`
    });

    toast.success('Member added successfully');
    setIsAddDialogOpen(false);
    setNewMember({
      name: '',
      email: '',
      tier: 'bronze',
      totalQualifyingMiles: '',
      totalAwardMiles: '',
      status: 'active'
    });
  };

  const handleEditMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setNewMember({
        name: member.name,
        email: member.email,
        tier: member.tier,
        totalQualifyingMiles: member.totalQualifyingMiles.toString(),
        totalAwardMiles: member.totalAwardMiles.toString(),
        status: member.status
      });
      setSelectedMember(memberId);
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateMember = () => {
    if (!selectedMember || !newMember.name || !newMember.email || !newMember.totalQualifyingMiles || !newMember.totalAwardMiles) {
      toast.error('Please fill in all required fields');
      return;
    }

    setMembers(members.map(member => 
      member.id === selectedMember 
        ? {
            ...member,
            name: newMember.name,
            email: newMember.email,
            tier: newMember.tier,
            totalQualifyingMiles: parseInt(newMember.totalQualifyingMiles),
            totalAwardMiles: parseInt(newMember.totalAwardMiles),
            status: newMember.status
          }
        : member
    ));

    addHistoryLog({
      adminName: 'Admin User',
      action: `Updated member: ${newMember.name} (${newMember.email})`
    });

    toast.success('Member updated successfully');
    setIsEditDialogOpen(false);
    setSelectedMember(null);
    setNewMember({
      name: '',
      email: '',
      tier: 'bronze',
      totalQualifyingMiles: '',
      totalAwardMiles: '',
      status: 'active'
    });
  };

  const handleDeactivateMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setMembers(members.map(m => 
        m.id === memberId 
          ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' }
          : m
      ));

      addHistoryLog({
        adminName: 'Admin User',
        action: `${member.status === 'active' ? 'Deactivated' : 'Activated'} member: ${member.name}`
      });

      toast.success(`Member ${member.status === 'active' ? 'deactivated' : 'activated'} successfully`);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member && window.confirm(`Are you sure you want to remove ${member.name}?`)) {
      setMembers(members.filter(m => m.id !== memberId));
      
      addHistoryLog({
        adminName: 'Admin User',
        action: `Removed member: ${member.name} (${member.email})`
      });

      toast.success('Member removed successfully');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Member Management</h2>
          <p className="text-muted-foreground">Manage loyalty program members</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    placeholder="john@email.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tier">Tier</Label>
                  <Select value={newMember.tier} onValueChange={(value) => setNewMember({...newMember, tier: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                      <SelectItem value="diamond">Diamond</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="qualifyingMiles">Qualifying Miles *</Label>
                  <Input
                    id="qualifyingMiles"
                    type="number"
                    value={newMember.totalQualifyingMiles}
                    onChange={(e) => setNewMember({...newMember, totalQualifyingMiles: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="awardMiles">Award Miles *</Label>
                  <Input
                    id="awardMiles"
                    type="number"
                    value={newMember.totalAwardMiles}
                    onChange={(e) => setNewMember({...newMember, totalAwardMiles: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newMember.status} onValueChange={(value: 'active' | 'inactive') => setNewMember({...newMember, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddMember} className="w-full">
                Add Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, email, or member ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
                <SelectItem value="diamond">Diamond</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Current Tier</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    Total Qualifying Miles
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Total Award Miles
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-mono text-sm">{member.id}</TableCell>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge className={getTierColor(member.tier)}>
                      {member.tier.charAt(0).toUpperCase() + member.tier.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        {member.totalQualifyingMiles.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-green-600" />
                      <span className="font-medium text-green-900">
                        {member.totalAwardMiles.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(member.status)}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditMember(member.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeactivateMember(member.id)}
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredMembers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No members found matching your search criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-tier">Tier</Label>
                <Select value={newMember.tier} onValueChange={(value) => setNewMember({...newMember, tier: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-qualifyingMiles">
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Qualifying Miles *
                  </div>
                </Label>
                <Input
                  id="edit-qualifyingMiles"
                  type="number"
                  value={newMember.totalQualifyingMiles}
                  onChange={(e) => setNewMember({...newMember, totalQualifyingMiles: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-awardMiles">
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Award Miles *
                  </div>
                </Label>
                <Input
                  id="edit-awardMiles"
                  type="number"
                  value={newMember.totalAwardMiles}
                  onChange={(e) => setNewMember({...newMember, totalAwardMiles: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={newMember.status} onValueChange={(value: 'active' | 'inactive') => setNewMember({...newMember, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleUpdateMember} className="w-full">
              Update Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
}