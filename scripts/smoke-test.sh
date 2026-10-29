#!/usr/bin/env bash
# Post-deploy smoke test. Usage: scripts/smoke-test.sh https://aldwinsamson.com
set -euo pipefail
BASE="${1:?usage: smoke-test.sh <https://site-url>}"
BASE="${BASE%/}"
HOST="${BASE#https://}"
fail=0

# check "description" <command...>  -> runs the command; success = ok
check() {
  local desc="$1"; shift
  if "$@"; then echo "  ok    $desc"; else echo "  FAIL  $desc"; fail=1; fi
}
code() { curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$@"; }
headers() { curl -sI --max-time 20 "$1" | tr -d '\r'; }
has_header() { headers "$1" | grep -qiE "^$2:"; }
status_is() { [ "$(code "$2")" = "$1" ]; }
status_in() { local c; c="$(code "$1")"; shift; local want; for want in "$@"; do [ "$c" = "$want" ] && return 0; done; return 1; }

echo "Smoke testing $BASE"
for path in / /projects /robots.txt /sitemap.xml /theme-init.js; do
  check "GET $path -> 200" status_is 200 "$BASE$path"
done
check "missing asset is a real 404" status_is 404 "$BASE/assets/does-not-exist.js"
check "http -> https redirect" status_in "http://$HOST/" 301 302 308
check "www -> apex 301" status_is 301 "https://www.$HOST/"

check "HSTS header present" has_header "$BASE/" strict-transport-security
check "X-Content-Type-Options present" has_header "$BASE/" x-content-type-options
check "CSP header present (enforce or report-only)" has_header "$BASE/" 'content-security-policy(-report-only)?'

# Hashed bundle must be served immutable; index.html must be revalidated.
asset="$(curl -s --max-time 20 "$BASE/" | grep -oE '/assets/[^"]+\.js' | head -1 || true)"
if [ -n "$asset" ]; then
  check "bundle $asset is immutable" has_header "$BASE$asset" 'cache-control: .*immutable'
else
  check "index.html references a /assets/*.js bundle" false
fi
check "index.html is no-cache" has_header "$BASE/" 'cache-control: .*no-cache'

if [ "$fail" -eq 0 ]; then echo "All smoke tests passed."; else echo "Smoke test FAILED."; exit 1; fi
