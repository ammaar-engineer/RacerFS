#!/usr/bin/env node

import { box } from '@clack/prompts'
import 'dotenv/config'
import { InitRacerFS } from './system_services/init.system.service.js'
import { createSelectOption } from './system_services/selector.service.js'
import { LoginOrRegisterHandler } from './system_module/auth/handler.js'
import { SnippetsHandler } from './system_module/snippet/handler.js'
import { FilesHandler } from './system_module/file/handler.js'
import { testingHandler } from './system_module/testing/handler.js'

InitRacerFS()
box('Welcome to RacerFS TUI Menu', 'Menu')

process.on('SIGINT', () => {
  console.log('\nExited from RacerFS')
  process.exit(0)
})

while (true) {
  await createSelectOption('Available RacerFS Menu:', [
    { label: 'Login/Register', action: LoginOrRegisterHandler },
    { label: 'Manage snippets', action: SnippetsHandler },
    { label: 'Manage files', action: FilesHandler },
    { label: 'Storage Management', action: async () => console.log('Coming soon') },
    { label: 'Use AI Mode', action: async () => console.log('Coming soon') },
    { label: 'Testing', action: testingHandler },
    { label: 'Exit', action: async () => process.exit(0) }
  ])
}
