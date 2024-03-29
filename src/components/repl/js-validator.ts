import generate from '@babel/generator';
import { parse } from '@babel/parser';
import traverse, { type NodePath } from '@babel/traverse';
import {
  type ForStatement,
  type WhileStatement,
  type DoWhileStatement,
  isEmptyStatement,
  isExpressionStatement,
  isBlockStatement,
  blockStatement,
} from '@babel/types';

const loopProtectorCodePrefix = `
  let __loopProtection = true;

  function disableLoopProtection() {
    __loopProtection = false;
  }

  const __loopProtector = (function () {
    const maxIterationsOverall = 1_000_000;

    let counter = 0;

    return function () {
      if (__loopProtection) {
        if (counter > maxIterationsOverall) {
          throw new Error('Infinite loop detected. You can deactivate this check by adding the following to the top of your code: disableLoopProtection();');
        }
        counter++;
      }
    }
  })()
`;

const loopProtectorCallAST = parse(`__loopProtector()`);

export default function jsValidator(code: string): string {
  try {
    const ast = parse(code);

    traverse(ast, {
      ForStatement: function (path) {
        loopPathProtector(path);
      },
      WhileStatement: function (path) {
        loopPathProtector(path);
      },
      DoWhileStatement: function (path) {
        loopPathProtector(path);
      },
    });

    // The newline character avoids the code breaking if the last code line is a line comment.
    return loopProtectorCodePrefix + generate(ast).code + '\n';
  } catch (e) {
    return `throw '${(e as Error).message}'`;
  }
}

function loopPathProtector<
  T extends ForStatement | WhileStatement | DoWhileStatement,
>(path: NodePath<T>) {
  if (isBlockStatement(path.node.body)) {
    path.node.body.body.push(...loopProtectorCallAST.program.body);
  } else if (isExpressionStatement(path.node.body)) {
    path.node.body = blockStatement([
      ...loopProtectorCallAST.program.body,
      path.node.body,
    ]);
  } else if (isEmptyStatement(path.node.body)) {
    path.node.body = blockStatement([...loopProtectorCallAST.program.body]);
  }
}
