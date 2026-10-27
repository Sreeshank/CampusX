// Browser test double only. This fixture is not part of Vite's production entrypoint.
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  XChangeLiveProvider,
  type XChangeRepository,
} from "../../src/features/xchange/LiveXChange";
import { Home } from "../../src/features/home/Home";
import { Layout } from "../../src/app/Layout";
import {
  Marketplace,
  ListingDetail,
  ListingForm,
} from "../../src/features/xchange/XChange";
import type { Listing } from "../../shared/types";
import "../../src/styles.css";
import "../../src/customer-template.css";
const scenario = new URLSearchParams(location.search).get("scenario");
let listAttempts = 0,
  saveAttempts = 0;
const item: Listing = {
  id: "live-book",
  ownerId: "live-user",
  campusId: "kits-warangal",
  title: "Live adapter textbook",
  description: "A real-view test with a deterministic repository double.",
  category: "books",
  condition: "good",
  mode: "sale",
  pricePaise: 50000,
  imagePaths: ["owned/image.jpg"],
  status: "active",
  createdAt: "2026-10-27T10:00:00Z",
  updatedAt: "2026-10-27T10:00:00Z",
};
const pause = () => new Promise((resolve) => setTimeout(resolve, 60));
const repository: XChangeRepository = {
  async listListings(input = {}) {
    await pause();
    if (scenario === "load-error" && ++listAttempts === 1)
      throw Error("Test network error");
    return {
      items: [
        {
          ...item,
          id: input.cursor ? "second" : "live-book",
          title: input.cursor ? "Second adapter item" : item.title,
        },
      ],
      nextCursor: input.cursor ? null : "next",
    };
  },
  async listMyListings(input = {}) {
    return this.listListings(input);
  },
  async getListing() {
    await pause();
    return {
      listing: item,
      seller: {
        id: "live-user",
        displayName: "Test Seller",
        department: "CSE",
        year: "2",
        verificationStatus: "verified",
      },
      deal: null,
      contacts: [],
    };
  },
  async createListing() {
    await pause();
    if (scenario === "save-error" && ++saveAttempts === 1)
      throw Error("Test save failed. Retry with your draft.");
    return { listingId: item.id };
  },
  async updateListing() {
    throw Error("Unused fixture method");
  },
  async setListingStatus(input) {
    item.status = input.status;
    return { status: input.status };
  },
  async proposeDeal() {
    throw Error("Unused fixture method");
  },
  async confirmDeal() {
    throw Error("Unused fixture method");
  },
  async uploadPhotos() {
    await pause();
    if (scenario === "upload-error") throw Error("Test upload failed");
    return ["owned/new.jpg"];
  },
  async uploadListingImage() {
    return "owned/new.jpg";
  },
  async imageSource() {
    return "/campus-community.svg";
  },
  async setSavedListing(input) {
    return { saved: input.saved };
  },
  async listSavedListings() {
    return { items: [], nextCursor: null };
  },
  async openConversation() {
    throw Error("Unused fixture method");
  },
  async submitReport() {
    return { reportId: "report" };
  },
};
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <XChangeLiveProvider
      user={{
        uid: "live-user",
        campusId: "kits-warangal",
        displayName: "Test Seller",
      }}
      repository={repository}
    >
      <div className="customer-template">
        <main>
          <Routes>
            <Route
              path="/tests/fixtures/live-xchange.html"
              element={
                scenario === "save-error" || scenario === "upload-error" ? (
                  <ListingForm />
                ) : (
                  <Marketplace />
                )
              }
            />
            <Route element={<Layout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/xchange/:listingId" element={<ListingDetail />} />
            </Route>
          </Routes>
        </main>
      </div>
    </XChangeLiveProvider>
  </BrowserRouter>,
);
