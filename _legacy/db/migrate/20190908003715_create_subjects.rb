class CreateSubjects < ActiveRecord::Migration[5.2]
  def change
    create_table :subjects do |t|
      t.string :name
      t.integer :authorId, null: false
      t.integer :courseId, null: false

      t.timestamps
    end
    add_index :subjects, :name, unique: true
  end
end
