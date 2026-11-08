data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  name          = "${var.context.prefix}-chat"
  ssm_parameter = coalesce(var.ssm_parameter_name, "/${var.context.project}/${var.context.environment}/chat/anthropic-api-key")
}

data "archive_file" "chat" {
  type        = "zip"
  source_dir  = var.source_dir
  output_path = "${path.module}/.build/${local.name}.zip"
  output_file_mode = "0666"
  excludes         = ["adapters", "selftest.mjs", "core.test.mjs"]
}

resource "aws_iam_role" "chat" {
  name = "${local.name}-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "logs" {
  role       = aws_iam_role.chat.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "read_key" {
  name = "read-anthropic-key"
  role = aws_iam_role.chat.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ssm:GetParameter"]
      Resource = "arn:aws:ssm:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:parameter${local.ssm_parameter}"
    }]
  })
}

resource "aws_cloudwatch_log_group" "chat" {
  name              = "/aws/lambda/${local.name}"
  retention_in_days = var.log_retention_days
}

resource "aws_lambda_function" "chat" {
  function_name = local.name
  role          = aws_iam_role.chat.arn
  runtime       = "nodejs22.x"
  handler       = "lambda.handler"
  architectures = ["arm64"]
  memory_size   = var.memory_size
  timeout       = var.timeout

  filename         = data.archive_file.chat.output_path
  source_code_hash = data.archive_file.chat.output_base64sha256

  environment {
    variables = {
      ANTHROPIC_API_KEY_PARAM = local.ssm_parameter
      CLAUDE_MODEL            = var.model
      ALLOWED_ORIGINS         = join(",", var.allowed_origins)
    }
  }

  depends_on = [aws_cloudwatch_log_group.chat, aws_iam_role_policy_attachment.logs]
}

resource "aws_apigatewayv2_api" "chat" {
  name          = local.name
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = var.allowed_origins
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["content-type"]
    max_age       = 86400
  }
}

resource "aws_apigatewayv2_integration" "chat" {
  api_id                 = aws_apigatewayv2_api.chat.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.chat.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "chat" {
  api_id    = aws_apigatewayv2_api.chat.id
  route_key = "POST /chat"
  target    = "integrations/${aws_apigatewayv2_integration.chat.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.chat.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_rate_limit  = var.throttle_rate_limit
    throttling_burst_limit = var.throttle_burst_limit
  }
}

resource "aws_lambda_permission" "api" {
  statement_id  = "AllowInvokeFromApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.chat.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.chat.execution_arn}/*/*"
}

resource "aws_cloudwatch_metric_alarm" "invocations" {
  count = var.alarm_topic_arn == null ? 0 : 1

  alarm_name          = "${local.name}-high-invocations"
  alarm_description   = "The portfolio chat Lambda ran more than ${var.daily_invocation_alarm} times in a day."
  namespace           = "AWS/Lambda"
  metric_name         = "Invocations"
  dimensions          = { FunctionName = aws_lambda_function.chat.function_name }
  statistic           = "Sum"
  period              = 86400
  evaluation_periods  = 1
  threshold           = var.daily_invocation_alarm
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [var.alarm_topic_arn]
}
