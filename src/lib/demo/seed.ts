import type { DemoState, Listing } from "../../../shared/types";
import { CAMPUS } from "../../../shared/constants";
export function createSeed(): DemoState {
  const now = new Date().toISOString();
  const users: DemoState["users"] = [
    {
      id: "a",
      displayName: "Aarav Reddy",
      email: "aarav@example.test",
      department: "Computer Science",
      year: "2nd year",
      role: "student",
      verificationStatus: "verified",
      accountStatus: "active",
      campusId: CAMPUS.id,
    },
    {
      id: "b",
      displayName: "Sneha Rao",
      email: "sneha@example.test",
      department: "Electronics",
      year: "3rd year",
      role: "student",
      verificationStatus: "verified",
      accountStatus: "active",
      campusId: CAMPUS.id,
    },
    {
      id: "pending",
      displayName: "New Student",
      email: "new@example.test",
      department: "",
      year: "",
      role: "student",
      verificationStatus: "pending",
      accountStatus: "active",
      campusId: CAMPUS.id,
    },
    {
      id: "admin",
      displayName: "Campus Admin",
      email: "admin@example.test",
      department: "Demo moderation",
      year: "",
      role: "admin",
      verificationStatus: "verified",
      accountStatus: "active",
      campusId: CAMPUS.id,
    },
  ];
  const items: Array<
    Pick<
      Listing,
      | "id"
      | "title"
      | "category"
      | "pricePaise"
      | "mode"
      | "ownerId"
      | "description"
    >
  > = [
    {
      id: "book",
      title: "Engineering Mathematics",
      category: "books",
      pricePaise: 30000,
      mode: "sale",
      ownerId: "b",
      description:
        "A well-kept first-year textbook. Clean pages and a few helpful pencil notes. Meet at the campus library.",
    },
    {
      id: "lamp",
      title: "Late-night study lamp",
      category: "electronics",
      pricePaise: 25000,
      mode: "sale",
      ownerId: "b",
      description:
        "Warm light, adjustable neck and a working USB cable. Perfect for your hostel desk.",
    },
    {
      id: "cycle",
      title: "Your next campus commute",
      category: "bicycles",
      pricePaise: 180000,
      mode: "sale",
      ownerId: "a",
      description:
        "Comfortable bicycle with recently serviced brakes. Try it around campus before deciding.",
    },
    {
      id: "notes",
      title: "First-year study notes",
      category: "books",
      pricePaise: 0,
      mode: "donation",
      ownerId: "b",
      description:
        "Passing on my handwritten revision notes to a fresher who needs them.",
    },
    {
      id: "chair",
      title: "A little comfort for your desk",
      category: "furniture",
      pricePaise: 60000,
      mode: "sale",
      ownerId: "a",
      description:
        "Sturdy desk chair. Available for collection from the designated hostel meeting point.",
    },
    {
      id: "kit",
      title: "Hostel essentials kit",
      category: "hostel",
      pricePaise: null,
      mode: "swap",
      ownerId: "b",
      description:
        "A clean organizer and small desk accessories. Looking for a second-year textbook.",
    },
  ];
  return {
    version: 1,
    currentUserId: "a",
    users,
    listings: items.map((item) => ({
      ...item,
      campusId: CAMPUS.id,
      condition: "good",
      swapWanted: item.mode === "swap" ? "A second-year textbook" : "",
      imagePaths: ["demo:" + item.category],
      status: "active",
      createdAt: now,
      updatedAt: now,
    })),
    rides: [
      {
        id: "ride-b",
        driverId: "b",
        campusId: CAMPUS.id,
        pickupPointId: "kits-main-gate",
        destinationPointId: "hanamkonda",
        departureAt: new Date(Date.now() + 86400000).toISOString(),
        seatsTotal: 2,
        seatsAvailable: 2,
        costSharePaise: 4000,
        vehicleType: "car",
        notes: "Meet by the main gate. Please arrive five minutes early.",
        status: "open",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "ride-a",
        driverId: "a",
        campusId: CAMPUS.id,
        pickupPointId: "kits-main-gate",
        destinationPointId: "kazipet",
        departureAt: new Date(Date.now() + 90000000).toISOString(),
        seatsTotal: 1,
        seatsAvailable: 1,
        costSharePaise: 5000,
        vehicleType: "twoWheeler",
        notes: "One passenger seat for the station trip.",
        status: "open",
        createdAt: now,
        updatedAt: now,
      },
    ],
    requests: [],
    conversations: [],
    messages: [],
    reports: [],
    notices: [],
    saved: {},
    blocks: {},
    images: {},
    operations: {},
    audit: [],
  };
}
