class Users::RegistrationsController < Devise::RegistrationsController
  def create
    super do |user|
      flash['notice'] = "Welcome #{user.first_name.presence&.strip} !" if user.persisted?
    end
  end
end
