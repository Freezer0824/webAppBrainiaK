export const INFINI_DEMO_MODE =
  import.meta.env.VITE_INFINI_DEMO_MODE !== "false";

export function isInfiniDemoModeEnabled() {
  return INFINI_DEMO_MODE;
}