# Terraform configuration for Firebase-GCP integration
# Infrastructure as Code for MaumLog V2.2

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.0"
    }
  }
  
  backend "gcs" {
    bucket = "maumlog-terraform-state"
    prefix = "terraform/state"
  }
}

# Provider Configuration
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Variables
variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "maumlog-prod-env"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Environment (dev/staging/prod)"
  type        = string
  default     = "prod"
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "cloudfunctions.googleapis.com",
    "firestore.googleapis.com",
    "storage-api.googleapis.com",
    "cloudkms.googleapis.com",
    "cloudsql.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
    "bigquery.googleapis.com",
    "translate.googleapis.com",
    "speech.googleapis.com",
    "texttospeech.googleapis.com",
    "ml.googleapis.com",
    "aiplatform.googleapis.com",
    "healthcare.googleapis.com",
    "secretmanager.googleapis.com",
    "pubsub.googleapis.com",
    "cloudscheduler.googleapis.com",
    "cloudbuild.googleapis.com"
  ])

  project = var.project_id
  service = each.value

  disable_dependent_services = false
  disable_on_destroy        = false
}

# Cloud Storage Buckets
resource "google_storage_bucket" "user_data" {
  name     = "maumlog-user-data-${var.region}"
  location = var.region
  
  uniform_bucket_level_access = true
  
  encryption {
    default_kms_key_name = google_kms_crypto_key.user_data_key.id
  }
  
  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }
  
  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }
  
  lifecycle_rule {
    condition {
      age = 2555  # 7 years
    }
    action {
      type = "Delete"
    }
  }
  
  versioning {
    enabled = true
  }
}

resource "google_storage_bucket" "ai_models" {
  name     = "maumlog-ai-models-${var.region}"
  location = var.region
  
  uniform_bucket_level_access = true
  
  encryption {
    default_kms_key_name = google_kms_crypto_key.ai_model_key.id
  }
}

resource "google_storage_bucket" "backups" {
  name     = "maumlog-backups-${var.region}"
  location = var.region
  
  uniform_bucket_level_access = true
  
  encryption {
    default_kms_key_name = google_kms_crypto_key.backup_key.id
  }
  
  lifecycle_rule {
    condition {
      age = 7
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }
}

# Cloud KMS
resource "google_kms_key_ring" "main" {
  name     = "maumlog-encryption-keys"
  location = var.region
}

resource "google_kms_crypto_key" "user_data_key" {
  name     = "user-data-encryption"
  key_ring = google_kms_key_ring.main.id
  
  rotation_period = "7776000s"  # 90 days
  
  lifecycle {
    prevent_destroy = true
  }
}

resource "google_kms_crypto_key" "ai_model_key" {
  name     = "ai-model-encryption"
  key_ring = google_kms_key_ring.main.id
  
  rotation_period = "7776000s"  # 90 days
}

resource "google_kms_crypto_key" "backup_key" {
  name     = "backup-encryption"
  key_ring = google_kms_key_ring.main.id
  
  rotation_period = "7776000s"  # 90 days
}

resource "google_kms_crypto_key" "session_key" {
  name     = "session-encryption"
  key_ring = google_kms_key_ring.main.id
  
  rotation_period = "2592000s"  # 30 days
}

# BigQuery Datasets
resource "google_bigquery_dataset" "analytics" {
  dataset_id    = "analytics"
  friendly_name = "User Analytics and App Usage Metrics"
  description   = "Data for analyzing user behavior and app performance"
  location      = var.region
  
  default_encryption_configuration {
    kms_key_name = google_kms_crypto_key.user_data_key.id
  }
  
  access {
    role          = "OWNER"
    user_by_email = "firebase-adminsdk@${var.project_id}.iam.gserviceaccount.com"
  }
  
  access {
    role          = "WRITER"
    user_by_email = "analytics@${var.project_id}.iam.gserviceaccount.com"
  }
}

resource "google_bigquery_dataset" "ai_training" {
  dataset_id    = "ai_training"
  friendly_name = "AI Training Data"
  description   = "Anonymized data for AI model training and improvement"
  location      = var.region
  
  default_encryption_configuration {
    kms_key_name = google_kms_crypto_key.ai_model_key.id
  }
}

resource "google_bigquery_dataset" "compliance_logs" {
  dataset_id    = "compliance_logs"
  friendly_name = "Compliance and Audit Logs"
  description   = "Audit trails for compliance and security monitoring"
  location      = var.region
  
  default_encryption_configuration {
    kms_key_name = google_kms_crypto_key.user_data_key.id
  }
  
  # Longer retention for compliance
  default_table_expiration_ms = 315360000000  # 10 years
}

# Pub/Sub Topics and Subscriptions
resource "google_pubsub_topic" "emotion_analysis_queue" {
  name = "emotion-analysis-queue"
  
  kms_key_name = google_kms_crypto_key.session_key.id
}

resource "google_pubsub_subscription" "emotion_analysis_subscription" {
  name  = "emotion-analysis-subscription"
  topic = google_pubsub_topic.emotion_analysis_queue.name
  
  ack_deadline_seconds = 60
  
  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.dead_letter_queue.id
    max_delivery_attempts = 5
  }
  
  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }
}

