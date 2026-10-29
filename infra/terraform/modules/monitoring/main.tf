# Everything here is in us-east-1 because that is where CloudFront and Route 53
# publish their CloudWatch metrics.

# Not KMS-encrypted on purpose: CloudWatch alarms cannot publish to a topic that uses
# the AWS-managed SNS key, and these messages contain no sensitive data.
resource "aws_sns_topic" "alerts" {
  provider = aws.use1
  name     = "${var.context.prefix}-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  provider  = aws.use1
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# --- Uptime: probes https://<domain>/ from 6 AWS regions around the world ---------------
resource "aws_route53_health_check" "site" {
  count = var.health_check.enabled ? 1 : 0

  fqdn              = var.domain_name
  port              = 443
  type              = "HTTPS"
  resource_path     = var.health_check.path
  request_interval  = var.health_check.interval_seconds
  failure_threshold = var.health_check.failure_threshold
  enable_sni        = true
  regions           = var.health_check.regions

  tags = {
    Name = "${var.context.prefix}-site"
  }
}

resource "aws_cloudwatch_metric_alarm" "site_down" {
  provider = aws.use1
  count    = var.health_check.enabled ? 1 : 0

  alarm_name          = "${var.context.prefix}-site-down"
  alarm_description   = "https://${var.domain_name} failed its Route 53 health check from multiple regions."
  namespace           = "AWS/Route53"
  metric_name         = "HealthCheckStatus"
  dimensions          = { HealthCheckId = aws_route53_health_check.site[0].id }
  statistic           = "Minimum"
  period              = 60
  evaluation_periods  = 2
  threshold           = 1
  comparison_operator = "LessThanThreshold"
  treat_missing_data  = "breaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
}

# --- Errors served to visitors ------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "cloudfront_5xx" {
  provider = aws.use1

  alarm_name          = "${var.context.prefix}-cloudfront-5xx"
  alarm_description   = "More than ${var.error_rate_5xx_threshold_percent}% of CloudFront responses are 5xx."
  namespace           = "AWS/CloudFront"
  metric_name         = "5xxErrorRate"
  dimensions          = { DistributionId = var.distribution_id, Region = "Global" }
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 3
  datapoints_to_alarm = 2
  threshold           = var.error_rate_5xx_threshold_percent
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching" # no traffic == no errors
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
}

# --- Dashboard ------------------------------------------------------------------------------
resource "aws_cloudwatch_dashboard" "site" {
  provider = aws.use1

  dashboard_name = "${var.context.prefix}-site"

  dashboard_body = jsonencode({
    widgets = concat(
      [
        {
          type = "metric", x = 0, y = 0, width = 12, height = 6
          properties = {
            title  = "Requests (5 min)"
            region = "us-east-1"
            view   = "timeSeries"
            stat   = "Sum"
            period = 300
            metrics = [
              ["AWS/CloudFront", "Requests", "DistributionId", var.distribution_id, "Region", "Global"],
            ]
          }
        },
        {
          type = "metric", x = 12, y = 0, width = 12, height = 6
          properties = {
            title  = "Data served (bytes, 5 min)"
            region = "us-east-1"
            view   = "timeSeries"
            stat   = "Sum"
            period = 300
            metrics = [
              ["AWS/CloudFront", "BytesDownloaded", "DistributionId", var.distribution_id, "Region", "Global"],
            ]
          }
        },
        {
          type = "metric", x = 0, y = 6, width = 12, height = 6
          properties = {
            title  = "Error rate (%)"
            region = "us-east-1"
            view   = "timeSeries"
            stat   = "Average"
            period = 300
            metrics = [
              ["AWS/CloudFront", "4xxErrorRate", "DistributionId", var.distribution_id, "Region", "Global"],
              ["AWS/CloudFront", "5xxErrorRate", "DistributionId", var.distribution_id, "Region", "Global"],
              ["AWS/CloudFront", "TotalErrorRate", "DistributionId", var.distribution_id, "Region", "Global"],
            ]
          }
        },
      ],
      var.health_check.enabled ? [
        {
          type = "metric", x = 12, y = 6, width = 12, height = 6
          properties = {
            title  = "Uptime (Route 53 health check, 1 = healthy)"
            region = "us-east-1"
            view   = "timeSeries"
            stat   = "Minimum"
            period = 60
            yAxis  = { left = { min = 0, max = 1 } }
            metrics = [
              ["AWS/Route53", "HealthCheckStatus", "HealthCheckId", aws_route53_health_check.site[0].id],
            ]
          }
        },
      ] : []
    )
  })
}
