# yargs-extended

Typed helpers for building `yargs`-based CLI programs.

`yargs-extended` is a small TypeScript-first wrapper around `yargs`. It keeps the familiar command, option, positional, help, strict parsing, aliases, and nested-command behavior of `yargs`, while adding a compact declaration syntax that TypeScript can read.

The goal is simple: write the CLI shape once, as strings you would already show to users, and get useful handler types back.

## Why This Exists

Most CLI libraries make one side of the tradeoff feel good:

- Runtime CLI behavior is nice, but handler types are broad.
- Type safety is possible, but it asks for extra schemas, duplicated interfaces, or a separate typings package.
- The command declaration is readable to humans, but not rich enough for TypeScript.

This project exists because I wanted the CLI declaration itself to be the type source:

```ts
program
  .command("deploy")
  .option("--env <dev|prod>")
  .option("--port <number>")
  .option("--dry-run")
  .action(async (args) => {
    args.env;
    //   ^? "dev" | "prod"

    args.port;
    //   ^? number

    args.dryRun;
    //   ^? boolean
  });
```

No duplicated `DeployOptions` interface. No parser schema next to the parser string. No "trust me" cast in every handler.

## Install

```bash
yarn add yargs-extended
```

```bash
npm install yargs-extended
```

Requires Node.js 24 or newer.

## Quick Start

```ts
import { Program } from "yargs-extended";

const program = Program.createProgram()
  .name("ship")
  .description("A release helper")
  .version("1.0.0");

program
  .command("deploy", "Deploy an environment")
  .option("--env <dev|prod>", { required: true })
  .option("--port <number>", { default: 3000 })
  .option("--dry-run")
  .action(async (args) => {
    console.log({
      env: args.env,
      port: args.port,
      dryRun: args.dryRun
    });
  });

await program.parseAsync();
```

Run it:

```bash
ship deploy --env prod --dry-run
```

## API Overview

### Program

```ts
const program = Program.createProgram()
  .name("my-cli")
  .description("A useful CLI")
  .version("1.0.0");
```

`Program.createProgram()` wraps `yargs(hideBin(process.argv))` by default. In tests, you can inject args:

```ts
const program = Program.createProgram().overrideExit();

await program.parseAsync(["deploy", "--env", "prod"]);
```

Useful methods:

- `name(name)`
- `description(text)`
- `version(version)`
- `option(spec, config?)`
- `command(name, description?)`
- `parse()`
- `parseAsync(args?)`
- `overrideExit(exitProcess = false)`

### Commands

```ts
program
  .command("workspace", "Manage workspaces")
  .command("add")
  .positional("<name>")
  .option("--private")
  .action(async (args) => {
    args.name;
    //   ^? string

    args.private;
    //   ^? boolean
  });
```

Command methods:

- `command(name)`
- `addAlias(alias)`
- `removeAlias(alias)`
- `description(text)`
- `option(spec, config?)`
- `positional(spec, config?)`
- `prefetch(callback)`
- `validate(callback)`
- `action(callback)`

## Option Syntax

Options must include at least one long flag:

```ts
program.option("--verbose");
program.option("--output <path>");
program.option("--env <dev|prod>");
program.option("--include <string...>");
program.option("--dry-run, -d");
```

Supported value tokens:

| Syntax | Inferred Type | Runtime Behavior |
| --- | --- | --- |
| `--flag` | `boolean` | Boolean flag |
| `--name <string>` | `string` | String value |
| `--host [string]` | `string \| undefined` | Optional string value |
| `--port <number>` | `number` | Number value |
| `--count <count>` | `number` | Number value |
| `--file <path>` | `string` | String value |
| `--env <dev\|prod>` | `"dev" \| "prod"` | Choice validation |
| `--include <string...>` | `string[]` | Variadic array |

Use the config object for runtime requirements and metadata:

```ts
program.option("--env <dev|prod>", {
  description: "Target environment",
  required: true,
  default: "dev"
});
```

Important distinction: `<string>` makes the TypeScript value non-optional, but runtime requiredness is controlled by `{ required: true }`. That keeps type syntax and CLI policy explicit.

## Positional Syntax

```ts
program
  .command("copy")
  .positional("<source: path>")
  .positional("[target: path]")
  .positional("...files: string[]");
```

Supported positional forms:

