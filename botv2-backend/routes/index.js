import { Router } from 'express';

import userRoute from './user.route.js';

const router = Router();

router.use('/v1/me', userRoute);

export default router;
