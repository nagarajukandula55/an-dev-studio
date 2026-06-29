import { ServiceContainer } from "../core/container/ServiceContainer";

async function run() {

    console.log("========================================");
    console.log("SERVICE CONTAINER TEST");
    console.log("========================================");

    /*
     * -------------------------------------------------------
     * Singleton
     * -------------------------------------------------------
     */

    class SingletonService {
        id = Math.random();
    }

    ServiceContainer.register(
        "singleton",
        async () => new SingletonService(),
        "singleton"
    );

    const s1 = await ServiceContainer.resolve<SingletonService>("singleton");
    const s2 = await ServiceContainer.resolve<SingletonService>("singleton");

    console.log(
        "Singleton:",
        s1 === s2 ? "PASS" : "FAIL"
    );

    /*
     * -------------------------------------------------------
     * Transient
     * -------------------------------------------------------
     */

    class TransientService {
        id = Math.random();
    }

    ServiceContainer.register(
        "transient",
        async () => new TransientService(),
        "transient"
    );

    const t1 = await ServiceContainer.resolve<TransientService>("transient");
    const t2 = await ServiceContainer.resolve<TransientService>("transient");

    console.log(
        "Transient:",
        t1 !== t2 ? "PASS" : "FAIL"
    );

    /*
     * -------------------------------------------------------
     * Replace
     * -------------------------------------------------------
     */

    ServiceContainer.replace(
        "singleton",
        async () => ({ version: 2 }),
        "singleton"
    );

    const replaced = await ServiceContainer.resolve<any>("singleton");

    console.log(
        "Replace:",
        replaced.version === 2 ? "PASS" : "FAIL"
    );

    /*
     * -------------------------------------------------------
     * Instance Registration
     * -------------------------------------------------------
     */

    const logger = {
        name: "Logger"
    };

    ServiceContainer.registerInstance(
        "logger",
        logger
    );

    const logger2 =
        await ServiceContainer.resolve<typeof logger>("logger");

    console.log(
        "Register Instance:",
        logger === logger2 ? "PASS" : "FAIL"
    );

    /*
     * -------------------------------------------------------
     * Count
     * -------------------------------------------------------
     */

    console.log(
        "Service Count:",
        ServiceContainer.count()
    );

    /*
     * -------------------------------------------------------
     * Validate
     * -------------------------------------------------------
     */

    try {

        ServiceContainer.validate();

        console.log("Validate: PASS");

    }
    catch {

        console.log("Validate: FAIL");

    }

    /*
     * -------------------------------------------------------
     * Dispose
     * -------------------------------------------------------
     */

    await ServiceContainer.dispose();

    console.log(
        "Disposed Count:",
        ServiceContainer.count()
    );

    console.log("========================================");
    console.log("TEST COMPLETE");
    console.log("========================================");

}

run().catch(console.error);