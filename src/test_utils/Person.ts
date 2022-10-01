export class Person {
  public walk(_p?: any): string {
    return "walking";
  }
  public run(_p?: any): string {
    return "running";
  }
  public talk(phrase: string): string {
    return phrase;
  }
  public async asyncRun(...any: any[]): Promise<string> {
    return "async running";
  }
}
