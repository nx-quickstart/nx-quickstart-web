import chalk from 'chalk';

export const logger = {
  error(...args: unknown[]) {
    console.error(chalk.red(...args));
  },
  warn(...args: unknown[]) {
    console.log(chalk.yellow(...args));
  },
  info(...args: unknown[]) {
    console.log(chalk.cyan(...args));
  },
  success(...args: unknown[]) {
    console.log(chalk.green(...args));
  },
  break() {
    console.log('');
  },
};

export const executionTime = (text: string) => {
  const start = Date.now();
  return {
    end() {
      const end = Date.now();
      const time = end - start;
      console.log(`${text}: ${time}ms`);
    },
  };
};
