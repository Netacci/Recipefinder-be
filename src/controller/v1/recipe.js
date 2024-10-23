import Recipe from '../../model/v1/recipe.js';
import {
  fetchImageFromPexels,
  findRecipeInDb,
  generateAndSaveRecipe,
} from '../../utils/helper.js';

const getRecipe = async (req, res) => {
  const { name, country } = req.query;
  try {
    if (!name || !country) {
      return res.status(400).json({ message: 'name and country are required' });
    }
    let recipe = await findRecipeInDb(name);
    if (!recipe) {
      recipe = await generateAndSaveRecipe(name, country);

      let image = await fetchImageFromPexels(recipe.name);
      if (recipe.status === 'not found') {
        return res.status(404).json(recipe);
      }
      recipe.imageURL = image;
      recipe.searchName = name;
      const newRecipe = new Recipe(recipe);
      await newRecipe.save();
    }

    return res.status(200).json(recipe);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export { getRecipe };