| Syntax | Inferred Type | Meaning |
| --- | --- | --- |
| `<name>` | `{ name: string }` | Required string |
| `[name]` | `{ name?: string }` | Optional string |
| `name?` | `{ name?: string }` | Optional string |
| `<count: number>` | `{ count: number }` | Required number |
| `<file: path>` | `{ file: string }` | Required path/string |
| `...files: string[]` | `{ files: string[] }` | Variadic string array |

## Prefetch and Validate

`prefetch` lets you load data before the handler. The result is typed into `validate` and `action`.

```ts
program
  .command("publish")
  .option("--tag <string>", { required: true })
  .prefetch(async (args) => {
    return {
      releaseId: `release:${args.tag}`
    };
  })
  .validate((args, release) => {
    if (!release.releaseId) {
      throw new Error(`Missing release for ${args.tag}`);
    }
  })
  .action(async (args, release) => {
    console.log(`Publishing ${release.releaseId} as ${args.tag}`);
  });
```

Execution order:

1. Parse args
2. Run `prefetch`
3. Run `validate`
4. Run `action`

## Type Extraction

Use `inferCommandType` when you want to reuse a command's inferred argument type.

```ts
import { Command, type inferCommandType } from "yargs-extended";

const deploy = new Command("deploy")
  .option("--env <dev|prod>")
  .option("--dry-run");

type DeployArgs = inferCommandType<typeof deploy>;
// {
//   env: "dev" | "prod";
//   dryRun: boolean;
// }
```

## Comparison With Commander

Commander is excellent. Its official README describes it as a library where you describe the command line interface and Commander handles parsing, usage errors, and help output. That is a great fit for many CLIs.

`yargs-extended` is narrower and more opinionated: it is for people who like the `yargs` runtime model and want inferred TypeScript types from compact option strings.

| Area | Commander | yargs-extended |
| --- | --- | --- |
| Runtime foundation | Commander runtime | `yargs` runtime |
| CLI declaration style | Fluent command/options API | Fluent command/options API |
| Help and errors | Built in | Delegated to `yargs` |
| Strong inferred handler types | Available through `@commander-js/extra-typings` | Built into this wrapper |
| Option string as type source | Partial, depending on typings layer | Core design goal |
| Enum string inference | Not the main API focus | `--env <dev\|prod>` infers `"dev" \| "prod"` |
| Prefetch result typing | Userland pattern | Built into command chain |
| Best for | Mature, general-purpose CLIs | Typed `yargs` CLIs with compact declarations |

Why choose Commander:

- You want the established Commander API and ecosystem.
- You prefer Commander semantics over `yargs`.
- You already use `@commander-js/extra-typings` successfully.
- You need a feature Commander supports directly and this wrapper does not.

Why choose yargs-extended:

- You already like or rely on `yargs`.
- You want option strings like `--env <dev|prod>` to produce useful TypeScript types.
- You want aliases, positionals, prefetch, validate, and action to stay in one chain.
- You want fewer duplicated runtime/type declarations.

References:

- [Commander.js README](https://github.com/tj/commander.js/)
- [`@commander-js/extra-typings`](https://github.com/commander-js/extra-typings)
- [`yargs`](https://github.com/yargs/yargs)

## Playground

The repo includes a Vite-powered playground workspace.

```bash
yarn workspace @yargs-extended/playground dev dev
```

Expected output:

```text
Running
```

The playground maps `yargs-extended` to the root source through `playground/tsconfig.json` paths, and Vite consumes those paths with native `resolve.tsconfigPaths` support.

## Development

Install dependencies:

```bash
yarn install
```

Run checks:

```bash
yarn lint
yarn format:check
yarn typecheck
yarn test
yarn test:coverage
yarn build
```

Apply safe formatting/lint fixes:

```bash
yarn fix
```

## Publishing

This repo includes `.github/workflows/publish.yml` for npm publishing through GitHub Actions trusted publishing.

It does not require an npm token in GitHub secrets. Configure the npm package trusted publisher on npm, then publish by pushing a `v*` tag, publishing a GitHub release, or manually dispatching the workflow.

Before the first public publish, make sure `package.json` has the correct `repository` field for the GitHub repository you connect.

## Status

Current test coverage:

- 65 tests
- 92%+ statement coverage
- 85%+ branch coverage

This is still a small library. The API is intentionally compact, and behavior should be expanded with tests before broadening the surface area.
