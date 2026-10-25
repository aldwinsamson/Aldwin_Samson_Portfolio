// CloudFront Function (cloudfront-js-2.0) — runs at the edge on every viewer request.
//  1. www.<domain>  ->  301 to the apex (one canonical URL for SEO).
//  2. SPA fallback: extension-less paths (/projects, /projects/ligtas, ...) are served
//     from /index.html so React Router can take over. Paths WITH an extension
//     (/assets/x.js, /images/a.webp) are left alone, so a missing asset is a real 404
//     instead of an HTML page pretending to be JavaScript.
function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value : '';

  if (host.indexOf('www.') === 0) {
    var qs = Object.keys(request.querystring)
      .map(function (k) {
        var q = request.querystring[k];
        return q.multiValue
          ? q.multiValue.map(function (m) { return k + '=' + m.value; }).join('&')
          : k + '=' + q.value;
      })
      .join('&');

    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: 'https://' + host.substring(4) + request.uri + (qs ? '?' + qs : '') },
        'cache-control': { value: 'public, max-age=3600' },
      },
    };
  }

  var uri = request.uri;
  var lastSlash = uri.lastIndexOf('/');
  if (uri.indexOf('.', lastSlash) === -1) {
    request.uri = '/index.html';
  }
  return request;
}
