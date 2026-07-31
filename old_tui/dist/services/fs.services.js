import fs from 'fs';
import path from 'path';
export class ServicesClass {
    createFile(path, data, { isJson }) {
        isJson ? fs.writeFileSync(path, JSON.stringify(data, null, 2)) : fs.writeFileSync(path, data);
    }
    deleteFile(path) {
        fs.unlinkSync(path);
    }
    readFile(path, { isJson }) {
        return isJson ? JSON.parse(fs.readFileSync(path, 'utf8')) : fs.readFileSync(path).toString();
    }
    modifyJsonFile(path, newData) {
        const prevData = this.readFile(path, { isJson: true });
        this.createFile(path, { ...prevData, ...newData }, { isJson: true });
    }
    createFolder(path) {
        fs.mkdirSync(path);
    }
    createPath(...paths) {
        return path.join(...paths);
    }
}
export const serviceSystem = new ServicesClass();
//# sourceMappingURL=fs.services.js.map