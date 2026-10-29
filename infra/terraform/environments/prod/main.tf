data "aws_route53_zone" "primary" {
  name         = var.domain_name
  private_zone = false
}

# --- Public website: private S3 + CloudFront + ACM + Route 53 ---------------------------------------------------
module "static_site" {
  source = "../../modules/static-site"

  providers = {
    aws      = aws
    aws.use1 = aws.use1
  }

  context     = local.context
  domain_name = var.domain_name
  zone_id     = data.aws_route53_zone.primary.zone_id
  include_www = var.site.include_www
  price_class = var.site.price_class
  csp         = var.site.csp
  hsts = {
    preload = var.site.hsts_preload
  }
}

# --- Monitoring & alerting -----------------------------------------------------------------------------------------
module "monitoring" {
  source = "../../modules/monitoring"

  providers = {
    aws      = aws
    aws.use1 = aws.use1
  }

  context                          = local.context
  domain_name                      = var.domain_name
  distribution_id                  = module.static_site.distribution_id
  alert_email                      = var.alert_email
  health_check                     = { enabled = var.monitoring.health_check_enabled }
  error_rate_5xx_threshold_percent = var.monitoring.error_rate_5xx_threshold_percent
}

# --- Least-privilege role used by .github/workflows/deploy.yml to publish the site ------------------------------
# It can ONLY write to this one bucket and invalidate this one distribution.
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

data "aws_iam_policy_document" "site_deploy" {
  statement {
    sid       = "ListBucket"
    actions   = ["s3:ListBucket", "s3:GetBucketLocation"]
    resources = [module.static_site.bucket_arn]
  }

  statement {
    sid       = "WriteObjects"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${module.static_site.bucket_arn}/*"]
  }

  statement {
    sid       = "InvalidateCache"
    actions   = ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation", "cloudfront:ListInvalidations"]
    resources = [module.static_site.distribution_arn]
  }
}

module "site_deploy_role" {
  source = "../../modules/github-oidc-role"

  name               = "${local.context.prefix}-gha-site-deploy"
  description        = "GitHub Actions (main branch): publish the built site to S3 and invalidate CloudFront"
  oidc_provider_arn  = data.aws_iam_openid_connect_provider.github.arn
  subjects           = ["repo:${var.github_repository}:ref:refs/heads/main"]
  inline_policy_json = data.aws_iam_policy_document.site_deploy.json
}

# --- Optional DevOps lab ---------------------------------------------------------------------------------------------
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
