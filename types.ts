export enum NoteType {
  Top = 'Top',
  Heart = 'Heart',
  Base = 'Base'
}

export interface Ingredient {
  id: string;
  name: string;
  casNumber: string;
  molecularWeight: number;
  note: NoteType;
  chemicalFamily: string; // e.g., Terpene, Aldehyde, Ester
  biologicalReceptor: string; // e.g., OR1A1, OR5AN1
  neuroTrigger: string; // e.g., "Alertness", "Nostalgia", "Calm"
  quantity: number; // Percentage or relative parts
  description: string;
  coordinates: { x: number; y: number }; // X: Volatility/Freshness (0=Base/Warm, 100=Top/Fresh), Y: Character (0=Stimulating/Dry, 100=Narcotic/Soft)
}

export interface Formulation {
  name: string;
  description: string;
  ingredients: Ingredient[];
  totalSillage: number; // 0-100 scale
}