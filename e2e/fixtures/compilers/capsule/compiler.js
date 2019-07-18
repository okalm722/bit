/**
 * compiler that supports the capsule interface.
 * remove the string stringToRemovedByCompiler so then the dists will be valid to run
 */
const path = require('path');
const os = require('os');

const stringToRemovedByCompiler = 'export const A = "THIS STRING SHOULD BE REMOVED BY THE DUMMY COMPILER";\n';

function compile(files, distPath, context) {
  const targetDir = path.join(os.tmpdir(), generateRandomStr());
  const distSignature = '// THIS IS A DIST FILE GENERATED BY A DUMMY COMPILER\n';
  return context.isolate({ targetDir, shouldBuildDependencies: false }).then((isolateResults) => {
    // careful not to change the message, otherwise, change also the function getCapsuleDirByComponentName below
    console.log(`generated a capsule for ${isolateResults.componentWithDependencies.component.id.toString()} at ${targetDir}`);
    const componentRootDir = path.join(targetDir, isolateResults.componentWithDependencies.component.writtenPath);
    const distFiles = isolateResults.capsuleFiles
      .map((file) => {
        const distFile = file.clone();
        const content = distSignature + file.contents.toString().replace(stringToRemovedByCompiler, '');
        distFile.base = distPath;
        distFile.path = path.join(distPath, file.relative);
        distFile.contents = Buffer.from(content);
        return distFile;
      });
    return isolateResults.addSharedDir(distFiles);
  });
}

function generateRandomStr(size = 8) {
  return Math.random()
    .toString(36)
    .slice(size * -1);
}

function getCapsuleDirByComponentName(compilerOutput, componentName) {
  const outputSplit = compilerOutput.split('\n');
  const componentOutput = outputSplit.find(o => o.includes(componentName));
  if (!componentOutput) {
    throw new Error('the output of capsule compiler is expected to include the build component name (see the console.log inside the compile function)');
  }
  return componentOutput.replace(`generated a capsule for ${componentName} at `, '');
}

module.exports = {
  compile,
  stringToRemovedByCompiler,
  getCapsuleDirByComponentName
};