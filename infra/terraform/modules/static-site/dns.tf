
resource "aws_acm_certificate" "site" {
  provider = aws.use1

  domain_name               = var.domain_name
  subject_alternative_names = var.include_www ? ["www.${var.domain_name}"] : []
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.site.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id         = var.zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 60
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "site" {
  provider = aws.use1

  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

locals {
  alias_records = {
    for pair in setproduct(local.aliases, ["A", "AAAA"]) : "${pair[0]}-${pair[1]}" => {
      name = pair[0]
      type = pair[1]
    } if var.dns_target == "aws" || pair[1] == "A"
  }
}

resource "aws_route53_record" "alias" {
  for_each = local.alias_records

  zone_id         = var.zone_id
  name            = each.value.name
  type            = each.value.type
  allow_overwrite = true

  ttl     = var.dns_target == "aws" ? null : var.external_ttl
  records = var.dns_target == "aws" ? null : var.external_ipv4

  dynamic "alias" {
    for_each = var.dns_target == "aws" ? [1] : []

    content {
      name                   = aws_cloudfront_distribution.site.domain_name
      zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
      evaluate_target_health = false
    }
  }
}
