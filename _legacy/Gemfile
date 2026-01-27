source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '>= 3.3.0', '< 4.0'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 7.2.0'

# The modern asset pipeline for Rails
gem 'propshaft'

# Use postgresql as the database for Active Record
gem 'pg', '~> 1.5'

# Use Puma as the app server
gem 'puma', '~> 6.4'

# Build JSON APIs with ease
gem 'jbuilder', '~> 2.11'

# Use Redis adapter to run Action Cable in production
# gem 'redis', '~> 5.0'

# Use ActiveModel has_secure_password
gem 'bcrypt', '~> 3.1'

# AWS S3 for file storage
gem 'aws-sdk-s3', require: false

# Windows does not include zoneinfo files
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]

# Reduces boot times through caching
gem 'bootsnap', require: false

group :development, :test do
  # Debugging
  gem 'debug', platforms: [:mri, :mingw, :x64_mingw]
end

group :development do
  # Access an interactive console on exception pages
  gem 'web-console'

  # Better error pages
  gem 'better_errors'
  gem 'binding_of_caller'

  # Generate fake data
  gem 'faker'

  # Annotate models with schema info
  gem 'annotate'
end

group :test do
  # System testing
  gem 'capybara'
  gem 'selenium-webdriver'
end
