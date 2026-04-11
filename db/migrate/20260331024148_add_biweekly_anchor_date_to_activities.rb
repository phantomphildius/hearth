class AddBiweeklyAnchorDateToActivities < ActiveRecord::Migration[8.1]
  def change
    add_column :activities, :biweekly_anchor_date, :date

    reversible do |dir|
      dir.up do
        Activity.where(recurrence: "biweekly").find_each do |a|
          a.update_column(:biweekly_anchor_date, a.created_at.to_date)
        end
      end
    end
  end
end
