export type RecipeCard = {
  id: string;
  title: string;
  description: string;
  tags: string[];
};

export const dummyRecipes: RecipeCard[] = [
  {
    id: 'creamy-beef-braciole',
    title: 'Creamy Beef Braciole',
    description: 'Rolled beef with a rich, silky sauce. Weeknight-friendly twist.',
    tags: ['60 min', 'High-protein', 'Comfort']
  },
  {
    id: 'spicy-garlic-prawns',
    title: 'Spicy Garlic Prawns',
    description: 'Fiery, buttery prawns with garlic, chili & lemon.',
    tags: ['15 min', 'One-pan', 'Seafood']
  },
  {
    id: 'lemon-herb-chicken',
    title: 'Lemon Herb Chicken',
    description: 'Zesty, juicy chicken breast with fresh herbs.',
    tags: ['30 min', 'High-protein', 'Low-carb']
  },
  {
    id: 'miso-butter-salmon',
    title: 'Miso Butter Salmon',
    description: 'Umami-rich salmon with caramelised miso crust.',
    tags: ['25 min', 'Omega-3', 'Low-carb']
  },
  {
    id: 'crispy-potato-smash',
    title: 'Crispy Potato Smash',
    description: 'Golden smashed potatoes with garlic & parsley.',
    tags: ['40 min', 'Side', 'Vegetarian']
  },
  {
    id: 'speedy-tuna-pasta',
    title: 'Speedy Tuna Pasta',
    description: 'Pantry staple pasta—savory, quick, satisfying.',
    tags: ['20 min', 'Budget', 'One-pan']
  }
];
