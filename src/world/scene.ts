import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { siteData } from "../utils/site-data";
import {
  formatVenueYear,
  getFeaturedPublications,
  sortPublications,
} from "../utils/publications";

/* ============================ DATA ============================ */
type AnyRecord = Record<string, any>;
const SITE_DATA: AnyRecord = siteData as unknown as AnyRecord;
const PROFILE = SITE_DATA.profile || {};
const DATA = {
  name: PROFILE.name || "Yinghao Zhu",
  cnName: PROFILE.cnName || "朱英豪",
  title: PROFILE.title || "PhD Student",
  affiliation: PROFILE.affiliation || "The University of Hong Kong",
  school: PROFILE.school || "School of Computing and Data Science",
  email: PROFILE.email || "yhzhu99@gmail.com",
  photo: PROFILE.photo || "/assets/profile-photo.jpg",
  bio: PROFILE.bio || "",
  interests: PROFILE.interests || [],
  workspace: PROFILE.workspace || {},
  allPublications: sortPublications(SITE_DATA.publications || []),
  featuredPublications: getFeaturedPublications(SITE_DATA.publications || []),
  education: SITE_DATA.education || [],
  experience: SITE_DATA.experience || [],
  awards: SITE_DATA.awards || [],
  links: SITE_DATA.quickLinks || [],
};
const LINK_ICONS = SITE_DATA.quickLinkIcons || {};

