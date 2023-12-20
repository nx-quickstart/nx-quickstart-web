import { writeFile, readFile } from 'fs/promises';
import { execa } from 'execa';
import { simpleGit } from 'simple-git';
import { PROJECT_TEMPLATE_CHOISES } from './constants.js';
import { logger } from './utils.js';
import { ShadcnManager } from './shadcn/shadcn.js';
import ora from 'ora';
import { TailwindManager } from './tailwind-setup/tailwind-setup.js';

type Options = {
  projectName: string;
  destinationDir: string;
  database: 'Prisma';
  shadcn: string;
  tailwind: string;
};

export class SetupTemplate {
  private options: Options;
  constructor(options: Options) {
    this.options = options;
  }

  /**
   * Clones the repository from the specified URL to the destination directory.
   * @async
   * @function cloneRepository
   * @throws {Error} If there is an error cloning the repository.
   * @returns {Promise<void>} A promise that resolves when the repository is cloned successfully.
   */
  async cloneRepository(): Promise<void> {
    try {
      const template = PROJECT_TEMPLATE_CHOISES[this.options.database];
      const repositoryURL = `https://github.com/nx-quickstart/${template}.git`;
      await simpleGit().clone(
        repositoryURL,
        `${this.options.destinationDir}/${this.options.projectName}`,
      );

      await simpleGit().cwd(
        `${this.options.destinationDir}/${this.options.projectName}`,
      );
      await simpleGit()
        .cwd(`${this.options.destinationDir}/${this.options.projectName}`)
        .removeRemote('origin');
    } catch (err) {
      logger.error('Error while cloning repository:', err);
    }
  }

  /**
   * Installs the project dependencies using npm.
   * @returns {Promise<void>} A promise that resolves when the dependencies are installed successfully.
   */
  async installDependencies(): Promise<void> {
    try {
      await execa('npm', ['install'], {
        cwd: `${this.options.destinationDir}/${this.options.projectName}`,
      });
    } catch (error) {
      logger.error('Error installing dependencies:', error);
    }
  }

  /**
   * Updates the package.json file with the project name.
   * @returns {Promise<void>} A promise that resolves when the package.json file is updated.
   */
  async updatePackageJson(): Promise<void> {
    const packageJsonPath = `${this.options.destinationDir}/${this.options.projectName}/package.json`;
    try {
      const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);
      packageJson.name = this.options.projectName;
      await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    } catch (error) {
      logger.error('Error setting up project:', error);
    }
  }

  /**
   * Performs the setup process.
   * @returns {Promise<void>} A promise that resolves when the setup is complete.
   */
  async startSetup(): Promise<void> {
    try {
      const spinner = ora('Setting up project...').start();
      await this.cloneRepository();
      await this.installDependencies();
      await this.updatePackageJson();
      if (this.options.shadcn === 'y') {
        const shadcnManager = new ShadcnManager(
          this.options.destinationDir,
          this.options.projectName,
        );
        await shadcnManager.main();
      }

      if (this.options.shadcn === 'n' && this.options.tailwind === 'y') {
        const tailwindManager = new TailwindManager(
          this.options.destinationDir,
          this.options.projectName,
        );
        await tailwindManager.setupTailwind();
      }

      spinner.succeed('Project setup complete!');
    } catch (error) {
      logger.error('Error while setting up project:', error);
    }
  }
}
