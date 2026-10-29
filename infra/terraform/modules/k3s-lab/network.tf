data "aws_availability_zones" "available" {
  state = "available"
}

# A tiny dedicated VPC: one public subnet, no NAT gateway (a NAT costs ~US$32/month),
# and a security group with ZERO inbound rules. All admin access goes through SSM.
resource "aws_vpc" "lab" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.context.prefix}-lab"
  }
}

# Lock down the VPC's default security group (nothing in, nothing out).
resource "aws_default_security_group" "lab" {
  vpc_id = aws_vpc.lab.id

  tags = {
    Name = "${var.context.prefix}-lab-default-DO-NOT-USE"
  }
}

resource "aws_internet_gateway" "lab" {
  vpc_id = aws_vpc.lab.id

  tags = {
    Name = "${var.context.prefix}-lab"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.lab.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, 1)
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = false

  tags = {
    Name = "${var.context.prefix}-lab-public"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.lab.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.lab.id
  }

  tags = {
    Name = "${var.context.prefix}-lab-public"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "lab" {
  name        = "${var.context.prefix}-lab"
  description = "k3s lab node: no inbound; outbound only (SSM, package + image pulls)"
  vpc_id      = aws_vpc.lab.id

  tags = {
    Name = "${var.context.prefix}-lab"
  }
}

resource "aws_vpc_security_group_egress_rule" "all_out" {
  security_group_id = aws_security_group.lab.id
  description       = "Outbound to the internet (SSM, GitHub, container registries)"
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}
