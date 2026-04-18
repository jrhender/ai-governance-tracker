import { readFile } from "node:fs/promises";
import { relative } from "node:path";
import fg from "fast-glob";
import { parse as parseYaml } from "yaml";
import type { Loader } from "astro/loaders";

export function yamlGlob({
  pattern,
  base,
}: {
  pattern: string;
  base: string;
}): Loader {
  return {
    name: "yaml-glob",
    load: async ({ store, parseData, logger, watcher }) => {
      store.clear();
      const files = await fg(pattern, { cwd: base, absolute: true });

      for (const file of files) {
        const raw = await readFile(file, "utf8");
        const parsed = parseYaml(raw);
        if (!parsed || typeof parsed !== "object") {
          logger.warn(`Skipping ${file}: not an object`);
          continue;
        }
        const id = (parsed as { id?: string }).id;
        if (!id) {
          logger.warn(`Skipping ${file}: missing 'id' field`);
          continue;
        }
        const data = await parseData({ id, data: parsed });
        store.set({ id, data, filePath: relative(process.cwd(), file) });
      }

      if (watcher) {
        watcher.add(base);
      }
    },
  };
}
