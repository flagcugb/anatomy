import type { OrganId } from "./anatomy-data";

/** Anchors on the anterior body map. Ids are stable; copy lives in the UI dictionary. */
export type BodyLandmarkId =
  | "brain"
  | "eyeball"
  | "heart"
  | "right-lung"
  | "left-lung"
  | "liver"
  | "gallbladder"
  | "stomach"
  | "pancreas"
  | "right-kidney"
  | "left-kidney"
  | "ascending-colon"
  | "transverse-colon"
  | "descending-colon"
  | "small-intestine"
  | "bladder"
  | "skin";

export type BodyRegion = {
  id: BodyLandmarkId;
  /** Present when this label opens a 3D specimen. */
  organId?: OrganId;
  color: string;
  /** Organ centre in the 520×720 viewBox. */
  x: number;
  y: number;
  /** Label anchor in the same viewBox. Anatomical left/right are not mirrored. */
  labelX: number;
  labelY: number;
};

export const BODY_MAP_VIEWBOX = { width: 520, height: 720 };

/** Maps each landmark id to `UiDictionary.bodyMap.labels`. */
export const BODY_LABEL_KEYS = {
  brain: "brain",
  eyeball: "eyeball",
  heart: "heart",
  "right-lung": "rightLung",
  "left-lung": "leftLung",
  liver: "liver",
  gallbladder: "gallbladder",
  stomach: "stomach",
  pancreas: "pancreas",
  "right-kidney": "rightKidney",
  "left-kidney": "leftKidney",
  "ascending-colon": "ascendingColon",
  "transverse-colon": "transverseColon",
  "descending-colon": "descendingColon",
  "small-intestine": "smallIntestine",
  bladder: "bladder",
  skin: "skin",
} as const satisfies Record<BodyLandmarkId, string>;

export function isLandmarkOnly(region: BodyRegion): boolean {
  return region.organId === undefined;
}

/**
 * Person facing the viewer: the left of the picture is anatomical right.
 * Coordinates are authored against the silhouette in `BodyMap.tsx`.
 */
export const bodyRegions: BodyRegion[] = [
  { id: "brain", organId: "brain", color: "#c58696", x: 260, y: 58, labelX: 452, labelY: 46 },
  { id: "eyeball", organId: "eyeball", color: "#7294b9", x: 242, y: 76, labelX: 452, labelY: 86 },
  { id: "skin", organId: "skin", color: "#c99277", x: 122, y: 210, labelX: 48, labelY: 158 },
  { id: "right-lung", organId: "lungs", color: "#dd8f8b", x: 200, y: 222, labelX: 48, labelY: 214 },
  { id: "heart", organId: "heart", color: "#ee7c6a", x: 272, y: 228, labelX: 452, labelY: 220 },
  { id: "left-lung", organId: "lungs", color: "#dd8f8b", x: 322, y: 222, labelX: 452, labelY: 258 },
  { id: "liver", organId: "liver", color: "#b86858", x: 210, y: 318, labelX: 48, labelY: 304 },
  { id: "gallbladder", color: "#7fa88a", x: 194, y: 342, labelX: 48, labelY: 342 },
  { id: "stomach", color: "#d4a574", x: 304, y: 318, labelX: 452, labelY: 312 },
  { id: "pancreas", organId: "pancreas", color: "#c69a5e", x: 268, y: 350, labelX: 452, labelY: 352 },
  { id: "right-kidney", organId: "kidneys", color: "#c96963", x: 172, y: 362, labelX: 48, labelY: 378 },
  { id: "left-kidney", organId: "kidneys", color: "#c96963", x: 348, y: 362, labelX: 452, labelY: 386 },
  { id: "transverse-colon", organId: "intestine", color: "#d78b77", x: 260, y: 356, labelX: 48, labelY: 418 },
  { id: "ascending-colon", organId: "intestine", color: "#d78b77", x: 188, y: 428, labelX: 48, labelY: 458 },
  { id: "descending-colon", organId: "intestine", color: "#d78b77", x: 340, y: 428, labelX: 452, labelY: 430 },
  { id: "small-intestine", organId: "intestine", color: "#e0a090", x: 260, y: 430, labelX: 452, labelY: 478 },
  { id: "bladder", color: "#8eb4c8", x: 260, y: 518, labelX: 260, labelY: 668 },
];

export function regionsForOrgan(organId: OrganId): BodyRegion[] {
  return bodyRegions.filter((region) => region.organId === organId);
}
