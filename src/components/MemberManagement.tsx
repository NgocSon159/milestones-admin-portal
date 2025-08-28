import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { useAppContext } from '../contexts/AppContext';
import { Search, Plus, Edit, UserX, Trash2, Award, Target } from 'lucide-react';
import { toast } from "sonner";
import { useEffect } from 'react';

interface Membership {
  id: string;
  name: string;
  description: string;
  milesRequired: number;
  color: string;
}

interface MemberAPIResponse {
  memberId: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  dob: string;
  streetAddress: string;
  city: string;
  country: string;
  gender: string;
  postalCode: string;
  isAcceptRule: boolean;
  isAcceptMKT: boolean;
  totalBonusMiles: number;
  totalQuantifyingMiles: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  memberships: Membership[];
}

interface Member {
  id: string;
  name: string;
  email: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  totalQualifyingMiles: number;
  totalAwardMiles: number;
  status: 'active' | 'inactive';
}

export function MemberManagement() {
  const { members, setMembers, addHistoryLog } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // New loading state
  
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

  const handleDeactivateMember = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authorization token not found. Please log in again.');
      return;
    }

    const newIsActiveStatus = member.status !== 'active';

    try {
      const response = await fetch(`https://mileswise-be.onrender.com/api/admin/members/${memberId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newIsActiveStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setMembers(members.map(m => 
        m.id === memberId 
          ? { ...m, status: newIsActiveStatus ? 'active' : 'inactive' }
          : m
      ));

      addHistoryLog({
        adminName: 'Admin User',
        action: `${newIsActiveStatus ? 'Activated' : 'Deactivated'} member: ${member.name}`
      });

      toast.success(`Member ${newIsActiveStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating member status:', error);
      toast.error('Failed to update member status.');
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

  const fetchMembers = async () => {
    const token = localStorage.getItem('token'); 
    if (!token) {
      toast.error('Authorization token not found. Please log in again.');
      return;
    }

    try {
      setIsLoading(true); // Set loading to true before fetching
      const response = await fetch('https://mileswise-be.onrender.com/api/admin/members', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MemberAPIResponse[] = await response.json();
      const formattedMembers: Member[] = data.map(apiMember => ({
        id: apiMember.memberId, // Using email as a unique ID for now, as API response doesn't have a direct 'id' field for Member
        name: apiMember.fullName,
        email: apiMember.email,
        tier: apiMember.memberships[0]?.name.toLowerCase() as 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' || 'bronze',
        totalQualifyingMiles: apiMember.totalQuantifyingMiles,
        totalAwardMiles: apiMember.totalBonusMiles,
        status: apiMember.isActive ? 'active' : 'inactive',
      }));
      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to fetch members.');
    } finally {
      setIsLoading(false); // Set loading to false after fetching (success or error)
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []); 

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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy thành viên phù hợp với tiêu chí tìm kiếm của bạn.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
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
                ))
              )}
            </TableBody>
          </Table>
            
            {/* {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No members found matching your search criteria.
              </div>
            )} */}
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