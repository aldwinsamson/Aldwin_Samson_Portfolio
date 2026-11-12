output "chat_api_url" {
  value       = "${aws_apigatewayv2_api.chat.api_endpoint}/chat"
}

output "chat_api_origin" {
  value       = aws_apigatewayv2_api.chat.api_endpoint
}

output "ssm_parameter_name" {
  value       = local.ssm_parameter
}

output "lambda_function_name" {
  value = aws_lambda_function.chat.function_name
}
