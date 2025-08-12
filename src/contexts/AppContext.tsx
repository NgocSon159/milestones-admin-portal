import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ClaimRequest {
  id: string;
  claimNumber: string;
  memberName: string;
  memberEmail: string;
  email: string;
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  flightInfo?: string;
  attachments?: string[];
  miles?: number;
  rejectionReason?: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  tier: string;
  totalMiles: number;
  status: 'active' | 'inactive';
}

interface HistoryLog {
  id: string;
  adminName: string;
  action: string;
  timestamp: string;
  requestId?: string;
}

interface Reward {
  id: string;
  name: string;
  type: 'voucher' | 'cashback' | 'gift' | 'discount';
  value: number;
  description: string;
  pointsRequired: number;
  validityStart: string;
  validityEnd: string;
  conditions: string;
  status: 'active' | 'inactive' | 'draft';
  createdDate: string;
  usageCount: number;
  maxUsage?: number;
  tier: 'silver' | 'gold' | 'platinum' | 'diamond';
  icon: string;
  maxRewardsPerMonth?: number;
  tierBonus?: number;
}

interface TierConfig {
  id: string;
  name: 'silver' | 'gold' | 'platinum' | 'diamond';
  displayName: string;
  color: string;
  bgColor: string;
  textColor: string; 
  milesRequired: number;
  description: string;
  benefits: string[];
  autoRewards: string[];
  status: 'active' | 'inactive';
  createdDate: string;
  memberCount: number;
  maxRewardsPerMonth: number;
  tierBonus: number;
}

