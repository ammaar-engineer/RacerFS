import { box } from '@clack/prompts';
import 'dotenv/config';
import { createSelectOption } from './main_components/select.option';
import { LoginOrRegisterHandler } from './loginorregister/handler';
import { InitRacerFS } from "./main_components/init.system.js";
import { SnippetsHandler } from './snippets/handler';
import { FilesHandler } from './files/handler';
import { paymentsHandler } from './payments/handler';
import { testingHandler } from './testing/handler';

InitRacerFS()
box("Welcome to RacerFS TUI Menu", "Menu")

while(true) {
    await createSelectOption("What you will do?", [
        { label: 'Login/Register', action: LoginOrRegisterHandler },
        { label: 'Manage snippets', action: SnippetsHandler },
        { label: 'Manage files', action: FilesHandler },
        { label: 'Storage Management', action: paymentsHandler },
        { label: 'Use AI Mode', action: async () => console.log("AI Mode - Coming soon") },
        { label: 'Testing', action: testingHandler },
        { label: 'Exit', action: async () => process.exit(0) }
    ])
}