import { box, select } from '@clack/prompts';
import chalk from 'chalk';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileService } from '../../file/services/file.service.js';
import { fsService } from '../../../system_services/fs.service.js';
export async function downloadPublicComponent() {
    // Get access tokens from local storage
    const userData = fsService.readUserData();
    const accessTokens = userData?.access_tokens ?? [];
    if (accessTokens.length === 0) {
        box('No access tokens available. Create one first via "Manage Access Tokens".', 'Download Public', {
            rounded: true,
            width: 'auto',
            contentAlign: 'center',
            contentPadding: 4
        });
        return;
    }
    // Select access token
    const selectedToken = await select({
        message: 'Select access token to use',
        options: accessTokens.map((token, idx) => ({
            value: token,
            label: `Token ${idx + 1}`,
            hint: token.substring(0, 20) + '...'
        }))
    });
    if (typeof selectedToken !== 'string')
        return;
    // Fetch public files from token owner
    console.log(chalk.dim('→ Fetching public files from token owner...'));
    const files = await fileService.getPublicList(selectedToken);
    if (files.length === 0) {
        box('No public files available from this token owner', 'Download Public', {
            rounded: true,
            width: 'auto',
            contentAlign: 'center',
            contentPadding: 4
        });
        return;
    }
    // Select file from list
    const selectedFile = await select({
        message: 'Select file to download',
        options: files.map((f) => ({
            value: f.name,
            label: f.name,
            hint: `${(f.size / 1024).toFixed(2)} KB • ${f.file_type || 'unknown'}`
        }))
    });
    if (typeof selectedFile !== 'string')
        return;
    // Get presigned download URL for selected file
    console.log(chalk.dim('→ Getting download URL...'));
    const downloadData = await fileService.getPublicDownloadURL(selectedFile, selectedToken);
    // Download via curl ke CWD dengan nama asli dari backend
    const outputPath = path.join(process.cwd(), downloadData.file.name);
    console.log(chalk.dim(`→ Downloading ${downloadData.file.name} (${downloadData.file.type})...`));
    const result = spawnSync('curl', ['-fsSL', '-o', outputPath, downloadData.url], {
        stdio: 'inherit'
    });
    if (result.status !== 0) {
        box('Download failed', 'Download Public', {
            rounded: true,
            width: 'auto',
            contentAlign: 'center',
            contentPadding: 4
        });
        return;
    }
    box(`File '${selectedFile}' downloaded to ${outputPath}`, 'Download Public', {
        rounded: true,
        width: 'auto',
        contentAlign: 'center',
        contentPadding: 4
    });
}
//# sourceMappingURL=download-public.component.js.map