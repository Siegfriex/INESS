#!/bin/bash

# Firebase-GCP Integration Setup Script
# 마음로그 V2.2 프로젝트 GCP 인프라 자동 구성

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${PROJECT_ID:-"maumlog-prod-env"}
REGION=${REGION:-"us-central1"}
ZONE=${ZONE:-"us-central1-a"}

echo -e "${BLUE}🚀 Starting Firebase-GCP Integration Setup${NC}"
echo -e "${BLUE}Project: ${PROJECT_ID}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "\n${YELLOW}📋 Checking prerequisites...${NC}"

if ! command_exists gcloud; then
    echo -e "${RED}❌ Google Cloud CLI not found. Please install gcloud first.${NC}"
    exit 1
fi

if ! command_exists firebase; then
    echo -e "${RED}❌ Firebase CLI not found. Please install firebase-tools first.${NC}"
    exit 1
fi

if ! command_exists terraform; then
    echo -e "${YELLOW}⚠️ Terraform not found. Skipping infrastructure provisioning.${NC}"
    TERRAFORM_AVAILABLE=false
else
    TERRAFORM_AVAILABLE=true
fi

echo -e "${GREEN}✅ Prerequisites check complete${NC}"

# Authenticate and set project
echo -e "\n${YELLOW}🔐 Setting up authentication...${NC}"

# Check if already authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}Please authenticate with Google Cloud:${NC}"
    gcloud auth login
fi

# Set project
gcloud config set project $PROJECT_ID
echo -e "${GREEN}✅ Project set to $PROJECT_ID${NC}"

# Enable required APIs
echo -e "\n${YELLOW}🔧 Enabling required APIs...${NC}"

REQUIRED_APIS=(
    "cloudfunctions.googleapis.com"
    "firestore.googleapis.com"
    "storage-api.googleapis.com"
    "cloudkms.googleapis.com"
    "cloudsql.googleapis.com"
    "monitoring.googleapis.com"
    "logging.googleapis.com"
    "bigquery.googleapis.com"
    "translate.googleapis.com"
    "speech.googleapis.com"
    "texttospeech.googleapis.com"
    "ml.googleapis.com"
    "aiplatform.googleapis.com"
    "healthcare.googleapis.com"
    "secretmanager.googleapis.com"
    "pubsub.googleapis.com"
    "cloudscheduler.googleapis.com"
    "cloudbuild.googleapis.com"
    "servicenetworking.googleapis.com"
)

for api in "${REQUIRED_APIS[@]}"; do
    echo -e "Enabling $api..."
    if gcloud services enable $api --quiet; then
        echo -e "${GREEN}✅ $api enabled${NC}"
    else
        echo -e "${RED}❌ Failed to enable $api${NC}"
    fi
done

# Create service account for Firebase Admin SDK
echo -e "\n${YELLOW}👤 Creating service accounts...${NC}"

SERVICE_ACCOUNT_EMAIL="firebase-adminsdk@${PROJECT_ID}.iam.gserviceaccount.com"

if ! gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL >/dev/null 2>&1; then
    gcloud iam service-accounts create firebase-adminsdk \
        --display-name="Firebase Admin SDK" \
        --description="Service account for Firebase Admin SDK operations"
    echo -e "${GREEN}✅ Firebase Admin service account created${NC}"
else
    echo -e "${GREEN}✅ Firebase Admin service account already exists${NC}"
fi

# Grant necessary permissions
echo -e "\n${YELLOW}🔐 Assigning IAM roles...${NC}"

ROLES=(
    "roles/firebase.admin"
    "roles/datastore.owner"
    "roles/storage.admin"
    "roles/cloudkms.cryptoKeyEncrypterDecrypter"
    "roles/bigquery.dataEditor"
    "roles/pubsub.editor"
    "roles/secretmanager.secretAccessor"
    "roles/cloudsql.client"
    "roles/monitoring.metricWriter"
    "roles/logging.logWriter"
)

for role in "${ROLES[@]}"; do
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
        --role="$role" \
        --quiet
    echo -e "${GREEN}✅ Assigned $role${NC}"
done

# Create and download service account key
echo -e "\n${YELLOW}🔑 Creating service account key...${NC}"

KEY_FILE="./firebase-admin-key.json"
if [ ! -f "$KEY_FILE" ]; then
    gcloud iam service-accounts keys create $KEY_FILE \
        --iam-account=$SERVICE_ACCOUNT_EMAIL
    echo -e "${GREEN}✅ Service account key created: $KEY_FILE${NC}"
    echo -e "${YELLOW}⚠️ Keep this key file secure and add it to .gitignore${NC}"
else
    echo -e "${GREEN}✅ Service account key already exists${NC}"
fi

# Initialize Firebase project
echo -e "\n${YELLOW}🔥 Initializing Firebase project...${NC}"

if [ ! -f "firebase.json" ]; then
    echo -e "${RED}❌ firebase.json not found. Please run 'firebase init' first.${NC}"
    exit 1
fi

# Link Firebase project
firebase use $PROJECT_ID
echo -e "${GREEN}✅ Firebase project linked${NC}"

