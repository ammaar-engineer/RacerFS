import fs from 'fs'
import path from 'path'

export class ServicesClass {
    createFile(path: string, data: any, {isJson}: {isJson: boolean}) {
        isJson ? fs.writeFileSync(path, JSON.stringify(data, null, 2)) : fs.writeFileSync(path, data)
    }
    deleteFile(path: string) {
        fs.unlinkSync(path)
    }
    readFile(path: string, {isJson}: {isJson: boolean}) {
        return isJson ? JSON.parse(fs.readFileSync(path, 'utf8')) : fs.readFileSync(path).toString()
    }
    modifyJsonFile(path: string, newData: any) {
        const prevData = this.readFile(path, {isJson: true})
        this.createFile(path, {...prevData, ...newData}, {isJson: true})
    }

    createFolder(path: string) {
        fs.mkdirSync(path)
    }

    createPath(...paths: string[]) {
        return path.join(...paths)
    }
}

export const serviceSystem = new ServicesClass()