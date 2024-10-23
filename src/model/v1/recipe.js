import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  name: String,
  description: String,
  imageURL: { image: String, photographer: String, photographer_url: String },
  cook_time: String,
  prep_time: String,
  category: String,
  totalCalories: Number,
  calorieBreakdown: [
    {
      name: String,
      calories: Number,
    },
  ],
  ingredients: [String],
  instructions: [String],
  searchName: String,
});

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;
