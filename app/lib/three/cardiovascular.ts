import * as THREE from "three";
import type { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { withBasePath } from "../base-path";

/**
 * Blood vasculature: HuBMAP HRA CCF v1.3 `VH_M_Blood_Vasculature`
 * (CC BY 4.0, derived from NLM Visible Human).
 * https://humanatlas.io/3d-reference-library
 *
 * FIT_SIZE is duplicated from loaders.ts to avoid a circular import.
 * ZOOM + FOCUS crop the head-to-pelvis tree so the mediastinum fills
 * the specimen stage the way a single-organ GLB does.
 */
const FIT_SIZE = 3.8;
const ZOOM = 1.85;
const FOCUS = new THREE.Vector3(0.03, 0.22, 0.06);
const HEART_SIZE = 0.78;
const HEART_POS = new THREE.Vector3(0.03, 0.18, 0.12);

const ARTERY = new THREE.Color(0xc45c52);
const VEIN = new THREE.Color(0x5a7aa8);

function atelierVesselMaterial(source: THREE.Material): THREE.MeshStandardMaterial {
  const hex =
    "color" in source && source.color instanceof THREE.Color ? source.color.getHex() : 0xff0000;
  const isVein = hex === 0x0000ff;
  return new THREE.MeshStandardMaterial({
    color: isVein ? VEIN : ARTERY,
    roughness: 0.48,
    metalness: 0,
    envMapIntensity: 0.4,
  });
}

function fit(object: THREE.Object3D, size: number) {
  const box = new THREE.Box3().setFromObject(object);
  const dim = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = size / Math.max(dim.x, dim.y, dim.z, 0.001);
  object.scale.setScalar(scale);
  object.position.copy(center.multiplyScalar(-scale));
}

function collectMeshes(root: THREE.Object3D, meshes: THREE.Mesh[]) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.frustumCulled = false;
    child.castShadow = false;
    child.receiveShadow = false;
    meshes.push(child);
  });
}

async function nestedHeart(loader: GLTFLoader): Promise<THREE.Group> {
  const wrap = new THREE.Group();
  wrap.name = "heart-overlay";
  try {
    const gltf = await loader.loadAsync(withBasePath("/models/heart.glb"));
    const model = gltf.scene;
    fit(model, HEART_SIZE);
    wrap.add(model);
  } catch {
    // Coronary tree still reads without myocardium.
  }
  wrap.position.copy(HEART_POS);
  wrap.rotation.set(0.2, -0.1, 0.35);
  return wrap;
}

export async function buildCardiovascularScene(loader: GLTFLoader): Promise<{
  model: THREE.Group;
  meshes: THREE.Mesh[];
}> {
  const gltf = await loader.loadAsync(withBasePath("/models/cardiovascular.glb"));
  const vessels = gltf.scene;
  vessels.name = "blood-vasculature";
  fit(vessels, FIT_SIZE);
  vessels.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    const next = mats.map((material) => atelierVesselMaterial(material));
    child.material = Array.isArray(child.material) ? next : next[0];
  });

  const zoomed = new THREE.Group();
  zoomed.name = "vasculature-zoom";
  zoomed.add(vessels);
  zoomed.scale.setScalar(ZOOM);
  zoomed.position.set(-FOCUS.x * ZOOM, -FOCUS.y * ZOOM, -FOCUS.z * ZOOM);

  const root = new THREE.Group();
  root.name = "cardiovascular";
  root.add(zoomed);

  const meshes: THREE.Mesh[] = [];
  collectMeshes(zoomed, meshes);

  const heart = await nestedHeart(loader);
  root.add(heart);
  collectMeshes(heart, meshes);

  return { model: root, meshes };
}

export function proceduralKind(url: string): string | null {
  const match = url.match(/procedural:([a-z0-9-]+)/);
  return match?.[1] ?? null;
}
