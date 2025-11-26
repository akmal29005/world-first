export enum Category {
  FIRST_HEARTBREAK = 'First Heartbreak',
  FIRST_JOB = 'First Job',
  FIRST_OCEAN = 'First Ocean',
  FIRST_TRAVEL = 'First Travel',
  OTHER = 'Other'
}

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
}

export interface FilterState {
  category: Category | 'ALL';
}

export type Coordinate = {
  lat: number;
  lng: number;
}