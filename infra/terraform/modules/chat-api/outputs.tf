output "chat_api_url" {
  description = "Full URL the browser calls. Use as VITE_CHAT_API_URL for the AWS build."
  value       = "${aws_apigatewayv2_api.chat.api_endpoint}/chat"
}

output "chat_api_origin" {
  description = "Origin to add to the site's CSP (site.csp.connect_hosts) when the browser calls this API cross-origin."
  value       = aws_apigatewayv2_api.chat.api_endpoint
}

output "ssm_parameter_name" {
  description = "Create this SecureString parameter with the AWS CLI before the first apply."
  value       = local.ssm_parameter
}

output "lambda_function_name" {
  value = aws_lambda_function.chat.function_name
}
