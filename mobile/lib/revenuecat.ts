export const initializeRevenueCat = () => {
  // Billing is intentionally inactive until store products and entitlements are configured.
};

export async function checkProStatus(): Promise<boolean> {
  // Mobile billing is not connected, so no paid entitlement is granted.
  return false;
}
