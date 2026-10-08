import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve('src');
const allowed = { game: ['game'], runtime: ['game', 'runtime'], rendering: ['game', 'rendering'], app: ['game', 'runtime', 'rendering', 'app'] };
const failures = [];
async function visit(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) { await visit(file); continue; }
    if (!file.endsWith('.ts')) continue;
    const layer = path.relative(root, file).split(path.sep)[0];
    if (!allowed[layer]) continue; // main.ts is the composition root.
    const source = await readFile(file, 'utf8');
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    const check = node => {
      let specifier;
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) specifier = node.moduleSpecifier.text;
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteral(node.arguments[0])) specifier = node.arguments[0].text;
      if (specifier) {
        const target = specifier.startsWith('.') ? path.relative(root, path.resolve(path.dirname(file), specifier)).split(path.sep)[0] : null;
        if (target && !allowed[layer].includes(target)) failures.push(`${file}: ${layer} cannot import ${target}. Move orchestration to app or main.ts.`);
        if ((specifier === 'three' || specifier.startsWith('three/')) && layer !== 'rendering') failures.push(`${file}: Three.js belongs in src/rendering.`);
        if (specifier.startsWith('@gyral/') && layer !== 'app') failures.push(`${file}: Gyral belongs in src/app.`);
        if (specifier === '@local-games/runtime/gyral' && layer !== 'app') failures.push(`${file}: the Gyral session bridge belongs in src/app.`);
      }
      if (['game', 'runtime'].includes(layer) && ts.isIdentifier(node) && ['window', 'document', 'localStorage', 'requestAnimationFrame', 'performance', 'Date', 'crypto'].includes(node.text)) failures.push(`${file}: inject ${node.text} through the browser host.`);
      if (['game', 'runtime'].includes(layer) && ts.isPropertyAccessExpression(node) && node.expression.getText(ast) === 'Math' && node.name.text === 'random') failures.push(`${file}: inject a seed instead of Math.random().`);
      ts.forEachChild(node, check);
    };
    check(ast);
  }
}
await visit(root);
for (const [entry, imports] of [['core', []], ['gyral', ['@gyral/core', './core.js']]]) {
  const file = `packages/game-runtime/src/${entry}.ts`;
  const ast = ts.createSourceFile(file, await readFile(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const check = node => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier
      && ts.isStringLiteral(node.moduleSpecifier) && !imports.includes(node.moduleSpecifier.text)) failures.push(`${file}: keep the shared entry point independent of games, rendering, and browser services.`);
    if (ts.isIdentifier(node) && ['window', 'document', 'localStorage', 'requestAnimationFrame', 'performance', 'Date', 'crypto'].includes(node.text)) failures.push(`${file}: browser services belong to the game host.`);
    ts.forEachChild(node, check);
  };
  check(ast);
}
if (failures.length) throw new Error(failures.join('\n'));
console.log('Layer boundaries verified.');
