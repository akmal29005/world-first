export enum Category {
  FIRST_HEARTBREAK = 'First Heartbreak',
  FIRST_JOB = 'First Job',
  FIRST_OCEAN = 'First Ocean',
  FIRST_TRAVEL = 'First Travel',
  FIRST_HOME = 'First Home',
  FIRST_LOSS = 'First Loss',
  FIRST_ACHIEVEMENT = 'First Achievement',
  OTHER = 'Other'
}

// Category icon mapping
export const CATEGORY_ICONS: Record<Category, string> = {
  [Category.FIRST_HEARTBREAK]: '💔',
  [Category.FIRST_JOB]: '💼',
  [Category.FIRST_OCEAN]: '🌊',
  [Category.FIRST_TRAVEL]: '✈️',
  [Category.FIRST_HOME]: '🏡',
  [Category.FIRST_LOSS]: '🕊️',
  [Category.FIRST_ACHIEVEMENT]: '🏆',
  [Category.OTHER]: '✨'
};

// Category color mapping (Neon Palette)
export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.FIRST_HEARTBREAK]: '#ef4444', // Red-500
  [Category.FIRST_JOB]: '#f59e0b',        // Amber-500
  [Category.FIRST_OCEAN]: '#0ea5e9',      // Sky-500
  [Category.FIRST_TRAVEL]: '#8b5cf6',     // Violet-500
  [Category.FIRST_HOME]: '#10b981',       // Emerald-500
  [Category.FIRST_LOSS]: '#64748b',       // Slate-500
  [Category.FIRST_ACHIEVEMENT]: '#eab308', // Yellow-500
  [Category.OTHER]: '#ec4899'             // Pink-500
};

export interface Story {
  id: string;
  category: Category;
  year: number;
  text: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  country?: string;
  reactionCount?: number;
  reaction_heart?: number;
  reaction_metoo?: number;
  reaction_hug?: number;
  views?: number;
  createdAt?: string;
}

export interface FilterState {
  category: Category | 'ALL';
}

export type Coordinate = {
  lat: number;
  lng: number;
}