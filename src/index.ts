import { ANDevStudioCore } from "./core";

async function bootstrap() {
  const core = new ANDevStudioCore();
  await core.initialize();
}

bootstrap();