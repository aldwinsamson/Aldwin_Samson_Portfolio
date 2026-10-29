# Stop the node overnight and start it in the morning (generic, reusable module).
module "schedule" {
  count  = var.schedule.enabled ? 1 : 0
  source = "../instance-scheduler"

  name_prefix  = "${var.context.prefix}-lab"
  instance_ids = [aws_instance.lab.id]
  timezone     = var.schedule.timezone
  stop_cron    = var.schedule.stop_cron
  start_cron   = var.schedule.start_cron
}
