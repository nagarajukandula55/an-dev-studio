import { FailureRecord } from "./FailureRecord";

/**
 * Stores runtime failures for analysis + recovery
 */
export class HealingRegistry {
  private static failures: FailureRecord[] = [];

  public static record(failure: FailureRecord): void {
    this.failures.push(failure);
  }

  public static getAll(): FailureRecord[] {
    return this.failures;
  }

  public static getUnresolved(): FailureRecord[] {
    return this.failures.filter(f => !f.resolved);
  }

  public static markResolved(id: string): void {
    const f = this.failures.find(x => x.id === id);
    if (f) f.resolved = true;
  }
}