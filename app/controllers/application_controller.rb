class ApplicationController < ActionController::Base
  include Pagy::Method

  # before_action :set_sentry_context
  before_action :authenticate_user!

  protect_from_forgery with: :exception
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  respond_to :html, :json

  private

  def set_sentry_context
    return unless current_user

    Sentry.set_user(
      id:    current_user.id,
      email: current_user.email
    )
  end
end
