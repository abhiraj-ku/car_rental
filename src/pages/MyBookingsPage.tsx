import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Calendar, CreditCard, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import AuthContext from '../context/AuthContext';

interface Booking {
  _id: string;
  car: {
    _id: string;
    name: string;
    type: string;
    pricePerDay: number;
    image: string;
  };
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

const MyBookingsPage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
        };

        const { data } = await axios.get('http://localhost:5000/api/bookings/customer', config);
        setBookings(data);
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        setError(err.response?.data?.message || 'Failed to fetch bookings');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.token) {
      fetchBookings();
    }
  }, [user]);

  const handleCancel = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        setIsCancelling(true);
        setActiveBookingId(bookingId);
        
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
        };
        
        await axios.put(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {}, config);
        
        // Update the booking status in the state
        setBookings(bookings.map(booking => 
          booking._id === bookingId ? { ...booking, status: 'Cancelled' } : booking
        ));
      } catch (err: any) {
        console.error('Error cancelling booking:', err);
        setError(err.response?.data?.message || 'Failed to cancel booking');
      } finally {
        setIsCancelling(false);
        setActiveBookingId(null);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status icon based on booking status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Cancelled':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  // Get status class based on booking status
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
              <p className="text-gray-600">Manage your car rental bookings</p>
            </div>
            <Link
              to="/customer/dashboard"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Cars
            </Link>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p>{error}</p>
              <button 
                className="text-sm underline"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No bookings yet</h3>
              <p className="mt-1 text-gray-500">You haven't made any car rental bookings yet.</p>
              <Link
                to="/customer/dashboard"
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Find a Car to Rent
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div 
                  key={booking._id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="md:flex">
                    <div className="md:flex-shrink-0 md:w-48 h-48 md:h-full relative">
                      <img
                        src={booking.car.image}
                        alt={booking.car.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-6 flex-1">
                      <div className="flex flex-col md:flex-row justify-between mb-4">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800">{booking.car.name}</h2>
                          <div className="flex items-center mt-1">
                            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                              {booking.car.type}
                            </span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs flex items-center ${getStatusClass(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1">{booking.status}</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right mt-2 md:mt-0">
                          <div className="text-lg font-bold text-blue-600">${booking.totalPrice}</div>
                          <div className="text-sm text-gray-500">
                            ({booking.totalDays} days × ${booking.car.pricePerDay}/day)
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-md p-4 mb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">Pick-up Date</div>
                            <div className="font-medium flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                              {formatDate(booking.startDate)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Return Date</div>
                            <div className="font-medium flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                              {formatDate(booking.endDate)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Booked on {formatDate(booking.createdAt)}
                        </div>
                        <div className="flex space-x-2">
                          {booking.status === 'Pending' && (
                            <button
                              onClick={() => handleCancel(booking._id)}
                              disabled={isCancelling && activeBookingId === booking._id}
                              className={`px-4 py-2 border border-red-500 text-red-600 rounded hover:bg-red-50 ${
                                isCancelling && activeBookingId === booking._id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {isCancelling && activeBookingId === booking._id ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500 mr-2"></div>
                                  Cancelling
                                </div>
                              ) : (
                                'Cancel Booking'
                              )}
                            </button>
                          )}
                          {booking.status === 'Paid' && (
                            <button
                              className="px-4 py-2 border border-green-500 text-green-600 rounded hover:bg-green-50"
                            >
                              <CreditCard className="h-4 w-4 mr-1 inline-block" />
                              Receipt
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;