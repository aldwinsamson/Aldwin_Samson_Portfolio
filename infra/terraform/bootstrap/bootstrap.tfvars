# Bootstrap-only settings. Identity values (project, domain, region, repo, e-mail...) come from ../environment.tfvars.
github_environments     = ["production"] # GitHub Environments that must approve `terraform apply`
additional_environments = []             # e.g. ["staging"] once you add environments/staging
monthly_budget_usd      = 30
