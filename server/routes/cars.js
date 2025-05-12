import express from 'express';
import { 
  createCar, 
  getCars, 
  getCarById, 
  updateCar, 
  deleteCar, 
  getOwnerCars 
} from '../controllers/carController.js';
import { protect, isOwner } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getCars)
  .post(protect, isOwner, createCar);

router.get('/owner', protect, isOwner, getOwnerCars);

router.route('/:id')
  .get(getCarById)
  .put(protect, isOwner, updateCar)
  .delete(protect, isOwner, deleteCar);

export default router;