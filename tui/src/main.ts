import { box, select } from '@clack/prompts';
import 'dotenv/config';
import { LoginOrRegisterHandler } from './loginorregister/handler';
import { SnippetsHandler } from './snippets/handler';
import { InitRacerFS } from "./main_components/init.system.js";

InitRacerFS()
box("Welcome to RacerFS TUI Menu", "Menu")
const selectedOption = await select({
    message: "What you will do?",
    options: [
        {value: 'login/register', label: 'Login/Register', hint: "For authentication"},
        {value: 'manage-snippets', label: 'Manage snippets', hint: "Take action of your snippets"},
        {value: 'manage-files', label: "Manage files", hint: "Take action of your files"},
        {value: 'manage-ai', label: 'use AI Mode', hint: "Use your AI"}
    ]
})
const options = {
    'login/register': LoginOrRegisterHandler,
    'manage-snippets': SnippetsHandler
}
await (options as any)[selectedOption]()
// registerComponent()