import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { access } from 'fs/promises';
import fs from 'fs';
import path from 'path';

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
// Derive the directory path from the file path
const __dirname = dirname(__filename);

export const getDir = (folder) => path.join(__dirname, '..', folder);
export const getFileExt = (filename) => path.extname(filename);

export const isDirExists = async (dirPath) => {
    try {
        await access(dirPath, fs.constants.F_OK);
        return true;
    } catch(error) {
        return false;
    }
}
