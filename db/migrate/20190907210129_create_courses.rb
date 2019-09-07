class CreateCourses < ActiveRecord::Migration[5.2]
  def change
    create_table :courses do |t|
      t.string :name, null: false
      t.integer :author_id, null: false

      t.timestamps
    end
    add_index :courses, :name, unique: true
    end
  end
end
