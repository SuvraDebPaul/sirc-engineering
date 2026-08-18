import { registerHooks } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), "src");

const CANDIDATES = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];

const firstExisting = (base) => {
  for (const suffix of CANDIDATES) {
    const candidate = base + suffix;
    if (existsSync(candidate)) return candidate;
  }
  return null;
};

registerHooks({
  resolve(specifier, context, nextResolve) {
    // `@/` alias, rooted at src/
    if (specifier.startsWith("@/")) {
      const resolved = firstExisting(path.join(SRC, specifier.slice(2)));
      if (!resolved) {
        throw new Error(
          `Alias hook could not resolve "${specifier}" under ${SRC}. ` +
            `Checked: ${CANDIDATES.map((s) => specifier + s).join(", ")}`,
        );
      }
      return nextResolve(pathToFileURL(resolved).href, context);
    }

    // Extensionless relative imports — plain "./x" or "../x" with no
    // extension, resolved against the *importing* file's own directory.
    if (
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      !path.extname(specifier)
    ) {
      const baseDir = path.dirname(fileURLToPath(context.parentURL));
      const resolved = firstExisting(path.join(baseDir, specifier));
      if (resolved) {
        return nextResolve(pathToFileURL(resolved).href, context);
      }
      // Genuinely missing — let Node's own resolver raise its normal error.
    }

    return nextResolve(specifier, context);
  },
});
