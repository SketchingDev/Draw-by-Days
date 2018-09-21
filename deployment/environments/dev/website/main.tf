provider "aws" {
  region = "us-east-1"
}

module "website" {
  source = "../../../modules/services/website"
  bucket_name = "draw-by-days-website"
}