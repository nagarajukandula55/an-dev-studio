import {
  ServiceDescriptor,
  ServiceFactory,
  ServiceScope,
} from "./ServiceTypes";
import { ServiceToken } from "./ServiceTokens";

/**
 * ============================================================================
 * AN Dev Studio
 * Enterprise Service Container
 * ============================================================================
 *
 * Responsibilities
 *
 * • Register services
 * • Resolve services
 * • Manage Singleton lifetime
 * • Manage Transient lifetime
 * • Replace registrations
 * • Validate registrations
 * • Dispose services
 * ============================================================================
 */

export class ServiceContainer {

  private static readonly services = new Map<
    ServiceToken | string,
    ServiceDescriptor
  >();

  /**
   * Register service.
   */
  public static register(
    token: ServiceToken | string,
    factory: ServiceFactory,
    scope: ServiceScope = "singleton"
  ): void {

    if (this.services.has(token)) {
      throw new Error(`Service already registered: ${String(token)}`);
    }

    this.services.set(token, {
      token,
      factory,
      scope,
    });

  }

  /**
   * Replace an existing registration.
   */
  public static replace(
    token: ServiceToken | string,
    factory: ServiceFactory,
    scope: ServiceScope = "singleton"
  ): void {

    this.services.set(token, {
      token,
      factory,
      scope,
    });

  }

  /**
   * Register already-created instance.
   */
  public static registerInstance<T>(
    token: ServiceToken | string,
    instance: T
  ): void {

    this.services.set(token, {
      token,
      scope: "singleton",
      instance,
      factory: async () => instance,
    });

  }

  /**
   * Resolve service.
   */
  public static async resolve<T>(
    token: ServiceToken | string
  ): Promise<T> {

    const descriptor = this.services.get(token);

    if (!descriptor) {
      throw new Error(`Service not registered: ${String(token)}`);
    }

    switch (descriptor.scope) {

      case "singleton":

        if (descriptor.instance) {
          return descriptor.instance as T;
        }

        /**
         * Prevent duplicate singleton creation.
         */
        if (!descriptor.initializing) {

          descriptor.initializing = (async () => {

            const instance = await descriptor.factory();

            descriptor.instance = instance;

            return instance;

          })();

        }

        return await descriptor.initializing as T;

      case "transient":

        return await descriptor.factory() as T;

      case "scoped":

        /**
         * Scoped lifetime will be implemented
         * by ServiceScope.
         */
        return await descriptor.factory() as T;

      default:

        throw new Error(
          `Unsupported service scope: ${descriptor.scope}`
        );

    }

  }

  /**
   * Check registration.
   */
  public static has(
    token: ServiceToken | string
  ): boolean {

    return this.services.has(token);

  }

  /**
   * Remove registration.
   */
  public static unregister(
    token: ServiceToken | string
  ): boolean {

    return this.services.delete(token);

  }

  /**
   * Get descriptor.
   */
  public static get(
    token: ServiceToken | string
  ): ServiceDescriptor | undefined {

    return this.services.get(token);

  }

  /**
   * Get all registered tokens.
   */
  public static getAll(): readonly (ServiceToken | string)[] {

    return Object.freeze(
      [...this.services.keys()]
    );

  }

  /**
   * Number of services.
   */
  public static count(): number {

    return this.services.size;

  }

  /**
   * Validate registrations.
   */
  public static validate(): void {

    for (const descriptor of this.services.values()) {

      if (!descriptor.factory) {
        throw new Error(
          `Service '${String(descriptor.token)}' has no factory.`
        );
      }

    }

  }

  /**
   * Dispose singleton instances.
   */
  public static async dispose(): Promise<void> {

      for (const descriptor of this.services.values()) {

          /**
           * Skip services that were never instantiated.
           */
          if (!descriptor.instance) {
              continue;
          }

          /**
           * Dispose only object instances.
           * Static classes (ModuleManager, EventBus, etc.)
           * must never be disposed.
           */
          if (
              typeof descriptor.instance === "object" &&
              descriptor.instance !== null &&
              "dispose" in descriptor.instance &&
              typeof (descriptor.instance as any).dispose === "function"
          ) {

              await (descriptor.instance as {
                  dispose(): Promise<void> | void;
              }).dispose();

          }

      }

      this.services.clear();

  }

}