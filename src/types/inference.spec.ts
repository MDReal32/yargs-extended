import { describe, expectTypeOf, it } from "vitest";

import { Command } from "../core";
import type { inferCommandType } from "./infer-command-type";

describe("type inference", () => {
  it("should infer option value types", () => {
    const command = new Command("deploy")
      .option("--env <dev|prod>")
      .option("--port <number>")
      .option("--dry-run")
      .option("--include <string...>");

    type Args = inferCommandType<typeof command>;

    expectTypeOf<Args>().toMatchTypeOf<{
      env: "dev" | "prod";
      port: number;
      dryRun: boolean;
      include: string[];
    }>();
  });

  it("should infer short aliases", () => {
    const command = new Command("serve").option("--verbose, -v");

    type Args = inferCommandType<typeof command>;

    expectTypeOf<Args>().toMatchTypeOf<{
      verbose: boolean;
      v: boolean;
    }>();
  });

  it("should infer optional option tokens", () => {
    const command = new Command("serve").option("--host [string]");

    type Args = inferCommandType<typeof command>;

    expectTypeOf<Args>().toMatchTypeOf<{
      host: string | undefined;
    }>();
  });

  it("should infer positional arguments", () => {
    const command = new Command("copy")
      .positional("<source: path>")
      .positional("[target: path]")
      .positional("...files: string[]");

    type Args = inferCommandType<typeof command>;

    expectTypeOf<Args>().toMatchTypeOf<{
      source: string;
      target?: string;
      files: string[];
    }>();
  });

  it("should infer prefetch results for validate and action", () => {
    new Command("publish")
      .option("--tag <string>")
      .prefetch(async (args) => {
        expectTypeOf(args).toMatchTypeOf<{ tag: string }>();
        return { releaseId: "rel-1" };
      })
      .validate((args, result) => {
        expectTypeOf(args).toMatchTypeOf<{ tag: string }>();
        expectTypeOf(result).toMatchTypeOf<{ releaseId: string }>();
      })
      .action(async (args, result) => {
        expectTypeOf(args).toMatchTypeOf<{ tag: string }>();
        expectTypeOf(result).toMatchTypeOf<{ releaseId: string }>();
      });
  });
});
