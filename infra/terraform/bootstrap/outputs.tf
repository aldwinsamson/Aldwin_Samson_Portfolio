output "name_servers" {
  description = "Set these 4 name servers at your domain registrar (custom DNS / nameservers)."
  value       = aws_route53_zone.primary.name_servers
}

output "hosted_zone_id" {
  value = aws_route53_zone.primary.zone_id
}

output "state_bucket" {
  description = "Pass to `terraform init -backend-config=bucket=...` in infra/terraform/prod."
  value       = aws_s3_bucket.tfstate.bucket
}

output "tf_plan_role_arn" {
  value = aws_iam_role.tf_plan.arn
}

output "tf_apply_role_arn" {
  value = aws_iam_role.tf_apply.arn
}

output "github_variables_commands" {
  description = "Run these (GitHub CLI) to configure the repository variables used by the workflows."
  value       = <<-EOT
    gh variable set AWS_REGION            --body "${var.region}"
    gh variable set TF_STATE_BUCKET       --body "${aws_s3_bucket.tfstate.bucket}"
    gh variable set AWS_TF_PLAN_ROLE_ARN  --body "${aws_iam_role.tf_plan.arn}"
    gh variable set AWS_TF_APPLY_ROLE_ARN --body "${aws_iam_role.tf_apply.arn}"
  EOT
}
