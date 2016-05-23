# open-webstorm
[![Demo](https://raw.githubusercontent.com/mooyoul/open-webstorm/master/images/demo.gif)](https://raw.githubusercontent.com/mooyoul/open-webstorm/master/images/demo.gif)


[![Dependency Status](https://david-dm.org/mooyoul/open-webstorm.svg)](https://david-dm.org/mooyoul/open-webstorm)
[![devDependency Status](https://david-dm.org/mooyoul/open-webstorm/dev-status.svg)](https://david-dm.org/mooyoul/open-webstorm#info=devDependencies)
[![Known Vulnerabilities](https://snyk.io/test/github/mooyoul/open-webstorm/badge.svg)](https://snyk.io/test/github/mooyoul/open-webstorm)
[![MIT license](http://img.shields.io/badge/license-MIT-blue.svg)](http://mooyoul.mit-license.org/)

Open Jetbrains Webstorm IDE Workspace from Node.js


## Installation
```
$ npm install open-webstorm
```

## Getting Started
```javascript
var openWebstorm = require('open-webstorm');
openWebstorm('.'); // open current directory
```


## API
### openWebstorm(workspacePath, options)
#### workspacePath

*Required*
Type: `string`

The workspace path that you want to open with Webstorm.

#### options

*Optional*
Type: `object`

#### options.port
*Optional*
Type: `number`, `string`

The port which is Webstorm is listening.
If not specified, open-webstorm will find this port.

#### options.token
*Optional*
Type: `number`, `string`

The token which is provided by Webstorm.
If not specified, open-webstorm will find this token.

#### options.cwd
*Optional*
Default: `process.cwd()`



## License
[MIT](LICENSE)

See full license on [mooyoul.mit-license.org](http://mooyoul.mit-license.org/)
