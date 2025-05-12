import Car from '../models/Car.js';

// @desc    Create a new car listing
// @route   POST /api/cars
// @access  Private/Owner
export const createCar = async (req, res) => {
  const { name, type, pricePerDay, description, image } = req.body;

  try {
    const car = await Car.create({
      owner: req.user._id,
      name,
      type,
      pricePerDay,
      description,
      image,
    });

    res.status(201).json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all cars
// @route   GET /api/cars
// @access  Public
export const getCars = async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { type, minPrice, maxPrice } = req.query;
    
    // Build filter object
    const filter = { isAvailable: true };
    
    if (type) filter.type = type;
    if (minPrice) filter.pricePerDay = { $gte: Number(minPrice) };
    if (maxPrice) {
      filter.pricePerDay = { ...filter.pricePerDay, $lte: Number(maxPrice) };
    }

    const cars = await Car.find(filter).populate('owner', 'name email');
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get cars by owner
// @route   GET /api/cars/owner
// @access  Private/Owner
export const getOwnerCars = async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.user._id });
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get car by ID
// @route   GET /api/cars/:id
// @access  Public
export const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('owner', 'name email');

    if (car) {
      res.json(car);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a car
// @route   PUT /api/cars/:id
// @access  Private/Owner
export const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if user is the car owner
    if (car.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update car details
    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedCar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a car
// @route   DELETE /api/cars/:id
// @access  Private/Owner
export const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if user is the car owner
    if (car.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};