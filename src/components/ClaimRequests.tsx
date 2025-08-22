import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useAppContext } from '../contexts/AppContext';
import { Search, Filter } from 'lucide-react';
import { toast } from "sonner";
import { useEffect } from 'react';

export function ClaimRequests() {
  const { claimRequests, updateClaimRequest, addHistoryLog, setClaimRequests } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString; // Return original string if parsing fails
    }
  };

  const mapApiResponseToClaimRequest = (res: any) => {
    const flightInfoParts = [
      res.flightInfo?.flightNumber || '',
      res.customerFlight?.departure || '',
      res.customerFlight?.arrival || ''
    ].filter(Boolean);

    const flightInfoString = flightInfoParts.length > 0
      ? `${flightInfoParts[0]}${flightInfoParts[1] ? ` - ${flightInfoParts[1]}` : ''}${flightInfoParts[2] ? ` to ${flightInfoParts[2]}` : ''}`
      : '';

    const classMultiplier = (res.flightInfo.calculationDetails?.totalMiles || 0) / (res.flightInfo.calculationDetails?.baseDistance || 0) || 0

    return {
      id: res.id || '',
      claimNumber: res.id || '',
      memberName: res.customerName || '',
      memberEmail: res.email || '',
      email: res.email || '',
      submissionDate: res.dateRequest ? formatDate(res.dateRequest) : '',
      status: res.status || 'reviewing',
      reason: res.reason || '',
      flightInfo: flightInfoString,
      flightDetails: res.customerFlight ? {
        flightNumber: res.customerFlight.flightNumber || '',
        route: `${res.customerFlight.departure || ''} - ${res.customerFlight.departureInfo.city || ''} → ${res.customerFlight.arrival || ''} - ${res.customerFlight.arrivalInfo.city || ''}`,
        origin: res.customerFlight.departure || '',
        destination: res.customerFlight.arrival || '',
        class: res.customerFlight.seatClass || '',
        distance: res.customerFlight.distance || 0,
        baseQualifyingMiles: res.flightInfo.calculationDetails?.baseDistance || 0,
        classMultiplier: classMultiplier,
        bonusMiles: res.flightInfo.calculationDetails?.totalMiles || 0,
        qualifyingMiles: res.flightInfo.calculationDetails?.baseDistance || 0,
        totalMiles: res.flightInfo.calculationDetails?.totalMiles || 0
      } : {
        flightNumber: res.flightInfo?.flightNumber || '',
        route: `${res.flightInfo?.departure || ''} - ${res.flightInfo?.departureCity || ''} → ${res.flightInfo?.arrival || ''} - ${res.flightInfo?.arrivalCity || ''}`,
        origin: res.flightInfo?.departure || '',
        destination: res.flightInfo?.arrival || '',
        class: res.flightInfo?.class || '',
        distance: res.flightInfo?.distance || 0,
        baseQualifyingMiles: res.flightInfo?.qualifyingMiles || 0,
        classMultiplier: res.calculationDetails?.multiplier || 0,
        bonusMiles: res.flightInfo?.bonusMiles || 0,
        qualifyingMiles: res.flightInfo?.qualifyingMiles || 0,
        totalMiles: res.flightInfo?.totalMiles || 0
      },
      miles: res.flightInfo?.totalMiles || 0
    };
  };

  useEffect(() => {
    const fetchClaimRequests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found.');
        }

        const response = await fetch('https://mileswise-be.onrender.com/api/admin/earn-miles-requests', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch claim requests');
        }

        const data = await response.json();
        const mappedRequests = data.map((item: any) => mapApiResponseToClaimRequest(item));
        setClaimRequests(mappedRequests);
      } catch (err: any) {
        setError(err.message);
        toast.error(`Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaimRequests();
  }, [setClaimRequests]);

  const filteredRequests = claimRequests.filter(request => {
    const flightId = request.flightDetails?.flightNumber || request.flightInfo?.split(' - ')[0] || '';
    const matchesSearch =
      request.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flightId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found.');
      }

      const response = await fetch(`https://mileswise-be.onrender.com/api/admin/earn-miles-requests/${selectedRequest}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'approved' }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve claim request');
      }

      // Assuming the API returns the updated request or a success message
      // You might want to re-fetch all requests or update the local state directly
      // For now, let's update the local state based on the assumption that the update was successful
      updateClaimRequest(selectedRequest, {
        status: 'approved'
      });

      addHistoryLog({
        adminName: 'Admin User',
        action: `Approved miles request and credited ${selectedRequestData?.miles?.toLocaleString()} miles`,
        requestId: selectedRequest
      });

      toast.success('Miles request approved and credited successfully');
      setIsDialogOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(`Error approving request: ${err.message}`);
    }
  };

  const handleRejectClick = () => {
    setShowRejectionInput(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest || !rejectionReason) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found.');
      }

      const response = await fetch(`https://mileswise-be.onrender.com/api/admin/earn-miles-requests/${selectedRequest}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'rejected', reason: rejectionReason }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject claim request');
      }

      updateClaimRequest(selectedRequest, {
        status: 'rejected',
        rejectionReason
      });

      addHistoryLog({
        adminName: 'Admin User',
        action: `Rejected claim request: ${rejectionReason}`,
        requestId: selectedRequest
      });

      toast.success('Claim request rejected');
      setIsDialogOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(`Error rejecting request: ${err.message}`);
    }
  };

  const resetForm = () => {
    setShowRejectionInput(false);
    setRejectionReason('');
    setSelectedRequest(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedRequestData = selectedRequest ?
    claimRequests.find(r => r.id === selectedRequest) : null;

  console.log('selectedRequestData', selectedRequestData);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Claim Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by email, name, request ID, or flight ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">
              Loading claim requests...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">
              Error: {error}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No claim requests found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Flight ID</TableHead>
                  <TableHead>Member Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Bonus Miles</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell className="font-medium text-blue-600">
                      {request.flightDetails?.flightNumber || request.flightInfo?.split(' - ')[0] || '-'}
                    </TableCell>
                    <TableCell>{request.memberName}</TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>
                      <span className="font-medium text-green-600">
                        {request.flightDetails?.bonusMiles
                          ? `${request.flightDetails.bonusMiles.toLocaleString()}`
                          : '-'}
                      </span>
                    </TableCell>
                    <TableCell>{request.submissionDate}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request.id);
                          setIsDialogOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Miles Calculation Result Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-green-600">🏆</span>
              Miles Calculation Result
            </DialogTitle>
          </DialogHeader>

          {selectedRequestData && (
            selectedRequestData.flightDetails ? (
              <div className="space-y-6 mt-4">
                {/* Flight Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-700">Flight Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-600">Flight:</Label>
                      <p className="font-medium">{selectedRequestData.flightDetails.flightNumber}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Route:</Label>
                      <p className="font-medium">{selectedRequestData.flightDetails.route}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Class:</Label>
                      <p className="font-medium">{selectedRequestData.flightDetails.class}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Distance:</Label>
                      <p className="font-medium">{selectedRequestData.flightDetails.distance.toLocaleString()} km</p>
                    </div>
                  </div>
                </div>

                {/* Miles Calculation Result */}
                <div className="bg-green-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-green-600">💰</span>
                    <h3 className="font-semibold text-green-700">Miles Calculation Result</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500">👤</span>
                        <span>Base Qualifying Miles</span>
                        <span className="text-xs text-gray-500">(Distance × 1.2)</span>
                      </div>
                      <span className="font-bold text-blue-600">{selectedRequestData.flightDetails.baseQualifyingMiles.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-500">⭐</span>
                        <span>{selectedRequestData.flightDetails.class} Class Multiplier</span>
                      </div>
                      <span className="font-bold text-orange-600">{selectedRequestData.flightDetails.classMultiplier}x</span>
                    </div>

                    <div className="bg-white rounded p-3 mt-3">
                      <div className="text-center">
                        <Label className="text-sm text-gray-600">Bonus Miles Calculation</Label>
                        <p className="font-bold text-green-600">
                          {selectedRequestData.flightDetails.baseQualifyingMiles.toLocaleString()} × {selectedRequestData.flightDetails.classMultiplier} = {selectedRequestData.flightDetails.totalMiles.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mile Type Breakdown */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <Label className="text-xs text-blue-600 uppercase tracking-wide">For Tier Status</Label>
                      <p className="font-bold text-blue-700">Qualifying Miles</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedRequestData.flightDetails.qualifyingMiles.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <Label className="text-xs text-green-600 uppercase tracking-wide">For Redemption</Label>
                      <p className="font-bold text-green-700">Bonus Miles</p>
                      <p className="text-2xl font-bold text-green-600">{selectedRequestData.flightDetails.bonusMiles.toLocaleString()}</p>
                    </div>
                  </div>
                </div>



                {/* Member Information */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Member Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-600">Name:</Label>
                      <p className="font-medium">{selectedRequestData.memberName}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Email:</Label>
                      <p className="font-medium">{selectedRequestData.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Submission Date:</Label>
                      <p className="font-medium">{selectedRequestData.submissionDate}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Request Reason:</Label>
                      <p className="font-medium">{selectedRequestData.reason}</p>
                    </div>
                  </div>
                </div>

                {/* Action Section */}
                {selectedRequestData.status === 'reviewing' && (
                  <div className="space-y-4 border-t pt-4">
                    {!showRejectionInput ? (
                      <div className="flex gap-3">
                        <Button
                          onClick={handleApprove}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          Approve Request
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleRejectClick}
                          className="flex-1"
                        >
                          Reject Request
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="rejection">Rejection Reason</Label>
                          <Textarea
                            id="rejection"
                            placeholder="Please enter the reason for rejection"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowRejectionInput(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleConfirmReject}
                            disabled={!rejectionReason}
                            className="flex-1"
                          >
                            Confirm Rejection
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Display for Approved/Rejected */}
                {selectedRequestData.status !== 'reviewing' && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <Label className="text-xs text-gray-600">Current Status:</Label>
                        <Badge className={getStatusColor(selectedRequestData.status)}>
                          {selectedRequestData.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {selectedRequestData.status === 'rejected' && selectedRequestData.rejectionReason && (
                      <div className="bg-red-50 rounded p-3 mb-4">
                        <Label className="text-sm font-medium text-red-700">Rejection Reason:</Label>
                        <p className="text-sm text-red-600 mt-1">{selectedRequestData.rejectionReason}</p>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Fallback for requests without detailed flight information
              <div className="space-y-6 mt-4">
                {/* Basic Member Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Member Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <p className="text-sm">{selectedRequestData.memberName}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm">{selectedRequestData.email}</p>
                    </div>
                    <div>
                      <Label>Submission Date</Label>
                      <p className="text-sm">{selectedRequestData.submissionDate}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge className={getStatusColor(selectedRequestData.status)}>
                        {selectedRequestData.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Basic Claim Details */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Claim Details</h3>
                  <div>
                    <Label>Reason</Label>
                    <p className="text-sm">{selectedRequestData.reason}</p>
                  </div>
                  <div>
                    <Label>Flight Information</Label>
                    <p className="text-sm">{selectedRequestData.flightInfo}</p>
                  </div>
                  <div>
                    <Label>Requested Miles</Label>
                    <p className="text-sm">{selectedRequestData.miles?.toLocaleString()} miles</p>
                  </div>
                </div>

                {/* Action Section for basic view */}
                {selectedRequestData.status === 'reviewing' && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Actions</h3>

                    {!showRejectionInput ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleApprove}
                          className="flex-1"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleRejectClick}
                          className="flex-1"
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="rejection">Rejection Reason</Label>
                          <Textarea
                            id="rejection"
                            placeholder="Please enter the reason for rejection"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowRejectionInput(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleConfirmReject}
                            disabled={!rejectionReason}
                            className="flex-1"
                          >
                            Confirm Rejection
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Rejection Reason Display */}
                {selectedRequestData.status === 'rejected' && selectedRequestData.rejectionReason && (
                  <div className="space-y-2 border-t pt-4">
                    <Label>Rejection Reason</Label>
                    <p className="text-sm text-red-600">{selectedRequestData.rejectionReason}</p>
                  </div>
                )}

                {/* Close button for non-pending requests */}
                {selectedRequestData.status !== 'reviewing' && (
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Close
                    </Button>
                  </div>
                )}
              </div>
            ))}
        </DialogContent>
      </Dialog>
    </div>
  );
}