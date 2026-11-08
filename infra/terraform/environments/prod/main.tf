data "aws_route53_zone" "primary" {
  count = var.aws_site_enabled ? 1 : 0

  name         = var.domain_name
  private_zone = false
}

module "static_site" {
  count  = var.aws_site_enabled ? 1 : 0
  source = "../../modules/static-site"

  providers = {
    aws      = aws
    aws.use1 = aws.use1
  }

  context     = local.context
  domain_name = var.domain_name
  zone_id     = data.aws_route53_zone.primary[0].zone_id
  include_www = var.site.include_www
  price_class = var.site.price_class
  csp         = var.site.csp
  hsts = {
    preload = var.site.hsts_preload
  }

  dns_target    = var.hosting.target == "aws" ? "aws" : "external"
  external_ipv4 = var.hosting.vercel.ipv4
  external_ttl  = var.hosting.vercel.ttl
}

module "monitoring" {
  count  = var.aws_site_enabled ? 1 : 0
  source = "../../modules/monitoring"

  providers = {
    aws      = aws
    aws.use1 = aws.use1
  }

  context                          = local.context
  domain_name                      = var.domain_name
  distribution_id                  = module.static_site[0].distribution_id
  alert_email                      = var.alert_email
  health_check                     = { enabled = var.monitoring.health_check_enabled }
  error_rate_5xx_threshold_percent = var.monitoring.error_rate_5xx_threshold_percent
}

data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

data "aws_iam_policy_document" "site_deploy" {
  count = var.aws_site_enabled ? 1 : 0

  statement {
    sid       = "ListBucket"
    actions   = ["s3:ListBucket", "s3:GetBucketLocation"]
    resources = [module.static_site[0].bucket_arn]
  }

  statement {
    sid       = "WriteObjects"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${module.static_site[0].bucket_arn}/*"]
  }

  statement {
    sid       = "InvalidateCache"
    actions   = ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation", "cloudfront:ListInvalidations", "cloudfront:GetDistribution"]
    resources = [module.static_site[0].distribution_arn]
  }
}

module "site_deploy_role" {
  count  = var.aws_site_enabled ? 1 : 0
  source = "../../modules/github-oidc-role"

  name               = "${local.context.prefix}-gha-site-deploy"
  description        = "GitHub Actions (main branch): publish the built site to S3 and invalidate CloudFront"
  oidc_provider_arn  = data.aws_iam_openid_connect_provider.github.arn
  subjects           = ["${local.oidc_sub_prefix}:ref:refs/heads/main"]
  inline_policy_json = data.aws_iam_policy_document.site_deploy[0].json
}

module "k3s_lab" {
  count  = var.lab.enabled ? 1 : 0
  source = "../../modules/k3s-lab"

  context         = local.context
  instance_type   = var.lab.instance_type
  root_volume_gb  = var.lab.root_volume_gb
  k3s_version     = var.lab.k3s_version
  argocd_version  = var.lab.argocd_version
  gitops_repo_url = local.gitops_repo_url
  gitops_revision = var.lab.gitops_branch
  schedule        = var.lab.schedule
}
