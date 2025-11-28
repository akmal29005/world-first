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