# == Schema Information
#
# Table name: courses
#
#  id         :bigint           not null, primary key
#  name       :string           not null
#  author_id  :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Course < ApplicationRecord
    validates :name ,:author_id, presence: true
    validates :name, uniqueness: true
    belongs_to :author,
    class_name: :User,
    foreign_key: :author_id
end
