import { Router } from 'express';
import { getRecipe } from '../../controller/v1/recipe.js';

const router = Router();
router.get('/', getRecipe);

export default router;
