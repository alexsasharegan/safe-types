module.exports = {
  out: "./docs",
  readme: "./README.md",
  includes: "./src",
  exclude: ["**/*.test.ts"],
  mode: "file",
  excludeExternals: true,
  excludeNotExported: true,
  excludePrivate: true,
};
