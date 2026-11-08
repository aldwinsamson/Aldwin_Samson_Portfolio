provider "aws" {
  region = var.region

  default_tags {
    tags = local.context.tags
  }
}

provider "aws" {
  alias  = "use1"
  region = "us-east-1"

  default_tags {
    tags = local.context.tags
  }
}
