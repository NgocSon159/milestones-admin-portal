import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useAppContext } from '../contexts/AppContext';
import { Member } from '../contexts/AppContext'; // Import Member interface
import { toast } from "sonner";
import { Plane, User, Mail, Calendar, LogIn, UserPlus, Info } from 'lucide-react';

interface Flight {
  id: number;
  flightNumber: string;
  departure: string;
  arrival: string;
  startTime: string;
  endTime: string;
  status: string;
  bookingNumber: string;
  milesEarn: number;
  qualifyingMiles: number;
  bonusMiles: number;
  airline: string;
  distance: number;
}

export function ManualEntry() {
  const { addHistoryLog, members, setMembers, checkAndAssignRewards } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [flightsData, setFlightsData] = useState<Flight[]>([]); // State to store flights data
  const [fetchedMembers, setFetchedMembers] = useState<Member[]>([]); // State to store fetched members
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>(undefined); // State to store selected member ID

  const [formData, setFormData] = useState({
    memberEmail: '',
    memberNumber: '',
    flightNumberId: '',
    // Auto-filled fields
    airline: '',
    departure: '',
    arrival: '',
    startTime: '',
    endTime: '',
    milesEarn: 0,
    qualifyingMiles: 0,
    bonusMiles: 0,
    distance: 0
  });

  const [isFlightFound, setIsFlightFound] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [selectedFlightId, setSelectedFlightId] = useState<number | undefined>(undefined);

  const resetFormState = () => {
    setFormData({
      memberEmail: '',
      memberNumber: '',
      flightNumberId: '',
      airline: '',
      departure: '',
      arrival: '',
      startTime: '',
      endTime: '',
      milesEarn: 0,
      qualifyingMiles: 0,
      bonusMiles: 0,
      distance: 0
    });
    setIsFlightFound(false);
    setSelectedMemberId(undefined);
    setSelectedFlightId(undefined);
    setFlightsData([]); // Clear available flights
  };

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  const fetchFlightsForMember = async (memberId: string) => {
    if (!token) {
      toast.error('Authentication token not found.');
      return;
    }
    try {
      const flightsResponse = await fetch('https://mileswise-be.onrender.com/api/admin/members/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ customerId: memberId })
      });
      if (!flightsResponse.ok) {
        throw new Error(`Failed to fetch flights: ${flightsResponse.statusText}`);
      }
      const flightsJson = await flightsResponse.json();
      setFlightsData(flightsJson);
    } catch (error) {
      console.error('Error fetching flights:', error);
      toast.error(`Error fetching flights: ${(error as Error).message}`);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Auto-fill flight information when flight number changes
  useEffect(() => {
    if (formData.flightNumberId.trim() && flightsData.length > 0) {
      const flightInfo = flightsData.find(flight => flight.flightNumber.toUpperCase() === formData.flightNumberId.toUpperCase());
      if (flightInfo) {
        setFormData(prev => ({
          ...prev,
          airline: flightInfo.airline,
          departure: flightInfo.departure,
          arrival: flightInfo.arrival,
          startTime: flightInfo.startTime,
          endTime: flightInfo.endTime,
          milesEarn: flightInfo.milesEarn,
          qualifyingMiles: flightInfo.qualifyingMiles,
          bonusMiles: flightInfo.bonusMiles,
          distance: flightInfo.distance
        }));
        setIsFlightFound(true);
        setSelectedFlightId(flightInfo.id);
      } else {
        // Clear auto-filled fields if flight not found
        setFormData(prev => ({
          ...prev,
          airline: '',
          departure: '',
          arrival: '',
          startTime: '',
          endTime: '',
          milesEarn: 0,
          qualifyingMiles: 0,
          bonusMiles: 0,
          distance: 0
        }));
        setIsFlightFound(false);
        setSelectedFlightId(undefined);
      }
    } else {
      // Clear all fields when flight number is empty
      setFormData(prev => ({
        ...prev,
        airline: '',
        departure: '',
        arrival: '',
        startTime: '',
        endTime: '',
        milesEarn: 0,
        qualifyingMiles: 0,
        bonusMiles: 0,
        distance: 0
      }));
      setIsFlightFound(false);
      setSelectedFlightId(undefined);
    }
  }, [formData.flightNumberId, flightsData]);

  useEffect(() => {
    if (!token) return; // Only run if token is available

    const fetchMembers = async () => {
      if (!token) {
        toast.error('Authentication token not found.');
        return;
      }

      // Fetch members data
      try {
        const membersResponse = await fetch('https://mileswise-be.onrender.com/api/admin/members', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!membersResponse.ok) {
          throw new Error(`Failed to fetch members: ${membersResponse.statusText}`);
        }

        const membersJson = await membersResponse.json();
        setFetchedMembers(membersJson);
      } catch (error) {
        console.error('Error fetching members:', error);
        toast.error(`Error fetching members: ${(error as Error).message}`);
      }
    };

    fetchMembers();

    if (selectedMemberId) {
      fetchFlightsForMember(selectedMemberId);
    }
  }, [selectedMemberId, token, selectedFlightId]); // Dependency array now includes selectedMemberId, token and selectedFlightId

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-100 text-purple-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      case 'Bronze': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleConfirm = async () => {
    if (!formData.memberEmail || !formData.memberNumber || !formData.flightNumberId || !isFlightFound || !selectedMemberId || selectedFlightId === undefined) {
      toast.error('Please fill in all required fields, ensure flight is found, and a member is selected.');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('https://mileswise-be.onrender.com/api/admin/earn-miles-requests/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          flightId: selectedFlightId,
          customerId: selectedMemberId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to process transaction: ${response.statusText}`);
      }

      const result = await response.json();
      toast.success(result.message || 'Manual earn miles request created successfully.');

      // Find member by email and update their miles (This part remains for UI update)
      const member = members.find(m => m.memberId === selectedMemberId);
      
      if (member) {
        const flightInfo = flightsData.find(flight => flight.id === selectedFlightId);
        if (flightInfo) {
          const newQualifyingMiles = member.totalQualifyingMiles + flightInfo.qualifyingMiles;
          const newAwardMiles = member.totalAwardMiles + flightInfo.milesEarn + flightInfo.bonusMiles;
          
          const updatedMembers = members.map((m: Member) =>
            m.id === member.id
              ? { 
                  ...m, 
                  totalQualifyingMiles: newQualifyingMiles,
                  totalAwardMiles: newAwardMiles
                }
              : m
          );
          setMembers(updatedMembers);
          checkAndAssignRewards(member.id, newQualifyingMiles, newAwardMiles);

          addHistoryLog({
            adminName: 'Admin User',
            action: `Added ${flightInfo.milesEarn} miles for member ${member.email} (Flight: ${flightInfo.flightNumber}) - Qualifying: ${newQualifyingMiles.toLocaleString()}, Award: ${newAwardMiles.toLocaleString()}`
          });
        }
      } else {
        addHistoryLog({
          adminName: 'Admin User',
          action: `Manual earn request for customerId: ${selectedMemberId}, flightId: ${selectedFlightId}. Member not found in local state.`
        });
      }
      
      // Reset form
      resetFormState();
      
    } catch (error) {
      console.error('Failed to process transaction:', error);
      toast.error(`Failed to process transaction: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resetFormState();
    toast.info('Form cleared');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Manual Entry Portal</h1>
              <p className="text-blue-100">Add mileage transactions for loyalty members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Desktop Horizontal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <User className="w-5 h-5 text-blue-600" />
              <span>Member & Flight Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Select Member Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="selectMember" className="text-sm font-medium text-gray-600">
                Select Member
              </Label>
              <Select
                value={selectedMemberId}
                onValueChange={(value) => {
                  setSelectedMemberId(value);
                  const selectedMember = fetchedMembers.find(member => member.memberId === value);
                  if (selectedMember) {
                    setFormData(prev => ({
                      ...prev,
                      memberEmail: selectedMember.email,
                      memberNumber: selectedMember.customerNumber
                    }));
                    fetchFlightsForMember(value); // Call to fetch flights for the selected member
                  }
                }}
              >
                <SelectTrigger className="pl-10 py-3 bg-gray-50 border-gray-200">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {fetchedMembers.map((member) => (
                    <SelectItem key={member.memberId} value={member.memberId}>
                      {member.fullName} ({member.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Member Email */}
            <div className="space-y-2">
              <Label htmlFor="memberEmail" className="text-sm font-medium text-gray-600">
                Member Email *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="memberEmail"
                  type="email"
                  placeholder="Enter member email"
                  className="pl-10 py-3 bg-gray-50 border-gray-200"
                  value={formData.memberEmail}
                  onChange={(e) => handleInputChange('memberEmail', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Member Number */}
            <div className="space-y-2">
              <Label htmlFor="memberNumber" className="text-sm font-medium text-gray-600">
                Member Number *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="memberNumber"
                  placeholder="Enter member number"
                  className="pl-10 py-3 bg-gray-50 border-gray-200"
                  value={formData.memberNumber}
                  onChange={(e) => handleInputChange('memberNumber', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Flight Number ID */}
            <div className="space-y-2">
              <Label htmlFor="flightNumberId" className="text-sm font-medium text-gray-600">
                Flight Number ID *
              </Label>
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="flightNumberId"
                  placeholder="Enter flight number"
                  className="pl-10 py-3 bg-gray-50 border-gray-200"
                  value={formData.flightNumberId}
                  onChange={(e) => handleInputChange('flightNumberId', e.target.value)}
                  required
                />
              </div>
              {formData.flightNumberId && !isFlightFound && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Flight not found. Please check the flight number.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-4">
              <Button 
                onClick={handleConfirm}
                disabled={isLoading || !formData.memberEmail || !formData.memberNumber || !formData.flightNumberId || !isFlightFound || !selectedMemberId || selectedFlightId === undefined}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {isLoading ? 'Processing...' : 'Process Transaction'}
              </Button>

              <Button 
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full py-3 border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Clear Form
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Flight Information & Help */}
        <div className="space-y-6">
          {/* Flight Details Card */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Plane className="w-5 h-5 text-blue-600" />
                <span>Flight Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isFlightFound ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Plane className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900 text-lg">Flight {formData.flightNumberId}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600 block">Airline</span>
                        <span className="font-medium text-gray-900">{formData.airline}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block">Departure</span>
                        <span className="font-medium text-gray-900">{formData.departure}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600 block">Arrival</span>
                        <span className="font-medium text-gray-900">{formData.arrival}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block">Start Time</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {new Date(formData.startTime).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600 block">End Time</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {new Date(formData.endTime).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block">Distance</span>
                        <span className="font-medium text-gray-900">{formData.distance} km</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-blue-200">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <span className="text-sm text-gray-600 block mb-1">Qualifying Miles</span>
                          <span className="font-bold text-blue-600 text-xl">
                            +{formData.qualifyingMiles.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 block mb-1">Bonus Miles</span>
                          <span className="font-bold text-purple-600 text-xl">
                            +{formData.bonusMiles.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Plane className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Enter flight number to view details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Info className="w-5 h-5 text-blue-600" />
                <span>Available Flights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Use these flight numbers to process
              </p>
              <div className="grid grid-cols-2 gap-2">
                {flightsData.map((flight) => (
                  <div key={flight.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <code className="font-mono text-sm font-medium text-blue-600">
                        {flight.flightNumber}
                      </code>
                      <Badge className={getTierColor(flight.status === 'completed' ? 'Gold' : 'Silver')}>
                        {flight.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      {flight.airline} • {flight.milesEarn} miles
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-center space-x-4 text-xs text-gray-500 py-4">
        <span>Terms of Service</span>
        <span>•</span>
        <span>Privacy Policy</span>
        <span>•</span>
        <span>Help</span>
      </div>
    </div>
  );
}