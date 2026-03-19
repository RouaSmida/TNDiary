/** Canonical categories shared between DB, API, and UI */
export const CATEGORIES: Record<string, string[]> = {
  groceries: ['food_supplies', 'snacks', 'hygiene', 'cleaning'],
  bills: ['electricity', 'water', 'internet', 'subscriptions'],
  transport: ['public_transport', 'taxi'],
  health: ['pharmacy', 'doctor'],
  eating_out: ['restaurant', 'coffeeshop', 'fast_food', 'desserts'],
  shopping: ['clothes', 'shoes', 'accessories', 'makeup'],
  entertainment: ['cinema', 'events', 'fun_activities'],
  savings: ['emergency_fund', 'short_term_goal', 'long_term_goal'],
  family_friends: ['parents', 'siblings', 'partner', 'friends'],
  other: ['other'],
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];

export type CategoryKey = keyof typeof CATEGORIES;

export function isValidCategory(cat: string): cat is CategoryKey {
  return cat in CATEGORIES;
}

export function isValidSubcategory(cat: string, sub: string): boolean {
  return CATEGORIES[cat]?.includes(sub) ?? false;
}
