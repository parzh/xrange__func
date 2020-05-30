# `@xrange/func`

### Functional sequencer of `xrange`, provided as a separate package

<p align="center">
  <sub>
    Created with <a href="https://npmjs.org/package/create-package-typescript"><code>create-package-typescript</code></a>
  </sub>
</p>

## Differences from `xrange`:
- only functional implementation: `xrange(start, predicate, next, maxMemo?)`;
- no proper support of decimal numbers, only integers;
- no custom errors, such as `"argument is not a function"` or `"argument is not a valid length"`;
- only Node.JS is supported (for now at least);
