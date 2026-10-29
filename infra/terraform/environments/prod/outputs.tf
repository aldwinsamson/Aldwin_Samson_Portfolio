output "environment" {
  value = {
    name   = var.environment
    prefix = local.context.prefix
    region = var.region
    domain = var.domain_name
  }
}

output "site_url" {
  value = module.static_site.site_url
}

output "cloudfront_domain" {
  description = "Works immediately, even before DNS is delegated: https://<this>/"
  value       = module.static_site.distribution_domain_name
}

output "site_bucket" {
  value = module.static_site.bucket_name
}

output "distribution_id" {
  value = module.static_site.distribution_id
}

output "site_deploy_role_arn" {
  value = module.site_deploy_role.arn
}

output "dashboard_url" {
  value = module.monitoring.dashboard_url
}

output "github_variables_commands" {
  description = "Run these (GitHub CLI) after the first apply so the deploy workflow knows where to publish."
  value       = <<-EOT
    gh variable set AWS_SITE_DEPLOY_ROLE_ARN    --body "${module.site_deploy_role.arn}"
    gh variable set SITE_BUCKET                 --body "${module.static_site.bucket_name}"
    gh variable set CLOUDFRONT_DISTRIBUTION_ID  --body "${module.static_site.distribution_id}"
    gh variable set SITE_URL                    --body "${module.static_site.site_url}"
  EOT
}

output "lab" {
  description = "Connection commands for the optional k3s lab (null while lab.enabled = false)."
  value       = var.lab.enabled ? module.k3s_lab[0].connect_commands : null
}
