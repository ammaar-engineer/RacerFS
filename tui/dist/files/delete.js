import { fileServices } from "../services/file.services.js";
import { select } from "@clack/prompts";
import chalk from "chalk";
function formatBytes(bytes) {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    const gb = mb / 1024;
    if (gb >= 1) {
        return `${gb.toFixed(2)} GB`;
    }
    else if (mb >= 1) {
        return `${mb.toFixed(2)} MB`;
    }
    else if (kb >= 1) {
        return `${kb.toFixed(2)} KB`;
    }
    else {
        return `${bytes} bytes`;
    }
}
export async function deleteFile() {
    const files = await fileServices.getFileList();
    if (files.length === 0) {
        console.log(chalk.yellow("\nNo files to delete\n"));
        return;
    }
    const selectedName = await select({
        message: "Select file to delete",
        options: files.map(f => ({
            value: f.name,
            label: f.name,
            hint: `${formatBytes(f.size)} - ${f.is_public ? 'Public' : 'Private'}`
        }))
    });
    if (!selectedName) {
        console.log(chalk.dim("\nDeletion cancelled\n"));
        return;
    }
    const file = files.find(f => f.name === selectedName);
    console.log(chalk.yellow(`\nYou are about to delete:`));
    console.log(chalk.dim(`  Name: ${file.name}`));
    console.log(chalk.dim(`  Size: ${formatBytes(file.size)}`));
    const confirm = await select({
        message: `Are you sure?`,
        options: [
            { value: 'yes', label: 'Yes, delete it', hint: "This cannot be undone" },
            { value: 'no', label: 'No, cancel', hint: "Keep the file" }
        ]
    });
    if (confirm === 'yes') {
        try {
            await fileServices.deleteFile(selectedName);
            console.log(chalk.green(`\n✓ File '${selectedName}' deleted successfully\n`));
        }
        catch (error) {
            console.log(chalk.red("\n✗ Delete failed\n"));
        }
    }
    else {
        console.log(chalk.dim("\nDeletion cancelled\n"));
    }
}
//# sourceMappingURL=delete.js.map