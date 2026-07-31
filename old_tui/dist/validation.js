import fs from 'fs';
class ValidationsClass {
    FileShouldBe(beWhat, pathTarget, { autoexit }) {
        const fileExist = fs.existsSync(pathTarget);
        const convertToBoolean = fileExist ? 'exist' : 'notexist';
        if (convertToBoolean != beWhat && autoexit)
            process.exit(1);
        process.stdout.write(`[ERROR]: ${pathTarget} does not exist`);
        return convertToBoolean == beWhat;
    }
    FolderShouldBe(beWhat, pathTarget, { autoexit }) {
        const folderExist = fs.existsSync(pathTarget);
        const convertToBoolean = folderExist ? 'exist' : 'notexist';
        if (convertToBoolean != beWhat && autoexit)
            process.exit(1);
        process.stdout.write(`[ERROR]: ${pathTarget} does not exist`);
        return convertToBoolean == beWhat;
    }
}
export const validationSystem = new ValidationsClass();
//# sourceMappingURL=validation.js.map