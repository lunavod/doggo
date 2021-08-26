import { Command } from 'commander';
import CommonDoggo from './commonDoggo';
import Config from './config';
export default class DoggoRunner {
    doggos: CommonDoggo[];
    homeDir: string;
    config: Config;
    command: Command;
    debugMode: boolean;
    run(): Promise<boolean>;
    debug(...args: any[]): void;
    error(...args: any[]): void;
    initCommand(): Promise<void>;
    registerDoggos(): Promise<void>;
    loadDoggos(): Promise<boolean>;
    loadConfig(): Promise<boolean>;
    findHomeDir(): Promise<boolean>;
}
