module ApiHelpers
  def auth_headers(user = nil)
    user ||= create(:user)
    token  = JwtService.encode(user_id: user.id)

    { 'Authorization' => "Bearer #{token}" }
  end
end

RSpec.configure do |config|
  config.include ApiHelpers, type: :request
end
