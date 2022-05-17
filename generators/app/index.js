var fs = require('fs');
var Generator = require('yeoman-generator');
const CONSTANTS = require('../common/constants');

global.mainGeneratorCalled = false;

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    global.mainGeneratorCalled = true;

    this.option('skipVersionCheck');
  }

  async initializing() {
    if (!Object.keys(this.options).includes('skipVersionCheck')) {
      const localHashCmd = this.spawnCommandSync('git', ['rev-parse', 'HEAD'], {
        cwd: __dirname,
        stdio: 'pipe',
      });
      let localHash = localHashCmd.stdout.toString().trim();
      if (localHash == '') {
        // This is not a git repo, see if it is installed via npm i <git repo>
        const packageJson = JSON.parse(fs.readFileSync(__dirname + '/../../package.json'));
        localHash = packageJson._resolved.split('#')[1];
      }

      console.warn(`Generating application using version ${localHash} of generator.`);

      const upstreamHashCmd = this.spawnCommandSync(
        'git',
        ['ls-remote', 'git@github.com:mwraitt/acpmp-microfrontend-generators.git', 'master'],
        {
          cwd: __dirname,
          stdio: 'pipe',
        },
      );
      const upstreamHash = upstreamHashCmd.stdout.toString().split('\t')[0].trim();
      if (localHash != upstreamHash) {
        console.warn(
          `${CONSTANTS.ERROR} ------------------------------------------ ${CONSTANTS.NOCOLOR}`,
        );
        console.warn(
          `${CONSTANTS.ERROR} ACPMP Microfrontend Generator is not up to date! ${CONSTANTS.NOCOLOR}`,
        );
        console.warn(
          `${CONSTANTS.ERROR} ------------------------------------------ ${CONSTANTS.NOCOLOR}`,
        );
        console.warn(
          `${CONSTANTS.ERROR} Run the following command to update: ${CONSTANTS.NOCOLOR}`,
        );
        console.warn(
          `${CONSTANTS.ERROR} npm i -g git+ssh://git@github.com:mwraitt/acpmp-microfrontend-generators.git ${CONSTANTS.NOCOLOR}`,
        );
        console.warn(
          `${CONSTANTS.ERROR} ------------------------------------------ ${CONSTANTS.NOCOLOR}`,
        );
        const confirm = await this.prompt([
          {
            type: 'confirm',
            name: 'continue',
            message: 'Do you want to continue?',
          },
        ]);
        if (!confirm.continue) {
          process.exit();
        }
      }
    }
  }

  async prompting() {
    this.answers = await this.prompt([
      {
        type: 'list',
        name: 'projectType',
        message: 'Select a project type:',
        choices: [
          {
            name: 'react',
          },
          {
            name: 'library (typescript)',
          },
        ],
      },
      {
        type: 'input',
        name: 'projectName',
        message: 'Your project name',
        default: this.appname,
      },
    ]);

    switch (this.answers.projectType) {
      case 'react': {
        this.composeWith(require.resolve('../react'), {
          arguments: [this.answers.projectName],
        });
        this.composeWith(require.resolve('../ci-react'), {
          arguments: [this.answers.projectName],
        });
        break;
      }
      case 'library (typescript)': {
        this.composeWith(require.resolve('../library'), {
          arguments: [this.answers.projectName],
        });
        this.composeWith(require.resolve('../ci-library'), {
          arguments: [this.answers.projectName],
        });
        break;
      }
      default: {
      }
    }
  }
};
