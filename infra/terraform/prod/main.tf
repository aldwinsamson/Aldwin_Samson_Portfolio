data "aws_route53_zone" "primary" {
  name         = var.domain_name
  private_zone = false
}

# --- Public website: S3 (private) + CloudFront + ACM + Route 53 ---------------------------------
module "static_site" {
  source = "../modules/static-site"

  providers = {
    aws      = aws
    aws.use1 = aws.use1
  }

  project     = var.project
  domain_name = var.domain_name
  zone_id     = data.aws_route53_zone.primary.zone_id
  csp_mode    = var.csp_mode
  price_class = var.cloudfront_price_class
}

# --- Monitoring & alerting ------------------------------------------------------------------------
module "monitoring" {
  source = "../modules/monitoring"

  providers = {
    aws      = aws
    aws.use1 = aws.use1
  }

  project             = var.project
  domain_name         = var.domain_name
  distribution_id     = module.static_site.distribution_id
  alert_email         = var.alert_email
  enable_health_check = var.enable_health_check
}

# --- Optional DevOps lab -----------------------------------------------------------------------------
module "k3s_lab" {
  count  = var.enable_lab ? 1 : 0
  source = "../modules/k3s-lab"

  project          = var.project
  instance_type    = var.lab_instance_type
  gitops_repo_url  = var.gitops_repo_url
  gitops_revision  = var.gitops_revision
  schedule_enabled = var.lab_schedule_enabled
}
