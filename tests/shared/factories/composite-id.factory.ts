import { TestInfo, WorkerInfo } from "@playwright/test";

export class CompositeIdFactory {
  static create(...ids: (string | number)[]): string {
    return ids.filter(id => id !== '').join('-');
  }

  static fromExecutionInfo(
    info: TestInfo | WorkerInfo,
    title: string = '',
  ): string {
    const shardIndex = info.config.shard?.current ?? 1;
    return this.create(title, 'shard', shardIndex, 'worker', info.parallelIndex);
  }
}