const MergeTrees = require('broccoli-merge-trees');
const Funnel = require('broccoli-funnel');
const Project = require('ember-cli/lib/models/project');

const { existsSync, readdirSync } = require('fs');
const { join } = require('path');

let sharedOptions = {
  /*
    Leave jQuery out of this addon's own test suite & dummy app by default,
    so that the addon can be used in apps without jQuery. If you really need
    jQuery, it's safe to remove this line.
  */
  vendorFiles: { 'jquery.js': null, 'app-shims.js': null },
  outputPaths: {
    app: {
      css: {
        app: `/assets/app.css`,
      },
      js: `/assets/app.js`,
    },
  },
  // Add options here
};

function dummyAppTrees(EmberAddon, defaults, options) {
  const dummyDirectory = join(process.cwd(), 'dummy');
  if(existsSync(dummyDirectory)) {
    // multiple dummy apps
    const dummyAppFolders = readdirSync(dummyDirectory);

    const dummyAppTrees = dummyAppFolders.map((name) => {

      let app = new EmberAddon({ project: Project.closestSync(process.cwd()) }, Object.assign({}, sharedOptions, {
        name,
        configPath: `./dummy/${name}/config/environment`,
        trees: {
          app: existsSync(join(process.cwd(), 'dummy', name, 'app')) ? `dummy/${name}/app` : null,
          src: existsSync(join(process.cwd(), 'dummy', name, 'src')) ? `dummy/${name}/src` : null,
          public: `dummy/${name}/public`,
          styles: existsSync(join(process.cwd(), 'dummy', name, 'src')) ? `dummy/${name}/src/ui/styles` : `dummy/${name}/app/styles`,
          templates: `dummy/${name}/app/templates`,
          tests: new Funnel('tests', {
            // exclude: [/^mu/], //TODO: ask @rwjblue why he did this 😖
          }),
          vendor: null,
        },
      }));

      return new Funnel(app.toTree(), { destDir: name});
    });

    return MergeTrees(dummyAppTrees);

  } else {
    let app = new EmberAddon(defaults, options);

    return app.toTree();
  }
}

module.exports = dummyAppTrees;
