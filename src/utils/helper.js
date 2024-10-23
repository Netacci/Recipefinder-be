import Recipe from '../model/v1/recipe.js';
import { client } from './aiClient.js';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();
export const findRecipeInDb = async (name) => {
  const regex = new RegExp(name, 'i');
  return await Recipe.findOne({ name: { $regex: regex } });
};

const generateRecipe = async (name, country) => {
  const prompt = `
  You are a food expert. Your task is to generate a detailed recipe for ${name} from ${country}
  
  If the food name "${name}" is not a valid or recognized dish, The output should strictly follow this JSON format below and don't write anything after the closing }:

  {
    "status": "not found"
  }

  If the food name is valid, create a detailed recipe. The recipe should include the following details:
  
  1. Name of the recipe as a string.
  2. A description of the recipe, mentioning its origin and any interesting information about the dish.
  3. An array of ingredients required to prepare the dish. This ingredients should be ingredients used locally and known by the country
  4. Step-by-step instructions as an array.
  5. The estimated cook time as a string.
  6. The estimated prep time as a string.
  7. The category of the dish (e.g., Main Course, Appetizer, Dessert).
  8. The total calories for the entire dish as a number.
  9. A calorie breakdown as an array of individual components (e.g., carbohydrates, protein, fats).
  
  The output should strictly follow this JSON format and don't write anything after the closing }:
  
  {
    "name": "[RECIPE NAME]",
    "description": "[DESCRIPTION]",
    "cook_time": "[COOK TIME]",
    "prep_time": "[PREP TIME]",
    "category": "[FOOD CATEGORY]",
    "totalCalories": [TOTAL CALORIES],
    "calorieBreakdown": [{"name": "[Calorie name]", "calories": [Calorie value]}, {"name": "[Calorie name]", "calories": [Calorie value]}],
    "ingredients": ["[Ingredient 1]", "[Ingredient 2]"],
    "instructions": ["[Step 1]", "[Step 2]"],
  }
  `;

  const response = await client.chat.completions.create({
    model: 'llama3-70b-8192',
    messages: [
      {
        role: 'system',
        content: 'You are a seasoned chef and an expert at cooking',
      },
      { role: 'user', content: prompt },
    ],
  });
  return response.choices[0].message.content;
};
export const generateAndSaveRecipe = async (name, country) => {
  const recipe = await generateRecipe(name, country);

  const jsonStartIndex = recipe.indexOf('{');
  const jsonString = recipe.substring(jsonStartIndex).trim();

  let recipeObject = null;

  try {
    recipeObject = JSON.parse(jsonString); // Parse the string to a JS object
  } catch (error) {
    logger.error('Error parsing Grok response:', error);
  }

  return recipeObject;
};

export const fetchImageFromPexels = async (foodName) => {
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${foodName}&per_page=1`,
    { headers: { Authorization: process.env.PEXELS_API_KEY } }
  );

  const data = await response.json();

  // Return a default value if no images are found
  if (data.photos.length === 0) {
    return {
      image: 'default-image-url.jpg',
      photographer: 'Unknown',
      photographer_url: 'Unknown',
    };
  }

  // Otherwise return the image and photographer info
  return {
    image: data.photos[0]?.src?.medium,
    photographer: data.photos[0]?.photographer,
    photographer_url: data.photos[0]?.photographer_url,
  };
};
