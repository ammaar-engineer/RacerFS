export class OptionsValidation {
    isOptionShouldExist(option, choosed, { errmsg, throwErr }) {
        if (!Object.keys(option).includes(choosed)) {
            console.log(errmsg);
            process.exit(0);
            return !Object.keys(option).includes(choosed);
        }
    }
}
//# sourceMappingURL=options.validation.js.map