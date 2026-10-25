data "aws_ec2_instance_type" "this" {
  instance_type = var.instance_type
}

locals {
  arch = contains(data.aws_ec2_instance_type.this.supported_architectures, "arm64") ? "arm64" : "x86_64"
}

# Latest Amazon Linux 2023 AMI for the chosen architecture (resolved through the public SSM parameter).
data "aws_ssm_parameter" "al2023" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-${local.arch}"
}

resource "aws_instance" "lab" {
  ami                         = data.aws_ssm_parameter.al2023.value
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.lab.id]
  iam_instance_profile        = aws_iam_instance_profile.lab.name
  associate_public_ip_address = true  # needed for outbound internet without a NAT gateway
  monitoring                  = false # detailed (1-min) monitoring costs extra; 5-min basic metrics are enough here
  ebs_optimized               = true

  user_data = templatefile("${path.module}/templates/user-data.sh.tftpl", {
    region          = data.aws_region.current.region
    k3s_version     = var.k3s_version
    argocd_version  = var.argocd_version
    gitops_repo_url = var.gitops_repo_url
    gitops_revision = var.gitops_revision
    ssm_prefix      = local.ssm_prefix
  })
  user_data_replace_on_change = true

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required" # IMDSv2 only
    # Hop limit 2 lets pods (Grafana) reach the instance role through the node's metadata endpoint.
    http_put_response_hop_limit = 2
  }

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.root_volume_gb
    encrypted             = true
    delete_on_termination = true
  }

  tags = {
    Name = "${var.project}-lab"
  }

  lifecycle {
    # A newer AMI must not silently replace the node (and wipe Prometheus data) on the next plan.
    ignore_changes = [ami]
  }
}
