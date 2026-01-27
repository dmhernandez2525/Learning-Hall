class CreateTasks < ActiveRecord::Migration[5.2]
  def change
    create_table :tasks do |t|
      t.string :name, null: false
      t.boolean :completed, null: false
      t.integer :duration, null: false
      t.text :body, null: false
      t.integer :author_id, null: false
      t.integer :module_id, null: false

      t.timestamps
    end
    add_index :tasks, :name, unique: true
  end
end
