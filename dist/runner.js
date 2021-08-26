"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs/promises');
const path = require('path');
const js_yaml_1 = require("js-yaml");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const commander_1 = require("commander");
const chalk = require('chalk');
const commonDoggo_1 = require("./commonDoggo");
const config_1 = require("./config");
const glob = require('glob');
class DoggoRunner {
    constructor() {
        this.doggos = [];
        this.homeDir = '';
        this.debugMode = false;
    }
    async run() {
        await this.initCommand();
        if (!(await this.findHomeDir()))
            return false;
        if (!(await this.loadConfig()))
            return false;
        if (!(await this.loadDoggos()))
            return false;
        await this.registerDoggos();
        this.command.parse();
    }
    debug(...args) {
        if (!this.debugMode)
            return;
        console.log(chalk.grey('[debug]'), ...args);
    }
    error(...args) {
        console.log(chalk.red('[ERROR]'), ...args);
    }
    async initCommand() {
        this.command = new commander_1.Command('doggo');
        this.command.option('-d, --debug', 'Verbose output');
        this.command.parseOptions(process.argv);
        const opts = this.command.opts();
        if (opts.debug)
            this.debugMode = true;
    }
    async registerDoggos() {
        this.doggos.forEach((d) => {
            d.config.debug = this.debugMode;
            d.config.root = this.homeDir;
            d.register(this.command);
            d.config.registered = true;
        });
    }
    async loadDoggos() {
        const doggosDir = path.resolve(this.homeDir, this.config.doggosDir);
        let files;
        try {
            files = glob.sync('**/*.doggo.*', { cwd: doggosDir });
        }
        catch (err) {
            console.error('Doggos dir not found');
            return false;
        }
        this.debug('Files:', files);
        files.forEach((name) => {
            const customClass = require(path.resolve(doggosDir, name));
            if (typeof customClass !== 'function') {
                this.error(name, '- NOT A CLASS');
                return false;
            }
            const newDoggo = new customClass();
            if (!(newDoggo instanceof commonDoggo_1.default)) {
                this.error(name, '- NOT A DOGGO');
                return false;
            }
            this.debug(chalk.blue(name), 'registered');
            this.doggos.push(newDoggo);
        });
        return true;
    }
    async loadConfig() {
        const plain = js_yaml_1.load(await fs.readFile(path.join(this.homeDir, '.doggo.yml'), 'utf-8'));
        const config = class_transformer_1.plainToClass(config_1.default, plain);
        const errors = await class_validator_1.validate(config);
        if (errors.length) {
            this.error('Config errors:');
            errors.forEach((err) => {
                Object.values(err.constraints).forEach((c) => this.error(c));
            });
            return false;
        }
        this.debug('Config loaded:', config);
        this.config = config;
        return true;
    }
    async findHomeDir() {
        const checkIsHomeDir = async (p) => {
            const files = await fs.readdir(p);
            if (files.includes('.doggo.yml')) {
                this.homeDir = p;
                return true;
            }
            return false;
        };
        let p = process.cwd();
        while (p !== path.resolve(p, '../') && !this.homeDir) {
            await checkIsHomeDir(p);
            p = path.resolve(p, '../');
        }
        checkIsHomeDir(p);
        if (!this.homeDir)
            this.error('HOME DIR NOT FOUND');
        this.debug('Home dir found:', chalk.blue(this.homeDir));
        return !!this.homeDir;
    }
}
exports.default = DoggoRunner;
//# sourceMappingURL=runner.js.map