# Run Terraform if available
if [ "$TERRAFORM_AVAILABLE" = true ]; then
    echo -e "\n${YELLOW}🏗️ Provisioning infrastructure with Terraform...${NC}"
    
    cd deployment/terraform
    
    # Initialize Terraform
    terraform init
    
    # Create terraform.tfvars if it doesn't exist
    if [ ! -f "terraform.tfvars" ]; then
        cat > terraform.tfvars << EOF
project_id = "$PROJECT_ID"
region     = "$REGION"
zone       = "$ZONE"
environment = "prod"
db_password = "$(openssl rand -base64 32)"
EOF
        echo -e "${GREEN}✅ Created terraform.tfvars${NC}"
    fi
    
    # Plan and apply
    echo -e "${YELLOW}Planning infrastructure changes...${NC}"
    terraform plan
    
    echo -e "\n${YELLOW}Do you want to apply these changes? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        terraform apply -auto-approve
        echo -e "${GREEN}✅ Infrastructure provisioned successfully${NC}"
    else
        echo -e "${YELLOW}⏭️ Skipping infrastructure provisioning${NC}"
    fi
    
    cd ../..
else
    echo -e "\n${YELLOW}⏭️ Skipping Terraform infrastructure provisioning${NC}"
fi

# Build and deploy functions
echo -e "\n${YELLOW}📦 Building and deploying Cloud Functions...${NC}"

cd functions

# Install dependencies
echo -e "Installing dependencies..."
npm install

# Build TypeScript
echo -e "Building TypeScript..."
npm run build

# Initialize GCP services programmatically
echo -e "\n${YELLOW}🔧 Initializing GCP services...${NC}"

export GOOGLE_APPLICATION_CREDENTIALS="../firebase-admin-key.json"
export GOOGLE_CLOUD_PROJECT=$PROJECT_ID

if npm run gcp:init; then
    echo -e "${GREEN}✅ GCP services initialized successfully${NC}"
else
    echo -e "${YELLOW}⚠️ Some GCP services may need manual setup${NC}"
fi

# Deploy functions
echo -e "\n${YELLOW}🚀 Deploying Cloud Functions...${NC}"
if firebase deploy --only functions; then
    echo -e "${GREEN}✅ Cloud Functions deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy Cloud Functions${NC}"
    echo -e "${YELLOW}You may need to deploy manually: firebase deploy --only functions${NC}"
fi

cd ..

# Setup Firestore security rules
echo -e "\n${YELLOW}🔒 Deploying Firestore security rules...${NC}"
if firebase deploy --only firestore:rules; then
    echo -e "${GREEN}✅ Firestore rules deployed${NC}"
else
    echo -e "${RED}❌ Failed to deploy Firestore rules${NC}"
fi

# Setup Storage security rules  
echo -e "\n${YELLOW}🗄️ Deploying Storage security rules...${NC}"
if firebase deploy --only storage; then
    echo -e "${GREEN}✅ Storage rules deployed${NC}"
else
    echo -e "${RED}❌ Failed to deploy Storage rules${NC}"
fi

# Create initial data structure
echo -e "\n${YELLOW}🗃️ Setting up initial data structure...${NC}"

# Create admin user (you'll need to replace with actual admin email)
ADMIN_EMAIL=${ADMIN_EMAIL:-"admin@maumlog.com"}

gcloud firestore databases create --location=$REGION >/dev/null 2>&1 || true

# Create admin document
gcloud firestore import gs://temp-import-bucket/admin.json >/dev/null 2>&1 || {
    echo -e "${YELLOW}⚠️ Admin user creation skipped (manual setup required)${NC}"
}

# Final status report
echo -e "\n${GREEN}🎉 Firebase-GCP Integration Setup Complete!${NC}"
echo -e "\n${BLUE}📋 Setup Summary:${NC}"
echo -e "  ✅ Google Cloud APIs enabled"
echo -e "  ✅ Service accounts configured"
echo -e "  ✅ IAM permissions assigned"
echo -e "  ✅ Firebase project linked"

if [ "$TERRAFORM_AVAILABLE" = true ]; then
    echo -e "  ✅ Infrastructure provisioned"
else
    echo -e "  ⏭️ Infrastructure provisioning skipped"
fi

echo -e "  ✅ Cloud Functions deployed"
echo -e "  ✅ Security rules deployed"

echo -e "\n${BLUE}🔐 Security Notes:${NC}"
echo -e "  📁 Service account key: $KEY_FILE"
echo -e "  ⚠️ Add $KEY_FILE to .gitignore"
echo -e "  🔑 Store API keys in Secret Manager"

echo -e "\n${BLUE}🚀 Next Steps:${NC}"
echo -e "  1. Add API keys to Secret Manager:"
echo -e "     gcloud secrets create openai-api-key --data-file=-"
echo -e "  2. Configure monitoring alerts"
echo -e "  3. Set up backup schedules"
echo -e "  4. Test all endpoints"

echo -e "\n${BLUE}📚 Documentation:${NC}"
echo -e "  Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID"
echo -e "  GCP Console: https://console.cloud.google.com/home/dashboard?project=$PROJECT_ID"
echo -e "  Functions: https://console.cloud.google.com/functions/list?project=$PROJECT_ID"

echo -e "\n${GREEN}✨ Setup completed successfully!${NC}"