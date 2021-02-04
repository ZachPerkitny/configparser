type FileInputType = string | Buffer | number;

declare module 'configparser' {
  class ConfigParser {
    sections(): string[];
    addSection(section: string): void;
    hasSection(section: string): boolean;
    keys(section: string): string[];
    hasKey(section: string, key: string): boolean;
    read(file: FileInputType): void;
    readAsync(file: FileInputType): void;
    get(section: string, key: string, raw?: boolean): string | undefined;
    getInt(section: string, key: string, radix?: number): number | undefined;
    getFloat(section: string, key: string): number|undefined;
    items(section: string): Record<string, string>;
    set(section: string, key: string, value: any): void;
    removeKey(section: string, key: string): boolean;
    removeSection(section: string): boolean;
    write(file: FileInputType, createMissingDirs?: boolean): void;
    writeAsync(file: FileInputType, createMissingDirs?: boolean): Promise<void>;
  }

  export default ConfigParser
}