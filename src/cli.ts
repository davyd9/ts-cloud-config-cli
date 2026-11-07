import { Command } from 'commander';
import { registerValidateCommand } from '@/commands/validate';
// We are importing the json file directly to get the version and description.
// tsconfig.json has `resolveJsonModule: true` to allow this.
import { version, description } from '../package.json';

/**
 * Initializes and configures the main Commander program.
 * @returns {Command} The configured commander instance.
 */
function initializeProgram(): Command {
  const program = new Command();

  program
    .name('ts-cloud-config-cli')
    .version(version)
    .description(description);

  // Register all commands here
  registerValidateCommand(program);
  // Future commands will be registered here, e.g., registerGenerateCommand(program);

  return program;
}

/**
 * Runs the CLI application.
 * It initializes the program and parses the command-line arguments.
 */
export async function run(): Promise<void> {
  const program = initializeProgram();
  await program.parseAsync(process.argv);
}
