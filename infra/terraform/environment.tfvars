# =============================================================================
# THE MAIN ENVIRONMENT FILE — single source of truth for identity & key values.
# Both stacks (bootstrap and environments/prod) read this file, and every resource
# name, tag, domain, region and e-mail in AWS is derived from it:
#
#   name prefix = "<project>-<environment>"   e.g. aldwinsamson-prod-site-<account>
#
# Change a value here and the whole infrastructure follows. Stack-specific knobs
# (sizes, toggles, schedules) live in bootstrap/bootstrap.tfvars and environments/prod/prod.tfvars.
# =============================================================================
project           = "aldwinsamson"
environment       = "prod"
region            = "ap-southeast-1" # Singapore: closest full AWS region to the Philippines
domain_name       = "aldwinsamson.com"
github_repository = "aldwinsamson/Aldwin_Samson_Portfolio" # OWNER/REPO, case-sensitive
alert_email       = "aldwinsamsonn@gmail.com"
owner             = "aldwinsamson"

# GitHub puts permanent numeric IDs in the OIDC identity (use_immutable_subject = true).
# Get it with: gh api repos/<owner>/<repo>/actions/oidc/customization/sub
github_oidc_subject_prefix = "repo:aldwinsamson@257675786/Aldwin_Samson_Portfolio@1412925839"
