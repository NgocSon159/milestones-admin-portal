import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../contexts/AppContext';
import { FileText, CheckCircle, XCircle, Clock, Users, Calendar, TrendingUp, Eye } from 'lucide-react';
import { toast } from "sonner";
import { DashboardStats, EarnMilesRequest } from '../types/api.d';

export function Dashboard() {
  const { addHistoryLog } = useAppContext();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [datePeriod, setDatePeriod] = useState('6months');

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentClaimRequests, setRecentClaimRequests] = useState<EarnMilesRequest[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      try {
        // Fetch Dashboard Stats
        const dashboardResponse = await fetch('https://mileswise-be.onrender.com/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!dashboardResponse.ok) {
          throw new Error(`HTTP error! status: ${dashboardResponse.status}`);
        }
        const dashboardData: DashboardStats = await dashboardResponse.json();
        setDashboardStats(dashboardData);

        // Fetch Recent Claim Requests
        const claimsResponse = await fetch('https://mileswise-be.onrender.com/api/admin/earn-miles-requests', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!claimsResponse.ok) {
          throw new Error(`HTTP error! status: ${claimsResponse.status}`);
        }
        const claimsData: EarnMilesRequest[] = await claimsResponse.json();
        setRecentClaimRequests(claimsData);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data. Please try again later.');
      }
    };

    fetchDashboardData();
  }, []); // Run once on component mount

  // Statistics
  const stats = dashboardStats ? {
    total: dashboardStats.totalRequest,
    pending: dashboardStats.totalPending,
    approved: dashboardStats.totalApproved,
    rejected: dashboardStats.totalRejected,
    totalMembers: dashboardStats.totalMember
  } : {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalMembers: 0
  };

  // Generate chart data based on selected date period
  const generateChartData = () => {
    if (!dashboardStats) return [];
    const chartInfo = dashboardStats.chartInfo;

    // Existing logic for filtering chart data based on period can be adapted here if needed,
    // but for now, we'll directly use the monthly data from the API and map it.
    // The API response for chartInfo already provides data monthly, so we'll just map it to the chart's expected format.
    return chartInfo.map(data => ({
      name: data.month, // The API returns 'YYYY-MM', we might want to format this for display
      approved: data.approved,
      pending: data.reviewing, // Assuming 'reviewing' from API maps to 'pending'
      rejected: data.rejected,
    }));
  };

  const chartData = generateChartData();

  const filteredRequests = recentClaimRequests.filter(request => {
    if (activeFilter === 'all') return true;
    return request.status === activeFilter;
  });

  const handleViewDetails = (requestId: string) => {
    setSelectedRequest(requestId);
    setIsDialogOpen(true);
    setShowRejectionInput(false);
    setRejectionReason('');
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    const request = recentClaimRequests.find(r => r.id === selectedRequest);
    if (!request) return;

    // Here you would typically call an API to update the status on the backend
    // For now, we'll simulate the update and add a history log.
    // updateClaimRequest(selectedRequest, { status: 'approved' });
    addHistoryLog({
      adminName: 'Admin User',
      action: `Approved claim request ${request.requestNumber} for ${request.flightInfo.milesEarn} miles`
    });
    
    toast.success('Request approved successfully');
    // After a successful API call, you would refetch recentClaimRequests or update the state directly
    // For now, let's update the local state for demonstration
    setRecentClaimRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === selectedRequest ? { ...req, status: 'approved' } : req
      )
    );
    setIsDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleReject = () => {
    setShowRejectionInput(true);
  };

  const confirmReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    const request = recentClaimRequests.find(r => r.id === selectedRequest);
    if (!request) return;

    // Here you would typically call an API to update the status on the backend
    // For now, we'll simulate the update and add a history log.
    // updateClaimRequest(selectedRequest, { 
    //   status: 'rejected',
    //   rejectionReason: rejectionReason 
    // });
    
    addHistoryLog({
      adminName: 'Admin User',
      action: `Rejected claim request ${request.requestNumber} - Reason: ${rejectionReason}`
    });
    
    toast.success('Request rejected');
    // After a successful API call, you would refetch recentClaimRequests or update the state directly
    // For now, let's update the local state for demonstration
    setRecentClaimRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === selectedRequest ? { ...req, status: 'rejected', rejectReason: rejectionReason } : req
      )
    );
    setIsDialogOpen(false);
    setSelectedRequest(null);
    setRejectionReason('');
    setShowRejectionInput(false);
  };

  const selectedRequestData = selectedRequest ? recentClaimRequests.find(r => r.id === selectedRequest) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600">Monitor and manage LotusMiles loyalty program activities</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
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
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
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
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Claim Requests Trend</CardTitle>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Select value={datePeriod} onValueChange={setDatePeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">Last 6 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="approved" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="Approved"
                />
                <Line 
                  type="monotone" 
                  dataKey="pending" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  name="Pending"
                />
                <Line 
                  type="monotone" 
                  dataKey="rejected" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  name="Rejected"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Claims Section */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Claim Requests</CardTitle>
            <div className="flex space-x-2">
              {['all', 'reviewing', 'approved', 'rejected'].map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                  className={
                    activeFilter === filter 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "text-gray-600 hover:text-gray-900"
                  }
                >
                  {filter === 'reviewing' ? 'Reviewing' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.slice(0, 10).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{request.requestNumber}</div>
                    <div className="text-sm text-gray-600">{request.email} • {request.flightInfo.milesEarn} miles</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge 
                    className={
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {request.status}
                  </Badge>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(request.id)}
                    className="flex items-center space-x-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Claim Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedRequestData && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-gray-600">Claim Number</Label>
                  <p className="font-medium">{selectedRequestData.requestNumber}</p>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-600">Member Email</Label>
                  <p className="font-medium">{selectedRequestData.email}</p>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-600">Miles Claimed</Label>
                  <p className="font-medium">{selectedRequestData.flightInfo.milesEarn} miles</p>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-600">Departure Date</Label>
                  <p className="font-medium">{new Date(selectedRequestData.flightInfo.departureDate).toLocaleDateString()}</p>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Flight Number</Label>
                  <p className="font-medium">{selectedRequestData.flightInfo.flightNumber}</p>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">From</Label>
                  <p className="font-medium">{selectedRequestData.flightInfo.from}</p>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">To</Label>
                  <p className="font-medium">{selectedRequestData.flightInfo.to}</p>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Airline</Label>
                  <p className="font-medium">{selectedRequestData.flightInfo.airline}</p>
                </div>

                {selectedRequestData.rejectReason && (
                  <div>
                    <Label className="text-sm text-gray-600">Reject Reason</Label>
                    <p className="font-medium text-red-600">{selectedRequestData.rejectReason}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm text-gray-600">Status</Label>
                  <Badge className={
                    selectedRequestData.status === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedRequestData.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {selectedRequestData.status}
                  </Badge>
                </div>
              </div>

              {selectedRequestData.status === 'pending' && !showRejectionInput && (
                <div className="flex space-x-2">
                  <Button onClick={handleApprove} className="flex-1 bg-green-600 hover:bg-green-700">
                    Approve
                  </Button>
                  <Button onClick={handleReject} variant="outline" className="flex-1 text-red-600 border-red-600 hover:bg-red-50">
                    Reject
                  </Button>
                </div>
              )}

              {showRejectionInput && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="rejectionReason">Rejection Reason</Label>
                    <Textarea
                      id="rejectionReason"
                      placeholder="Please provide a reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={confirmReject} className="flex-1 bg-red-600 hover:bg-red-700">
                      Confirm Reject
                    </Button>
                    <Button onClick={() => setShowRejectionInput(false)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}