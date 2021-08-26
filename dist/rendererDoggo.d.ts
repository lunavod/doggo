import CommonDoggo from './commonDoggo';
export default abstract class RendererDoggo extends CommonDoggo {
    templates: Record<string, [
        string,
        string
    ] | [string, string, Record<string, any>]>;
    data: Record<string, any>;
    base: string;
    templatesDir: string;
    twigExtensions: Record<string, (value: string) => string>;
    prepareTwig(): Promise<any>;
    writeFile(p: string, content: string): Promise<void>;
    createDir(p?: string): Promise<void>;
    renderFile(from: string, data: Record<string, any>): Promise<string>;
    renderTemplate(code: string): Promise<void>;
    ask(message: string, defaultValue?: string): Promise<string>;
    execute(command: string): Promise<unknown>;
}
