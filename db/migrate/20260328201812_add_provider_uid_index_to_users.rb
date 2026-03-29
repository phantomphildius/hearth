class AddProviderUidIndexToUsers < ActiveRecord::Migration[8.1]
  def change
    add_index(:users, [:provider, :uid], unique: true, where: "provider IS NOT NULL")
  end
end
