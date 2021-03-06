var fs = require('file-system');
var path = require('path');
var request = require('ajax-request');

function base64(filename, data) {
  var extname = path.extname(filename).substr(1);
  extname = extname || 'png';

  if (extname === 'svg') {
    extname = "svg+xml"
  }

  return 'data:image/' + extname + ';base64,' + data.toString('base64');
}

function img(data) {
  var reg = /^data:image\/([\w+]+);base64,([\s\S]+)/;
  var match = data.match(reg);
  var baseType = {
    jpeg: 'jpg'
  };

  baseType['svg+xml'] = 'svg'

  if (!match) {
    throw new Error('image base64 data error');
  }

  var extname = baseType[match[1]] ? baseType[match[1]] : match[1];

  return {
    extname: '.' + extname,
    base64: match[2]
  };
}

/**
 * @description
 * Get image file base64 data
 * @example
 * base64Img.base64('path/demo.png', function(err, data) {})
 */
exports.base64 = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(base64(filename, data))
      }
    })
  })
}

/**
 * @description
 * The api same as base64, but it's synchronous
 * @example
 * var data = base64Img.base64Sync('path/demo.png');
 */
exports.base64Sync = function(filename) {
  var data = fs.readFileSync(filename);

  return base64(filename, data);
};

/**
 * @description
 * Get base64 from url
 * @example
 * request.base64(
 *   'http://webresource.c-ctrip.com/ResCRMOnline/R5/html5/images/57.png',
 *   function(err, res, body) {
 *
 *   }
 * );
 */
exports.requestBase64 = (url) => {
  return new Promise((resolve, reject) => {
    request({
      url,
      isBuffer: true
    }, (err, res, body) => {
      if (err) {
        reject(err)
      } else {
        var data = 'data:' + res.headers['content-type'] + ';base64,' + body.toString('base64');

        resolve(data)
      }
    })
  })
}

/**
 * @description
 * Convert image base64 data to img
 * @example
 * base64Img.img('data:image/png;base64,...', 'dest', '1', function(err, filepath) {});
 */
exports.img = function(data, destpath, name, callback) {
  var result = img(data);
  var filepath = path.join(destpath, name + result.extname);

  fs.writeFile(filepath, result.base64, { encoding: 'base64' }, function(err) {
    callback(err, filepath);
  });
};

/**
 * @description
 * The api same as img, but it's synchronous
 * @example
 * var filepath = base64Img.imgSync('data:image/png;base64,...', 'dest', '1');
 */
exports.imgSync = function(data, destpath, name) {
  var result = img(data);
  var filepath = path.join(destpath, name + result.extname);

  fs.writeFileSync(filepath, result.base64, { encoding: 'base64' });
  return filepath;
};
