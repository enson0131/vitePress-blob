// 临时请求对象只留在网络层，不存入 Turn，也不发送给后端。
export type ControllerOwner = { controller: AbortController };
export function ownsController(
  active: ControllerOwner | null,
  controller: AbortController
): boolean {
  return active?.controller === controller;
}
