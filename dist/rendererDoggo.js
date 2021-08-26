"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require('chalk');
const commonDoggo_1 = require("./commonDoggo");
const inquirer = require('inquirer');
const js_convert_case_1 = require("js-convert-case");
const pluralize = require('pluralize');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
class RendererDoggo extends commonDoggo_1.default {
    constructor() {
        super(...arguments);
        this.twigExtensions = {};
    }
    async prepareTwig() {
        const Twig = require('twig');
        Twig.extendFilter('plural', (s) => pluralize(s));
        Twig.extendFilter('camel', (s) => js_convert_case_1.toCamelCase(s));
        Twig.extendFilter('pascal', (s) => js_convert_case_1.toPascalCase(s));
        return Twig;
    }
    async writeFile(p, content) {
        const finalPath = path.join(this.base, p);
        console.log('Writing file', chalk.green(finalPath));
        if (fs.existsSync(finalPath)) {
            this.error('File exists!');
            process.exit();
        }
        fs.writeFileSync(finalPath, content);
    }
    async createDir(p) {
        const finalPath = path.join(this.base, p ?? '');
        console.log('Creating directory', chalk.green(finalPath));
        if (fs.existsSync(finalPath)) {
            this.error('Directory exists');
            process.exit();
        }
        fs.mkdirSync(finalPath);
    }
    async renderFile(from, data) {
        const twig = await this.prepareTwig();
        const content = await new Promise((resolve, reject) => {
            twig.renderFile(path.join(this.templatesDir, from), data, (err, result) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(result);
            });
        });
        return content;
    }
    async renderTemplate(code) {
        if (!(code in this.templates)) {
            this.error(`Code ${code} not found in templates!`);
            process.exit();
        }
        const [from, to, data] = this.templates[code];
        await this.writeFile(to, await this.renderFile(from, data ?? this.data));
    }
    async ask(message, defaultValue) {
        const config = {
            type: 'input',
            name: 'value',
            message,
            default: defaultValue ?? undefined,
        };
        const answer = await inquirer.prompt([config]);
        return answer.value;
    }
    execute(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout) => {
                if (error)
                    return reject(error);
                resolve(stdout);
            });
        });
    }
}
exports.default = RendererDoggo;
//# sourceMappingURL=rendererDoggo.js.map