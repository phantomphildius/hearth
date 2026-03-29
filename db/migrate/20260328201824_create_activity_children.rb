class CreateActivityChildren < ActiveRecord::Migration[8.1]
  def change
    create_table(:activity_children) do |t|
      t.references(:activity, null: false, foreign_key: true)
      t.references(:child, null: false, foreign_key: true)
      t.timestamps
    end

    add_index(:activity_children, [:activity_id, :child_id], unique: true)
  end
end
