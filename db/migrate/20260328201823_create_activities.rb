class CreateActivities < ActiveRecord::Migration[8.1]
  def change
    create_table(:activities) do |t|
      t.references(:household, null: false, foreign_key: true)
      t.string(:name, null: false)
      t.string(:location_name)
      t.string(:address)
      t.decimal(:latitude, precision: 10, scale: 7)
      t.decimal(:longitude, precision: 10, scale: 7)
      t.integer(:day_of_week)
      t.time(:start_time, null: false)
      t.time(:end_time, null: false)
      t.integer(:duration_minutes, null: false)
      t.string(:recurrence, null: false, default: "weekly")
      t.date(:starts_on)
      t.text(:notes)
      t.timestamps
    end

    add_index(:activities, :day_of_week)
    add_index(:activities, [:household_id, :day_of_week])
  end
end
