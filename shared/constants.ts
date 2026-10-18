export const CAMPUS = { id: "kits-warangal", name: "KITS Warangal" };
// Illustrative pickup locations. Confirm exact public meeting points before a real pilot.
export const POINTS = [
  { id: "kits-main-gate", label: "KITS Main Gate" },
  { id: "hanamkonda", label: "Hanamkonda" },
  { id: "kazipet", label: "Kazipet Station" },
  { id: "hostel-block", label: "Hostel Block" },
];
export const CATEGORIES = [
  "books",
  "electronics",
  "furniture",
  "hostel",
  "bicycles",
  "other",
];
export const CONDITIONS = ["new", "like-new", "good", "fair"];
export const pointLabel = (id: string) =>
  POINTS.find((p) => p.id === id)?.label ?? id;
