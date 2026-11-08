data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  ssm_prefix = "/${var.context.project}/${var.context.environment}/lab"
}

data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lab" {
  name               = "${var.context.prefix}-lab-instance"
  description        = "k3s lab node: SSM Session Manager, CloudWatch read (Grafana), write own bootstrap secrets"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.lab.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

data "aws_iam_policy_document" "lab" {
  statement {
    sid = "GrafanaCloudWatchRead"
    actions = [
      "cloudwatch:DescribeAlarmsForMetric",
      "cloudwatch:DescribeAlarmHistory",
      "cloudwatch:DescribeAlarms",
      "cloudwatch:ListMetrics",
      "cloudwatch:GetMetricStatistics",
      "cloudwatch:GetMetricData",
      "ec2:DescribeTags",
      "ec2:DescribeInstances",
      "ec2:DescribeRegions",
      "tag:GetResources",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "WriteBootstrapSecrets"
    actions   = ["ssm:PutParameter"]
    resources = ["arn:aws:ssm:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:parameter${local.ssm_prefix}/*"]
  }
}

resource "aws_iam_role_policy" "lab" {
  name   = "lab-permissions"
  role   = aws_iam_role.lab.id
  policy = data.aws_iam_policy_document.lab.json
}

resource "aws_iam_instance_profile" "lab" {
  name = "${var.context.prefix}-lab-instance"
  role = aws_iam_role.lab.name
}
