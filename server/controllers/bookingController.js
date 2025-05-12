import Booking from '../models/Booking.js';
import Car from '../models/Car.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private/Customer
export const createBooking = async (req, res) => {
  const { carId, startDate, endDate } = req.body;

  try {
    // Find the car
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (!car.isAvailable) {
      return res.status(400).json({ message: 'Car is not available for booking' });
    }

    // Calculate total days and price
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (totalDays <= 0) {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    const totalPrice = totalDays * car.pricePerDay;

    // Create booking
    const booking = await Booking.create({
      car: carId,
      customer: req.user._id,
      startDate,
      endDate,
      totalDays,
      totalPrice,
      status: 'Pending',
    });

    // Update car availability
    car.isAvailable = false;
    await car.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Process booking payment
// @route   PUT /api/bookings/:id/pay
// @access  Private/Customer
export const processPayment = async (req, res) => {
  const { paymentSuccess } = req.body;

  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the booking customer
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update booking status based on payment success
    booking.status = paymentSuccess ? 'Paid' : 'Failed';
    
    // If payment failed, make the car available again
    if (!paymentSuccess) {
      const car = await Car.findById(booking.car);
      if (car) {
        car.isAvailable = true;
        await car.save();
      }
    }

    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get customer bookings
// @route   GET /api/bookings/customer
// @access  Private/Customer
export const getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate({
        path: 'car',
        select: 'name type pricePerDay image',
        populate: {
          path: 'owner',
          select: 'name',
        },
      });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get owner bookings
// @route   GET /api/bookings/owner
// @access  Private/Owner
export const getOwnerBookings = async (req, res) => {
  try {
    // Find all cars owned by the user
    const cars = await Car.find({ owner: req.user._id });
    const carIds = cars.map(car => car._id);

    // Find all bookings for these cars
    const bookings = await Booking.find({ car: { $in: carIds } })
      .populate({
        path: 'car',
        select: 'name type pricePerDay image',
      })
      .populate({
        path: 'customer',
        select: 'name email',
      });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private/Customer
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the booking customer
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only pending bookings can be cancelled
    if (booking.status !== 'Pending') {
      return res.status(400).json({ message: 'Booking cannot be cancelled' });
    }

    booking.status = 'Cancelled';
    
    // Make the car available again
    const car = await Car.findById(booking.car);
    if (car) {
      car.isAvailable = true;
      await car.save();
    }

    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};