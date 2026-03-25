class UserSerializer
  include JSONAPI::Serializer

  attributes :email, :first_name, :last_name, :role

  attribute :full_name do |user|
    user.full_name
  end
end
