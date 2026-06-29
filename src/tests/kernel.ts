import { KernelTests } from "../core/kernel/KernelTests";

async function main() {
    await KernelTests.run();
}

main().catch(console.error);