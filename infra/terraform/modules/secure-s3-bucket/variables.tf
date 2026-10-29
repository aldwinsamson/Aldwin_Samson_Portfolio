variable "bucket_name" {
  description = "Globally unique bucket name."
  type        = string
}

variable "force_destroy" {
  description = "Allow `terraform destroy` to delete a non-empty bucket. Keep false for anything that matters."
  type        = bool
  default     = false
}

variable "noncurrent_version_expiration_days" {
  description = "Old object versions are deleted after this many days (versioning is always on)."
  type        = number
  default     = 30
}
