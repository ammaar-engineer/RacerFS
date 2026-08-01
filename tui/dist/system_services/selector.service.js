import { select, isCancel } from '@clack/prompts';
/**
 * Create interactive select menu
 */
export async function createSelectOption(message, options) {
    const selected = await select({
        message,
        options: options.map((opt, idx) => ({
            value: idx.toString(),
            label: opt.label
        }))
    });
    // Handle Ctrl+C (force exit)
    if (isCancel(selected)) {
        console.log('\nExited from RacerFS');
        process.exit(0);
    }
    if (typeof selected === 'string') {
        const idx = parseInt(selected, 10);
        const option = options[idx];
        if (option)
            await option.action();
    }
}
//# sourceMappingURL=selector.service.js.map