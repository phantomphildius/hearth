class CreateActivitySessions < ActiveRecord::Migration[8.1]
  def change
    create_table :activity_sessions do |t|
      t.references :activity, null: false, foreign_key: true, index: true
      t.date :scheduled_date, null: false
      t.time :start_time
      t.time :end_time
      t.text :notes
      t.timestamps
    end

    add_index :activity_sessions, [:activity_id, :scheduled_date], unique: true
  end
end
