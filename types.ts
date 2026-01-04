
export type ImageSize = '1K' | '2K' | '4K';

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface DiscoveryQuestion {
  id: string;
  question: string;
  context: string;
}

export interface LogoProject {
  id: string;
  name: string;
  description: string;
  questions?: DiscoveryQuestion[];
  answers?: Record<string, string>;
  research?: string;
  sources?: GroundingSource[];
  imageUrl?: string;
  createdAt: number;
}

// Define the AIStudio interface to be used in the global Window declaration
export interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    // The environment defines aistudio as a readonly property of type AIStudio
    readonly aistudio: AIStudio;
  }
}

export {};
