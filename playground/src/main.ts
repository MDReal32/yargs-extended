import { Program } from "yargs-extended";

const program = Program.createProgram()
  .name("test-cli")
  .description("A cool CLI")
  .version("0.0.0-playground");

program.command("dev", "Run the app").action(() => {
  console.log("Running");
});

await program.parseAsync();
