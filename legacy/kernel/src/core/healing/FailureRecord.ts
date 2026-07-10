import { EventKey } from "../events/EventPipeline";

/**
 * Represents a system failure captured during runtime
 */
export interface FailureRecord {
  id: string;
  eventType: EventKey;
  error: string;
  timestamp: number;
  retryCount: number;
  resolved: boolean;
}