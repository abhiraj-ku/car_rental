import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { PlusCircle, Edit, Trash, CarFront, Cog } from 'lucide-react';
import AuthContext from '../context/AuthContext';

interface Car {
  _id: string;
  name: string;
  type: string;
  pricePerDay: number;
  description: string;
  image: string;
  isAvailable: boolean;
  createdAt: string;
}

interface Booking {
  _id: string;
  car: {
    _id: string;
    name: string;
    type: string;
    pricePerDay: number;
    image: string;
  };
  customer: {
    name: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

type FormData = {
  name: string;
  type: string;
  pricePerDay: number;
  description: string;
  image: string;
};

const carTypes = ['SUV', 'Sedan', 'Hatchback', 'Convertible', 'Truck', 'Van'];

const OwnerDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [activeTab, setActiveTab] = useState('cars');
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  // Fetch owner's cars
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
        };

        const { data } = await axios.get('http://localhost:5000/api/cars/owner', config);
        setCars(data);
      } catch (err: any) {
        console.error('Error fetching cars:', err);
        setError(err.response?.data?.message || 'Failed to fetch cars');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchBookings = async () => {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
        };

        const { data } = await axios.get('http://localhost:5000/api/bookings/owner', config);
        setBookings(data);
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
      }
    };

    if (user?.token) {
      fetchCars();
      fetchBookings();
    }
  }, [user]);

  const openModal = (car: Car | null = null) => {
    setEditingCar(car);
    if (car) {
      reset({
        name: car.name,
        type: car.type,
        pricePerDay: car.pricePerDay,
        description: car.description,
        image: car.image,
      });
    } else {
      reset({
        name: '',
        type: 'Sedan',
        pricePerDay: 50,
        description: '',
        image: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCar(null);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      };

      if (editingCar) {
        // Update car
        await axios.put(`http://localhost:5000/api/cars/${editingCar._id}`, data, config);
        setCars(cars.map(car => (car._id === editingCar._id ? { ...car, ...data } : car)));
      } else {
        // Create new car
        const response = await axios.post('http://localhost:5000/api/cars', data, config);
        setCars([...cars, response.data]);
      }

      closeModal();
    } catch (err: any) {
      console.error('Error saving car:', err);
      setError(err.response?.data?.message || 'Failed to save car');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };

        await axios.delete(`http://localhost:5000/api/cars/${id}`, config);
        setCars(cars.filter(car => car._id !== id));
      } catch (err: any) {
        console.error('Error deleting car:', err);
        setError(err.response?.data?.message || 'Failed to delete car');
      }
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-6 py-4 text-sm font-medium flex items-center ${
                activeTab === 'cars'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('cars')}
            >
              <CarFront className="h-5 w-5 mr-2" />
              My Cars
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium flex items-center ${
                activeTab === 'bookings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('bookings')}
            >
              <Cog className="h-5 w-5 mr-2" />
              Bookings
            </button>
          </div>

          {error && (
            <div className="m-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p>{error}</p>
              <button 
                className="text-sm underline"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="p-6">
            {activeTab === 'cars' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">My Cars</h1>
                  <button
                    onClick={() => openModal()}
                    className="flex items-center text-sm bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-300"
                  >
                    <PlusCircle className="h-5 w-5 mr-1" />
                    Add New Car
                  </button>
                </div>

                {cars.length === 0 ? (
                  <div className="text-center py-12">
                    <CarFront className="h-16 w-16 mx-auto text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No cars yet</h3>
                    <p className="mt-1 text-gray-500">Get started by adding your first car listing.</p>
                    <button
                      onClick={() => openModal()}
                      className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusCircle className="h-5 w-5 mr-1" />
                      Add a Car
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cars.map((car) => (
                      <div key={car._id} className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition duration-300">
                        <div className="relative pb-[56.25%]">
                          <img
                            src={car.image}
                            alt={car.name}
                            className="absolute h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">{car.name}</h3>
                            <span className="text-blue-600 font-bold">${car.pricePerDay}/day</span>
                          </div>
                          <div className="flex items-center mb-2">
                            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                              {car.type}
                            </span>
                            <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                              car.isAvailable 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {car.isAvailable ? 'Available' : 'Booked'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{car.description}</p>
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              Added on {formatDate(car.createdAt)}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openModal(car)}
                                className="p-1 text-gray-600 hover:text-blue-600 transition duration-300"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(car._id)}
                                className="p-1 text-gray-600 hover:text-red-600 transition duration-300"
                              >
                                <Trash className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'bookings' && (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">Bookings for My Cars</h1>
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Cog className="h-16 w-16 mx-auto text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No bookings yet</h3>
                    <p className="mt-1 text-gray-500">Once customers book your cars, they will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Car
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dates
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking) => (
                          <tr key={booking._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <img 
                                    className="h-10 w-10 rounded-full object-cover" 
                                    src={booking.car.image} 
                                    alt={booking.car.name} 
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{booking.car.name}</div>
                                  <div className="text-sm text-gray-500">{booking.car.type}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{booking.customer.name}</div>
                              <div className="text-sm text-gray-500">{booking.customer.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatDate(booking.startDate)}</div>
                              <div className="text-sm text-gray-500">to {formatDate(booking.endDate)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">${booking.totalPrice}</div>
                              <div className="text-sm text-gray-500">({booking.totalDays} days)</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                booking.status === 'Paid' 
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'Failed' 
                                  ? 'bg-red-100 text-red-800'
                                  : booking.status === 'Cancelled' 
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Car Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingCar ? 'Edit Car Details' : 'Add New Car'}
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 gap-y-4">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              Car Name
                            </label>
                            <input
                              type="text"
                              id="name"
                              className={`mt-1 block w-full px-3 py-2 border ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                              placeholder="e.g. Toyota Camry 2022"
                              {...register('name', { required: 'Car name is required' })}
                            />
                            {errors.name && (
                              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                              Car Type
                            </label>
                            <select
                              id="type"
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              {...register('type', { required: true })}
                            >
                              {carTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label htmlFor="pricePerDay" className="block text-sm font-medium text-gray-700">
                              Price Per Day ($)
                            </label>
                            <input
                              type="number"
                              id="pricePerDay"
                              className={`mt-1 block w-full px-3 py-2 border ${
                                errors.pricePerDay ? 'border-red-500' : 'border-gray-300'
                              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                              {...register('pricePerDay', { 
                                required: 'Price is required',
                                min: { value: 1, message: 'Price must be positive' }
                              })}
                            />
                            {errors.pricePerDay && (
                              <p className="mt-1 text-sm text-red-600">{errors.pricePerDay.message}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                              Description
                            </label>
                            <textarea
                              id="description"
                              rows={3}
                              className={`mt-1 block w-full px-3 py-2 border ${
                                errors.description ? 'border-red-500' : 'border-gray-300'
                              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                              placeholder="Describe your car features, condition, etc."
                              {...register('description', { required: 'Description is required' })}
                            ></textarea>
                            {errors.description && (
                              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                              Image URL
                            </label>
                            <input
                              type="text"
                              id="image"
                              className={`mt-1 block w-full px-3 py-2 border ${
                                errors.image ? 'border-red-500' : 'border-gray-300'
                              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                              placeholder="https://example.com/car-image.jpg"
                              {...register('image', { required: 'Image URL is required' })}
                            />
                            {errors.image && (
                              <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                              Paste a link to an image of your car. For testing, you can use images from Pexels.
                            </p>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSubmit(onSubmit)}
                >
                  {editingCar ? 'Update Car' : 'Add Car'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;