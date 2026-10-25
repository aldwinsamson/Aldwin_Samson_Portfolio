# Native EventBridge Scheduler -> EC2 API calls. No Lambda, no extra cost (14M free invocations/month).
data "aws_iam_policy_document" "scheduler_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["scheduler.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [data.aws_caller_identity.current.account_id]
    }
  }
}

data "aws_iam_policy_document" "scheduler_permissions" {
  statement {
    actions   = ["ec2:StartInstances", "ec2:StopInstances"]
    resources = ["arn:aws:ec2:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:instance/${aws_instance.lab.id}"]
  }
}

resource "aws_iam_role" "scheduler" {
  count = var.schedule_enabled ? 1 : 0

  name               = "${var.project}-lab-scheduler"
  assume_role_policy = data.aws_iam_policy_document.scheduler_assume.json
}

resource "aws_iam_role_policy" "scheduler" {
  count = var.schedule_enabled ? 1 : 0

  name   = "start-stop-lab"
  role   = aws_iam_role.scheduler[0].id
  policy = data.aws_iam_policy_document.scheduler_permissions.json
}

resource "aws_scheduler_schedule" "stop" {
  count = var.schedule_enabled ? 1 : 0

  name                         = "${var.project}-lab-stop"
  description                  = "Stop the k3s lab overnight"
  schedule_expression          = var.schedule_stop_cron
  schedule_expression_timezone = var.schedule_timezone

  flexible_time_window {
    mode = "OFF"
  }

  target {
    arn      = "arn:aws:scheduler:::aws-sdk:ec2:stopInstances"
    role_arn = aws_iam_role.scheduler[0].arn
    input    = jsonencode({ InstanceIds = [aws_instance.lab.id] })
  }
}

resource "aws_scheduler_schedule" "start" {
  count = var.schedule_enabled ? 1 : 0

  name                         = "${var.project}-lab-start"
  description                  = "Start the k3s lab in the morning"
  schedule_expression          = var.schedule_start_cron
  schedule_expression_timezone = var.schedule_timezone

  flexible_time_window {
    mode = "OFF"
  }

  target {
    arn      = "arn:aws:scheduler:::aws-sdk:ec2:startInstances"
    role_arn = aws_iam_role.scheduler[0].arn
    input    = jsonencode({ InstanceIds = [aws_instance.lab.id] })
  }
}
