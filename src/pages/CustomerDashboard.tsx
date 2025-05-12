import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Filter, CarFront } from 'lucide-react';
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

const carTypes = ['All Types', 'SUV', 'Sedan', 'Hatchback', 'Convertible', 'Truck', 'Van'];

const CustomerDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 500,
  });

  // Fetch all available cars
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/cars');
        setCars(response.data);
        setFilteredCars(response.data);
      } catch (err: any) {
        console.error('Error fetching cars:', err);
        setError(err.response?.data?.message || 'Failed to fetch cars');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Filter cars based on search term and filters
  useEffect(() => {
    let result = [...cars];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        car =>
          car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by car type
    if (selectedType !== 'All Types') {
      result = result.filter(car => car.type === selectedType);
    }

    // Filter by price range
    result = result.filter(
      car => car.pricePerDay >= priceRange.min && car.pricePerDay <= priceRange.max
    );
    
    // Filter only available cars
    result = result.filter(car => car.isAvailable);

    setFilteredCars(result);
  }, [searchTerm, selectedType, priceRange, cars]);

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('All Types');
    setPriceRange({ min: 0, max: 500 });
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
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Available Cars</h1>
              <p className="text-gray-600">Find and book your perfect ride</p>
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search cars..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button
                onClick={toggleFilters}
                className={`flex items-center justify-center px-4 py-2 border ${
                  isFilterOpen ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-gray-300 text-gray-700'
                } rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <Filter className="h-5 w-5 mr-1" />
                Filters
              </button>
            </div>
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

          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="bg-white p-4 rounded-lg shadow-md mb-6 animate-slideDown">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Car Type</label>
                  <select
                    value={selectedType}
                    onChange={e => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {carTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price (${priceRange.min})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={priceRange.min}
                    onChange={e => handlePriceChange('min', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price (${priceRange.max})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={priceRange.max}
                    onChange={e => handlePriceChange('max', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          {/* Car Grid */}
          {filteredCars.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md py-12 px-4 text-center">
              <CarFront className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No cars available</h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your search filters to find more options.
              </p>
              <button
                onClick={resetFilters}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map(car => (
                <div
                  key={car._id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300"
                >
                  <div className="relative pb-[56.25%]">
                    <img
                      src={car.image}
                      alt={car.name}
                      className="absolute h-full w-full object-cover"
                    />
                    <div className="absolute top-0 right-0 m-2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        ${car.pricePerDay}/day
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{car.name}</h3>
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                        {car.type}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        by {car.owner?.name || 'Unknown Owner'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{car.description}</p>
                    <Link
                      to={`/booking/${car._id}`}
                      className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
                    >
                      Book Now
                    </Link>
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

export default CustomerDashboard;