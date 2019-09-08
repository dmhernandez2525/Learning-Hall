class FixColumnName < ActiveRecord::Migration[5.2]
  def change
        rename_column :tasks, :module_id, :subject_id
  end
end
