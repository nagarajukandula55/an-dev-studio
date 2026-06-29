import { StudioKernel } from "./core/kernel/StudioKernel";

async function main(): Promise<void> {
    await StudioKernel.boot();
}

main().catch((error) => {
    console.error("Studio boot failed:", error);
});