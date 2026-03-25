class User < ApplicationRecord
  devise :database_authenticatable,
         :registerable,
         :recoverable,
         :rememberable,
         :validatable,
         :trackable

  enum :role, { regular: 0, admin: 1 }, default: :regular

  has_many :favorites,       dependent: :destroy
  has_one  :user_preference, dependent: :destroy

  validates :email, presence: true, uniqueness: true

  def admin?
    role.eql? 'admin'
  end

  def full_name
    [ first_name&.strip, last_name&.strip ].compact.join(' ')
  end

  def preference
    user_preference || build_user_preference
  end

  def favorite?(resource)
    favorites.exists?(favoritable: resource)
  end

  def favorite_leagues
    favorites.where(favoritable_type: 'League')
             .includes(:favoritable)
             .map(&:favoritable)
  end

  def favorite_teams
    favorites.where(favoritable_type: 'Team')
             .includes(:favoritable)
             .map(&:favoritable)
  end

  def favorite_players
    favorites.where(favoritable_type: 'Player')
             .includes(:favoritable)
             .map(&:favoritable)
  end
end
