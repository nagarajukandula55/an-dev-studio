import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { MicroAgent } from "../../core/types";
import { SchemaAgent } from "./SchemaAgent";
import { MigrationAgent } from "./MigrationAgent";
import { SeedAgent } from "./SeedAgent";
import { QueryAgent } from "./QueryAgent";
import { IndexOptimizationAgent } from "./IndexOptimizationAgent";

class DatabaseMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "database";
    readonly label = "Database";
    readonly description = "Schema design, migrations, seed data, queries, and index optimization — one micro-agent per concern.";
    readonly microAgents: MicroAgent[] = [
        new SchemaAgent(),
        new MigrationAgent(),
        new SeedAgent(),
        new QueryAgent(),
        new IndexOptimizationAgent(),
    ];
}

export const databaseMiniOrchestrator = new DatabaseMiniOrchestrator();
