# == Schema Information
#
# Table name: tasks
#
#  id         :bigint           not null, primary key
#  name       :string           not null
#  completed  :boolean          not null
#  duration   :integer          not null
#  body       :text             not null
#  author_id  :integer          not null
#  module_id  :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Task < ApplicationRecord
    validates :name, :module_id, :authorId, :completed,:duration,:body, presence: true
    validates :name, uniqueness: true
    
    belongs_to :author,
        class_name: :User,
        foreign_key: :author_id

    belongs_to :module,
        class_name: :Module,
        foreign_key: :module_id
end
