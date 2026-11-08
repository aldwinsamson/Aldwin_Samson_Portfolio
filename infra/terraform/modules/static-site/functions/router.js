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
