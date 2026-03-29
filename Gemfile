source "https://rubygems.org"

gem "rails", "~> 8.1.3"
gem "pg", "~> 1.1"
gem "puma", ">= 5.0"

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: [:windows, :jruby]

# Database-backed adapters for Rails.cache, Active Job, and Action Cable
gem "solid_cache"
gem "solid_queue"
gem "solid_cable"

# Boot time caching
gem "bootsnap", require: false

# Deploy
gem "kamal", require: false
gem "thruster", require: false

# Auth
gem "devise"
gem "omniauth-google-oauth2"
gem "omniauth-rails_csrf_protection"

# Inertia + Vite
gem "inertia_rails"
gem "vite_rails"

# Sorbet
gem "sorbet-runtime"
gem "tapioca", require: false

# Background jobs
gem "sidekiq"

group :development, :test do
  gem "debug", platforms: [:mri, :windows], require: "debug/prelude"
  gem "bundler-audit", require: false
  gem "brakeman", require: false
  gem "rubocop-shopify", require: false
  gem "rubocop-rails", require: false
  gem "rubocop-rspec", require: false
  gem "sorbet"
  gem "rspec-rails"
  gem "factory_bot_rails"
end

group :development do
  gem "web-console"
end
