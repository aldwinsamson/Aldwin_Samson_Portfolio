locals {
  # Built from the environment's csp object. The module only ever trusts 'self' by itself;
  # every extra origin comes from variables. style-src needs 'unsafe-inline' for inline style attributes.
  csp = join("; ", [
    "default-src 'self'",
    "script-src 'self'",
    "style-src ${join(" ", concat(["'self'", "'unsafe-inline'"], var.csp.style_hosts))}",
    "font-src ${join(" ", concat(["'self'", "data:"], var.csp.font_hosts))}",
    "img-src ${join(" ", concat(["'self'", "data:", "blob:"], var.csp.img_hosts))}",
    "connect-src ${join(" ", concat(["'self'"], var.csp.connect_hosts))}",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ])
}

data "aws_cloudfront_cache_policy" "optimized" {
  name = "Managed-CachingOptimized"
}

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${var.context.prefix}-site-oac"
  description                       = "CloudFront -> private S3 bucket (SigV4)"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_function" "router" {
  name    = "${var.context.prefix}-spa-router"
  runtime = "cloudfront-js-2.0"
  comment = "www -> apex redirect + SPA fallback to /index.html"
  publish = true
  code    = file("${path.module}/functions/router.js")
}

resource "aws_cloudfront_response_headers_policy" "security" {
  name    = "${var.context.prefix}-security-headers"
  comment = "HSTS, nosniff, frame deny, referrer policy, CSP (${var.csp.mode}), permissions policy"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = var.hsts.max_age_seconds
      include_subdomains         = var.hsts.include_subdomains
      preload                    = var.hsts.preload
      override                   = true
    }

    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "DENY"
      override     = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }

    dynamic "content_security_policy" {
      for_each = var.csp.mode == "enforce" ? [1] : []

      content {
        content_security_policy = local.csp
        override                = true
      }
    }
  }

  custom_headers_config {
    items {
      header   = "Permissions-Policy"
      value    = var.permissions_policy
      override = true
    }

    dynamic "items" {
      for_each = var.csp.mode == "report-only" ? [1] : []

      content {
        header   = "Content-Security-Policy-Report-Only"
        value    = local.csp
        override = true
      }
    }
  }
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  http_version        = "http2and3"
  comment             = "${var.context.prefix}: ${var.domain_name}"
  default_root_object = "index.html"
  aliases             = local.aliases
  price_class         = var.price_class

  origin {
    origin_id                = "s3-site"
    domain_name              = module.bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  default_cache_behavior {
    target_origin_id           = "s3-site"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = data.aws_cloudfront_cache_policy.optimized.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.router.arn
    }
  }

  # A private bucket answers 403 for a missing key. Show the app's own 404 page.
  custom_error_response {
    error_code            = 403
    response_code         = 404
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 404
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
