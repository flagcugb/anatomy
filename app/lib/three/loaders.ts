import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { disposeObject } from "./dispose";

/** Edge length of the cube every organ is normalised into, so hotspot
 *  coordinates authored in `anatomy-data` mean the same thing for each model. */
export const FIT_SIZE = 3.8;

const CACHE_LIMIT = 9;

export type LoadedOrgan = {
  url: string;
  /** Hotspot space: the fitted model, centred on the origin, spanning FIT_SIZE. */
  pivot: THREE.Group;
  meshes: THREE.Mesh[];
  mixer: THREE.AnimationMixer | null;
};

export class AnatomyAssetManager {
  private loader: GLTFLoader;
  private cache = new Map<string, LoadedOrgan>();
  private inflight = new Map<string, Promise<LoadedOrgan>>();
  private queue: string[] = [];
  private pumping = false;
  private displayLoads = 0;
  private current: LoadedOrgan | null = null;
  private maxAnisotropy: number;

  constructor(renderer: THREE.WebGLRenderer) {
    // Anisotropy is what stops the texture detail from crawling at grazing
    // angles, which is most of the shimmer on a rotating organ.
    this.maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    this.loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  }

  get hasAnimation() {
    return Boolean(this.current?.mixer);
  }

  has(url: string) {
    return this.cache.has(url);
  }

  /** Marks a parsed organ as the one whose mixer the viewer should tick. */
  activate(organ: LoadedOrgan) {
    this.current = organ;
  }

  /** Parses into the GPU cache. Hover jumps this URL to the front of the idle queue. */
  prefetch(url: string) {
    if (this.cache.has(url) || this.inflight.has(url)) return;
    this.queue = [url, ...this.queue.filter((item) => item !== url)];
    void this.pump();
  }

  /** Sequential idle parse of remaining organs. Skips anything already cached or in flight. */
  preloadQueue(urls: string[]) {
    for (const url of urls) {
      if (this.cache.has(url) || this.inflight.has(url) || this.queue.includes(url)) continue;
      this.queue.push(url);
    }
    void this.pump();
  }

  async load(url: string, onProgress?: (progress: number) => void): Promise<LoadedOrgan> {
    const cached = this.cache.get(url);
    if (cached) {
      this.cache.delete(url);
      this.cache.set(url, cached);
      this.resetMaterials(cached);
      onProgress?.(1);
      return cached;
    }

    this.displayLoads += 1;
    try {
      const organ = await this.warm(url, onProgress);
      onProgress?.(1);
      return organ;
    } finally {
      this.displayLoads -= 1;
      void this.pump();
    }
  }

  private warm(url: string, onProgress?: (progress: number) => void): Promise<LoadedOrgan> {
    const pending = this.inflight.get(url) ?? this.parse(url, onProgress).then((organ) => {
      this.cache.set(url, organ);
      this.evict();
      return organ;
    });
    this.inflight.set(url, pending);
    return pending.finally(() => {
      if (this.inflight.get(url) === pending) this.inflight.delete(url);
    });
  }

  private async pump() {
    if (this.pumping || this.displayLoads > 0) return;
    this.pumping = true;
    try {
      while (this.queue.length && this.displayLoads === 0) {
        const url = this.queue.shift();
        if (!url || this.cache.has(url) || this.inflight.has(url)) continue;
        try {
          await this.warm(url);
        } catch {
          // Idle warm-up; a missing model must not stall the rest of the queue.
        }
      }
    } finally {
      this.pumping = false;
      if (this.queue.length && this.displayLoads === 0) void this.pump();
    }
  }

