site = {
  include_www  = true
  price_class  = "PriceClass_All" 
  hsts_preload = false

  csp = {
    mode        = "enforce"
    style_hosts = ["https://fonts.googleapis.com"]
    font_hosts  = ["https://fonts.gstatic.com"]
    img_hosts   = ["https://images.pexels.com"]
  }
}

monitoring = {
  health_check_enabled             = true
  error_rate_5xx_threshold_percent = 5
}

lab = {
  enabled        = false
  instance_type  = "t4g.small"
  root_volume_gb = 30
  schedule = {
    enabled    = true
    timezone   = "Asia/Manila"
    stop_cron  = "cron(0 23 * * ? *)"
    start_cron = "cron(0 7 * * ? *)"
  }
}

hosting = {
  target = "vercel"
  vercel = {
    ipv4 = ["216.198.79.1"]
    ttl  = 60
  }
}
