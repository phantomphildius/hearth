class AddUniqueIndexToHouseholdMembers < ActiveRecord::Migration[8.1]
  def change
    add_index(:household_members, [:user_id, :household_id], unique: true)
  end
end
