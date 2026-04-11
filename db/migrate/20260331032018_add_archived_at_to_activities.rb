class AddArchivedAtToActivities < ActiveRecord::Migration[8.1]
  def change
    add_column :activities, :archived_at, :datetime
  end
end