  private async parse(url: string, onProgress?: (progress: number) => void): Promise<LoadedOrgan> {
    const gltf = await this.loader.loadAsync(url, (event) => {
      if (event.total > 0) onProgress?.(Math.min(0.9, event.loaded / event.total));
    });
    onProgress?.(0.94);

    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = FIT_SIZE / Math.max(size.x, size.y, size.z, 0.001);
    model.scale.setScalar(scale);
    model.position.copy(center.multiplyScalar(-scale));

    // The pivot is what the viewer animates and what hotspots are parented to,
    // so hotspot coordinates stay in the normalised FIT_SIZE space.
    const pivot = new THREE.Group();
    pivot.name = "organ-pivot";
    pivot.add(model);
    pivot.rotation.set(0.05, -0.28, 0);

    const meshes: THREE.Mesh[] = [];
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      meshes.push(child);
      // One mesh per organ, always centred in frame — culling can only ever
      // cost a wrong answer here, never save work.
      child.frustumCulled = false;
      // Real-time shadow casting is replaced by a baked contact shadow, which
      // saves a full extra pass over the mesh every frame.
      child.castShadow = false;
      child.receiveShadow = false;
      this.forEachMaterial(child, (material) => {
        material.transparent = false;
        material.opacity = 1;
        material.depthWrite = true;
        material.depthTest = true;
        material.side = THREE.FrontSide;
        if (material instanceof THREE.MeshStandardMaterial) {
          // A tighter specular lobe sparkles on any surface with normal detail;
          // holding roughness a little higher keeps highlights stable while the
          // model turns.
          material.roughness = THREE.MathUtils.clamp(material.roughness ?? 0.5, 0.42, 0.62);
          material.metalness = 0;
          material.envMapIntensity = 0.32;
          material.emissive.set(0x000000);
          material.emissiveIntensity = 0;
          if ("clearcoat" in material) {
            const physical = material as THREE.MeshPhysicalMaterial;
            // A second, sharper specular lobe is the main source of crawling
            // highlights, so keep it faint and broad.
            physical.clearcoat = Math.min(Math.max(physical.clearcoat, 0.08), 0.12);
            physical.clearcoatRoughness = 0.62;
            // Volume/transmission are per-pixel expensive and invisible here.
            physical.transmission = 0;
            physical.thickness = 0;
          }
          if (material.map) material.map.colorSpace = THREE.SRGBColorSpace;
          if (material.normalMap) material.normalScale.multiplyScalar(0.62);
          // Every sampled map needs anisotropy, not just the base colour —
          // an aliasing normal or roughness map shimmers just as badly.
          for (const map of [
            material.map,
            material.normalMap,
            material.roughnessMap,
            material.metalnessMap,
            material.aoMap,
            material.emissiveMap,
          ]) {
            if (!map) continue;
            map.anisotropy = this.maxAnisotropy;
            map.generateMipmaps = true;
            map.minFilter = THREE.LinearMipmapLinearFilter;
            map.magFilter = THREE.LinearFilter;
            map.needsUpdate = true;
          }
        }
        material.needsUpdate = true;
      });
    });

    let mixer: THREE.AnimationMixer | null = null;
    if (gltf.animations.length) {
      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => mixer?.clipAction(clip).play());
    }

    return { url, pivot, meshes, mixer };
  }

  /** Undoes viewer tools (wireframe, clipping, fade) before a cached organ returns. */
  private resetMaterials(organ: LoadedOrgan) {
    organ.pivot.rotation.set(0.05, -0.28, 0);
    organ.pivot.position.set(0, 0, 0);
    organ.meshes.forEach((mesh) => {
      this.forEachMaterial(mesh, (material) => {
        material.transparent = false;
        material.opacity = 1;
        material.depthWrite = true;
        material.clippingPlanes = null;
        material.clipShadows = false;
        if (material instanceof THREE.MeshStandardMaterial) material.wireframe = false;
        material.needsUpdate = true;
      });
    });
  }

  private forEachMaterial(mesh: THREE.Mesh, fn: (material: THREE.Material) => void) {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach(fn);
  }

  private evict() {
    while (this.cache.size > CACHE_LIMIT) {
      const oldest = this.cache.keys().next().value as string | undefined;
      if (!oldest) return;
      const organ = this.cache.get(oldest);
      this.cache.delete(oldest);
      if (organ && organ !== this.current) this.destroy(organ);
    }
  }

  private destroy(organ: LoadedOrgan) {
    organ.mixer?.stopAllAction();
    organ.mixer?.uncacheRoot(organ.pivot);
    organ.pivot.removeFromParent();
    disposeObject(organ.pivot);
  }

  update(delta: number) {
    this.current?.mixer?.update(delta);
  }

  /** Detaches from the scene but keeps the organ warm for the next visit. */
  release(organ: LoadedOrgan | null = this.current) {
    if (!organ) return;
    organ.mixer?.stopAllAction();
    organ.pivot.removeFromParent();
    if (organ === this.current) this.current = null;
  }

  dispose() {
    this.queue = [];
    this.release();
    this.cache.forEach((organ) => this.destroy(organ));
    this.cache.clear();
    this.inflight.clear();
  }
}
