var fs = require('fs');
var Generator = require('yeoman-generator');
const cheerio = require('cheerio');
var fsc = require('fs-cheerio');
var AppGenerator = require('../app');
var capitalize = require('capitalize');
var mkdirp = require('mkdirp');
const PROMPTS = require('../common/prompts');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.argument('projectName', { type: String, required: true });
    this.option(PROMPTS.ROUTER);
    this.option(PROMPTS.GRAPHQL);
  }

  _getPackageJson() {
    const packageJsonContent = fs.readFileSync(this.destinationPath('package.json'));
    return JSON.parse(packageJsonContent);
  }

  _writePackageJson(contents) {
    fs.writeFileSync(this.destinationPath('package.json'), JSON.stringify(contents, null, 2));
  }

  async _componentQuestions() {
    const typescript_modules = [];
    [PROMPTS.ROUTER, PROMPTS.GRAPHQL].forEach((value) => {
      if (this.options[value]) {
        typescript_modules.push(value);
      }
    });

    this.componentsPrompts =
      typescript_modules.length > 0
        ? { typescript_modules }
        : await this.prompt([
            {
              type: 'checkbox',
              name: 'typescript_modules',
              message: 'Please select the components that you want:',
              choices: [
                {
                  name: 'React router',
                  value: PROMPTS.ROUTER,
                },
                {
                  name: 'GraphQL Client (apollo)',
                  value: PROMPTS.GRAPHQL,
                },
              ],
            },
          ]);
  }

  _set_npm_rc() {
    this.fs.copy(this.templatePath('_npmrc'), this.destinationPath('.npmrc'));
  }

  async _add_basic_dependencies() {
    await this.spawnCommandSync('yarn', [
      'add',
      'styled-components',
      '@material-ui/core',
      '@dls/react-theme',
      '@dls/react-core',
      '@dls/react-fonts',
      'i18next',
    ]);

    await this.spawnCommandSync('yarn', [
      'add',
      '--dev',
      'craco',
      'prettier',
      'husky',
      'pretty-quick',
      'typescript',
      'http-proxy-middleware',
      'react-scripts',
      '@types/styled-components',
    ]);
  }

  async _add_router_dependencies() {
    await this.spawnCommandSync('yarn', ['add', 'react-router-dom']);
    await this.spawnCommandSync('yarn', ['add', '--dev', '@types/react-router-dom']);
  }

  async _add_rest_dependencies() {
    await this.spawnCommandSync('yarn', ['add', 'axios']);
  }

  async _add_graphql_dependencies() {
    await this.spawnCommandSync('yarn', [
      'add',
      '@apollo/client',
      'subscriptions-transport-ws',
      'graphql',
    ]);
    await this.spawnCommandSync('yarn', [
      'add',
      '--dev',
      '@graphql-codegen/cli',
      '@graphql-codegen/typescript',
      '@graphql-codegen/typescript-operations',
      '@graphql-codegen/typescript-react-apollo',
    ]);
  }

  _generate_app_tsx() {
    const options = {
      options: {
        router: this.componentsPrompts.typescript_modules.includes(PROMPTS.ROUTER),
        dls: this.componentsPrompts.typescript_modules.includes(PROMPTS.DLS),
        graphql: this.componentsPrompts.typescript_modules.includes(PROMPTS.GRAPHQL),
        projectName: this.options.projectName,
      },
    };

    this.fs.copyTpl(this.templatePath('App.tsx'), this.destinationPath('src/App.tsx'), options);
    this.fs.copy(this.templatePath('App.test.tsx'), this.destinationPath('src/App.test.tsx'));
  }

  _add_configs() {
    this.fs.copy(this.templatePath('_editorconfig'), this.destinationPath('.editorconfig'));
    this.fs.copy(this.templatePath('_prettierrc'), this.destinationPath('.prettierrc'));
  }

  _add_package_json_props() {
    const packageJson = this._getPackageJson();

    this._writePackageJson({
      ...packageJson,
      license: 'SEE LICENSE IN LICENSE',
      private: true,
    });
  }

  _add_linting_to_package_json() {
    const packageJson = this._getPackageJson();

    this._writePackageJson({
      ...packageJson,
      scripts: {
        ...packageJson.scripts,
        lint: 'eslint ./src --ext .ts,.tsx',
      },
    });
  }

  _add_formatting_to_package_json() {
    const packageJson = this._getPackageJson();

    this._writePackageJson({
      ...packageJson,
      scripts: {
        ...packageJson.scripts,
        format: 'prettier --write src/**/*',
        'format-check': 'prettier --check src/**/*',
      },
    });
  }

  async _add_coverage_rapport_to_package_json() {
    const packageJson = this._getPackageJson();

    this._writePackageJson({
      ...packageJson,
      scripts: {
        ...packageJson.scripts,
        'test:coverage': 'craco test --coverage --watchAll',
      },
    });

    await this.spawnCommandSync('git', ['apply', this.templatePath('istanbul-ignore.patch')]);
  }

  _add_husky_hooks_to_package_json() {
    const packageJson = this._getPackageJson();

    this._writePackageJson({
      ...packageJson,
      husky: {
        hooks: {
          'pre-commit': 'pretty-quick --staged',
        },
      },
    });
  }

  _migrate_to_craco() {
    this._writePackageJson({
      ...packageJson,
      scripts: {
        ...packageJson.scripts,
        start: 'craco start',
        build: 'craco build',
        test: 'craco test',
      },
    });
  }

  async _generate_react_project() {
    const reactArray = ['create', 'react-app', '.', '--template typescript'];
    await this.spawnCommandSync('yarn', ['config', 'get', 'registry']);
    this.spawnCommandSync('yarn', reactArray);
    this._add_configs();
    this._add_package_json_props();
    this._add_linting_to_package_json();
    this._add_formatting_to_package_json();
    await this._add_coverage_rapport_to_package_json();
    await this._add_basic_dependencies();
    this._add_husky_hooks_to_package_json();
    this._migrate_to_craco();
  }

  _setup_graphql_client() {
    mkdirp.sync('src/apollo');
    mkdirp.sync('src/graphql/queries');
    this.fs.copy(
      this.templatePath('apollo/apollo-client.ts'),
      this.destinationPath('src/apollo/apollo-client.ts'),
    );
    this.fs.copy(
      this.templatePath('graphql/queries/dummy.graphql'),
      this.destinationPath('src/graphql/queries/dummy.graphql'),
    );

    this.fs.copy(this.templatePath('codegen.yml'), this.destinationPath('codegen.yml'));

    const packageJson = this._getPackageJson();

    this._writePackageJson({
      ...packageJson,
      scripts: {
        ...packageJson.scripts,
        'build-graphql': 'graphql-codegen --config codegen.yml',
      },
    });
  }

  async _createComplianceFiles() {
    await this.fs.copy(
      this.templatePath('.github/philips-repo.yml'),
      this.destinationPath('.github/philips-repo.yml'),
      { recursive: true },
    );
  }

  async _setProjectNameInPublicFolder() {
    const path = this.destinationPath('public/index.html');
    const result = cheerio.load(fs.readFileSync(path));
    result('title').text(this.options.projectName);
    await fsc.writeFile(this.destinationPath('public/index.html'), result);
  }

  async initializing() {
    if (!global.mainGeneratorCalled) {
      const appGenerator = new AppGenerator();
      await appGenerator.initializing();
    }
  }

  async writing() {
    this._set_npm_rc();
    await this._generate_react_project();
    await this._createComplianceFiles();

    if (this.componentsPrompts.typescript_modules.includes(PROMPTS.ROUTER)) {
      await this._add_router_dependencies();
    }
    if (this.componentsPrompts.typescript_modules.includes(PROMPTS.GRAPHQL)) {
      await this._add_graphql_dependencies();
      this._setup_graphql_client();
    } else {
      await this._add_rest_dependencies();
    }

    this._generate_app_tsx();

    await this._setProjectNameInPublicFolder();

    this.fs.copy(this.templatePath('LICENSE'), this.destinationPath('LICENSE'));
    this.fs.copy(this.templatePath('CHANGELOG.md'), this.destinationPath('CHANGELOG.md'));
    this.fs.copy(this.templatePath('CONTRIBUTING.md'), this.destinationPath('CONTRIBUTING.md'));
    this.fs.copyTpl(this.templatePath('README.tmpl'), this.destinationPath('README.md'), {
      title: capitalize.words(this.appname.replace(/[-_]/g, ' ')),
    });
    this.fs.copy(this.templatePath('index.ts.tmpl'), this.destinationPath('index.ts'));
    this.fs.copy(this.templatePath('index.css.tmpl'), this.destinationPath('index.css'));
  }
};
