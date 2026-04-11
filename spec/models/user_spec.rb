require "rails_helper"

RSpec.describe(User, type: :model) do
  describe "validations" do
    subject { build(:user) }

    it { is_expected.to(be_valid) }

    it "requires email" do
      subject.email = nil
      expect(subject).not_to(be_valid)
    end

    it "requires unique email" do
      create(:user, email: "taken@example.com")
      subject.email = "taken@example.com"
      expect(subject).not_to(be_valid)
    end

    it "allows nil name (stub users invited before OAuth sign-in have no name)" do
      subject.name = nil
      expect(subject).to(be_valid)
    end
  end

  describe "associations" do
    it "has many households through household_members" do
      user = create(:user)
      household = create(:household)
      create(:household_member, user: user, household: household)

      expect(user.households).to(include(household))
    end

    it "destroys household_members when destroyed" do
      user = create(:user)
      household = create(:household)
      create(:household_member, user: user, household: household)

      expect { user.destroy }.to(change(HouseholdMember, :count).by(-1))
    end
  end

  describe ".from_omniauth" do
    let(:auth) do
      OmniAuth::AuthHash.new(
        provider: "google_oauth2",
        uid: "12345",
        info: {
          email: "test@example.com",
          name: "Test User",
          image: "https://example.com/avatar.jpg",
        },
      )
    end

    it "creates a new user from OAuth data" do
      expect { described_class.from_omniauth(auth) }.to(change(described_class, :count).by(1))
    end

    it "finds an existing user by provider and uid" do
      create(:user, provider: "google_oauth2", uid: "12345", email: "test@example.com")

      expect { described_class.from_omniauth(auth) }.not_to(change(described_class, :count))
    end

    it "sets user attributes from OAuth data" do
      user = described_class.from_omniauth(auth)

      expect(user.email).to(eq("test@example.com"))
      expect(user.name).to(eq("Test User"))
      expect(user.avatar_url).to(eq("https://example.com/avatar.jpg"))
    end
  end
end
