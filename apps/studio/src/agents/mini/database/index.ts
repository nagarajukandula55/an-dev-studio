import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { MicroAgent } from "../../core/types";
import { SchemaAgent } from "./SchemaAgent";
import { MigrationAgent } from "./MigrationAgent";

class DatabaseMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "database";
    readonly label = "Database";
    readonly description = "Schema design and migrations.";
    readonly microAgents: MicroAgent[] = [new SchemaAgent(), new MigrationAgent()];
}

export const databaseMiniOrchestrator = new DatabaseMiniOrchestrator();