resource "google_pubsub_topic" "crisis_alerts" {
  name = "crisis-alerts"
  
  kms_key_name = google_kms_crypto_key.session_key.id
}

resource "google_pubsub_subscription" "crisis_alerts_subscription" {
  name  = "crisis-alerts-subscription"
  topic = google_pubsub_topic.crisis_alerts.name
  
  ack_deadline_seconds = 30  # Faster for crisis handling
  
  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.dead_letter_queue.id
    max_delivery_attempts = 3  # Fewer retries for crisis
  }
}

resource "google_pubsub_topic" "dead_letter_queue" {
  name = "dead-letter-queue"
}

# Cloud SQL (PostgreSQL) for backup and analytics
resource "google_sql_database_instance" "postgres_main" {
  name             = "maumlog-postgres-main"
  database_version = "POSTGRES_14"
  region           = var.region
  
  settings {
    tier              = "db-f1-micro"  # Start small, can scale up
    availability_type = "REGIONAL"     # High availability
    disk_type         = "PD_SSD"
    disk_size         = 20
    disk_autoresize   = true
    
    backup_configuration {
      enabled                        = true
      start_time                     = "02:00"  # 2 AM backup
      location                       = var.region
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = 30
        retention_unit   = "COUNT"
      }
    }
    
    database_flags {
      name  = "log_statement"
      value = "all"
    }
    
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc_network.id
      require_ssl     = true
    }
  }
  
  deletion_protection = true
  
  depends_on = [google_service_networking_connection.private_vpc_connection]
}

resource "google_sql_database" "main_database" {
  name     = "maumlog_db"
  instance = google_sql_database_instance.postgres_main.name
}

resource "google_sql_user" "app_user" {
  name     = "maumlog_user"
  instance = google_sql_database_instance.postgres_main.name
  password = var.db_password
}

# VPC Network for private connections
resource "google_compute_network" "vpc_network" {
  name                    = "maumlog-vpc"
  auto_create_subnetworks = false
  mtu                     = 1460
}

resource "google_compute_subnetwork" "private_subnet" {
  name          = "maumlog-private-subnet"
  ip_cidr_range = "10.2.0.0/16"
  region        = var.region
  network       = google_compute_network.vpc_network.id
  
  private_ip_google_access = true
}

resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc_network.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

# Monitoring and Alerting
resource "google_monitoring_notification_channel" "email_alerts" {
  display_name = "Email Alerts"
  type         = "email"
  
  labels = {
    email_address = "alerts@maumlog.com"
  }
}

resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "High Error Rate"
  combiner     = "OR"
  
  conditions {
    display_name = "Cloud Function Error Rate > 5%"
    
    condition_threshold {
      filter          = "resource.type=\"cloud_function\""
      comparison      = "COMPARISON_GT"
      threshold_value = 0.05
      duration        = "300s"
      
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }
  
  notification_channels = [google_monitoring_notification_channel.email_alerts.id]
  
  alert_strategy {
    auto_close = "1800s"  # 30 minutes
  }
}

# Secret Manager for API keys
resource "google_secret_manager_secret" "api_keys" {
  for_each = toset([
    "openai-api-key",
    "claude-api-key",
    "gemini-api-key",
    "twilio-auth-token",
    "stripe-secret-key",
    "sendgrid-api-key"
  ])
  
  secret_id = each.value
  
  replication {
    automatic = true
  }
}

# IAM for Firebase Service Account
resource "google_project_iam_member" "firebase_kms_access" {
  project = var.project_id
  role    = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member  = "serviceAccount:firebase-adminsdk@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_project_iam_member" "firebase_storage_access" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:firebase-adminsdk@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_project_iam_member" "firebase_bigquery_access" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:firebase-adminsdk@${var.project_id}.iam.gserviceaccount.com"
}

# Outputs
output "storage_buckets" {
  value = {
    user_data  = google_storage_bucket.user_data.name
    ai_models  = google_storage_bucket.ai_models.name
    backups    = google_storage_bucket.backups.name
  }
}

output "bigquery_datasets" {
  value = {
    analytics       = google_bigquery_dataset.analytics.dataset_id
    ai_training     = google_bigquery_dataset.ai_training.dataset_id
    compliance_logs = google_bigquery_dataset.compliance_logs.dataset_id
  }
}

output "kms_keys" {
  value = {
    user_data = google_kms_crypto_key.user_data_key.id
    ai_model  = google_kms_crypto_key.ai_model_key.id
    backup    = google_kms_crypto_key.backup_key.id
    session   = google_kms_crypto_key.session_key.id
  }
}

output "sql_instance" {
  value = {
    connection_name = google_sql_database_instance.postgres_main.connection_name
    private_ip      = google_sql_database_instance.postgres_main.private_ip_address
  }
}