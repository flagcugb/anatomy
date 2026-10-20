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

/** Matches `public/anatomy/body-map.jpg` (864×1152, 3:4). */
export const BODY_MAP_VIEWBOX = { width: 864, height: 1152 };

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
  { id: "brain", organId: "brain", color: "#c58696", x: 432, y: 48, labelX: 790, labelY: 44 },
  { id: "eyeball", organId: "eyeball", color: "#7294b9", x: 398, y: 72, labelX: 790, labelY: 92 },
  { id: "skin", organId: "skin", color: "#c99277", x: 148, y: 250, labelX: 64, labelY: 180 },
  { id: "right-lung", organId: "lungs", color: "#dd8f8b", x: 292, y: 330, labelX: 64, labelY: 300 },
  { id: "heart", organId: "heart", color: "#ee7c6a", x: 486, y: 360, labelX: 790, labelY: 330 },
  { id: "left-lung", organId: "lungs", color: "#dd8f8b", x: 590, y: 330, labelX: 790, labelY: 400 },
  { id: "liver", organId: "liver", color: "#b86858", x: 330, y: 530, labelX: 64, labelY: 500 },
  { id: "gallbladder", color: "#7fa88a", x: 348, y: 600, labelX: 64, labelY: 580 },
  { id: "stomach", color: "#d4a574", x: 530, y: 575, labelX: 790, labelY: 540 },
  { id: "pancreas", organId: "pancreas", color: "#c69a5e", x: 470, y: 620, labelX: 790, labelY: 610 },
  { id: "right-kidney", organId: "kidneys", color: "#c96963", x: 250, y: 610, labelX: 64, labelY: 640 },
  { id: "left-kidney", organId: "kidneys", color: "#c96963", x: 630, y: 610, labelX: 790, labelY: 670 },
  { id: "transverse-colon", organId: "intestine", color: "#d78b77", x: 430, y: 655, labelX: 64, labelY: 720 },
  { id: "ascending-colon", organId: "intestine", color: "#d78b77", x: 258, y: 800, labelX: 64, labelY: 820 },
  { id: "descending-colon", organId: "intestine", color: "#d78b77", x: 610, y: 800, labelX: 790, labelY: 780 },
  { id: "small-intestine", organId: "intestine", color: "#e0a090", x: 432, y: 830, labelX: 790, labelY: 880 },
  { id: "bladder", color: "#8eb4c8", x: 432, y: 935, labelX: 432, labelY: 1095 },
];

export function regionsForOrgan(organId: OrganId): BodyRegion[] {
  return bodyRegions.filter((region) => region.organId === organId);
}
