# postcss-custom-properties-transformer [![Latest version](https://badgen.net/npm/v/postcss-custom-properties-transformer)](https://npm.im/postcss-custom-properties-transformer) [![Monthly downloads](https://badgen.net/npm/dm/postcss-custom-properties-transformer)](https://npm.im/postcss-custom-properties-transformer) [![Install size](https://packagephobia.now.sh/badge?p=postcss-custom-properties-transformer)](https://packagephobia.now.sh/result?p=postcss-custom-properties-transformer)

PostCSS plugin to transform [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

## 🙋‍♂️ Why?

Transform CSS custom properties to...

- **🔥 Scope to package** Namespace them to your library to prevent collision with other custom properties
- **👌 Scope to file** Scope to a file to prevent collision with other files
- **🐥 Minify** Shorten long custom properties via hashing
- **🤬 Obfuscate** Mangle custom-property names to deter reverse-engineering

## 🚀 Install
```sh
npm i -D postcss postcss-custom-properties-transformer
```

## 🚦 Quick Setup

Add `postcss-custom-properties-transformer` to your PostCSS configuration (eg. `postcss.config.js`) and pass in a `transformer` function.

> Warning: this plugin doesn't validate custom properties. [Make sure to not use invalid characters (eg. period)](https://stackoverflow.com/a/42311038)

```diff
module.exports = {
     plugins: [

+        // Insert above plugins that read custom properties
+        require('postcss-custom-properties-transformer')({
+            transformer({ property }) {
+                // Prefixing all custom properties with 'APP-'
+                return 'APP-' + property;
+            }
+        }),

         require('postcss-preset-env')()
     ]
};
```

## 👨🏻‍🏫 Examples

### Namespace with package meta
If you have a CSS library, you can scope your custom properties to every release so that multiple versions of the library used in the same app doesn't yield any collisions.

```js
const pkg = require('./package.json')
require('postcss-custom-properties-transformer')({
    transformer({ property }) {
        return `${pkg.name}-${pkg.version}-${property}`;
    }
})
```

### Hash custom properties
If you want to hash your custom properties to shorten/obfuscate them, pass in a hashing algorithm of your choice.

This demo uses a 6-character truncated MD5 hash; MD5 and the SHA-family has [statistically good uniform distribution](https://stackoverflow.com/questions/8184941/uniform-distribution-of-truncated-md5) and can be truncated.

However, note that the shorter the hash, the higher the collision rate. There will be a warning if a collision is detected.

```js
const crypto = require('crypto');
const md5 = string => crypto.createHash('md5').update(string).digest('hex');

require('postcss-custom-properties-transformer')({
    transformer({ property }) {
        return md5(property).slice(0, 6);
    }
})
```

### Advanced transformations
If you want to do something more complex—such as discriminate between global and local custom properties (eg. theme variables).

```js
require('postcss-custom-properties-transformer')({
    transformer({ property }) {
        if (property.startsWith('theme-')) {
            return property;
        }
        return hash(property);
    }
})
```

## ⚙️ Options
- `transformer(data)` `<Function>`
  - `data` `<Object>`
    - `property` `<String>` - The custom property name that's being transformed. The `--` prefix is omitted
    - `filepath` `<String>` - The path to the file where the custom property is being transformed
    - `css` `<String>` - The entire CSS code of the file
