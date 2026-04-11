class AddStatusToActivitySessions < ActiveRecord::Migration[8.1]
  def change
    add_column :activity_sessions, :status, :string, null: false, default: "confirmed"
  end
end
