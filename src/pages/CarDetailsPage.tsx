import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, DollarSign, Car, Users, ArrowLeft } from 'lucide-react';
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
  createdAt: string;
}

const CarDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/cars/${id}`);
        setCar(response.data);
      } catch (err: any) {
        console.error('Error fetching car details:', err);
        setError(err.response?.data?.message || 'Failed to load car details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCarDetails();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-6">{error || 'Car not found'}</p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-64 sm:h-80 md:h-96">
              <img 
                src={car.image} 
                alt={car.name} 
                className="absolute h-full w-full object-cover"
              />
            </div>

            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">{car.name}</h1>
                <div className="flex items-center bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span className="font-semibold">${car.pricePerDay}/day</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center">
                  <Car className="h-4 w-4 mr-1" />
                  {car.type}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm flex items-center ${
                  car.isAvailable 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {car.isAvailable ? 'Available' : 'Currently Booked'}
                </span>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
                <p className="text-gray-600">{car.description}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Car Owner</h2>
                <div className="flex items-center">
                  <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{car.owner?.name || 'Unknown Owner'}</p>
                    <p className="text-sm text-gray-500">{car.owner?.email || 'No email provided'}</p>
                  </div>
                </div>
              </div>

              {user ? (
                user.role === 'customer' ? (
                  car.isAvailable ? (
                    <div className="mt-6">
                      <Link
                        to={`/booking/${car._id}`}
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-3 px-4 rounded-md transition duration-300"
                      >
                        <Calendar className="inline-block h-5 w-5 mr-2" />
                        Book This Car
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                      <p className="font-medium">This car is currently unavailable</p>
                      <p className="text-sm">Please check back later or browse other cars.</p>
                      <Link
                        to="/customer/dashboard"
                        className="inline-block mt-2 text-red-700 font-medium hover:underline"
                      >
                        Browse Available Cars
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
                    <p>You're logged in as a car owner. Only customers can book cars.</p>
                  </div>
                )
              ) : (
                <div className="mt-6">
                  <Link
                    to="/login"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-3 px-4 rounded-md transition duration-300"
                  >
                    Sign In to Book This Car
                  </Link>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline">
                      Register
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsPage;