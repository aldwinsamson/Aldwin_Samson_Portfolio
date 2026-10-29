output "name_servers" {
  description = "Set these 4 name servers at your domain registrar (custom DNS / nameservers)."
  value       = aws_route53_zone.primary.name_servers
}

output "hosted_zone_id" {
  value = aws_route53_zone.primary.zone_id
}

output "state_bucket" {
  description = "Pass to `terraform init -backend-config=bucket=...` in environments/<env>."
  value       = module.state_bucket.id
}

output "tf_plan_role_arn" {
  value = module.plan_role.arn
}

output "tf_apply_role_arn" {
  value = module.apply_role.arn
}

output "github_variables_commands" {
  description = "Run these (GitHub CLI) to configure the repository variables used by the workflows."
  value       = <<-EOT
    gh variable set AWS_REGION            --body "${var.region}"
    gh variable set TF_STATE_BUCKET       --body "${module.state_bucket.id}"
    gh variable set AWS_TF_PLAN_ROLE_ARN  --body "${module.plan_role.arn}"
    gh variable set AWS_TF_APPLY_ROLE_ARN --body "${module.apply_role.arn}"
  EOT
}
