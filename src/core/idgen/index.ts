const generateIds = async (): Promise<string[]> => Promise.resolve([]);

export default class IDGen {
  private idList: string[];

  // public async load(url: string) {
  public async load() {
    const result = await generateIds();
    this.idList = result;
  }

  public generate() {
    const randomString = Math.random().toString(36).substr(2);
    if (this.idList.indexOf(randomString) === -1) {
      this.idList.push(randomString);
      return randomString;
    } else {
      return this.generate();
    }
  }
}
