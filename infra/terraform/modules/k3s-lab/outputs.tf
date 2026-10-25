locals {
  region = data.aws_region.current.region
  tunnel = "aws ssm start-session --region ${local.region} --target ${aws_instance.lab.id} --document-name AWS-StartPortForwardingSessionToRemoteHost"
}

output "instance_id" {
  value = aws_instance.lab.id
}

output "connect_commands" {
  description = "Requires the AWS CLI + Session Manager plugin on your laptop. No SSH, no open ports."
  value = {
    shell            = "aws ssm start-session --region ${local.region} --target ${aws_instance.lab.id}"
    bootstrap_log    = "sudo tail -f /var/log/lab-bootstrap.log   # run inside the shell session"
    argocd_ui        = "${local.tunnel} --parameters '{\"host\":[\"${aws_instance.lab.private_ip}\"],\"portNumber\":[\"30080\"],\"localPortNumber\":[\"8080\"]}'   # then open http://localhost:8080"
    grafana_ui       = "${local.tunnel} --parameters '{\"host\":[\"${aws_instance.lab.private_ip}\"],\"portNumber\":[\"30300\"],\"localPortNumber\":[\"3000\"]}'   # then open http://localhost:3000"
    prometheus_ui    = "${local.tunnel} --parameters '{\"host\":[\"${aws_instance.lab.private_ip}\"],\"portNumber\":[\"30900\"],\"localPortNumber\":[\"9090\"]}'   # then open http://localhost:9090"
    portfolio_stage  = "${local.tunnel} --parameters '{\"host\":[\"${aws_instance.lab.private_ip}\"],\"portNumber\":[\"30081\"],\"localPortNumber\":[\"8081\"]}'   # then open http://localhost:8081"
    argocd_password  = "aws ssm get-parameter --region ${local.region} --name ${local.ssm_prefix}/argocd-admin-password --with-decryption --query Parameter.Value --output text"
    grafana_password = "aws ssm get-parameter --region ${local.region} --name ${local.ssm_prefix}/grafana-admin-password --with-decryption --query Parameter.Value --output text"
  }
}
