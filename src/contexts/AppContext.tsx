import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useEffect } from 'react';

interface FlightDetails {
  flightNumber: string;
  route: string;
  origin: string;
  destination: string;
  class: string;
  distance: number;
  baseQualifyingMiles: number;
  classMultiplier: number;
  bonusMiles: number;
  qualifyingMiles: number;
  totalMiles: number;
}

interface ClaimRequest {
  id: string;
  claimNumber: string;
  memberName: string;
  memberEmail: string;
  email: string;
  submissionDate: string;
  status: 'reviewing' | 'approved' | 'rejected';
  reason?: string;
  flightInfo?: string;
  flightDetails?: FlightDetails;
  attachments?: string[];
  miles?: number;
  rejectionReason?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  tier: string;
  totalQualifyingMiles: number;
  totalAwardMiles: number;
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
  rewardType: 'voucher' | 'cashback' | 'gift' | 'discount';
  value: number;
  description: string;
  milesCost: number;
  validityStart: string;
  validityEnd: string;
  conditions: string;
  status: 'active' | 'inactive' | 'draft';
  createdDate: string;
  usageCount: number;
  maxUsage?: number;
  membershipId: string;
  membershipName: string;
}

export interface TierConfig {
  id: string;
  name: string;
  displayName: string;
  color: string; // Tailwind CSS class
  hexColor?: string; // Hex color from API
  milesRequired: number;
  description: string;
  benefits: string[];
  autoRewards?: string[];
  status: 'active' | 'inactive';
  createdDate: string;
  memberCount?: number;
  maxRewardsPerMonth?: number;
  tierBonus?: number;
}

