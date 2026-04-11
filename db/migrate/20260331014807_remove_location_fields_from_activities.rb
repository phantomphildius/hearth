class RemoveLocationFieldsFromActivities < ActiveRecord::Migration[8.1]
  def change
    remove_column :activities, :location_name, :string
    remove_column :activities, :address, :string
    remove_column :activities, :latitude, :decimal
    remove_column :activities, :longitude, :decimal
  end
end
