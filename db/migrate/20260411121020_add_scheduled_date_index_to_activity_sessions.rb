class AddScheduledDateIndexToActivitySessions < ActiveRecord::Migration[8.1]
  def change
    add_index :activity_sessions, [:scheduled_date, :activity_id]
  end
end
