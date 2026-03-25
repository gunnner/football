class Users::SessionsController < Devise::SessionsController
  def create
    super do |user|
      flash['notice'] = "Welcome, #{user.first_name.presence&.strip || 'back'} !" if user.persisted?
    end
  end
end
