import path from "path";
import log from "./logger";
const fs = require('fs');

export function isFileExists(path: string): boolean {
    return fs.existsSync(path)
}

export function readFileLength(path: string): number {
    const stats = fs.statSync(path);
    return stats.size;
}
export function readFileLastModifiedTime(path: string): number {
    const stats = fs.statSync(path);
    return stats.mtime;
}
export function isFileModifiedToday(path: string): boolean {
    const now = new Date();
    const mtime = readFileLastModifiedTime(path)
    const lastModified = new Date(mtime);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return lastModified >= startOfDay && lastModified < endOfDay
}
export function write2File(path: string, content: any): void {
    fs.writeFile(path, JSON.stringify(content), (error) => {
        log('writeData2File-----error:', error)
    })
}
export function readFromFile(dir:string,fileName: string,callback: (data: string) => void){
    const filePath = path.join(dir,fileName)
    if(!isFileExists(filePath)){
        callback("")
    }
    fs.readFile(filePath, 'utf8', (error, data) => {
        if (!error) {
            callback(data)
        }
    })
}
export function deleteFile(filePath: string): void {
    fs.unlink(filePath, (error) => {
        if (error) {
            log('deleteFile-----error:', error)
        }
    })
}
export function readJsonFile(filePath: string,callback: (data: string) => void) {
    fs.readFile(filePath, 'utf8', (error, data) => {
        if (!error) {
            callback(data)
        }
    })
}
