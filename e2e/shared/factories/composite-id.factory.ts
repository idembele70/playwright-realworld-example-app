export class CompositeIdFactory {
  static create(...ids: (string | number)[]): string {
    return ids.join('-');
  }
}