interface AppContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  login: (token: string) => void;
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
  addReward: (reward: Reward) => void;
  updateReward: (id: string, updates: Partial<Reward>) => void;
  deleteReward: (id: string) => void;
  addTier: (tier: Omit<TierConfig, 'id' | 'createdDate' | 'memberCount'>) => void;
  updateTier: (id: string, updates: Partial<TierConfig>) => void;
  deleteTier: (id: string) => void;
  updateMemberTier: (memberId: string, newTier: string, miles: number, newAwardMiles?: number) => void;
  checkAndAssignRewards: (memberId: string, newMiles: number, newAwardMiles?: number) => void;
  fetchRewards: () => Promise<void>;
  fetchMemberships: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    return !!token;
  });

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
      flightInfo: 'VN904 - HAN to KUL',
      flightDetails: {
        flightNumber: 'VN904',
        route: 'HAN - Hanoi → KUL - Kuala Lumpur',
        origin: 'HAN',
        destination: 'KUL',
        class: 'Premium Economy',
        distance: 2735,
        baseQualifyingMiles: 3282,
        classMultiplier: 1.3,
        bonusMiles: 4267,
        qualifyingMiles: 3282,
        totalMiles: 4267
      },
      miles: 4267
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
      flightDetails: {
        flightNumber: 'QR456',
        route: 'SGN - Ho Chi Minh → DOH - Doha',
        origin: 'SGN',
        destination: 'DOH',
        class: 'Business',
        distance: 3245,
        baseQualifyingMiles: 3894,
        classMultiplier: 1.5,
        bonusMiles: 5841,
        qualifyingMiles: 3894,
        totalMiles: 5841
      },
      miles: 5841
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
      flightDetails: {
        flightNumber: 'EK789',
        route: 'HAN - Hanoi → DXB - Dubai',
        origin: 'HAN',
        destination: 'DXB',
        class: 'Economy',
        distance: 4420,
        baseQualifyingMiles: 4420,
        classMultiplier: 1.0,
        bonusMiles: 4420,
        qualifyingMiles: 4420,
        totalMiles: 4420
      },
      miles: 4420
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
      flightDetails: {
        flightNumber: 'BA202',
        route: 'SGN - Ho Chi Minh → LHR - London Heathrow',
        origin: 'SGN',
        destination: 'LHR',
        class: 'Premium Economy',
        distance: 6765,
        baseQualifyingMiles: 8118,
        classMultiplier: 1.3,
        bonusMiles: 10553,
        qualifyingMiles: 8118,
        totalMiles: 10553
      },
      miles: 10553,
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
      flightDetails: {
        flightNumber: 'SQ101',
        route: 'SGN - Ho Chi Minh → SIN - Singapore',
        origin: 'SGN',
        destination: 'SIN',
        class: 'Economy',
        distance: 753,
        baseQualifyingMiles: 753,
        classMultiplier: 1.0,
        bonusMiles: 753,
        qualifyingMiles: 753,
        totalMiles: 753
      },
      miles: 753
    }
  ]);

  const [tiers, setTiers] = useState<TierConfig[]>([]);

  const [members, setMembers] = useState<Member[]>([
    { id: 'M001', name: 'John Smith', email: 'john.smith@email.com', tier: 'gold', totalQualifyingMiles: 45000, totalAwardMiles: 68000, status: 'active' },
    { id: 'M002', name: 'Sarah Johnson', email: 'sarah.j@email.com', tier: 'platinum', totalQualifyingMiles: 120000, totalAwardMiles: 82000, status: 'active' },
    { id: 'M003', name: 'Mike Davis', email: 'mike.davis@email.com', tier: 'silver', totalQualifyingMiles: 28000, totalAwardMiles: 35000, status: 'active' },
    { id: 'M004', name: 'Lisa Chen', email: 'lisa.chen@email.com', tier: 'bronze', totalQualifyingMiles: 8000, totalAwardMiles: 15000, status: 'inactive' }
  ]);

  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([
    { id: 'H001', adminName: 'Admin User', action: 'Approved claim request', timestamp: '2025-01-15 10:30:00', requestId: 'LM-2025-002' },
    { id: 'H002', adminName: 'Admin User', action: 'Added manual miles', timestamp: '2025-01-15 09:15:00' },
    { id: 'H003', adminName: 'Admin User', action: 'Rejected claim request', timestamp: '2025-01-14 16:45:00', requestId: 'LM-2025-001' }
  ]);

  const [rewards, setRewards] = useState<Reward[]>([]);

  const fetchRewards = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await fetch('https://mileswise-be.onrender.com/api/admin/rewards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const mappedRewards: Reward[] = data.map((reward: any) => ({
        id: reward.id,
        name: reward.name,
        rewardType: reward.rewardType,
        value: parseFloat(reward.value),
        description: reward.description,
        milesCost: reward.milesCost,
        validityStart: reward.validFrom.split('T')[0],
        validityEnd: reward.validUntil.split('T')[0],
        conditions: reward.termsAndConditions,
        status: reward.status === 'public' ? 'active' : 'draft', // Assuming 'public' maps to 'active'
        createdDate: reward.createdAt.split('T')[0],
        usageCount: 0, // API response doesn't have usageCount, default to 0
        maxUsage: reward.maxUsage,
        membershipId: reward.membershipId,
        membershipName: reward.membershipInfo.name,
      }));
      setRewards(mappedRewards);
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
      // Optionally, show a toast notification for error
    }
  }, [setIsAuthenticated, setRewards]);

  const fetchMemberships = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await fetch('https://mileswise-be.onrender.com/api/admin/memberships', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Map API response to TierConfig structure
      const mappedTiers: TierConfig[] = data.map((membership: any) => ({
        id: membership.id,
        name: membership.name, 
        displayName: membership.name,
        color: '', // Will be set by getTailwindColorClass in TierConfig.tsx
        hexColor: membership.color, // Assuming color is a hex string from API
        milesRequired: membership.milesRequired,
        description: membership.description,
        benefits: membership.benefit ? [membership.benefit] : [], // Convert single benefit string to array
        autoRewards: membership.autoAssignReward ? [membership.autoAssignReward] : [], // Assuming autoAssignReward is a single reward ID
        status: 'active', // Assuming all fetched memberships are active
        createdDate: membership.createdAt ? membership.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        memberCount: 0, // API response doesn't have memberCount, default to 0
        maxRewardsPerMonth: 0, // Default value
        tierBonus: 0, // Default value
      }));
      setTiers(mappedTiers);
    } catch (error) {
      console.error('Failed to fetch memberships:', error);
    }
  }, [setIsAuthenticated, setTiers]);

  useEffect(() => {
    fetchRewards();
    fetchMemberships();
  }, [isAuthenticated, fetchRewards, fetchMemberships]);

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

  const addReward = (reward: Reward) => {
    setRewards(prev => [reward, ...prev]);
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

  const updateMemberTier = (memberId: string, newTier: string, qualifyingMiles: number, awardMiles?: number) => {
    setMembers(prev =>
      prev.map(member =>
        member.id === memberId
          ? { 
              ...member, 
              tier: newTier, 
              totalQualifyingMiles: qualifyingMiles,
              totalAwardMiles: awardMiles !== undefined ? awardMiles : member.totalAwardMiles
            }
          : member
      )
    );
  };

  const checkAndAssignRewards = (memberId: string, newQualifyingMiles: number, newAwardMiles?: number) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    // Determine new tier based on qualifying miles
    const sortedTiers = [...tiers]
      .filter(t => t.status === 'active')
      .sort((a, b) => b.milesRequired - a.milesRequired);

    const newTier = sortedTiers.find(tier => newQualifyingMiles >= tier.milesRequired);
    
    if (newTier && newTier.name !== member.tier) {
      // Update member tier
      updateMemberTier(memberId, newTier.name, newQualifyingMiles, newAwardMiles);

      // Auto-assign rewards for this tier
      const autoRewards = rewards.filter(reward => 
        newTier.autoRewards?.includes(reward.id) && 
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
        action: `${member.name} automatically upgraded to ${newTier.displayName} tier (${newQualifyingMiles.toLocaleString()} qualifying miles)`
      });
    }
  };

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
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
      checkAndAssignRewards,
      fetchRewards,
      fetchMemberships
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