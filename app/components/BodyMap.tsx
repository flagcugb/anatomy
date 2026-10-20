"use client";

import { useState } from "react";
import {
  BODY_LABEL_KEYS,
  BODY_MAP_VIEWBOX,
  bodyRegions,
  isLandmarkOnly,
  type BodyLandmarkId,
  type BodyRegion,
} from "../lib/body-map";
import type { OrganId } from "../lib/anatomy-data";
import type { Organ } from "../i18n/merge";
import type { UiDictionary } from "../i18n/types";
import { withBasePath } from "../lib/base-path";

const { width: VB_W, height: VB_H } = BODY_MAP_VIEWBOX;

type BodyMapProps = {
  t: UiDictionary;
  organ: Organ;
  organById: Record<OrganId, Organ>;
  onSelect: (id: OrganId) => void;
  onPrefetch: (id: OrganId) => void;
};

function regionLabel(t: UiDictionary, id: BodyLandmarkId) {
  return t.bodyMap.labels[BODY_LABEL_KEYS[id]];
}

function defaultRegionId(organId: OrganId): BodyLandmarkId {
  return bodyRegions.find((region) => region.organId === organId)?.id ?? "heart";
}

function pct(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

function labelStyle(region: BodyRegion): React.CSSProperties {
  const left = pct(region.labelX, VB_W);
  const top = pct(region.labelY, VB_H);
  if (region.id === "bladder") {
    return { left, top, transform: "translate(-50%, 0)" };
  }
  if (region.labelX < VB_W / 2) {
    return { left, top, transform: "translate(-100%, -50%)" };
  }
  return { left, top, transform: "translate(0, -50%)" };
}

function leaderPath(region: BodyRegion) {
  if (region.id === "bladder") {
    return `M ${region.x} ${(region.y + 28).toFixed(1)} L ${region.labelX} ${(region.labelY - 4).toFixed(1)}`;
  }
  const fromLeft = region.labelX < VB_W / 2;
  const elbowX = fromLeft ? region.x - 36 : region.x + 36;
  const labelEnd = fromLeft ? region.labelX + 8 : region.labelX - 8;
  return `M ${labelEnd.toFixed(1)} ${region.labelY} L ${elbowX.toFixed(1)} ${region.labelY} L ${region.x} ${region.y}`;
}

export function BodyMap({ t, organ, organById, onSelect, onPrefetch }: BodyMapProps) {
  const [picked, setPicked] = useState<BodyLandmarkId | null>(null);
  const [hovered, setHovered] = useState<BodyLandmarkId | null>(null);
  const selectedId = picked ?? defaultRegionId(organ.id);
  const selected = bodyRegions.find((region) => region.id === selectedId) ?? bodyRegions[0];
  const selectedOrgan = selected.organId ? organById[selected.organId] : null;
  const selectedLabel = regionLabel(t, selected.id);
  const landmark = isLandmarkOnly(selected);
  const blurb = landmark
    ? t.bodyMap.blurbs[selected.id as "gallbladder" | "stomach" | "bladder"]
    : selectedOrgan?.description ?? "";

  const activate = (region: BodyRegion) => {
    setPicked(region.id);
    if (region.organId) onSelect(region.organId);
  };

  const hoverId = (id: BodyLandmarkId | null) => {
    setHovered(id);
    if (id) {
      const region = bodyRegions.find((item) => item.id === id);
      if (region?.organId) onPrefetch(region.organId);
    }
  };

  return (
    <div className="body-map-layout">
      <div className="body-map-figure" dir="ltr">
        <img
          className="body-map-plate"
          src={withBasePath("/anatomy/body-map.jpg")}
          alt=""
          draggable={false}
        />
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} aria-hidden="true" className="body-map-svg">
          {bodyRegions.map((region) => (
            <path
              key={`lead-${region.id}`}
              className={`body-map-leader${region.id === selectedId ? " is-active" : ""}`}
              d={leaderPath(region)}
            />
          ))}
        </svg>
        {bodyRegions.map((region) => {
          const current = region.organId === organ.id;
          const active = region.id === selectedId;
          const hot = region.id === hovered;
          return (
            <button
              key={`hot-${region.id}`}
              type="button"
              className={`body-map-hotspot${current ? " is-current" : ""}${active ? " is-selected" : ""}${hot ? " is-hot" : ""}`}
              style={{
                left: pct(region.x, VB_W),
                top: pct(region.y, VB_H),
                "--pin-color": region.color,
              } as React.CSSProperties}
              aria-label={regionLabel(t, region.id)}
              title={regionLabel(t, region.id)}
              onClick={() => activate(region)}
              onPointerEnter={() => hoverId(region.id)}
              onPointerLeave={() => hoverId(null)}
              onFocus={() => hoverId(region.id)}
              onBlur={() => hoverId(null)}
            />
          );
        })}
        {bodyRegions.map((region) => {
          const current = region.organId === organ.id;
          const active = region.id === selectedId;
          return (
            <button
              key={`label-${region.id}`}
              type="button"
              className={`body-map-label${current ? " is-current" : ""}${active ? " is-selected" : ""}`}
              style={{
                ...labelStyle(region),
                "--pin-color": region.color,
              } as React.CSSProperties}
              onClick={() => activate(region)}
              onPointerEnter={() => hoverId(region.id)}
              onPointerLeave={() => hoverId(null)}
            >
              {regionLabel(t, region.id)}
            </button>
          );
        })}
      </div>
      <aside className="body-map-aside">
        <em>{landmark ? t.bodyMap.landmark : selectedOrgan?.system}</em>
        <h3>{selectedLabel}</h3>
        <p>{blurb}</p>
        {selected.organId && selectedOrgan ? (
          <button type="button" onClick={() => onSelect(selected.organId!)}>
            {t.bodyMap.viewSpecimen}
          </button>
        ) : (
          <small>{t.bodyMap.noSpecimen}</small>
        )}
      </aside>
    </div>
  );
}
