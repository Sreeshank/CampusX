import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import {
  HttpsError,
  onCall,
  type CallableRequest,
} from "firebase-functions/v2/https";
import { XChangeService } from "./service";

if (!getApps().length) initializeApp();
const service = () =>
  new XChangeService(getFirestore(), async (paths) => {
    for (const path of paths) {
      try {
        const [m] = await getStorage().bucket().file(path).getMetadata();
        if (
          !["image/jpeg", "image/png", "image/webp"].includes(
            m.contentType ?? "",
          ) ||
          !Number.isFinite(Number(m.size)) ||
          Number(m.size) < 1 ||
          Number(m.size) > 5 * 1024 * 1024
        )
          throw new Error("Invalid image metadata");
      } catch {
        throw new HttpsError(
          "failed-precondition",
          "An image is missing or invalid. Upload a JPG, PNG or WebP under 5 MB first.",
        );
      }
    }
  });
function uid(request: CallableRequest): string {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in first.");
  if (request.auth.token.email_verified !== true)
    throw new HttpsError("permission-denied", "Verify your email first.");
  return request.auth.uid;
}
const options = { region: "asia-south1", maxInstances: 10 };
export const createListing = onCall(options, (r) =>
  service().create(uid(r), r.data),
);
export const updateListing = onCall(options, (r) =>
  service().update(uid(r), r.data),
);
export const setListingStatus = onCall(options, (r) =>
  service().setStatus(uid(r), r.data),
);
export const proposeDeal = onCall(options, (r) =>
  service().proposeDeal(uid(r), r.data),
);
export const confirmDeal = onCall(options, (r) =>
  service().confirmDeal(uid(r), r.data),
);
export const listListings = onCall(options, (r) =>
  service().list(uid(r), r.data),
);
export const getListing = onCall(options, (r) => service().get(uid(r), r.data));
