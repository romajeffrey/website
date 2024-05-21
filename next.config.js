const path = require('path');
const glob = require('glob');
const compareVersions = require('compare-versions');

module.exports = {
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.mjs/,
      include: /node_modules/,
      type: 'javascript/auto',
    });
    return config;
  },

  // Next.js config
  async redirects() {
    return [
      {
        source: '/case-studies/:slug*',
        destination: '/primitives/case-studies/:slug*',
        permanent: true,
      },
      {
        source: '/colors/docs',
        destination: '/colors/docs/overview/installation',
        permanent: true,
      },
      // Add other redirects here...
    ];
  },

  // Generate URL rewrites for components and utilities
  // So navigating to /tooltip rewrites to /tooltip/[latestVersion]
  async rewrites() {
    const DATA_PATH = path.join(__dirname, 'data');

    function isValidSemver(version) {
      return /^(\d+\.)?(\d+\.)?(\*|\d+)$/.test(version);
    }

    function getLatestVersionFromPath(fromPath) {
      const paths = glob.sync(`${DATA_PATH}/${fromPath}/**/*.mdx`);
      const components = {};

      paths.forEach((p) => {
        const [name, version] = p
          .replace(DATA_PATH, '')
          .replace(`/${fromPath}/`, '')
          .replace('.mdx', '')
          .split('/');

        if (isValidSemver(version)) {
          components[name] = [...(components[name] || []), version];
        }
      });

      const latest = Object.entries(components).reduce((acc, curr) => {
        const [name, versions] = curr;
        const [latestVersion] = versions.sort(compareVersions).reverse();
        acc[name] = latestVersion;
        return acc;
      }, {});

      return latest;
    }

    function createRewrites(latestVersionMap, url) {
      return [...Object.entries(latestVersionMap)].reduce((redirects, curr) => {
        const [name, version] = curr;
        redirects.push({ source: `${url}${name}`, destination: `${url}${name}/${version}` });
        return redirects;
      }, []);
    }

    return [
      ...createRewrites(
        getLatestVersionFromPath('primitives/docs/components'),
        '/primitives/docs/components/'
      ),
      ...createRewrites(
        getLatestVersionFromPath('primitives/docs/utilities'),
        '/primitives/docs/utilities/'
      ),
      ...createRewrites(
        getLatestVersionFromPath('design-system/docs/components'),
        '/design-docs/system/components/'
      ),
    ];
  },
};
