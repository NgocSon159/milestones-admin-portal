export interface DashboardStats {
  totalRequest: number;
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalMember: number;
  chartInfo: ChartData[];
}

export interface ChartData {
  month: string;
  reviewing: number;
  approved: number;
  rejected: number;
}

export interface EarnMilesRequest {
  id: string;
  customerName: string;
  email: string;
  dateRequest: string;
  status: 'pending' | 'approved' | 'rejected';
  requestNumber: string;
  description: string | null;
  rejectReason: string | null;
  flightInfo: FlightInfo;
  customerFlight: CustomerFlight;
}

export interface FlightInfo {
  to: string;
  from: string;
  airline: string;
  distance: number;
  milesEarn: number;
  seatClass: string;
  flightNumber: string;
  serviceClass: string;
  departureDate: string;
  calculationDetails: { [key: string]: number };
}

export interface CustomerFlight {
  flightNumber: string;
  departure: string;
  arrival: string;
  distance: number;
  startTime: string;
  endTime: string;
  status: string;
  seat: string;
  serviceClass: string;
  seatClass: string;
  luggage: string;
  bookingNumber: string;
  milesEarn: number;
  departureInfo: { [key: string]: string };
  arrivalInfo: { [key: string]: string };
  airline: string;
}
