import { TestInfo } from "@playwright/test";
import { CompositeIdFactory } from "./composite-id.factory";

export class SqlInjectionPayloadFactory {
  static orEquals(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `' OR '${id}'='${id}`;
  }

  static orEqualsComment(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `' OR '${id}'='${id}'--`;
  }

  static dropTable(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `'; DROP TABLE ${id}; --`;
  }

  static unionSelect(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `' UNION SELECT '${id}' --`;
  }

  static orEmptyEquals(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `' OR '${id}'=''`;
  }

  static orEqualsBlockComment(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `' OR '${id}'='${id}' /*`;
  }

  static doubleQuoteBypass(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `" OR "${id}"="${id}`;
  }

  static orEqualsHashComment(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `' OR '${id}'='${id}'#`;
  }

  static adminComment(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `${id}' --`;
  }

  static simpleBypass(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `' OR '${id}'='${id}`;
  }

  static all(testInfo: TestInfo): string[] {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return [
      `' OR '${id}'='${id}`,
      `' OR '${id}'='${id}'--`,
      `'; DROP TABLE ${id}; --`,
      `' UNION SELECT '${id}' --`,
      `' OR '${id}'=''`,
      `' OR '${id}'='${id}' /*`,
      `" OR "${id}"="${id}`,
      `' OR '${id}'='${id}'#`,
      `${id}' --`,
      `' OR '${id}'='${id}`
    ];
  }
}