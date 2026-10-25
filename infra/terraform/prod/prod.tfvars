# Non-secret settings for the prod stack (safe to commit).
project           = "aldwinsamson"
region            = "ap-southeast-1"
domain_name       = "aldwinsamson.com"
github_repository = "aldwinsamson/Aldwin_Samson_Portfolio"
alert_email       = "aldwinsamsonn@gmail.com"

# Step 1 (day 1): website + monitoring only.   Step 2: set enable_lab = true (see infra/README.md).
enable_lab           = false
lab_instance_type    = "t4g.small"
lab_schedule_enabled = true
gitops_repo_url      = "https://github.com/aldwinsamson/Aldwin_Samson_Portfolio.git"
gitops_revision      = "main"

# Flip to "enforce" once the browser console shows no CSP reports on every page, in both themes.
csp_mode = "report-only"
