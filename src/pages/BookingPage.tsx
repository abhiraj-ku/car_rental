import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Calendar, DollarSign, CreditCard, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import AuthContext from '../context/AuthContext';

interface Car {
  _id: string;
  name: string;
  type: string;
  pricePerDay: number;
  description: string;
  image: string;
  isAvailable: boolean;
  owner: {
    name: string;
    email: string;
  };
}

interface FormData {
  startDate: string;
  endDate: string;
}

const BookingPage: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Dates, 2: Review, 3: Payment, 4: Confirmation
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  });

  // Get the values of dates to calculate price
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    // Calculate total days and price when dates change
    if (startDate && endDate && car) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const differenceInTime = end.getTime() - start.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
      
      if (differenceInDays > 0) {
        setTotalDays(differenceInDays);
        setTotalPrice(differenceInDays * car.pricePerDay);
      } else {
        setTotalDays(0);
        setTotalPrice(0);
      }
    }
  }, [startDate, endDate, car]);

  // Fetch car details
  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/cars/${carId}`);
        setCar(response.data);
        
        // Check if car is available
        if (!response.data.isAvailable) {
          setError('This car is no longer available for booking');
        }
      } catch (err: any) {
        console.error('Error fetching car details:', err);
        setError(err.response?.data?.message || 'Failed to load car details');
      } finally {
        setIsLoading(false);
      }
    };

    if (carId) {
      fetchCarDetails();
    }
  }, [carId]);

  const onSubmitDates = (data: FormData) => {
    // Move to review step
    setStep(2);
  };

  const createBooking = async () => {
    try {
      setIsLoading(true);
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      };
      
      const bookingData = {
        carId,
        startDate,
        endDate,
      };
      
      const { data } = await axios.post('http://localhost:5000/api/bookings', bookingData, config);
      setBookingId(data._id);
      setStep(3); // Move to payment step
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  const processPayment = async (success: boolean) => {
    if (!bookingId) return;
    
    try {
      setProcessingPayment(true);
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      };
      
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/pay`, 
        { paymentSuccess: success }, 
        config
      );
      
      setPaymentSuccess(success);
      setStep(4); // Move to confirmation step
    } catch (err: any) {
      console.error('Error processing payment:', err);
      setError(err.response?.data?.message || 'Failed to process payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (isLoading && step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Not Available</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              to="/customer/dashboard"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Browse Other Cars
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Booking Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <div className="ml-2 text-sm font-medium text-gray-700">Select Dates</div>
              </div>
              <div className={`flex-1 h-0.5 mx-4 ${step > 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <div className="ml-2 text-sm font-medium text-gray-700">Review</div>
              </div>
              <div className={`flex-1 h-0.5 mx-4 ${step > 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
                <div className="ml-2 text-sm font-medium text-gray-700">Payment</div>
              </div>
              <div className={`flex-1 h-0.5 mx-4 ${step > 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  4
                </div>
                <div className="ml-2 text-sm font-medium text-gray-700">Confirmation</div>
              </div>
            </div>
          </div>

          {/* Content for each step */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {step === 1 && car && (
              <div>
                <div className="relative h-48 sm:h-64">
                  <img 
                    src={car.image} 
                    alt={car.name} 
                    className="absolute h-full w-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{car.name}</h1>
                  <div className="flex items-center mb-6">
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm mr-2">
                      {car.type}
                    </span>
                    <span className="text-gray-600 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${car.pricePerDay}/day
                    </span>
                  </div>

                  {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                      <p>{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmitDates)}>
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Rental Dates</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Pick-up Date
                          </label>
                          <input
                            type="date"
                            id="startDate"
                            min={new Date().toISOString().split('T')[0]}
                            {...register('startDate', { 
                              required: 'Start date is required',
                              validate: value => new Date(value) >= new Date() || 'Date cannot be in the past'
                            })}
                            className={`w-full px-3 py-2 border ${
                              errors.startDate ? 'border-red-500' : 'border-gray-300'
                            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                          />
                          {errors.startDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Return Date
                          </label>
                          <input
                            type="date"
                            id="endDate"
                            min={startDate}
                            {...register('endDate', { 
                              required: 'End date is required',
                              validate: value => new Date(value) > new Date(startDate) || 'End date must be after start date'
                            })}
                            className={`w-full px-3 py-2 border ${
                              errors.endDate ? 'border-red-500' : 'border-gray-300'
                            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                          />
                          {errors.endDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {totalDays > 0 && (
                      <div className="bg-gray-50 p-4 rounded-md mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Price per day:</span>
                          <span className="font-medium">${car.pricePerDay}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Number of days:</span>
                          <span className="font-medium">{totalDays}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
                          <span>Total price:</span>
                          <span>${totalPrice}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={totalDays <= 0}
                        className={`px-6 py-2 bg-blue-600 text-white rounded-md ${
                          totalDays <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                        }`}
                      >
                        Continue
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {step === 2 && car && (
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Review Booking</h1>
                
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <div className="h-16 w-16 flex-shrink-0">
                      <img 
                        className="h-16 w-16 rounded object-cover" 
                        src={car.image} 
                        alt={car.name} 
                      />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-semibold text-gray-800">{car.name}</h2>
                      <div className="flex items-center">
                        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                          {car.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <h3 className="font-medium text-gray-700 mb-2">Booking Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Pick-up Date</p>
                        <p className="font-medium">
                          {new Date(startDate).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Return Date</p>
                        <p className="font-medium">
                          {new Date(endDate).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">{totalDays} days</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rate</p>
                        <p className="font-medium">${car.pricePerDay}/day</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium text-gray-700 mb-2">Price Summary</h3>
                    <div className="flex justify-between mb-2">
                      <span>Rental Fee ({totalDays} days × ${car.pricePerDay})</span>
                      <span className="font-medium">${totalPrice}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
                      <span>Total</span>
                      <span>${totalPrice}</span>
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <p>{error}</p>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={createBooking}
                    disabled={isLoading}
                    className={`px-6 py-2 bg-blue-600 text-white rounded-md flex items-center ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Proceed to Payment
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Payment</h1>
                
                <div className="border border-gray-200 rounded-md p-4 mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                    Demo Payment
                  </h2>
                  <p className="text-gray-600 mb-4">
                    This is a simulation. In a real application, you would be presented with a secure payment form.
                  </p>
                  <div className="bg-yellow-50 p-4 rounded-md mb-4">
                    <p className="text-sm text-yellow-700">
                      <strong>Note:</strong> No actual payment will be processed. Please choose an option to simulate:
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={() => processPayment(true)}
                      disabled={processingPayment}
                      className={`flex items-center justify-center px-4 py-3 border border-green-500 rounded-md text-green-700 bg-green-50 hover:bg-green-100 ${
                        processingPayment ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {processingPayment ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-700 mr-2"></div>
                      ) : (
                        <CheckCircle className="h-5 w-5 mr-2" />
                      )}
                      Simulate Successful Payment (${totalPrice})
                    </button>
                    
                    <button
                      onClick={() => processPayment(false)}
                      disabled={processingPayment}
                      className={`flex items-center justify-center px-4 py-3 border border-red-500 rounded-md text-red-700 bg-red-50 hover:bg-red-100 ${
                        processingPayment ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {processingPayment ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-700 mr-2"></div>
                      ) : (
                        <XCircle className="h-5 w-5 mr-2" />
                      )}
                      Simulate Failed Payment
                    </button>
                  </div>
                </div>
                
                {error && (
                  <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <p>{error}</p>
                  </div>
                )}
                
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={processingPayment}
                    className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ${
                      processingPayment ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="p-6 text-center">
                {paymentSuccess ? (
                  <>
                    <div className="flex items-center justify-center mb-4">
                      <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
                    <p className="text-gray-600 mb-6">
                      Your payment was successful and your booking has been confirmed.
                    </p>
                    <div className="bg-green-50 p-4 rounded-md mb-6 text-left">
                      <h3 className="font-medium text-green-700 mb-2">Booking Summary</h3>
                      <p className="text-sm text-green-600 mb-1">
                        <strong>Booking ID:</strong> {bookingId}
                      </p>
                      <p className="text-sm text-green-600 mb-1">
                        <strong>Rental Period:</strong> {totalDays} days
                      </p>
                      <p className="text-sm text-green-600">
                        <strong>Total Paid:</strong> ${totalPrice}
                      </p>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <Link
                        to="/my-bookings"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        View My Bookings
                      </Link>
                      <Link
                        to="/customer/dashboard"
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Browse More Cars
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center mb-4">
                      <XCircle className="h-16 w-16 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
                    <p className="text-gray-600 mb-6">
                      We were unable to process your payment. Your booking has not been confirmed.
                    </p>
                    <div className="bg-red-50 p-4 rounded-md mb-6 text-left">
                      <h3 className="font-medium text-red-700 mb-2">What happened?</h3>
                      <p className="text-sm text-red-600">
                        This is a simulated failure. In a real application, this could be due to insufficient funds, 
                        incorrect card details, or other payment issues.
                      </p>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => setStep(3)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Try Again
                      </button>
                      <Link
                        to="/customer/dashboard"
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel Booking
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;