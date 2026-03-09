import { TestInfo } from "@playwright/test";
import { CompositeIdFactory } from "./composite-id.factory";

export class XssPayloadFactory {
  static script(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `<script>alert('${id}')</script>`;
  }

  static imgOnError(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `<img src=x onerror=alert('${id}')>`;
  }

  static svgOnLoad(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `<svg/onload=alert('${id}')>`;
  }

  static iframeJavascript(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `<iframe src="javascript:alert('${id}')"></iframe>`;
  }

  static bodyOnLoad(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `<body onload=alert('${id}')>`;
  }

  static inputOnFocus(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `<input autofocus onfocus=alert('${id}')>`;
  }

  static detailsOnToggle(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `<details open ontoggle=alert('${id}')>`;
  }

  static videoSourceOnError(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `<video><source onerror="alert('${id}')"></video>`;
  }

  static anchorJavascript(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `<a href="javascript:alert('${id}')">click</a>`;
  }

  static mathJavascript(testInfo: TestInfo): string {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return `<math href="javascript:alert('${id}')"></math>`;
  }
  
  static all(testInfo: TestInfo): string[] {
    const id = CompositeIdFactory.fromExecutionInfo(testInfo);
    return [
      `<script>alert('${id}')</script>`,
      `<img src=x onerror=alert('${id}')>`,
      `<svg/onload=alert('${id}')>`,
      `<iframe src="javascript:alert('${id}')"></iframe>`,
      `<body onload=alert('${id}')>`,
      `<input autofocus onfocus=alert('${id}')>`,
      `<details open ontoggle=alert('${id}')>`,
      `<video><source onerror="alert('${id}')"></video>`,
      `<a href="javascript:alert('${id}')">click</a>`,
      `<math href="javascript:alert('${id}')"></math>`
    ];
  }
}