// dependency-cruiser.config.cjs
//
// Enforces VSA layer rules (vertical-slice-architecture skill). Run with:
//   bunx depcruise --config dependency-cruiser.config.cjs --output-type err src
//   npx depcruise --config dependency-cruiser.config.cjs --output-type err src
//
// Must remain CommonJS — dependency-cruiser loads configs via Node.
// Adjust path constants below if your folder names differ.

const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "src");
const FEATURES_DIR = path.join(SRC, "features");

const features = fs.existsSync(FEATURES_DIR)
  ? fs
      .readdirSync(FEATURES_DIR)
      .filter(f => fs.statSync(path.join(FEATURES_DIR, f)).isDirectory())
  : [];

/** Bun built-ins — extend via `depcruise --init` if your Bun version adds more */
const BUN_BUILTINS = [
  "bun",
  "bun:ffi",
  "bun:jsc",
  "bun:main",
  "bun:sqlite",
  "bun:test",
  "bun:wrap",
];

/** Composition-root files allowed to import features (and wire integrations). */
const COMPOSITION_ROOT = [
  "^src/app\\.ts$",
  "^src/index\\.ts$",
  "^src/lib/(startup|cron)\\.ts$",
];

module.exports = {
  forbidden: [
    // Rule 1: a feature never imports another feature.
    ...features.map(feature => ({
      comment: `features/${feature} may not import another feature (VSA rule 1).`,
      from: { path: `^src/features/${feature}/` },
      name: `isolate-feature-${feature}`,
      severity: "error",
      to: {
        path: "^src/features/",
        pathNot: [`^src/features/${feature}/`],
      },
    })),

    // Rule 2: only a feature's own index.ts is importable from outside it.
    {
      comment: "Import a feature via its index.ts only (VSA rule 2).",
      from: { pathNot: "^src/features/" },
      name: "features-public-api-only",
      severity: "error",
      to: {
        path: "^src/features/[^/]+/.+",
        pathNot: "^src/features/[^/]+/index\\.ts$",
      },
    },

    // Rule 4: contracts/ is types-only. It may reference contracts/ and
    // dependency-free primitives/ only.
    {
      comment:
        "contracts/ may only import contracts/ or primitives/ (VSA rule 4).",
      from: { path: "^src/contracts/" },
      name: "contracts-is-leaf",
      severity: "error",
      to: {
        path: "^src/",
        pathNot: ["^src/contracts/", "^src/primitives/"],
      },
    },
    {
      comment:
        "primitives/ must not import other application layers (VSA rule 4).",
      from: { path: "^src/primitives/" },
      name: "primitives-is-leaf",
      severity: "error",
      to: {
        path: "^src/",
        pathNot: "^src/primitives/",
      },
    },

    // Rule 5: integrations/ never imports features/ or orchestration/.
    {
      comment: "integrations/ must not import features/ (VSA rule 5).",
      from: { path: "^src/integrations/" },
      name: "integrations-cannot-import-features",
      severity: "error",
      to: { path: "^src/features/" },
    },
    {
      comment: "integrations/ must not import orchestration/ (VSA rule 5).",
      from: { path: "^src/integrations/" },
      name: "integrations-cannot-import-orchestration",
      severity: "error",
      to: { path: "^src/orchestration/" },
    },

    // Rule 6: orchestration sits above features; it must not bypass them
    // by calling integrations/ directly. Features must not import orchestration.
    {
      comment: "features/ must not import orchestration/ (VSA rule 6).",
      from: { path: "^src/features/" },
      name: "features-cannot-import-orchestration",
      severity: "error",
      to: { path: "^src/orchestration/" },
    },
    {
      comment:
        "orchestration/ must use feature public APIs, not integrations/ (VSA rule 6).",
      from: { path: "^src/orchestration/" },
      name: "orchestration-cannot-import-integrations",
      severity: "error",
      to: { path: "^src/integrations/" },
    },

    // Only composition root + orchestration may import features. Prevents
    // "multi-feature" coupling from sneaking into lib/, db/, plugins/, etc.
    {
      comment:
        "Only composition root and orchestration/ may import features/ (VSA rule 6).",
      from: {
        path: "^src/",
        pathNot: ["^src/features/", "^src/orchestration/", ...COMPOSITION_ROOT],
      },
      name: "only-composition-and-orchestration-import-features",
      severity: "error",
      to: { path: "^src/features/" },
    },

    // Rule 7: lib/, db/, plugins/ never import upward — except composition-root
    // entrypoints that intentionally live under lib/ (startup, cron).
    {
      comment:
        "lib/, db/, plugins/ must not import features/, orchestration/, or integrations/ (VSA rule 7).",
      from: {
        path: "^src/(lib|db|plugins)/",
        pathNot: "^src/lib/(startup|cron)\\.ts$",
      },
      name: "infra-is-leaf",
      severity: "error",
      to: { path: "^src/(features|orchestration|integrations)/" },
    },
  ],

  options: {
    doNotFollow: { path: "node_modules" },
    builtInModules: { add: BUN_BUILTINS },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
  },
};
