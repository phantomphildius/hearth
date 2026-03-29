class RemoveRoleFromHouseholdMembers < ActiveRecord::Migration[8.1]
  def change
    remove_column(:household_members, :role, :string)
  end
end
