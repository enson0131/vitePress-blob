export type ControllerOwner = { controller: AbortController };

// 请求身份只存在于网络生命周期，不写进 Turn、事件或请求体。
export function ownsController(active: ControllerOwner | null, controller: AbortController): boolean {
  return active?.controller === controller;
}
