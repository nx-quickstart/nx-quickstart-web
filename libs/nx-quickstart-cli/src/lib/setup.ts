import { writeFile, readFile } from 'fs/promises';
import { execa } from 'execa';
import { simpleGit } from 'simple-git';
import { PROJECT_TEMPLATE_CHOISES } from './constants.js';
import { executionTime, logger } from './utils.js';
import { ShadcnManager } from './shadcn/shadcn.js';
import ora from 'ora';
import { TailwindManager } from './tailwind-setup/tailwind-setup.js';

type Options = {
  projectName: string;
  destinationDir: string;
  template: 'Nextjs_Nestjs_Prisma' | 'Nextjs_Nestjs_TypeOrm' | 'Nextjs_Dotnet';
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
      const spinner = ora('Cloning repository...').start();
      const template = PROJECT_TEMPLATE_CHOISES[this.options.template];
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
      spinner.succeed('Repository cloned successfully!');
    } catch (err) {
      logger.error('Error while cloning repository:', err);
      throw err;
    }
  }

  /**
   * Installs the project dependencies using npm.
   * @returns {Promise<void>} A promise that resolves when the dependencies are installed successfully.
   */
  async installDependencies(): Promise<void> {
    try {
      const spinner = ora('Installing neccessary dependencies...').start();
      await execa('pnpm', ['install'], {
        cwd: `${this.options.destinationDir}/${this.options.projectName}`,
      });
      spinner.succeed('Dependencies installed successfully!');
    } catch (error) {
      logger.error('Error installing dependencies:', error);
      throw error;
    }
  }

  /**
   * Updates the package.json file with the project name.
   * @returns {Promise<void>} A promise that resolves when the package.json file is updated.
   */
  async updatePackageJson(): Promise<void> {
    const packageJsonPath = `${this.options.destinationDir}/${this.options.projectName}/package.json`;
    try {
      const spinner = ora(
        `Changing package.json project name to ${this.options.projectName}...`,
      ).start();
      const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);
      packageJson.name = this.options.projectName;
      await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      spinner.succeed('package.json file updated successfully!');
    } catch (error) {
      logger.error('Error setting up project:', error);
      throw error;
    }
  }

  /**
   * Migrates the dotnet database.
   * @returns A promise that resolves when the migration is complete.
   */
  async migrateDotnetDb(): Promise<void> {
    try {
      const spinner = ora('Creating dotnet database migrations').start();
      await execa('pnpm', ['run', 'db:migrate', 'DbInit'], {
        cwd: `${this.options.destinationDir}/${this.options.projectName}`,
      });
      spinner.succeed('Dotnet database migrations created successfully!');
    } catch (error) {
      logger.error('Error while migrating dotnet db:', error);
    }
  }

  /**
   * Performs the setup process.
   * @returns {Promise<void>} A promise that resolves when the setup is complete.
   */
  async startSetup(): Promise<void> {
    try {
      const time = executionTime('Project setup time');
      await this.cloneRepository();
      await this.installDependencies();
      await this.updatePackageJson();

      const shadcnManager = new ShadcnManager(
        this.options.destinationDir,
        this.options.projectName,
      );

      const tailwindManager = new TailwindManager(
        this.options.destinationDir,
        this.options.projectName,
      );

      if (this.options.template === 'Nextjs_Dotnet') {
        await this.migrateDotnetDb();
      }

      if (this.options.shadcn === 'y') {
        await tailwindManager.setupTailwind();
        await shadcnManager.main();
      }

      if (this.options.shadcn === 'n' && this.options.tailwind === 'y') {
        await tailwindManager.setupTailwind();
      }

      time.end();
    } catch (error) {
      logger.error('Error while setting up project:', error);
    }
  }
}
