require 'capybara/rspec'
require 'capybara/webkit'
require 'mysql2'
require 'site_prism'
require './config.rb'

if File.exists?('./config.local.rb') then
	require './config.local.rb'
end

$db = Mysql2::Client.new(
	:host     => $test_config[:db_host],
	:database => $test_config[:db_name],
	:username => $test_config[:db_username],
	:password => $test_config[:db_password],
	:flags    => Mysql2::Client::MULTI_STATEMENTS
)

# Include our helpers
Dir.glob(File.dirname(__FILE__) + '/helpers/*', &method(:require))

# These two pages must be included in this order (not all filesystems
# run Dir.glob() alphabetically)
require './pages/_section_menu.rb'
require './pages/cp_page.rb'

# Include the rest of our pages
Dir.glob(File.dirname(__FILE__) + '/pages/*', &method(:require))

Capybara.default_driver = :webkit
Capybara.javascript_driver = :webkit
Capybara.app_host = $test_config[:app_host]
Capybara.run_server = false

# Configure hook to run after each example
RSpec.configure do |config|

	# Before each example...
	config.before(:each) do
		reset_db
	end

	# After each example...
	config.after(:each) do
		# If the example failed, take a screenshot to help us spot the problem
		if example.exception != nil
			page.save_screenshot('screenshots/'+example.description+'.png');
		end

		# Check for PHP or Javascript errors on the page
		begin
			no_php_js_errors
		rescue => error
			# Raise another exception so that RSpec sees the example as a failure
			page.save_screenshot('screenshots/'+example.description+'.png');
			puts 'Screenshot taken: ' + example.description+'.png'
			raise StandardError, error.message
		end
	end
end