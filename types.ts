
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

// Renamed to avoid name collision with the environment-provided AIStudio global type
export interface AIStudioClient {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

/**
 * Note: The window.aistudio property is pre-configured and globally declared by the environment.
 * Manually redeclaring it here (especially as a module augmentation) causes conflict errors 
 * regarding modifiers (like 'readonly') and type identity. We rely on the platform's 
 * existing global definitions for aistudio.
 */
