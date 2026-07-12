import { ModuleManager } from "../core/module/ModuleManager";
import { ModuleRegistry } from "../core/module/ModuleRegistry";
import { StudioModule } from "../core/module/Module";

async function run() {

    console.log("========================================");
    console.log("MODULE SYSTEM TEST");
    console.log("========================================");

    let initialized = false;
    let disposed = false;

    const module: StudioModule = {

        id: "test.module",

        name: "Test Module",

        description: "Framework Test",

        version: "1.0.0",

        category: "development",

        icon: "🧪",

        routes: [],

        commands: [],

        permissions: [],

        priority: 1,

        tags: ["test"],

        async initialize() {

            initialized = true;

        },

        async dispose() {

            disposed = true;

        }

    };

    /*
     * Register
     */

    ModuleManager.register(module);

    console.log(
        "Register:",
        ModuleManager.count() === 1 ? "PASS" : "FAIL"
    );

    /*
     * Duplicate Register
     */

    try {

        ModuleManager.register(module);

        console.log("Duplicate Register: FAIL");

    }
    catch {

        console.log("Duplicate Register: PASS");

    }

    /*
     * Initialize
     */

    await ModuleManager.initialize(module);

    console.log(
        "Initialize:",
        initialized ? "PASS" : "FAIL"
    );

    /*
     * Running State
     */

    const descriptor = ModuleRegistry.get(module.id);

    console.log(
        "Running:",
        descriptor?.state === "RUNNING"
            ? "PASS"
            : "FAIL"
    );

    /*
     * Restart
     */

    await ModuleManager.restart(module.id);

    console.log("Restart: PASS");

    /*
     * Dispose
     */

    await ModuleManager.dispose(module);

    console.log(
        "Dispose:",
        disposed ? "PASS" : "FAIL"
    );

    /*
     * Unregister
     */

    ModuleManager.unregister(module.id);

    console.log(
        "Unregister:",
        ModuleManager.count() === 0 ? "PASS" : "FAIL"
    );

    console.log("========================================");
    console.log("MODULE TEST COMPLETE");
    console.log("========================================");

}

run().catch(console.error);