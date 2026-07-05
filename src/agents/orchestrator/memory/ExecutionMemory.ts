export interface ExecutionRecord {
  taskId: string;
  timestamp: number;
  graphSignature: string;
  success: boolean;
  confidence: number;
  insights: string[];
}

export class ExecutionMemory {
  private history: ExecutionRecord[] = [];

  record(entry: ExecutionRecord) {
    this.history.push(entry);
  }

  getRecent(limit = 50): ExecutionRecord[] {
    return this.history.slice(-limit);
  }

  getSuccessPatterns() {
    return this.history.filter((h) => h.success);
  }

  getFailurePatterns() {
    return this.history.filter((h) => !h.success);
  }
}