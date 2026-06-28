/**
 * ============================================================================
 * AN Dev Studio
 * Service Container - Types
 * ============================================================================
 */

/**
 * Supported service lifetimes.
 */
export type ServiceScope =
  | "singleton"
  | "transient"
  | "scoped";

/**
 * Async service factory.
 */
export type ServiceFactory<T = unknown> =
  () => T | Promise<T>;

/**
 * Internal service registration descriptor.
 */
export interface ServiceDescriptor<T = unknown> {

  /**
   * Service token.
   */
  token: string;

  /**
   * Factory used to create the service.
   */
  factory: ServiceFactory<T>;

  /**
   * Lifetime.
   */
  scope: ServiceScope;

  /**
   * Cached singleton instance.
   */
  instance?: T;

  /**
   * Used internally to prevent duplicate
   * singleton creation during concurrent resolve().
   */
  initializing?: Promise<T>;

}