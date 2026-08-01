import chalk from 'chalk';
import { fileService } from '../services/file.service.js';
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
export async function listFileComponent() {
    const files = await fileService.getList();
    if (files.length === 0) {
        console.log(chalk.yellow('No files found'));
        return;
    }
    console.log('');
    files.forEach((f) => {
        const visibility = f.is_public ? chalk.green('public ') : chalk.dim('private');
        const size = chalk.dim(formatBytes(f.size).padStart(10));
        console.log(`${visibility}  ${size}  ${chalk.white(f.name)}`);
    });
    console.log('');
}
//# sourceMappingURL=list.component.js.map