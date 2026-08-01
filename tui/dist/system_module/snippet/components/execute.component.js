import { select } from '@clack/prompts';
import chalk from 'chalk';
import { spawn } from 'node:child_process';
import { snippetService } from '../services/snippet.service.js';
export async function executeSnippetComponent() {
    // Fetch-first: ambil list dulu
    const snippets = await snippetService.getList();
    if (snippets.length === 0) {
        console.log(chalk.yellow('No snippets to execute'));
        return;
    }
    // Pilih snippet yang akan dieksekusi
    const selected = await select({
        message: 'Select snippet to execute',
        options: snippets.map((s) => ({
            value: s.alias,
            label: s.alias,
            hint: s.command
        }))
    });
    if (typeof selected !== 'string')
        return;
    const snippet = snippets.find((s) => s.alias === selected);
    console.log(chalk.dim(`→ Executing: ${snippet.command}`));
    // Jalankan command via spawn (inherit stdio agar output langsung ke terminal)
    const child = spawn(snippet.command, {
        shell: true,
        stdio: 'inherit',
        cwd: process.cwd()
    });
    child.on('error', (err) => {
        console.log(chalk.red(`✗ Failed to execute: ${err.message}`));
    });
    child.on('close', (code) => {
        if (code === 0) {
            console.log(chalk.green(`✓ Done (exit code ${code})`));
        }
        else {
            console.log(chalk.red(`✗ Exited with code ${code}`));
        }
    });
    // Tunggu process selesai
    await new Promise((resolve) => child.on('close', () => resolve()));
}
//# sourceMappingURL=execute.component.js.map