# postcss-custom-properties-transformer <a href="https://npm.im/postcss-custom-properties-transformer"><img src="https://badgen.net/npm/v/postcss-custom-properties-transformer"></a> <a href="https://npm.im/postcss-custom-properties-transformer"><img src="https://badgen.net/npm/dm/postcss-custom-properties-transformer"></a> <a href="https://packagephobia.now.sh/result?p=postcss-custom-properties-transformer"><img src="https://packagephobia.now.sh/badge?p=postcss-custom-properties-transformer"></a> <a href="https://bundlephobia.com/result?p=postcss-custom-properties-transformer"><img src="https://badgen.net/bundlephobia/minzip/postcss-custom-properties-transformer"></a>

PostCSS plugin to transform [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

## 🙋‍♂️ Why?

Transform CSS custom properties to...

- **🔥 Namespace** Scope to a library with a namespace to prevent collision with other libraries
- **🙆‍♀️ Scope to file** Scope to a file to prevent collision with other files
- **🐥 Minify** Shorten long custom properties via hashing
- **🤬 Obfuscate** Mangle custom-property names to deter reverse-engineering

## :rocket: Install
```sh
npm i -D postcss postcss-custom-properties-transformer
```


## 🚦 Quick Setup

Add `postcss-custom-properties-transformer` to your PostCSS configuration (eg. `postcss.config.js`) and pass in a transformer. The transformer defines how to transform a given custom property.

```diff
module.exports = {
    plugins: [

        // Insert above plugins that transform custom properties
+        require('postcss-custom-properties-transformer')({
+            transformer: '[hash:4]'
+        }),

        require('postcss-preset-env')()
    ]
};
```


## 👨🏻‍🏫 Examples

### Namespace custom properties
Prefix all custom properties with a string to brand and reduce any inadvertent collisions with custom properties from other libraries.

```js
require('postcss-custom-properties-transformer')({
    transformer: 'namespace-[local]'
})
```

#### Namespace with package meta
```js
const pkg = require('./package.json')
require('postcss-custom-properties-transformer')({
    transformer: `${pkg.name}-${pkg.version}-[local]`
})
```

### Hash custom properties
This will MD5 hash the custom property name. The effect is close to the namespacing example above except the property name will be obfuscated.

```js
require('postcss-custom-properties-transformer')({
    transformer: '[hash]'
})
```

#### Short hash
If the MD5 hash is too lengthly, you can truncate the hash because MD5 (and SHA-family) has [statistically good uniform distribution](https://stackoverflow.com/questions/8184941/uniform-distribution-of-truncated-md5). To truncate, pass in a hash length in the `hash` template. 

Note: the shorter the hash, the higher the collision rate. There will be a warning if a collision is detected.

```js
require('postcss-custom-properties-transformer')({
    transformer: '[hash:4]'
})
```

### Scoping to file
If you have local custom properties (eg. black-boxed component), you might want to scope them to file. Use the `filepath` template to insert the filepath.

```js
require('postcss-custom-properties-transformer')({
    transformer: '[filepath]-[local]'
})
```

#### Using a hash (Recommended)

If the `filepath` is too verbose, pass `filepath` to the `hash` template to hash it.

```js
require('postcss-custom-properties-transformer')({
    transformer: '[hash:filepath:4]-[hash:4]'
})
```

### Advanced transformations
If you want to do something more complex—such as discriminate between global and local custom properties (eg. theme variables)—, pass in a transformer function.

```js
require('postcss-custom-properties-transformer')({
    transformer(ctx) {
        if (ctx.local.startsWith('theme-')) {
            return ctx.local;
        }

        // You can return a template
        return `[hash:filepath:4]-[hash:4]`;

        // Alternatively, you can use the functions
        return ctx.hash('filepath', 4) + '-' + ctx.hash(4);
    }
})
```


## ⚙️ Options
- `transformer` `<String>`

    Templates:
    - `[filepath]` - Absolute path to the CSS file
    - `[local]` - Custom property name being transformed
    - `[hash]`

        Arguments:
        - hashing algorithm (`md5`) - Any hashing algorithm [supported by `crypto`](https://nodejs.org/api/crypto.html#crypto_crypto_gethashes) (eg. `md5`, `sha1`, `sha256`)
        - hash digest (`hex`) - Digest encoding to pass into `crypto` (eg. `hex`, `base64`)
        - hash key (`local`) - What to hash (eg. `local`, `filepath`, `css`)
        - length - The length to truncate the hash to. When truncating, it will also remove the leading digits in a hash if length permitting.

- `transformer` `<Function>` `(ctx)`
    - `ctx`
        - `filepath`
        - `local`
        - `css` 
        - `hash()` - Hashing function. Accepts parameters in arbitrary order. (`ctx.hash('filepath', 'sha-256', 'base64', 4)`)



