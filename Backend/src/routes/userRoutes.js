import express from 'express';
import { registerUser, getUserInfo } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/:id', getUserInfo);

export default router;

