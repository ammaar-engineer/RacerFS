const selected_option = process.argv[2];
const option_list = {
    "auth": {
        "--register": "register operation",
        "--login": ""
    },
};
console.log(option_list[selected_option][process.argv[3]]);
export {};
//# sourceMappingURL=main.js.map