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

export function ClaimRequests() {
  const { claimRequests, updateClaimRequest, addHistoryLog } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredRequests = claimRequests.filter(request => {
    const matchesSearch = 
      request.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleApprove = () => {
    if (!selectedRequest) return;
    
    updateClaimRequest(selectedRequest, {
      status: 'approved'
    });
    
    addHistoryLog({
      adminName: 'Admin User',
      action: `Approved claim request`,
      requestId: selectedRequest
    });
    
    toast.success('Claim request approved');
    setIsDialogOpen(false);
    resetForm();
  };

  const handleRejectClick = () => {
    setShowRejectionInput(true);
  };

  const handleConfirmReject = () => {
    if (!selectedRequest || !rejectionReason) return;
    
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedRequestData = selectedRequest ? 
    claimRequests.find(r => r.id === selectedRequest) : null;

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
                placeholder="Search by email, name, or request ID..."
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Member Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.memberName}</TableCell>
                  <TableCell>{request.email}</TableCell>
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
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Claim Request Details - {selectedRequest}</DialogTitle>
          </DialogHeader>
          
          {selectedRequestData && (
            <div className="space-y-6 mt-6">
              {/* Member Info */}
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

              {/* Claim Details */}
              <div className="space-y-3">
                <h3 className="font-semibold">Claim Details</h3>
                <div>
                  <Label>Reason</Label>
                  <p className="text-sm">{selectedRequestData.reason}</p>
                </div>
                <div>
                  <Label>Flight/Bill Information</Label>
                  <p className="text-sm">{selectedRequestData.flightInfo}</p>
                </div>
                <div>
                  <Label>Requested Miles</Label>
                  <p className="text-sm">{selectedRequestData.miles?.toLocaleString()} miles</p>
                </div>
              </div>

              {/* Action Section */}
              {selectedRequestData.status === 'pending' && (
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
              {selectedRequestData.status !== 'pending' && (
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}