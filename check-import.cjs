const fs = require("fs");
const path = require("path");

async function fixImportStatements(srcDir) {
    const processFile = async (filePath) => {
        if (!filePath.match(/\.(js|jsx|ts|tsx)$/)) {
            return;
        }
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            // Regex to match imports with version specifiers
            // Example: import { Slot } from "@radix-ui/react-slot@1.1.2"
            const versionSpecifierRegex = /from\s+["']([^"']+)@[\d\.\-\w]+["']/g;
            const fixedContent = content.replace(versionSpecifierRegex, (match, packageName) => {
                return `from "${packageName}"`;
            });
            if (content !== fixedContent) {
                await fs.promises.writeFile(filePath, fixedContent, 'utf8');
                console.log(`Fixed imports in: ${filePath}`);
            }
        }
        catch (error) {
            console.error(`Error processing file ${filePath}:`, error);
        }
    };
    const processDirectory = async (dir) => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await processDirectory(fullPath);
            }
            else {
                await processFile(fullPath);
            }
        }
    };
    await processDirectory(srcDir);
}

fixImportStatements(".")