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

require 'test_helper'

class SubjectTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
