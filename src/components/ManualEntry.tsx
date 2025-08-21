import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useAppContext } from '../contexts/AppContext';
import { toast } from "sonner";
import { Plane, User, Mail, Calendar, CreditCard, LogIn, UserPlus, Info } from 'lucide-react';

// Mock flight database
const flightDatabase = {
  'VN123': {
    airline: 'Vietnam Airlines',
    bookingClass: 'Business',
    flightDate: '2025-08-10',
    cardTier: 'Gold',
    miles: 2500
  },
  'VJ456': {
    airline: 'VietJet Air',
    bookingClass: 'Economy',
    flightDate: '2025-08-09',
    cardTier: 'Silver',
    miles: 1200
  },
  'QR789': {
    airline: 'Qatar Airways',
    bookingClass: 'First Class',
    flightDate: '2025-08-08',
    cardTier: 'Platinum',
    miles: 5000
  },
  'SQ101': {
    airline: 'Singapore Airlines',
    bookingClass: 'Business',
    flightDate: '2025-08-07',
    cardTier: 'Platinum',
    miles: 3500
  },
  'BA202': {
    airline: 'British Airways',
    bookingClass: 'Premium Economy',
    flightDate: '2025-08-06',
    cardTier: 'Gold',
    miles: 2800
  }
};

export function ManualEntry() {
  const { addHistoryLog, members, setMembers, checkAndAssignRewards } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    memberEmail: '',
    memberNumber: '',
    flightNumberId: '',
    // Auto-filled fields
    airline: '',
    bookingClass: '',
    flightDate: '',
    cardTier: '',
    miles: 0
  });

  const [isFlightFound, setIsFlightFound] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Auto-fill flight information when flight number changes
  useEffect(() => {
    if (formData.flightNumberId.trim()) {
      const flightInfo = flightDatabase[formData.flightNumberId.toUpperCase()];
      if (flightInfo) {
        setFormData(prev => ({
          ...prev,
          airline: flightInfo.airline,
          bookingClass: flightInfo.bookingClass,
          flightDate: flightInfo.flightDate,
          cardTier: flightInfo.cardTier,
          miles: flightInfo.miles
        }));
        setIsFlightFound(true);
      } else {
        // Clear auto-filled fields if flight not found
        setFormData(prev => ({
          ...prev,
          airline: '',
          bookingClass: '',
          flightDate: '',
          cardTier: '',
          miles: 0
        }));
        setIsFlightFound(false);
      }
    } else {
      // Clear all fields when flight number is empty
      setFormData(prev => ({
        ...prev,
        airline: '',
        bookingClass: '',
        flightDate: '',
        cardTier: '',
        miles: 0
      }));
      setIsFlightFound(false);
    }
  }, [formData.flightNumberId]);

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
    if (!formData.memberEmail || !formData.memberNumber || !formData.flightNumberId || !isFlightFound) {
      toast.error('Please fill in all required fields and ensure flight is found');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Find member by email and update their miles
      const member = members.find(m => m.email.toLowerCase() === formData.memberEmail.toLowerCase());
      
      if (member) {
        const newQualifyingMiles = member.totalQualifyingMiles + formData.miles;
        const newAwardMiles = member.totalAwardMiles + formData.miles;
        
        // Update member miles
        setMembers(prev =>
          prev.map(m =>
            m.id === member.id
              ? { 
                  ...m, 
                  totalQualifyingMiles: newQualifyingMiles,
                  totalAwardMiles: newAwardMiles
                }
              : m
          )
        );

        // Check for tier upgrades and auto-assign rewards
        checkAndAssignRewards(member.id, newQualifyingMiles, newAwardMiles);

        addHistoryLog({
          adminName: 'Admin User',
          action: `Added ${formData.miles} miles for member ${formData.memberEmail} (Flight: ${formData.flightNumberId}) - Qualifying: ${newQualifyingMiles.toLocaleString()}, Award: ${newAwardMiles.toLocaleString()}`
        });

        toast.success(`Successfully added ${formData.miles} miles for flight ${formData.flightNumberId}. New qualifying: ${newQualifyingMiles.toLocaleString()}, award: ${newAwardMiles.toLocaleString()}`);
      } else {
        // Member not found - still log the transaction but show warning
        addHistoryLog({
          adminName: 'Admin User',
          action: `Added ${formData.miles} miles for member ${formData.memberEmail} (Flight: ${formData.flightNumberId}) - Member not found in system`
        });

        toast.success(`Successfully added ${formData.miles} miles for flight ${formData.flightNumberId}. Note: Member not found in member database.`);
      }
      
      // Reset form
      setFormData({
        memberEmail: '',
        memberNumber: '',
        flightNumberId: '',
        airline: '',
        bookingClass: '',
        flightDate: '',
        cardTier: '',
        miles: 0
      });
      setIsFlightFound(false);
      
    } catch (error) {
      toast.error('Failed to process transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      memberEmail: '',
      memberNumber: '',
      flightNumberId: '',
      airline: '',
      bookingClass: '',
      flightDate: '',
      cardTier: '',
      miles: 0
    });
    setIsFlightFound(false);
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
                disabled={isLoading || !formData.memberEmail || !formData.memberNumber || !formData.flightNumberId || !isFlightFound}
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
                        <span className="text-sm text-gray-600 block">Booking Class</span>
                        <span className="font-medium text-gray-900">{formData.bookingClass}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600 block">Flight Date</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {new Date(formData.flightDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block">Card Tier</span>
                        <Badge className={getTierColor(formData.cardTier)}>
                          {formData.cardTier}
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-blue-200">
                      <div className="text-center">
                        <span className="text-sm text-gray-600 block mb-1">Miles to Add</span>
                        <span className="font-bold text-green-600 text-2xl">
                          +{formData.miles.toLocaleString()}
                        </span>
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
                <span>Available Test Flights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Use these flight numbers for testing the system:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(flightDatabase).map(([flightId, info]) => (
                  <div key={flightId} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <code className="font-mono text-sm font-medium text-blue-600">
                        {flightId}
                      </code>
                      <Badge className={getTierColor(info.cardTier)} size="sm">
                        {info.cardTier}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      {info.airline} • {info.miles} miles
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