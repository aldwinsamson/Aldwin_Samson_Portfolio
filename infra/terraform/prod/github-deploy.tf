# Least-privilege role used by .github/workflows/deploy.yml to publish the site.
# It can ONLY write to this one bucket and invalidate this one distribution —
# it cannot touch IAM, DNS, EC2 or anything else.
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

data "aws_iam_policy_document" "site_deploy_trust" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Only workflow runs on the main branch of this repository.
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repository}:ref:refs/heads/main"]
    }
  }
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

resource "aws_iam_role" "site_deploy" {
  name                 = "${var.project}-gha-site-deploy"
  description          = "GitHub Actions (main branch): publish the built site to S3 and invalidate CloudFront"
  assume_role_policy   = data.aws_iam_policy_document.site_deploy_trust.json
  max_session_duration = 3600
}

resource "aws_iam_role_policy" "site_deploy" {
  name   = "deploy-site"
  role   = aws_iam_role.site_deploy.id
  policy = data.aws_iam_policy_document.site_deploy.json
}
