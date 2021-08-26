"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require('chalk');
class CommonDoggo {
    constructor() {
        this.name = 'noNameDoggo';
        this.config = {
            registered: false,
            debug: false,
            color: chalk.yellow,
            root: process.cwd(),
        };
    }
    debug(...args) {
        if (!this.config.debug)
            return;
        console.log(chalk.grey('[debug]'), this.config.color(`[${this.name}]`), ...args);
    }
    error(...args) {
        console.log(chalk.red('[ERROR]'), this.config.color(`[${this.name}]`), ...args);
    }
}
exports.default = CommonDoggo;
//# sourceMappingURL=commonDoggo.js.map