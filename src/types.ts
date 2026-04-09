export type StepId = 
  | '4.2.1-1' | '4.2.1-2-1' | '4.2.1-2-2' | '4.2.1-2-3' | '4.2.1-3-1' | '4.2.1-3-2' | '4.2.1-4'
  | '4.2.2-1' | '4.2.2-2'
  | '4.2.3-1' | '4.2.3-2' | '4.2.3-3';

export interface AppState {
  currentStep: StepId;
  data: {
    preparation?: {
      hotspot: string;
      spacing: string;
    };
    assembly?: {
      tubeModel: string;
      connectorModel: string;
      connectionMethod: string;
      alignment: string;
      fixation: string;
    };
    // ... other data fields
  };
}
