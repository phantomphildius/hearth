class CreateChildren < ActiveRecord::Migration[8.1]
  def change
    create_table(:children) do |t|
      t.references(:household, null: false, foreign_key: true)
      t.string(:first_name)
      t.date(:date_of_birth)

      t.timestamps
    end
  end
end
