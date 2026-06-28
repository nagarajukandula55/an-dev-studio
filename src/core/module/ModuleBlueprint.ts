export interface ModuleBlueprint {
  id: string;
  name: string;
  purpose: string;

  events: string[];

  inputs: Record<string, any>;

  outputs: Record<string, any>;

  generatedAt: number;

  status: "DRAFT" | "ACTIVE" | "FAILED";
}