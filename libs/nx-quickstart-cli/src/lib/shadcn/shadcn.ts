import { readFile, writeFile } from 'fs/promises';
import {
  SHADCN_CONFIGURATION,
  SHADCN_DEPENDENCIES,
  TAILWIND_CONFIG,
  TAILWIND_GLOBAL_CSS_CONFIGURATION,
  TW_MERGE_UTILS,
} from '../constants.js';
import { logger } from '../utils.js';
import { execa } from 'execa';
import chalk from 'chalk';
import { TailwindManager } from '../tailwind-setup/tailwind-setup.js';
import ora from 'ora';
export class ShadcnManager {
  private highlight = (text: string) => chalk.cyan(text);
  constructor(
    private destinationUrl: string,
    private projectName: string,
  ) {
    this.destinationUrl = destinationUrl;
    this.projectName = projectName;
  }

  /**
   * Adds a components.json file to the specified destination.
   * @returns {Promise<void>} A promise that resolves when the file is successfully created.
   */
  async addComponentsJson(): Promise<void> {
    try {
      await writeFile(
        `${this.destinationUrl}/${this.projectName}/components.json`,
        JSON.stringify(SHADCN_CONFIGURATION, null, 2),
      );
    } catch (error) {
      logger.error('Error while creating components.json', error);
    }
  }

  async addShadcnDependencies(): Promise<void> {
    try {
      await execa('pnpm', ['install', ...SHADCN_DEPENDENCIES], {
        cwd: `${this.destinationUrl}/${this.projectName}`,
      });
    } catch (error) {
      logger.error('Error while adding shadcn dependencies', error);
    }
  }

  /**
   * Creates a UI library using the Nx Next.js library generator.
   * @returns {Promise<void>} A promise that resolves when the UI library is created successfully.
   */
  async createUiLibrary(): Promise<void> {
    try {
      await execa(
        'pnpm dlx',
        [
          'nx',
          'g',
          '@nx/next:library',
          'ui',
          '--directory=/libs/frontend',
          '--style=none',
          '--linter=eslint',
          '--component=false',
          '--tags=scope:client',
        ],
        {
          cwd: `${this.destinationUrl}/${this.projectName}`,
        },
      );
    } catch (error) {
      logger.error(
        `Error while creating ${this.highlight('ui library')}`,
        error,
      );
    }
  }

  /**
   * Updates the Tailwind configuration file.
   * @returns {Promise<void>} A promise that resolves when the Tailwind configuration file is updated successfully, or rejects with an error if there was an issue.
   */
  async updateTailwindConfig(): Promise<void> {
    try {
      await writeFile(
        `${this.destinationUrl}/${this.projectName}/apps/frontend/tailwind.config.js`,
        TAILWIND_CONFIG,
      );
    } catch (error) {
      logger.error(
        `Error updating ${this.highlight('tailwind.config.js')}`,
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
        TAILWIND_GLOBAL_CSS_CONFIGURATION,
      );
    } catch (error) {
      logger.error(`Error updating ${this.highlight('global.css')}`, error);
    }
  }

  /**
   * Adds the necessary utilities for twMerge to the project.
   * This function installs the required dependencies and adds the utility files to the project.
   * @returns {Promise<void>} A promise that resolves when the utilities are added successfully, or rejects with an error if there was a failure.
   */
  async addTwMergeUtil(): Promise<void> {
    try {
      await writeFile(
        `${this.destinationUrl}/${this.projectName}/libs/frontend/ui/src/lib/utils.ts`,
        TW_MERGE_UTILS,
      );

      await writeFile(
        `${this.destinationUrl}/${this.projectName}/libs/frontend/ui/src/index.ts`,
        `export * from './lib/utils';`,
      );
    } catch (error) {
      logger.error('Failed to add shadcn necessary utils', error);
    }
  }

  /**
   * Updates the package.json file by adding a script for adding a component using shadcn-ui.
   * @returns {Promise<void>} A promise that resolves when the package.json file is successfully updated.
   */
  async updatePackageJsonScript(): Promise<void> {
    const packageJsonPath = `${this.destinationUrl}/${this.projectName}/package.json`;
    try {
      const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);
      packageJson.scripts['add-component'] = 'npx shadcn-ui@latest add';
      await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    } catch (error) {
      logger.error(
        'Error adding shadcn add command to package.json stripts',
        error,
      );
    }
  }

  /**
   * The main function that sets up shadcn.
   * It performs the following steps:
   * 1. Sets up Tailwind CSS.
   * 2. Adds components JSON.
   * 3. Creates the UI library.
   * 4. Adds the TW merge utility.
   * 5. Updates the package.json script.
   *
   * @returns {Promise<void>} A promise that resolves when the setup is complete.
   */
  async main(): Promise<void> {
    try {
      const spinner = ora('Setting up shadcn...').start();
      const tailwindManager = new TailwindManager(
        this.destinationUrl,
        this.projectName,
      );
      await tailwindManager.setupTailwind();
      await this.addComponentsJson();
      await this.createUiLibrary();
      await this.addShadcnDependencies();
      await this.updateTailwindConfig();
      await this.updateGlobalCss();
      await this.addTwMergeUtil();
      await this.updatePackageJsonScript();
      spinner.succeed('Shadcn setup complete!');
    } catch (error) {
      logger.error('Error while setting up shadcn', error);
    }
  }
}
