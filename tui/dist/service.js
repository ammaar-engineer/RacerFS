import fs from 'fs';
export class ServicesClass {
    createFile(path, data, { isJson }) {
        isJson ? fs.writeFileSync(path, JSON.stringify(data, null, 2)) : fs.writeFileSync(path, data);
    }
    deleteFile(path) {
        fs.unlinkSync(path);
    }
    readFile(path, { isJson }) {
        return isJson ? JSON.parse(fs.readFileSync(path, 'utf8')) : fs.readFileSync(path, 'utf8');
    }
    createFolder(path) {
        fs.mkdirSync(path);
    }
    createPath(...path) {
        return path.join(...path);
    }
}
export const serviceSystem = new ServicesClass();
//# sourceMappingURL=service.js.map