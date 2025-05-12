import express from 'express';
import { 
  createBooking, 
  processPayment, 
  getCustomerBookings, 
  getOwnerBookings,
  cancelBooking
} from '../controllers/bookingController.js';
import { protect, isCustomer, isOwner } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, isCustomer, createBooking);
router.put('/:id/pay', protect, isCustomer, processPayment);
router.put('/:id/cancel', protect, isCustomer, cancelBooking);
router.get('/customer', protect, isCustomer, getCustomerBookings);
router.get('/owner', protect, isOwner, getOwnerBookings);

export default router;