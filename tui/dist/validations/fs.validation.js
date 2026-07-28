import fs from 'fs';
class ValidationsClass {
    FileShouldBe(beWhat, pathTarget, { autoexit }) {
        const fileExist = fs.existsSync(pathTarget);
        const convertToBoolean = fileExist ? 'exist' : 'notexist';
        if (convertToBoolean != beWhat && autoexit) {
            process.stdout.write(`[ERROR]: ${pathTarget} does not exist`);
            process.exit(1);
        }
        return convertToBoolean == beWhat;
    }
    FolderShouldBe(beWhat, pathTarget, { autoexit }) {
        const folderExist = fs.existsSync(pathTarget);
        const convertToBoolean = folderExist ? 'exist' : 'notexist';
        if (convertToBoolean != beWhat && autoexit) {
            process.stdout.write(`[ERROR]: ${pathTarget} does not exist`);
            process.exit(1);
        }
        return convertToBoolean == beWhat;
    }
}
export const validationSystem = new ValidationsClass();
//# sourceMappingURL=fs.validation.js.map