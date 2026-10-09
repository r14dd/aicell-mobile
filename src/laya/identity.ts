import * as LocalAuthentication from 'expo-local-authentication';

import { getLayaUi } from '@/laya/store';

/** Device biometrics (fingerprint / Face ID) before a payment; passes where none is set up. */
export async function confirmIdentity(promptMessage: string) {
  try {
    const [hardware, enrolled] = await Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]);
    if (!hardware || !enrolled) return true;
    return (await LocalAuthentication.authenticateAsync({ promptMessage, cancelLabel: 'Cancel' })).success;
  } catch {
    return true;
  }
}

/** A purchase Laya is making asks for the finger first; the user's own tap goes straight through. */
export function confirmPurchase(promptMessage: string) {
  return getLayaUi().busy ? confirmIdentity(promptMessage) : Promise.resolve(true);
}
