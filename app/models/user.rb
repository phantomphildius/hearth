# typed: strict

class User < ApplicationRecord
  extend T::Sig

  devise :omniauthable, omniauth_providers: [:google_oauth2]

  has_many :household_members, dependent: :destroy
  has_many :households, through: :household_members

  validates :email, presence: true, uniqueness: true
  validates :name, length: { maximum: 255 }, allow_nil: true

  sig { params(auth: OmniAuth::AuthHash).returns(User) }
  def self.from_omniauth(auth)
    # Find returning user by provider + uid first
    user = find_by(provider: auth.provider, uid: auth.uid)
    return user if user

    # Find stub user created via invitation and link their OAuth credentials
    user = find_by(email: auth.info.email)
    if user
      user.update!(provider: auth.provider, uid: auth.uid, name: auth.info.name, avatar_url: auth.info.image)
      return user
    end

    # New user — create from OAuth
    create!(
      provider: auth.provider,
      uid: auth.uid,
      email: auth.info.email,
      name: auth.info.name,
      avatar_url: auth.info.image,
    )
  end
end
