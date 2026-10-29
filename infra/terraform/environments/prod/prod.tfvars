# Settings for the prod environment (safe to commit). Identity values come from ../../environment.tfvars.

site = {
  include_www  = true
  price_class  = "PriceClass_All" # every edge location, incl. Manila
  hsts_preload = false

  csp = {
    # "report-only" first so nothing can break. Flip to "enforce" once the browser console shows no CSP
    # reports on every page, in both themes.
    mode        = "report-only"
    style_hosts = ["https://fonts.googleapis.com"]
    font_hosts  = ["https://fonts.gstatic.com"]
    img_hosts   = ["https://images.pexels.com"]
  }
}

monitoring = {
  health_check_enabled             = true
  error_rate_5xx_threshold_percent = 5
}

# Step 1 (day 1): website + monitoring only (lab.enabled = false).  Step 2: set enabled = true (see infra/README.md).
lab = {
  enabled        = false
  instance_type  = "t4g.small" # Free-plan eligible; see infra/README.md before choosing a bigger one
  root_volume_gb = 30
  schedule = {
    enabled    = true
    timezone   = "Asia/Manila"
    stop_cron  = "cron(0 23 * * ? *)"
    start_cron = "cron(0 7 * * ? *)"
  }
}
