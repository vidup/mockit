export class Person {
    public walk(): string {
        return "walking";
    }
    public run(): string {
        return "running";
    }
    public talk(phrase: string): string {
        return phrase;
    }
    public async asyncRun(): Promise<string> {
        return "async running";
    }
}
