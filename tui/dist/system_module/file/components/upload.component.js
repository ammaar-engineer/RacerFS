import { select } from '@clack/prompts';
import chalk from 'chalk';
import fs from 'node:fs';
import axios from 'axios';
import FormData from 'form-data';
import { fileService } from '../services/file.service.js';
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
export async function uploadFileComponent() {
    // List file di CWD
    const localFiles = fileService.listLocalFiles();
    if (localFiles.length === 0) {
        console.log(chalk.yellow('No files found in current directory'));
        return;
    }
    // User pilih file dari list
    const selected = await select({
        message: `Select file to upload (${process.cwd()})`,
        options: localFiles.map((f) => ({
            value: f.path,
            label: f.name,
            hint: formatBytes(f.size)
        }))
    });
    if (typeof selected !== 'string')
        return;
    const file = localFiles.find((f) => f.path === selected);
    const fileName = file.name;
    const fileSize = file.size;
    // Step 1: Get upload URL
    console.log(chalk.dim('→ Requesting upload URL...'));
    const { url, formData, fileKey } = await fileService.getUploadURL(fileName, fileSize);
    // Step 2: Upload ke S3/MinIO via multipart form-data
    console.log(chalk.dim('→ Uploading file...'));
    try {
        const form = new FormData();
        Object.entries(formData).forEach(([key, value]) => form.append(key, value));
        form.append('file', fs.createReadStream(file.path));
        await axios.post(url, form, { headers: form.getHeaders() });
    }
    catch {
        // Upload gagal, confirm FAILED ke backend
        await fileService.confirmUpload(fileName, fileKey, fileSize, 'FAILED');
        console.log(chalk.red('✗ Upload failed'));
        return;
    }
    // Step 3: Confirm upload ke backend
    console.log(chalk.dim('→ Confirming upload...'));
    await fileService.confirmUpload(fileName, fileKey, fileSize, 'SUCCESS');
    console.log(chalk.green(`✓ '${fileName}' uploaded successfully`));
}
//# sourceMappingURL=upload.component.js.map