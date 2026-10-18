import { onCall, HttpsError } from "firebase-functions/v2/https";
// Intentionally safe: no success-shaped placeholder and no database writes.
// Replace each exported stub with an authorized, validated, tested implementation.
export function pendingImplementation(feature: string, owner: number) {
  return onCall({ region: "asia-south1", maxInstances: 2 }, () => {
    throw new HttpsError(
      "failed-precondition",
      `${feature} is not implemented. Person ${owner}: follow the shared API and security contracts.`,
    );
  });
}
