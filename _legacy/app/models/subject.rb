# == Schema Information
#
# Table name: subjects
#
#  id         :bigint           not null, primary key
#  name       :string
#  authorId   :integer          not null
#  courseId   :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Subject < ApplicationRecord
    validates :name, :courseId, :authorId, presence: true
    validates :name, uniqueness: true
    
    # has_many :tasks

    belongs_to :author,
        class_name: :User,
        foreign_key: :authorId

    belongs_to :course,
        class_name: :Course,
        foreign_key: :courseId
end
