output "chat_api_url" {
  description = "Put this in .env.production as VITE_CHAT_API_URL."
  value       = "${aws_apigatewayv2_api.chat.api_endpoint}/chat"
}

output "lambda_function_name" {
  description = "Name of the chat Lambda function."
  value       = aws_lambda_function.chat.function_name
}

output "log_group" {
  description = "CloudWatch log group with the request logs (no message text is logged)."
  value       = aws_cloudwatch_log_group.chat.name
}
