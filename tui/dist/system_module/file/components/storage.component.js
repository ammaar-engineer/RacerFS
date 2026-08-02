import { box } from '@clack/prompts';
import { fileService } from '../services/file.service.js';
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
function progressBar(used, total, width = 30) {
    const pct = total === 0 ? 0 : Math.min(used / total, 1);
    const filled = Math.round(pct * width);
    const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
    return `[${bar}] ${(pct * 100).toFixed(1)}%`;
}
export async function storageInfoComponent() {
    const info = await fileService.getStorageInfo();
    const content = [
        progressBar(info.used_storage, info.total_storage),
        `Used      : ${formatBytes(info.used_storage)} / ${formatBytes(info.total_storage)}`,
        `Available : ${formatBytes(info.available_storage)}`
    ].join('\n');
    box(content, 'Storage', {
        rounded: true,
        width: 'auto',
        contentAlign: 'left',
        contentPadding: 2
    });
}
//# sourceMappingURL=storage.component.js.map