export function mountWorldScene() {
  /* ============================ SCENE SETUP ============================ */
  const canvas = document.getElementById("scene");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const LIGHT_PALETTE = {
    sceneBg: "#f1f5f4",
    floorBase: "#d9ccb2",
    surface: "#ffffff",
    chromeBar: "#e5e7eb",
    text: "#0f172a",
    textStrong: "#334155",
    textMuted: "#475569",
    textFaint: "#64748b",
    iconMuted: "#94a3b8",
    border: "#e2e8f0",
    borderStrong: "#cbd5e1",
    sidebar: "#f1f5f9",
    explorer: "#eef2f7",
    activeBg: "#dbeafe",
    panelMuted: "#f8fafc",
    accent: "#005bac",
    accentBlue: "#007acc",
    syntaxBlue: "#569cd6",
    syntaxInfo: "#0369a1",
    syntaxOrange: "#9a3412",
    syntaxGreen: "#047857",
    syntaxGreenDeep: "#15803d",
    syntaxPurple: "#7e22ce",
    syntaxComment: "#6a9955",
    green: "#16a34a",
    boardGreen: "#2aa876",
    milestoneBg: "#fbf7ef",
    milestoneText: "#2f4052",
    gold: "#c6a978",
    goldSoft: "#bfa56e",
    goldDark: "#9a7d4f",
    goldLine: "#d8c6a3",
    whiteboardBg: "#fbfcfb",
    whiteboardBorder: "#d8e1e7",
    cursorOff: "#ffffff",
    cursorOn: "#1e1e1e",
  };

  const DARK_PALETTE = {
    sceneBg: "#0a1113",
    floorBase: "#4a4238",
    surface: "#1a1a1d",
    chromeBar: "#232327",
    text: "#e9e9ec",
    textStrong: "#d7d7dc",
    textMuted: "#a4a4ab",
    textFaint: "#787881",
    iconMuted: "#71717a",
    border: "#2b2b31",
    borderStrong: "#3e3e46",
    sidebar: "#1c1c20",
    explorer: "#202024",
    activeBg: "#2b3c50",
    panelMuted: "#1d1d21",
    accent: "#6ea0d8",
    accentBlue: "#4f8fc8",
    syntaxBlue: "#7aa2f7",
    syntaxInfo: "#38bdf8",
    syntaxOrange: "#fb923c",
    syntaxGreen: "#34d399",
    syntaxGreenDeep: "#4ade80",
    syntaxPurple: "#c084fc",
    syntaxComment: "#9ccb7e",
    green: "#4ade80",
    boardGreen: "#34d399",
    milestoneBg: "#222226",
    milestoneText: "#d7d7dc",
    gold: "#c6a978",
    goldSoft: "#d0b488",
    goldDark: "#b08d5f",
    goldLine: "#8a734f",
    whiteboardBg: "#1e1e22",
    whiteboardBorder: "#34343a",
    cursorOff: "#0d0d0f",
    cursorOn: "#e9e9ec",
  };

  let darkTheme = document.documentElement.classList.contains("dark");
  renderer.toneMappingExposure = darkTheme ? 1.05 : 1.1;
  const P: Record<string, string> = darkTheme
    ? { ...DARK_PALETTE }
    : { ...LIGHT_PALETTE };
  const redrawTextures: Array<() => void> = [];

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(P.sceneBg);
  scene.fog = new THREE.Fog(P.sceneBg, 13, 27);

  const camera = new THREE.PerspectiveCamera(
    window.innerWidth < 640 ? 48 : 42,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
  );
  const isCompact = window.innerWidth < 640;
  const CAM_START = new THREE.Vector3(4.0, 2.28, 4.0);
  const CAM_REST = isCompact
    ? new THREE.Vector3(3.3, 1.84, 3.2)
    : new THREE.Vector3(2.75, 1.72, 2.65);
  camera.position.copy(CAM_START);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 1.03, -0.82);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.minDistance = 1.9;
  controls.maxDistance = 4.8;
  controls.minPolarAngle = 1.18;
  controls.maxPolarAngle = Math.PI / 2 - 0.04;
  controls.minAzimuthAngle = -0.38;
  controls.maxAzimuthAngle = 0.86;
  controls.rotateSpeed = 0.65;
  controls.zoomSpeed = 0.7;

  /* ============================ LIGHTING ============================ */
  const hemisphereLight = new THREE.HemisphereLight(
    0xffffff,
    0xe2d3bd,
    darkTheme ? 0.62 : 1.48,
  );
  scene.add(hemisphereLight);

  const sun = new THREE.DirectionalLight(
    darkTheme ? 0x9fb8d0 : 0xfff4d6,
    darkTheme ? 0.78 : 1.68,
  );
  sun.position.set(-4.2, 7, 4.8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -5;
  sun.shadow.camera.right = 5;
  sun.shadow.camera.top = 5;
  sun.shadow.camera.bottom = -5;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 18;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);

  const deskLamp = new THREE.PointLight(
    0xffdfa8,
    darkTheme ? 1.05 : 0.58,
    6,
    1.6,
  );
  deskLamp.position.set(1.25, 1.55, -0.55);
  deskLamp.castShadow = true;
  deskLamp.shadow.mapSize.set(512, 512);
  scene.add(deskLamp);

  const screenGlow = new THREE.PointLight(
    0x9fd4dc,
    darkTheme ? 0.55 : 0.38,
    3.5,
    2,
  );
  screenGlow.position.set(0, 1.3, -0.35);
  scene.add(screenGlow);

  const ceilingGlow = new THREE.PointLight(
    0xffffff,
    darkTheme ? 0.62 : 1.38,
    7.5,
    1.3,
  );
  ceilingGlow.position.set(0, 2.85, -0.55);
  scene.add(ceilingGlow);

  /* ============================ MATERIAL HELPERS ============================ */
  const std = (color, opts = {}) =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.85,
      metalness: 0.0,
      ...opts,
    });
  const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    return m;
  };
  const addBox = (w, h, d, mat, x = 0, y = 0, z = 0, parent = scene) => {
    const m = box(w, h, d, mat, x, y, z);
    parent.add(m);
    return m;
  };
  const addRoundedBox = (
    w,
    h,
    d,
    radius,
    mat,
    x = 0,
    y = 0,
    z = 0,
    parent = scene,
  ) => {
    const mesh = new THREE.Mesh(
      new RoundedBoxGeometry(w, h, d, 4, radius),
      mat,
    );
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };
  const setShadow = (obj, cast = true, receive = false) => {
    obj.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = cast;
        o.receiveShadow = receive;
      }
    });
    return obj;
  };
  const cylinderBetween = (
    from,
    to,
    radius,
    mat,
    parent = scene,
    segments = 16,
  ) => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const dir = end.clone().sub(start);
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, dir.length(), segments),
      mat,
    );
    mesh.position.copy(mid);
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize(),
    );
    parent.add(mesh);
    return mesh;
  };
  const capsuleBetween = (
    from,
    to,
    radius,
    mat,
    parent = scene,
    radialSegments = 12,
  ) => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const dir = end.clone().sub(start);
    const mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(
        radius,
        Math.max(0.01, dir.length() - radius * 2),
        6,
        radialSegments,
      ),
      mat,
    );
    mesh.position.copy(mid);
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize(),
    );
    parent.add(mesh);
    return mesh;
  };
  /* ============================ ROOM ============================ */
  const ROOM = new THREE.Group();
  scene.add(ROOM);

  function makeFloorTexture() {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 1024;
    const ctx = c.getContext("2d");
    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.6, 2.2);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    function redraw() {
      ctx.fillStyle = P.floorBase;
      ctx.fillRect(0, 0, c.width, c.height);
      for (let y = 0; y < c.height; y += 128) {
        ctx.fillStyle =
          y % 256 === 0 ? "rgba(255,255,255,.035)" : "rgba(78,62,38,.025)";
        ctx.fillRect(0, y, c.width, 128);
        ctx.strokeStyle = "rgba(90,72,44,.12)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(c.width, y);
        ctx.stroke();
        for (let x = -40; x < c.width; x += 220) {
          ctx.strokeStyle = "rgba(101,79,48,.045)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y + 34);
          ctx.bezierCurveTo(x + 52, y + 26, x + 110, y + 44, x + 184, y + 31);
          ctx.stroke();
        }
      }
      texture.needsUpdate = true;
    }

    redraw();
    redrawTextures.push(redraw);
    return texture;
  }

  const floorMat = new THREE.MeshStandardMaterial({
    map: makeFloorTexture(),
    color: 0xe2d6bf,
    roughness: 0.76,
    metalness: 0,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  ROOM.add(floor);

  const rug = new THREE.Mesh(
    new RoundedBoxGeometry(3.75, 0.018, 2.55, 8, 0.16),
    new THREE.MeshStandardMaterial({
      color: 0xc8d2c5,
      roughness: 1,
      metalness: 0,
    }),
  );
  rug.position.set(0.05, 0.018, -0.45);
  rug.receiveShadow = true;
  ROOM.add(rug);
  const rugInset = new THREE.Mesh(
    new RoundedBoxGeometry(3.53, 0.006, 2.33, 8, 0.13),
    new THREE.MeshStandardMaterial({ color: 0xd7ded3, roughness: 1 }),
  );
  rugInset.position.set(0.05, 0.031, -0.45);
  rugInset.receiveShadow = true;
  ROOM.add(rugInset);

  const wallColor = 0xf2eadb;
  const wallMat = std(wallColor, { roughness: 0.98 });
  const backWall = addBox(7.6, 3.1, 0.14, wallMat, 0, 1.55, -3.1, ROOM);
  backWall.receiveShadow = true;
  const leftReturn = addBox(
    0.12,
    2.8,
    2.0,
    std(0xe6dfcf, { roughness: 0.98 }),
    -3.55,
    1.4,
    2.1,
    ROOM,
  );
  const rightReturn = addBox(
    0.12,
    2.8,
    0.75,
    std(0xe6dfcf, { roughness: 0.98 }),
    3.55,
    1.4,
    -2.55,
    ROOM,
  );
  leftReturn.receiveShadow = true;
  rightReturn.receiveShadow = true;

  const ceiling = addBox(
    7.6,
    0.08,
    6.6,
    std(0xf8f5ec, { roughness: 0.95 }),
    0,
    3.08,
    -0.15,
    ROOM,
  );
  ceiling.receiveShadow = true;
  const lightBarMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 1.15,
    roughness: 0.35,
  });
  addBox(1.9, 0.035, 0.16, lightBarMat, 0, 3.035, -1.85, ROOM);
  addBox(1.5, 0.035, 0.16, lightBarMat, -1.8, 3.035, 1.3, ROOM);
  addBox(1.5, 0.035, 0.16, lightBarMat, 1.8, 3.035, 1.3, ROOM);

  const skirtingMat = std(0xeae4d6);
  addBox(7.8, 0.12, 0.05, skirtingMat, 0, 0.06, -3.0, ROOM);
  addBox(0.05, 0.12, 4.2, skirtingMat, -3.45, 0.06, -0.65, ROOM);
  addBox(0.05, 0.12, 4.2, skirtingMat, 3.45, 0.06, -0.65, ROOM);

  /* ---- Right-front whiteboard on back wall ---- */
  addBox(2.15, 1.16, 0.08, std(0xffffff), 1.35, 1.86, -3.0, ROOM);
  const wallWhiteboardTex = makeWhiteboardTexture();
  const winGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(2.15, 1.15),
    new THREE.MeshStandardMaterial({
      map: wallWhiteboardTex,
      roughness: 0.4,
      metalness: 0.02,
      emissive: 0xffffff,
      emissiveMap: wallWhiteboardTex,
      emissiveIntensity: 0.06,
    }),
  );
  winGlass.position.set(1.35, 1.86, -2.925);
  ROOM.add(winGlass);
  const winGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.1, 2.0),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
    }),
  );
  winGlow.position.set(1.35, 1.86, -3.1);
  ROOM.add(winGlow);

  const winLight = new THREE.PointLight(0xd6ecff, 0.8, 8, 2);
  winLight.position.set(1.7, 2.0, -2.0);
  scene.add(winLight);

  /* ---- Low partitions behind the chair so the guided rear edge stays occupied ---- */
  const partitionMat = std(0xe8edf0, { roughness: 0.9 });
  addBox(2.0, 1.05, 0.09, partitionMat, -1.35, 0.68, 2.35, ROOM);
  addBox(2.0, 1.05, 0.09, partitionMat, 1.35, 0.68, 2.35, ROOM);
  addBox(0.09, 1.05, 1.2, partitionMat, -2.4, 0.68, 1.78, ROOM);
  addBox(0.09, 1.05, 1.2, partitionMat, 2.4, 0.68, 1.78, ROOM);
  [-1.35, 1.35].forEach((x, i) => {
    const rearDesk = addBox(
      1.25,
      0.06,
      0.55,
      std(0xf4f0e6, { roughness: 0.64 }),
      x,
      0.82,
      2.72,
      ROOM,
    );
    rearDesk.castShadow = true;
    addBox(
      0.48,
      0.3,
      0.035,
      std(0xe9e5dc, { roughness: 0.45, metalness: 0.15 }),
      x - 0.18,
      1.12,
      2.55,
      ROOM,
    );
    addBox(
      0.38,
      0.21,
      0.01,
      new THREE.MeshBasicMaterial({ color: 0xcfe8ff }),
      x - 0.18,
      1.12,
      2.528,
      ROOM,
    );
    addBox(
      0.08,
      0.22,
      0.05,
      std(0xd6d0c5, { roughness: 0.5, metalness: 0.12 }),
      x - 0.18,
      0.94,
      2.56,
      ROOM,
    );
    addBox(
      0.32,
      0.025,
      0.2,
      std(0xe8e4da, { roughness: 0.6 }),
      x - 0.18,
      0.84,
      2.92,
      ROOM,
    );
    addBox(
      0.18,
      0.18,
      0.18,
      std(i === 0 ? 0x9ccc2e : 0xf48a2a, { roughness: 0.66 }),
      x + 0.38,
      0.93,
      2.88,
      ROOM,
    );
  });

  /* ============================ DESK ============================ */
  const DESK = new THREE.Group();
  DESK.position.set(0, 0, -1.55);
  scene.add(DESK);

  const deskMat = std(0xe2dac8, { roughness: 0.48 });
  const deskTop = addRoundedBox(
    3.0,
    0.09,
    1.25,
    0.035,
    deskMat,
    0,
    0.78,
    0,
    DESK,
  );
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  const deskLegMat = std(0xb8ad98, { roughness: 0.42, metalness: 0.18 });
  addBox(0.06, 0.78, 0.06, deskLegMat, -1.45, 0.39, -0.55, DESK);
  addBox(0.06, 0.78, 0.06, deskLegMat, 1.45, 0.39, -0.55, DESK);
  addBox(0.06, 0.78, 0.06, deskLegMat, -1.45, 0.39, 0.55, DESK);
  addBox(0.06, 0.78, 0.06, deskLegMat, 1.45, 0.39, 0.55, DESK);

  /* ---- Monitor riser / stand shelf ---- */
  const monitorRiserMat = std(0xd5c8b0, {
    roughness: 0.48,
    metalness: 0.04,
  });
  const monitorRiser = addRoundedBox(
    2.18,
    0.08,
    0.36,
    0.025,
    monitorRiserMat,
    0,
    1.02,
    -0.39,
    DESK,
  );
  monitorRiser.castShadow = true;
  monitorRiser.receiveShadow = true;
  [-0.92, 0.92].forEach((x) => {
    const leg = addRoundedBox(
      0.1,
      0.32,
      0.26,
      0.02,
      monitorRiserMat,
      x,
      0.86,
      -0.39,
      DESK,
    );
    leg.castShadow = true;
  });

  const deskPad = addRoundedBox(
    1.42,
    0.012,
    0.58,
    0.035,
    std(0x73837c, { roughness: 0.94 }),
    0.05,
    0.838,
    0.18,
    DESK,
  );
  deskPad.receiveShadow = true;

  /* ---- Desktop tower under desk ---- */
  const tower = addBox(
    0.42,
    0.62,
    0.55,
    std(0xe7e1d3, { roughness: 0.55, metalness: 0.05 }),
    1.2,
    0.34,
    0.35,
    DESK,
  );
  tower.castShadow = true;
  addBox(
    0.012,
    0.18,
    0.012,
    new THREE.MeshStandardMaterial({
      color: 0x005bac,
      emissive: 0x005bac,
      emissiveIntensity: 2,
    }),
    1.0,
    0.5,
    0.075,
    DESK,
  );

  /* ============================ MONITORS ============================ */
  function makeEditorCanvas(title, drawContent, opts = {}) {
    const W = 1024,
      H = 620;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d");
    return { canvas: c, ctx, W, H, title, drawContent, opts };
  }

  function drawEditorShell(ctx, W, H, filename, folder) {
    ctx.fillStyle = P.surface;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = P.chromeBar;
    ctx.fillRect(0, 0, W, 30);

    const dotCols = ["#ff5f57", "#febc2e", "#28c840"];
    dotCols.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(20 + i * 20, 15, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = P.textMuted;
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.textBaseline = "middle";
    ctx.fillText("Visual Studio Code", W / 2 - 60, 15);

    ctx.fillStyle = P.sidebar;
    ctx.fillRect(0, 30, 54, H - 30);

    const actIcons = ["\u{1F4C1}", "\u{1F50D}", "\u{1F37E}", "\u{1F4DE}"];
    actIcons.forEach((ic, i) => {
      ctx.fillStyle = i === 0 ? P.accent : P.iconMuted;
      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(ic, 27, 70 + i * 50);
    });
    ctx.textAlign = "left";

    ctx.fillStyle = P.explorer;
    ctx.fillRect(54, 30, 220, H - 30);

    ctx.fillStyle = P.textStrong;
    ctx.font = 'bold 12px "Inter", sans-serif';
    ctx.fillText(folder || "EXPLORER", 68, 52);

    ctx.fillStyle = P.textFaint;
    ctx.font = '12px "JetBrains Mono", monospace';
    const tree = [
      ">  YINGHAO",
      "   >  research",
      "      portfolio",
      "   >  personal",
    ];
    tree.forEach((t, i) => {
      ctx.fillStyle = i === 0 ? P.textStrong : P.textFaint;
      ctx.fillText(t, 68, 86 + i * 22);
    });

    const fileY = 86 + tree.length * 22 + 12;
    const files = [
      { n: "README.md", active: false },
      { n: filename, active: true },
      { n: "notes.md", active: false },
    ];
    files.forEach((f, i) => {
      if (f.active) {
        ctx.fillStyle = P.activeBg;
        ctx.fillRect(56, fileY + i * 22 - 12, 216, 22);
        ctx.fillStyle = P.text;
      } else {
        ctx.fillStyle = P.textFaint;
      }
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText("\u{1F4C4} " + f.n, 64, fileY + i * 22);
    });

    ctx.fillStyle = P.border;
    ctx.fillRect(274, 30, W - 274, 35);
    ctx.fillStyle = P.surface;
    ctx.fillRect(274, 40, 200, 25);
    ctx.fillStyle = P.text;
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText(filename, 286, 53);
    ctx.fillStyle = P.textFaint;
    ctx.fillText("notes.md", 484, 53);

    ctx.fillStyle = P.surface;
    ctx.fillRect(274, 65, W - 274, H - 65);

    ctx.fillStyle = P.accentBlue;
    ctx.fillRect(274, 65, 3, H - 65);

    ctx.fillStyle = P.iconMuted;
    ctx.font = '13px "JetBrains Mono", monospace';
    for (let i = 1; i <= 22; i++) {
      ctx.fillText(String(i), 290, 86 + (i - 1) * 22);
    }
  }

  const aboutEditor = makeEditorCanvas("about_me.md", (ctx, W, H) => {
    drawEditorShell(ctx, W, H, "about_me.md", "PERSONAL");
    const x = 320,
      y0 = 88,
      lh = 22;

    const line = (text: string, color: string, y: number, bold = false) => {
      ctx.fillStyle = color || P.textStrong;
      ctx.font = (bold ? "bold " : "") + '13px "JetBrains Mono", monospace';
      ctx.fillText(text, x, y);
    };

    line("# Yinghao Zhu  (朱英豪)", P.syntaxBlue, y0, true);
    line("PhD Student · The University of Hong Kong", P.syntaxInfo, y0 + lh);
    line(
      "AI for Healthcare · Medical LLMs · Agents",
      P.syntaxOrange,
      y0 + lh * 2,
    );
    line("", P.textStrong, y0 + lh * 3);

    line("## Research Interests", P.syntaxBlue, y0 + lh * 4, true);
    line("- Autonomous & collaborative AI agents", P.textStrong, y0 + lh * 5);
    line("- Medical large language models (LLMs)", P.textStrong, y0 + lh * 6);
    line("- Benchmarks, toolkits & platforms", P.textStrong, y0 + lh * 7);
    line(
      "- Human-agent collaboration in healthcare",
      P.textStrong,
      y0 + lh * 8,
    );
    line("", P.textStrong, y0 + lh * 9);

    line("## Advisors", P.syntaxBlue, y0 + lh * 10, true);
    line("Prof. Lequan Yu  (HKU)", P.syntaxGreen, y0 + lh * 11);
    line("Prof. Liantao Ma (Peking Univ.)", P.syntaxGreen, y0 + lh * 12);
    line("", P.textStrong, y0 + lh * 13);

    line("## Contact", P.syntaxBlue, y0 + lh * 14, true);
    line("yhzhu99@gmail.com", P.syntaxPurple, y0 + lh * 15);
    line(
      "scholar.google.com  ·  github.com/yhzhu99",
      P.syntaxGreenDeep,
      y0 + lh * 16,
    );
    line("", P.textStrong, y0 + lh * 17);

    line("// click this monitor to read more", P.syntaxComment, y0 + lh * 19);
    line("// or explore the desk & shelves", P.syntaxComment, y0 + lh * 20);

    const cy = y0 + lh * 21.6;
    ctx.fillStyle = P.text;
    ctx.fillRect(x, cy - 11, 8, 16);
  });

  const aboutTex = new THREE.CanvasTexture(aboutEditor.canvas);
  aboutTex.colorSpace = THREE.SRGBColorSpace;
  aboutTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  function redrawAbout() {
    aboutEditor.drawContent(aboutEditor.ctx, aboutEditor.W, aboutEditor.H);
    aboutTex.needsUpdate = true;
  }
  redrawAbout();
  redrawTextures.push(redrawAbout);

  /* Publications: fixed screen canvas */
  const pubW = 1024,
    pubH = 620;
  const pubCanvas = document.createElement("canvas");
  pubCanvas.width = pubW;
  pubCanvas.height = pubH;
  const pubCtx = pubCanvas.getContext("2d");
  function drawPubScreen() {
    pubCtx.fillStyle = P.surface;
    pubCtx.fillRect(0, 0, pubW, pubH);
    pubCtx.fillStyle = P.chromeBar;
    pubCtx.fillRect(0, 0, pubW, 30);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
      pubCtx.fillStyle = c;
      pubCtx.beginPath();
      pubCtx.arc(20 + i * 20, 15, 6, 0, Math.PI * 2);
      pubCtx.fill();
    });
    pubCtx.fillStyle = P.textMuted;
    pubCtx.font = '13px "JetBrains Mono", monospace';
    pubCtx.textBaseline = "middle";
    pubCtx.fillText("publications.md  -  featured works", pubW / 2 - 110, 15);

    pubCtx.fillStyle = P.border;
    pubCtx.fillRect(0, 30, pubW, 35);
    pubCtx.fillStyle = P.surface;
    pubCtx.fillRect(0, 40, 240, 25);
    pubCtx.fillStyle = P.text;
    pubCtx.font = '12px "JetBrains Mono", monospace';
    pubCtx.fillText("publications.md", 16, 53);

    let y = 82;
    const wrap = (text, max) => {
      const words = text.split(" ");
      const lines = [];
      let cur = "";
      words.forEach((w) => {
        if ((cur + " " + w).length > max) {
          lines.push(cur);
          cur = w;
        } else cur = cur ? cur + " " + w : w;
      });
      if (cur) lines.push(cur);
      return lines;
    };

    DATA.featuredPublications.slice(0, 3).forEach((p, i) => {
      const titleLines = wrap(p.title, 72).slice(0, 2);
      const cardHeight = titleLines.length === 1 ? 120 : 142;
      const headerY = y + 30;
      const titleY = y + 62;
      const authorY = titleY + titleLines.length * 24 + 8;
      const venueY = authorY + 22;

      pubCtx.fillStyle = P.panelMuted;
      pubCtx.strokeStyle = P.borderStrong;
      pubCtx.lineWidth = 1;
      pubCtx.beginPath();
      pubCtx.roundRect(36, y, pubW - 72, cardHeight, 14);
      pubCtx.fill();
      pubCtx.stroke();

      pubCtx.fillStyle = P.accent;
      pubCtx.font = 'bold 18px "Inter", sans-serif';
      pubCtx.fillText(String(i + 1).padStart(2, "0"), 58, headerY);

      pubCtx.fillStyle = P.textStrong;
      pubCtx.font = 'bold 12px "JetBrains Mono", monospace';
      pubCtx.fillText(p.year + "  |  " + p.tag, 104, headerY);

      pubCtx.fillStyle = P.text;
      pubCtx.font = 'bold 20px "Inter", sans-serif';
      titleLines.forEach((l, lineIndex) => {
        pubCtx.fillText(l, 58, titleY + lineIndex * 24);
      });

      const authLine = wrap(p.authors, 92)[0] || "";
      pubCtx.fillStyle = P.textStrong;
      pubCtx.font = '14px "JetBrains Mono", monospace';
      pubCtx.fillText(authLine, 58, authorY);

      pubCtx.fillStyle = P.syntaxInfo;
      pubCtx.font = 'italic 13px "Inter", sans-serif';
      pubCtx.fillText(formatVenueYear(p.venue, p.year), 58, venueY);

      pubCtx.fillStyle = P.textMuted;
      pubCtx.font = 'bold 12px "JetBrains Mono", monospace';
      const links = p.links.map((l) => l.type).join("  ·  ");
      pubCtx.fillText("open: " + links, 760, venueY);

      y += cardHeight + 16;
    });

    pubCtx.fillStyle = P.syntaxGreenDeep;
    pubCtx.font = 'italic 13px "JetBrains Mono", monospace';
    pubCtx.fillText(
      "// static window - click monitor for full details",
      40,
      596,
    );
  }
  const pubTex = new THREE.CanvasTexture(pubCanvas);
  pubTex.colorSpace = THREE.SRGBColorSpace;
  pubTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  function redrawPub() {
    drawPubScreen();
    pubTex.needsUpdate = true;
  }
  redrawPub();
  redrawTextures.push(redrawPub);

  function buildMonitor(
    screenTex: THREE.Texture,
    x: number,
    opts: { emissive?: number; tilt?: number } = {},
  ) {
    const g = new THREE.Group();
    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0xe9e5dc,
      roughness: 0.38,
      metalness: 0.25,
    });
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(1.18, 0.7, 0.045),
      bezelMat,
    );
    frame.position.y = 0.35;
    frame.castShadow = true;
    g.add(frame);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.1, 0.62),
      new THREE.MeshStandardMaterial({
        map: screenTex,
        emissive: 0xffffff,
        emissiveMap: screenTex,
        emissiveIntensity: opts.emissive ?? 0.85,
        roughness: 0.35,
      }),
    );
    screen.position.set(0, 0.35, 0.024);
    g.add(screen);

    const standNeck = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.16, 0.05),
      bezelMat,
    );
    standNeck.position.set(0, -0.05, -0.055);
    g.add(standNeck);
    const standBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.03, 0.26),
      bezelMat,
    );
    standBase.position.set(0, -0.15, -0.055);
    standBase.castShadow = true;
    g.add(standBase);

    if (opts.tilt) g.rotation.x = opts.tilt;
    g.position.set(x, 0.815 + 0.12, -0.55 + 0.18);
    return { group: g, screen, screenTex };
  }

  const monitorA = buildMonitor(aboutTex, -0.62, { emissive: 0.8 });
  const monitorB = buildMonitor(pubTex, 0.62, { emissive: 0.85 });
  monitorA.group.position.y += 0.265;
  monitorB.group.position.y += 0.265;
  monitorA.group.rotation.y = 0.16;
  monitorB.group.rotation.y = -0.16;
  DESK.add(monitorA.group);
  DESK.add(monitorB.group);

  /* ============================ LAPTOP / MOUSE ============================ */
  function makeLaptopTexture() {
    const c = document.createElement("canvas");
    c.width = 960;
    c.height = 600;
    const ctx = c.getContext("2d");
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    function redraw() {
      ctx.fillStyle = P.panelMuted;
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = P.border;
      ctx.fillRect(0, 0, c.width, 46);
      ["#ff5f57", "#febc2e", "#28c840"].forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(28 + i * 28, 23, 8, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = P.text;
      ctx.font = '700 34px "Inter", sans-serif';
      ctx.fillText("Yinghao Zhu", 64, 132);
      ctx.fillStyle = P.accent;
      ctx.font = '700 46px "Inter", sans-serif';
      ctx.fillText("AI for Healthcare", 64, 206);
      ctx.fillStyle = P.textMuted;
      ctx.font = '24px "JetBrains Mono", monospace';
      [
        "medical LLMs",
        "agentic workflows",
        "clinical decision support",
        "benchmarks and toolkits",
      ].forEach((line, i) => {
        ctx.fillText(`> ${line}`, 72, 292 + i * 46);
      });
      ctx.fillStyle = P.green;
      ctx.fillRect(64, 228, 360, 8);
      tex.needsUpdate = true;
    }

    redraw();
    redrawTextures.push(redraw);
    return tex;
  }

  const laptopMat = std(0xe9e8e3, { roughness: 0.38, metalness: 0.3 });
  const hingeMat = std(0x6b7280, { roughness: 0.42, metalness: 0.28 });
  const laptopBase = addBox(0.68, 0.03, 0.38, laptopMat, 0, 0.84, 0.18, DESK);
  laptopBase.castShadow = true;
  const laptopKeyMat = std(0xd8d3c8, { roughness: 0.52, metalness: 0.08 });
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 9; c++) {
      addBox(
        0.038,
        0.004,
        0.025,
        laptopKeyMat,
        -0.18 + c * 0.045,
        0.858,
        0.07 + r * 0.035,
        DESK,
      );
    }
  }
  addBox(0.26, 0.004, 0.028, laptopKeyMat, 0, 0.858, 0.178, DESK);
  addBox(
    0.15,
    0.004,
    0.085,
    std(0xd0c8bb, { roughness: 0.5, metalness: 0.08 }),
    0,
    0.862,
    0.248,
    DESK,
  );
  cylinderBetween(
    [-0.35, 0.862, -0.02],
    [0.35, 0.862, -0.02],
    0.01,
    hingeMat,
    DESK,
  );

  const laptopScreenGroup = new THREE.Group();
  laptopScreenGroup.position.set(0, 0.862, -0.02);
  laptopScreenGroup.rotation.x = -0.24;
  DESK.add(laptopScreenGroup);

  const laptopLid = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.42, 0.016),
    laptopMat,
  );
  laptopLid.position.set(0, 0.215, 0);
  laptopLid.castShadow = true;
  laptopScreenGroup.add(laptopLid);

  const laptopInnerBezel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.64, 0.39),
    new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.45,
      metalness: 0.04,
    }),
  );
  laptopInnerBezel.position.set(0, 0.215, 0.011);
  laptopScreenGroup.add(laptopInnerBezel);

  const laptopScreenTex = makeLaptopTexture();
  const laptopScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 0.35),
    new THREE.MeshStandardMaterial({
      map: laptopScreenTex,
      roughness: 0.35,
      emissive: 0xffffff,
      emissiveMap: laptopScreenTex,
      emissiveIntensity: 0.72,
    }),
  );
  laptopScreen.position.set(0, 0.215, 0.012);
  laptopScreenGroup.add(laptopScreen);

  const mouse = addBox(
    0.12,
    0.035,
    0.18,
    std(0xf1eee6, { roughness: 0.5 }),
    0.62,
    0.838,
    0.2,
    DESK,
  );
  mouse.castShadow = true;

  /* ============================ DESK DECOR ============================ */
  /* Speedcubing cubes */
  function createStickeredCube(
    dimension: number,
    faceColors: AnyRecord,
    cubieSize = 0.048,
    gap = 0.004,
  ) {
    const cubeGroup = new THREE.Group();
    const black = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.58,
    });
    const sticker = (color: number) =>
      new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
    const colors = {
      right: sticker(faceColors.right),
      left: sticker(faceColors.left),
      top: sticker(faceColors.top),
      bottom: sticker(faceColors.bottom),
      front: sticker(faceColors.front),
      back: sticker(faceColors.back),
    };
    const offset = (dimension - 1) / 2;
    for (let xi = 0; xi < dimension; xi++) {
      for (let yi = 0; yi < dimension; yi++) {
        for (let zi = 0; zi < dimension; zi++) {
          const x = xi - offset;
          const y = yi - offset;
          const z = zi - offset;
          const materials = [
            xi === dimension - 1 ? colors.right : black,
            xi === 0 ? colors.left : black,
            yi === dimension - 1 ? colors.top : black,
            yi === 0 ? colors.bottom : black,
            zi === dimension - 1 ? colors.front : black,
            zi === 0 ? colors.back : black,
          ];
          const cubie = new THREE.Mesh(
            new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize),
            materials,
          );
          cubie.position.set(
            x * (cubieSize + gap),
            y * (cubieSize + gap),
            z * (cubieSize + gap),
          );
          cubie.castShadow = true;
          cubeGroup.add(cubie);
        }
      }
    }
    return cubeGroup;
  }

  const speedcubePair = new THREE.Group();
  speedcubePair.position.set(-1.03, 0.9, 0.45);

  const rubiksCube3 = createStickeredCube(3, {
    right: 0xd62828,
    left: 0xf77f00,
    top: 0xffd60a,
    bottom: 0xf8f9fa,
    front: 0x1d4ed8,
    back: 0x15803d,
  });
  rubiksCube3.position.set(-0.095, 0, 0);
  rubiksCube3.rotation.set(0.12, -0.48, 0.08);
  speedcubePair.add(rubiksCube3);

  const pocketCube = createStickeredCube(
    2,
    {
      right: 0x1d4ed8,
      left: 0xf8f9fa,
      top: 0xf77f00,
      bottom: 0xffd60a,
      front: 0xf8f9fa,
      back: 0xd62828,
    },
    0.056,
    0.005,
  );
  pocketCube.position.set(0.095, -0.018, 0.025);
  pocketCube.rotation.set(0.14, -0.34, -0.04);
  speedcubePair.add(pocketCube);

  DESK.add(speedcubePair);

  /* Sticky note (links) */
  const sticky = addBox(
    0.18,
    0.005,
    0.18,
    std(0xfff176, {
      roughness: 0.8,
      emissive: 0xfff176,
      emissiveIntensity: 0.05,
    }),
    1.12,
    0.84,
    0.28,
    DESK,
  );
  sticky.rotation.y = 0.18;

  /* Trophy (awards) */
  const trophyGroup = new THREE.Group();
  const trophyBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.12, 0.05, 24),
    std(0xbfa56e, { roughness: 0.45 }),
  );
  trophyBase.castShadow = true;
  trophyGroup.add(trophyBase);
  const trophyPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.12, 16),
    new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.25,
    }),
  );
  trophyPole.position.y = 0.085;
  trophyGroup.add(trophyPole);
  const trophyCup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.06, 0.16, 24, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xe8c766,
      metalness: 0.9,
      roughness: 0.2,
      side: THREE.DoubleSide,
    }),
  );
  trophyCup.position.y = 0.22;
  trophyGroup.add(trophyCup);
  const trophyHandleL = new THREE.Mesh(
    new THREE.TorusGeometry(0.04, 0.012, 10, 18, Math.PI),
    new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.25,
    }),
  );
  trophyHandleL.position.set(-0.1, 0.22, 0);
  trophyHandleL.rotation.z = Math.PI / 2;
  trophyGroup.add(trophyHandleL);
  const trophyHandleR = trophyHandleL.clone();
  trophyHandleR.position.set(0.1, 0.22, 0);
  trophyGroup.add(trophyHandleR);
  const trophyTop = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 16, 12),
    new THREE.MeshStandardMaterial({
      color: 0xe8c766,
      metalness: 0.9,
      roughness: 0.2,
    }),
  );
  trophyTop.position.y = 0.32;
  trophyGroup.add(trophyTop);
  trophyGroup.position.set(1.22, 0.82, -0.42);
  trophyGroup.rotation.y = -0.28;
  DESK.add(trophyGroup);

  /* ============================ BOOKSHELVES / SIDE CUBBIES ============================ */
  const shelfFrameMat = std(0xc6a978, { roughness: 0.68, metalness: 0.02 });
  const shelfPanelMats = [
    std(0xd8c6a3, { roughness: 0.72 }),
    std(0xe7d8bd, { roughness: 0.72 }),
    std(0xf5efe2, { roughness: 0.82 }),
    std(0xcdb38a, { roughness: 0.74 }),
  ];
  const bookColors = [
    0x8fb5d6, 0xb98276, 0x90b28a, 0xc4aa7a, 0xaeb8c4, 0xd2a772, 0xb8a2c8,
    0xf2eadb,
  ];

  function createSideShelf(side = -1) {
    const g = new THREE.Group();
    const x = side * 3.04;
    const faceX = side * -0.08;
    g.position.set(x, 0, -0.42);
    scene.add(g);

    addBox(0.16, 2.45, 4.65, shelfFrameMat, 0, 1.22, 0, g);
    addBox(0.26, 0.08, 4.82, shelfFrameMat, faceX, 2.48, 0, g);
    addBox(0.26, 0.08, 4.82, shelfFrameMat, faceX, 0.08, 0, g);
    [-1.85, -0.92, 0, 0.92, 1.85].forEach((z) =>
      addBox(0.22, 2.34, 0.05, shelfFrameMat, faceX, 1.26, z, g),
    );
    [0.58, 1.18, 1.78, 2.34].forEach((y) =>
      addBox(0.22, 0.05, 4.72, shelfFrameMat, faceX, y, 0, g),
    );

    let colorIdx = side > 0 ? 1 : 0;
    [-1.38, -0.46, 0.46, 1.38].forEach((z, col) => {
      [0.38, 0.98, 1.58, 2.14].forEach((y, row) => {
        if ((row + col + (side > 0 ? 1 : 0)) % 3 === 0) {
          const panel = addBox(
            0.045,
            0.43,
            0.72,
            shelfPanelMats[colorIdx % shelfPanelMats.length],
            side * -0.2,
            y,
            z,
            g,
          );
          panel.castShadow = true;
          colorIdx++;
        }
      });
    });

    let bi = 0;
    [-1.55, -0.62, 0.28, 1.12].forEach((z, shelfIndex) => {
      const baseY = 0.62 + (shelfIndex % 3) * 0.6;
      for (let i = 0; i < 7; i++) {
        const h = 0.28 + (i % 4) * 0.035;
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.045, h, 0.18),
          new THREE.MeshStandardMaterial({
            color: bookColors[(bi + shelfIndex) % bookColors.length],
            roughness: 0.72,
          }),
        );
        book.position.set(side * -0.22, baseY + h / 2, z + i * 0.055);
        book.rotation.y = side * 0.04;
        book.castShadow = true;
        g.add(book);
        bi++;
      }
    });

    const boxMat = std(0xf5efe1, { roughness: 0.8 });
    addBox(0.16, 0.18, 0.42, boxMat, side * -0.2, 0.72, 1.82, g);
    addBox(
      0.16,
      0.16,
      0.38,
      std(0xb9d77b, { roughness: 0.72 }),
      side * -0.2,
      1.33,
      -1.8,
      g,
    );
    setShadow(g, true, true);
    return g;
  }

  const SHELF = createSideShelf(-1);

  /* Wall diploma frame (education/experience) */
  function makeMilestoneTexture(kind) {
    const c = document.createElement("canvas");
    c.width = 700;
    c.height = 920;
    const ctx = c.getContext("2d");
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;

    function redraw() {
      ctx.fillStyle = P.milestoneBg;
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = P.gold;
      ctx.fillRect(0, 0, c.width, 22);
      ctx.fillRect(0, c.height - 22, c.width, 22);
      ctx.fillStyle = P.text;
      ctx.font = "700 44px Inter, sans-serif";
      ctx.fillText(kind === "education" ? "Education" : "Experience", 64, 108);
      ctx.fillStyle = P.accent;
      ctx.fillRect(64, 138, 118, 8);
      ctx.font = "600 28px Inter, sans-serif";
      ctx.fillStyle = P.milestoneText;
      const rows =
        kind === "education"
          ? [
              "HKU · PhD",
              "Beihang · M.Eng.",
              "Polimi · Exchange",
              "Beihang · B.Eng.",
            ]
          : [
              "Peking University",
              "Stanford",
              "University of Zurich",
              "Fudan Children's Hospital",
            ];
      rows.forEach((row, i) => {
        const y = 230 + i * 132;
        ctx.fillStyle = i === 0 ? P.accent : P.goldSoft;
        ctx.beginPath();
        ctx.arc(94, y - 8, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = P.milestoneText;
        ctx.fillText(row, 132, y);
        ctx.fillStyle = P.goldDark;
        ctx.fillRect(78, y + 24, 340 - i * 26, 10);
        if (i < rows.length - 1) {
          ctx.strokeStyle = P.goldLine;
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(94, y + 20);
          ctx.lineTo(94, y + 98);
          ctx.stroke();
        }
      });
      tex.needsUpdate = true;
    }

    redraw();
    redrawTextures.push(redraw);
    return tex;
  }

  function makeMilestoneFrame(kind, x, scale = 1) {
    const group = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xc6a978,
      metalness: 0.08,
      roughness: 0.48,
    });
    const frameOuter = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.9, 0.04),
      frameMat,
    );
    group.add(frameOuter);
    const paper = new THREE.Mesh(
      new THREE.PlaneGeometry(0.58, 0.78),
      new THREE.MeshStandardMaterial({
        map: makeMilestoneTexture(kind),
        roughness: 0.85,
      }),
    );
    paper.position.z = 0.024;
    group.add(paper);
    group.position.set(x, 1.94, -3.02);
    group.scale.set(scale, scale, 1);
    ROOM.add(group);
    return group;
  }

  const frameGroup = makeMilestoneFrame("education", -0.92, 1);
  const frame2 = makeMilestoneFrame("experience", -0.18, 0.92);

  /* ============================ WHITEBOARD ============================ */
  function makeWhiteboardTexture() {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 640;
    const ctx = c.getContext("2d");
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    function redraw() {
      ctx.fillStyle = P.whiteboardBg;
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.strokeStyle = P.whiteboardBorder;
      ctx.lineWidth = 5;
      ctx.strokeRect(18, 18, c.width - 36, c.height - 36);

      ctx.fillStyle = "rgba(0, 91, 172, 0.055)";
      for (let y = 120; y < 560; y += 72) {
        ctx.fillRect(92, y, 840, 3);
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = '54px "Comic Sans MS", "Bradley Hand", "Segoe Print", cursive';
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(0, 65, 125, 0.18)";
      ctx.lineWidth = 7;
      ctx.strokeText("AI for Healthcare", c.width / 2 + 3, c.height / 2 - 2);
      ctx.fillStyle = P.accent;
      ctx.fillText("AI for Healthcare", c.width / 2, c.height / 2);

      ctx.strokeStyle = P.boardGreen;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(248, 406);
      ctx.bezierCurveTo(384, 436, 646, 436, 782, 404);
      ctx.stroke();

      tex.needsUpdate = true;
    }

    redraw();
    redrawTextures.push(redraw);
    return tex;
  }

  /* ============================ PLANT ============================ */
  const plant = new THREE.Group();
  const planterMat = new THREE.MeshStandardMaterial({
    color: 0xd8c4a8,
    roughness: 0.86,
    metalness: 0,
  });
  const pot = new THREE.Mesh(
    new RoundedBoxGeometry(0.27, 0.2, 0.27, 5, 0.035),
    planterMat,
  );
  pot.castShadow = true;
  pot.receiveShadow = true;
  plant.add(pot);
  const potRim = new THREE.Mesh(
    new RoundedBoxGeometry(0.3, 0.045, 0.3, 5, 0.035),
    new THREE.MeshStandardMaterial({
      color: 0xe2d2bb,
      roughness: 0.8,
    }),
  );
  potRim.position.y = 0.09;
  potRim.castShadow = true;
  plant.add(potRim);
  const soil = new THREE.Mesh(
    new RoundedBoxGeometry(0.235, 0.018, 0.235, 4, 0.025),
    std(0x34271c, { roughness: 1 }),
  );
  soil.position.y = 0.116;
  plant.add(soil);
  const potFootMat = std(0xb9a589, { roughness: 0.88 });
  [-0.095, 0.095].forEach((x) => {
    [-0.095, 0.095].forEach((z) => {
      addRoundedBox(0.045, 0.025, 0.045, 0.01, potFootMat, x, -0.112, z, plant);
    });
  });

  const stemMat = std(0x49784a, { roughness: 0.8 });
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x4e8a52,
    roughness: 0.82,
  });
  const petalOuterMat = new THREE.MeshStandardMaterial({
    color: 0xe8a92c,
    roughness: 0.72,
    side: THREE.DoubleSide,
  });
  const petalInnerMat = new THREE.MeshStandardMaterial({
    color: 0xf5bf3f,
    roughness: 0.7,
    side: THREE.DoubleSide,
  });
  const centerMat = new THREE.MeshStandardMaterial({
    color: 0x59412b,
    roughness: 0.92,
  });
  const seedMat = std(0x2f241c, { roughness: 1 });

  const petalShape = new THREE.Shape();
  petalShape.moveTo(0, 0);
  petalShape.bezierCurveTo(-0.032, 0.034, -0.038, 0.082, 0, 0.118);
  petalShape.bezierCurveTo(0.038, 0.082, 0.032, 0.034, 0, 0);
  const petalGeometry = new THREE.ShapeGeometry(petalShape, 5);

  function addSunflower(x: number, z: number, height: number, tilt = 0) {
    const flower = new THREE.Group();
    flower.position.set(x, 0.11, z);
    plant.add(flower);

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.015, height, 10),
      stemMat,
    );
    stem.position.y = height / 2;
    stem.rotation.z = tilt;
    stem.castShadow = true;
    flower.add(stem);

    [
      [-0.045, height * 0.44, 0.028, 0.55],
      [0.04, height * 0.58, -0.02, -0.55],
    ].forEach(([lx, ly, lz, rz]) => {
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.052, 12, 8),
        leafMat,
      );
      leaf.scale.set(1.5, 0.34, 0.58);
      leaf.position.set(lx, ly, lz);
      leaf.rotation.set(0.15, 0.25, rz);
      leaf.castShadow = true;
      flower.add(leaf);
    });

    const head = new THREE.Group();
    head.position.set(Math.sin(tilt) * height * 0.42, height + 0.015, 0);
    head.rotation.set(-0.04, 0.34, -tilt * 0.45);
    flower.add(head);

    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeometry, petalOuterMat);
      petal.position.set(Math.cos(a) * 0.045, Math.sin(a) * 0.045, -0.006);
      petal.rotation.z = a;
      petal.scale.set(0.82, 0.9, 1);
      petal.castShadow = true;
      head.add(petal);
    }

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
      const petal = new THREE.Mesh(petalGeometry, petalInnerMat);
      petal.position.set(Math.cos(a) * 0.034, Math.sin(a) * 0.034, 0.004);
      petal.rotation.z = a;
      petal.scale.set(0.72, 0.66, 1);
      petal.castShadow = true;
      head.add(petal);
    }

    const center = new THREE.Mesh(
      new THREE.CylinderGeometry(0.057, 0.062, 0.025, 32),
      centerMat,
    );
    center.rotation.x = Math.PI / 2;
    center.position.z = 0.018;
    center.castShadow = true;
    head.add(center);

    for (let i = 0; i < 18; i++) {
      const radius = 0.014 + (i % 3) * 0.014;
      const angle = i * 2.39996;
      const seed = new THREE.Mesh(
        new THREE.SphereGeometry(0.004, 6, 4),
        seedMat,
      );
      seed.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0.034,
      );
      head.add(seed);
    }
  }

  addSunflower(-0.04, 0.01, 0.47, -0.07);
  addSunflower(0.055, 0.025, 0.39, 0.09);
  addSunflower(0.005, -0.045, 0.32, 0.025);
  plant.position.set(-2.18, 0.24, -1.12);
  plant.scale.set(1.72, 1.72, 1.72);
  scene.add(plant);

  /* ============================ CHAIR ============================ */
  const chair = new THREE.Group();
  const chairMat = std(0xc9cec8, { roughness: 0.72 });
  const chairInsetMat = std(0xaeb9b3, { roughness: 0.9 });
  const chairMetalMat = std(0xa9aca8, { metalness: 0.38, roughness: 0.4 });
  const seat = new THREE.Mesh(
    new RoundedBoxGeometry(0.55, 0.1, 0.52, 5, 0.06),
    chairMat,
  );
  seat.position.y = 0.5;
  seat.castShadow = true;
  chair.add(seat);
  const backRest = new THREE.Mesh(
    new RoundedBoxGeometry(0.53, 0.58, 0.075, 6, 0.065),
    chairMat,
  );
  backRest.position.set(0, 0.82, 0.24);
  backRest.rotation.x = -0.08;
  backRest.castShadow = true;
  chair.add(backRest);
  const backInset = new THREE.Mesh(
    new RoundedBoxGeometry(0.42, 0.45, 0.012, 5, 0.055),
    chairInsetMat,
  );
  backInset.position.set(0, 0.83, 0.198);
  backInset.rotation.x = -0.08;
  chair.add(backInset);
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.5, 12),
    chairMetalMat,
  );
  pole.position.y = 0.25;
  chair.add(pole);
  [-1, 1].forEach((side) => {
    capsuleBetween(
      [side * 0.27, 0.52, 0.06],
      [side * 0.31, 0.73, -0.02],
      0.018,
      chairMetalMat,
      chair,
    );
    const armPad = addRoundedBox(
      0.09,
      0.035,
      0.28,
      0.018,
      chairMat,
      side * 0.31,
      0.75,
      -0.12,
      chair,
    );
    armPad.castShadow = true;
  });
  const chairBase = new THREE.Group();
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.11, 0.075, 20),
    chairMetalMat,
  );
  hub.position.y = 0.075;
  hub.castShadow = true;
  chairBase.add(hub);
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const start = [Math.cos(angle) * 0.055, 0.065, Math.sin(angle) * 0.055];
    const end = [Math.cos(angle) * 0.32, 0.042, Math.sin(angle) * 0.32];
    const leg = capsuleBetween(start, end, 0.026, chairMetalMat, chairBase, 10);
    leg.castShadow = true;

    const caster = new THREE.Group();
    caster.position.set(
      Math.cos(angle) * 0.345,
      0.018,
      Math.sin(angle) * 0.345,
    );
    caster.rotation.y = -angle;
    const fork = addRoundedBox(
      0.045,
      0.055,
      0.06,
      0.012,
      chairMetalMat,
      0,
      0.035,
      0,
      caster,
    );
    fork.castShadow = true;
    [-0.027, 0.027].forEach((z) => {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.028, 0.018, 14),
        std(0x4c5351, { roughness: 0.76 }),
      );
      wheel.position.set(0, 0, z);
      wheel.rotation.x = Math.PI / 2;
      wheel.castShadow = true;
      caster.add(wheel);
    });
    chairBase.add(caster);
  }
  chair.add(chairBase);
  chair.position.set(0.05, 0, -0.48);
  chair.rotation.y = 0.04;
  scene.add(chair);

  const person = new THREE.Group();
  const skinMat = std(0xf0c7a5, { roughness: 0.62 });
  const shirtMat = std(0x2d788d, { roughness: 0.78 });
  const shirtAccentMat = std(0x1e596c, { roughness: 0.82 });
  const trouserMat = std(0x26333f, { roughness: 0.72 });
  const shoeMat = std(0x111827, { roughness: 0.55 });
  const hairMat = std(0x28231f, { roughness: 0.88 });

  const torsoShape = new THREE.Shape();
  torsoShape.moveTo(-0.12, -0.25);
  torsoShape.bezierCurveTo(-0.18, -0.22, -0.21, -0.14, -0.205, -0.03);
  torsoShape.lineTo(-0.195, 0.12);
  torsoShape.bezierCurveTo(-0.19, 0.2, -0.12, 0.24, 0, 0.25);
  torsoShape.bezierCurveTo(0.12, 0.24, 0.19, 0.2, 0.195, 0.12);
  torsoShape.lineTo(0.205, -0.03);
  torsoShape.bezierCurveTo(0.21, -0.14, 0.18, -0.22, 0.12, -0.25);
  torsoShape.closePath();
  const torsoGeometry = new THREE.ExtrudeGeometry(torsoShape, {
    depth: 0.24,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 4,
    curveSegments: 8,
  });
  torsoGeometry.translate(0, 0, -0.12);
  const torso = new THREE.Mesh(torsoGeometry, shirtMat);
  torso.position.set(0, 0.87, -0.055);
  torso.rotation.x = -0.12;
  torso.castShadow = true;
  person.add(torso);
  capsuleBetween(
    [-0.18, 1.04, -0.075],
    [0.18, 1.04, -0.075],
    0.075,
    shirtMat,
    person,
    16,
  );
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.078, 0.012, 8, 22, Math.PI * 1.55),
    shirtAccentMat,
  );
  collar.position.set(0, 1.105, -0.115);
  collar.rotation.set(Math.PI / 2, 0, 0.72);
  person.add(collar);
  const shirtHem = addRoundedBox(
    0.25,
    0.018,
    0.245,
    0.008,
    shirtAccentMat,
    0,
    0.635,
    -0.055,
    person,
  );
  shirtHem.rotation.x = -0.12;
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.05, 0.08, 16),
    skinMat,
  );
  neck.position.set(0, 1.13, -0.08);
  person.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 18), skinMat);
  head.position.set(0, 1.27, -0.11);
  head.scale.set(0.94, 1.08, 0.92);
  head.rotation.x = -0.08;
  head.castShadow = true;
  person.add(head);
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.138, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.62),
    hairMat,
  );
  hair.position.set(0, 1.31, -0.115);
  hair.scale.set(0.98, 1.02, 0.95);
  hair.rotation.x = -0.1;
  hair.castShadow = true;
  person.add(hair);
  [-1, 1].forEach((side) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 8), skinMat);
    ear.scale.set(0.42, 0.9, 0.55);
    ear.position.set(side * 0.126, 1.265, -0.105);
    person.add(ear);
    const sideHair = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 12, 8),
      hairMat,
    );
    sideHair.scale.set(0.5, 1, 0.62);
    sideHair.position.set(side * 0.112, 1.31, -0.105);
    person.add(sideHair);
  });

  capsuleBetween(
    [-0.18, 1.02, -0.1],
    [-0.28, 0.9, -0.61],
    0.042,
    shirtMat,
    person,
    14,
  );
  capsuleBetween(
    [0.18, 1.02, -0.1],
    [0.4, 0.91, -0.45],
    0.042,
    shirtMat,
    person,
    14,
  );
  capsuleBetween(
    [-0.28, 0.9, -0.61],
    [-0.1, 0.905, -0.74],
    0.029,
    skinMat,
    person,
    12,
  );
  const leftHand = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 14, 10),
    skinMat,
  );
  leftHand.scale.set(1.2, 0.24, 0.72);
  leftHand.position.set(-0.1, 0.91, -0.74);
  leftHand.rotation.set(0.04, -0.25, 0.1);
  person.add(leftHand);
  capsuleBetween(
    [0.4, 0.91, -0.45],
    [0.58, 0.905, -0.76],
    0.029,
    skinMat,
    person,
    12,
  );
  const rightHand = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 14, 10),
    skinMat,
  );
  rightHand.scale.set(1.2, 0.34, 0.82);
  rightHand.position.set(0.59, 0.905, -0.76);
  rightHand.rotation.set(0.1, 0.22, -0.16);
  person.add(rightHand);
  capsuleBetween(
    [-0.11, 0.52, -0.02],
    [-0.28, 0.25, -0.43],
    0.052,
    trouserMat,
    person,
    14,
  );
  capsuleBetween(
    [0.11, 0.52, -0.02],
    [0.28, 0.25, -0.43],
    0.052,
    trouserMat,
    person,
    14,
  );
  addRoundedBox(0.19, 0.06, 0.1, 0.025, shoeMat, -0.32, 0.16, -0.52, person);
  addRoundedBox(0.19, 0.06, 0.1, 0.025, shoeMat, 0.32, 0.16, -0.52, person);
  person.position.set(0.05, 0, -0.48);
  person.rotation.y = 0.02;
  setShadow(person, true, false);
  scene.add(person);

  /* ============================ INTERACTABLES ============================ */
  const interactables = [];
  function register(obj3d, config) {
    obj3d.userData.interactive = true;
    obj3d.userData.config = config;
    obj3d.traverse((o) => {
      if (o.isMesh) {
        o.userData.root = obj3d;
        o.userData.interactive = true;
        o.userData.config = config;
      }
    });
    interactables.push(obj3d);
    return obj3d;
  }

  register(monitorA.group, {
    id: "about",
    label: "About Me",
    hotspot: new THREE.Vector3(0, 0.35, 0.04),
  });
  register(monitorB.group, {
    id: "publications",
    label: "Featured Publications",
    hotspot: new THREE.Vector3(0, 0.35, 0.04),
  });
  register(person, {
    id: "about",
    label: "Yinghao at Desk",
    hotspot: new THREE.Vector3(0, 1.32, -0.12),
  });
  register(SHELF, {
    id: "books",
    label: "Full Publications",
    hotspot: new THREE.Vector3(0, 1.55, -0.2),
  });
  register(trophyGroup, {
    id: "awards",
    label: "Awards & Honors",
    hotspot: new THREE.Vector3(0, 0.2, 0),
  });
  register(frameGroup, {
    id: "education",
    label: "Education",
    hotspot: new THREE.Vector3(0, 0, 0.03),
  });
  register(frame2, {
    id: "education",
    label: "Experience",
    hotspot: new THREE.Vector3(0, 0, 0.03),
  });
  register(sticky, {
    id: "links",
    label: "Quick Links",
    hotspot: new THREE.Vector3(0, 0.01, 0.01),
  });
  register(speedcubePair, {
    id: "rubiks",
    label: "3x3 & 2x2 Cubes",
    hotspot: new THREE.Vector3(0, 0.16, 0),
  });

  /* ============================ HOTSPOT MARKERS ============================ */
  const hotspotsEl = document.getElementById("hotspots");
  const hotspotMarkers = interactables.map((it) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "ping";
    el.setAttribute("aria-label", `Open ${it.userData.config.label}`);
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = it.userData.config.label;
    el.appendChild(label);
    el.addEventListener("click", () => openPanel(it.userData.config));
    hotspotsEl.appendChild(el);
    return { obj: it, el, offset: it.userData.config.hotspot };
  });

  /* ============================ RAYCASTING ============================ */
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered = null;
  const hoveredOriginalEmissive = new Map();

  function setHover(obj) {
    if (hovered === obj) return;
    if (hovered) {
      hovered.traverse((o) => {
        if (o.isMesh && o.material && hoveredOriginalEmissive.has(o)) {
          o.material.emissiveIntensity = hoveredOriginalEmissive.get(o);
        }
      });
      hoveredOriginalEmissive.clear();
      const s = hovered.userData.scaleBase || 1;
      hovered.scale.set(s, s, s);
    }
    hovered = obj;
    canvas.classList.toggle("pointer", !!obj);
    if (obj) {
      obj.userData.scaleBase = obj.scale.x;
      obj.traverse((o) => {
        if (
          o.isMesh &&
          o.material &&
          o.material.emissiveIntensity !== undefined
        ) {
          hoveredOriginalEmissive.set(o, o.material.emissiveIntensity);
          o.material.emissiveIntensity = Math.min(
            2,
            (o.material.emissiveIntensity || 0) + 0.6,
          );
        }
      });
    }
  }

  function intersect(e) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const meshes = [];
    interactables.forEach((it) =>
      it.traverse((o) => {
        if (o.isMesh) meshes.push(o);
      }),
    );
    const hits = raycaster.intersectObjects(meshes, false);
    return hits.length ? hits[0].object.userData.root : null;
  }

  let dragMoved = false;
  let downXY = null;
  canvas.addEventListener("pointerdown", (e) => {
    downXY = [e.clientX, e.clientY];
    dragMoved = false;
  });
  canvas.addEventListener("pointermove", (e) => {
    if (downXY) {
      if (Math.hypot(e.clientX - downXY[0], e.clientY - downXY[1]) > 6)
        dragMoved = true;
    }
    setHover(intersect(e));
  });
  canvas.addEventListener("pointerup", (e) => {
    const wasDrag = dragMoved;
    downXY = null;
    dragMoved = false;
    if (wasDrag) return;
    const obj = intersect(e);
    if (obj) openPanel(obj.userData.config);
  });
  canvas.addEventListener("pointerleave", () => setHover(null));

  /* ============================ DETAIL PANEL ============================ */
  const overlay = document.getElementById("panel-overlay");
  const panelTitle = document.getElementById("panel-title");
  const panelKicker = document.getElementById("panel-kicker");
  const panelIc = document.getElementById("panel-ic");
  const panelBody = document.getElementById("panel-body");
  document.getElementById("panel-close").addEventListener("click", closePanel);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePanel();
  });
  const handleKeydown = (e) => {
    if (e.key === "Escape") closePanel();
  };
  document.addEventListener("keydown", handleKeydown);

  const ICONS = {
    about:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    publications:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    books:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    awards:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
    education:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
    links:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    rubiks:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.29 7 12 12l8.71-5"/><path d="M12 22V12"/><path d="m7.5 9.5 9-5.1"/><path d="m7.5 14.5 9 5.1"/></svg>',
  };

  function fmtAuthors(s) {
    return s
      .split(",")
      .map((a) => {
        const t = a.trim();
        return t === "Yinghao Zhu" ? '<span class="me">Yinghao Zhu</span>' : t;
      })
      .join(", ");
  }

  function renderPanel(id) {
    panelIc.innerHTML = ICONS[id] || "";
    if (id === "about") {
      panelKicker.textContent = "About Me";
      panelTitle.textContent = "Yinghao Zhu";
      return `<div class="about-grid">
            <img src="${DATA.photo}" alt="Yinghao Zhu">
            <div>
                <div class="about-name">Yinghao Zhu <span style="color:var(--ink-soft);font-weight:500;">朱英豪</span></div>
                <div class="about-cn">PhD Student · Researcher</div>
                <div class="about-role">${DATA.title} · AI for Healthcare</div>
                <div class="about-aff">${DATA.affiliation}</div>
                <div class="about-aff">${DATA.school}</div>
            </div>
            <p class="about-bio">${DATA.bio}</p>
            <div class="interest-grid">${DATA.interests.map((i) => `<div class="interest"><h5>${i.title}</h5><p>${i.description || i.desc || ""}</p></div>`).join("")}</div>
        </div>`;
    }
    if (id === "publications" || id === "books") {
      panelKicker.textContent =
        id === "books" ? "Full Publications" : "Featured Publications";
      panelTitle.textContent =
        id === "books" ? "Publication Library" : "Selected Works";
      const publicationItems =
        id === "books" ? DATA.allPublications : DATA.featuredPublications;
      return publicationItems
        .map(
          (p) => `<div class="pub">
            <h4>${p.title}</h4>
            <div class="authors">${fmtAuthors(p.authors)}</div>
            <div class="venue">${formatVenueYear(p.venue, p.year)}</div>
            <div class="links">${p.links.map((l) => `<a href="${l.url}" target="_blank" rel="noopener">${l.type}</a>`).join("")}</div>
        </div>`,
        )
        .join("");
    }
    if (id === "awards") {
      panelKicker.textContent = "Awards & Honors";
      panelTitle.textContent = "Recognition";
      return DATA.awards
        .map(
          (a) =>
            `<div class="award"><div class="yr">${a.year}</div><div class="body"><h4>${a.title}</h4><p>${a.organization || a.org || ""}</p></div></div>`,
        )
        .join("");
    }
    if (id === "education") {
      panelKicker.textContent = "Education & Experience";
      panelTitle.textContent = "Academic Journey";
      const edu = DATA.education
        .map(
          (e) =>
            `<div class="tl-item"><div class="tl-when">${e.period || e.when || ""}</div><h4>${e.institution || e.organization || ""}</h4><div class="tl-sub">${e.degree || e.position || e.sub || ""}</div><div class="tl-meta">${e.location || e.meta || ""}</div>${e.details || e.det ? `<div class="tl-det">${e.details || e.det}</div>` : ""}</div>`,
        )
        .join("");
      const exp = DATA.experience
        .map(
          (e) =>
            `<div class="tl-item"><div class="tl-when">${e.period || e.when || ""}</div><h4>${e.institution || e.organization || ""}</h4><div class="tl-sub">${e.degree || e.position || e.sub || ""}</div><div class="tl-meta">${e.location || e.meta || ""}</div>${e.details || e.det ? `<div class="tl-det">${e.details || e.det}</div>` : ""}</div>`,
        )
        .join("");
      return `<h3 style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:12px;">Education</h3><div class="timeline" style="margin-bottom:26px;">${edu}</div><h3 style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:12px;">Professional Experience</h3><div class="timeline">${exp}</div>`;
    }
    if (id === "links") {
      panelKicker.textContent = "Quick Links";
      panelTitle.textContent = "Find Me Online";
      return `<div class="links-grid">${DATA.links.map((l) => `<a class="lk" href="${l.url}" target="_blank" rel="noopener">${LINK_ICONS[l.name] || ""}<span class="nm">${l.name}</span></a>`).join("")}</div>
        <div class="contact-row">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
            <a href="mailto:${DATA.email}">${DATA.email}</a>
        </div>`;
    }
    if (id === "rubiks") {
      const wca = DATA.links.find((l) => l.name === "WCA");
      panelKicker.textContent = "Desk Object";
      panelTitle.textContent = "Speedcubing Cubes";
      return `<p class="about-bio" style="margin-top:0;">Yinghao can solve the 3x3 cube in 6 seconds and the 2x2 cube in 1 second. His World Cube Association (WCA) profile records his official speedcubing results.</p>
        ${wca ? `<div class="links-grid" style="margin-top:12px;"><a class="lk" href="${wca.url}" target="_blank" rel="noopener">${LINK_ICONS[wca.name] || ""}<span class="nm">World Cube Association (WCA) Profile</span></a></div>` : ""}`;
    }
    return "";
  }

  function openPanel(config) {
    panelBody.innerHTML = renderPanel(config.id);
    panelTitle.textContent = config.label;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    controls.enabled = false;
    document.getElementById("panel-close")?.focus();
  }
  function closePanel() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    controls.enabled = true;
  }

  /* ============================ THEME SYNC ============================ */
  let themeObserver: MutationObserver | null = null;

  function syncSceneTheme() {
    const nextDarkTheme = document.documentElement.classList.contains("dark");

    if (nextDarkTheme === darkTheme) {
      return;
    }

    darkTheme = nextDarkTheme;
    Object.assign(P, nextDarkTheme ? DARK_PALETTE : LIGHT_PALETTE);

    scene.background = new THREE.Color(P.sceneBg);
    scene.fog = new THREE.Fog(P.sceneBg, 13, 27);
    renderer.toneMappingExposure = nextDarkTheme ? 1.05 : 1.1;
    hemisphereLight.intensity = nextDarkTheme ? 0.62 : 1.48;
    sun.intensity = nextDarkTheme ? 0.78 : 1.68;
    sun.color = new THREE.Color(nextDarkTheme ? 0x9fb8d0 : 0xfff4d6);
    deskLamp.intensity = nextDarkTheme ? 1.05 : 0.58;
    screenGlow.intensity = nextDarkTheme ? 0.55 : 0.38;
    ceilingGlow.intensity = nextDarkTheme ? 0.62 : 1.38;

    redrawTextures.forEach((redraw) => redraw());
  }

  if ("MutationObserver" in window) {
    themeObserver = new MutationObserver(syncSceneTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  /* ============================ ANIMATION LOOP ============================ */
  let introT = 0;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const introDuration = reduceMotion ? 0.01 : 1.8;
  let introDone = false;
  const clock = new THREE.Clock();
  let cursorPhase = 0;

  let animationFrame = 0;

  function animate() {
    animationFrame = requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const t = clock.elapsedTime;

    if (!introDone) {
      introT += dt;
      const k = Math.min(1, introT / introDuration);
      const e = 1 - Math.pow(1 - k, 3);
      camera.position.lerpVectors(CAM_START, CAM_REST, e);
      controls.enabled = k >= 1;
      if (k >= 1) {
        introDone = true;
        controls.enabled = true;
      }
    }

    cursorPhase += dt;
    if (cursorPhase > 0.53) {
      cursorPhase = 0;
      const ctx = aboutEditor.ctx;
      ctx.fillStyle = Math.floor(t * 1.9) % 2 === 0 ? P.cursorOff : P.cursorOn;
      ctx.fillRect(320, 88 + 22 * 21.6 - 11, 8, 16);
      aboutTex.needsUpdate = true;
    }

    if (hovered && hovered.userData.scaleBase !== undefined) {
      const s =
        hovered.userData.scaleBase * (1 + Math.sin(t * 6) * 0.005 + 0.02);
      hovered.scale.set(s, s, s);
    }

    controls.update();

    updateHotspots();

    renderer.render(scene, camera);
  }

  const _hp = new THREE.Vector3();
  function updateHotspots() {
    hotspotMarkers.forEach((h) => {
      h.obj.updateWorldMatrix(true, false);
      _hp.copy(h.offset).applyMatrix4(h.obj.matrixWorld).project(camera);
      const inFront = _hp.z < 1;
      const onScreen =
        _hp.x > -1.05 && _hp.x < 1.05 && _hp.y > -1.05 && _hp.y < 1.05;
      if (
        inFront &&
        onScreen &&
        introDone &&
        !overlay.classList.contains("open")
      ) {
        const x = (_hp.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-_hp.y * 0.5 + 0.5) * window.innerHeight;
        h.el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        h.el.style.opacity = "";
      } else {
        h.el.style.transform = "translate3d(-9999px,-9999px,0)";
      }
    });
  }

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = window.innerWidth < 640 ? 48 : 42;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener("resize", handleResize);

  animate();

  const loaderTimer = window.setTimeout(
    () => {
      document.getElementById("loader")?.classList.add("hide");
    },
    reduceMotion ? 50 : 650,
  );

  const discoveryTimer = window.setTimeout(() => {
    hotspotMarkers
      .slice(0, 2)
      .forEach(({ el }) => el.classList.add("is-discovering"));
  }, 2100);
  const discoveryEndTimer = window.setTimeout(() => {
    hotspotMarkers.forEach(({ el }) => el.classList.remove("is-discovering"));
  }, 4700);

  return () => {
    window.clearTimeout(loaderTimer);
    window.clearTimeout(discoveryTimer);
    window.clearTimeout(discoveryEndTimer);
    window.cancelAnimationFrame(animationFrame);
    window.removeEventListener("resize", handleResize);
    document.removeEventListener("keydown", handleKeydown);
    themeObserver?.disconnect();
    renderer.dispose();
  };
}
