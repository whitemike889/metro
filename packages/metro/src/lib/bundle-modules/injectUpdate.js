/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */
'use strict';

import type {HmrUpdate, ModuleMap} from './types.flow';

function injectModules(
  modules: ModuleMap,
  sourceMappingURLs: $ReadOnlyArray<string>,
  sourceURLs: $ReadOnlyArray<string>,
): void {
  modules.forEach(([id, source], i: number) => {
    // Fool regular expressions trying to remove sourceMappingURL comments from
    // source files, which would incorrectly detect and remove the inlined
    // version.
    const sourceMappingURL = 'sourceMappingURL';
    const sourceURL = 'sourceURL';
    const code =
      source +
      `\n//# ${sourceMappingURL}=${sourceMappingURLs[i]}\n//# ${sourceURL}=${
        sourceURLs[i]
      }`;

    // Some engines do not support `sourceURL` as a comment. We expose a
    // `globalEvalWithSourceUrl` function to handle updates in that case.
    if (global.globalEvalWithSourceUrl) {
      global.globalEvalWithSourceUrl(code, sourceURLs[i]);
    } else {
      // eslint-disable-next-line no-eval
      eval(code);
    }
  });
}

function injectUpdate(update: HmrUpdate): void {
  injectModules(
    update.added,
    update.addedSourceMappingURLs,
    update.addedSourceURLs,
  );
  injectModules(
    update.modified,
    update.modifiedSourceMappingURLs,
    update.modifiedSourceURLs,
  );
}

module.exports = injectUpdate;
