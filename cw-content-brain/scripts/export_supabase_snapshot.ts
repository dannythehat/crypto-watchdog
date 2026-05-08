import { createClient } from "@supabase/supabase-js";
import { isDirectRun, readJson, writeJson } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";

interface SupabaseExportConfig {
  enabled: boolean;
  readOnly: boolean;
  writeBackToSupabase: boolean;
  outputDir: string;
  tables: string[];
  limitPerTable: number;
  orderBy: string;
}

interface ExportResult {
  table: string;
  outputPath: string;
  count: number;
  status: "exported" | "failed";
  error?: string;
}

export async function exportSupabaseSnapshot(): Promise<ExportResult[]> {
  const config = await readJson<SupabaseExportConfig>("config/supabase_export.config.json");
  validateConfig(config);

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set in the local shell or .env loader before export.");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const results: ExportResult[] = [];

  for (const table of config.tables) {
    const outputPath = `${config.outputDir}/${table}.json`;
    try {
      const query = supabase
        .from(table)
        .select("*")
        .limit(config.limitPerTable)
        .order(config.orderBy, { ascending: false });

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      const rows = data ?? [];
      await writeJson(outputPath, rows);
      results.push({ table, outputPath, count: rows.length, status: "exported" });
      logger.info("Exported Supabase snapshot table", { table, count: rows.length, outputPath });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown export error";
      results.push({ table, outputPath, count: 0, status: "failed", error: message });
      logger.error("Supabase snapshot export failed", { table, error: message });
    }
  }

  await writeJson("logs/supabase-export-run.json", {
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    readOnly: true,
    writeBackToSupabase: false,
    outputDir: config.outputDir,
    tables: results.map(({ table, outputPath, count, status, error }) => ({ table, outputPath, count, status, error })),
  });

  return results;
}

function validateConfig(config: SupabaseExportConfig): void {
  if (!config.enabled) {
    throw new Error("Supabase export helper is disabled. Set config.enabled to true locally before owner-run export.");
  }
  if (!config.readOnly || config.writeBackToSupabase) {
    throw new Error("Supabase export helper must remain read-only with writeBackToSupabase disabled.");
  }
  if (!Array.isArray(config.tables) || config.tables.length === 0) {
    throw new Error("At least one table must be configured for export.");
  }
  if (!Number.isInteger(config.limitPerTable) || config.limitPerTable < 1) {
    throw new Error("limitPerTable must be a positive integer.");
  }
}

if (isDirectRun(import.meta.url)) {
  await exportSupabaseSnapshot();
}
