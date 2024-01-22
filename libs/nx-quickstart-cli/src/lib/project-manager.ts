#!/usr/bin/env node

import inquirer from 'inquirer';
import { SetupTemplate } from './setup.js';

export class projectManager {
  constructor() {}
  public async setupProject() {
    const options = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Enter the project name:',
        validate: (input: string) => {
          if (input.trim() === '') {
            return 'Please enter a valid project folder name';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'destinationDir',
        message:
          'Enter the directory path where you want to clone the repository:',
        default: process.cwd(),
      },
      {
        type: 'list',
        name: 'template',
        message: 'Choose template: ',
        choices: [
          'Nextjs_Nestjs_Prisma',
          'Nextjs_Nestjs_TypeOrm',
          'Nextjs_Dotnet',
        ],
      },
      {
        type: 'input',
        name: 'shadcn',
        message: "Do you want to install 'shadcn'? (y/n)",
      },
      {
        type: 'input',
        name: 'tailwind',
        message: "Do you want to install 'tailwind'? (y/n)",
        when: (answers: any) => answers.shadcn === 'n',
      },
    ]);

    const setupTemplate = new SetupTemplate(options);
    await setupTemplate.startSetup();
  }
}

const project = new projectManager();
project.setupProject();
