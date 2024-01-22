import { execa } from 'execa';
import { logger } from '../utils.js';
import chalk from 'chalk';
import { writeFile } from 'fs/promises';
import ora from 'ora';

export class TailwindManager {
  private highlight = (text: string) => chalk.cyan(text);
  constructor(
    private destinationUrl: string,
    private projectName: string,
  ) {
    this.destinationUrl = destinationUrl;
    this.projectName = projectName;
  }
  /**
   * Adds Tailwind CSS to the project.
   * @returns {Promise<void>} A promise that resolves when the Tailwind CSS setup is complete.
   */
  async addTailwindCss(): Promise<void> {
    try {
      await execa(
        'pnpm dlx',
        ['nx', 'g', 'setup-tailwind', '--project=frontend'],
        {
          cwd: `${this.destinationUrl}/${this.projectName}`,
        },
      );
    } catch (error) {
      logger.error(
        `Error while initializing ${this.highlight('tailwindcss')}}`,
        error,
      );
    }
  }

  /**
   * Updates the global CSS file with the Tailwind CSS configuration.
   * @returns {Promise<void>} A promise that resolves when the global CSS file is updated successfully, or rejects with an error if there was an issue.
   */
  async updateGlobalCss(): Promise<void> {
    try {
      await writeFile(
        `${this.destinationUrl}/${this.projectName}/apps/frontend/app/global.css`,
        `
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
        `,
      );
    } catch (error) {
      logger.error(`Error updating ${this.highlight('global.css')}`, error);
    }
  }

  /**
   * Sets up tailwindcss by performing the following steps:
   * 1. Adds tailwindcss to the project.
   * 2. Updates the tailwind configuration.
   * 3. Updates the global CSS.
   *
   * @returns {Promise<void>} A promise that resolves when the tailwindcss setup is complete.
   * @throws {Error} If an error occurs during the setup process.
   */
  async setupTailwind(): Promise<void> {
    try {
      const spinner = ora('Setting up tailwindcss...').start();
      await this.addTailwindCss();
      await this.updateGlobalCss();
      spinner.succeed('tailwindcss setup complete!');
    } catch (error) {
      logger.error(
        `Error while setting up ${this.highlight('tailwindcss')}`,
        error,
      );
    }
  }
}
