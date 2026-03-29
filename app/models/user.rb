# typed: strict

class User < ApplicationRecord
  extend T::Sig

  devise :omniauthable, omniauth_providers: [:google_oauth2]

  has_many :household_members, dependent: :destroy
  has_many :households, through: :household_members

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true

  sig { params(auth: OmniAuth::AuthHash).returns(User) }
  def self.from_omniauth(auth)
    find_or_create_by(provider: auth.provider, uid: auth.uid) do |user|
      user.email = auth.info.email
      user.name = auth.info.name
      user.avatar_url = auth.info.image
    end
  end
end
