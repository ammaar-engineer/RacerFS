#!/usr/bin/env node
import { box } from '@clack/prompts';
import 'dotenv/config';
import { FilesHandler } from './files/handler.js';
import { LoginOrRegisterHandler } from './loginorregister/handler.js';
import { InitRacerFS } from './main_components/init.system.js';
import { createSelectOption } from './main_components/select.option.js';
import { paymentsHandler } from './payments/handler.js';
import { SnippetsHandler } from './snippets/handler.js';
import { testingHandler } from './testing/handler.js';
InitRacerFS();
box("Welcome to RacerFS TUI Menu", "Menu");
process.on("SIGINT", () => {
    console.log("Exist forcely from RacerFS");
    process.exit(0);
});
while (true) {
    await createSelectOption("Availble RacerFS Menu:", [
        { label: 'Login/Register', action: LoginOrRegisterHandler },
        { label: 'Manage snippets', action: SnippetsHandler },
        { label: 'Manage files', action: FilesHandler },
        { label: 'Storage Management', action: paymentsHandler },
        { label: 'Use AI Mode', action: async () => console.log("AI Mode - Coming soon") },
        { label: 'Testing', action: testingHandler },
        { label: 'Exit', action: async () => process.exit(0) }
    ]);
}
//# sourceMappingURL=main.js.map