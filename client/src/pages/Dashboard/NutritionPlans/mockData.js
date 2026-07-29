export const nutritionMockData = {
  dailyCalories: {
    current: 450,
    target: 600
  },
  mealsToday: 2,
  waterIntake: {
    current: 400,
    target: 800
  },
  weightGoal: {
    current: 28.5,
    target: 27.0
  },
  mealPlan: [
    {
      id: 1,
      name: 'Breakfast',
      food: 'Royal Canin Adult',
      quantity: '1 cup',
      time: '8:00 AM',
      calories: 250,
      completed: true
    },
    {
      id: 2,
      name: 'Lunch',
      food: 'Chicken & Rice (Home cooked)',
      quantity: '0.5 cup',
      time: '1:00 PM',
      calories: 200,
      completed: true
    },
    {
      id: 3,
      name: 'Dinner',
      food: 'Royal Canin Adult + Salmon Oil',
      quantity: '1 cup',
      time: '7:00 PM',
      calories: 300,
      completed: false
    }
  ],
  nutritionTips: [
    "Increase water intake, especially after evening walks.",
    "Avoid excessive treats. Keep them to less than 10% of daily caloric intake.",
    "Maintain a regular feeding schedule to aid digestion."
  ]
};
