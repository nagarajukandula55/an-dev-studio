export type RecoveryAction =
  | "RETRY"
  | "IGNORE"
  | "ISOLATE_HANDLER"
  | "REWRITE_PAYLOAD"
  | "ESCALATE_AI";

export interface AIRecoveryDecision {
  action: RecoveryAction;
  reason: string;
  confidence: number;
  modifiedPayload?: any;
}