interface AppContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  login: () => void;
  logout: () => void;
  claimRequests: ClaimRequest[];
  setClaimRequests: (requests: ClaimRequest[]) => void;
  members: Member[];
  setMembers: (members: Member[]) => void;
  historyLogs: HistoryLog[];
  setHistoryLogs: (logs: HistoryLog[]) => void;
  rewards: Reward[];
  setRewards: (rewards: Reward[]) => void;
  tiers: TierConfig[];
  setTiers: (tiers: TierConfig[]) => void;
  updateClaimRequest: (id: string, updates: Partial<ClaimRequest>) => void;
  addHistoryLog: (log: Omit<HistoryLog, 'id' | 'timestamp'>) => void;
  addReward: (reward: Omit<Reward, 'id' | 'createdDate' | 'usageCount'>) => void;
  updateReward: (id: string, updates: Partial<Reward>) => void;
  deleteReward: (id: string) => void;
  addTier: (tier: Omit<TierConfig, 'id' | 'createdDate' | 'memberCount'>) => void;
  updateTier: (id: string, updates: Partial<TierConfig>) => void;
  deleteTier: (id: string) => void;
  updateMemberTier: (memberId: string, newTier: string, miles: number) => void;
  checkAndAssignRewards: (memberId: string, newMiles: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [claimRequests, setClaimRequests] = useState<ClaimRequest[]>([
    {
      id: '1',
      claimNumber: 'LM-2025-001',
      memberName: 'John Smith',
      memberEmail: 'john.smith@email.com',
      email: 'john.smith@email.com',
      submissionDate: 'Jan 15, 2025',
      status: 'pending',
      reason: 'Flight delay compensation',
      flightInfo: 'VN123 - HAN to SGN',
      miles: 2500
    },
    {
      id: '2',
      claimNumber: 'LM-2025-002',
      memberName: 'Sarah Johnson',
      memberEmail: 'sarah.j@email.com',
      email: 'sarah.j@email.com',
      submissionDate: 'Jan 14, 2025',
      status: 'approved',
      reason: 'Missing miles credit',
      flightInfo: 'QR456 - SGN to DOH',
      miles: 5000
    },
    {
      id: '3',
      claimNumber: 'LM-2025-003',
      memberName: 'Mike Davis',
      memberEmail: 'mike.davis@email.com',
      email: 'mike.davis@email.com',
      submissionDate: 'Jan 13, 2025',
      status: 'pending',
      reason: 'Upgrade miles credit',
      flightInfo: 'EK789 - HAN to DXB',
      miles: 1500
    },
    {
      id: '4',
      claimNumber: 'LM-2025-004',
      memberName: 'Lisa Chen',
      memberEmail: 'lisa.chen@email.com',
      email: 'lisa.chen@email.com',
      submissionDate: 'Jan 12, 2025',
      status: 'rejected',
      reason: 'Duplicate miles request',
      flightInfo: 'BA202 - SGN to LHR',
      miles: 3200,
      rejectionReason: 'Miles already credited for this flight'
    },
    {
      id: '5',
      claimNumber: 'LM-2025-005',
      memberName: 'David Wilson',
      memberEmail: 'david.w@email.com',
      email: 'david.w@email.com',
      submissionDate: 'Jan 11, 2025',
      status: 'approved',
      reason: 'Missing partner airline miles',
      flightInfo: 'SQ101 - SGN to SIN',
      miles: 1800
    }
  ]);

  const [tiers, setTiers] = useState<TierConfig[]>([
    {
      id: 'T001',
      name: 'silver',
      displayName: 'Silver',
      color: 'bg-gray-200 text-gray-700',
      bgColor: '#C0C0C0',
      textColor: '#4A4A4A',
      milesRequired: 25000,
      description: 'Mid-tier membership with enhanced benefits',
      benefits: ['Priority customer support', 'Free seat selection', '10% bonus miles on flights'],
      autoRewards: ['R001'],
      status: 'active',
      createdDate: '2025-01-01',
      memberCount: 85,
      maxRewardsPerMonth: 3,
      tierBonus: 10
    },
    {
      id: 'T002',
      name: 'gold',
      displayName: 'Gold',
      color: 'bg-yellow-200 text-yellow-700',
      bgColor: '#FFD700',
      textColor: '#B8860B',
      milesRequired: 50000,
      description: 'Premium membership with exclusive privileges',
      benefits: ['Dedicated customer support', 'Free seat selection', '25% bonus miles', 'Priority boarding'],
      autoRewards: ['R001', 'R002'],
      status: 'active',
      createdDate: '2025-01-01',
      memberCount: 45,
      maxRewardsPerMonth: 5,
      tierBonus: 25
    },
    {
      id: 'T003',
      name: 'platinum',
      displayName: 'Platinum',
      color: 'bg-gray-100 text-gray-600',
      bgColor: '#E5E4E2',
      textColor: '#8B8680',
      milesRequired: 100000,
      description: 'Elite membership with luxury benefits',
      benefits: ['Personal concierge service', 'Unlimited seat selection', '50% bonus miles', 'Priority everything'],
      autoRewards: ['R001', 'R002', 'R003'],
      status: 'active',
      createdDate: '2025-01-01',
      memberCount: 20,
      maxRewardsPerMonth: 8,
      tierBonus: 50
    },
    {
      id: 'T004',
      name: 'diamond',
      displayName: 'Diamond',
      color: 'bg-cyan-100 text-cyan-700',
      bgColor: '#B9F2FF',
      textColor: '#0891B2',
      milesRequired: 200000,
      description: 'Ultimate tier with premium privileges',
      benefits: ['White-glove service', 'Unlimited everything', '100% bonus miles', 'Exclusive access'],
      autoRewards: ['R001', 'R002', 'R003', 'R004'],
      status: 'active',
      createdDate: '2025-01-01',
      memberCount: 8,
      maxRewardsPerMonth: 15,
      tierBonus: 100
    }
  ]);

  const [members, setMembers] = useState<Member[]>([
    { id: 'M001', name: 'John Smith', email: 'john.smith@email.com', tier: 'gold', totalMiles: 45000, status: 'active' },
    { id: 'M002', name: 'Sarah Johnson', email: 'sarah.j@email.com', tier: 'platinum', totalMiles: 82000, status: 'active' },
    { id: 'M003', name: 'Mike Davis', email: 'mike.davis@email.com', tier: 'silver', totalMiles: 28000, status: 'active' },
    { id: 'M004', name: 'Lisa Chen', email: 'lisa.chen@email.com', tier: 'bronze', totalMiles: 15000, status: 'inactive' }
  ]);

  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([
    { id: 'H001', adminName: 'Admin User', action: 'Approved claim request', timestamp: '2025-01-15 10:30:00', requestId: 'LM-2025-002' },
    { id: 'H002', adminName: 'Admin User', action: 'Added manual miles', timestamp: '2025-01-15 09:15:00' },
    { id: 'H003', adminName: 'Admin User', action: 'Rejected claim request', timestamp: '2025-01-14 16:45:00', requestId: 'LM-2025-001' }
  ]);

  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: 'R001',
      name: 'Silver Flight Voucher',
      type: 'voucher',
      value: 50,
      description: '$50 flight discount voucher for Silver members',
      pointsRequired: 10000,
      validityStart: '2025-01-01',
      validityEnd: '2025-12-31',
      conditions: 'Valid for domestic flights only. Cannot be combined with other offers.',
      status: 'active',
      createdDate: '2025-01-10',
      usageCount: 25,
      maxUsage: 100,
      tier: 'silver',
      icon: 'Plane',
      maxRewardsPerMonth: 2,
      tierBonus: 10
    },
    {
      id: 'R002',
      name: 'Gold Lounge Access',
      type: 'gift',
      value: 1,
      description: 'Complimentary airport lounge access for Gold members',
      pointsRequired: 15000,
      validityStart: '2025-01-01',
      validityEnd: '2025-06-30',
      conditions: 'Valid at selected partner lounges. Must present digital voucher.',
      status: 'active',
      createdDate: '2025-01-08',
      usageCount: 12,
      maxUsage: 50,
      tier: 'gold',
      icon: 'Crown',
      maxRewardsPerMonth: 3,
      tierBonus: 25
    },
    {
      id: 'R003',
      name: 'Platinum Cashback',
      type: 'cashback',
      value: 100,
      description: '$100 cashback for Platinum members',
      pointsRequired: 25000,
      validityStart: '2025-02-01',
      validityEnd: '2025-12-31',
      conditions: 'Minimum purchase of $500 required. Cashback processed within 7 days.',
      status: 'active',
      createdDate: '2025-01-05',
      usageCount: 8,
      maxUsage: 30,
      tier: 'platinum',
      icon: 'DollarSign',
      maxRewardsPerMonth: 5,
      tierBonus: 50
    },
    {
      id: 'R004',
      name: 'Diamond Elite Package',
      type: 'gift',
      value: 500,
      description: 'Exclusive Diamond member luxury package',
      pointsRequired: 50000,
      validityStart: '2025-03-01',
      validityEnd: '2025-12-31',
      conditions: 'Limited time exclusive offer for Diamond tier members only.',
      status: 'draft',
      createdDate: '2025-01-03',
      usageCount: 0,
      maxUsage: 10,
      tier: 'diamond',
      icon: 'Gem',
      maxRewardsPerMonth: 10,
      tierBonus: 100
    },
    {
      id: 'R005',
      name: 'Gold Shopping Discount',
      type: 'discount',
      value: 20,
      description: '20% discount on selected partner stores',
      pointsRequired: 12000,
      validityStart: '2025-01-15',
      validityEnd: '2025-06-15',
      conditions: 'Valid at participating retailers. See terms for details.',
      status: 'active',
      createdDate: '2025-01-15',
      usageCount: 18,
      maxUsage: 200,
      tier: 'gold',
      icon: 'ShoppingBag',
      maxRewardsPerMonth: 4,
      tierBonus: 25
    }
  ]);

  const updateClaimRequest = (id: string, updates: Partial<ClaimRequest>) => {
    setClaimRequests(prev => 
      prev.map(request => 
        request.id === id ? { ...request, ...updates } : request
      )
    );
  };

  const addHistoryLog = (log: Omit<HistoryLog, 'id' | 'timestamp'>) => {
    const newLog: HistoryLog = {
      ...log,
      id: `H${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
    setHistoryLogs(prev => [newLog, ...prev]);
  };

  const addReward = (reward: Omit<Reward, 'id' | 'createdDate' | 'usageCount'>) => {
    const newReward: Reward = {
      ...reward,
      id: `R${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      usageCount: 0
    };
    setRewards(prev => [newReward, ...prev]);
  };

  const updateReward = (id: string, updates: Partial<Reward>) => {
    setRewards(prev => 
      prev.map(reward => 
        reward.id === id ? { ...reward, ...updates } : reward
      )
    );
  };

  const deleteReward = (id: string) => {
    setRewards(prev => prev.filter(reward => reward.id !== id));
  };

  const addTier = (tier: Omit<TierConfig, 'id' | 'createdDate' | 'memberCount'>) => {
    const newTier: TierConfig = {
      ...tier,
      id: `T${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      memberCount: 0
    };
    setTiers(prev => [newTier, ...prev]);
  };

  const updateTier = (id: string, updates: Partial<TierConfig>) => {
    setTiers(prev => 
      prev.map(tier => 
        tier.id === id ? { ...tier, ...updates } : tier
      )
    );
  };

  const deleteTier = (id: string) => {
    setTiers(prev => prev.filter(tier => tier.id !== id));
  };

  const updateMemberTier = (memberId: string, newTier: string, miles: number) => {
    setMembers(prev =>
      prev.map(member =>
        member.id === memberId
          ? { ...member, tier: newTier, totalMiles: miles }
          : member
      )
    );
  };

  const checkAndAssignRewards = (memberId: string, newMiles: number) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    // Determine new tier based on miles
    const sortedTiers = [...tiers]
      .filter(t => t.status === 'active')
      .sort((a, b) => b.milesRequired - a.milesRequired);

    const newTier = sortedTiers.find(tier => newMiles >= tier.milesRequired);
    
    if (newTier && newTier.name !== member.tier) {
      // Update member tier
      updateMemberTier(memberId, newTier.name, newMiles);

      // Auto-assign rewards for this tier
      const autoRewards = rewards.filter(reward => 
        newTier.autoRewards.includes(reward.id) && 
        reward.status === 'active'
      );

      autoRewards.forEach(reward => {
        addHistoryLog({
          adminName: 'System Auto-Assign',
          action: `Auto-assigned reward "${reward.name}" to ${member.name} (${newTier.displayName} tier achieved)`
        });
      });

      addHistoryLog({
        adminName: 'System Auto-Tier',
        action: `${member.name} automatically upgraded to ${newTier.displayName} tier (${newMiles.toLocaleString()} miles)`
      });
    }
  };

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      setIsAuthenticated,
      login,
      logout,
      claimRequests,
      setClaimRequests,
      members,
      setMembers,
      historyLogs,
      setHistoryLogs,
      rewards,
      setRewards,
      tiers,
      setTiers,
      updateClaimRequest,
      addHistoryLog,
      addReward,
      updateReward,
      deleteReward,
      addTier,
      updateTier,
      deleteTier,
      updateMemberTier,
      checkAndAssignRewards
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}