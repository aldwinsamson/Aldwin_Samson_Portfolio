# =============================================================================
# Account-level foundation. Applied once, locally, by an admin. Everything else is applied by CI.
#   1. remote state bucket   2. DNS zone   3. GitHub OIDC provider + CI roles   4. budget alerts
# =============================================================================

# ---- 1. Remote state (used by environments/*) ---------------------------------------------------------
module "state_bucket" {
  source = "../modules/secure-s3-bucket"

  bucket_name                        = local.state_bucket
  noncurrent_version_expiration_days = 90
}

data "aws_iam_policy_document" "state_bucket" {
  source_policy_documents = [module.state_bucket.tls_only_policy_json]

  # A state bucket must never be deleted by accident (not even by an admin running terraform destroy).
  statement {
    sid       = "DenyBucketDeletion"
    effect    = "Deny"
    actions   = ["s3:DeleteBucket"]
    resources = [module.state_bucket.arn]

    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket_policy" "state" {
  bucket = module.state_bucket.id
  policy = data.aws_iam_policy_document.state_bucket.json

  depends_on = [module.state_bucket]
}

# ---- 2. DNS: the hosted zone lives here so its name servers never change when an environment is rebuilt ----
resource "aws_route53_zone" "primary" {
  name    = var.domain_name
  comment = "Public zone for ${var.domain_name} (managed by the bootstrap stack)"

  lifecycle {
    prevent_destroy = true
  }
}

# ---- 3. GitHub Actions -> AWS with OIDC (no long-lived access keys anywhere) --------------------------------
resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

# Plan role: pull requests only, read-only.
data "aws_iam_policy_document" "plan_state_access" {
  statement {
    sid       = "ListStateBucket"
    actions   = ["s3:ListBucket"]
    resources = [module.state_bucket.arn]
  }

  statement {
    sid       = "ReadState"
    actions   = ["s3:GetObject"]
    resources = [for e in local.state_prefixes : "${module.state_bucket.arn}/${e}/*"]
  }

  # Native S3 locking writes/deletes a .tflock object next to the state file.
  statement {
    sid       = "LockState"
    actions   = ["s3:PutObject", "s3:DeleteObject"]
    resources = [for e in local.state_prefixes : "${module.state_bucket.arn}/${e}/terraform.tfstate.tflock"]
  }
}

module "plan_role" {
  source = "../modules/github-oidc-role"

  name                = "${local.context.prefix}-gha-terraform-plan"
  description         = "GitHub Actions: terraform plan on pull requests (read-only)"
  oidc_provider_arn   = aws_iam_openid_connect_provider.github.arn
  subjects            = ["repo:${var.github_repository}:pull_request"]
  managed_policy_arns = ["arn:aws:iam::aws:policy/ReadOnlyAccess"]
  inline_policy_json  = data.aws_iam_policy_document.plan_state_access.json
}

# Apply role: ONLY from the protected GitHub Environment (required reviewer = you).
# PowerUser + IAM limited to this project's name prefix. Anything that can create IAM roles is effectively
# admin; the real guard is the Environment approval + the OIDC `sub` pinned to it.
data "aws_iam_policy_document" "apply_extra" {
  statement {
    sid = "ManageProjectIam"
    actions = [
      "iam:CreateRole", "iam:DeleteRole", "iam:GetRole", "iam:UpdateRole", "iam:UpdateAssumeRolePolicy",
      "iam:TagRole", "iam:UntagRole", "iam:PassRole",
      "iam:AttachRolePolicy", "iam:DetachRolePolicy", "iam:PutRolePolicy", "iam:DeleteRolePolicy",
      "iam:GetRolePolicy", "iam:ListRolePolicies", "iam:ListAttachedRolePolicies",
      "iam:ListInstanceProfilesForRole",
      "iam:CreateInstanceProfile", "iam:DeleteInstanceProfile", "iam:GetInstanceProfile",
      "iam:AddRoleToInstanceProfile", "iam:RemoveRoleFromInstanceProfile", "iam:TagInstanceProfile",
      "iam:CreatePolicy", "iam:DeletePolicy", "iam:GetPolicy", "iam:GetPolicyVersion",
      "iam:ListPolicyVersions", "iam:CreatePolicyVersion", "iam:DeletePolicyVersion", "iam:TagPolicy",
    ]
    resources = [
      "arn:aws:iam::${local.account_id}:role/${var.project}-*",
      "arn:aws:iam::${local.account_id}:instance-profile/${var.project}-*",
      "arn:aws:iam::${local.account_id}:policy/${var.project}-*",
    ]
  }

  statement {
    sid       = "ReadOidcProvider"
    actions   = ["iam:GetOpenIDConnectProvider", "iam:ListOpenIDConnectProviders"]
    resources = ["*"]
  }

  statement {
    sid       = "ServiceLinkedRoles"
    actions   = ["iam:CreateServiceLinkedRole"]
    resources = ["arn:aws:iam::${local.account_id}:role/aws-service-role/*"]
  }

  statement {
    sid       = "ListStateBucket"
    actions   = ["s3:ListBucket"]
    resources = [module.state_bucket.arn]
  }

  statement {
    sid       = "ReadWriteEnvironmentState"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = [for e in local.state_prefixes : "${module.state_bucket.arn}/${e}/*"]
  }
}

module "apply_role" {
  source = "../modules/github-oidc-role"

  name                = "${local.context.prefix}-gha-terraform-apply"
  description         = "GitHub Actions: terraform apply (only from the protected GitHub Environments: ${join(", ", var.github_environments)})"
  oidc_provider_arn   = aws_iam_openid_connect_provider.github.arn
  subjects            = [for e in var.github_environments : "repo:${var.github_repository}:environment:${e}"]
  managed_policy_arns = ["arn:aws:iam::aws:policy/PowerUserAccess"]
  inline_policy_json  = data.aws_iam_policy_document.apply_extra.json
}

# ---- 4. Cost guard-rails -----------------------------------------------------------------------------------------
module "budget" {
  source = "../modules/budget-alerts"

  name      = "${local.context.prefix}-monthly-gross-usage"
  limit_usd = var.monthly_budget_usd
  emails    = [var.alert_email]
}
