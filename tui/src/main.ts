#!/usr/bin/env tsx

import { box } from '@clack/prompts';
import 'dotenv/config';
import { FilesHandler } from './files/handler';
import { LoginOrRegisterHandler } from './loginorregister/handler';
import { InitRacerFS } from './main_components/init.system';
import { createSelectOption } from './main_components/select.option';
import { paymentsHandler } from './payments/handler';
import { SnippetsHandler } from './snippets/handler';
import { testingHandler } from './testing/handler';

InitRacerFS()
box("Welcome to RacerFS TUI Menu", "Menu")
process.on("SIGINT", () => {
  console.log("Exist forcely from RacerFS")
  process.exit(0)
})
while (true) {
  await createSelectOption("Availble RacerFS Menu:", [
    { label: 'Login/Register', action: LoginOrRegisterHandler },
    { label: 'Manage snippets', action: SnippetsHandler },
    { label: 'Manage files', action: FilesHandler },
    { label: 'Storage Management', action: paymentsHandler },
    { label: 'Use AI Mode', action: async () => console.log("AI Mode - Coming soon") },
    { label: 'Testing', action: testingHandler },
    { label: 'Exit', action: async () => process.exit(0) }
  ])
}
