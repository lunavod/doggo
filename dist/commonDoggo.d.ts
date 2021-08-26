import { Command } from 'commander';
declare type CommonDoggoConfig = {
    debug: boolean;
    registered: boolean;
    color: any;
    root: string;
};
export default abstract class CommonDoggo {
    name: string;
    config: CommonDoggoConfig;
    abstract register(command: Command): void;
    debug(...args: any[]): void;
    error(...args: any[]): void;
}
export {};
